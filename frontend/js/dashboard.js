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
        "Authorization": `Bearer ${token}`
      }
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      console.error("Erro ao converter JSON", e);
      lista.innerHTML = "Erro ao ler resposta do servidor";
      return;
    }

    if (!res.ok) {
      lista.innerHTML = data.error || "Erro ao carregar serviços";
      return;
    }

    const atual = data.atual || null;
    const hoje = Array.isArray(data.hoje) ? data.hoje : [];

    lista.innerHTML = "";

    // =========================
    // SERVIÇO EM ANDAMENTO
    // =========================
    if (atual) {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>🔧 Serviço em andamento</h3>
        <strong>${atual.cliente || "Cliente não informado"}</strong><br>
        <button onclick="abrirServico('${atual._id}')">Abrir serviço</button>
        <hr>
      `;
      lista.appendChild(div);
    }

    // =========================
    // SERVIÇOS DE HOJE
    // =========================
    if (hoje.length > 0) {
      const titulo = document.createElement("h3");
      titulo.innerText = "📅 Serviços de hoje";
      lista.appendChild(titulo);

      hoje.forEach(servico => {
        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${servico.cliente || "Cliente não informado"}</strong> - ${servico.status || ""}<br>
          <button onclick="abrirServico('${servico._id}')">Ver</button>
          <hr>
        `;
        lista.appendChild(div);
      });
    }

    if (!atual && hoje.length === 0) {
      lista.innerHTML = "Nenhum serviço hoje.";
    }

  } catch (err) {
    console.error("ERRO DASHBOARD:", err);
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
