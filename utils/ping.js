/**
 * Web server setup module
 * Handles health check endpoint + keeps deployment alive via self-ping
 */
module.exports = (app) => {

    // Basic health check route to confirm GAME/server is running
    app.get("/", (req, res) => {
        res.send("GAME is running ✅");
    });

    // Determine server port (Render uses dynamic PORT)
    const PORT = process.env.PORT || 3000;

    // Start HTTP server
    app.listen(PORT, () => {
        console.log(`Web server running on port ${PORT}`);
    });

    // Base URL used for self-pinging (keeps service awake on hosting platforms like Render)
    const GAME_URL = process.env.GAME_URL;
    
    if (!GAME_URL) {
    console.warn("GAME_URL not set, skipping self-ping");
    return;
}
    /**
     * Self-ping mechanism:
     * Prevents the server from sleeping due to inactivity
     * Runs every 25 minutes
     */
    setInterval(async () => {
        try {

            // Send GET request to GAME URL
            await fetch(GAME_URL);

            console.log("Self-ping successful ✅");

        } catch (err) {

            // Log failures without crashing process
            console.error("Self-ping failed ❌", err);
        }

    }, 25 * 60 * 1000); // 25 minutes interval
};