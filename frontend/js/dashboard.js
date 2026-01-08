const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", carregarDashboard);

async function carregarDashboard() {
  const lista = document.getElementById("listaServicos");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch(`${API}/projects/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const servicos = await res.json();

    if (!res.ok) {
      lista.innerHTML = servicos.error || "Erro ao carregar serviços";
      return;
    }

    lista.innerHTML = "";

    if (servicos.length === 0) {
      lista.innerHTML = "Nenhum serviço atribuído.";
      return;
    }

    servicos.forEach(servico => {
      const div = document.createElement("div");
      div.classList.add("card");

      let statusLabel = "";
      if (servico.status === "aguardando_tecnico") statusLabel = "Aguardando técnico";
      if (servico.status === "em_andamento") statusLabel = "Em andamento";
      if (servico.status === "concluido") statusLabel = "Concluído";

      div.innerHTML = `
        <strong>Cliente:</strong> ${servico.cliente}<br>
        <strong>Status:</strong> ${statusLabel}<br><br>
        <button onclick="abrirServico('${servico._id}')">Abrir serviço</button>
        <hr>
      `;

      lista.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

function abrirServico(id) {
  localStorage.setItem("servicoId", id);
  window.location.href = "servico.html";
}

function novoServico() {
  window.location.href = "novo-servico.html";
}
