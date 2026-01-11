const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors"); // 👈 IMPORTANTE
require("dotenv").config();

const app = express();

// ==========================
// CORS - LIBERA O NEXT
// ==========================
app.use(cors({
  origin: "*", // libera qualquer origem (localhost, vercel, etc)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// ==========================
// ROTAS
// ==========================
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/projects", require("./src/routes/projectRoutes"));

// ==========================
// MONGO
// ==========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Erro MongoDB:", err));

// ==========================
// START
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
