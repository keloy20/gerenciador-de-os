const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
//const { enviarMensagem } = require("../services/whatsapp");

/* =====================================================
   ADMIN
===================================================== */

router.get("/admin/all", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const projetos = await Project.find({})
  .populate("tecnico", "nome")
  .select("-antes -depois")
  .sort({ createdAt: -1 })
  .limit(50)
  .lean();


    res.status(200).json(projetos);
  } catch (err) {
    console.error("ERRO ADMIN ALL:", err);
    res.status(500).json({ error: "Erro ao listar OS" });
  }
});

router.post("/admin/create", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const total = await Project.countDocuments();
    const ano = new Date().getFullYear();

    const projeto = await Project.create({
      ...req.body,
      tecnico: req.body.tecnicoId ? req.body.tecnicoId : null,
      status: "aguardando_tecnico",
      osNumero: `${String(total + 1).padStart(4, "0")}-${ano}`,
    });

    const projetoCompleto = await Project.findById(projeto._id).populate(
      "tecnico",
      "nome telefone"
    );

    // 🔒 ENVIO DE WHATSAPP PROTEGIDO (NÃO QUEBRA A OS)
    if (
      projetoCompleto &&
      projetoCompleto.tecnico &&
      typeof projetoCompleto.tecnico === "object" &&
      projetoCompleto.tecnico.telefone
    ) {
      const mensagem = `
📋 *Nova Ordem de Serviço*

🆔 OS: ${projetoCompleto.osNumero}
👤 Cliente: ${projetoCompleto.cliente || "Não informado"}
📍 Endereço: ${projetoCompleto.endereco || "Não informado"}
📌 Status: ${projetoCompleto.status}
      `;

      try {
        await enviarMensagem(
          projetoCompleto.tecnico.telefone,
          mensagem
        );
      } catch (err) {
        console.error("Erro ao enviar WhatsApp:", err);
        // ⚠️ NÃO impede a criação da OS
      }
    }

    res.status(201).json(projetoCompleto);
  } catch (err) {
    console.error("ERRO CRIAR OS:", err);
    res.status(500).json({ error: "Erro ao criar OS" });
  }
});


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

    res.json({ message: "OS resetada", projeto });
  } catch (err) {
    res.status(500).json({ error: "Erro ao corrigir OS" });
  }
});

router.delete("/admin/delete/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const projeto = await Project.findByIdAndDelete(req.params.id);
    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    res.json({ message: "OS excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir OS" });
  }
});

/* =====================================================
   TÉCNICO
===================================================== */

router.get("/tecnico/my", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projetos = await Project.find({ tecnico: req.userId })
      .select("-antes -depois")
      .sort({ createdAt: -1 });

    res.json(projetos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

router.get("/tecnico/view/:id", auth, async (req, res) => {
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

    res.json(projeto);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar OS" });
  }
});

router.get("/tecnico/antes/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findById(req.params.id)
      .select("antes status tecnico");

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    if (String(projeto.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "OS não pertence a você" });
    }

    res.json(projeto.antes || {});
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar ANTES" });
  }
});

router.get("/tecnico/depois/:id", auth, async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findById(req.params.id)
      .select("depois status tecnico");

    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    if (String(projeto.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "OS não pertence a você" });
    }

    res.json(projeto.depois || {});
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar DEPOIS" });
  }
});

router.put("/tecnico/abrir/:id", auth, async (req, res) => {
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

    projeto.status = "em_andamento";
    await projeto.save();

    res.json({ message: "Chamado iniciado", projeto });
  } catch (err) {
    res.status(500).json({ error: "Erro ao abrir chamado" });
  }
});

/* =======================
   AJUSTE AQUI (ANTES)
======================= */
router.put("/tecnico/antes/:id", auth, upload.array("fotos"), async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findById(req.params.id);
    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    if (projeto.status === "concluido") {
      return res.status(400).json({ error: "OS já concluída" });
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
      fotos: req.files?.map(f => f.buffer.toString("base64")) || []
    };

    projeto.status = "em_andamento";
    await projeto.save();

    res.json({ message: "ANTES salvo" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar ANTES" });
  }
});

/* =======================
   AJUSTE AQUI (DEPOIS)
======================= */
router.put("/tecnico/depois/:id", auth, upload.array("fotos"), async (req, res) => {
  try {
    if (req.userRole !== "tecnico") {
      return res.status(403).json({ error: "Apenas técnico" });
    }

    const projeto = await Project.findById(req.params.id);
    if (!projeto) {
      return res.status(404).json({ error: "OS não encontrada" });
    }

    if (projeto.status !== "em_andamento") {
      return res.status(400).json({ error: "Finalize o ANTES antes do DEPOIS" });
    }

    if (String(projeto.tecnico) !== String(req.userId)) {
      return res.status(403).json({ error: "OS não pertence a você" });
    }

    projeto.depois = {
      relatorio: req.body.relatorio || "",
      observacao: req.body.observacao || "",
      fotos: req.files?.map(f => f.buffer.toString("base64")) || []
    };

    projeto.status = "concluido";
    await projeto.save();

    res.json({ message: "DEPOIS salvo" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar DEPOIS" });
  }
});

module.exports = router;
