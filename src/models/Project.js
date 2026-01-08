const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  cliente: {
    type: String,
    required: true
  },

  unidade: {
    type: String,
    default: ""
  },

  marca: {
    type: String,
    default: ""
  },

  endereco: String,
  tipoServico: String,

  tecnico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["em_andamento", "concluido"],
    default: "em_andamento"
  },

  antes: {
    fotos: [String],
    relatorio: String,
    data: Date
  },

  depois: {
    fotos: [String],
    relatorio: String,
    data: Date
  }

}, { timestamps: true });

module.exports = mongoose.model("Project", ProjectSchema);
