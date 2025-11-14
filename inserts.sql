INSERT INTO roles VALUES 
(1, 'admin'),
(2, 'student');


INSERT INTO admins (admin_am, role_id, admin_username, admin_password)
VALUES ('1056433', '1' ,'admin', '1234');

INSERT INTO students (student_am, role_id, student_username, student_password)
VALUED ('1034556', '2' , 'michael', '1234');