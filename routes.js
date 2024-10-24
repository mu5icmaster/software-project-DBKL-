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
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Query the database for the user
    db.query('SELECT * FROM users WHERE user_email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = results[0];

        // Compare the hashed password with the stored hashed password
        const sanitizedPassword = common.sanitizePassword(password);
        const match = await bcrypt.compare(sanitizedPassword, user.password_hash);

        if (match) {
            const userID = user.user_id;
            res.json({ success: true , userID: userID });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});

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
    const query = 'INSERT INTO users (user_name, user_ic, user_email, password_hash) VALUES (?, ?, ?, ?)';
    db.query(query, [fullName, ic_number, email, hashedPassword], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed:', err });
        }
        res.json({ success: true, message: 'Registration successful' });
    });
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


module.exports = router;