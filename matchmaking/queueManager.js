// Import shared in-memory state
// queues: object containing matchmaking queues by mode
// playerRoom: Map of socket.id -> roomId
const { queues, playerRoom } = require("../state/store");

// Function responsible for creating a game room once enough players are matched
const createRoom = require("../game/roomManager");

// Function to add a player (socket) into the matchmaking queue
function addToQueue (socket, mode){

    // Convert mode string into the number of required players
    // easy -> 2 players
    // medium -> 3 players
    // hard -> 4 players
    switch(mode){
      case "easy": 
        mode = 2;
        break;

      case "medium": 
        mode = 3;
        break;

      case "hard": 
        mode = 4;
        break;

      // If the mode is invalid return an error response
      default: 
        return {
            success: false,
            message: "Invalid Mode"
        };
    }


    // Check if the player is already inside a game
    if(playerRoom.has(socket)){ 
      return {
        success: false,
        message: "Player Is in a game"
      };
    }
    
   // Retrieve the queue corresponding to the required player count
   const queue = queues[mode];

   // Check if the player is already waiting in the queue
   if(queue.some(player => player.id === socket.id)){
      return {
        success: false,
        message: "Player is Currently in queue"
      };
   }

   // Add the player socket to the queue
   queue.push(socket);
   
   // If enough players are in the queue, start a game
   if(queue.length === mode){

        // Select the required number of players from the queue
        const players = queue.slice(0, mode);

        // Remove those players from the queue
        queue.splice(0, mode);
        
        // Create a new game room with the matched players
        createRoom(players, mode);
   
        return {
            success: true,
            message: "Game Found. Initializing…"
        }
   }
   
   // If not enough players yet, keep the player in queue
   return {
        success: false,
        message: "Matchmaking.... Please Wait..."
   };
}

// Export the queue handler
module.exports = addToQueue