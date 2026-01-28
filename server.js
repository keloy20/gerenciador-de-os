require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { iniciarWhatsapp } = require("./src/services/whatsapp");


const app = express();

// ====================
// MIDDLEWARES
// ====================
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// 🔥 ESSENCIAL PARA PREFLIGHT
app.options("*", cors());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ====================
// ROTAS  ✅ CAMINHO CERTO
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
const PORT = 3001;


app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
  iniciarWhatsapp(); // 🔥 gera QR Code
});
