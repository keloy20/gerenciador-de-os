require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =====================================================
   CORS — DEFINITIVO (RENDER + VERCEL + LOCALHOST)
===================================================== */
app.use(
  cors({
    origin: (origin, callback) => {
      // permite Postman, mobile, SSR, etc
      if (!origin) return callback(null, true);

      // libera qualquer domínio Vercel
      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      // libera localhost
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      return callback(null, true); // 🔥 NÃO BLOQUEIA
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// responde preflight
app.options(/.*/, cors());

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
   HEALTH CHECK (TESTE)
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
   START (PORTA CERTA DO RENDER)
===================================================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
