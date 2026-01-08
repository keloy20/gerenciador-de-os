const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

async function carregarDashboard() {
  const lista = document.getElementById("listaServicos");
  lista.innerHTML = "Carregando...";

  try {
    const res = await fetch(`${API}/projects/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    lista.innerHTML = "";

    if (data.length === 0) {
      lista.innerHTML = "Nenhum serviço encontrado.";
      return;
    }

    data.forEach(servico => {
      const div = document.createElement("div");
      div.classList.add("card");

      div.innerHTML = `
        <strong>${servico.cliente}</strong><br>
        <small>${servico.tipoServico}</small><br>
        <button onclick="abrirServico('${servico._id}')">Abrir</button>
      `;

      lista.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    lista.innerHTML = "Erro ao carregar serviços";
  }
}

function abrirServico(id) {
  localStorage.setItem("servicoId", id);
  window.location.href = "servico.html";
}

carregarDashboard();
