const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");
const Unidade = require("../models/Unidade");

// ===============================
// LISTAR MARCAS DA DASA
// ===============================
router.get("/dasa/marcas", async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ nome: /dasa/i });

    if (!cliente) {
      return res.json([]);
    }

    const marcas = await Unidade.distinct("marca", { cliente: cliente._id });

    res.json(marcas);
  } catch (err) {
    console.error("Erro ao buscar marcas DASA:", err);
    res.status(500).json({ error: "Erro ao buscar marcas DASA" });
  }
});

// ===============================
// LISTAR UNIDADES POR MARCA (DASA)
// ===============================
router.get("/dasa/unidades", async (req, res) => {
  const { marca } = req.query;

  if (!marca) {
    return res.json([]);
  }

  try {
    const cliente = await Cliente.findOne({ nome: /dasa/i });

    if (!cliente) {
      return res.json([]);
    }

    const unidades = await Unidade.find({
      cliente: cliente._id,
      marca: { $regex: `^${marca}$`, $options: "i" }
    }).select("nome -_id");

    const nomes = unidades.map(u => u.nome);

    res.json(nomes);
  } catch (err) {
    console.error("Erro ao buscar unidades DASA:", err);
    res.status(500).json({ error: "Erro ao buscar unidades DASA" });
  }
});

module.exports = router;
