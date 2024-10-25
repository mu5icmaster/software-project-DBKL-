const express = require('express');
const router = express.Router();
const common = require('./common');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const fs = require('fs');


// Initialize MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pass1',
    database: 'rental_website'
});

// Route to handle login
// Compare user's initial location with submitted location
router.post('/login', async (req, res) => {
    const { email, password, latitude, longitude } = req.body;

    db.query('SELECT * FROM users WHERE user_email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {
            const initialLatitude = user.latitude;
            const initialLongitude = user.longitude;

            const isLocationCorrect = compareLocations(initialLatitude, initialLongitude, latitude, longitude);
            
            let locationStatus = 'red';  // default

            if (isLocationCorrect) {
                locationStatus = 'green';
            } else if (latitude && longitude) {
                locationStatus = 'yellow';
            }

            res.json({ success: true, userID: user.user_id, locationStatus: locationStatus });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});

// Helper function to compare the locations
function compareLocations(initialLat, initialLng, currentLat, currentLng) {
    const threshold = 0.001; // Define a threshold for "correct"
    return Math.abs(initialLat - currentLat) <= threshold && Math.abs(initialLng - currentLng) <= threshold;
}


// Route to handle registration
router.post('/register', async (req, res) => {
    const { first_name, last_name, ic_number, email, password } = req.body;

    // Validate the form data
    if (!first_name || !last_name || !ic_number || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Hash the password and concatenate the first and last name
    const hashedPassword = await common.hashPassword(password);
    const fullName = `${first_name} ${last_name}`;

    // Insert the user into the database
    // Store the user's initial location during registration
    const query = 'INSERT INTO users (user_name, user_ic, user_email, password_hash, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [fullName, ic_number, email, hashedPassword, initialLatitude, initialLongitude], (err, results) => {
    if (err) {
        return res.status(500).json({ success: false, message: 'Database query failed:', err });
    }
    res.json({ success: true, message: 'Registration successful' });
});

router.post('/upload', (req, res) => {
    const { userID, latitude, longitude, image } = req.body;

    
    // Decode the base64 image data
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const { imageName, imagePath } = common.generateUniqueFileName();

    
    // Save the image to the server
    fs.writeFile(imagePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ success: false, error: 'Failed to save image' });
        }

        // Save the image path and location data to the MySQL database
        const query = 'INSERT INTO images (user_id, latitude, longitude, image_path) VALUES (?, ?, ?, ?)';
        db.query(query, [userID, latitude, longitude, `/uploads/${imageName}`], (err, result) => {
            if (err) {
                console.error('Error saving to database:', err);
                return res.status(500).json({ success: false, error: 'Failed to save data to database' });
            }

            res.json({ success: true, message: 'Image and data saved successfully' });
        });
    });
    
});


module.exports = router;})