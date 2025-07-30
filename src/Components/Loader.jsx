import React, { useEffect } from "react";
import { useApp } from "../context/AppContext";
import Chat from "./Chat";
import useChatOverlay from "../hooks/useChatOverlay";
import socketService from "../services/socketService";

const Loader = () => {
  const { navigateToQuestion, setCurrentPoll, userName, navigateToEnterName } =
    useApp();
  const { isChatOpen, openChat, closeChat } = useChatOverlay();

  useEffect(() => {
    // Ensure student is properly connected when reaching loader
    if (!userName || !userName.trim()) {
      console.log("No username found in loader, redirecting to name entry");
      navigateToEnterName();
      return;
    }

    // Ensure socket connection and re-register student
    const initializeStudent = async () => {
      try {
        // Connect to socket if not connected
        if (!socketService.isConnected) {
          console.log("Socket not connected, connecting...");
          socketService.connect();

          // Wait a bit for connection to establish
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Re-register student with backend (important for page refresh)
        console.log("Re-registering student with backend:", userName);
        const result = await socketService.joinAsStudent(userName);
        console.log("Student successfully re-registered:", result);

        // Show success message if name was modified
        if (result.message) {
          console.log("Server message:", result.message);
        }

        // Auto-join chat room after successful registration
        console.log("Auto-joining chat room for student:", userName);
        socketService.socket?.emit("join-chat", {
          sessionId: "global-chat-room",
          user: userName,
        });
        console.log("Student automatically joined chat room");
      } catch (error) {
        console.error("Failed to re-register student:", error);
        console.log("Redirecting to name entry due to registration failure");
        // If re-registration fails, redirect to name entry
        navigateToEnterName();
        return;
      }
    };

    // Initialize student registration
    initializeStudent();

    // Listen for new questions from teacher
    socketService.onNewQuestion((pollData) => {
      console.log("New question received:", pollData);
      setCurrentPoll(pollData);
      navigateToQuestion();
    });

    // Listen for poll ended events
    socketService.onPollEnded((data) => {
      console.log("Poll ended:", data);
      // Could show results or return to waiting state
    });

    // Clean up listeners when component unmounts
    return () => {
      socketService.off("new_question");
      socketService.off("poll_ended");
    };
  }, [navigateToQuestion, setCurrentPoll, userName, navigateToEnterName]);

  const handleChatClick = () => {
    openChat();
  };

  const handleChangeName = () => {
    // Clear session storage and go back to name entry
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userId");
    navigateToEnterName();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 relative">
      <div className="text-center">
        {/* Header with Logo */}
        <div className="mb-16">
          {/* Logo Badge */}
          <div className="inline-flex items-center bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-12">
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
          <div className="mb-8">
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
          </div>

          {/* Main Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Wait for the teacher to ask questions..
          </h1>
          {userName && (
            <div className="space-y-4">
              <p className="text-lg text-gray-600">
                Welcome,{" "}
                <span className="font-semibold text-purple-600">
                  {userName}
                </span>
                !
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat/Message Icon in Bottom Right */}
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

export default Loader;
