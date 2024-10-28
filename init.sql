CREATE DATABASE IF NOT EXISTS rental_website;

USE rental_website;

/* Create all Tables */
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO roles (role_name) VALUES ('admin'), ('customer');

CREATE TABLE IF NOT EXISTS `address` (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    address_line VARCHAR(200) NOT NULL,
    city VARCHAR(50) NOT NULL,
    `state` VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL DEFAULT 2,
    address_id INT,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE,
    user_ic CHAR(12) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    image_path VARCHAR(255), /*This should be NOT NULL, just leaving it nullable now to make things easier*/
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id),
    FOREIGN KEY (address_id) REFERENCES address(address_id)
);

INSERT INTO users (role_id, user_name, user_email, user_ic, password_hash) VALUES (1, 'Admin', 'admin@gmail.com', '000000112222', 'ADMIN_PASSWORD_HASH');

CREATE TABLE IF NOT EXISTS images (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
