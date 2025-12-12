const http = require('http');
const fs = require('fs');
const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const MySQLStore = require("express-mysql-session")(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ΠΡΟΣΩΡΙΝΑ: πιο απλό static χωρίς custom cache
app.use('/public', express.static(path.join(__dirname, 'public')));



// Database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "student_housing"
});

db.connect(err => {
  if (err) console.error(" Database connection failed:", err);
  else console.log("Connected to MySQL database!");
});

// Sessions
const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'student_housing'
});

app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));

// Δημιουργούμε ένα connection pool στη MySQL
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: 'τελεία', database: 'yourDB',
  waitForConnections: true, connectionLimit: 10, queueLimit: 0
});


// Authentication middleware
function isAuthenticated(req, res, next) {
  const roleUrlMap = {
    admin: "/private/admin",
    student: "/private/student"
  };

  if (req.session.user) {
    const role = req.session.user.role;
    const url = req.originalUrl;
    if (roleUrlMap[role] && url.startsWith(roleUrlMap[role])) return next();
    else res.redirect(roleUrlMap[role] ? `${roleUrlMap[role]}/${role}.html` : "/");
  } else {
    res.redirect("/");
  }
}

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const roles = [
    { table: "admins", role: "admin", redirect: "/private/admin.html" },
    { table: "students", role: "student", redirect: "/private/student.html" }
  ];

  const checkCredentials = (index) => {
    if (index >= roles.length) {
      res.status(401).json({ message: "Λανθασμένο username ή Κωδικός" });
      return;
    }

    const { table, role, redirect } = roles[index];
    db.query(
      `SELECT *, ${role}_am FROM ${table} WHERE ${role}_username = ? AND ${role}_password = ?`,
      [username, password],
      (err, results) => {
        if (err) {
          console.error("Error executing query:", err);
          res.status(500).json({ message: "Internal Server Error" });
          return;
        }
        if (results.length > 0) {
          req.session.user = {
            username,
            role,
            am: results[0][`${role}_am`]
          };
          console.log(` User ${username} logged in as ${role}`);
          res.json({ redirect });
        } else {
          checkCredentials(index + 1);
        }
      }
    );
  };

  checkCredentials(0);
});

// ----------------------
// SIGN UP (ΜΟΝΟ STUDENT)
// ----------------------
app.post("/signup", (req, res) => {
  const {
    student_am,
    username,
    password,
    student_number,
    first_name,
    last_name,
    email
  } = req.body;

  if (!student_am || !username || !password || !student_number || !first_name || !last_name || !email) {
    return res.status(400).json({ message: "Συμπλήρωσε όλα τα πεδία!" });
  }

  // Έλεγχος αν υπάρχει ήδη ο χρήστης
  db.query(
    "SELECT * FROM students WHERE student_username = ? OR student_email = ? OR student_number = ?",
    [username, email, student_number],
    (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err);
        return res.status(500).json({ message: "Σφάλμα συστήματος" });
      }

      if (results.length > 0) {
        return res.status(400).json({ message: "Ο χρήστης / email / αριθμός μητρώου υπάρχει ήδη!" });
      }

      // Εισαγωγή νέου student
      db.query(
        `INSERT INTO students 
        (student_am, student_username, student_password, student_number, student_first_name, student_last_name, student_email, role_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, 2)`,
        [student_am, username, password, student_number, first_name, last_name, email],
        (err) => {
          if (err) {
            console.error("Error inserting student:", err);
            return res.status(500).json({ message: "Αποτυχία δημιουργίας λογαριασμού" });
          }

          res.json({ message: "Ο λογαριασμός δημιουργήθηκε!", redirect: "/" });
        }
      );
    }
  );
});


// Logout
app.post("/logout", (req, res) => {
  if (req.session.user) console.log(` ${req.session.user.username} logged out`);
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    res.json({ message: "Logout successful", redirect: "/" });
  });
});


// ΕΝ: Κράτηση δωματίου
app.post('/reserve', (req, res) => {
    const roomId = req.body.room_id;
    const studentAm = req.session.student_am;
    if (!req.session.student_loggedin || !studentAm) {
        return res.status(401).send('Δεν είστε συνδεδεμένος φοιτητής');
    }
    // Προσθήκη εγγραφής στην reservations
    connection.query(
        'INSERT INTO reservations (room_id, student_am) VALUES (?, ?)',
        [roomId, studentAm],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Σφάλμα κράτησης');
            }
            // Ενημέρωση του δωμάτιου
            connection.query(
                'UPDATE rooms SET occupied = occupied + 1 WHERE id = ?',
                [roomId],
                (err2) => {
                    if (err2) console.error(err2);
                    // Επιστρέφουμε το ID της νέας κράτησης
                    res.json({ reservationId: result.insertId });
                }
            );
        }
    );
});

// GET /rooms: Επιστρέφει διαθέσιμα δωμάτια (occupied < capacity)
app.get('/rooms', async (req, res) => {
  try {
    // Επιλογή δωματίων που δεν είναι πλήρως κατειλημμένα
    const [rows] = await pool.query(
      'SELECT id, room_number, capacity, occupied FROM rooms WHERE occupied < capacity'
    );
    // Στέλνουμε πίσω JSON με τη λίστα
    res.json(rows);
  } catch (err) {
    console.error('SQL σφάλμα GET /rooms:', err);
    res.status(500).send('Λάθος διακομιστή');
  }
});

// POST /reserve: Κράτηση για το δωμάτιο (requires session student_am)
app.post('/reserve', async (req, res) => {
  const studentAm = req.session.student_am; // π.χ. αποθηκευμένο στο login
  const { room_id } = req.body;
  if (!studentAm) {
    return res.status(401).send('Μη εξουσιοδοτημένη πρόσβαση');
  }

  try {
    // Εισαγωγή κράτησης
    await pool.query(
      'INSERT INTO reservations (room_id, student_am) VALUES (?, ?)',
      [room_id, studentAm]
    );
    // Ενημέρωση πληρότητας δωματίου
    await pool.query(
      'UPDATE rooms SET occupied = occupied + 1 WHERE id = ?',
      [room_id]
    );
    res.send('Κράτηση αποθηκεύτηκε');
  } catch (err) {
    console.error('SQL σφάλμα POST /reserve:', err);
    res.status(500).send('Λάθος διακομιστή');
  }
});


// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/private/admin.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "private", "admin.html"));
});

app.get("/private/student.html", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "private", "student.html"));
});


app.get("/signup.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signup.html"));
});


app.listen(3000, '0.0.0.0', () => {
    console.log('Server is listening on http://localhost:3000');
});
