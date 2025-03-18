create database campus_bus_assistant;
use campus_bus_assistant;
CREATE TABLE Buses (
    bus_id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    route_id INT NOT NULL,
    driver_id INT UNIQUE
);
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    usn VARCHAR(20) UNIQUE,  -- Primary key for students
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role ENUM('Student', 'Driver', 'Coordinator') NOT NULL,
    department VARCHAR(50),  -- Only for students
    region ENUM('Hubli', 'Dharwad'),  -- Only for students
    bus_assigned INT,  -- Only for drivers
    FOREIGN KEY (bus_assigned) REFERENCES Buses(bus_id) ON DELETE SET NULL
);
-- BUS ROUTES TABLE
CREATE TABLE BusRoutes (
    route_id INT AUTO_INCREMENT PRIMARY KEY,
    start_location VARCHAR(100) NOT NULL,
    end_location VARCHAR(100) NOT NULL,
    stops JSON NOT NULL,
    schedule TEXT NOT NULL
);

-- BUS VOTING TABLE
CREATE TABLE BusVoting (
    vote_id INT AUTO_INCREMENT PRIMARY KEY,
    student_usn VARCHAR(20) NOT NULL,
    bus_id INT NOT NULL,
    vote_weight DECIMAL(2,1) NOT NULL CHECK (vote_weight IN (1.0, 0.5)),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_usn) REFERENCES Users(usn) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES Buses(bus_id) ON DELETE CASCADE
);

-- COMPLAINTS TABLE
CREATE TABLE Complaints (
    complaint_id INT AUTO_INCREMENT PRIMARY KEY,
    student_usn VARCHAR(20),
    complaint_type ENUM('Rash Driving', 'Overcrowding', 'Delays', 'Poor Condition', 'Driver Misbehavior', 'Other') NOT NULL,
    description TEXT NOT NULL,
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_usn) REFERENCES Users(usn) ON DELETE SET NULL
);

-- EMERGENCY REQUESTS TABLE
CREATE TABLE EmergencyRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    student_usn VARCHAR(20) NOT NULL,
    location TEXT,
    emergency_type ENUM('Medical', 'Safety', 'Other') NOT NULL,
    status ENUM('Notified', 'Resolved') DEFAULT 'Notified',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_usn) REFERENCES Users(usn) ON DELETE CASCADE
);
INSERT INTO BusRoutes (start_location, end_location, stops, schedule) VALUES
('Hubli Campus', 'Dharwad Main Stop', '["Stop1", "Stop2", "Stop3"]', '8:00 AM, 1:00 PM, 6:00 PM'),
('Dharwad Campus', 'Hubli Main Stop', '["StopA", "StopB", "StopC"]', '9:00 AM, 2:00 PM, 7:00 PM');
INSERT INTO Buses (bus_number, capacity, route_id) VALUES
('KA-25-1234', 40, 1),
('KA-25-5678', 50, 2);
-- Students (Hubli & Dharwad)
INSERT INTO Users (usn, name, email, phone, password_hash, role, department, region) VALUES
('1RV23CS001', 'Amit Kumar', 'amit@example.com', '9876543210', 'password123', 'Student', 'CSE', 'Hubli'),
('1RV23EC002', 'Priya Sharma', 'priya@example.com', '9876543211', 'password456', 'Student', 'ECE', 'Dharwad');

-- Driver
INSERT INTO Users (name, email, phone, password_hash, role, bus_assigned) VALUES
('Ramesh Patil', 'ramesh@example.com', '9876543212', 'driverpass', 'Driver', 1);

-- Bus Coordinator
INSERT INTO Users (name, email, phone, password_hash, role) VALUES
('Coordinator John', 'john@example.com', '9876543213', 'coordpass', 'Coordinator');
INSERT INTO BusVoting (student_usn, bus_id, vote_weight) VALUES
('1RV23CS001', 1, 1.0),  -- Amit votes for Bus 1 (Hubli region, full weight)
('1RV23EC002', 1, 0.5);  -- Priya votes for Bus 1 (Dharwad student voting for Hubli, half weight)
INSERT INTO Complaints (student_usn, complaint_type, description) VALUES
('1RV23CS001', 'Rash Driving', 'The driver was speeding on the highway.'),
('1RV23EC002', 'Overcrowding', 'Bus was full, but the driver still allowed more students.');
INSERT INTO EmergencyRequests (student_usn, location, emergency_type) VALUES
('1RV23CS001', 'Near College Gate', 'Medical');
SELECT * FROM BusRoutes;
SELECT * FROM Buses;
SELECT * FROM Users;
SELECT * FROM BusVoting;
SELECT * FROM Complaints;
SELECT * FROM EmergencyRequests;

SELECT user, host, plugin FROM mysql.user WHERE user = 'root';
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pass123';
CREATE TABLE BusVotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    student_usn VARCHAR(20) NOT NULL,
    vote_weight DECIMAL(3,2) NOT NULL,  -- 1.0 for own region, 0.5 for other region
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES Buses(bus_id),
    FOREIGN KEY (student_usn) REFERENCES Users(usn)
);
SELECT * FROM Users WHERE usn = '4JN21CS001';
INSERT INTO Users (usn, name, email, phone, password_hash, role, department, region)
VALUES ('4JN21CS001', 'John Doe', 'tan@example.com', '987654321', 'securepass', 'Student', 'CSE', 'Hubli');
SELECT id, name, phone FROM Users WHERE role = 'Driver';
INSERT INTO Users (usn, name, email, phone, password_hash, role, department, region, bus_assigned) 
VALUES ('DR123', 'John Doe', 'driver@example.com', '+918073633340', 'passwaoo', 'Driver', NULL, NULL, 1);
desc Buses;
SET FOREIGN_KEY_CHECKS = 1;
SELECT bus_id, SUM(vote_weight) AS total_votes FROM BusVotes GROUP BY bus_id;

show tables;
select*from BusVotes;


