// Map storing all active game rooms
// Key: roomId
// Value: room object containing game state
const rooms = new Map();

// Map linking each player to the room they are currently in
// Key: player id
// Value: roomId
const playerRoom = new Map();

// Matchmaking queues grouped by required player count
// 2 -> easy mode queue
// 3 -> medium mode queue
// 4 -> hard mode queue
// Each queue stores socket objects waiting for a match
const queues = {
    2: [],
    3: [],
    4: []
};

// Export shared state so other modules can access it
module.exports = {
    rooms,
    playerRoom,
    queues
}