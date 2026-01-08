const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  alert("⚠️ Você não está logado. Faça login novamente.");
  window.location.href = "login.html";
}

// ===============================
// CARREGAR SERVIÇOS (ADMIN)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  carregarServicosAdmin();
});

async function carregarServicosAdmin() {
  const lista = document.getElementById("listaAdmin");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch(`${API}/projects/admin/all`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const erro = await res.text();
      console.error("ERRO ADMIN ALL:", erro);
      lista.innerHTML = "Erro ao carregar serviços";
      return;
    }

    const servicos = await res.json();
    lista.innerHTML = "";

    if (servicos.length === 0) {
      lista.innerHTML = "Nenhum serviço encontrado.";
      return;
    }

    servicos.forEach(s => {
      const div = document.createElement("div");

      const statusCor = s.status === "concluido" ? "status-concluido" : "status-pendente";

      div.className = "card";
      div.innerHTML = `
        <strong>${s.cliente}</strong><br>
        Técnico: ${s.tecnico?.nome || "N/A"}<br>
        <span class="badge ${statusCor}">${s.status}</span><br><br>
        <button onclick="abrirServico('${s._id}')">Abrir</button>
      `;

      lista.appendChild(div);
    });

  } catch (err) {
    console.error("ERRO carregarServicosAdmin:", err);
    lista.innerHTML = "Erro de conexão com o servidor";
  }
}

// ===============================
// ABRIR SERVIÇO
// ===============================
function abrirServico(id) {
  localStorage.setItem("servicoId", id);
  window.location.href = "servico.html";
}

// ===============================
// FILTRO
// ===============================
function filtrarServicos() {
  const termo = document.getElementById("busca").value.toLowerCase();
  const cards = document.querySelectorAll("#listaAdmin .card");

  cards.forEach(card => {
    const texto = card.innerText.toLowerCase();
    card.style.display = texto.includes(termo) ? "block" : "none";
  });
}
