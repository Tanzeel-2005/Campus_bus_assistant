require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const TELEGRAM_BOT_TOKEN = "your_telegram_bot_token";
const TELEGRAM_CHAT_ID = "your_telegram_chat_id";
const VOTE_THRESHOLD = 15;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "pass123",
    database: "campus_bus_assistant"
});

db.connect(err => {
    if (err) console.error("Database connection failed:", err);
    else console.log("Connected to MySQL database");
});

// Default Route
app.get("/", (req, res) => {
    res.send("Campus Bus Assistant API is running...");
});

// User Registration
app.post("/api/users", async (req, res) => {
    const { usn, name, email, phone, password, role, department, region, bus_assigned } = req.body;

    if (!name || !email || !phone || !password || !role) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO Users (usn, name, email, phone, password_hash, role, department, region, bus_assigned) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [usn, name, email, phone, hashedPassword, role, department || null, region || null, bus_assigned || null], (err, result) => {
            if (err) {
                console.error("Error inserting user:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }
            res.status(201).json({ message: "User registered successfully", userId: result.insertId });
        });
    } catch (error) {
        console.error("Error hashing password:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// User Login
app.post("/api/login", async (req, res) => {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
        return res.status(400).json({ message: "Email or phone is required" });
    }

    const sql = "SELECT * FROM Users WHERE email = ? OR phone = ?";
    db.query(sql, [email, phone], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or phone or password" });
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ message: "Invalid email or phone or password" });
        }

        delete user.password_hash;
        res.status(200).json({ message: "Login successful", user });
    });
});

// Route for students to vote for a bus
app.post("/api/vote", (req, res) => {
    const { bus_id, student_usn, vote_weight } = req.body;

    if (!bus_id || !student_usn || !vote_weight) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Check if student has already voted for this bus
    const checkVoteQuery = "SELECT COUNT(*) AS count FROM BusVotes WHERE student_usn = ? AND bus_id = ?";
    db.query(checkVoteQuery, [student_usn, bus_id], (err, result) => {
        if (err) {
            console.error("Error checking existing vote:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result[0].count > 0) {
            return res.status(400).json({ message: "You have already voted for this bus." });
        }

        // ✅ If no duplicate vote, insert the new vote
        const insertVoteQuery = "INSERT INTO BusVotes (bus_id, student_usn, vote_weight) VALUES (?, ?, ?)";
        db.query(insertVoteQuery, [bus_id, student_usn, vote_weight], (err, result) => {
            if (err) {
                console.error("Error inserting vote:", err);
                return res.status(500).json({ message: "Database error", error: err });
            }

            // ✅ Check vote threshold after inserting
            checkVoteThreshold(bus_id);

            res.status(201).json({ message: "Vote recorded successfully" });
        });
    });
});

// Function to check vote threshold and send alert
function checkVoteThreshold(bus_id) {
    const sql = "SELECT SUM(vote_weight) AS total_votes FROM BusVotes WHERE bus_id = ?";
    db.query(sql, [bus_id], (err, result) => {
        if (err) {
            console.error("Error fetching vote count:", err);
            return;
        }

        const totalVotes = result[0].total_votes || 0;

        if (totalVotes >= VOTE_THRESHOLD) {
            sendTelegramAlert(bus_id, totalVotes);
        }
    });
}

// Function to send Telegram alert
function sendTelegramAlert(bus_id, totalVotes) {
    
    const message = `Alert: Bus ${bus_id} has received ${totalVotes} votes. It is time to depart.`;


    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const data = {
        chat_id: TELEGRAM_CHAT_ID,
        text: message
    };

    axios.post(url, data)
        .then(response => {
            console.log("Telegram alert sent:", response.data);
        })
        .catch(error => {
            console.error("Error sending Telegram alert:", error);
        });
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});