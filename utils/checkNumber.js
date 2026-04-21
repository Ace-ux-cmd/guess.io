// Utility function to verify that a guess contains only numeric characters
// guess: string input representing the player's guess
// Returns true if all characters are digits, otherwise false

module.exports = (guess) => {

  // String containing all valid numeric characters
  let numbers = "0123456789"

  // Iterate through each character in the guess
  for (let i = 0; i < guess.length; i++) {

    // If the current character is not found in the numbers string
    // the guess contains an invalid (non-numeric) character
    if (!numbers.includes(guess[i])) {
      return false
    }
  }

  // If all characters passed the check, the guess is valid
  return true
}