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
      headers: { Authorization: `Bearer ${token}` }
    });

    const servicos = await res.json();
    lista.innerHTML = "";

    if (servicos.length === 0) {
      lista.innerHTML = "Nenhum serviço encontrado.";
      return;
    }

    servicos.forEach(servico => {
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

      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
        <strong>OS:</strong> ${servico.osNumero}<br>
        <strong>Cliente:</strong> ${servico.cliente}<br>
        <span class="status ${statusClass}">● ${statusLabel}</span><br><br>
        <button onclick="abrirServico('${servico._id}')">Abrir Serviço</button>
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
