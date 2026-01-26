const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema(
  {
    cliente: {
      type: String,
      required: true,
      trim: true,
    },

    subcliente: {
      type: String,
      trim: true,
    },

    marca: {
      type: String,
    },

    unidade: {
      type: String,
      trim: true,
    },

    endereco: {
      type: String,
      trim: true,
    },

    telefone: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cliente", ClienteSchema);
