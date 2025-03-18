const express = require("express");
const router = express.Router();
const db = require("../config/db"); // Adjust if your DB config is elsewhere
const sendTelegramAlert = require("../utils/sendTelegramAlert"); // Import the function

const VOTE_THRESHOLD = 20; // Set the vote threshold

// API to handle voting
router.post("/vote", async (req, res) => {
    try {
        const { student_id, bus_id } = req.body;

        if (!student_id || !bus_id) {
            return res.status(400).json({ error: "Student ID and Bus ID are required." });
        }

        // Insert vote into the database
        await db.execute(
            "INSERT INTO votes (student_id, bus_id) VALUES (?, ?)",
            [student_id, bus_id]
        );

        // Count total votes for this bus
        const [voteCount] = await db.execute(
            "SELECT COUNT(*) AS total_votes FROM votes WHERE bus_id = ?",
            [bus_id]
        );

        const totalVotes = voteCount[0].total_votes;

        // If votes reach the threshold, send Telegram alert
        if (totalVotes >= VOTE_THRESHOLD) {
            sendTelegramAlert(bus_id, totalVotes);
        }

        res.status(200).json({ message: "Vote recorded successfully.", totalVotes });
    } catch (error) {
        console.error("Error in /vote:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;