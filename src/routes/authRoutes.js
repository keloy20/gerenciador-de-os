const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Project = require("../models/Project"); // <<< ADICIONADO
const auth = require("../middlewares/auth");

// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(400).json({ error: "Senha incorreta" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      nome: user.nome
    });

  } catch (err) {
    console.error("ERRO LOGIN:", err);
    res.status(500).json({ error: "Erro no login" });
  }
});

// =====================
// LISTAR TÉCNICOS (ADMIN)
// =====================
router.get("/tecnicos", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const tecnicos = await User.find({ role: "tecnico" }).select("_id nome email");
    res.json(tecnicos);
  } catch (err) {
    console.error("ERRO AO BUSCAR TÉCNICOS:", err);
    res.status(500).json({ error: "Erro ao buscar técnicos" });
  }
});

// ===============================
// EXCLUIR TÉCNICO (ADMIN) – CORRIGIDO
// ===============================
router.delete("/tecnicos/:id", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode excluir técnico" });
  }

  try {
    const tecnico = await User.findById(req.params.id);

    if (!tecnico) {
      return res.status(404).json({ error: "Técnico não encontrado" });
    }

    // 🔥 PASSO 1 – Desvincula o técnico das OS
    await Project.updateMany(
      { tecnico: req.params.id },
      { $set: { tecnico: null, status: "aguardando_tecnico" } }
    );

    // 🔥 PASSO 2 – Exclui o técnico
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Técnico excluído com sucesso" });

  } catch (err) {
    console.error("Erro ao excluir técnico:", err);
    res.status(500).json({ error: "Erro ao excluir técnico" });
  }
});

module.exports = router;
