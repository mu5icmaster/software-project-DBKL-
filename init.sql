CREATE DATABASE IF NOT EXISTS rental_website;

USE rental_website;

/* Create all Tables */
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

INSERT INTO roles (role_name) VALUES ('admin'), ('customer');

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL DEFAULT 2,
    user_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL UNIQUE,
    user_ic CHAR(12) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

INSERT INTO users (role_id, user_name, user_email, user_ic, password_hash) VALUES (1, 'Admin', 'admin@gmail.com', '000000112222', 'ADMIN_PASSWORD_HASH');

