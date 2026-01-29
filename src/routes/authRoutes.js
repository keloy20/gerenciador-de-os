const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

/* ===========================
   REGISTER (CRIAR USUÁRIO / TÉCNICO)
=========================== */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, telefone, role } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Dados obrigatórios faltando" });
    }

    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: "Usuário já existe" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = new User({
      nome,
      email,
      senha: senhaHash,
      telefone: telefone || "",
      role: role || "tecnico",
    });

    await novoUsuario.save();

    res.status(201).json({
      _id: novoUsuario._id,
      nome: novoUsuario.nome,
      email: novoUsuario.email,
      telefone: novoUsuario.telefone,
      role: novoUsuario.role,
    });
  } catch (err) {
    console.error("ERRO REGISTER:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

/* ===========================
   LOGIN
=========================== */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const senhaOk = await bcrypt.compare(senha, user.senha);
    if (!senhaOk) {
      return res.status(400).json({ error: "Dados inválidos" });
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
    res.status(500).json({ error: "Erro interno" });
  }
});

module.exports = router;
