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


CREATE TABLE EmergencyReports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    student_usn VARCHAR(20),
    emergency_type VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    emergency_contact VARCHAR(20),
    report_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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
UPDATE Buses 
SET bus_img = 'https://example.com/images/bus_ka25_1234.jpg' 
WHERE bus_id = 1;

UPDATE Buses 
SET bus_img = 'https://example.com/images/bus_ka25_5678.jpg' 
WHERE bus_id = 2;

show tables;
ALTER TABLE complaints drop COLUMN student_usn ;
DELETE FROM BusVotes WHERE vote_time < NOW() - INTERVAL 30 MINUTE;
select * from emergencyreports;
ALTER TABLE EmergencyRequests ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE EmergencyRequests ADD COLUMN emergency_contact VARCHAR(15); 

drop table busvoting  ;
select* from busroutes;




