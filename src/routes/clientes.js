const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");
const Unidade = require("../models/Unidade");

// ===============================
// BUSCAR UNIDADES (AUTOCOMPLETE INTELIGENTE)
// ===============================
router.get("/buscar", async (req, res) => {
  const { nome } = req.query;

  if (!nome) return res.json([]);

  try {
    // 1. Buscar cliente pelo nome
    const cliente = await Cliente.findOne({
      nome: { $regex: nome, $options: "i" }
    });

    let unidades = [];

    if (cliente) {
      // Se achou cliente, traz TODAS as unidades dele
      unidades = await Unidade.find({ cliente: cliente._id }).limit(10);
    } else {
      // Se não achou cliente, tenta buscar por nome da unidade ou marca
      unidades = await Unidade.find({
        $or: [
          { nome: { $regex: nome, $options: "i" } },
          { marca: { $regex: nome, $options: "i" } }
        ]
      }).limit(10);
    }

    res.json(unidades);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
