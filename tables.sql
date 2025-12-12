CREATE TABLE roles (
    id INT NOT NULL,
    roles ENUM('admin', 'student' ),
    PRIMARY KEY (id)
) ENGINE = InnoDB CHARACTER SET greek COLLATE greek_general_ci;

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

CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  student_am INT NOT NULL,
  reserved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  FOREIGN KEY (student_am) REFERENCES students(student_am)
);
