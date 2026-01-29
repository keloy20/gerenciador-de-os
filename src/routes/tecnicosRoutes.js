const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");

// ===============================
// LISTAR TÉCNICOS (ADMIN)
// URL FINAL: /auth/tecnicos
// ===============================
router.get("/auth/tecnicos", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const tecnicos = await User.find({ role: "tecnico" })
      .select("_id nome email telefone")
      .lean();

    res.json(tecnicos);
  } catch (err) {
    console.error("ERRO TECNICOS:", err);
    res.status(500).json({ error: "Erro ao listar técnicos" });
  }
});

module.exports = router;
