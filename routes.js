const express = require('express');
const router = express.Router();
const multer = require('multer');
const common = require('./common');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Initialize MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pass1',
    database: 'rental_website'
});

router.get('/user.html', common.isAuthenticated, (req, res) => {
    if (req.session.userRole === 'admin') {
        const userID = req.query.user_id;

        common.updateUserStatus(userID, db);

        db.query('SELECT status FROM users WHERE user_id = ?', [userID], (err, results) => {
            if (err) {
                console.error('Error fetching user status:', err);
                return res.status(500).json({ success: false, message: 'Database query failed' });
            }

            const status = results[0].status;
            if (status === 'verified') {
                return res.status(403).send('Access denied: This account has already been verified.');
            }

            return res.sendFile('user.html', { root: 'public' });
        });
    } else {
        const userID = req.session.userID;

        common.updateUserStatus(userID, db);

        db.query('SELECT status FROM users WHERE user_id = ?', [userID], (err, results) => {
            if (err) {
                console.error('Error fetching user status:', err);
                return res.status(500).json({ success: false, message: 'Database query failed' });
            }

            const status = results[0].status;
            if (status === 'verified') {
                return res.status(403).send('Access denied: Your account has already been verified.');
            }


            db.query('SELECT image_id FROM images WHERE user_id = ?', [userID], (err, results) => {
                if (err) {
                    console.error('Error fetching images:', err);
                    return res.status(500).json({ success: false, message: 'Database query failed' });
                }

                const attempts = results.length;
                if (attempts >= 3) {
                    return res.status(403).send('Access denied: You have exceeded the maximum number of verification attempts.');
                }


                return res.sendFile('user.html', { root: 'public' });
            });
        });
    }
});

router.get('/dashboard.html', common.isAuthenticated, common.isAdmin, (req, res) => {
    res.sendFile('dashboard.html', { root: 'public' });
});

router.get('/session-info', (req, res) => {
    if (req.session.userID) {
        res.json({ success: true, userID: req.session.userID, userRole: req.session.userRole });
    } else {
        res.json({ success: false, message: 'No session found' });
    }
});

router.get('/api/users', common.isAuthenticated, common.isAdmin, (req, res) => {
    const query = `
        SELECT
            u.user_name,
            u.user_email,
            u.user_ic,
            COALESCE(CONCAT(a.address_line, ", ", a.zip_code, " ", a.city, ", ", a.\`state\`), "-") AS address,
            u.user_id
        FROM
            users u
        LEFT JOIN
            \`address\` a
        ON
            u.address_id = a.address_id
        WHERE
            role_id=2
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }
        res.json({ success: true, users: results });
    });
});

router.get('/api/admin', common.isAuthenticated, common.isAdmin, (req, res) => {
    db.query('SELECT user_id FROM users WHERE role_id = 2', (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }

        const userIDs = results.map(result => result.user_id);
        userIDs.forEach(userID => {
            common.updateUserStatus(userID, db);
        });
    });

    const query = `
        SELECT
            u.user_id AS id,
            u.user_name AS name,
            COALESCE(CONCAT(a.address_line, ", ", a.zip_code, " ", a.city, ", ", a.\`state\`), "-") AS address,
            u.status,
            COALESCE(DATE_FORMAT(i.created_at, '%Y-%m-%d %H:00:00'), "-") AS created_at
        FROM users u
        LEFT JOIN (
            SELECT 
                user_id, 
                MAX(created_at) AS created_at
            FROM images 
            GROUP BY user_id
        ) i ON u.user_id = i.user_id
        LEFT JOIN address a ON u.address_id = a.address_id
        WHERE role_id = 2
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed', err });
        }
        res.json({ success: true, users: results });
    });
});

router.get('/api/employees', common.isAuthenticated, common.isAdmin, (req, res) => {
    const query = `
        SELECT
            u.user_id,
            u.user_name AS name,
            u.user_email AS email,
            r.role_name AS role,
            DATE_FORMAT(u.last_login, '%Y-%m-%d %H:%i:%s') AS last_activity 
        FROM
            users u
        LEFT JOIN
            roles r
        ON
            u.role_id = r.role_id
        WHERE
            u.role_id != 2
    `;

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }
        res.json({ success: true, employees: results });
    });
});


router.get('/api/locations', common.isAuthenticated, common.isAdmin, (req, res) => {
    db.query('SELECT user_id FROM users WHERE role_id = 2', (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }

        const userIDs = results.map(result => result.user_id);
        userIDs.forEach(userID => {
            common.updateUserStatus(userID, db);
        });
    });

    const query = `
        SELECT 
            a.latitude, a.longitude, i.image_path, u.status
        FROM 
            users u
        LEFT JOIN 
            images i ON u.user_id = i.user_id
        LEFT JOIN 
            address a ON u.address_id = a.address_id
        WHERE 
            u.role_id = 2
    `

    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database query failed' });
        }

        if (results.length > 0) {
            results.forEach(result => {
                if (result.status === 'Verified') {
                    result.color = 'green';
                } else if (result.status === 'Suspicious') {
                    result.color = 'yellow';
                } else {
                    result.color = 'red';
                }
            });

            res.json({ success: true, locations: results });
        } else {
            res.status(404).json({ success: false, message: 'No locations found' });
        }
    });
});

// Helper route to autofill form fields with user data
router.get('/user/:id', common.isAuthenticated, common.isAdmin, (req, res) => {
    const userID = req.params.id;
    const query = `
        SELECT 
            u.user_name, 
            u.user_email, 
            COALESCE(a.address_line, '') AS address_line,
            COALESCE(a.city, '') AS city,
            COALESCE(a.state, '') AS state,
            COALESCE(a.zip_code, '') AS zipcode
        FROM 
            users u 
        LEFT JOIN 
            \`address\` a 
        ON 
            u.address_id = a.address_id 
        WHERE 
            u.user_id = ?
    `;
    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ success: false, message: 'Database query failed', err });
        }
        res.json({ success: true, user: results[0] });
    });
});

