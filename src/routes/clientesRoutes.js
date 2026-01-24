const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");
const auth = require("../middlewares/auth");

// ===============================
// LISTAR TODOS OS CLIENTES
// ===============================
router.get("/", auth, async (req, res) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({ error: "Apenas admin" });
    }

    const clientes = await Cliente.find().sort({
      cliente: 1,
      subcliente: 1,
    });

    res.json(clientes);
  } catch (err) {
    console.error("Erro ao buscar clientes:", err);
    res.status(500).json({ error: "Erro ao buscar clientes" });
  }
});

// ===============================
// CRIAR NOVO CLIENTE / SUBCLIENTE
// ===============================
router.post("/", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode criar cliente" });
  }

  try {
    const {
      cliente,
      subcliente,
      marca,
      unidade,
      endereco,
      telefone,
      email,
    } = req.body;

    if (!cliente) {
      return res.status(400).json({ error: "Cliente é obrigatório" });
    }

    const novo = await Cliente.create({
      cliente,
      subcliente: subcliente || "",
      marca: marca || "",
      unidade: unidade || "",
      endereco: endereco || "",
      telefone: telefone || "",
      email: email || "",
    });

    res.json(novo);
  } catch (err) {
    console.error("Erro ao criar cliente:", err);
    res.status(500).json({ error: "Erro ao criar cliente" });
  }
});

// ===============================
// BUSCAR SUBCLIENTES POR CLIENTE
// ===============================
router.get("/by-cliente/:cliente", auth, async (req, res) => {
  try {
    const nomeCliente = req.params.cliente;

    const lista = await Cliente.find({
      cliente: new RegExp(`^${nomeCliente}$`, "i"),
    }).sort({ subcliente: 1 });

    res.json(lista);
  } catch (err) {
    console.error("Erro ao buscar subclientes:", err);
    res.status(500).json({ error: "Erro ao buscar subclientes" });
  }
});

// ===============================
// ATUALIZAR CLIENTE
// ===============================
router.put("/:id", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode editar cliente" });
  }

  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(cliente);
  } catch (err) {
    console.error("Erro ao atualizar cliente:", err);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});

// ===============================
// EXCLUIR CLIENTE
// ===============================
router.delete("/:id", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode excluir cliente" });
  }

  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.json({ message: "Cliente removido com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir cliente:", err);
    res.status(500).json({ error: "Erro ao excluir cliente" });
  }
});

// ===============================
// ATUALIZAR CLIENTE
// ===============================
router.put("/:id", auth, async (req, res) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Apenas admin pode editar cliente" });
  }

  try {
    const {
      cliente,
      subcliente,
      unidade,
      marca,
      endereco,
      telefone,
      email,
    } = req.body;

    const atualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      {
        cliente,
        subcliente,
        unidade,
        marca,
        endereco,
        telefone,
        email,
      },
      { new: true }
    );

    if (!atualizado) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(atualizado);
  } catch (err) {
    console.error("Erro ao atualizar cliente:", err);
    res.status(500).json({ error: "Erro ao atualizar cliente" });
  }
});


module.exports = router;
