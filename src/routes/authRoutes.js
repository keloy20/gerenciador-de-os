const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Project = require("../models/Project");
const auth = require("../middlewares/auth");

// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Usuário não encontrado" });
    }

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) {
      return res.status(400).json({ error: "Senha incorreta" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET não definido");
      return res.status(500).json({ error: "Erro interno de autenticação" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
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
    return res.status(500).json({ error: "Erro no login" });
  }
});

// ===============================
// LISTAR TÉCNICOS (ADMIN)
// ===============================
router.get("/tecnicos", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const tecnicos = await User.find({ role: "tecnico" }).select("-senha");
    return res.json(tecnicos);
  } catch (err) {
    console.error("Erro ao buscar técnicos:", err);
    return res.status(500).json({ error: "Erro ao buscar técnicos" });
  }
});

// =====================
// CRIAR TÉCNICO (ADMIN)
// =====================
router.post("/register", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode criar técnico" });
    }

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const novo = await User.create({
      nome,
      email,
      senha: hash,
      role: "tecnico",
    });

    return res.json({
      _id: novo._id,
      nome: novo.nome,
      email: novo.email,
      role: novo.role,
    });
  } catch (err) {
    console.error("ERRO AO CRIAR TÉCNICO:", err);
    return res.status(500).json({ error: "Erro ao criar técnico" });
  }
});

// =====================
// EXCLUIR TÉCNICO (ADMIN)
// =====================
router.delete("/tecnicos/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode excluir técnico" });
    }

    const tecnicoId = req.params.id;

    // Desvincula OS antes de excluir
    await Project.updateMany(
      { tecnico: tecnicoId },
      { $set: { tecnico: null, status: "aguardando_tecnico" } }
    );

    await User.findByIdAndDelete(tecnicoId);

    return res.json({ message: "Técnico excluído com sucesso" });
  } catch (err) {
    console.error("ERRO AO EXCLUIR TÉCNICO:", err);
    return res.status(500).json({ error: "Erro ao excluir técnico" });
  }
});

module.exports = router;
