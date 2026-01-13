const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Counter = require("../models/Counter");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");
const PDFDocument = require("pdfkit");
const axios = require("axios");

// ===============================
// GERAR NÚMERO DA OS
// ===============================
async function gerarNumeroOS() {
  const ano = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { name: `os-${ano}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const numeroFormatado = String(counter.seq).padStart(4, "0");
  return `${numeroFormatado}-${ano}`;
}

// ===============================
// ADMIN – TODOS OS SERVIÇOS
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
    console.error("ERRO ADMIN ALL:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADMIN – VER CHAMADO
// ===============================
router.get("/admin/view/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const project = await Project.findById(req.params.id).populate("tecnico", "nome email");

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    res.json(project);
  } catch (err) {
    console.error("ERRO VIEW:", err);
    res.status(500).json({ error: "Erro ao buscar chamado" });
  }
});

// ===============================
// ADMIN – CRIAR SERVIÇO
// ===============================
router.post("/admin/create", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const { cliente, subgrupo, unidade, marca, endereco, tipoServico, tecnicoId } = req.body;

    if (!cliente || !endereco || !tipoServico || !tecnicoId) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const osNumero = await gerarNumeroOS();

    const project = await Project.create({
      osNumero,
      cliente,
      subgrupo,
      unidade,
      marca,
      endereco,
      tipoServico,
      tecnico: tecnicoId,
      status: "aguardando_tecnico",
      dataServico: new Date()
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("ERRO ADMIN CREATE:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADMIN – CANCELAR SERVIÇO
// ===============================
router.put("/admin/cancelar/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    project.status = "cancelado";
    await project.save();

    res.json({ message: "Serviço cancelado com sucesso" });

  } catch (err) {
    console.error("ERRO CANCELAR:", err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// ADMIN – TROCAR TÉCNICO
// ===============================
router.put("/admin/change-tecnico/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const { tecnicoId } = req.body;

    if (!tecnicoId) {
      return res.status(400).json({ error: "TecnicoId é obrigatório" });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    project.tecnico = tecnicoId;
    project.status = "aguardando_tecnico"; // volta pra fila do novo técnico
    await project.save();

    res.json({ message: "Técnico alterado com sucesso" });

  } catch (err) {
    console.error("ERRO TROCAR TECNICO:", err);
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// TÉCNICO – MEUS SERVIÇOS
// ===============================
router.get("/me", auth, async (req, res) => {
  try {
    const projetos = await Project.find({ tecnico: req.userId }).sort({ createdAt: -1 });
    res.json(projetos);
  } catch (err) {
    console.error("ERRO ME:", err);
    res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

// ===============================
// TÉCNICO – ABRIR SERVIÇO
// ===============================
router.post("/:id/abrir", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

    if (String(project.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    project.status = "em_andamento";
    await project.save();

    res.json(project);
  } catch (err) {
    console.error("ERRO ABRIR:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – ENVIAR ANTES
// ===============================
router.post("/:id/antes", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });
    if (String(project.tecnico) !== String(req.userId)) return res.status(403).json({ error: "Sem permissão" });

    const urls = [];

    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      urls.push(result.secure_url);
    }

    project.antes = {
      fotos: urls,
      relatorio: req.body.relatorio || "",
      observacao: req.body.observacao || "",
      data: new Date()
    };

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("ERRO ANTES:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – ENVIAR DEPOIS
// ===============================
router.post("/:id/depois", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });
    if (String(project.tecnico) !== String(req.userId)) return res.status(403).json({ error: "Sem permissão" });

    const urls = [];

    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      urls.push(result.secure_url);
    }

    project.depois = {
      fotos: urls,
      relatorio: req.body.relatorio || "",
      observacao: req.body.observacao || "",
      data: new Date()
    };

    project.status = "concluido";

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("ERRO DEPOIS:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// BUSCAR POR ID
// ===============================
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("tecnico", "nome email");

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

    if (req.userRole !== "admin" && String(project.tecnico._id) !== String(req.userId)) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    res.json(project);
  } catch (err) {
    console.error("ERRO GET ID:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// GERAR PDF
// ===============================
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("tecnico", "nome email");

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=OS-${project.osNumero}.pdf`);

    doc.pipe(res);

    doc.fontSize(20).text("ORDEM DE SERVIÇO", { align: "center" });
    doc.moveDown();
    doc.text(`OS: ${project.osNumero}`);
    doc.text(`Cliente: ${project.cliente}`);
    doc.text(`Endereço: ${project.endereco}`);
    doc.text(`Técnico: ${project.tecnico?.nome || "-"}`);

    doc.end();
  } catch (err) {
    console.error("ERRO PDF:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
