const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/auth");

// ===============================
// LISTAR TÉCNICOS (ADMIN)
// ===============================
router.get("/auth/tecnicos", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const tecnicos = await User.find({ role: "tecnico" })
      .select("nome email telefone")
      .sort({ nome: 1 });

    res.json(tecnicos);
  } catch (err) {
    console.error("ERRO LISTAR TECNICOS:", err);
    res.status(500).json({ error: "Erro ao listar técnicos" });
  }
});

// ===============================
// BUSCAR TÉCNICO POR ID (ADMIN) 🔥
// ===============================
router.get("/auth/tecnicos/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const tecnico = await User.findById(req.params.id).select(
      "nome email telefone"
    );

    if (!tecnico) {
      return res.status(404).json({ error: "Técnico não encontrado" });
    }

    res.json(tecnico);
  } catch (err) {
    console.error("ERRO BUSCAR TECNICO:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ===============================
// ATUALIZAR TÉCNICO (ADMIN)
// ===============================
router.put("/auth/tecnicos/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const { nome, email, telefone } = req.body;

    const tecnico = await User.findByIdAndUpdate(
      req.params.id,
      { nome, email, telefone },
      { new: true }
    ).select("nome email telefone");

    if (!tecnico) {
      return res.status(404).json({ error: "Técnico não encontrado" });
    }

    res.json(tecnico);
  } catch (err) {
    console.error("ERRO ATUALIZAR TECNICO:", err);
    res.status(500).json({ error: "Erro ao atualizar técnico" });
  }
});

// ===============================
// EXCLUIR TÉCNICO (ADMIN)
// ===============================
router.delete("/auth/tecnicos/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Técnico excluído" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir técnico" });
  }
});

module.exports = router;
