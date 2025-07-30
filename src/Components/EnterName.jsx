import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import socketService from "../services/socketService";
import Chat from "./Chat";
import useChatOverlay from "../hooks/useChatOverlay";

const EnterName = () => {
  const {
    setUserName,
    setUserId,
    navigateToLoader,
    setError,
    userName,
    userRole,
  } = useApp();
  const { isChatOpen, openChat, closeChat } = useChatOverlay();
  const [studentName, setStudentName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState("");

  useEffect(() => {
    // Connect to socket when component mounts
    socketService.connect();

    // Check if user has already entered name in this tab session
    // If user role is student and userName exists, skip name entry
    if (userRole === "student" && userName) {
      console.log("Student already has name in this tab session:", userName);
      // Automatically reconnect and navigate to loader
      handleAutoReconnect();
      return;
    }

    // Listen for kicked event
    socketService.onKicked((data) => {
      setError(data.message);
      // Clear session storage and redirect to home
      sessionStorage.clear();
      window.location.reload();
    });

    return () => {
      // Clean up listeners when component unmounts
      socketService.off("kicked");
    };
  }, [userRole, userName]);

  const handleAutoReconnect = async () => {
    setIsLoading(true);
    try {
      // Ensure socket is connected
      if (!socketService.isConnected) {
        await socketService.connect();
      }

      // Reconnect with the existing name
      const response = await socketService.joinAsStudent(userName);
      console.log("Auto-reconnected as:", response.name);

      // Update the name if server modified it for uniqueness
      if (response.name && response.name !== userName) {
        setUserName(response.name);
      }

      // Auto-join chat room after successful auto-reconnection
      const finalUserName = response.name || userName;
      console.log(
        "Auto-joining chat room for reconnected student:",
        finalUserName
      );
      socketService.socket?.emit("join-chat", {
        sessionId: "global-chat-room",
        user: finalUserName,
      });
      console.log(
        "Student automatically joined chat room from EnterName component"
      );

      // Navigate to loader to wait for questions
      navigateToLoader();
    } catch (error) {
      console.error("Auto-reconnection failed:", error);
      // If auto-reconnection fails, clear the session and allow manual name entry
      sessionStorage.removeItem("userName");
      sessionStorage.removeItem("userId");
      setLocalError("Connection failed. Please enter your name again.");
      setIsLoading(false);
    }
  };

  const handleChatClick = () => {
    openChat();
  };

  const handleContinue = async () => {
    if (studentName.trim()) {
      setIsLoading(true);
      setLocalError("");

      try {
        // Join as student through socket
        const response = await socketService.joinAsStudent(studentName.trim());

        // Store student name in context and sessionStorage
        // Use the unique name returned from server
        const finalName = response.name || studentName.trim();
        setUserName(finalName);
        setUserId(response.name || studentName.trim());

        // Show message if name was modified for uniqueness
        if (response.message) {
          console.log("Server message:", response.message);
        }

        // Auto-join chat room after successful student registration
        console.log("Auto-joining chat room for new student:", finalName);
        socketService.socket?.emit("join-chat", {
          sessionId: "global-chat-room",
          user: finalName,
        });
        console.log("New student automatically joined chat room");

        // Navigate to loader
        navigateToLoader();
      } catch (error) {
        console.error("Error joining as student:", error);
        setLocalError(error.message || "Failed to join. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* Show auto-reconnecting message if user already has a name */}
        {userRole === "student" && userName && isLoading ? (
          <div className="space-y-6">
            {/* Logo Badge */}
            <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
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

            {/* Loading Spinner */}
            <div className="w-16 h-16 mx-auto">
              <svg
                className="w-16 h-16 text-purple-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Reconnecting...
              </h2>
              <p className="text-gray-600">
                Welcome back,{" "}
                <span className="font-semibold text-purple-600">
                  {userName}
                </span>
                !
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Rejoining the session...
              </p>
            </div>
          </div>
        ) : (
          /* Normal name entry form */
          <>
            {/* Header with Logo */}
            <div className="mb-12">
              {/* Logo Badge */}
              <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
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

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Let's Get Started
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                If you're a student, you'll be able to{" "}
                <span className="font-semibold text-gray-900">
                  submit your answers
                </span>
                , participate in live polls, and see how your responses compare
                with your classmates
              </p>
            </div>

            {/* Name Input Section */}
            <div className="mb-10">
              {/* Label */}
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Enter your Name
              </label>

              {/* Input Field */}
              <div className="mb-4">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-6 py-4 text-lg bg-gray-100 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200 text-gray-900 placeholder-gray-500"
                  disabled={isLoading}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!studentName.trim() || isLoading}
                className={`px-12 py-4 rounded-full text-lg font-semibold transition-all duration-200 ${
                  studentName.trim() && !isLoading
                    ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Please wait...
                  </div>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnterName;
