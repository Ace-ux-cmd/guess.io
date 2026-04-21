// Centralized event name constants used for WebSocket communication
// Ensures consistent event naming across client and server

module.exports = {

    // Sent when a player submits a guess
    guess: "guess",

    // Sent to the guessing player with evaluation result
    guessResult: "guess_result",

    // Broadcasted when a player makes a guess (to others)
    guessMade: "guess_made",

    // Sent when a player attempts to join matchmaking
    play: "play",

    // Sent when a match is successfully formed
    matchFound: "match_found",

    // Sent when the game ends
    gameOver: "game_over",

    // Generic error event
    error: "error",

    // Sent when matchmaking fails
    matchFailed: "match_failed"
}