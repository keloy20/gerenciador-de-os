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
// TÉCNICO – ABRIR CHAMADO
// ===============================
router.post("/start", auth, async (req, res) => {
  try {
    const { cliente, subgrupo,unidade, marca, endereco, tipoServico } = req.body;

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
// TÉCNICO – AO ABRIR SERVIÇO (vira em_andamento)
// ===============================
router.post("/:id/abrir", auth, async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ error: "Serviço não encontrado" });
  }

  // 🔒 garante que só o técnico dono possa abrir
  if (String(project.tecnico) !== String(req.userId)) {
    return res.status(403).json({ error: "Você não tem permissão para este serviço" });
  }

  if (project.status === "aguardando_tecnico") {
    project.status = "em_andamento";
    await project.save();
  }

  res.json(project);
});

// ===============================
// TÉCNICO – MEUS SERVIÇOS (NUNCA SOMEM)
// ===============================
router.get("/me", auth, async (req, res) => {
  try {
    const projetos = await Project.find({
      tecnico: req.userId
    }).sort({ createdAt: -1 });

    return res.json(projetos);

  } catch (err) {
    console.error("ERRO ME:", err);
    return res.status(500).json({ error: "Erro ao buscar serviços" });
  }
});

// ===============================
// TÉCNICO – BUSCAR SERVIÇO POR ID
// ===============================
router.get("/:id", auth, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, tecnico: req.userId });

  if (!project) {
    return res.status(404).json({ error: "Serviço não encontrado" });
  }

  res.json(project);
});

// ===============================
// TÉCNICO – ENVIAR ANTES
// ===============================
router.post("/:id/antes", auth, upload.array("fotos", 4), async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, tecnico: req.userId });

  if (!project) return res.status(404).json({ error: "Projeto não encontrado" });

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
});

// ===============================
// TÉCNICO – ENVIAR DEPOIS (FINALIZA)
// ===============================
router.post("/:id/depois", auth, upload.array("fotos", 4), async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, tecnico: req.userId });

  if (!project) return res.status(404).json({ error: "Projeto não encontrado" });

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
});

// ===============================
// ADMIN – TODOS OS SERVIÇOS
// ===============================
router.get("/admin/all", auth, async (req, res) => {
  if (req.userRole !== "admin") return res.status(403).json({ error: "Acesso negado" });

  const projetos = await Project.find()
    .populate("tecnico", "nome email")
    .sort({ createdAt: -1 });

  res.json(projetos);
});

// ===============================
// ADMIN – CRIAR SERVIÇO
// ===============================
router.post("/admin/create", auth, async (req, res) => {
  if (req.userRole !== "admin") return res.status(403).json({ error: "Apenas admin" });

  const { cliente, unidade, marca, endereco, tipoServico, tecnicoId } = req.body;

  if (!cliente || !endereco || !tipoServico || !tecnicoId) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  const osNumero = await gerarNumeroOS();

  const project = await Project.create({
    osNumero,
    cliente,
    unidade,
    marca,
    endereco,
    tipoServico,
    tecnico: tecnicoId,
    status: "aguardando_tecnico",
    dataServico: new Date()
  });

  res.status(201).json(project);
});

// ===============================
// ADMIN – PDF
// ===============================
router.get("/:id/pdf", auth, async (req, res) => {
  if (req.userRole !== "admin") return res.status(403).json({ error: "Apenas admin" });

  const project = await Project.findById(req.params.id).populate("tecnico", "nome");

  if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

  const doc = new PDFDocument({ margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="OS-${project.osNumero}.pdf"`);

  doc.pipe(res);

  doc.fontSize(20).text(`ORDEM DE SERVIÇO ${project.osNumero}`, { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Cliente: ${project.cliente}`);
  doc.text(`Unidade: ${project.unidade || "-"}`);
  doc.text(`Marca: ${project.marca || "-"}`);
  doc.text(`Endereço: ${project.endereco}`);
  doc.text(`Técnico: ${project.tecnico?.nome || "-"}`);
  doc.text(`Status: ${project.status}`);
  doc.moveDown();

  doc.fontSize(14).text("ANTES", { underline: true });
  doc.text(project.antes?.relatorio || "Sem relatório");
  doc.text(`Obs: ${project.antes?.observacao || "-"}`);
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
  doc.text(project.depois?.relatorio || "Sem relatório");
  doc.text(`Obs: ${project.depois?.observacao || "-"}`);
  doc.moveDown();

  if (project.depois?.fotos?.length) {
    for (const url of project.depois.fotos) {
      const img = await axios.get(url, { responseType: "arraybuffer" });
      doc.image(Buffer.from(img.data), { fit: [250, 250] });
      doc.moveDown();
    }
  }

  doc.end();
});

module.exports = router;
