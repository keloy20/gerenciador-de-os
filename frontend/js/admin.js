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
function renderizarServicos(servicos) {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "";

  if (servicos.length === 0) {
    lista.innerHTML = "Nenhum serviço encontrado.";
    return;
  }

  servicos.forEach(servico => {
    const div = document.createElement("div");
    div.classList.add("card");

    const statusClass = servico.status === "concluido" ? "status-concluido" : "status-pendente";
    const tecnicoNome = servico.tecnico?.nome || "—";

    div.innerHTML = `
      <strong>Cliente:</strong> ${servico.cliente}<br>
      <strong>Técnico:</strong> ${tecnicoNome}<br>
      <strong>Status:</strong> 
      <span class="badge ${statusClass}">
        ${servico.status === "concluido" ? "Concluído" : "Em andamento"}
      </span>
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
  const texto = document.getElementById("busca").value.toLowerCase();

  const filtrados = todosServicos.filter(s => {
    const cliente = s.cliente?.toLowerCase() || "";
    const tecnico = s.tecnico?.nome?.toLowerCase() || "";
    return cliente.includes(texto) || tecnico.includes(texto);
  });

  renderizarServicos(filtrados);
}

// ===============================
// ABRIR PDF
// ===============================
function abrirPDF(id) {
  window.open(`${API}/projects/${id}/pdf?token=${token}`, "_blank");
}
