const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");

// ===============================
// LISTAR TÉCNICOS (ADMIN)
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode ver técnicos" });
    }

    const tecnicos = await User.find({ role: "tecnico" }).select("-senha");
    res.json(tecnicos);

  } catch (err) {
    console.error("Erro ao buscar técnicos:", err);
    res.status(500).json({ error: "Erro ao buscar técnicos" });
  }
});

module.exports = router;
