-- Use these to check database creation

use csners;
show tables;

-- Clean slate (drop old tables if they exist - the top two drop statements are for the old schema structure)
DROP TABLE IF EXISTS USER;
DROP TABLE IF EXISTS SESSION;

DROP TABLE IF EXISTS REGISTRATION;
DROP TABLE IF EXISTS EXAM;
DROP TABLE IF EXISTS STUDENT;
DROP TABLE IF EXISTS FACULTY;
DROP TABLE IF EXISTS LOCATION;
DROP TABLE IF EXISTS AUTHENTICATION;

-- AUTHENTICATION TABLE
CREATE TABLE AUTHENTICATION (
    Auth_ID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Password VARCHAR(100) NOT NULL,
    Role ENUM('student', 'faculty') NOT NULL
);

-- STUDENT TABLE
CREATE TABLE STUDENT (
    Student_ID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    NSHE_ID VARCHAR(10) UNIQUE NOT NULL,
    Auth_ID INT NOT NULL,
    FOREIGN KEY (Auth_ID) REFERENCES AUTHENTICATION(Auth_ID)
);

-- FACULTY TABLE
CREATE TABLE FACULTY (
    Faculty_ID INT PRIMARY KEY AUTO_INCREMENT,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Auth_ID INT NOT NULL,
    FOREIGN KEY (Auth_ID) REFERENCES AUTHENTICATION(Auth_ID)
);

-- LOCATION TABLE
CREATE TABLE LOCATION (
    Location_ID INT PRIMARY KEY AUTO_INCREMENT,
    Campus VARCHAR(100) NOT NULL,
    RoomNumber VARCHAR(20) NOT NULL,
    Building VARCHAR(100) NOT NULL
);

-- EXAM TABLE
CREATE TABLE EXAM (
    Exam_ID INT PRIMARY KEY AUTO_INCREMENT,
    ExamName VARCHAR(100) NOT NULL,
    Date DATE NOT NULL,
    Time TIME NOT NULL,
    Faculty_ID INT NOT NULL,
    Location_ID INT NOT NULL,
    Capacity INT NOT NULL,
    Count INT DEFAULT 0,
    FOREIGN KEY (Faculty_ID) REFERENCES FACULTY(Faculty_ID),
    FOREIGN KEY (Location_ID) REFERENCES LOCATION(Location_ID)
);

-- REGISTRATION TABLE
CREATE TABLE REGISTRATION (
    Registration_ID INT PRIMARY KEY AUTO_INCREMENT,
    Student_ID INT NOT NULL,
    Exam_ID INT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Student_ID) REFERENCES STUDENT(Student_ID),
    FOREIGN KEY (Exam_ID) REFERENCES EXAM(Exam_ID)
);

-- Use these to check Dummy data 
SELECT * FROM REGISTRATION;
SELECT * FROM EXAM;
SELECT * FROM STUDENT;
SELECT * FROM FACULTY;
SELECT * FROM LOCATION;
SELECT * FROM AUTHENTICATION;

