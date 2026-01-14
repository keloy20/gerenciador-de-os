require("dotenv").config();
const mongoose = require("mongoose");
const Cliente = require("../models/Cliente");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo conectado (seedClientes)"))
  .catch(err => {
    console.error("Erro Mongo:", err);
    process.exit(1);
  });

async function seed() {
  try {
    await Cliente.deleteMany();

    const dasa = await Cliente.create({
      nome: "DASA",
      tipo: "dasa" // <<< ISSO RESOLVE O ERRO
    });

    console.log("Cliente DASA criado com sucesso:", dasa);
    process.exit();
  } catch (err) {
    console.error("Erro no seedClientes:", err);
    process.exit(1);
  }
}

seed();
