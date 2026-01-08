const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");
const PDFDocument = require("pdfkit");
const axios = require("axios");

// ===============================
// TÉCNICO – INICIAR SERVIÇO
// ===============================
router.post("/start", auth, async (req, res) => {
  try {
    // 🔒 BLOQUEIA ADMIN
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico pode abrir chamado" });
    }

    const { cliente, unidade, marca, endereco, tipoServico } = req.body;

    if (!cliente || !endereco || !tipoServico) {
      return res.status(400).json({ error: "Cliente, endereço e tipo de serviço são obrigatórios" });
    }

    if (cliente.toLowerCase() === "timao" && (!unidade || !marca)) {
      return res.status(400).json({ error: "Unidade e marca são obrigatórias para o cliente Timão" });
    }

    const project = await Project.create({
      cliente,
      unidade: cliente.toLowerCase() === "timao" ? unidade : null,
      marca: cliente.toLowerCase() === "timao" ? marca : null,
      endereco,
      tipoServico,
      tecnico: req.userId,
      status: "em_andamento",
      dataServico: new Date()
    });

    return res.status(201).json(project);

  } catch (err) {
    console.error("ERRO START:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – MEUS SERVIÇOS
// ===============================
router.get("/me", auth, async (req, res) => {
  try {
    const atual = await Project.findOne({
      tecnico: req.userId,
      status: "em_andamento"
    });

    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    const fimHoje = new Date();
    fimHoje.setHours(23, 59, 59, 999);

    const hoje = await Project.find({
      tecnico: req.userId,
      dataServico: { $gte: inicioHoje, $lte: fimHoje }
    }).sort({ createdAt: -1 });

    return res.json({ atual, hoje });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADMIN – TODOS OS SERVIÇOS
// ===============================
router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const projects = await Project.find()
      .populate("tecnico", "nome email")
      .sort({ createdAt: -1 });

    return res.status(200).json(projects);

  } catch (err) {
    console.error("ERRO ADMIN ALL:", err);
    return res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

// ===============================
// ADMIN – CRIAR SERVIÇO
// ===============================
router.post("/admin/create", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode criar serviço" });
  }

  const { cliente, endereco, tipoServico, tecnicoId } = req.body;

  try {
    const project = await Project.create({
      cliente,
      endereco,
      tipoServico,
      tecnico: tecnicoId,
      status: "em_andamento",
      dataServico: new Date()
    });

    return res.status(201).json(project);

  } catch (err) {
    return res.status(500).json({ error: "Erro ao criar serviço" });
  }
});

// ===============================
// TÉCNICO – BUSCAR SERVIÇO POR ID
// ===============================
router.get("/servico/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
    });

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    return res.json(project);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – ENVIAR ANTES
// ===============================
router.post("/servico/:id/antes", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
    });

    if (!project) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }

    const urls = [];

    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      urls.push(result.secure_url);
    }

    project.antes = {
      fotos: urls,
      relatorio: req.body.relatorio || "",
      data: new Date()
    };

    await project.save();

    return res.status(200).json(project);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – ENVIAR DEPOIS
// ===============================
router.post("/servico/:id/depois", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
    });

    if (!project) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }

    const urls = [];

    for (let file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      urls.push(result.secure_url);
    }

    project.depois = {
      fotos: urls,
      relatorio: req.body.relatorio || "",
      data: new Date()
    };

    project.status = "concluido";

    await project.save();

    return res.status(200).json({ success: true, project });

  } catch (err) {
    console.error("ERRO DEPOIS:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ===============================
// PDF
// ===============================
router.get("/servico/:id/pdf", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("tecnico", "nome");

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="servico-${project._id}.pdf"`);

    doc.pipe(res);

    doc.fontSize(20).text("RELATÓRIO DE SERVIÇO", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Cliente: ${project.cliente}`);
    doc.text(`Unidade: ${project.unidade || "-"}`);
    doc.text(`Marca: ${project.marca || "-"}`);
    doc.text(`Técnico: ${project.tecnico?.nome || "N/A"}`);
    doc.text(`Status: ${project.status}`);
    doc.moveDown();

    doc.fontSize(14).text("ANTES", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(project.antes?.relatorio || "Sem relatório");
    doc.moveDown();

    if (project.antes?.fotos?.length) {
      for (const url of project.antes.fotos) {
        const img = await axios.get(url, { responseType: "arraybuffer" });
        doc.image(Buffer.from(img.data), { fit: [250, 250] });
        doc.moveDown();
      }
    }

    doc.addPage();
    doc.fontSize(14).text("DEPOIS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(project.depois?.relatorio || "Sem relatório");
    doc.moveDown();

    if (project.depois?.fotos?.length) {
      for (const url of project.depois.fotos) {
        const img = await axios.get(url, { responseType: "arraybuffer" });
        doc.image(Buffer.from(img.data), { fit: [250, 250] });
        doc.moveDown();
      }
    }

    doc.end();

  } catch (err) {
    console.error("ERRO PDF:", err);
    return res.status(500).json({ error: "Erro ao gerar PDF" });
  }
});

module.exports = router;
