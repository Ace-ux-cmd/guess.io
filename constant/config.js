// Game configuration object
// Defines rules for different multiplayer modes

const gameConfig = {

  // Game modes mapped by number of players
  gameMode: {

    // Easy mode (2 players)
    2: {
      attempt: 10, // number of allowed guesses
      digit: 4     // length of secret number
    },

    // Medium mode (3 players)
    3: {
      attempt: 12, // number of allowed guesses
      digit: 5     // length of secret number
    },

    // Hard mode (4 players)
    4: {
      attempt: 15, // number of allowed guesses
      digit: 6     // length of secret number
    }
  }
}

// Export configuration for use across game logic and matchmaking
module.exports = gameConfig