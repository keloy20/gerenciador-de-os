const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  carregarDashboard();
  setInterval(carregarDashboard, 5000);
});

async function carregarDashboard() {
  const lista = document.getElementById("listaServicos");

  try {
    const res = await fetch(`${API}/projects/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache"
      }
    });

    const servicos = await res.json();

    if (!res.ok) {
      lista.innerHTML = servicos.error || "Erro ao carregar serviços";
      return;
    }

    lista.innerHTML = "";

    if (!Array.isArray(servicos) || servicos.length === 0) {
      lista.innerHTML = "Nenhum serviço atribuído.";
      return;
    }

    servicos.forEach(servico => {
      const div = document.createElement("div");
      div.classList.add("card");

      let statusLabel = "";
      let statusClass = "";

      if (servico.status === "aguardando_tecnico") {
        statusLabel = "Aguardando técnico";
        statusClass = "status-aguardando";
      } else if (servico.status === "em_andamento") {
        statusLabel = "Em andamento";
        statusClass = "status-andamento";
      } else if (servico.status === "concluido") {
        statusLabel = "Concluído";
        statusClass = "status-concluido";
      }

      div.innerHTML = `
        <strong>OS:</strong> ${servico.osNumero || "-"}<br>
        <strong>Cliente:</strong> ${servico.cliente}<br>
        <strong>Status:</strong>
        <span class="status ${statusClass}">● ${statusLabel}</span>
        <br><br>
        <button onclick="abrirServico('${servico._id}')">Abrir serviço</button>
      `;

      lista.appendChild(div);
    });

  } catch (err) {
    console.error("ERRO DASHBOARD:", err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

function abrirServico(id) {
  if (!id) {
    alert("ID do serviço não encontrado");
    return;
  }

  console.log("Abrindo serviço:", id);
  localStorage.setItem("servicoId", id);
  window.location.href = "servico.html";
}

function novoServico() {
  window.location.href = "novo-servico.html";
}
