
const socket = io();
let username = "";
let isAdmin = false;

function login() {
  username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) return alert(data.error);
    isAdmin = data.user.isAdmin;
    socket.emit("join", { username });
    document.getElementById("gameCanvas").style.display = "block";
  });
}

document.getElementById("cmd").addEventListener("keydown", e => {
  if (e.key === "Enter" && isAdmin) {
    socket.emit("admin_command", e.target.value);
    e.target.value = "";
  }
});

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let players = {};

document.addEventListener("keydown", e => {
  const keyMap = { "ArrowUp": "up", "ArrowDown": "down", "ArrowLeft": "left", "ArrowRight": "right" };
  if (keyMap[e.key]) socket.emit("move", keyMap[e.key]);
});

socket.on("players", data => {
  players = data;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = p.isAdmin ? "red" : "blue";
    ctx.fillRect(p.x, p.y, 20, 20);
    ctx.fillStyle = "black";
    ctx.fillText(p.username, p.x, p.y - 5);
  }
});

socket.on("kicked", () => {
  alert("Você foi expulso pelo admin.");
  location.reload();
});
