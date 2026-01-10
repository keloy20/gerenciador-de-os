const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");
const id = localStorage.getItem("servicoIdAdmin");

if (!token) {
  window.location.href = "login.html";
}


async function carregarChamado() {
  const res = await fetch(`${API}/projects/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await res.json();

  document.getElementById("osNumero").innerText = data.osNumero || "-";
  document.getElementById("cliente").innerText = data.cliente || "-";
  document.getElementById("subgrupo").innerText = data.subgrupo || "-";
  document.getElementById("unidade").innerText = data.unidade || "-";
  document.getElementById("marca").innerText = data.marca || "-";
  document.getElementById("endereco").innerText = data.endereco || "-";
  document.getElementById("tipoServico").innerText = data.tipoServico || "-";
  document.getElementById("status").innerText = data.status || "-";
  document.getElementById("antesRelatorio").innerText = data.antes?.relatorio || "—";
  document.getElementById("depoisRelatorio").innerText = data.depois?.relatorio || "—";
}

carregarChamado();
