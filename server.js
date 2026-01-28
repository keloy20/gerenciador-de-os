require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =====================================================
   CORS — DEFINITIVO (FUNCIONA COM VERCEL, MOBILE, ETC)
===================================================== */
app.use(
  cors({
    origin: true, // reflete a origin automaticamente
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// garante preflight
app.options("*", cors());

/* =====================================================
   BODY PARSER
===================================================== */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* =====================================================
   ROTAS
===================================================== */
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/projects", require("./src/routes/projectRoutes"));
app.use("/clientes", require("./src/routes/clientesRoutes"));

/* =====================================================
   TESTE
===================================================== */
app.get("/ping", (req, res) => {
  res.json({ ok: true });
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
  console.log("🚀 Backend rodando na porta", PORT);
});