-- Populate Dummy data
INSERT INTO AUTHENTICATION (Auth_ID, Email, Password, Role) VALUES
(1, '6608455198@student.csn.edu', '6608455198', 'student'),
(2, '2505469473@student.csn.edu', '2505469473', 'student'),
(3, '6646512382@student.csn.edu', '6646512382', 'student'),
(4, '8907916627@student.csn.edu', '8907916627', 'student'),
(5, '2107509517@student.csn.edu', '2107509517', 'student'),
(6, '1030031448@student.csn.edu', '1030031448', 'student'),
(7, '9314649577@student.csn.edu', '9314649577', 'student'),
(8, '2257397008@student.csn.edu', '2257397008', 'student'),
(9, '9227264226@student.csn.edu', '9227264226', 'student'),
(10, '3416832243@student.csn.edu', '3416832243', 'student'),
(11, '8084220731@student.csn.edu', '8084220731', 'student'),
(12, '0314141105@student.csn.edu', '0314141105', 'student'),
(13, '4596293149@student.csn.edu', '4596293149', 'student'),
(14, '0296831299@student.csn.edu', '0296831299', 'student'),
(15, '9500984245@student.csn.edu', '9500984245', 'student'),
(16, '6713983259@student.csn.edu', '6713983259', 'student'),
(17, '9921162330@student.csn.edu', '9921162330', 'student'),
(18, '4220362206@student.csn.edu', '4220362206', 'student'),
(19, '5587379311@student.csn.edu', '5587379311', 'student'),
(20, '2233021496@student.csn.edu', '2233021496', 'student'),
(21, '1156284851@student.csn.edu', '1156284851', 'student'),
(22, '2319758849@student.csn.edu', '2319758849', 'student'),
(23, '7935545372@student.csn.edu', '7935545372', 'student'),
(24, '0869632269@student.csn.edu', '0869632269', 'student'),
(25, '6398399995@student.csn.edu', '6398399995', 'student'),
(26, '6777903682@student.csn.edu', '6777903682', 'student'),
(27, '0787595814@student.csn.edu', '0787595814', 'student'),
(28, '4381120482@student.csn.edu', '4381120482', 'student'),
(29, '3657031241@student.csn.edu', '3657031241', 'student'),
(30, '3955273640@student.csn.edu', '3955273640', 'student'),
(31, '5457654847@student.csn.edu', '5457654847', 'student'),
(32, '4569110472@student.csn.edu', '4569110472', 'student'),
(33, '0073266812@student.csn.edu', '0073266812', 'student'),
(34, '3264773679@student.csn.edu', '3264773679', 'student'),
(35, '1835234687@student.csn.edu', '1835234687', 'student'),
(36, '8345498834@student.csn.edu', '8345498834', 'student'),
(37, '1247872623@student.csn.edu', '1247872623', 'student'),
(38, '7204036147@student.csn.edu', '7204036147', 'student'),
(39, '6487160754@student.csn.edu', '6487160754', 'student'),
(40, '9478115523@student.csn.edu', '9478115523', 'student'),
(41, '5908631756@student.csn.edu', '5908631756', 'student'),
(42, '8475486778@student.csn.edu', '8475486778', 'student'),
(43, '0093731801@student.csn.edu', '0093731801', 'student'),
(44, '5188382374@student.csn.edu', '5188382374', 'student'),
(45, '2633481516@student.csn.edu', '2633481516', 'student'),
(46, '7304034241@student.csn.edu', '7304034241', 'student'),
(47, '7502773744@student.csn.edu', '7502773744', 'student'),
(48, '0524474592@student.csn.edu', '0524474592', 'student'),
(49, '0262656104@student.csn.edu', '0262656104', 'student'),
(50, '1062958846@student.csn.edu', '1062958846', 'student');

