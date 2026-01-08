const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  nome: String,
  email: String,
  senha: String,
  telefone: String, 
  role: {
    type: String,
    enum: ["admin", "tecnico"],
    default: "tecnico"
  }
});

module.exports = mongoose.model("User", UserSchema);
