import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Chat from "./Chat";
import useChatOverlay from "../hooks/useChatOverlay";
import socketService from "../services/socketService";

const Addpoll = () => {
  const {
    currentPoll,
    currentResults,
    addToPollHistory,
    navigateToViewPoll,
    navigateToCreatePoll,
    setCurrentResults,
  } = useApp();

  const { isChatOpen, openChat, closeChat } = useChatOverlay();

  const [liveResults, setLiveResults] = useState(null);
  const [studentCount, setStudentCount] = useState(0);
  const [studentsList, setStudentsList] = useState([]);
  const [isPollingActive, setIsPollingActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    // Set up socket listeners for teacher dashboard

    // Auto-join chat as teacher
    const timeout = setTimeout(() => {
      console.log("Auto-joining chat as teacher from Addpoll...");
      socketService.socket?.emit("join-chat", {
        sessionId: "global-chat-room",
        user: "Teacher",
      });
    }, 1000); // Small delay to ensure socket is connected

    // Listen for live results updates
    socketService.onLiveResults((data) => {
      console.log("Live results received in teacher dashboard:", data);
      setLiveResults(data);
      setCurrentResults(data.results);
    });

    // Listen for poll ended
    socketService.onPollEnded((data) => {
      console.log("Poll ended in teacher dashboard:", data);
      setLiveResults(data);
      setIsPollingActive(false);
      addToPollHistory({
        ...currentPoll,
        results: data.results,
        completedAt: new Date().toISOString(),
      });
    });

    // Listen for student count updates
    socketService.onStudentCountUpdate((count) => {
      console.log("Student count updated:", count);
      setStudentCount(count);
    });

    // Listen for students list
    socketService.onStudentsList((students) => {
      console.log("Students list received:", students);
      setStudentsList(students);
    });

    // Get initial data
    socketService.getCurrentResults();
    socketService.getStudentsList();
    socketService.getServerStatus();

    // Listen for server status
    socketService.onServerStatus((status) => {
      console.log("Server status:", status);
      setStudentCount(status.connectedStudents);
      if (status.activePoll) {
        setIsPollingActive(true);
        setTimeRemaining(Math.floor(status.activePoll.timeRemaining / 1000));
      }
    });

    // Clean up listeners when component unmounts
    return () => {
      clearTimeout(timeout);
      socketService.off("live_results");
      socketService.off("poll_ended");
      socketService.off("student_count_update");
      socketService.off("students_list");
      socketService.off("server_status");
    };
  }, [currentPoll, addToPollHistory, setCurrentResults]);

  // Timer countdown effect for remaining time
  useEffect(() => {
    if (timeRemaining > 0 && isPollingActive) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining, isPollingActive]);

  // Prepare display data
  const getDisplayData = () => {
    if (liveResults && liveResults.results) {
      const totalVotes = Object.values(liveResults.results).reduce(
        (sum, votes) => sum + votes,
        0
      );
      return {
        question: currentPoll?.question || "Current Poll Question",
        results: Object.entries(liveResults.results).map(
          ([option, votes], index) => ({
            id: index + 1,
            option: option,
            votes: votes,
            percentage:
              totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
          })
        ),
      };
    }

    return {
      question: currentPoll?.question || "No active poll",
      results:
        currentPoll?.options?.map((option, index) => ({
          id: index + 1,
          option: typeof option === "string" ? option : option.text,
          votes: 0,
          percentage: 0,
        })) || [],
    };
  };

  const displayData = getDisplayData();

  const handleViewPollHistory = () => {
    socketService.getPastPolls();
    navigateToViewPoll();
  };

  const handleAskNewQuestion = async () => {
    // Check if there's an active poll
    if (isPollingActive && liveResults) {
      const unansweredStudents =
        liveResults.totalStudents - liveResults.answeredStudents;
      if (unansweredStudents > 0) {
        setError(
          `Cannot start new poll. ${unansweredStudents} student(s) haven't answered yet.`
        );
        return;
      }
    }

    navigateToCreatePoll();
  };

  const handleEndPoll = async () => {
    try {
      await socketService.endPoll();
      setIsPollingActive(false);
      setError("");
    } catch (error) {
      console.error("Error ending poll:", error);
      setError(error.message || "Failed to end poll");
    }
  };

  const handleKickStudent = async (studentName) => {
    try {
      await socketService.kickStudent(studentName);
      setError("");
      // Refresh students list
      socketService.getStudentsList();
    } catch (error) {
      console.error("Error kicking student:", error);
      setError(error.message || "Failed to kick student");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleChatClick = () => {
    openChat();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          {/* Status Info */}
          <div className="flex items-center space-x-6">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">Connected Students:</span>
              <span className="ml-2 font-semibold text-purple-600">
                {studentCount}
              </span>
            </div>
            {isPollingActive && (
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                <span className="text-sm text-gray-600">Time Remaining:</span>
                <span className="ml-2 font-semibold text-red-500">
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
            {liveResults && (
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                <span className="text-sm text-gray-600">Answered:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {liveResults.answeredStudents || 0}/
                  {liveResults.totalStudents || 0}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {isPollingActive && (
              <button
                onClick={handleEndPoll}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                End Poll
              </button>
            )}
            <button
              onClick={handleViewPollHistory}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span className="font-medium">View Poll history</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Question Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isPollingActive ? "Active Poll" : "Poll Results"}
            </h2>
            {isPollingActive && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Live</span>
              </div>
            )}
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Question Header */}
            <div className="bg-gray-700 text-white p-6">
              <h3 className="text-xl font-medium">{displayData.question}</h3>
            </div>

            {/* Results */}
            <div className="p-6 space-y-4">
              {displayData.results.map((result) => (
                <div key={result.id} className="flex items-center">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    {result.id}
                  </div>
                  <div className="flex-1 flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-lg h-12 relative overflow-hidden mr-4">
                      <div
                        className="bg-purple-600 h-full rounded-lg transition-all duration-1000 ease-out flex items-center px-4"
                        style={{ width: `${result.percentage}%` }}
                      >
                        <span className="text-white font-medium">
                          {result.option}
                        </span>
                      </div>
                    </div>
                    <div className="text-right min-w-[4rem]">
                      <span className="text-gray-900 font-semibold">
                        {result.percentage}%
                      </span>
                      <div className="text-sm text-gray-500">
                        ({result.votes} votes)
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Students List */}
        {studentsList.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Connected Students
            </h3>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studentsList.map((student, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        {student.name}
                      </span>
                      <div className="text-sm text-gray-500">
                        {student.answered ? (
                          <span className="text-green-600">✓ Answered</span>
                        ) : (
                          <span className="text-orange-600">⏳ Waiting</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleKickStudent(student.name)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Kick student"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ask New Question Button */}
        <div className="text-center">
          <button
            onClick={handleAskNewQuestion}
            disabled={error && error.includes("Cannot start new poll")}
            className={`px-8 py-4 rounded-full text-lg font-semibold transition-all duration-200 shadow-lg ${
              error && error.includes("Cannot start new poll")
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            + Ask a new question
          </button>
        </div>
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

export default Addpoll;
