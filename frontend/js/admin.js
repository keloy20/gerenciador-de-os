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
      <strong>OS:</strong> ${servico.osNumero || "-"}<br>
      <strong>Cliente:</strong> ${servico.cliente}<br>
      <strong>Técnico:</strong> ${tecnicoNome}<br>
      <strong>Status:</strong>
      <span class="status ${statusClass}">● ${statusLabel}</span>
      <br><br>

      <button onclick="verChamado('${servico._id}')">👁 Ver Chamado</button>
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
    return (
      s.cliente?.toLowerCase().includes(termo) ||
      s.osNumero?.toLowerCase().includes(termo) ||
      s.tecnico?.nome?.toLowerCase().includes(termo)
    );
  });

  renderLista(filtrados);
}

// ===============================
// VER CHAMADO
// ===============================
function verChamado(id) {
  localStorage.setItem("servicoIdAdmin", id);
  window.location.href = "ver-chamado.html";
}

// ===============================
// ABRIR PDF (COM TOKEN)
// ===============================
function abrirPDF(id) {
  fetch(`${API}/projects/${id}/pdf`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    window.open(url, "_blank");
  })
  .catch(err => {
    console.error(err);
    alert("Erro ao abrir PDF");
  });
}
