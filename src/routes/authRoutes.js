const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const ok = await bcrypt.compare(senha, user.senha);

    if (!ok) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      nome: user.nome,
    });

  } catch (err) {
    console.error("ERRO LOGIN:", err);
    res.status(500).json({ error: "Erro no login" });
  }
});

// =====================
// REGISTRAR USUÁRIO (ADMIN)
// =====================
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const user = await User.create({
      nome,
      email,
      senha: hash,
      role: role || "tecnico",
    });

    res.json(user);

  } catch (err) {
    console.error("ERRO REGISTER:", err);
    res.status(500).json({ error: "Erro ao registrar usuário" });
  }
});

module.exports = router;

