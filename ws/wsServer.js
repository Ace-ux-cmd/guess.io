// Import WebSocket server instance
const ws = require("../index");

// Heartbeat utility to keep connections alive and detect dead clients
const heartBeat = require("../utils/heartbeat");

// Start heartbeat interval for all connected clients
const interval = heartBeat(ws);

// Message and event handler for each socket connection
const handleMessage = require("./handler");

// Utility to generate unique socket IDs
const generateId = require("../utils/randomChar");

// Handle new WebSocket connections
ws.on("connection", (socket) => {

  // Assign a unique ID to each connected client
  socket.id = generateId();

  console.log("A client connected");

  // Attach message and event handlers to this socket
  handleMessage(socket);
});

// Stop heartbeat interval when WebSocket server closes
ws.on("close", () => {
  clearInterval(interval);
});