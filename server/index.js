const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 3000;
const SECRET = "supersegreto"; // cambia in produzione!

app.use(cors());
app.use(bodyParser.json());

let users = []; // { username, password, points }
let leaderboard = [];

// Registrazione
app.post("/api/register", (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Username già esistente" });
  }
  users.push({ username, password, points: 0 });
  res.json({ success: true });
});

// Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Credenziali non valide" });

  const token = jwt.sign({ username }, SECRET, { expiresIn: "2h" });
  res.json({ success: true, token, points: user.points });
});

// Middleware autenticazione
function auth(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Token mancante" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded.username;
    next();
  } catch {
    res.status(403).json({ error: "Token non valido" });
  }
}

// Salvataggio punteggio
app.post("/api/score", auth, (req, res) => {
  const { points } = req.body;
  const user = users.find(u => u.username === req.user);
  if (user) {
    user.points = Math.max(user.points, points);
    leaderboard = [...users].sort((a, b) => b.points - a.points);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Utente non trovato" });
  }
});

// Leaderboard
app.get("/api/leaderboard", (req, res) => {
  res.json(leaderboard.map(u => ({ username: u.username, points: u.points })));
});

app.listen(PORT, () => console.log(`✅ Server avviato su http://localhost:${PORT}`));
