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
// ✅ Function to delete expired votes every 5 minutes
function deleteExpiredVotes() {
    const sql = "DELETE FROM BusVotes WHERE vote_time < DATE_SUB(NOW(), INTERVAL 30 MINUTE)";
    db.query(sql, (err, result) => {
        if (err) {
            console.error("❌ Error deleting expired votes:", err);
        } else {
            console.log(`✅ Expired votes removed: ${result.affectedRows}`);
        }
    });
}

// Run the cleanup every 5 minutes
setInterval(deleteExpiredVotes, 5 * 60 * 1000);

// Fetch bus details
app.get("/api/buses", (req, res) => {
    const sql = "SELECT bus_id, bus_number, capacity, route_id, bus_img FROM Buses";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching buses:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        res.status(200).json(results);
    });
});
// 📌 POST: Student submits a complaint
app.post("/api/complaints", (req, res) => {
    const { student_usn, complaint_type, description } = req.body;

    if (!complaint_type || !description) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const sql = "INSERT INTO Complaints (student_usn, complaint_type, description) VALUES (?, ?, ?)";
    db.query(sql, [student_usn, complaint_type, description], (err, result) => {
        if (err) {
            console.error("Error inserting complaint:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(201).json({ message: "Complaint submitted successfully", complaintId: result.insertId });
    });
});

// 📌 GET: Fetch all complaints (for Coordinators)
app.get("/api/complaints", (req, res) => {
    const sql = "SELECT * FROM Complaints ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching complaints:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json(results);
    });
});

// 📌 PUT: Update complaint status (Pending → In Progress → Resolved)
app.put("/api/complaints/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Progress", "Resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const sql = "UPDATE Complaints SET status = ? WHERE complaint_id = ?";
    db.query(sql, [status, id], (err, result) => {
        if (err) {
            console.error("Error updating complaint status:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.status(200).json({ message: "Complaint status updated successfully" });
    });
});

app.post("/api/emergency", (req, res) => {
    const { emergencyType, latitude, longitude, emergencyContact, student_usn } = req.body;

    if (!latitude || !longitude || !emergencyType) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Store emergency report in Database (Optional)
    const sql = "INSERT INTO EmergencyReports (student_usn, emergency_type, latitude, longitude, emergency_contact) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [student_usn, emergencyType, latitude, longitude, emergencyContact], (err, result) => {
        if (err) {
            console.error("Error storing emergency report:", err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        console.log("Emergency report stored successfully.");

        // ✅ Send Telegram Alert to multiple authorities
        sendTelegramEmergencyAlert(emergencyType, latitude, longitude, emergencyContact);

        res.status(201).json({ message: "Emergency reported successfully!" });
    });
});
//const axios = require("axios"); // ✅ Import Axios

function sendTelegramEmergencyAlert(emergencyType, latitude, longitude, emergencyContact) {
    const TELEGRAM_BOT_TOKEN = "7629370561:AAHtrC7OuESHgWAGlqtErrb1_mPFXQ70awM"; // ✅ Replace with actual token

    // ✅ List of Valid Chat IDs
    const TELEGRAM_CHAT_IDS = [
        "7545143019",  // Bus Coordinator (Replace with real chat ID)
        //"1146747265",  // Security Team
        //"1122334455"  // College Admin
    ];

    // ✅ Ensure Latitude & Longitude Are Valid
    if (!latitude || !longitude) {
        console.error("❌ Missing location data!");
        return;
    }

    const message = `🚨 *EMERGENCY ALERT* 🚨\n\n +
                    ⚠ *Type:* ${emergencyType}\n +
                    📍 *Location:* [Google Maps](https://www.google.com/maps?q=${latitude || "Not Provided"},${longitude || "Not Provided"})\n +
                    📞 *Emergency Contact:* ${emergencyContact || "Not Provided"}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    TELEGRAM_CHAT_IDS.forEach(chatId => {
        const data = {
            chat_id: chatId,
            text: message,
            parse_mode: "Markdown"  // ✅ Makes Google Maps link clickable
        };

        axios.post(url, data)
            .then(response => console.log(`✅ Emergency alert sent to ${chatId}, response.data`))
            .catch(error => console.error(`❌ Error sending alert to ${chatId}:, error.response?.data || error.message`));
    });
}


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
