const mongoose = require("mongoose");
require("dotenv").config();

const Cliente = require("../models/Cliente");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const existe = await Cliente.findOne({ nome: "timao" });

    if (existe) {
      console.log("Cliente 'timao' já existe");
    } else {
      await Cliente.create({ nome: "timao" });
      console.log("Cliente 'timao' criado com sucesso");
    }

    process.exit();
  })
  .catch(err => {
    console.error("Erro:", err);
    process.exit(1);
  });
