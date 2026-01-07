require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./src/models/User");

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado ao MongoDB");

    const senhaHash = await bcrypt.hash("123456", 10);

    // apaga se já existir
    await User.deleteMany({ email: { $in: ["tecnico@teste.com", "admin@admin.com"] } });

    // cria técnico
    await User.create({
      nome: "Tecnico 1",
      email: "tecnico@teste.com",
      senha: senhaHash,
      role: "tecnico"
    });

    // cria admin
    await User.create({
      nome: "Admin",
      email: "admin@admin.com",
      senha: senhaHash,
      role: "admin"
    });

    console.log("Usuários criados com sucesso!");
    process.exit();

  } catch (err) {
    console.error("Erro:", err);
    process.exit(1);
  }
}

run();
