const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

/* =====================================================
   ADMIN
===================================================== */

// LISTAR TODAS AS OS
router.get("/admin/all", auth, async (req, res) => {
  try {
    console.log("ADMIN ALL HIT");
    console.log("USER ID:", req.userId);
    console.log("USER ROLE:", req.userRole);

    const projetos = await Project.find().limit(5);

    res.json(projetos);
  } catch (err) {
    console.error("ERRO ADMIN ALL:", err);
    res.status(500).json({
      error: "Erro ao buscar OS",
      detalhe: err.message,
      stack: err.stack,
    });
  }
});

// CRIAR OS
router.post("/admin/create", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const total = await Project.countDocuments();
    const ano = new Date().getFullYear();

    const projeto = await Project.create({
      ...req.body,
      tecnico: req.body.tecnicoId || null,
      status: "aguardando_tecnico",
      osNumero: `${String(total + 1).padStart(4, "0")}-${ano}`,
    });

    res.json(projeto);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar OS" });
  }
});

// VER OS (ADMIN)
router.get("/admin/view/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const projeto = await Project.findById(req.params.id).populate(
      "tecnico",
      "nome email"
    );

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    res.json(projeto);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// CANCELAR OS
router.put("/admin/cancelar/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const projeto = await Project.findById(req.params.id);
    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.status = "cancelado";
    await projeto.save();

    res.json({ message: "OS cancelada" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao cancelar OS" });
  }
});

// EDITAR OS
router.put("/admin/update/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const projeto = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    res.json(projeto);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar OS" });
  }
});

/* =====================================================
   TÉCNICO
===================================================== */

// LISTAR OS DO TÉCNICO
router.get("/tecnico/my", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projetos = await Project.find({ tecnico: req.userId }).sort({
      createdAt: -1,
    });

    res.json(projetos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// VER OS (TÉCNICO) — REGRA CORRETA
router.get("/tecnico/view/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findById(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    if (
      projeto.tecnico &&
      String(projeto.tecnico) !== String(req.userId)
    ) {
      return res.status(403).json({ error: "OS não pertence a você" });
    }

    res.json(projeto);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// SALVAR ANTES (ASSUME A OS)
router.put(
  "/tecnico/antes/:id",
  auth,
  upload.array("fotos"),
  async (req, res) => {
    try {
      if (req.userRole !== "tecnico") {
        return res.status(403).json({ error: "Apenas técnico" });
      }

      const projeto = await Project.findById(req.params.id);
      if (!projeto) {
        return res.status(404).json({ error: "OS não encontrada" });
      }

      if (!projeto.tecnico) {
        projeto.tecnico = req.userId;
      }

      if (String(projeto.tecnico) !== String(req.userId)) {
        return res.status(403).json({ error: "OS não pertence a você" });
      }

      projeto.antes = {
        relatorio: req.body.relatorio || "",
        observacao: req.body.observacao || "",
        fotos: req.files?.map((f) => f.buffer.toString("base64")) || [],
      };

      projeto.status = "em_andamento";
      await projeto.save();

      res.json({ message: "ANTES salvo" });
    } catch (err) {
      res.status(500).json({ error: "Erro ao salvar ANTES" });
    }
  }
);

// SALVAR DEPOIS
router.put(
  "/tecnico/depois/:id",
  auth,
  upload.array("fotos"),
  async (req, res) => {
    try {
      if (req.userRole !== "tecnico") {
        return res.status(403).json({ error: "Apenas técnico" });
      }

      const projeto = await Project.findById(req.params.id);
      if (!projeto) {
        return res.status(404).json({ error: "OS não encontrada" });
      }

      if (String(projeto.tecnico) !== String(req.userId)) {
        return res.status(403).json({ error: "OS não pertence a você" });
      }

      projeto.depois = {
        relatorio: req.body.relatorio || "",
        observacao: req.body.observacao || "",
        fotos: req.files?.map((f) => f.buffer.toString("base64")) || [],
      };

      projeto.status = "concluido";
      await projeto.save();

      res.json({ message: "DEPOIS salvo" });
    } catch (err) {
      res.status(500).json({ error: "Erro ao salvar DEPOIS" });
    }
  }
);

// ===============================
// ADMIN - RESETAR OS PROBLEMÁTICA
// ===============================
router.put("/admin/fix-os/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const projeto = await Project.findById(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.tecnico = null;
    projeto.status = "aguardando_tecnico";

    await projeto.save();

    res.json({
      message: "OS resetada com sucesso",
      projeto,
    });
  } catch (err) {
    console.error("ERRO FIX OS:", err);
    res.status(500).json({ error: "Erro ao corrigir OS" });
  }
});

// ===============================
// TÉCNICO - ABRIR CHAMADO
// ===============================
router.put("/tecnico/abrir/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findById(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    // 🔹 se ainda não tiver técnico, vincula
    if (!projeto.tecnico) {
      projeto.tecnico = req.userId;
    }

    // 🔹 segurança
    if (String(projeto.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "OS não pertence a você" });
    }

    // 🔹 muda status
    projeto.status = "em_andamento";
    await projeto.save();

    res.json({
      message: "Chamado iniciado",
      projeto,
    });
  } catch (err) {
    console.error("ERRO ABRIR CHAMADO:", err);
    res.status(500).json({ error: "Erro ao abrir chamado" });
  }
});




module.exports = router;
