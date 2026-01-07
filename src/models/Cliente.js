const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema({
  nome: { type: String, required: true }
});

module.exports = mongoose.model("Cliente", ClienteSchema);
