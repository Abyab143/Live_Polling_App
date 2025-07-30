import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Chat from "./Chat";
import useChatOverlay from "../hooks/useChatOverlay";
import socketService from "../services/socketService";

const Question = () => {
  const {
    currentPoll,
    setCurrentResults,
    navigateToLoader,
    userName,
    navigateToEnterName,
  } = useApp();

  const { isChatOpen, openChat, closeChat } = useChatOverlay();

  const [selectedOption, setSelectedOption] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [liveResults, setLiveResults] = useState(null);
  const [error, setError] = useState("");

  // Initialize timer from current poll
  useEffect(() => {
    if (currentPoll && currentPoll.timeRemaining !== undefined) {
      setTimeLeft(Math.floor(currentPoll.timeRemaining / 1000));
    } else if (currentPoll && currentPoll.duration) {
      setTimeLeft(currentPoll.duration);
    }
  }, [currentPoll]);

  // Ensure student is registered when component mounts
  useEffect(() => {
    const ensureStudentRegistered = async () => {
      if (userName && userName.trim()) {
        try {
          // Ensure socket connection
          if (!socketService.isConnected) {
            socketService.connect();
          }

          // Re-register student to ensure they can submit answers
          console.log("Ensuring student is registered:", userName);
          await socketService.joinAsStudent(userName);
          console.log("Student registration confirmed");

          // Auto-join chat room after registration confirmation
          console.log("Auto-joining chat room for student:", userName);
          socketService.socket?.emit("join-chat", {
            sessionId: "global-chat-room",
            user: userName,
          });
          console.log(
            "Student automatically joined chat room from Question component"
          );
        } catch (error) {
          console.error("Failed to ensure student registration:", error);
          // Don't show error to user here, it will be handled in submit
        }
      }
    };

    ensureStudentRegistered();
  }, [userName]);

  // Set up socket listeners
  useEffect(() => {
    // Listen for live results updates - but only show if student has already submitted
    socketService.onLiveResults((data) => {
      console.log("Live results received:", data);
      setLiveResults(data);
      // Only show results if this student has already submitted their answer
      if (isSubmitted) {
        setShowResults(true);
      }
    });

    // Listen for poll ended
    socketService.onPollEnded((data) => {
      console.log("Poll ended:", data);
      setShowResults(true);
      setLiveResults(data);
      // After showing results, wait for next question
      setTimeout(() => {
        navigateToLoader();
      }, 5000);
    });

    // Listen for new questions (in case teacher starts another poll)
    socketService.onNewQuestion((pollData) => {
      console.log("New question received in Question component:", pollData);
      // Reset state for new question
      setSelectedOption(null);
      setShowResults(false);
      setIsSubmitted(false);
      setError("");
      setLiveResults(null);
      setTimeLeft(pollData.duration || 60);

      // Update current poll in context
      const formattedPoll = {
        question: pollData.question,
        options: pollData.options,
        duration: pollData.duration,
        startTime: pollData.startTime,
        timeRemaining: pollData.timeRemaining,
      };

      // This should trigger a re-render with the new question
      // Note: We should update the context here, but since we don't have direct access,
      // we'll rely on the parent component to handle this
    });

    return () => {
      socketService.off("live_results");
      socketService.off("poll_ended");
      socketService.off("new_question");
    };
  }, [isSubmitted, navigateToLoader]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft > 0 && !showResults && !isSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      // Time expired - only show results if student had submitted
      // If they didn't submit, they should still see the question but be unable to answer
      console.log("Time expired for student");
    }
  }, [timeLeft, showResults, isSubmitted]);

  const handleOptionSelect = (optionId) => {
    if (!isSubmitted && !showResults) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption && !isSubmitted) {
      setIsSubmitted(true);
      setError("");

      // Show results immediately after submission
      setShowResults(true);

      try {
        // Ensure student is registered before submitting
        if (!userName || !userName.trim()) {
          throw new Error("Please enter your name first");
        }

        const selectedOptionText = currentPoll.options[selectedOption - 1];
        const response = await socketService.submitAnswer(selectedOptionText);
        console.log("Answer submitted successfully:", response);

        // Update with real results when available
        if (response.results) {
          setLiveResults({
            results: response.results,
            totalStudents:
              response.totalStudents ||
              Object.values(response.results).reduce((a, b) => a + b, 0),
            answeredStudents:
              response.answeredStudents ||
              Object.values(response.results).reduce((a, b) => a + b, 0),
          });
        }

        // Also update context for other components
        if (response.results) {
          setCurrentResults(response.results);
        }
      } catch (error) {
        console.error("Error submitting answer:", error);

        // If error indicates student not registered, try to re-register
        if (
          error.message.includes("join as a student") ||
          error.message.includes("Please enter your name")
        ) {
          console.log("Student not registered, attempting re-registration...");
          try {
            if (userName && userName.trim()) {
              await socketService.joinAsStudent(userName);
              console.log(
                "Student re-registered successfully, retrying answer submission..."
              );

              // Retry submission after re-registration
              const selectedOptionText =
                currentPoll.options[selectedOption - 1];
              const retryResponse = await socketService.submitAnswer(
                selectedOptionText
              );
              console.log(
                "Answer submitted successfully after re-registration:",
                retryResponse
              );

              if (retryResponse.results) {
                setLiveResults({
                  results: retryResponse.results,
                  totalStudents:
                    retryResponse.totalStudents ||
                    Object.values(retryResponse.results).reduce(
                      (a, b) => a + b,
                      0
                    ),
                  answeredStudents:
                    retryResponse.answeredStudents ||
                    Object.values(retryResponse.results).reduce(
                      (a, b) => a + b,
                      0
                    ),
                });
                setCurrentResults(retryResponse.results);
              }
            } else {
              // No username available, redirect to name entry
              navigateToEnterName();
              return;
            }
          } catch (reRegisterError) {
            console.error("Failed to re-register student:", reRegisterError);
            setError(
              "Failed to submit answer. Please try refreshing the page."
            );
            setIsSubmitted(false);
            setShowResults(false);
          }
        } else {
          setError(error.message || "Failed to submit answer");
          setIsSubmitted(false);
          setShowResults(false);
        }
      }
    }
  };

  // Use current poll data or fallback to sample data
  const questionData = currentPoll || {
    question: "Waiting for question from teacher...",
    options: [],
  };

  // Prepare display data for results
  const getDisplayData = () => {
    // Only show live results if this student has submitted AND we have live results
    if (showResults && isSubmitted && liveResults && liveResults.results) {
      const totalVotes = Object.values(liveResults.results).reduce(
        (sum, votes) => sum + votes,
        0
      );
      const resultsArray = Object.entries(liveResults.results).map(
        ([option, votes], index) => ({
          id: index + 1,
          text: option,
          votes: votes,
          percentage:
            totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
        })
      );
      return { ...questionData, options: resultsArray };
    }

    // If student has submitted but no live results yet, show their selection with 100%
    if (
      showResults &&
      isSubmitted &&
      questionData.options &&
      questionData.options.length > 0
    ) {
      return {
        ...questionData,
        options: questionData.options.map((option, index) => ({
          id: index + 1,
          text: typeof option === "string" ? option : option.text || option,
          votes: selectedOption === index + 1 ? 1 : 0,
          percentage: selectedOption === index + 1 ? 100 : 0,
        })),
      };
    }

    // Default state - show selectable options (not submitted yet)
    return {
      ...questionData,
      options:
        questionData.options?.map((option, index) => ({
          id: index + 1,
          text: typeof option === "string" ? option : option.text || option,
          votes: 0,
          percentage: 0,
        })) || [],
    };
  };

  const displayData = getDisplayData();

  const handleChatClick = () => {
    openChat();
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 relative">
      <div className="max-w-2xl w-full">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Question</h1>
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-500 font-semibold">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Question Header */}
          <div className="bg-gray-700 text-white p-6">
            <h2 className="text-xl font-medium">{displayData.question}</h2>
          </div>

          {/* Options */}
          <div className="p-6 space-y-4">
            {displayData.options.map((option) => (
              <div key={option.id} className="relative">
                {!showResults ? (
                  // Question Mode - Selectable Options
                  <button
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={isSubmitted}
                    className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === option.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    } ${
                      isSubmitted
                        ? "cursor-not-allowed opacity-60"
                        : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-4 ${
                        selectedOption === option.id
                          ? "bg-purple-600"
                          : "bg-gray-400"
                      }`}
                    >
                      {option.id}
                    </div>
                    <span className="text-gray-900 font-medium">
                      {option.text}
                    </span>
                  </button>
                ) : (
                  // Results Mode - Progress Bars
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                      {option.id}
                    </div>
                    <div className="flex-1 flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-lg h-12 relative overflow-hidden mr-4">
                        <div
                          className="bg-purple-600 h-full rounded-lg transition-all duration-1000 ease-out flex items-center px-4"
                          style={{ width: `${option.percentage || 0}%` }}
                        >
                          <span className="text-white font-medium text-sm">
                            {option.text}
                          </span>
                        </div>
                      </div>
                      <div className="text-right min-w-[4rem]">
                        <span className="text-gray-900 font-semibold">
                          {option.percentage || 0}%
                        </span>
                        {option.votes !== undefined && (
                          <div className="text-xs text-gray-500">
                            ({option.votes} votes)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button or Waiting Message */}
        {!showResults && displayData.options.length > 0 ? (
          <div className="text-center">
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitted || timeLeft === 0}
              className={`px-12 py-4 rounded-full text-lg font-semibold transition-all duration-200 ${
                selectedOption && !isSubmitted && timeLeft > 0
                  ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {isSubmitted ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </div>
              ) : timeLeft === 0 ? (
                "Time's Up!"
              ) : (
                "Submit"
              )}
            </button>
            {timeLeft === 0 && !isSubmitted && (
              <p className="text-red-500 mt-2 text-sm">
                Time expired! You cannot submit an answer now.
              </p>
            )}
          </div>
        ) : showResults && isSubmitted ? (
          <div className="text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Answer Submitted!
              </h3>
              <p className="text-green-600">
                {liveResults
                  ? `${liveResults.answeredStudents || 1} of ${
                      liveResults.totalStudents || 1
                    } students have answered`
                  : "Waiting for other students to answer..."}
              </p>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Wait for the teacher to ask a new question..
            </h3>
          </div>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900">
              No active poll. Wait for the teacher to start a poll..
            </h3>
          </div>
        )}
      </div>

      {/* Chat Icon in Bottom Right */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={handleChatClick}
          className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.959 8.959 0 01-2.773-.457l-3.46 2.162c-.649.405-1.47-.187-1.389-.997L6.1 17.231A8.5 8.5 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z"
            />
          </svg>
        </button>
      </div>

      {/* Chat Overlay */}
      <Chat isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
};

export default Question;
