const bcrypt = require('bcrypt');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid').v4;

/* See bottom of https://pypi.org/project/bcrypt/ for explanation */
async function hashPassword(password) {
    const sha256Hash = crypto.createHash('sha256').update(password).digest('base64');
    const hashedPassword = await bcrypt.hash(sha256Hash, await bcrypt.genSalt(rounds=12));
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
    console.log(data);

    if (data.status === 'OK') {
        const location = data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
    } else {
        return { latitude: 0, longitude: 0 };
    }
} 

module.exports = {
    hashPassword,
    sanitizePassword,
    generateUniqueFileName,
    isAuthenticated,
    isAdmin,
    getCoordinates
};

/*
DEBUGGING PURPOSES:
sha256 Hash: b'5gT7IHLChtH7Y3jFzedMoMmfO6HZ9M71iWkCDvvCOC4='
hashed_password = '$2b$12$vN3jXeGs9Z.MqQH4LVLzU.5o5Tzc1NA92Y4PWcUI3BFFrS/BHyMYa'
*/