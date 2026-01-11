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
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Acesso negado" });
  }

  try {
    const project = await Project.findById(req.params.id)
      .populate("tecnico", "nome email");

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

    if (cliente.toLowerCase() === "timao" && (!unidade || !marca)) {
      return res.status(400).json({ error: "Unidade e marca obrigatórias para Timão" });
    }

    const osNumero = await gerarNumeroOS();

    const project = await Project.create({
      osNumero,
      cliente,
      subgrupo,
      unidade: cliente.toLowerCase() === "timao" ? unidade : null,
      marca: cliente.toLowerCase() === "timao" ? marca : null,
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
// TÉCNICO – ABRIR CHAMADO
// ===============================
router.post("/start", auth, async (req, res) => {
  try {
    const { cliente, subgrupo, unidade, marca, endereco, tipoServico } = req.body;

    if (!cliente || !endereco || !tipoServico) {
      return res.status(400).json({ error: "Cliente, endereço e tipo de serviço são obrigatórios" });
    }

    if (cliente.toLowerCase() === "timao" && (!unidade || !marca)) {
      return res.status(400).json({ error: "Unidade e marca são obrigatórias para o cliente Timão" });
    }

    const osNumero = await gerarNumeroOS();

    const project = await Project.create({
      osNumero,
      cliente,
      subgrupo,
      unidade: cliente.toLowerCase() === "timao" ? unidade : null,
      marca: cliente.toLowerCase() === "timao" ? marca : null,
      endereco,
      tipoServico,
      tecnico: req.userId,
      status: "aguardando_tecnico",
      dataServico: new Date()
    });

    res.status(201).json(project);

  } catch (err) {
    console.error("ERRO START:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – MEUS SERVIÇOS
// ===============================
router.get("/me", auth, async (req, res) => {
  try {
    const projetos = await Project.find({ tecnico: req.userId })
      .sort({ createdAt: -1 });

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

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    // só o técnico dono pode abrir
    if (String(project.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "Você não tem permissão para este serviço" });
    }

    if (project.status === "aguardando_tecnico") {
      project.status = "em_andamento";
      await project.save();
    }

    return res.json(project);

  } catch (err) {
    console.error("ERRO ABRIR:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – ENVIAR ANTES
// ===============================
router.post("/:id/antes", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    // só o técnico dono pode enviar
    if (String(project.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

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

    return res.json(project);

  } catch (err) {
    console.error("ERRO ANTES:", err);
    return res.status(500).json({ error: err.message });
  }
});



// ===============================
// BUSCAR SERVIÇO POR ID (POR ÚLTIMO)
// ===============================
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    if (
      req.userRole !== "admin" &&
      String(project.tecnico) !== String(req.userId)
    ) {
      return res.status(403).json({ error: "Acesso negado a este serviço" });
    }

    res.json(project);

  } catch (err) {
    console.error("ERRO GET ID:", err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// TÉCNICO – ENVIAR DEPOIS (FINALIZA)
// ===============================
router.post("/:id/depois", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    // só o técnico dono pode finalizar
    if (String(project.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

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

    return res.json(project);

  } catch (err) {
    console.error("ERRO DEPOIS:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ===============================
// GERAR PDF DA OS
// ===============================
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("tecnico", "nome email");

    if (!project) {
      return res.status(404).json({ error: "Serviço não encontrado" });
    }

    // segurança: admin vê tudo, técnico só o dele
    if (
      req.userRole !== "admin" &&
      String(project.tecnico?._id) !== String(req.userId)
    ) {
      return res.status(403).json({ error: "Acesso negado ao PDF" });
    }

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=OS-${project.osNumero}.pdf`
    );

    doc.pipe(res);

    doc.fontSize(18).text(`ORDEM DE SERVIÇO - ${project.osNumero}`, { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Cliente: ${project.cliente}`);
    doc.text(`Subgrupo: ${project.subgrupo || "-"}`);
    doc.text(`Unidade: ${project.unidade || "-"}`);
    doc.text(`Marca: ${project.marca || "-"}`);
    doc.text(`Endereço: ${project.endereco}`);
    doc.text(`Tipo de Serviço: ${project.tipoServico}`);
    doc.text(`Técnico: ${project.tecnico?.nome || "-"}`);
    doc.text(`Status: ${project.status}`);
    doc.moveDown();

    // ===== ANTES =====
    doc.fontSize(14).text("ANTES DO SERVIÇO", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Relatório: ${project.antes?.relatorio || "-"}`);
    doc.text(`Observação: ${project.antes?.observacao || "-"}`);
    doc.moveDown();

    // ===== DEPOIS =====
    doc.fontSize(14).text("DEPOIS DO SERVIÇO", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`Relatório: ${project.depois?.relatorio || "-"}`);
    doc.text(`Observação: ${project.depois?.observacao || "-"}`);
    doc.moveDown();

    doc.end();

  } catch (err) {
    console.error("ERRO PDF:", err);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
});



module.exports = router;