INSERT INTO STUDENT (Student_ID, FirstName, LastName, Email, NSHE_ID, Auth_ID) VALUES
(1, 'Deborah', 'Duarte', '6608455198@student.csn.edu', '6608455198', 1),
(2, 'Paul', 'Rice', '2505469473@student.csn.edu', '2505469473', 2),
(3, 'William', 'Rogers', '6646512382@student.csn.edu', '6646512382', 3),
(4, 'Samantha', 'Jones', '8907916627@student.csn.edu', '8907916627', 4),
(5, 'Valerie', 'Coleman', '2107509517@student.csn.edu', '2107509517', 5),
(6, 'William', 'Clark', '1030031448@student.csn.edu', '1030031448', 6),
(7, 'Christopher', 'Castro', '9314649577@student.csn.edu', '9314649577', 7),
(8, 'Michelle', 'Forbes', '2257397008@student.csn.edu', '2257397008', 8),
(9, 'James', 'Peck', '9227264226@student.csn.edu', '9227264226', 9),
(10, 'Joseph', 'Sullivan', '3416832243@student.csn.edu', '3416832243', 10),
(11, 'Elizabeth', 'Schmidt', '8084220731@student.csn.edu', '8084220731', 11),
(12, 'Kelly', 'Taylor', '0314141105@student.csn.edu', '0314141105', 12),
(13, 'Alicia', 'Huff', '4596293149@student.csn.edu', '4596293149', 13),
(14, 'Elizabeth', 'Cook', '0296831299@student.csn.edu', '0296831299', 14),
(15, 'Caitlin', 'Johnson', '9500984245@student.csn.edu', '9500984245', 15),
(16, 'Emily', 'Mclean', '6713983259@student.csn.edu', '6713983259', 16),
(17, 'Margaret', 'Nichols', '9921162330@student.csn.edu', '9921162330', 17),
(18, 'Stephen', 'Sanchez', '4220362206@student.csn.edu', '4220362206', 18),
(19, 'Timothy', 'Bailey', '5587379311@student.csn.edu', '5587379311', 19),
(20, 'Kathryn', 'Lopez', '2233021496@student.csn.edu', '2233021496', 20),
(21, 'Lori', 'Snyder', '1156284851@student.csn.edu', '1156284851', 21),
(22, 'Sean', 'Richardson', '2319758849@student.csn.edu', '2319758849', 22),
(23, 'Chad', 'Johnson', '7935545372@student.csn.edu', '7935545372', 23),
(24, 'Stacy', 'Rogers', '0869632269@student.csn.edu', '0869632269', 24),
(25, 'Jeremy', 'Morales', '6398399995@student.csn.edu', '6398399995', 25),
(26, 'Katie', 'Bradley', '6777903682@student.csn.edu', '6777903682', 26),
(27, 'Crystal', 'Moore', '0787595814@student.csn.edu', '0787595814', 27),
(28, 'Micheal', 'Salazar', '4381120482@student.csn.edu', '4381120482', 28),
(29, 'Jeremy', 'Bowers', '3657031241@student.csn.edu', '3657031241', 29),
(30, 'Heather', 'Hopkins', '3955273640@student.csn.edu', '3955273640', 30),
(31, 'Ian', 'West', '5457654847@student.csn.edu', '5457654847', 31),
(32, 'Anthony', 'Miller', '4569110472@student.csn.edu', '4569110472', 32),
(33, 'Katherine', 'May', '0073266812@student.csn.edu', '0073266812', 33),
(34, 'Brian', 'Sanford', '3264773679@student.csn.edu', '3264773679', 34),
(35, 'Yvette', 'Hicks', '1835234687@student.csn.edu', '1835234687', 35),
(36, 'Amanda', 'Alvarado', '8345498834@student.csn.edu', '8345498834', 36),
(37, 'Joseph', 'Wilson', '1247872623@student.csn.edu', '1247872623', 37),
(38, 'Monica', 'Medina', '7204036147@student.csn.edu', '7204036147', 38),
(39, 'Aaron', 'Gonzales', '6487160754@student.csn.edu', '6487160754', 39),
(40, 'Monique', 'Hunter', '9478115523@student.csn.edu', '9478115523', 40),
(41, 'Marie', 'Chen', '5908631756@student.csn.edu', '5908631756', 41),
(42, 'Denise', 'Moss', '8475486778@student.csn.edu', '8475486778', 42),
(43, 'Robert', 'Cabrera', '0093731801@student.csn.edu', '0093731801', 43),
(44, 'Jacqueline', 'Yang', '5188382374@student.csn.edu', '5188382374', 44),
(45, 'Darius', 'Martinez', '2633481516@student.csn.edu', '2633481516', 45),
(46, 'Beth', 'Stanley', '7304034241@student.csn.edu', '7304034241', 46),
(47, 'Christie', 'Sawyer', '7502773744@student.csn.edu', '7502773744', 47),
(48, 'Carolyn', 'Harris', '0524474592@student.csn.edu', '0524474592', 48),
(49, 'Debra', 'Walsh', '0262656104@student.csn.edu', '0262656104', 49),
(50, 'Steven', 'Jordan', '1062958846@student.csn.edu', '1062958846', 50);

