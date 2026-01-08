const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const cloudinary = require("../config/cloudinary");

router.post("/start", auth, async (req, res) => {
  try {
    console.log("===== DEBUG START =====");
    console.log("USER ID:", req.userId);
    console.log("BODY:", req.body);

    const { cliente, unidade, marca, endereco, tipoServico } = req.body;

    if (!req.userId) {
      return res.status(401).json({ error: "userId não encontrado no token" });
    }

    // 🔹 Campos básicos obrigatórios para TODO mundo
    if (!cliente || !endereco || !tipoServico) {
      return res.status(400).json({ error: "Cliente, endereço e tipo de serviço são obrigatórios" });
    }

    // 🔴 REGRA DE NEGÓCIO: só exige unidade/marca se for TIMAO
    if (cliente.toLowerCase() === "timao" && (!unidade || !marca)) {
      return res.status(400).json({ error: "Unidade e marca são obrigatórias para o cliente Timão" });
    }

    const project = await Project.create({
      cliente,
      unidade: cliente.toLowerCase() === "timao" ? unidade : "",
      marca: cliente.toLowerCase() === "timao" ? marca : "",
      endereco,
      tipoServico,
      tecnico: req.userId,
      status: "em_andamento",
      dataServico: new Date()
    });

    console.log("PROJETO CRIADO:", project._id);

    res.json(project);

  } catch (err) {
    console.error("🔥 ERRO START:", err);
    res.status(500).json({ error: err.message });
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

    res.json({ atual, hoje });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// TÉCNICO – ENVIAR ANTES

// TÉCNICO – BUSCAR SERVIÇO POR ID
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      tecnico: req.userId
    });

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    res.json(project);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:id/antes", auth, upload.array("fotos", 4), async (req, res) => {
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

    project.antes.fotos = urls;
    project.antes.relatorio = req.body.relatorio || "";
    project.antes.data = new Date();

    await project.save();

    res.json(project);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – ENVIAR DEPOIS
// ===============================
router.post("/:id/depois", auth, upload.array("fotos", 4), async (req, res) => {
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

    project.depois.fotos = urls;
    project.depois.relatorio = req.body.relatorio || "";
    project.depois.data = new Date();

    project.status = "concluido";

    await project.save();

    res.json(project);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADMIN – TODOS OS SERVIÇOS
// ===============================
router.get("/admin/all", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const projects = await Project.find()
      .populate("tecnico", "nome email")
      .sort({ createdAt: -1 });

    res.json(projects);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ADMIN – CRIAR SERVIÇO E ATRIBUIR TÉCNICO
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
      antes: { fotos: [], relatorio: "" },
      depois: { fotos: [], relatorio: "" }
    });

    res.json(project);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar serviço" });
  }
});


const PDFDocument = require("pdfkit");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("tecnico", "nome");

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    const doc = new PDFDocument({ margin: 40 });
    const fileName = `servico-${project._id}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);

    doc.pipe(res);

    // ===== TÍTULO =====
    doc.fontSize(20).text("RELATÓRIO DE SERVIÇO", { align: "center" });
    doc.moveDown();

    // ===== DADOS =====
    doc.fontSize(12).text(`Cliente: ${project.cliente}`);
    doc.text(`Unidade: ${project.unidade}`);
    doc.text(`Marca: ${project.marca}`);
    doc.text(`Técnico: ${project.tecnico?.nome || "N/A"}`);
    doc.text(`Status: ${project.status}`);
    doc.moveDown();

    // ===== ANTES =====
    doc.fontSize(14).text("ANTES", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(project.antes?.relatorio || "Sem relatório");
    doc.moveDown();

    if (project.antes?.fotos?.length > 0) {
      for (const url of project.antes.fotos) {
        const img = await axios.get(url, { responseType: "arraybuffer" });
        const imgBuffer = Buffer.from(img.data, "binary");

        doc.image(imgBuffer, {
          fit: [250, 250],
          align: "center"
        });

        doc.moveDown();
      }
    }

    // ===== DEPOIS =====
    doc.addPage();
    doc.fontSize(14).text("DEPOIS", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(project.depois?.relatorio || "Sem relatório");
    doc.moveDown();

    if (project.depois?.fotos?.length > 0) {
      for (const url of project.depois.fotos) {
        const img = await axios.get(url, { responseType: "arraybuffer" });
        const imgBuffer = Buffer.from(img.data, "binary");

        doc.image(imgBuffer, {
          fit: [250, 250],
          align: "center"
        });

        doc.moveDown();
      }
    }

    doc.end();

  } catch (err) {
    console.error("ERRO PDF:", err);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
});

module.exports = router;
