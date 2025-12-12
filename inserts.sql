INSERT INTO roles VALUES 
(1, 'admin'),
(2, 'student');


INSERT INTO admins (admin_am, role_id, admin_username, admin_password)
VALUES ('1056433', '1' ,'admin', '1234');

INSERT INTO rooms (building, room_number, capacity, occupied) VALUES
('Α', '101', 1, 0),
('Α', '102', 1, 0),
('Α', '103', 1, 0),
('Β', '201', 1, 0),
('Β', '202', 1, 0);