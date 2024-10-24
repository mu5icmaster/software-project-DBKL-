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
    const imagePath = path.join(__dirname, 'public/uploads', imageName);

    while (fs.existsSync(imagePath)) {
        imageName = `${uuidv4()}.png`;
        imagePath = path.join(__dirname, 'public/uploads', imageName);
    }

    return { imageName, imagePath };
};

module.exports = {
    hashPassword,
    sanitizePassword,
    generateUniqueFileName
};

/*
DEBUGGING PURPOSES:
sha256 Hash: b'5gT7IHLChtH7Y3jFzedMoMmfO6HZ9M71iWkCDvvCOC4='
hashed_password = '$2b$12$vN3jXeGs9Z.MqQH4LVLzU.5o5Tzc1NA92Y4PWcUI3BFFrS/BHyMYa'
*/