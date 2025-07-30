import React, { createContext, useContext, useReducer, useEffect } from "react";

// Initial state
const initialState = {
  // User data
  userRole: null, // 'student' or 'teacher'
  userName: "",
  userId: null,

  // Poll data
  currentPoll: null,
  pollHistory: [],
  activeQuestionIndex: 0,

  // Session data
  sessionId: null,
  participants: [],

  // UI state
  currentScreen: "home", // 'home', 'enterName', 'createPoll', 'loader', 'question', 'chat', 'addpoll', 'viewpoll', 'kickout'
  isLoading: false,
  error: null,

  // Chat data
  messages: [],

  // Results data
  currentResults: null,
  showResults: false,
};

// Action types
const ActionTypes = {
  // Navigation
  SET_CURRENT_SCREEN: "SET_CURRENT_SCREEN",

  // User actions
  SET_USER_ROLE: "SET_USER_ROLE",
  SET_USER_NAME: "SET_USER_NAME",
  SET_USER_ID: "SET_USER_ID",

  // Poll actions
  SET_CURRENT_POLL: "SET_CURRENT_POLL",
  ADD_TO_POLL_HISTORY: "ADD_TO_POLL_HISTORY",
  SET_ACTIVE_QUESTION_INDEX: "SET_ACTIVE_QUESTION_INDEX",
  SET_CURRENT_RESULTS: "SET_CURRENT_RESULTS",
  TOGGLE_SHOW_RESULTS: "TOGGLE_SHOW_RESULTS",

  // Session actions
  SET_SESSION_ID: "SET_SESSION_ID",
  SET_PARTICIPANTS: "SET_PARTICIPANTS",
  ADD_PARTICIPANT: "ADD_PARTICIPANT",
  REMOVE_PARTICIPANT: "REMOVE_PARTICIPANT",

  // UI actions
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",

  // Chat actions
  ADD_MESSAGE: "ADD_MESSAGE",
  SET_MESSAGES: "SET_MESSAGES",

  // Reset
  RESET_STATE: "RESET_STATE",
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_SCREEN:
      return { ...state, currentScreen: action.payload };

    case ActionTypes.SET_USER_ROLE:
      return { ...state, userRole: action.payload };

    case ActionTypes.SET_USER_NAME:
      return { ...state, userName: action.payload };

    case ActionTypes.SET_USER_ID:
      return { ...state, userId: action.payload };

    case ActionTypes.SET_CURRENT_POLL:
      return { ...state, currentPoll: action.payload };

    case ActionTypes.ADD_TO_POLL_HISTORY:
      return {
        ...state,
        pollHistory: [...state.pollHistory, action.payload],
      };

    case ActionTypes.SET_ACTIVE_QUESTION_INDEX:
      return { ...state, activeQuestionIndex: action.payload };

    case ActionTypes.SET_CURRENT_RESULTS:
      return { ...state, currentResults: action.payload };

    case ActionTypes.TOGGLE_SHOW_RESULTS:
      return { ...state, showResults: !state.showResults };

    case ActionTypes.SET_SESSION_ID:
      return { ...state, sessionId: action.payload };

    case ActionTypes.SET_PARTICIPANTS:
      return { ...state, participants: action.payload };

    case ActionTypes.ADD_PARTICIPANT:
      return {
        ...state,
        participants: [...state.participants, action.payload],
      };

    case ActionTypes.REMOVE_PARTICIPANT:
      return {
        ...state,
        participants: state.participants.filter((p) => p.id !== action.payload),
      };

    case ActionTypes.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionTypes.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case ActionTypes.SET_MESSAGES:
      return { ...state, messages: action.payload };

    case ActionTypes.RESET_STATE:
      return { ...initialState, currentScreen: "home" };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from sessionStorage on mount
  useEffect(() => {
    const savedUserRole = sessionStorage.getItem("userRole");
    const savedUserName = sessionStorage.getItem("userName");
    const savedUserId = sessionStorage.getItem("userId");
    const savedSessionId = sessionStorage.getItem("sessionId");

    if (savedUserRole) {
      dispatch({ type: ActionTypes.SET_USER_ROLE, payload: savedUserRole });
    }
    if (savedUserName) {
      dispatch({ type: ActionTypes.SET_USER_NAME, payload: savedUserName });
    }
    if (savedUserId) {
      dispatch({ type: ActionTypes.SET_USER_ID, payload: savedUserId });
    }
    if (savedSessionId) {
      dispatch({ type: ActionTypes.SET_SESSION_ID, payload: savedSessionId });
    }
  }, []);

  // Save state to sessionStorage when relevant state changes
  useEffect(() => {
    if (state.userRole) {
      sessionStorage.setItem("userRole", state.userRole);
    }
  }, [state.userRole]);

  useEffect(() => {
    if (state.userName) {
      sessionStorage.setItem("userName", state.userName);
    }
  }, [state.userName]);

  useEffect(() => {
    if (state.userId) {
      sessionStorage.setItem("userId", state.userId);
    }
  }, [state.userId]);

  useEffect(() => {
    if (state.sessionId) {
      sessionStorage.setItem("sessionId", state.sessionId);
    }
  }, [state.sessionId]);

  // Navigation functions
  const navigateTo = (screen) => {
    dispatch({ type: ActionTypes.SET_CURRENT_SCREEN, payload: screen });
  };

  const navigateToHome = () => navigateTo("home");
  const navigateToEnterName = () => navigateTo("enterName");
  const navigateToCreatePoll = () => navigateTo("createPoll");
  const navigateToLoader = () => navigateTo("loader");
  const navigateToQuestion = () => navigateTo("question");
  const navigateToChat = () => navigateTo("chat");
  const navigateToAddPoll = () => navigateTo("addpoll");
  const navigateToViewPoll = () => navigateTo("viewpoll");
  const navigateToKickout = () => navigateTo("kickout");

  // User functions
  const setUserRole = (role) => {
    dispatch({ type: ActionTypes.SET_USER_ROLE, payload: role });
  };

  const setUserName = (name) => {
    dispatch({ type: ActionTypes.SET_USER_NAME, payload: name });
  };

  const setUserId = (id) => {
    dispatch({ type: ActionTypes.SET_USER_ID, payload: id });
  };

  // Poll functions
  const setCurrentPoll = (poll) => {
    dispatch({ type: ActionTypes.SET_CURRENT_POLL, payload: poll });
  };

  const addToPollHistory = (poll) => {
    dispatch({ type: ActionTypes.ADD_TO_POLL_HISTORY, payload: poll });
  };

  const setActiveQuestionIndex = (index) => {
    dispatch({ type: ActionTypes.SET_ACTIVE_QUESTION_INDEX, payload: index });
  };

  const setCurrentResults = (results) => {
    dispatch({ type: ActionTypes.SET_CURRENT_RESULTS, payload: results });
  };

  const toggleShowResults = () => {
    dispatch({ type: ActionTypes.TOGGLE_SHOW_RESULTS });
  };

  // Session functions
  const setSessionId = (id) => {
    dispatch({ type: ActionTypes.SET_SESSION_ID, payload: id });
  };

  const setParticipants = (participants) => {
    dispatch({ type: ActionTypes.SET_PARTICIPANTS, payload: participants });
  };

  const addParticipant = (participant) => {
    dispatch({ type: ActionTypes.ADD_PARTICIPANT, payload: participant });
  };

  const removeParticipant = (participantId) => {
    dispatch({ type: ActionTypes.REMOVE_PARTICIPANT, payload: participantId });
  };

  // UI functions
  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  // Chat functions
  const addMessage = (message) => {
    dispatch({ type: ActionTypes.ADD_MESSAGE, payload: message });
  };

  const setMessages = (messages) => {
    dispatch({ type: ActionTypes.SET_MESSAGES, payload: messages });
  };

  // Reset function
  const resetState = () => {
    sessionStorage.clear();
    dispatch({ type: ActionTypes.RESET_STATE });
  };

  const value = {
    // State
    ...state,

    // Navigation functions
    navigateTo,
    navigateToHome,
    navigateToEnterName,
    navigateToCreatePoll,
    navigateToLoader,
    navigateToQuestion,
    navigateToChat,
    navigateToAddPoll,
    navigateToViewPoll,
    navigateToKickout,

    // User functions
    setUserRole,
    setUserName,
    setUserId,

    // Poll functions
    setCurrentPoll,
    addToPollHistory,
    setActiveQuestionIndex,
    setCurrentResults,
    toggleShowResults,

    // Session functions
    setSessionId,
    setParticipants,
    addParticipant,
    removeParticipant,

    // UI functions
    setLoading,
    setError,

    // Chat functions
    addMessage,
    setMessages,

    // Reset function
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export { ActionTypes };
