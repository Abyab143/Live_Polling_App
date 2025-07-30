import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Chat from "./Chat";
import useChatOverlay from "../hooks/useChatOverlay";
import socketService from "../services/socketService";

const ViewPoll = () => {
  const { pollHistory: contextPollHistory, navigateToAddPoll } = useApp();
  const { isChatOpen, openChat, closeChat } = useChatOverlay();

  const [pastPolls, setPastPolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen for past polls from server
    socketService.onPastPolls((polls) => {
      console.log("Past polls received:", polls);
      setPastPolls(polls);
      setIsLoading(false);
    });

    // Request past polls
    socketService.getPastPolls();

    return () => {
      socketService.off("past_polls");
    };
  }, []);

  // Transform server data to display format
  const getDisplayPolls = () => {
    if (pastPolls.length > 0) {
      return pastPolls.map((poll, index) => ({
        id: poll.id || index + 1,
        questionNumber: index + 1,
        question: poll.question,
        results: Object.entries(poll.results || {}).map(
          ([option, votes], optIndex) => ({
            id: optIndex + 1,
            option: option,
            votes: votes,
            percentage:
              poll.totalStudents > 0
                ? Math.round((votes / poll.totalStudents) * 100)
                : 0,
          })
        ),
        totalStudents: poll.totalStudents,
        answeredStudents: poll.answeredStudents,
        endTime: poll.endTime,
        duration: poll.duration,
      }));
    }

    // Fallback to context poll history
    return contextPollHistory.map((poll, index) => ({
      ...poll,
      questionNumber: index + 1,
    }));
  };

  const displayPolls = getDisplayPolls();

  const handleChatClick = () => {
    openChat();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Poll History</h1>
          <button
            onClick={() => navigateToAddPoll()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4">
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
            <p className="text-gray-600">Loading poll history...</p>
          </div>
        ) : displayPolls.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No polls have been conducted yet.
            </p>
          </div>
        ) : (
          /* Poll History List */
          <div className="space-y-12">
            {displayPolls.map((poll) => (
              <div
                key={poll.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Question Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Question {poll.questionNumber}
                  </h2>

                  {/* Question Text */}
                  <div className="bg-gray-700 text-white p-6 rounded-xl">
                    <h3 className="text-lg font-medium">{poll.question}</h3>
                  </div>
                </div>

                {/* Results */}
                <div className="p-6 pt-0 space-y-4">
                  {poll.results.map((result) => (
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
                            ({result.votes || 0} votes)
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* End of history message */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-lg">
            {displayPolls.length === 0
              ? "No polls conducted yet."
              : "End of poll history"}
          </p>
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

export default ViewPoll;
