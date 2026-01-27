require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ✅ APP PRIMEIRO
const app = express();

// ====================
// CORS
// ====================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

// ====================
// MIDDLEWARES
// ====================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ====================
// ROTAS (DEPOIS DO APP)
// ====================
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/projects", require("./src/routes/projectRoutes"));
app.use("/clientes", require("./src/routes/clientesRoutes"));
app.use("/test", require("./src/routes/pingRoutes"));

// ====================
// MONGO
// ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Erro MongoDB:", err));

// ====================
// START
// ====================
const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta " + PORT);
});
