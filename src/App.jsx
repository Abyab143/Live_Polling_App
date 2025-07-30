import React from "react";
import { AppProvider } from "./context/AppContext";
import Navigation from "./Navigation";

function App() {
  return (
    <AppProvider>
      <Navigation />
    </AppProvider>
  );
}

export default App;
