import React from "react";
import { useApp } from "./context/AppContext";

// Import all components
import Home from "./Components/Home";
import EnterName from "./Components/EnterName";
import CreatePoll from "./Components/CreatePoll";
import Loader from "./Components/Loader";
import Question from "./Components/Question";
import Addpoll from "./Components/Addpoll";
import ViewPoll from "./Components/viewpoll";
import Kickout from "./Components/kickout";

const Navigation = () => {
  const { currentScreen } = useApp();

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home />;
      case "enterName":
        return <EnterName />;
      case "createPoll":
        return <CreatePoll />;
      case "loader":
        return <Loader />;
      case "question":
        return <Question />;
      case "addpoll":
        return <Addpoll />;
      case "viewpoll":
        return <ViewPoll />;
      case "kickout":
        return <Kickout />;
      default:
        return <Home />;
    }
  };

  return <div className="app-container">{renderScreen()}</div>;
};

export default Navigation;
