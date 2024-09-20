require("dotenv").config({ path: ".env" });

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

// Set up the Express app
const app = express();
app.use(bodyParser.json());

app.use(express.static("public"));

// Database connection
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST ? process.env.PGHOST : "localhost",
  database: process.env.PGDATABASE,
  password: process.env.PGPWD,
  port: process.env.PGPORT ? process.env.PGPORT : 5432,
});

// console.log("pool:", pool);

// Secret for JWT
const JWT_SECRET = process.env.JWTSECRET;

// Middleware to authenticate JWT tokens
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    else {
      console.log("User is:", user);
      req.user = user;
      next();
    }
  });
}

app.get("/", async (_, res) => {
  res.sendFile("index.html");
});

// Register a new user
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "email already exists" });
  }
});

// Login a user and return a JWT token
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new note for a user
app.post("/notes", authenticateToken, async (req, res) => {
  const { content } = req.body;
  const userId = req.user.userId;

  if (!content) {
    return res.status(400).json({ error: "Note content is required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO notes (user_id, content) VALUES ($1, $2) RETURNING id, content, created_at",
      [userId, content]
    );
    res.status(201).json({ user: req.user, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all notes for a user
app.get("/notes", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      "SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ user: req.user, data: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
