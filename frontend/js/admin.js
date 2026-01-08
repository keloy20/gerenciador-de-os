const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

let todosServicos = [];

document.addEventListener("DOMContentLoaded", carregarAdmin);

// ===============================
// CARREGAR SERVIÇOS (ADMIN)
// ===============================
async function carregarAdmin() {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "Carregando serviços...";

  try {
    const res = await fetch(`${API}/projects/admin/all`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      lista.innerHTML = data.error || "Erro ao carregar serviços";
      return;
    }

    todosServicos = data;
    renderizarServicos(data);

  } catch (err) {
    console.error(err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

// ===============================
// RENDERIZAR LISTA
// ===============================
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
  } else {
    statusLabel = servico.status;
    statusClass = "";
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


// FILTRO

function filtrarServicos() {
  const texto = document.getElementById("busca").value.toLowerCase();

  const filtrados = todosServicos.filter(s => {
    const cliente = s.cliente?.toLowerCase() || "";
    const tecnico = s.tecnico?.nome?.toLowerCase() || "";
    return cliente.includes(texto) || tecnico.includes(texto);
  });

  renderizarServicos(filtrados);
}

// ABRIR PDF

function abrirPDF(id) {
  window.open(`${API}/projects/${id}/pdf?token=${token}`, "_blank");
}
