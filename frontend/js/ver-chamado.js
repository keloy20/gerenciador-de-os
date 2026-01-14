const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");
const id = localStorage.getItem("servicoIdAdmin");

if (!token || !id) {
  window.location.href = "admin.html";
}

async function carregarChamado() {
  try {
    const res = await fetch(`${API}/projects/admin/view/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao carregar chamado");
      return;
    }

    document.getElementById("osNumero").innerText = data.osNumero || "-";
    document.getElementById("cliente").innerText = data.cliente || "-";
    document.getElementById("Subcliente").innerText = data.subcliente || "-";
    document.getElementById("unidade").innerText = data.unidade || "-";
    document.getElementById("marca").innerText = data.marca || "-";
    document.getElementById("endereco").innerText = data.endereco || "-";
    document.getElementById("tipoServico").innerText = data.tipoServico || "-";
    document.getElementById("tecnico").innerText = data.tecnico?.nome || "-";
    document.getElementById("status").innerText = data.status || "-";
    document.getElementById("antesRelatorio").innerText = data.antes?.relatorio || "—";
    document.getElementById("depoisRelatorio").innerText = data.depois?.relatorio || "—";

  } catch (err) {
    console.error(err);
    alert("Erro de conexão com servidor");
  }
}

carregarChamado();
