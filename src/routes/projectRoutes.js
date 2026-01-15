const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

// ===============================
// ADMIN - LISTAR TODAS OS
// ===============================
router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const projetos = await Project.find()
      .populate("tecnico", "nome email")
      .sort({ createdAt: -1 });

    res.json(projetos);
  } catch (err) {
    console.error("ERRO AO BUSCAR OS:", err);
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// ===============================
// ADMIN - VER OS POR ID
// ===============================
router.get("/admin/view/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const projeto = await Project.findById(req.params.id).populate("tecnico", "nome email");

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    res.json(projeto);
  } catch (err) {
    console.error("ERRO VIEW ADMIN:", err);
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// ===============================
// TÉCNICO - LISTAR SUAS OS
// ===============================
router.get("/tecnico/my", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projetos = await Project.find({ tecnico: req.userId });
    res.json(projetos);
  } catch (err) {
    console.error("ERRO MY OS:", err);
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// ===============================
// TÉCNICO - VER OS POR ID
// ===============================
router.get("/tecnico/view/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId,
    });

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    res.json(projeto);
  } catch (err) {
    console.error("ERRO VIEW TECNICO:", err);
    res.status(500).json({ error: "Erro ao buscar OS" });
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

    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId,
    });

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.status = "em_andamento";
    await projeto.save();

    res.json({ message: "Chamado iniciado" });
  } catch (err) {
    console.error("ERRO ABRIR:", err);
    res.status(500).json({ error: "Erro ao abrir chamado" });
  }
});

// ===============================
// TÉCNICO - SALVAR ANTES (COM FOTO)
// ===============================
router.put("/tecnico/antes/:id", auth, upload.array("fotos"), async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId,
    });

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.antes = {
      relatorio: req.body.relatorio || "",
      observacao: req.body.observacao || "",
      fotos: req.files?.map((f) => ({
        nome: f.originalname,
        tipo: f.mimetype,
        base64: f.buffer.toString("base64"),
      })) || [],
    };

    projeto.status = "em_andamento";

    await projeto.save();

    res.json({ message: "ANTES salvo com sucesso" });
  } catch (err) {
    console.error("ERRO ANTES:", err);
    res.status(500).json({ error: "Erro ao salvar ANTES" });
  }
});

// ===============================
// TÉCNICO - SALVAR DEPOIS (COM FOTO)
// ===============================
router.put("/tecnico/depois/:id", auth, upload.array("fotos"), async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId,
    });

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.depois = {
      relatorio: req.body.relatorio || "",
      observacao: req.body.observacao || "",
      fotos: req.files?.map((f) => ({
        nome: f.originalname,
        tipo: f.mimetype,
        base64: f.buffer.toString("base64"),
      })) || [],
    };

    projeto.status = "concluido";

    await projeto.save();

    res.json({ message: "DEPOIS salvo com sucesso" });
  } catch (err) {
    console.error("ERRO DEPOIS:", err);
    res.status(500).json({ error: "Erro ao salvar DEPOIS" });
  }
});

module.exports = router;
