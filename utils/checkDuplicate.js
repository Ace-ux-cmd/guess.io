// Utility function to check if a guess contains duplicate characters
// guess: string representing the player's guessed number
// Returns true if any duplicate digit is found, otherwise false

module.exports = (guess) => {

  // Loop through each character in the guess
  for(let i = 0; i < guess.length; i++){

    // Compare the current character with all characters after it
    for(let j = i + 1; j < guess.length; j++){

      // If a matching character is found, a duplicate exists
      if(guess[i] === guess[j]) return true;
    }
  }

  // If no duplicates were found after checking all characters
  return false
}