import React from "react";
import { useApp } from "../context/AppContext";

const Kickout = () => {
  const { resetState, navigateToHome } = useApp();

  const handleTryAgain = () => {
    // Reset all state and navigate to home
    resetState();
    navigateToHome();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        {/* Header with Logo */}
        <div className="mb-12">
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

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            You've been Kicked out !
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 leading-relaxed">
            Looks like the teacher had removed you from the poll system. Please
            Try again sometime.
          </p>
        </div>

        {/* Optional Action Button (if you want to add one) */}
        <div className="hidden">
          <button
            onClick={handleTryAgain}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default Kickout;
