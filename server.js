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
      // libera Postman, mobile, SSR
      if (!origin) return callback(null, true);

      // libera qualquer domínio Vercel
      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      // libera localhost
      if (origin.startsWith("http://localhost")) {
        return callback(null, true);
      }

      // libera tudo (seguro para API)
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// preflight
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
app.use(require("./src/routes/tecnicosRoutes")); // 🔥 ADMIN / TECNICOS

/* =====================================================
   HEALTH CHECK
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
   START (RENDER)
===================================================== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
