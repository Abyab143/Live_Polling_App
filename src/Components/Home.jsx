import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const Home = () => {
  const {
    setUserRole,
    navigateToEnterName,
    navigateToCreatePoll,
    navigateToLoader,
    userName,
  } = useApp();
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      setUserRole(selectedRole);

      // Navigate based on workflow from the image
      if (selectedRole === "student") {
        // Check if student already has a name in this tab session
        if (userName && userName.trim()) {
          console.log(
            "Student already has name, going directly to loader:",
            userName
          );
          navigateToLoader(); // Skip name entry, go directly to waiting for questions
        } else {
          navigateToEnterName(); // First time, go to enter name screen
        }
      } else if (selectedRole === "teacher") {
        navigateToCreatePoll(); // Teachers go to create poll screen
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {/* Header with Logo */}
        <div className="text-center mb-12">
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

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to the{" "}
            <span className="text-gray-900">Live Polling System</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please select the role that best describes you to begin using the
            live polling system
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-3xl mx-auto">
          {/* Student Card */}
          <div
            onClick={() => handleRoleSelect("student")}
            className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === "student"
                ? "border-purple-500 bg-purple-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              I'm a Student
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry
            </p>
          </div>

          {/* Teacher Card */}
          <div
            onClick={() => handleRoleSelect("teacher")}
            className={`p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedRole === "teacher"
                ? "border-purple-500 bg-purple-50 shadow-lg"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              I'm a Teacher
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole}
            className={`px-12 py-4 rounded-full text-lg font-semibold transition-all duration-200 ${
              selectedRole
                ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
