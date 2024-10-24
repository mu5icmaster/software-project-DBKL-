const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const path = require('path');
const os = require('os');
const routes = require('./routes');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); // Storing the image in memory


// Connect to the MySQL database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password: 'Pass1',
    database: 'rental_website'
});

db.connect((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the database');
});

// Function to get the local IP address
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (HTML, CSS)

// Use routes defined in routes.js
app.use(routes);

/*
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
*/

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const ip_address = getLocalIpAddress();
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the server at http://${ip_address}:${PORT}/login.html`);
});
