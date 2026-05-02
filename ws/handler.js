// Import event constants used for WebSocket messaging
const events = require("../constant/events");

// Matchmaking queue handler
const addToQueue = require("../matchmaking/queueManager");

// Game logic for evaluating guesses
const handleGuess = require("../game/guessEvaluator");

// Cleanup handler for disconnected players
const disconnect = require("./disconnect");

// Shared in-memory state for rooms and player mapping
const { rooms, playerRoom } = require("../state/store");

// WebSocket connection handler
module.exports = (socket) => {

  // Mark socket as alive for heartbeat mechanism
  socket.isAlive = true;

  // Handle incoming messages from client
  socket.on("message", (rawData) => {

    let data;

    // Parse incoming JSON safely
    try {
      data = JSON.parse(rawData);
    } catch {
      return socket.send(JSON.stringify({
        type: events.error,
        payload: "Error parsing Data"
      }))
    }


    const dataType = data?.type;
    const payload = data?.payload;

    // Validate message type
    if (!dataType) {
      return socket.send(JSON.stringify({
        type: events.error,
        payload: "Type not found"
      }));
    }

    switch (dataType) {

      // Player joins matchmaking queue
      case events.play: {

        // Ensure payload exists
        if (!payload) {
          return socket.send(JSON.stringify({
            type: events.error,
            payload: "Payload not found"
          }));
        }

        // Assign username or fallback
        socket.username = payload.username || "Guest";

        // Add player to matchmaking queue
        const mode = payload.mode;
        const feedback = addToQueue(socket, mode);

        // If queueing failed, notify client
        if (feedback.success === false) {
          return socket.send(JSON.stringify({
            type: events.matchFailed,
            payload: feedback
          }));
        }

        // Retrieve room assigned after successful match
        const roomId = playerRoom.get(socket.id);
        const room = rooms.get(roomId);

        const players = [];

        // Prepare simplified player list for broadcast
        room.players.forEach(n => {
          players.push({ id: n.id, username: n.username });
        });

        // Notify all players in room about match start
        room.players.forEach(n => {

          // Ensure connection is open before sending
          if (n.readyState === WebSocket.OPEN) {
            n.send(JSON.stringify({
              type: events.matchFound,
              payload: {
                message: feedback.message,
                roomId: room.roomId,
                digit: room.digit,
                tries: room.attempt,
                players: players
              }
            }));
          }
        });
      }
      break;

      // Player submits a guess
      case "guess": {

        const roomId = playerRoom.get(socket.id);
        const room = rooms.get(roomId);

        // Ignore guesses if game is not active
        if (room.status !== "playing") return;

        // Validate payload
        if (!payload) {
          return socket.send(JSON.stringify({
            type: events.error,
            payload: "Payload not found"
          }));
        }

        const guess = payload.guess;

        if (!guess) {
          return socket.send(JSON.stringify({
            type: events.error,
            payload: "No guess attempt made"
          }));
        }

        // Evaluate guess
        const failedResult = handleGuess(socket, guess);

        // If guess is invalid, send error
        if (failedResult) {
          socket.send(JSON.stringify({
            type: events.error,
            payload: failedResult.message
          }));
          return;
        }

        // Broadcast guess to other players, and result to sender
        room.players.forEach(n => {

          if (n.readyState === WebSocket.OPEN) {

            if (n !== socket) {
              n.send(JSON.stringify({
                type: events.guessMade,
                payload: { 
                  guess,
                tries: room.attempt
                 }
              }));

            } else {
              n.send(JSON.stringify({
                type: events.guessResult,
                payload: {
                  guess,
                  correctPosition: room.lastGuess.correctPosition,
                  result: room.lastGuess.result,
                  correctDigit: room.lastGuess.correctDigitt,
                tries: room.attempt
                }
              }));
            }
          }
        });

        // Handle game end state
        if (room.status === "finished") {

          let reason;

          if (room.winner) reason = "secret_found";
          else reason = "out_of_attempts";

          // Notify all players about game over
          room.players.forEach(n => {
            if (n.readyState === WebSocket.OPEN) {
              n.send(JSON.stringify({
                type: events.gameOver,
                payload: {
                  winner: room.winner,
                  secret: room.secret,
                  reason
                }
              }));
            }
          });

          // Cleanup room and mappings
          rooms.delete(roomId);

          for (const playerId of room.players.keys()) {
            playerRoom.delete(playerId)
          }
        }
      }
      break;

        case "leave_queue": socket.close()
      // Fallback for unknown message types
      default:
        socket.send(JSON.stringify({
          type: events.error,
          payload: "Invalid type"
        }))
    }
  });

  // Mark client as alive on pong response (heartbeat system)
  socket.on("pong", () => {
    socket.isAlive = true;
  });

  // Handle client disconnect
  socket.on("close", () => {
    disconnect(socket);
  });

  // Handle socket errors
  socket.on("error", (e) => {
    socket.send(JSON.stringify({
      type: events.error,
      payload: e.message
    }));
    console.log(e.message)
  })
}