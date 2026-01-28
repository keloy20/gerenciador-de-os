const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* =====================================================
   PRE-FLIGHT (CORS LOGIN)  🔥 ESSENCIAL
===================================================== */
router.options("*", (req, res) => {
  res.sendStatus(200);
});

/* =====================================================
   LOGIN
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { username, senha } = req.body;

    if (!username || !senha) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      role: user.role,
      nome: user.nome,
    });
  } catch (err) {
    console.error("ERRO LOGIN:", err);
    return res.status(500).json({ error: "Erro interno no login" });
  }
});

/* =====================================================
   LISTAR TÉCNICOS (ADMIN)
===================================================== */
router.get("/tecnicos", async (req, res) => {
  try {
    const tecnicos = await User.find({ role: "tecnico" }).select(
      "nome email role"
    );
    res.json(tecnicos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar técnicos" });
  }
});

/* =====================================================
   EXCLUIR TÉCNICO (ADMIN)
===================================================== */
router.delete("/tecnicos/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Técnico excluído" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir técnico" });
  }
});

module.exports = router;
