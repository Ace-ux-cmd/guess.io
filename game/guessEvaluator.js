// Import shared in-memory game state
// rooms: Map of roomId -> room object
// playerRoom: Map of socket.id -> roomId
const { rooms, playerRoom } = require("../state/store");

// Utility to check if the guess contains duplicate digits
const checkDuplicate = require("../utils/checkDuplicate");

// Utility to verify the guess is numeric
const checkNumber = require("../utils/checkNumber");

// Export the guess handler
// socket: the connected player
// guess: the guess string sent by the player
module.exports = (socket, guess) => {

  // Remove whitespace around the guess
  guess = guess.trim()

  // Find the roomId using the player's socket id
  const roomId = playerRoom.get(socket.id);

  // If the player is not associated with any room, return an error
  if(!roomId){
    return {
      type: "error",
      message: "Player not in game"
    };
  }

  // Retrieve the room object using the roomId
  const room = rooms.get(roomId);

  // If the room doesn't exist, return an error
  if(!room){
    return {
      type: "error",
      message: "Room doesn't exist"
    };
  }

  // Ensure the game is still in progress
  if(room.status !== "playing"){
    return {
      type: "error",
      message: "Game already finished"
    };
  }

  // Get the player object from the room's players map
  const player = room.players.get(socket.id);

  // If the player is not found inside the room, return an error
  if(!player){
    return {
      type: "error",
      message: "Player is not in room"
    };
  }

  // Extra guard to ensure the game is still active
  if (room.status !== "playing") return;

  // Track number of digits guessed in the correct position
  let correctPosition = 0;

  // Track number of digits that exist in the secret (regardless of position)
  let correctDigit = 0;

  // Check if the guess contains duplicate digits
  const isDuplicate = checkDuplicate(guess);

  // Validate the guess:
  // - Must be numeric
  // - Must match the length of the secret number
  // - Must not contain duplicate digits
  if(!checkNumber(guess) || guess.length !== room.secret.length || isDuplicate){
    return {
      type: "error",
      message: "Invalid Guess"
    }
  }

  // Array to store result for each digit in the guess
  // "correct"  -> correct digit in correct position
  // "present"  -> digit exists but wrong position
  // "absent"   -> digit not in the secret
  let result = []

  // Check each digit in the guess
  for (let i = 0; i < guess.length; i++){

    // Digit is correct and in the correct position
    if(guess[i] === room.secret[i]){
      result.push("correct")
      correctPosition++;

    // Digit exists in the secret but wrong position
    }else if(room.secret.includes(guess[i])){
      result.push("present")

    // Digit does not exist in the secret
    }else{
      result.push("absent")
    }
  }

  // Create a set of unique digits from the guess
  // Used to count how many digits from the guess exist in the secret
  const uniqueGuess = new Set(guess)

  // Check how many unique digits appear in the secret
  for(let key of uniqueGuess){
    if(room.secret.includes(key)) correctDigit++
  }

  // Decrease remaining attempts
  room.attempt--;

  // Store the last guess information for the room
  room.lastGuess = {
    playerId: socket.id,
    guess,
    result,
    correctPosition,
    correctDigit
  }

  // Check if the game should end
  // Game ends if:
  // - Attempts reach 0
  // - Player guesses the full secret correctly
  if(room.attempt <= 0 || correctPosition === room.secret.length){

    // Mark the game as finished
    room.status = "finished"

    // If the guess was completely correct, set the winner
    if(correctPosition === room.secret.length)
      room.winner = socket.username;

    return;
  }
}