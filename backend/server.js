
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const users = require("./users");
const path = require("path");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.post("/register", (req, res) => {
  const { username, password, isAdmin } = req.body;
  const result = users.register(username, password, isAdmin);
  res.status(result.error ? 400 : 200).json(result);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const result = users.login(username, password);
  res.status(result.error ? 401 : 200).json(result);
});

const players = {};

io.on("connection", (socket) => {
  console.log("Conectado:", socket.id);

  socket.on("join", ({ username }) => {
    const isAdmin = users.isAdmin(username);
    players[socket.id] = { username, isAdmin, x: 0, y: 0 };
    io.emit("players", players);
  });

  socket.on("move", (dir) => {
    const p = players[socket.id];
    if (!p) return;
    if (dir === "up") p.y -= 5;
    if (dir === "down") p.y += 5;
    if (dir === "left") p.x -= 5;
    if (dir === "right") p.x += 5;
    io.emit("players", players);
  });

  socket.on("admin_command", (cmd) => {
    const p = players[socket.id];
    if (!p?.isAdmin) return;
    if (cmd.startsWith("/kick ")) {
      const target = Object.entries(players).find(([_, pl]) => pl.username === cmd.split(" ")[1]);
      if (target) {
        io.to(target[0]).emit("kicked");
        io.sockets.sockets.get(target[0]).disconnect();
      }
    }
  });

  socket.on("disconnect", () => {
    delete players[socket.id];
    io.emit("players", players);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Servidor online:", PORT));
