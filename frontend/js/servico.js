const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");
const servicoId = localStorage.getItem("servicoId");

if (!token || !servicoId) {
  alert("Sessão inválida. Volte ao dashboard.");
  window.location.href = "dashboard.html";
}

// ===============================
// CARREGAR SERVIÇO
// ===============================
async function carregarServico() {
  try {
    // 1. Marca como em andamento
    await fetch(`${API}/projects/${servicoId}/abrir`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // 2. Busca dados do serviço
    const res = await fetch(`${API}/projects/${servicoId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao carregar serviço");
      return;
    }

    console.log("SERVIÇO:", data);

    document.getElementById("clienteNome").innerText = data.cliente || "-";
    document.getElementById("osNumero").innerText = data.osNumero || "-";

    // ===== ANTES =====
    const antesDiv = document.getElementById("fotosAntesPreview");
    antesDiv.innerHTML = "";

    if (data.antes?.fotos?.length) {
      data.antes.fotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "100px";
        img.style.marginRight = "5px";
        antesDiv.appendChild(img);
      });
    }

    document.getElementById("relatorioAntes").value = data.antes?.relatorio || "";
    document.getElementById("observacaoAntes").value = data.antes?.observacao || "";

    // ===== DEPOIS =====
    const depoisDiv = document.getElementById("fotosDepoisPreview");
    depoisDiv.innerHTML = "";

    if (data.depois?.fotos?.length) {
      data.depois.fotos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.style.maxWidth = "100px";
        img.style.marginRight = "5px";
        depoisDiv.appendChild(img);
      });
    }

    document.getElementById("relatorioDepois").value = data.depois?.relatorio || "";
    document.getElementById("observacaoDepois").value = data.depois?.observacao || "";

  } catch (err) {
    console.error("ERRO carregarServico:", err);
    alert("Erro de conexão com servidor");
  }
}

document.addEventListener("DOMContentLoaded", carregarServico);

// ===============================
// SALVAR ANTES
// ===============================
async function salvarAntes() {
  const fotosInput = document.getElementById("fotosAntes");
  const relatorio = document.getElementById("relatorioAntes").value;
  const observacao = document.getElementById("observacaoAntes").value;

  if (!fotosInput || fotosInput.files.length === 0) {
    alert("Selecione pelo menos uma foto (ANTES)");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotosInput.files.length; i++) {
    formData.append("fotos", fotosInput.files[i]);
  }

  formData.append("relatorio", relatorio);
  formData.append("observacao", observacao);

  try {
    const res = await fetch(`${API}/projects/${servicoId}/antes`, {
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
    carregarServico(); // 🔥 RECARREGA NA TELA

  } catch (err) {
    console.error("ERRO salvarAntes:", err);
    alert("Erro de conexão ao salvar ANTES");
  }
}

// ===============================
// SALVAR DEPOIS (FINALIZA)
// ===============================
async function salvarDepois() {
  const fotosInput = document.getElementById("fotosDepois");
  const relatorio = document.getElementById("relatorioDepois").value;
  const observacao = document.getElementById("observacaoDepois").value;

  if (!fotosInput || fotosInput.files.length === 0) {
    alert("Selecione pelo menos uma foto (DEPOIS)");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotosInput.files.length; i++) {
    formData.append("fotos", fotosInput.files[i]);
  }

  formData.append("relatorio", relatorio);
  formData.append("observacao", observacao);

  try {
    const res = await fetch(`${API}/projects/${servicoId}/depois`, {
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

    alert("DEPOIS salvo com sucesso! Serviço finalizado.");
    localStorage.removeItem("servicoId");
    window.location.href = "dashboard.html";

  } catch (err) {
    console.error("ERRO salvarDepois:", err);
    alert("Erro de conexão ao salvar DEPOIS");
  }
}
