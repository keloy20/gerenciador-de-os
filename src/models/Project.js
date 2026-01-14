const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    cliente: String,
    Subcliente: String,
    endereco: String,
    telefone: String,
    marca: String,
    unidade: String,
    detalhamento: String,
    osNumero: String,
    status: {
      type: String,
      default: "aguardando_tecnico"
    },

    tecnico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    antes: Object,
    depois: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