router.get('/uploads/:path', common.isAuthenticated, common.isAdmin, (req, res) => {
    const imagePath = req.params.path;

    // Sanitize the path to prevent directory traversal attacks
    const safePath = path.normalize(imagePath).replace(/^(\.\.(\/|\\|$))+/, '');

    const rootDir = path.join(__dirname, 'uploads');

    res.sendFile(safePath, { root: rootDir }, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            res.status(err.status).end();
        }
    });
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
<<<<<<< HEAD
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
=======
            db.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

            const userID = user.user_id;
            const userRole = user.role_id === 1 ? 'admin' : 'user';
            req.session.userID = userID;
            req.session.userRole = userRole;
            res.json({ success: true, message: 'Login successful', userRole });
>>>>>>> 2da4b022c3e990f18fc1a11dfb6c07c5ba0f57e4
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
router.post('/register', multer().none(), async (req, res) => {
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

router.post('/api/employees', common.isAuthenticated, common.isAdmin, multer().none(), async (req, res) => {
    const { name, email, ic, password } = req.body;

    // Validate the form data
    if (!name || !email || !ic || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Hash the password
    const hashedPassword = await common.hashPassword(password);

    // Insert the employee into the database
    const query = 'INSERT INTO users (user_name, user_email, user_ic, password_hash, role_id) VALUES (?, ?, ?, ?, 1)';
    db.query(query, [name, email, ic, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error adding employee:', err);
            return res.status(500).json({ success: false, message: 'Database query failed', err });
        }
        res.json({ success: true, message: 'Employee added successfully' });
    });
});

router.put('/api/employees/:id', common.isAuthenticated, common.isAdmin, multer().none(), async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;

    // Validate the form data
    if (!password) {
        return res.status(400).json({ success: false, message: 'Password is required' });
    }

    // Hash the password
    const hashedPassword = await common.hashPassword(password);

    // Update the employee's password
    const query = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
    db.query(query, [hashedPassword, id], (err, results) => {
        if (err) {
            console.error('Error updating employee:', err);
            return res.status(500).json({ success: false, message: 'Database query failed', err });
        }
        res.json({ success: true, message: 'Employee updated successfully' });
    });
});

router.put('/api/images/:id', common.isAuthenticated, common.isAdmin, multer().none(), async (req, res) => {
    const { id } = req.params;
    const { image } = req.body;

    const matches = image.match(/^data:image\/(\w+);base64,/);
    if (!matches) {
        console.error('Invalid image data');
        return res.status(400).json({ success: false, error: 'Invalid image data' });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const { imageName, imagePath } = common.generateUniqueFileName();

    // Save the image to the server
    fs.writeFile(imagePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving image:', err);
            return res.status(500).json({ success: false, error: 'Failed to save image' });
        }

        // Update the image path and location data in the MySQL database
        const query = 'UPDATE users SET image_path =? WHERE user_id = ?';
        db.query(query, [`/uploads/${imageName}`, id], (err, result) => {
            if (err) {
                console.error('Error updating image:', err);
                return res.status(500).json({ success: false, error: 'Failed to update image' });
            }
            res.json({ success: true, message: 'Image updated successfully' });
        });
    });
});


// Route to handle image uploads
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

router.post('/update-address', common.isAuthenticated, common.isAdmin, multer().none(), async (req, res) => {
    const { userID, address, city, state, zipcode } = req.body;
    const { latitude, longitude } = await common.getCoordinates(`${address} ${zipcode} ${city} ${state}`);

<<<<<<< HEAD
module.exports = router;})
=======
    db.query('SELECT COALESCE(address_id, "") as address_id FROM users WHERE user_id = ?', [userID], (err, results) => {
        if (err) {
            console.error('Error fetching address ID:', err);
            return res.status(500).json({ success: false, message: 'Database query failed', err });
        }
        let addressID = results[0].address_id;


        if (!addressID) {
            const query = 'INSERT INTO `address` (address_line, city, state, zip_code, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)';
            db.query(query, [address, city, state, zipcode, latitude, longitude], (err, results) => {
                if (err) {
                    console.error('Error inserting address:', err);
                    return res.status(500).json({ success: false, message: 'Database query failed', err });
                }
                const addressID = results.insertId;
                db.query('UPDATE users SET address_id = ? WHERE user_id = ?', [addressID, userID], (err, results) => {
                    if (err) {
                        console.error('Error updating user:', err);
                        return res.status(500).json({ success: false, message: 'Database query failed', err });
                    }
                    res.json({ success: true, message: 'Address updated successfully' });
                });
            });
        } else {
            const query = `
                UPDATE 
                    \`address\` a 
                JOIN 
                    users u 
                ON 
                    u.address_id = a.address_id 
                SET 
                    a.address_line = ?, 
                    a.city = ?, 
                    a.state = ?, 
                    a.zip_code = ?,
                    a.latitude = ?,
                    a.longitude = ?
                WHERE 
                    a.address_id = ?
    `;
            db.query(query, [address, city, state, zipcode, latitude, longitude, addressID], (err, results) => {
                if (err) {
                    console.error('Error updating address:', err);
                    return res.status(500).json({ success: false, message: 'Database query failed', err });
                }
                res.json({ success: true, message: 'Address updated successfully' });
            });
        }
    });
});

// It's probably better to put the queries in common.js and import them here
// But I'm lazy so feel free if this bothers you

module.exports = router;
>>>>>>> 2da4b022c3e990f18fc1a11dfb6c07c5ba0f57e4
