const mongoose = require("mongoose");

const UnidadeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  marca: { type: String, required: true },
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true }
});

module.exports = mongoose.model("Unidade", UnidadeSchema);
