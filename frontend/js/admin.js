const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

let todosServicos = [];

if (!token) {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", carregarAdmin);

async function carregarAdmin() {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch(`${API}/projects/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    todosServicos = data;
    renderLista(todosServicos);

  } catch (err) {
    console.error(err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

function renderLista(servicos) {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "";

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

    const tecnicoNome = servico.tecnico?.nome || "—";

    const div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
      <strong>OS:</strong> ${servico.osNumero}<br>
      <strong>Cliente:</strong> ${servico.cliente}<br>
      <strong>Técnico:</strong> ${tecnicoNome}<br>
      <span class="status ${statusClass}">● ${statusLabel}</span><br><br>
      <button onclick="abrirPDF('${servico._id}')">📄 PDF</button>
      <hr>
    `;

    lista.appendChild(div);
  });
}

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

function abrirPDF(id) {
  window.open(`${API}/projects/${id}/pdf`, "_blank");
}
