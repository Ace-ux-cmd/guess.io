// Import shared in-memory state
// queues: matchmaking queues grouped by mode
// playerRoom: maps socket.id -> roomId
// rooms: active game rooms
const { queues, playerRoom, rooms } = require("../state/store");

// Event name constant for game over notification
const { gameOver } = require("../constant/events");

// Handler executed when a player disconnects
// socket: disconnected client socket
module.exports = (socket) => {

    // Remove the disconnected player from all matchmaking queues
    for (const val of Object.values(queues)) {

        // Find player index inside the current queue
        let index = val.findIndex(n => n.id === socket.id);

        // If found, remove the player from queue
        if (index !== -1) val.splice(index, 1);
    }

    // Check if the player was inside an active room
    if (playerRoom.has(socket.id)) {

        // Retrieve the roomId associated with the player
        const roomId = playerRoom.get(socket.id);

        // Get the actual room object
        const room = rooms.get(roomId);

        // Remove player-room mapping immediately
        playerRoom.delete(socket.id);

        // If room does not exist, stop processing
        if (!room) return;

        // Remove player from the room's player list
        room.players.delete(socket.id);

        // If 1 or fewer players remain, end the game
        if (room.players.size <= 1) {

            // Mark room as finished
            room.status = "finished";

            // If exactly one player remains, declare them winner
            if (room.players.size === 1) {

                let reason = "Player Left";

                // Get remaining player object
                let player = room.players.values().next().value;

                // Set winner username
                room.winner = player.username;

                // Notify remaining player about game over
                player.send(JSON.stringify({
                    type: gameOver,
                    payload: {
                        winner: room.winner,
                        secret: room.secret,
                        reason
                    }
                }));
            }

            // Remove room from active rooms list
            rooms.delete(roomId);

            // Clean up player-room mappings for all remaining players
            for (const playerId of room.players.keys()) {
                playerRoom.delete(playerId)
            }
        }
    }
}