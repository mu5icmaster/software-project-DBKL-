const express = require('express');
const router = express.Router();
const common = require('./common');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

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
            console.log('Password match');
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});

module.exports = router;