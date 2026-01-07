const mongoose = require("mongoose");
require("dotenv").config();

const Cliente = require("../models/Cliente");
const Unidade = require("../models/Unidade");

const unidades = [
  { nome: "PRAIME", marca: "CERPE" },
  { nome: "João de Barros", marca: "CERPE" },
  { nome: "Canela", marca: "NTO Bahia" },
  { nome: "ALDEOTA", marca: "LabPasteur" },
  { nome: "CENTRO", marca: "CERPE" },
  { nome: "BARRA", marca: "NTO Bahia" }
  // depois a gente completa com toda a lista da imagem
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const cliente = await Cliente.findOne({ nome: "timao" });

    if (!cliente) {
      console.log("❌ Cliente 'timao' não encontrado. Rode seedClientes.js primeiro.");
      process.exit();
    }

    for (let u of unidades) {
      const existe = await Unidade.findOne({
        nome: u.nome,
        cliente: cliente._id
      });

      if (!existe) {
        await Unidade.create({
          nome: u.nome,
          marca: u.marca,
          cliente: cliente._id
        });

        console.log(`✅ Unidade ${u.nome} criada`);
      } else {
        console.log(`⚠️ Unidade ${u.nome} já existe`);
      }
    }

    console.log("🎉 Unidades inseridas com sucesso!");
    process.exit();

  })
  .catch(err => {
    console.error("Erro:", err);
    process.exit(1);
  });
