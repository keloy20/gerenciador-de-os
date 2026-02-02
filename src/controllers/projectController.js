const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    cliente: {
      type: String,
      required: true
    },

    subcliente: {
      type: String,
      default: null
    },

    endereco: String,
    telefone: String,

    marca: String,
    unidade: String,

    detalhamento: String,

    osNumero: String,

    status: {
      type: String,
      enum: [
        "aguardando_tecnico",
        "em_andamento",
        "concluido",
        "cancelado"
      ],
      default: "aguardando_tecnico"
    },

    tecnico: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    antes: {
      relatorio: String,
      observacao: String,
      fotos: [String]
    },

    depois: {
      relatorio: String,
      observacao: String,
      fotos: [String]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", ProjectSchema);
