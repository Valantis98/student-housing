const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Session setup
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));
// Δημιουργία σύνδεσης με τη βάση
const db = mysql.createConnection({
  host: "localhost",
  user: "root",      // ο default user του XAMPP
  password: "",      // άδειο αν δεν έχεις βάλει κωδικό
  database: "student_housing"
});

// Έλεγχος σύνδεσης
db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database!");
  }
});

// Απλή δοκιμαστική διαδρομή
app.get("/", (req, res) => {
  res.send("Server is running!");
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Middleware for authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  } else {
    res.redirect("/login.html");
  }
}

// LOGIN route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const roles = [
    { table: "admin", role: "admin", redirect: "/admin.html" },
    { table: "students", role: "student", redirect: "/student.html" }
  ];

  const checkCredentials = (index) => {
    if (index >= roles.length) {
      return res.status(401).json({ message: "❌ Invalid username or password" });
    }

    const { table, role, redirect } = roles[index];
    db.query(`SELECT * FROM ${table} WHERE username = ? AND password = ?`, [username, password], (err, results) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        req.session.user = { username, role };
        console.log(`✅ ${role} '${username}' logged in`);
        return res.json({ redirect });
      } else {
        checkCredentials(index + 1);
      }
    });
  };

  checkCredentials(0);
});

// Logout route
app.post("/logout", (req, res) => {
  if (req.session.user) {
    console.log(`👋 ${req.session.user.username} logged out`);
  }
  req.session.destroy(() => {
    res.json({ message: "Logged out", redirect: "/login.html" });
  });
});

// Protect routes
app.get("/admin.html", isAuthenticated, (req, res, next) => {
  if (req.session.user.role !== "admin") return res.redirect("/student.html");
  next();
});

app.get("/student.html", isAuthenticated, (req, res, next) => {
  if (req.session.user.role !== "student") return res.redirect("/admin.html");
  next();
});


// Εκκίνηση server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
