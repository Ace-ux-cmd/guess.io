// Node.js crypto module used for generating secure random values
const crypto = require("crypto");

// Export a function that generates a random room ID
module.exports = () => {

  // Generate 6 random bytes
  // Convert them to a hexadecimal string
  // Resulting ID will be 12 characters long
  return crypto.randomBytes(6).toString("hex");
}