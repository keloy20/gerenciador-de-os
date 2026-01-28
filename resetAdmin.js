require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

async function resetarSenhaAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo conectado");

    const email = "admin@admin.com";
    const novaSenha = "123456";

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ Admin não encontrado");
      process.exit(1);
    }

    const hash = await bcrypt.hash(novaSenha, 10);
    user.senha = hash;
    await user.save();

    console.log("✅ SENHA DO ADMIN RESETADA");
    console.log("Email:", email);
    console.log("Nova senha:", novaSenha);

    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao resetar senha:", err);
    process.exit(1);
  }
}

resetarSenhaAdmin();
