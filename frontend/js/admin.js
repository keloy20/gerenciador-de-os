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
  lista.innerHTML = `<tr><td colspan="8">Carregando...</td></tr>`;

  try {
    const res = await fetch(`${API}/projects/admin/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      lista.innerHTML = `<tr><td colspan="8">${data.error || "Erro ao carregar serviços"}</td></tr>`;
      return;
    }

    todosServicos = data;
    renderLista(todosServicos);
    atualizarCards(todosServicos);

  } catch (err) {
    console.error(err);
    lista.innerHTML = `<tr><td colspan="8">Erro de conexão com o servidor</td></tr>`;
  }
}

// ===============================
// ATUALIZAR CARDS (TOPO)
// ===============================
function atualizarCards(servicos) {
  const total = servicos.length;
  const concluidos = servicos.filter(s => s.status === "concluido").length;
  const andamento = servicos.filter(s => s.status === "em_andamento").length;
  const aguardando = servicos.filter(s => s.status === "aguardando_tecnico").length;

  document.getElementById("totalOS").innerText = total;
  document.getElementById("totalConcluidos").innerText = concluidos;
  document.getElementById("totalAndamento").innerText = andamento;
  document.getElementById("totalAguardando").innerText = aguardando;
}

// ===============================
// RENDERIZAR LISTA (TABELA)
// ===============================
function renderLista(servicos) {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "";

  if (servicos.length === 0) {
    lista.innerHTML = `<tr><td colspan="8">Nenhum serviço encontrado.</td></tr>`;
    return;
  }

  servicos.forEach(servico => {

    let statusLabel = "";
    let statusClass = "";

    if (servico.status === "aguardando_tecnico") {
      statusLabel = "Aguardando Técnico";
      statusClass = "status aguardando_tecnico";
    } else if (servico.status === "em_andamento") {
      statusLabel = "Em Andamento";
      statusClass = "status em_andamento";
    } else if (servico.status === "concluido") {
      statusLabel = "Concluído";
      statusClass = "status concluido";
    }

    const tecnicoNome = servico.tecnico?.nome || "—";
    const dataFormatada = new Date(servico.dataServico).toLocaleDateString("pt-BR");

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${servico.osNumero || "-"}</td>
      <td>${servico.cliente || "-"}</td>
      <td>${servico.Subcliente || "-"}</td>
      <td>${servico.tipoServico || "-"}</td>
      <td>${tecnicoNome}</td>
      <td><span class="${statusClass}">${statusLabel}</span></td>
      <td>${dataFormatada}</td>
      <td>
        <button onclick="verChamado('${servico._id}')">👁</button>
        <button onclick="abrirPDF('${servico._id}')">⬇️</button>
      </td>
    `;

    lista.appendChild(tr);
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
  .then(res => {
    if (!res.ok) throw new Error("Erro ao gerar PDF");
    return res.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "OS-" + id + ".pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  })
  .catch(err => {
    console.error(err);
    alert("Erro ao baixar PDF");
  });
}

// ===============================
// LOGOUT
// ===============================
document.getElementById("btnLogout")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});
