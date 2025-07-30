import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const ChatOverlay = ({ isOpen, onClose }) => {
  const {
    messages: contextMessages,
    participants: contextParticipants,
    addMessage,
    removeParticipant,
    userRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");

  // Use context messages or fallback to local state
  const [localMessages, setLocalMessages] = useState([
    {
      id: 1,
      user: "User 1",
      text: "Hey There , how can I help?",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      user: "User 2",
      text: "Nothing bro..just chill!!",
      time: "10:32 AM",
      isOwn: true,
    },
  ]);

  // Use context participants or fallback to local state
  const [localParticipants, setLocalParticipants] = useState([
    "Rahul Arora",
    "Pushpender Rautela",
    "Rijul Zalpuri",
    "Nadeem N",
    "Ashwin Sharma",
  ]);

  const messages = contextMessages.length > 0 ? contextMessages : localMessages;
  const participants =
    contextParticipants.length > 0 ? contextParticipants : localParticipants;

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: "You",
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      // Use context if available, otherwise local state
      if (contextMessages.length > 0) {
        addMessage(newMessage);
      } else {
        setLocalMessages([...messages, newMessage]);
      }
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleKickOut = (participantName) => {
    if (userRole === "teacher") {
      // Use context if available, otherwise local state
      if (contextParticipants.length > 0) {
        // In real app, this would be by ID
        const participantToRemove = contextParticipants.find(
          (p) => p.name === participantName
        );
        if (participantToRemove) {
          removeParticipant(participantToRemove.id);
        }
      } else {
        setLocalParticipants(participants.filter((p) => p !== participantName));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-md h-96 flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Tab Header */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors relative ${
              activeTab === "chat"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Chat
            {activeTab === "chat" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("participants")}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors relative ${
              activeTab === "participants"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Participants
            {activeTab === "participants" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-60">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 ${
                        msg.isOwn
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-sm">{msg.text}</div>
                      <div
                        className={`text-xs mt-1 ${
                          msg.isOwn ? "text-purple-200" : "text-gray-500"
                        }`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Participants Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between text-sm font-medium text-gray-600">
                  <span>Name</span>
                  {userRole === "teacher" && <span>Action</span>}
                </div>
              </div>

              {/* Participants List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {participants.map((participant, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-900">{participant}</span>
                    {userRole === "teacher" && (
                      <button
                        onClick={() => handleKickOut(participant)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Kick out
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatOverlay;
