// Core Node.js modules for HTTP server creation and WebSocket library for real-time communication
const http = require("http");
const WebSocket = require("ws");

// Call and pass express for pinging
const app = require("express")();
require("./utils/ping")(app);

// Create HTTP server from Express app
const server = http.createServer();
const PORT = process.env.PORT || 3000;

// Attach WebSocket server to the HTTP server
const ws = new WebSocket.Server({ server });

// Export WebSocket server instance for use in other modules
module.exports = ws;

// Initialize WebSocket event handlers
require("./ws/wsServer");

// Start HTTP + WebSocket server
server.listen(PORT, () => console.log("Server connected"));