const API = "https://gerenciador-de-os.onrender.com/projects";
const token = localStorage.getItem("token");
const servicoId = localStorage.getItem("servicoId");

if (!token || !servicoId) {
  alert("Sessão inválida. Voltando ao dashboard.");
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
  carregarServico();
});

// ===============================
// CARREGAR SERVIÇO
// ===============================
async function carregarServico() {
  try {
    const res = await fetch(`${API}/servico/${servicoId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao carregar serviço");
      return;
    }

    document.getElementById("clienteNome").innerText = data.cliente || "Cliente";

    // ===== ANTES =====
    const antesDiv = document.getElementById("fotosAntesPreview");
    antesDiv.innerHTML = "";

    if (data.antes && data.antes.fotos && data.antes.fotos.length > 0) {
      data.antes.fotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        antesDiv.appendChild(img);
      });
    }

    document.getElementById("relatorioAntes").value = data.antes?.relatorio || "";

    // ===== DEPOIS =====
    const depoisDiv = document.getElementById("fotosDepoisPreview");
    depoisDiv.innerHTML = "";

    if (data.depois && data.depois.fotos && data.depois.fotos.length > 0) {
      data.depois.fotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        depoisDiv.appendChild(img);
      });
    }

    document.getElementById("relatorioDepois").value = data.depois?.relatorio || "";

  } catch (err) {
    console.error(err);
    alert("Erro de conexão com o servidor");
  }
}

// ===============================
// SALVAR ANTES
// ===============================
async function salvarAntes() {
  const input = document.getElementById("fotosAntes");
  const relatorio = document.getElementById("relatorioAntes").value;

  if (!input || input.files.length === 0) {
    alert("Selecione pelo menos uma foto (ANTES)");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < input.files.length; i++) {
    formData.append("fotos", input.files[i]);
  }

  formData.append("relatorio", relatorio);

  try {
    const res = await fetch(`${API}/servico/${servicoId}/antes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao salvar ANTES");
      return;
    }

    alert("ANTES salvo com sucesso!");
    carregarServico();

  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao salvar ANTES");
  }
}

// ===============================
// SALVAR DEPOIS
// ===============================
async function salvarDepois() {
  const input = document.getElementById("fotosDepois");
  const relatorio = document.getElementById("relatorioDepois").value;

  if (!input || input.files.length === 0) {
    alert("Selecione pelo menos uma foto (DEPOIS)");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < input.files.length; i++) {
    formData.append("fotos", input.files[i]);
  }

  formData.append("relatorio", relatorio);

  try {
    const res = await fetch(`${API}/servico/${servicoId}/depois`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao salvar DEPOIS");
      return;
    }

    alert("DEPOIS salvo com sucesso!");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao salvar DEPOIS");
  }
}
