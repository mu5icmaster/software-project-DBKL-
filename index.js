require('dotenv').config();
const express = require('express');
const session = require('express-session');
const https = require('https');
const bodyParser = require('body-parser');
const routes = require('./routes');
const os = require('os');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const app = express();

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
        console.error('Are you sure the database is running?');
        process.exit(1);
    }
    console.log('Connected to the database');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '50mb' })); // For image uploads

// Session configuration
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

// Use routes defined in routes.js
app.use(routes);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

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

// HTTPS options
const options = {
    key: fs.readFileSync('certs/server-key.pem'),
    cert: fs.readFileSync('certs/server-cert.pem'),
    ca: fs.readFileSync('certs/ca.pem')
};

// Start the HTTPS server
const PORT = process.env.PORT || 3000;
https.createServer(options, app).listen(PORT, () => {
    const ip_address = getLocalIpAddress();
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the server at https://${ip_address}:${PORT}/login.html`);
});

/*
app.listen(PORT, () => {
    const ip_address = getLocalIpAddress();
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the server at http://${ip_address}:${PORT}/login.html`);
});
*/
