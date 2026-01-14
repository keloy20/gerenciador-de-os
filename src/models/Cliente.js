const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema(
  {
    cliente: {
      type: String,
      required: true,
    },

    subcliente: {
      type: String,
    },

    unidade: {
      type: String,
    },

    marca: {
      type: String,
    },

    telefone: {
      type: String,
    },

    email: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cliente", ClienteSchema);
