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

    const data = await res.json();

    if (!res.ok) {
      console.error("Erro API:", data);
      lista.innerHTML = data.error || "Erro ao carregar serviços";
      return;
    }

    lista.innerHTML = "";

    // =========================
    // SERVIÇO EM ANDAMENTO
    // =========================
    if (data.atual) {
      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
        <h3>🔧 Serviço em andamento</h3>
        <strong>${data.atual.cliente}</strong><br>
        <span class="status status-andamento">● Em andamento</span><br><br>
        <button onclick="abrirServico('${data.atual._id}')">Abrir serviço</button>
        <hr>
      `;

      lista.appendChild(div);
    }

    // =========================
    // SERVIÇOS DE HOJE
    // =========================
    if (data.hoje && data.hoje.length > 0) {
      const titulo = document.createElement("h3");
      titulo.innerText = "📅 Serviços de hoje";
      lista.appendChild(titulo);

      data.hoje.forEach(servico => {
        const div = document.createElement("div");
        div.classList.add("card");

        let statusLabel = "Aguardando técnico";
        let statusClass = "status-aguardando";

        if (servico.status === "em_andamento") {
          statusLabel = "Em andamento";
          statusClass = "status-andamento";
        } else if (servico.status === "concluido") {
          statusLabel = "Concluído";
          statusClass = "status-concluido";
        }

        div.innerHTML = `
          <strong>${servico.cliente}</strong><br>
          <span class="status ${statusClass}">● ${statusLabel}</span><br><br>
          <button onclick="abrirServico('${servico._id}')">Ver</button>
          <hr>
        `;

        lista.appendChild(div);
      });
    }

    // =========================
    // NENHUM SERVIÇO
    // =========================
    if (!data.atual && (!data.hoje || data.hoje.length === 0)) {
      lista.innerHTML = "Nenhum serviço atribuído no momento.";
    }

  } catch (err) {
    console.error("ERRO FETCH:", err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

function abrirServico(id) {
  localStorage.setItem("servicoId", id);
  window.location.href = "servico.html";
}
