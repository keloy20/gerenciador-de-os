const API = "https://gerenciador-de-os.onrender.com/";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

let todosServicos = [];

if (!token || role !== "admin") {
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", carregarAdmin);

// ===============================
// CARREGAR TODOS OS SERVIÇOS (ADMIN)
// ===============================
async function carregarAdmin() {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch(`${API}/projects/admin/all`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      lista.innerHTML = data.error || "Erro ao carregar dados";
      return;
    }

    todosServicos = data;
    renderLista(data);

  } catch (err) {
    console.error(err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

// ===============================
// RENDERIZAR LISTA
// ===============================
function renderLista(listaDados) {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "";

  if (listaDados.length === 0) {
    lista.innerHTML = "Nenhum serviço encontrado.";
    return;
  }

  listaDados.forEach(servico => {
    const div = document.createElement("div");
    div.className = "card";

    const dataFormatada = formatarData(servico.createdAt || servico.dataServico);

    div.innerHTML = `
      <strong>Cliente:</strong> ${servico.cliente}<br>
      <strong>Unidade:</strong> ${servico.unidade || "-"}<br>
      <strong>Marca:</strong> ${servico.marca || "-"}<br>
      <strong>Técnico:</strong> ${servico.tecnico?.nome || "N/A"}<br>
      <strong>Data:</strong> ${dataFormatada}<br>
      <span class="status ${servico.status}">${servico.status}</span><br><br>

      <button onclick="toggleDetalhes('${servico._id}')">Ver Detalhes</button>
      <button onclick="gerarPDF('${servico._id}')">📄 Gerar PDF</button>

      <div id="detalhes-${servico._id}" style="display:none; margin-top:10px;">
        ${renderBloco("Antes", servico.antes)}
        ${renderBloco("Depois", servico.depois)}
      </div>
    `;

    lista.appendChild(div);
  });
}

// ===============================
// FILTRAR POR CLIENTE OU TÉCNICO
// ===============================
function filtrarServicos() {
  const termo = document.getElementById("busca").value.toLowerCase();

  const filtrados = todosServicos.filter(servico => {
    const cliente = servico.cliente?.toLowerCase() || "";
    const unidade = servico.unidade?.toLowerCase() || "";
    const marca = servico.marca?.toLowerCase() || "";
    const tecnico = servico.tecnico?.nome?.toLowerCase() || "";

    return (
      cliente.includes(termo) ||
      unidade.includes(termo) ||
      marca.includes(termo) ||
      tecnico.includes(termo)
    );
  });

  renderLista(filtrados);
}

// ===============================
// MOSTRAR / ESCONDER DETALHES
// ===============================
function toggleDetalhes(id) {
  const div = document.getElementById(`detalhes-${id}`);
  div.style.display = div.style.display === "none" ? "block" : "none";
}

// ===============================
// BLOCO ANTES / DEPOIS
// ===============================
function renderBloco(titulo, bloco) {
  if (!bloco || !bloco.fotos || bloco.fotos.length === 0) {
    return `<p><strong>${titulo}:</strong> sem dados</p>`;
  }

  let html = `
    <p><strong>${titulo}</strong></p>
    <div class="fotos-grid">
  `;

  bloco.fotos.forEach(url => {
    html += `<img src="${url}">`;
  });

  html += `
    </div>
    <p><em>${bloco.relatorio || ""}</em></p>
    <hr>
  `;

  return html;
}

// ===============================
// FORMATAR DATA
// ===============================
function formatarData(data) {
  if (!data) return "—";

  const d = new Date(data);
  return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

// ===============================
// GERAR PDF
// ===============================
function gerarPDF(id) {
  const url = `${API}/projects/${id}/pdf`;

  fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `servico-${id}.pdf`;
      link.click();
    })
    .catch(err => {
      alert("Erro ao gerar PDF");
      console.error(err);
    });
}
