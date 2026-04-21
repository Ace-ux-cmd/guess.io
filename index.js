// Core Node.js modules for path handling and HTTP server creation
const path = require("path");
const http = require("http");

// Express framework for HTTP routing and middleware
const express = require("express");
const app = express();

// WebSocket library for real-time communication
const WebSocket = require("ws");

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach WebSocket server to the HTTP server
const ws = new WebSocket.Server({ server });

// Middleware for parsing URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Middleware for parsing JSON payloads
app.use(express.json());

// Serve static files from "public" directory
app.use(express.static("public"));

// Resolve path to main game HTML file
const homeFile = path.join(__dirname, "public", "game.html");

// Route for homepage
app.get("/", (req, res) => {
    res.sendFile(homeFile);
});

// Export WebSocket server instance for use in other modules
module.exports = ws;

// Initialize WebSocket event handlers
require("./ws/wsServer");

// Start HTTP + WebSocket server
server.listen(433, () => console.log("Server connected"));