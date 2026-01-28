const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

let client;
let isReady = false;

function iniciarWhatsapp() {
  client = new Client({
    authStrategy: new LocalAuth(), // salva sessão
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
  });

  client.on("qr", (qr) => {
    console.log("📱 Escaneie o QR Code abaixo com o WhatsApp:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    isReady = true;
    console.log("✅ WhatsApp conectado com sucesso!");
  });

  client.on("auth_failure", () => {
    isReady = false;
    console.log("❌ Falha na autenticação do WhatsApp");
  });

  client.initialize();
}

// envia mensagem
async function enviarMensagem(numero, mensagem) {
  if (!isReady) {
    console.log("⚠️ WhatsApp ainda não está pronto");
    return;
  }

  const chatId = numero.replace(/\D/g, "") + "@c.us";

  try {
    await client.sendMessage(chatId, mensagem);
    console.log("📤 Mensagem enviada para", numero);
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err.message);
  }
}

module.exports = {
  iniciarWhatsapp,
  enviarMensagem,
};
