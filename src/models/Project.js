const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  cliente: { type: String, required: true },

  unidade: { type: String, default: null },
  marca: { type: String, default: null },

  endereco: String,
  tipoServico: String,

  tecnico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["aguardando_tecnico", "em_andamento", "concluido","cancelado"],
    default: "aguardando_tecnico"
  },

  dataServico: {
    type: Date,
    default: Date.now
  },

  antes: {
    fotos: [String],
    relatorio: String,
    observacao: String,
    data: Date
  },

  depois: {
    fotos: [String],
    relatorio: String,
    observacao: String,
    data: Date
  },

  osNumero: {
    type: String,
    unique: true
  },

  subgrupo: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
