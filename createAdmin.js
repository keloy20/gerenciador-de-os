require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

async function criarAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo conectado");

    const email = "admin@admin.com";
    const senha = "123456";

    const existe = await User.findOne({ email });
    if (existe) {
      console.log("⚠️ Admin já existe no banco");
      process.exit(0);
    }

    const hash = await bcrypt.hash(senha, 10);

    await User.create({
      nome: "Admin",
      email,
      senha: hash,
      role: "admin",
    });

    console.log("✅ ADMIN CRIADO COM SUCESSO");
    console.log("Email:", email);
    console.log("Senha:", senha);

    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao criar admin:", err);
    process.exit(1);
  }
}

criarAdmin();
