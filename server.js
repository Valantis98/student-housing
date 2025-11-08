const express = require("express");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const MySQLStore = require("express-mysql-session")(session);


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve static files with caching headers
app.use('/public', express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.endsWith('.css') || path.endsWith('.js')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        } else if (path.endsWith('.jpg') || path.endsWith('.png')) {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
        }
    }
}));

// Δημιουργία σύνδεσης με τη βάση
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
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

// Configure session 
const sessionStore = new MySQLStore({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_housing'
});
// Session setup
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false,
  store: sessionStore
  
}));


// Middleware για authentication
function isAuthenticated(req, res, next) {
  const roleUrlMap = {
    admin: "/private/admin",
    student: "/private/student",
  };

  if (req.session.user) {
    const role = req.session.user.role;
    const url = req.originalUrl;
    if (roleUrlMap[role] && url.startsWith(roleUrlMap[role])) {
      return next();
    } else {
      res.redirect(roleUrlMap[role] ? `${roleUrlMap[role]}/${role}.html` : "/");
    }
  } else {
    res.redirect("/");
  }
}

// ✅ Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const roles = [
    { table: "admins", role: "admin", redirect: "/admin/admin.html" },
    { table: "students", role: "student", redirect: "/student/student.html" }
  ];

  const checkCredentials = (index) => {
        if (index >= roles.length) {
            res.status(401).json({ message: 'Λανθασμένο username ή Κωδικός' });
            return;
        }

        const { table, role, redirect } = roles[index];
        db.query(`SELECT *, ${role}_am FROM ${table} WHERE ${role.toLowerCase()}_username = ? AND ${role.toLowerCase()}_password = ?`, [username, password], (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ message: 'Internal Server Error' });
                return;
            }
            if (results.length > 0) {
                req.session.user = { username: username, role: role, am: results[0][`${role.toLowerCase()}_am`] };
                console.log(`User ${username} logged in with role ${role} and session ID: ${req.sessionID} and session am: ${req.session.user.am}`);
                res.json({ redirect });
            } else {
                checkCredentials(index + 1);
            }
        });
    };

    checkCredentials(0);
});
  

// ✅ Logout route
app.post("/logout", (req, res) => {
  if (req.session.user) {
    console.log(`👋 ${req.session.user.username} logged out`);
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      res.status(500).json({ message: "Internal Server Error" });
      return;
    }
    res.json({ message: "Logout successful", redirect: "/" });
  });
});


// Route handler for the main page
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'public/login.html');
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading login_page.html:', err);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        console.log(filePath);
        res.end(data);
    });
});

// Dynamic route handler for the private/teacher directory
app.get('/private/admin/:filename', isAuthenticated, (req, res) => {
    const filePath = path.join(__dirname, 'private/admin', req.params.filename);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(`Error reading ${req.params.filename}:`, err);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        console.log(req.params.filename);
        console.log(filePath);
        res.end(data);
    });
});

// Dynamic route handler for the private/student directory
app.get('/private/student/:filename', isAuthenticated, (req, res) => {
    const filePath = path.join(__dirname, 'private/student', req.params.filename);
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(`Error reading ${req.params.filename}:`, err);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, {'Content-Type': 'text/html'});
        console.log(req.params.filename);
        console.log(filePath);
        res.end(data);
    });
});


// ✅ Εκκίνηση server
app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});

