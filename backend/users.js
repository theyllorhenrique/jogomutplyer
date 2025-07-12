
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const usersFile = path.join(__dirname, "data", "users.json");

function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, "utf-8");
  return JSON.parse(data);
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

function register(username, password, isAdmin = false) {
  const users = loadUsers();
  const exists = users.find((u) => u.username === username);
  if (exists) return { error: "Usuário já existe" };

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { username, password: hashedPassword, isAdmin };
  users.push(newUser);
  saveUsers(users);
  return { message: "Usuário registrado com sucesso", user: newUser };
}

function login(username, password) {
  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return { error: "Usuário não encontrado" };

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return { error: "Senha incorreta" };

  return { message: "Login bem-sucedido", user };
}

function isAdmin(username) {
  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  return user?.isAdmin || false;
}

module.exports = { register, login, isAdmin };
