require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const clientesRoutes = require("./src/routes/clientesRoutes");

const app = express();

/* =====================================================
   CORS – DEFINITIVO (Render + Vercel + Local)
===================================================== */
const allowedOrigins = [
  "http://localhost:3000",
  "https://nova-versao-pink.vercel.app",
  "https://nova-versao-coral.vercel.app",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

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
   ROTA DE TESTE
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
