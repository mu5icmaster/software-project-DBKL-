const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid').v4;
const { PythonShell } = require('python-shell');


/* See bottom of https://pypi.org/project/bcrypt/ for explanation */
async function hashPassword(password) {
    const sha256Hash = crypto.createHash('sha256').update(password).digest('base64');
    const hashedPassword = await bcrypt.hash(sha256Hash, await bcrypt.genSalt(rounds = 12));
    return hashedPassword;
}

function sanitizePassword(password) {
    const sha256Hash = crypto.createHash('sha256').update(password).digest('base64');
    return sha256Hash;
}

function generateUniqueFileName() {
    const imageName = `${uuidv4()}.png`;
    const imagePath = path.join(__dirname, 'uploads', imageName);

    while (fs.existsSync(imagePath)) {
        imageName = `${uuidv4()}.png`;
        imagePath = path.join(__dirname, 'uploads', imageName);
    }

    return { imageName, imagePath };
};

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userID) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Middleware to check if the user is an administrator
function isAdmin(req, res, next) {
    if (req.session.userRole === 'admin') {
        next();
    } else {
        res.status(403).send('Access denied');
    }
}

async function getCoordinates(address) {
    const sanitizedAddress = address.replace(/ /g, '%20').replace(/,/g, '');
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${sanitizedAddress}&key=${process.env.GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
    } else {
        return { latitude: 0, longitude: 0 };
    }
}

function compareLocations(latitude, address_latitude, longitude, address_longitude) {
    const THRESHOLD = 0.01;

    if (Math.abs(latitude - address_latitude) < THRESHOLD && Math.abs(longitude - address_longitude) < THRESHOLD) {
        return true;
    } else {
        return false;
    }
}

async function updateUserStatus(userID, connection) {
    const query = `
        SELECT
            im.latitude,
            im.longitude,
            im.image_path AS captured_image_path,
            u.image_path AS uploaded_image_path,
            im.created_at,
            a.latitude AS address_latitude,
            a.longitude AS address_longitude
        FROM
            (
                SELECT
                    i1.latitude,
                    i1.longitude,
                    i1.image_path,
                    i1.user_id,
                    i1.created_at
                FROM
                    images i1
                INNER JOIN
                    (
                        SELECT
                            user_id,
                            MAX(created_at) AS latest_created_at
                        FROM
                            images
                        GROUP BY
                            user_id
                    ) i2
                ON
                    i1.user_id = i2.user_id
                    AND i1.created_at = i2.latest_created_at
            ) im
        RIGHT JOIN
            users u
        ON
            im.user_id = u.user_id
        RIGHT JOIN
            \`address\` a
        ON
            u.address_id = a.address_id
        WHERE 
            u.user_id = ?;
    `; // JFC I hate this query

    connection.query(query, [userID], async (error, results) => {
        if (error) {
            console.error('Failed to fetch user status:', error);
            return;
        }

        const user = results[0];
        if (!user) {
            console.error('User not found:', userID);
            return;
        }

        const capturedImagePath = user.captured_image_path ? path.join(__dirname, user.captured_image_path) : null;
        const uploadedImagePath = user.uploaded_image_path ? path.join(__dirname, user.uploaded_image_path) : null;
        // console.log('Captured image path:', capturedImagePath);
        // console.log('Uploaded image path:', uploadedImagePath);

        const latitude = user.latitude;
        const longitude = user.longitude;
        const address_latitude = user.address_latitude;
        const address_longitude = user.address_longitude;

        image_verified = await compareImages(capturedImagePath, uploadedImagePath);
        checkUserStatus(userID, connection, image_verified, latitude, longitude, address_latitude, address_longitude);
    });
}

function checkUserStatus(userID, connection, image_verified, latitude, longitude, address_latitude, address_longitude) {
    console.log('Checking user status:', userID, image_verified, latitude, longitude, address_latitude, address_longitude);
    if (compareLocations(latitude, address_latitude, longitude, address_longitude) && image_verified) {
        const query = 'UPDATE users SET status = ? WHERE user_id = ?;';
        connection.query(query, ['verified', userID], (error, results) => {
            if (error) {
                console.error('Failed to update user status:', error);
                return;
            }
        });
    } else if (latitude === null || longitude === null) {
        const query = 'UPDATE users SET status = ? WHERE user_id = ?;';
        connection.query(query, ['unverified', userID], (error, results) => {
            if (error) {
                console.error('Failed to update user status:', error);
                return;
            }
        });
    } else {
        const query = 'UPDATE users SET status = ? WHERE user_id = ?;';
        connection.query(query, ['suspicious', userID], (error, results) => {
            if (error) {
                console.error('Failed to update user status:', error);
                return;
            }
        });
    }
}

function compareImages(imagePath1, imagePath2) {
    return new Promise((resolve, reject) => {
        console.log('Comparing images:', imagePath1, imagePath2);
        const scriptPath = path.join(__dirname, 'compare-face.py');
        const options = {
            mode: 'json',
            pythonOptions: ['-u'],
            args: [imagePath1, imagePath2]
        };

        console.log('Running Python script:', scriptPath);
        console.log('Options:', options);
        PythonShell.run(scriptPath, options).then((results) => {
            console.log('Results:', results);
            try{
                result = results[0];
                image_verify = result.verified ? true : false;
                console.log('Image verification:', image_verify);
                resolve(image_verify);
            } catch (error) {
                console.error('Failed to parse JSON:', error);
                resolve(false);
            }
            resolve('script ran');
        });
    });
}

module.exports = {
    hashPassword,
    sanitizePassword,
    generateUniqueFileName,
    isAuthenticated,
    isAdmin,
    getCoordinates,
    compareLocations,
    updateUserStatus,
    compareImages
};

/*
DEBUGGING PURPOSES:
sha256 Hash: b'5gT7IHLChtH7Y3jFzedMoMmfO6HZ9M71iWkCDvvCOC4='
hashed_password = '$2b$12$vN3jXeGs9Z.MqQH4LVLzU.5o5Tzc1NA92Y4PWcUI3BFFrS/BHyMYa'
*/