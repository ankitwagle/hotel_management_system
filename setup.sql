-- ============================================================
--  GRAND IMPERIAL HOTEL MANAGEMENT SYSTEM
--  Run this ONCE in phpMyAdmin
--  Go to: http://localhost/phpmyadmin
--  Click SQL tab → Paste everything → Click Go
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hotel_db;

-- ROOMS
CREATE TABLE IF NOT EXISTS rooms (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    room_number     VARCHAR(10)   NOT NULL UNIQUE,
    room_type       VARCHAR(30)   NOT NULL DEFAULT 'Standard',
    floor           INT           NOT NULL DEFAULT 1,
    capacity        INT           NOT NULL DEFAULT 2,
    price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status          VARCHAR(20)   NOT NULL DEFAULT 'Available',
    amenities       TEXT,
    description     TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- GUESTS
CREATE TABLE IF NOT EXISTS guests (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(25),
    address       TEXT,
    id_type       VARCHAR(30) DEFAULT 'Passport',
    id_number     VARCHAR(60),
    nationality   VARCHAR(100),
    date_of_birth DATE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    booking_ref      VARCHAR(20)   NOT NULL UNIQUE,
    guest_id         INT           NOT NULL,
    room_id          INT           NOT NULL,
    check_in         DATE          NOT NULL,
    check_out        DATE          NOT NULL,
    num_guests       INT           NOT NULL DEFAULT 1,
    total_amount     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    paid_amount      DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status           VARCHAR(20)   NOT NULL DEFAULT 'Confirmed',
    special_requests TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id)  REFERENCES rooms(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

-- STAFF
CREATE TABLE IF NOT EXISTS staff (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    phone       VARCHAR(25),
    role        VARCHAR(50)  NOT NULL,
    department  VARCHAR(100),
    salary      DECIMAL(10,2) DEFAULT 0.00,
    hire_date   DATE,
    status      VARCHAR(20)  NOT NULL DEFAULT 'Active',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    booking_id       INT           NOT NULL,
    amount           DECIMAL(10,2) NOT NULL,
    payment_method   VARCHAR(30)   NOT NULL DEFAULT 'Cash',
    reference_number VARCHAR(100),
    notes            TEXT,
    payment_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SERVICES
CREATE TABLE IF NOT EXISTS services (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    booking_id   INT           NOT NULL,
    service_name VARCHAR(200)  NOT NULL,
    service_type VARCHAR(50)   NOT NULL DEFAULT 'Other',
    amount       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status       VARCHAR(20)   NOT NULL DEFAULT 'Pending',
    service_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- USERS  (plain text password - simple and reliable)
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(80)  NOT NULL UNIQUE,
    password   VARCHAR(100) NOT NULL,
    full_name  VARCHAR(200) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'Staff',
    status     VARCHAR(20)  NOT NULL DEFAULT 'Active',
    guest_id   INT DEFAULT NULL,
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
--  DEFAULT ACCOUNTS  (plain text passwords)
--  Admin   : username=admin    password=admin123
--  Staff   : username=staff1   password=staff123
--  Guest   : username=guest1   password=guest123
-- ============================================================
INSERT INTO users (username, password, full_name, role, status) VALUES
('admin',  'admin123',  'Hotel Administrator', 'Admin',  'Active'),
('staff1', 'staff123',  'Front Desk Staff',    'Staff',  'Active'),
('guest1', 'guest123',  'Guest User',          'Guest',  'Active');

-- ============================================================
--  DONE! Open http://localhost/hotel/ and sign in.
-- ============================================================
