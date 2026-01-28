require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const clientesRoutes = require("./src/routes/clientesRoutes");

const app = express();

/* =====================================================
   CORS — SIMPLES E FUNCIONAL (SEM CREDENTIALS)
===================================================== */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

/* =====================================================
   BODY PARSER
===================================================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =====================================================
   ROTAS
===================================================== */
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/clientes", clientesRoutes);

/* =====================================================
   TESTE
===================================================== */
app.get("/ping", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

/* =====================================================
   MONGO
===================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo conectado"))
  .catch((err) => console.error("❌ Erro Mongo:", err));

/* =====================================================
   START
===================================================== */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