INSERT INTO AUTHENTICATION (Auth_ID, Email, Password, Role) VALUES
(51, 'james.riley@csn.edu', 'Teach123!', 'faculty'),
(52, 'charles.peterson@csn.edu', 'Teach123!', 'faculty'),
(53, 'tracey.lee@csn.edu', 'Teach123!', 'faculty'),
(54, 'ronald.wright@csn.edu', 'Teach123!', 'faculty'),
(55, 'robert.copeland@csn.edu', 'Teach123!', 'faculty'),
(56, 'sarah.garcia@csn.edu', 'Teach123!', 'faculty'),
(57, 'julie.freeman@csn.edu', 'Teach123!', 'faculty'),
(58, 'keith.mitchell@csn.edu', 'Teach123!', 'faculty');

INSERT INTO FACULTY (Faculty_ID, FirstName, LastName, Email, Auth_ID) VALUES
(1, 'James', 'Riley', 'james.riley@csn.edu', 51),
(2, 'Charles', 'Peterson', 'charles.peterson@csn.edu', 52),
(3, 'Tracey', 'Lee', 'tracey.lee@csn.edu', 53),
(4, 'Ronald', 'Wright', 'ronald.wright@csn.edu', 54),
(5, 'Robert', 'Copeland', 'robert.copeland@csn.edu', 55),
(6, 'Sarah', 'Garcia', 'sarah.garcia@csn.edu', 56),
(7, 'Julie', 'Freeman', 'julie.freeman@csn.edu', 57),
(8, 'Keith', 'Mitchell', 'keith.mitchell@csn.edu', 58);

INSERT INTO LOCATION (Location_ID, Campus, RoomNumber, Building) VALUES
(1, 'West Charleston', 'A-251', 'A'),
(2, 'West Charleston', 'B-110', 'B'),
(3, 'West Charleston', 'C-196', 'C'),
(4, 'North Las Vegas', 'A-263', 'A'),
(5, 'North Las Vegas', 'B-137', 'B'),
(6, 'North Las Vegas', 'C-255', 'C'),
(7, 'Henderson', 'A-138', 'A'),
(8, 'Henderson', 'B-188', 'B'),
(9, 'Henderson', 'C-135', 'C');

