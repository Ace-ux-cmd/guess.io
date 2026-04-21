// Utility for generating a random room ID
const generateId = require("../utils/randomChar");

// Import shared in-memory state
// rooms: Map of roomId -> room object
// playerRoom: Map of player socket id -> roomId
const { rooms, playerRoom } = require("../state/store");

// Game configuration containing settings for each mode
const { gameMode } = require("../constant/config");

// Utility to generate the secret number based on digit length
const secretNumber = require("../utils/randomNum");

// Export function that creates a new game room
// players: array of player objects
// mode: selected game mode (used to determine attempts and digit count)
module.exports = (players, mode) => {

  // Extract number of attempts and digit length from the selected mode
  const { attempt, digit } = gameMode[mode];

  // Generate an initial room ID
  let roomId = generateId()

  // Ensure the generated room ID is unique
  // If it already exists, keep generating until a unique one is found
  while (rooms.has(roomId)) {
    roomId = generateId()
  }

  // Create the room object with initial game state
  const room = { 
    roomId,                         // Unique identifier for the room
    digit,                          // Number of digits for the secret number
    secret: secretNumber(digit),    // Generated secret number
    status: "playing",              // Current game status
    attempt,                        // Remaining attempts
    players: new Map(),             // Map of playerId -> player object
    winner: null                    // Will store winner username if game ends
  };


  // Store the room in the global rooms map
  rooms.set(roomId, room);

  // Add each player to the room
  players.forEach(element => {

    // Map the player's socket id to the room id
    playerRoom.set(element.id, roomId);

    // Store the player object inside the room's players map
    room.players.set(element.id, element);
  });

  // Return the created room object
  return room;
}