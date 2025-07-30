import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import socketService from "../services/socketService";

const Chat = ({ isOpen, onClose }) => {
  const { userName, userRole, sessionId, navigateToKickout } = useApp();

  // Set effective username - if teacher, always use "Teacher" regardless of actual username
  const effectiveUserName = userRole === "teacher" ? "Teacher" : userName;

  console.log("🔥 Chat Debug - userName:", userName);
  console.log("🔥 Chat Debug - userRole:", userRole);
  console.log("🔥 Chat Debug - effectiveUserName:", effectiveUserName);

  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isTeacher, setIsTeacher] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState("");
  const [hasJoined, setHasJoined] = useState(false); // Add flag to prevent multiple joins
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Only run if we have an effective username
    if (!effectiveUserName) return;

    console.log(
      "🔥 Chat component useEffect triggered with username:",
      effectiveUserName
    );
    console.log("🔥 HasJoined flag:", hasJoined);

    // Clear any existing data first if this is the first join
    if (!hasJoined) {
      setParticipants([]);
      setMessages([]);
    }

    // Check if user is teacher
    setIsTeacher(userRole === "teacher");

    // Use a consistent session ID for all chat participants
    // For now, always use "global-chat-room" to ensure everyone is in the same room
    const chatSessionId = "global-chat-room";
    setCurrentSessionId(chatSessionId);

    // Connect to socket and join chat room
    socketService.connect();

    console.log("Chat useEffect - Username:", effectiveUserName);
    console.log("Chat useEffect - UserRole:", userRole);
    console.log("Chat useEffect - ChatSessionId:", chatSessionId);
    console.log("Socket instance:", socketService.socket);

    // Only join if we haven't joined yet or if the chat is being opened
    if (!hasJoined || isOpen) {
      console.log(
        `🚀 ${
          userRole?.toUpperCase() || "USER"
        } joining chat room: ${chatSessionId} as ${effectiveUserName}`
      );

      // Join chat room using direct socket emit to match backend
      socketService.socket?.emit("join-chat", {
        sessionId: chatSessionId,
        user: effectiveUserName,
      });

      // Set joined flag
      setHasJoined(true);
    } else {
      console.log("🔥 Student already joined chat, skipping join request");
      // Just request chat history if already joined
      socketService.socket?.emit("join-chat", {
        sessionId: chatSessionId,
        user: effectiveUserName,
      });
    }

    // Listen for chat history - direct socket listeners
    socketService.socket?.on("chat-history", (history) => {
      console.log("Received chat history:", history);
      setMessages(history || []);
    });

    // Listen for new messages
    socketService.socket?.on("new-message", (messageData) => {
      console.log("New message received:", messageData);
      setMessages((prev) => {
        // Avoid duplicates
        const exists = prev.find((msg) => msg.id === messageData.id);
        if (exists) return prev;
        return [...prev, messageData];
      });
    });

    // Listen for participant updates
    socketService.socket?.on("participants-updated", (participantsList) => {
      console.log("🔥 Participants updated from backend:", participantsList);
      console.log("🔥 Type of participantsList:", typeof participantsList);
      console.log("🔥 Array length:", participantsList?.length);

      // Only set if we actually get data from backend
      if (participantsList && Array.isArray(participantsList)) {
        setParticipants(participantsList);
      } else {
        console.log("🔥 Invalid participants data, keeping empty");
        setParticipants([]);
      }
    });

    // Listen for user kicked out
    socketService.socket?.on("user-kicked", (data) => {
      console.log("User kicked event:", data);
      if (data.userName === effectiveUserName) {
        // User was kicked out - clean up and redirect
        alert(`You have been kicked out by ${data.kickedBy}`);

        // Clean up socket listeners
        socketService.socket?.off("chat-history");
        socketService.socket?.off("new-message");
        socketService.socket?.off("participants-updated");
        socketService.socket?.off("user-kicked");

        // Leave the chat room
        socketService.socket?.emit("leave-chat", {
          sessionId: currentSessionId,
          user: effectiveUserName,
        });

        // Disconnect socket
        socketService.disconnect();

        // Reset local state
        setMessages([]);
        setParticipants([]);
        setHasJoined(false);

        // Navigate to kickout page
        navigateToKickout();
      }
    });

    return () => {
      socketService.socket?.off("chat-history");
      socketService.socket?.off("new-message");
      socketService.socket?.off("participants-updated");
      socketService.socket?.off("user-kicked");

      // Clean up when component unmounts - leave chat room if still joined
      if (hasJoined && effectiveUserName && currentSessionId) {
        socketService.socket?.emit("leave-chat", {
          sessionId: currentSessionId,
          user: effectiveUserName,
        });
      }
    };
  }, [effectiveUserName, userRole, hasJoined, isOpen]); // Added isOpen to re-trigger when chat is opened

  // Reset hasJoined when effectiveUserName changes
  useEffect(() => {
    setHasJoined(false);
  }, [effectiveUserName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !effectiveUserName) return;

    const messageData = {
      id: Date.now() + Math.random(), // Ensure unique ID
      user: effectiveUserName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      sessionId: currentSessionId,
    };

    console.log("Sending message:", messageData);
    console.log("Socket connected:", !!socketService.socket?.connected);

    // Use direct socket emit to match backend expectations
    socketService.socket?.emit("send-message", messageData);
    setNewMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const kickOutUser = (participant) => {
    if (!isTeacher || participant.name === effectiveUserName) return;

    console.log("Kicking out user:", participant);
    // Use direct socket emit to match backend expectations
    socketService.socket?.emit("kick-user", {
      sessionId: currentSessionId,
      userId: participant.id,
      userName: participant.name,
      kickedBy: effectiveUserName,
    });

    // Remove from local participants list immediately
    setParticipants((prev) => prev.filter((p) => p.id !== participant.id));
  };

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "";
    }
  };

  // Remove the dummy user addition effect - this was causing fake participants
  // useEffect(() => {
  //   if (user?.name && participants.length > 0) {
  //     const userExists = participants.find((p) => p.name === user.name);
  //     if (!userExists) {
  //       setParticipants((prev) => [
  //         ...prev,
  //         {
  //           id: socketService.socket?.id || Date.now(),
  //           name: user.name,
  //           joinedAt: new Date().toISOString(),
  //         },
  //       ]);
  //     }
  //   }
  // }, [user, participants]);

  // If used as overlay, don't render when closed
  if (isOpen === false) {
    return null;
  }

  // Chat component content
  const chatContent = (
    <div
      className="bg-white rounded-lg shadow-lg border border-gray-300 w-full flex flex-col relative"
      style={{ height: "477px", width: "429px" }}
    >
      {/* Close button for overlay mode */}
      {onClose && (
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Chat</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors relative text-sm ${
            activeTab === "chat"
              ? "text-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Chat
          {activeTab === "chat" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("participants")}
          className={`flex-1 py-3 px-4 text-center font-medium transition-colors relative text-sm ${
            activeTab === "participants"
              ? "text-black"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Participants
          {activeTab === "participants" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-600"></div>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" ? (
          <div className="h-full flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-8 text-sm">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className="flex flex-col space-y-1"
                  >
                    {/* User name and timestamp */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-purple-600">
                        {msg.user === effectiveUserName ? "You" : msg.user}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`flex ${
                        msg.user === effectiveUserName
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl max-w-sm break-words text-sm ${
                          msg.user === effectiveUserName
                            ? "bg-purple-600 text-white"
                            : msg.isSystem
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-gray-800 text-white"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={!effectiveUserName}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || !effectiveUserName}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    newMessage.trim() && effectiveUserName
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Send
                </button>
              </div>
              {!effectiveUserName && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  Please log in to send messages
                </p>
              )}
            </div>
          </div>
        ) : (
          /* Participants Tab */
          <div className="h-full flex flex-col">
            {/* Participants Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Name</span>
                {isTeacher && (
                  <span className="text-sm font-medium text-gray-500">
                    Action
                  </span>
                )}
              </div>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-4">
              {participants.length === 0 ? (
                <div className="text-center text-gray-400 mt-8 text-sm">
                  No participants yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant, index) => (
                    <div
                      key={participant.id || index}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-black font-medium text-sm">
                          {participant.name}
                          {participant.name === effectiveUserName && (
                            <span className="text-xs text-purple-600 ml-2">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                      {isTeacher && participant.name !== effectiveUserName && (
                        <button
                          onClick={() => kickOutUser(participant)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          Kick out
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Debug Info - only show in development */}
              {process.env.NODE_ENV === "development" && (
                <div className="mt-4 p-2 bg-gray-50 rounded text-xs text-gray-500">
                  Debug: Socket: {socketService.socket?.connected ? "✓" : "✗"} |
                  User: {effectiveUserName || "None"} | Participants:{" "}
                  {participants.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Return overlay version if onClose is provided (overlay mode)
  if (onClose) {
    return (
      <div className="fixed inset-0 z-50 flex justify-end items-start pt-20 pr-6">
        {/* Backdrop - very subtle or no backdrop for minimal interference */}
        <div
          className="absolute inset-0 bg-transparent"
          onClick={onClose}
        ></div>

        {/* Chat Modal - compact size positioned on the right side */}
        <div className="relative z-10">{chatContent}</div>
      </div>
    );
  }

  // Return regular version (standalone mode)
  return chatContent;
};

export default Chat;