INSERT INTO EXAM (Exam_ID, ExamName, Date, Time, Faculty_ID, Location_ID, Capacity, Count) VALUES
(1, 'CompTIA Network+', '2025-05-08', '13:00:00', 5, 9, 20, 0),
(2, 'CompTIA A+', '2025-05-07', '15:00:00', 1, 9, 20, 0),
(3, 'Microsoft AZ-900', '2025-05-10', '13:00:00', 3, 7, 20, 0),
(4, 'AWS Certified Cloud Practitioner', '2025-05-03', '13:00:00', 8, 6, 20, 0),
(5, 'Microsoft AZ-900', '2025-05-06', '11:00:00', 5, 4, 20, 0),
(6, 'LPI LPIC-1', '2025-05-01', '09:00:00', 5, 3, 20, 0),
(7, 'Cisco CCNA', '2025-05-05', '11:00:00', 5, 4, 20, 0),
(8, 'LPI LPIC-1', '2025-05-10', '13:00:00', 2, 6, 20, 0),
(9, 'Cisco CCNA', '2025-05-05', '15:00:00', 4, 7, 20, 0),
(10, 'Cisco CCNA', '2025-05-01', '13:00:00', 1, 6, 20, 0),
(11, 'CompTIA A+', '2025-05-08', '13:00:00', 7, 1, 20, 0),
(12, 'CompTIA Security+', '2025-05-07', '13:00:00', 6, 8, 20, 0),
(13, 'LPI LPIC-1', '2025-05-05', '09:00:00', 3, 3, 20, 0),
(14, 'Microsoft AZ-900', '2025-05-10', '09:00:00', 6, 1, 20, 0),
(15, 'Cisco CCNA', '2025-05-07', '13:00:00', 7, 6, 20, 0),
(16, 'Cisco CCNA', '2025-05-04', '11:00:00', 6, 2, 20, 0),
(17, 'CompTIA Network+', '2025-05-09', '13:00:00', 6, 9, 20, 0),
(18, 'CompTIA Security+', '2025-05-10', '13:00:00', 8, 3, 20, 0),
(19, 'Cisco CCNA', '2025-05-01', '11:00:00', 6, 6, 20, 0),
(20, 'CompTIA Network+', '2025-05-07', '13:00:00', 3, 2, 20, 0),
(21, 'Cisco CCNA', '2025-05-05', '11:00:00', 8, 8, 20, 0),
(22, 'Microsoft AZ-900', '2025-05-04', '15:00:00', 3, 7, 20, 0),
(23, 'Cisco CCNA', '2025-05-10', '13:00:00', 6, 2, 20, 0),
(24, 'Microsoft AZ-900', '2025-05-08', '11:00:00', 4, 3, 20, 0);

INSERT INTO REGISTRATION (Registration_ID, Student_ID, Exam_ID, Timestamp) VALUES
(1, 1, 14, NOW()),
(2, 1, 7, NOW()),
(3, 1, 21, NOW()),
(4, 2, 21, NOW()),
(5, 3, 18, NOW()),
(6, 4, 23, NOW()),
(7, 4, 10, NOW()),
(8, 5, 24, NOW()),
(9, 5, 13, NOW()),
(10, 6, 11, NOW()),
(11, 7, 2, NOW()),
(12, 8, 17, NOW()),
(13, 8, 11, NOW()),
(14, 9, 5, NOW()),
(15, 9, 11, NOW()),
(16, 10, 22, NOW()),
(17, 11, 11, NOW()),
(18, 11, 19, NOW()),
(19, 11, 2, NOW()),
(20, 12, 23, NOW()),
(21, 12, 14, NOW()),
(22, 13, 19, NOW()),
(23, 13, 7, NOW()),
(24, 13, 12, NOW()),
(25, 14, 9, NOW()),
(26, 15, 17, NOW()),
(27, 15, 15, NOW()),
(28, 15, 20, NOW()),
(29, 16, 2, NOW()),
(30, 16, 14, NOW()),
(31, 17, 5, NOW()),
(32, 17, 19, NOW()),
(33, 18, 13, NOW()),
(34, 19, 21, NOW()),
(35, 20, 14, NOW()),
(36, 20, 17, NOW()),
(37, 21, 9, NOW()),
(38, 21, 7, NOW()),
(39, 22, 22, NOW()),
(40, 22, 15, NOW()),
(41, 23, 22, NOW()),
(42, 24, 4, NOW()),
(43, 25, 15, NOW()),
(44, 25, 10, NOW()),
(45, 25, 24, NOW()),
(46, 26, 17, NOW()),
(47, 26, 13, NOW()),
(48, 26, 1, NOW()),
(49, 27, 12, NOW()),
(50, 28, 18, NOW()),
(51, 28, 17, NOW()),
(52, 29, 13, NOW()),
(53, 29, 1, NOW()),
(54, 30, 19, NOW()),
(55, 31, 16, NOW()),
(56, 31, 17, NOW()),
(57, 32, 22, NOW()),
(58, 32, 12, NOW()),
(59, 32, 9, NOW()),
(60, 33, 13, NOW()),
(61, 33, 23, NOW()),
(62, 34, 23, NOW()),
(63, 34, 1, NOW()),
(64, 35, 17, NOW()),
(65, 35, 20, NOW()),
(66, 36, 17, NOW()),
(67, 37, 14, NOW()),
(68, 37, 21, NOW()),
(69, 37, 6, NOW()),
(70, 38, 4, NOW()),
(71, 38, 6, NOW()),
(72, 39, 23, NOW()),
(73, 39, 22, NOW()),
(74, 39, 5, NOW()),
(75, 40, 11, NOW()),
(76, 41, 21, NOW()),
(77, 41, 22, NOW()),
(78, 42, 20, NOW()),
(79, 43, 17, NOW()),
(80, 44, 21, NOW()),
(81, 44, 19, NOW()),
(82, 44, 4, NOW()),
(83, 45, 11, NOW()),
(84, 45, 23, NOW()),
(85, 46, 3, NOW()),
(86, 46, 5, NOW()),
(87, 46, 4, NOW()),
(88, 47, 16, NOW()),
(89, 48, 3, NOW()),
(90, 48, 1, NOW()),
(91, 49, 8, NOW()),
(92, 50, 3, NOW()),
(93, 50, 24, NOW()),
(94, 50, 15, NOW());

