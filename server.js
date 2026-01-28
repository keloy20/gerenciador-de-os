require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/* =====================================================
   CORS  (ÚNICO E CORRETO)
===================================================== */
app.use(
  cors({
    origin: true, // permite Vercel, localhost, Postman, etc
    credentials: true,
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
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/projects", require("./src/routes/projectRoutes"));
app.use("/clientes", require("./src/routes/clientesRoutes"));

/* =====================================================
   ROTA TESTE (DEBUG)
===================================================== */
app.get("/ping", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

/* =====================================================
   MONGO
===================================================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Erro MongoDB:", err));

/* =====================================================
   START
===================================================== */
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("🚀 Servidor rodando na porta", PORT);
});
