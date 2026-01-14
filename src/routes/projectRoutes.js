const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const User = require("../models/User");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");


// ===============================
// LISTAR TODAS OS (ADMIN)
// ===============================
router.get("/admin/all", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
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
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const projeto = await Project.findById(req.params.id).populate("tecnico", "nome email");

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    res.json(projeto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// ===============================
// ADMIN - CRIAR OS
// ===============================
router.post("/admin/create", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode criar OS" });
  }

  try {
    const {
      cliente,
      Subcliente,
      endereco,
      telefone,
      marca,
      unidade,
      tecnicoId,
      detalhamento
    } = req.body;

    if (!cliente) {
      return res.status(400).json({ error: "Cliente é obrigatório" });
    }

    const total = await Project.countDocuments();
    const ano = new Date().getFullYear();
    const osNumero = `${String(total + 1).padStart(4, "0")}-${ano}`;

    const projeto = await Project.create({
      cliente,
      Subcliente,
      endereco,
      telefone,
      marca,
      unidade,
      detalhamento,
      tecnico: tecnicoId || null,
      status: "aguardando_tecnico",
      osNumero
    });

    res.json(projeto);
  } catch (err) {
    console.error("ERRO AO CRIAR OS:", err);
    res.status(500).json({ error: "Erro ao criar OS" });
  }
});

// ===============================
// ADMIN - EDITAR OS
// ===============================
router.put("/admin/update/:id", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode editar OS" });
  }

  try {
    const projeto = await Project.findById(req.params.id);
    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    Object.assign(projeto, req.body);

    if (req.body.tecnicoId !== undefined) {
      projeto.tecnico = req.body.tecnicoId || null;
    }

    await projeto.save();

    res.json({ message: "OS atualizada com sucesso", projeto });
  } catch (err) {
    console.error("ERRO EDITAR OS:", err);
    res.status(500).json({ error: "Erro ao editar OS" });
  }
});

// ===============================
// ADMIN - CANCELAR OS
// ===============================
router.put("/admin/cancelar/:id", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin" });
  }

  try {
    const projeto = await Project.findById(req.params.id);
    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.status = "cancelado";
    await projeto.save();

    res.json({ message: "OS cancelada" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cancelar OS" });
  }
});

// ===============================
// TÉCNICO - LISTAR SUAS OS
// ===============================
router.get("/tecnico/my", auth, async (req, res) => {
  if (req.userRole !== "tecnico") {
    return res.status(403).json({ error: "Apenas técnico" });
  }

  try {
    const projetos = await Project.find({ tecnico: req.userId });
    res.json(projetos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// ===============================
// TÉCNICO - VER OS POR ID
// ===============================
router.get("/tecnico/view/:id", auth, async (req, res) => {
  if (req.userRole !== "tecnico") {
    return res.status(403).json({ error: "Apenas técnico" });
  }

  try {
    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
    });

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    res.json(projeto);
  } catch (err) {
    console.error("ERRO AO BUSCAR OS TÉCNICO:", err);
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

// ===============================
// TÉCNICO - ABRIR CHAMADO
// ===============================
router.put("/tecnico/abrir/:id", auth, async (req, res) => {
  if (req.userRole !== "tecnico") {
    return res.status(403).json({ error: "Apenas técnico" });
  }

  try {
    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
    });

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.status = "em_andamento";
    await projeto.save();

    res.json({ message: "Chamado iniciado", projeto });
  } catch (err) {
    console.error("ERRO AO ABRIR CHAMADO:", err);
    res.status(500).json({ error: "Erro ao iniciar chamado" });
  }
});

// ===============================
// TÉCNICO - SALVAR ANTES
// ===============================
rrouter.put("/tecnico/antes/:id", auth, upload.array("fotos"), async (req, res) => {
  if (req.userRole !== "tecnico") {
    return res.status(403).json({ error: "Apenas técnico" });
  }

  try {
    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
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
        base64: f.buffer.toString("base64")
      })) || []
    };

    projeto.status = "em_andamento";

    await projeto.save();

    res.json({ message: "ANTES salvo com sucesso", projeto });

  } catch (err) {
    console.error("ERRO ANTES:", err);
    res.status(500).json({ error: "Erro ao salvar ANTES" });
  }
});

// ===============================
// TÉCNICO - SALVAR DEPOIS
// ===============================
router.put("/tecnico/depois/:id", auth, upload.array("fotos"), async (req, res) => {
  if (req.userRole !== "tecnico") {
    return res.status(403).json({ error: "Apenas técnico" });
  }

  try {
    const projeto = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
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
        base64: f.buffer.toString("base64")
      })) || []
    };

    projeto.status = "concluido";

    await projeto.save();

    res.json({ message: "DEPOIS salvo com sucesso", projeto });

  } catch (err) {
    console.error("ERRO DEPOIS:", err);
    res.status(500).json({ error: "Erro ao salvar DEPOIS" });
  }
});


// ===============================
// ADMIN - LISTAR TÉCNICOS
// ===============================
router.get("/tecnicos", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin" });
  }

  try {
    const tecnicos = await User.find({ role: "tecnico" }).select("-senha");
    res.json(tecnicos);
  } catch (err) {
    console.error("ERRO AO LISTAR TÉCNICOS:", err);
    res.status(500).json({ error: "Erro ao buscar técnicos" });
  }
});

// ===============================
// ADMIN - EXCLUIR TÉCNICO
// ===============================
router.delete("/tecnicos/:id", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin" });
  }

  try {
    // Desvincula o técnico das OS antes de excluir (IMPORTANTE)
    await Project.updateMany(
      { tecnico: req.params.id },
      { $set: { tecnico: null, status: "aguardando_tecnico" } }
    );

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Técnico excluído com sucesso" });
  } catch (err) {
    console.error("ERRO AO EXCLUIR TÉCNICO:", err);
    res.status(500).json({ error: "Erro ao excluir técnico" });
  }
});

module.exports = router;
