const API = "https://gerenciador-de-os.onrender.com/projects";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", carregarDashboard);

async function carregarDashboard() {
  const lista = document.getElementById("listaServicos");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch(`${API}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      lista.innerHTML = data.error || "Erro ao carregar serviços";
      return;
    }

    lista.innerHTML = "";

    // =========================
    // SERVIÇO EM ANDAMENTO
    // =========================
    if (data.atual) {
      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <h3>🔧 Serviço em andamento</h3>
        <strong>${data.atual.cliente}</strong><br>
        <small>${data.atual.endereco || ""}</small><br><br>
        <button onclick="abrirServico('${data.atual._id}')">Abrir serviço</button>
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
        div.className = "card";

        div.innerHTML = `
          <strong>${servico.cliente}</strong><br>
          <small>${servico.endereco || ""}</small><br>
          <span>Status: ${servico.status}</span><br><br>
          <button onclick="abrirServico('${servico._id}')">Ver</button>
        `;

        lista.appendChild(div);
      });
    }

    if (!data.atual && (!data.hoje || data.hoje.length === 0)) {
      lista.innerHTML = "<p>Nenhum serviço hoje.</p>";
    }

  } catch (err) {
    console.error(err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

function novoServico() {
  window.location.href = "novo-servico.html";
}

function abrirServico(id) {
  localStorage.setItem("servicoId", id);
  window.location.href = "servico.html";
}
