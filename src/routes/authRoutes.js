const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const auth = require("../middlewares/auth");

// ===============================
// LOGIN
// ===============================
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
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      nome: user.nome
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no login" });
  }
});

// ===============================
// CADASTRAR TÉCNICO (ADMIN)
// ===============================
router.post("/register-tecnico", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode cadastrar técnico" });
  }

  const { nome, email, senha, telefone } = req.body;

  try {
    const existe = await User.findOne({ email });

    if (existe) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    const hash = await bcrypt.hash(senha, 10);

    const user = await User.create({
      nome,
      email,
      senha: hash,
      telefone,
      role: "tecnico"
    });

    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar técnico" });
  }
});

// ===============================
// LISTAR TÉCNICOS (ADMIN)
// ===============================
router.get("/tecnicos", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const tecnicos = await User.find({ role: "tecnico" })
      .select("_id nome email telefone");

    res.json(tecnicos);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar técnicos" });
  }
});

module.exports = router;
