const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// "Database" in memoria
let users = {};
let leaderboard = [];

// 👋 Rotta principale per test (Render la mostra quando apri /)
app.get("/", (req, res) => {
  res.send("✅ Server del gioco online attivo e funzionante!");
});

// Registrazione
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users[username]) {
    return res.status(400).json({ message: "Username già esistente" });
  }
  users[username] = { password, score: 0 };
  leaderboard.push({ username, score: 0 });
  res.json({ message: "Registrazione completata" });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(400).json({ message: "Credenziali non valide" });
  }
  res.json({ message: "Login ok", score: user.score });
});

// Aggiorna punteggio
app.post("/score", (req, res) => {
  const { username, score } = req.body;
  if (!users[username]) {
    return res.status(400).json({ message: "Utente non trovato" });
  }
  users[username].score = score;

  // Aggiorna classifica
  leaderboard = leaderboard.map((u) =>
    u.username === username ? { username, score } : u
  );
  leaderboard.sort((a, b) => b.score - a.score);

  res.json({ message: "Punteggio aggiornato" });
});

// Ottieni classifica
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

// Porta automatica per Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server attivo su porta ${PORT}`);
});




