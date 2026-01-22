const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chamados" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}


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
// ADMIN - CRIAR OS  ✅ (ESSA É A QUE FALTAVA)
// ===============================
router.post("/admin/create", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode criar OS" });
    }

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

    // 🔹 Busca apenas pelo ID
    const projeto = await Project.findById(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    // 🔹 Se ainda não tiver técnico, permite visualizar
    if (!projeto.tecnico) {
      return res.json(projeto);
    }

    // 🔹 Se tiver técnico, precisa ser o mesmo
    if (String(projeto.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "OS não pertence a este técnico" });
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

    // 🔹 Busca SOMENTE pelo ID
    const projeto = await Project.findById(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    // 🔹 Se ainda não tiver técnico, vincula automaticamente
    if (!projeto.tecnico) {
      projeto.tecnico = req.userId;
    }

    // 🔹 Se já tiver técnico e não for o mesmo → bloqueia
    if (String(projeto.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "OS não pertence a este técnico" });
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


// ===============================
// ADMIN - CANCELAR OS
// ===============================
router.put("/admin/cancelar/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode cancelar OS" });
    }

    const projeto = await Project.findById(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    projeto.status = "cancelado";
    await projeto.save();

    res.json({ message: "OS cancelada com sucesso", projeto });

  } catch (err) {
    console.error("ERRO AO CANCELAR OS:", err);
    res.status(500).json({ error: "Erro ao cancelar OS" });
  }
});

// ===============================
// ADMIN - ATUALIZAR OS (EDITAR)
// ===============================
router.put("/admin/update/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin pode editar OS" });
    }

    const projeto = await Project.findById(req.params.id);

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    const {
      cliente,
      Subcliente,
      endereco,
      telefone,
      marca,
      unidade,
      detalhamento,
      status,
      tecnico,
      antes,
      depois,
    } = req.body;

    if (cliente !== undefined) projeto.cliente = cliente;
    if (Subcliente !== undefined) projeto.Subcliente = Subcliente;
    if (endereco !== undefined) projeto.endereco = endereco;
    if (telefone !== undefined) projeto.telefone = telefone;
    if (marca !== undefined) projeto.marca = marca;
    if (unidade !== undefined) projeto.unidade = unidade;
    if (detalhamento !== undefined) projeto.detalhamento = detalhamento;
    if (status !== undefined) projeto.status = status;
    if (tecnico !== undefined) projeto.tecnico = tecnico;

    if (antes !== undefined) projeto.antes = antes;
    if (depois !== undefined) projeto.depois = depois;

    await projeto.save();

    res.json({ message: "OS atualizada com sucesso", projeto });
  } catch (err) {
    console.error("ERRO AO ATUALIZAR OS:", err);
    res.status(500).json({ error: "Erro ao atualizar OS" });
  }
});


module.exports = router;
