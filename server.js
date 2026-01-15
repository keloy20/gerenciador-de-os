require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ====================
// MIDDLEWARES
// ====================
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ====================
// ROTAS
// ====================
app.use("/auth", require("./src/routes/authRoutes"));
app.use("/projects", require("./src/routes/projectRoutes"));
app.use("/clientes", require("./src/routes/clientesRoutes"));
app.use("/tecnicos", require("./src/routes/tecnicosRoutes")); // 👈 ESSA LINHA É NOVA

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
