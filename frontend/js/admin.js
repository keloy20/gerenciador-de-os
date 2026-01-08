const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

let todosServicos = [];

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", carregarAdmin);

// ===============================
// CARREGAR SERVIÇOS (ADMIN)
// ===============================
async function carregarAdmin() {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch(`${API}/projects/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      lista.innerHTML = data.error || "Erro ao carregar serviços";
      return;
    }

    todosServicos = data;
    renderLista(todosServicos);

  } catch (err) {
    console.error(err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

// ===============================
// RENDERIZAR LISTA
// ===============================
function renderLista(servicos) {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "";

  if (servicos.length === 0) {
    lista.innerHTML = "Nenhum serviço encontrado.";
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

    const tecnicoNome = servico.tecnico?.nome || "—";

    div.innerHTML = `
      <strong>Cliente:</strong> ${servico.cliente}<br>
      <strong>Técnico:</strong> ${tecnicoNome}<br>
      <strong>Status:</strong>
      <span class="status ${statusClass}">● ${statusLabel}</span>
      <br><br>

      <button onclick="abrirPDF('${servico._id}')">📄 PDF</button>
      <hr>
    `;

    lista.appendChild(div);
  });
}

// ===============================
// FILTRO
// ===============================
function filtrarServicos() {
  const termo = document.getElementById("busca").value.toLowerCase();

  const filtrados = todosServicos.filter(s => {
    const cliente = s.cliente?.toLowerCase() || "";
    const tecnico = s.tecnico?.nome?.toLowerCase() || "";
    return cliente.includes(termo) || tecnico.includes(termo);
  });

  renderLista(filtrados);
}

// ===============================
// PDF
// ===============================
function abrirPDF(id) {
  window.open(`${API}/projects/${id}/pdf`, "_blank");
}
