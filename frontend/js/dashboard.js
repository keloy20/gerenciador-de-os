const API = "http://192.168.0.7:3000";
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

    const data = await res.json();

    if (!res.ok) {
      lista.innerHTML = data.error || "Erro ao carregar serviços";
      return;
    }

    lista.innerHTML = "";

   
    // SERVIÇO EM ANDAMENTO
    
    if (data.atual) {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>🔧 Serviço em andamento</h3>
        <strong>${data.atual.cliente}</strong><br>
        <button onclick="abrirServico('${data.atual._id}')">Abrir serviço</button>
        <hr>
      `;
      lista.appendChild(div);
    }

    // =========================
    // SERVIÇOS DE HOJE
    // =========================
    if (data.hoje.length > 0) {
      const titulo = document.createElement("h3");
      titulo.innerText = "📅 Serviços de hoje";
      lista.appendChild(titulo);

      data.hoje.forEach(servico => {
        const div = document.createElement("div");
        div.innerHTML = `
          <strong>${servico.cliente}</strong> - ${servico.status}<br>
          <button onclick="abrirServico('${servico._id}')">Ver</button>
          <hr>
        `;
        lista.appendChild(div);
      });
    }

    if (!data.atual && data.hoje.length === 0) {
      lista.innerHTML = "Nenhum serviço hoje.";
    }

  } catch (err) {
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
