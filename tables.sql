CREATE TABLE admins (
  admin_am INT UNIQUE NOT NULL,
  role_id INT NOT NULL,
  admin_username VARCHAR(30) DEFAULT 'unknown' NOT NULL,
  admin_password VARCHAR(30) DEFAULT 'unknown' NOT NULL
);


CREATE TABLE students (
  student_am INT UNIQUE NOT NULL,
  role_id INT NOT NULL,
  student_username VARCHAR(30) DEFAULT 'unknown' NOT NULL,
  student_password VARCHAR(30) DEFAULT 'unknown' NOT NULL,
  student_number VARCHAR(20) UNIQUE NOT NULL,
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_email VARCHAR(150) UNIQUE NOT NULL,
  diet_pref VARCHAR(100),
  room_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  building VARCHAR(50),
  room_number VARCHAR(20),
  capacity INT DEFAULT 1,
  occupied INT DEFAULT 0
);
