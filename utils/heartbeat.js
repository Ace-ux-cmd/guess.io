// Export a function that enables heartbeat monitoring
// ws: WebSocket server instance
module.exports = (ws) => {

  // Run a heartbeat check every 30 seconds
  setInterval(() => {

    // Iterate over every connected client
    ws.clients.forEach(client => {

      // If the client did not respond to the previous ping
      // terminate the connection
      if(!client.isAlive){
        client.terminate();
        return
      }

      // Mark the client as not alive until a pong response is received
      // (the pong handler should set isAlive = true)
      client.isAlive = false;

      // Send a ping to the client to check if the connection is still active
      client.ping();
    })

  }, 30000); // 30 second interval
}