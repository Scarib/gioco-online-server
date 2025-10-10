const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// simuliamo un "database" in memoria
let users = {};
let leaderboard = [];

// rotta di test (homepage)
app.get("/", (req, res) => {
  res.send("Il server è attivo 🚀");
});

// registrazione
app.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (users[username]) {
    return res.status(400).json({ message: "Username già esistente" });
  }
  users[username] = { password, score: 0 };
  leaderboard.push({ username, score: 0 });
  res.json({ message: "Registrazione completata" });
});

// login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(400).json({ message: "Credenziali non valide" });
  }
  res.json({ message: "Login ok", score: user.score });
});

// aggiorna punteggio
app.post("/score", (req, res) => {
  const { username, score } = req.body;
  if (!users[username]) {
    return res.status(400).json({ message: "Utente non trovato" });
  }
  users[username].score = score;

  // aggiorna classifica
  leaderboard = leaderboard.map((u) =>
    u.username === username ? { username, score } : u
  );
  leaderboard.sort((a, b) => b.score - a.score);

  res.json({ message: "Punteggio aggiornato" });
});

// ottieni classifica
app.get("/leaderboard", (req, res) => {
  res.json(leaderboard);
});

// porta automatica (necessaria per Render)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server attivo su porta ${PORT}`);
});
