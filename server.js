const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Storing the image in memory

// Initialize SQLite database
const db = new sqlite3.Database(':memory:'); // In-memory database for testing; use a file path for persistent storage.

db.serialize(() => {
    // Create table if it doesn't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            photo TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        )
    `);
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (HTML, CSS)

// POST route for handling form submission
app.post('/submit', upload.single('photo'), (req, res) => {
    const { email, latitude, longitude } = req.body;
    const photo = req.body.photo; // This is the base64 encoded photo from the frontend

    if (!email || !photo || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Insert data into the database
    db.run(
        'INSERT INTO users (email, photo, latitude, longitude) VALUES (?, ?, ?, ?)',
        [email, photo, latitude, longitude],
        function (err) {
            if (err) {
                return res.status(500).json({ message: 'Failed to submit data' });
            }
            res.json({ message: 'Data submitted successfully' });
        }
    );
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