UPDATE EXAM SET Count = 5, Capacity = 15 WHERE Exam_ID = 14;
UPDATE EXAM SET Count = 3, Capacity = 17 WHERE Exam_ID = 7;
UPDATE EXAM SET Count = 6, Capacity = 14 WHERE Exam_ID = 21;
UPDATE EXAM SET Count = 2, Capacity = 18 WHERE Exam_ID = 18;
UPDATE EXAM SET Count = 6, Capacity = 14 WHERE Exam_ID = 23;
UPDATE EXAM SET Count = 2, Capacity = 18 WHERE Exam_ID = 10;
UPDATE EXAM SET Count = 3, Capacity = 17 WHERE Exam_ID = 24;
UPDATE EXAM SET Count = 5, Capacity = 15 WHERE Exam_ID = 13;
UPDATE EXAM SET Count = 6, Capacity = 14 WHERE Exam_ID = 11;
UPDATE EXAM SET Count = 3, Capacity = 17 WHERE Exam_ID = 2;
UPDATE EXAM SET Count = 9, Capacity = 11 WHERE Exam_ID = 17;
UPDATE EXAM SET Count = 4, Capacity = 16 WHERE Exam_ID = 5;
UPDATE EXAM SET Count = 6, Capacity = 14 WHERE Exam_ID = 22;
UPDATE EXAM SET Count = 5, Capacity = 15 WHERE Exam_ID = 19;
UPDATE EXAM SET Count = 3, Capacity = 17 WHERE Exam_ID = 12;
UPDATE EXAM SET Count = 3, Capacity = 17 WHERE Exam_ID = 9;
UPDATE EXAM SET Count = 4, Capacity = 16 WHERE Exam_ID = 15;
UPDATE EXAM SET Count = 3, Capacity = 17 WHERE Exam_ID = 20;
UPDATE EXAM SET Count = 4, Capacity = 16 WHERE Exam_ID = 4;
UPDATE EXAM SET Count = 4, Capacity = 16 WHERE Exam_ID = 1;
UPDATE EXAM SET Count = 2, Capacity = 18 WHERE Exam_ID = 16;
UPDATE EXAM SET Count = 2, Capacity = 18 WHERE Exam_ID = 6;
UPDATE EXAM SET Count = 3, Capacity = 17 WHERE Exam_ID = 3;
UPDATE EXAM SET Count = 1, Capacity = 19 WHERE Exam_ID = 8;

-- Add this constraint to make sure the students cannot register for the same exam twice
ALTER TABLE REGISTRATION ADD CONSTRAINT unique_student_exam UNIQUE(Student_ID, Exam_ID);
