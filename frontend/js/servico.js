const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");
const servicoId = localStorage.getItem("servicoId");

if (!token || !servicoId) {
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
    const res = await fetch(`${API}/projects/${servicoId}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const servico = await res.json();

    if (!res.ok) {
      alert(servico.error || "Erro ao carregar serviço");
      return;
    }

    // Nome do cliente
    document.getElementById("clienteNome").innerText = servico.cliente || "Cliente";

    // ---------- ANTES ----------
    const antesDiv = document.getElementById("fotosAntesPreview");
    antesDiv.innerHTML = "";

    if (servico.antes && servico.antes.fotos && servico.antes.fotos.length > 0) {
      servico.antes.fotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        antesDiv.appendChild(img);
      });
    }

    document.getElementById("relatorioAntes").value = servico.antes?.relatorio || "";

    // ---------- DEPOIS ----------
    const depoisDiv = document.getElementById("fotosDepoisPreview");
    depoisDiv.innerHTML = "";

    if (servico.depois && servico.depois.fotos && servico.depois.fotos.length > 0) {
      servico.depois.fotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        depoisDiv.appendChild(img);
      });
    }

    document.getElementById("relatorioDepois").value = servico.depois?.relatorio || "";

  } catch (err) {
    console.error(err);
    alert("Erro de conexão com o servidor ao carregar serviço");
  }
}

// ===============================
// SALVAR ANTES
// ===============================
async function salvarAntes() {
  const input = document.getElementById("fotosAntes");
  const relatorio = document.getElementById("relatorioAntes").value;

  if (!input) {
    alert("Input de fotos ANTES não encontrado");
    return;
  }

  const fotos = input.files;

  if (fotos.length === 0) {
    alert("Selecione pelo menos uma foto (ANTES)");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotos.length; i++) {
    formData.append("fotos", fotos[i]);
  }

  formData.append("relatorio", relatorio);

  try {
    const res = await fetch(`${API}/projects/${servicoId}/antes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
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

  if (!input) {
    alert("Input de fotos DEPOIS não encontrado");
    return;
  }

  const fotos = input.files;

  if (fotos.length === 0) {
    alert("Selecione pelo menos uma foto (DEPOIS)");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotos.length; i++) {
    formData.append("fotos", fotos[i]);
  }

  formData.append("relatorio", relatorio);

  try {
    const res = await fetch(`${API}/projects/${servicoId}/depois`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao salvar DEPOIS");
      return;
    }

    alert("Serviço finalizado com sucesso!");

    // 🔥 limpa o servicoId e volta pro dashboard
    localStorage.removeItem("servicoId");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao salvar DEPOIS");
  }
}

