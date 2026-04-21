// Utility to generate a random numeric secret of given length
// num: number of digits required in the secret
module.exports = (num) => {

    // Source digits available for selection
    const numbers = "0123456789";

    // Convert string into an array for easy removal of used digits
    const arrNums = numbers.split("");

    // Final generated secret number
    let secret = ""

    // Generate digits one by one until required length is reached
    for (let i = 1; i <= num; i++){

        // Pick a random index from remaining available digits
        const randomIndex = Math.floor(Math.random() * arrNums.length);

        // Remove selected digit to avoid reuse to ensure no duplicates
        secret += arrNums.splice(randomIndex, 1)
    }

    // Return generated secret number as a string
    return secret
}