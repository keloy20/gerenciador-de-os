require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
app.use("/test", require("./src/routes/pingRoutes"));


const app = express();

// ====================
// CORS (OBRIGATÓRIO)
// ====================
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// RESPONDE PREFLIGHT
app.options("*", cors());

// ====================
// MIDDLEWARES
// ====================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ====================
// ROTAS
// ====================
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/projects", require("./src/routes/projectRoutes"));
app.use("/clientes", require("./src/routes/clientesRoutes"));

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
