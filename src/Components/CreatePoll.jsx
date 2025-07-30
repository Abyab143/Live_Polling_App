import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import socketService from "../services/socketService";
import Chat from "./Chat";
import useChatOverlay from "../hooks/useChatOverlay";

const CreatePoll = () => {
  const { setCurrentPoll, setSessionId, navigateToAddPoll, setError } =
    useApp();
  const { isChatOpen, openChat, closeChat } = useChatOverlay();
  const [question, setQuestion] = useState("");
  const [timeLimit, setTimeLimit] = useState("60 seconds");
  const [options, setOptions] = useState([
    { id: 1, text: "", isCorrect: false },
    { id: 2, text: "", isCorrect: false },
  ]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState("");

  const timeOptions = ["30 seconds", "60 seconds", "90 seconds", "120 seconds"];

  useEffect(() => {
    // Connect to socket when component mounts
    socketService.connect();

    // Auto-join chat as teacher
    const timeout = setTimeout(() => {
      console.log("Auto-joining chat as teacher...");
      socketService.socket?.emit("join-chat", {
        sessionId: "global-chat-room",
        user: "Teacher",
      });
    }, 1000); // Small delay to ensure socket is connected

    return () => clearTimeout(timeout);
  }, []);

  const addOption = () => {
    const newOption = {
      id: options.length + 1,
      text: "",
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  const updateOption = (id, text) => {
    setOptions(
      options.map((option) => (option.id === id ? { ...option, text } : option))
    );
  };

  const setCorrectAnswer = (id) => {
    setOptions(
      options.map((option) => ({
        ...option,
        isCorrect: option.id === id,
      }))
    );
  };

  const handleChatClick = () => {
    openChat();
  };

  const handleAskQuestion = async () => {
    // Validate inputs
    if (!question.trim()) {
      setLocalError("Please enter a question");
      return;
    }

    const validOptions = options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      setLocalError("Please provide at least 2 options");
      return;
    }

    setIsLoading(true);
    setLocalError("");

    try {
      // Convert time limit to seconds
      const durationInSeconds = parseInt(timeLimit.split(" ")[0]);

      // Prepare poll data for backend
      const pollData = {
        question: question.trim(),
        options: validOptions.map((opt) => opt.text.trim()),
        duration: durationInSeconds,
      };

      console.log("Starting poll:", pollData);

      // Send to backend via socket
      const response = await socketService.startPoll(pollData);

      console.log("Poll started successfully:", response);

      // Create poll object for frontend state
      const poll = {
        id: Date.now(),
        question: question.trim(),
        timeLimit,
        options: validOptions.map((opt) => ({
          ...opt,
          votes: 0,
        })),
        createdAt: new Date().toISOString(),
        isActive: true,
        duration: durationInSeconds,
      };

      // Generate session ID
      const sessionId = Math.random().toString(36).substring(7).toUpperCase();

      // Save to context
      setCurrentPoll(poll);
      setSessionId(sessionId);

      // Navigate to teacher dashboard (AddPoll component)
      navigateToAddPoll();
    } catch (error) {
      console.error("Error starting poll:", error);
      setLocalError(error.message || "Failed to start poll. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Logo Badge */}
          <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"
                clipRule="evenodd"
              />
            </svg>
            Intervue Poll
          </div>

          {/* Title and Description */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Let's Get Started
          </h1>
          <p className="text-gray-600 text-lg">
            you'll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </p>
        </div>

        {/* Question Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Enter your question
            </h2>

            {/* Time Limit Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700">{timeLimit}</span>
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {timeOptions.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setTimeLimit(time);
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Question Text Area */}
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full h-32 p-4 border border-gray-200 rounded-xl bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              placeholder="Rahul Bajaj"
              disabled={isLoading}
            />
            <div className="absolute bottom-4 right-4 text-sm text-gray-500">
              0/100
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {/* Options and Correct Answer Section */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Edit Options
          </h3>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="font-semibold text-gray-900">Options</div>
            <div className="font-semibold text-gray-900">Is it Correct?</div>
          </div>

          {options.map((option) => (
            <div
              key={option.id}
              className="grid lg:grid-cols-2 gap-8 items-center"
            >
              {/* Option Input */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {option.id}
                </div>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOption(option.id, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Rahul Bajaj"
                  disabled={isLoading}
                />
              </div>

              {/* Is it Correct Radio Buttons */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div
                    onClick={() => setCorrectAnswer(option.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      option.isCorrect
                        ? "border-purple-600 bg-purple-600"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {option.isCorrect && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700 text-sm">Yes</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    onClick={() => setCorrectAnswer(null)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${
                      !option.isCorrect
                        ? "border-purple-600 bg-purple-600"
                        : "border-gray-400 bg-white"
                    }`}
                  >
                    {!option.isCorrect && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="text-gray-700 text-sm">No</span>
                </div>
              </div>
            </div>
          ))}

          {/* Add More Option Button */}
          <div className="grid lg:grid-cols-2 gap-8">
            <button
              onClick={addOption}
              className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:text-purple-700 transition-colors border border-purple-600 rounded-xl"
              disabled={isLoading}
            >
              <span className="text-lg">+</span>
              <span>Add More option</span>
            </button>
            <div></div>
          </div>
        </div>

        {/* Ask Question Button */}
        <div className="flex justify-end mt-12">
          <button
            onClick={handleAskQuestion}
            disabled={
              isLoading ||
              !question.trim() ||
              options.filter((opt) => opt.text.trim()).length < 2
            }
            className={`px-8 py-4 font-semibold rounded-full transition-all duration-200 shadow-lg ${
              isLoading ||
              !question.trim() ||
              options.filter((opt) => opt.text.trim()).length < 2
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
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
                Starting Poll...
              </div>
            ) : (
              "Ask Question"
            )}
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

export default CreatePoll;
