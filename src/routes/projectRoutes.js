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

    const osNumero = await gerarNumeroOS();

    const project = await Project.create({
      osNumero,
      cliente,
      subgrupo,
      unidade: unidade || null,
      marca: marca || null,
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

    if (String(project.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "Sem permissão" });
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
// TÉCNICO – EDITAR / ENVIAR ANTES (PODE EDITAR MESMO CONCLUÍDO)
// ===============================
router.post("/:id/antes", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

    if (String(project.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const urls = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        urls.push(result.secure_url);
      }
    }

    project.antes = {
      fotos: urls.length > 0 ? urls : project.antes?.fotos || [],
      relatorio: req.body.relatorio || project.antes?.relatorio || "",
      observacao: req.body.observacao || project.antes?.observacao || "",
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
// TÉCNICO – EDITAR / ENVIAR DEPOIS (PODE EDITAR MESMO CONCLUÍDO)
// ===============================
router.post("/:id/depois", auth, upload.array("fotos", 4), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

    if (String(project.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "Sem permissão" });
    }

    const urls = [];

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        urls.push(result.secure_url);
      }
    }

    project.depois = {
      fotos: urls.length > 0 ? urls : project.depois?.fotos || [],
      relatorio: req.body.relatorio || project.depois?.relatorio || "",
      observacao: req.body.observacao || project.depois?.observacao || "",
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
// BUSCAR SERVIÇO POR ID
// ===============================
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

    if (
      req.userRole !== "admin" &&
      String(project.tecnico) !== String(req.userId)
    ) {
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
    const project = await Project.findById(req.params.id).populate("tecnico", "nome");

    if (!project) return res.status(404).json({ error: "Serviço não encontrado" });

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=OS-${project.osNumero}.pdf`);

    doc.pipe(res);

    doc.fontSize(18).text("ORDEM DE SERVIÇO", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`OS: ${project.osNumero}`);
    doc.text(`Cliente: ${project.cliente}`);
    doc.text(`Endereço: ${project.endereco}`);
    doc.text(`Técnico: ${project.tecnico?.nome || "-"}`);
    doc.moveDown();

    doc.fontSize(14).text("ANTES");
    doc.fontSize(11).text(project.antes?.relatorio || "-");
    doc.moveDown();

    doc.addPage();

    doc.fontSize(14).text("DEPOIS");
    doc.fontSize(11).text(project.depois?.relatorio || "-");

    doc.end();

  } catch (err) {
    console.error("ERRO PDF:", err);
    res.status(500).json({ error: "Erro ao gerar PDF" });
  }
});

module.exports = router;
