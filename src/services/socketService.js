import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(
    serverUrl = import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      "https://live-polling-nbjp.onrender.com"
    // serverUrl = "http://localhost:5000"
  ) {
    if (!this.socket || !this.socket.connected) {
      // Disconnect existing socket if it exists but is not connected
      if (this.socket) {
        this.socket.disconnect();
      }

      console.log("Creating new socket connection to:", serverUrl);
      this.socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        forceNew: true, // Force new connection
      });

      this.socket.on("connect", () => {
        console.log("Connected to server with ID:", this.socket.id);
        this.isConnected = true;
      });

      this.socket.on("disconnect", () => {
        console.log("Disconnected from server");
        this.isConnected = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this.isConnected = false;
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Student Functions
  joinAsStudent(name) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit("join_student", name);

      this.socket.once("join_success", (data) => {
        resolve(data);
      });

      this.socket.once("join_error", (error) => {
        reject(new Error(error));
      });
    });
  }

  submitAnswer(answer) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit("submit_answer", answer);

      this.socket.once("answer_submitted", (data) => {
        resolve(data);
      });

      this.socket.once("answer_error", (error) => {
        reject(new Error(error));
      });
    });
  }

  // Teacher Functions
  startPoll(pollData) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit("teacher_start_poll", pollData);

      this.socket.once("poll_started", (data) => {
        resolve(data);
      });

      this.socket.once("poll_error", (error) => {
        reject(new Error(error));
      });
    });
  }

  endPoll() {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit("teacher_end_poll");

      this.socket.once("poll_ended_by_teacher", () => {
        resolve({ success: true });
      });

      this.socket.once("no_active_poll", () => {
        reject(new Error("No active poll to end"));
      });
    });
  }

  getCurrentResults() {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("get_current_results");
  }

  kickStudent(studentName) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit("kick_student", studentName);

      this.socket.once("student_kicked", (name) => {
        resolve(name);
      });

      this.socket.once("kick_error", (error) => {
        reject(new Error(error));
      });
    });
  }

  getStudentsList() {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("get_students");
  }

  getPastPolls() {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("get_past_polls");
  }

  getServerStatus() {
    if (!this.socket) {
      throw new Error("Socket not connected");
    }
    this.socket.emit("get_status");
  }

  // Event Listeners
  onNewQuestion(callback) {
    if (this.socket) {
      this.socket.on("new_question", callback);
    }
  }

  onPollEnded(callback) {
    if (this.socket) {
      this.socket.on("poll_ended", callback);
    }
  }

  onLiveResults(callback) {
    if (this.socket) {
      this.socket.on("live_results", callback);
    }
  }

  onCurrentResults(callback) {
    if (this.socket) {
      this.socket.on("current_results", callback);
    }
  }

  onStudentCountUpdate(callback) {
    if (this.socket) {
      this.socket.on("student_count_update", callback);
    }
  }

  onStudentsList(callback) {
    if (this.socket) {
      this.socket.on("students_list", callback);
    }
  }

  onPastPolls(callback) {
    if (this.socket) {
      this.socket.on("past_polls", callback);
    }
  }

  onServerStatus(callback) {
    if (this.socket) {
      this.socket.on("server_status", callback);
    }
  }

  onKicked(callback) {
    if (this.socket) {
      this.socket.on("kicked", callback);
    }
  }

  onNoActivePoll(callback) {
    if (this.socket) {
      this.socket.on("no_active_poll", callback);
    }
  }

  // Chat Functions
  joinChat(sessionId, userName) {
    if (this.socket) {
      this.socket.emit("join-chat", { sessionId, user: userName });
    }
  }

  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit("send-message", messageData);
    }
  }

  kickUser(sessionId, userId, userName, kickedBy) {
    if (this.socket) {
      this.socket.emit("kick-user", { sessionId, userId, userName, kickedBy });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new-message", callback);
    }
  }

  onChatHistory(callback) {
    if (this.socket) {
      this.socket.on("chat-history", callback);
    }
  }

  onParticipantsUpdated(callback) {
    if (this.socket) {
      this.socket.on("participants-updated", callback);
    }
  }

  onUserKicked(callback) {
    if (this.socket) {
      this.socket.on("user-kicked", callback);
    }
  }

  // Remove event listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
