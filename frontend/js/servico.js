const API = "https://gerenciador-de-os.onrender.com";
const servicoId = localStorage.getItem("servicoId");
const token = localStorage.getItem("token");

if (!token || !servicoId) {
  window.location.href = "dashboard.html";
}

let primeiraVez = true;
let intervaloAtualizacao = null;

// ===============================
// CARREGAR SERVIÇO + MARCAR EM ANDAMENTO
// ===============================
async function carregarServico() {
  try {
    // 🔥 marca como em_andamento só na primeira vez
    if (primeiraVez) {
      await fetch(`${API}/projects/${servicoId}/abrir`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      primeiraVez = false;
    }

    const res = await fetch(`${API}/projects/${servicoId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache"
      }
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Erro ao carregar serviço");
      return;
    }

    // ====== DADOS ======
    document.getElementById("clienteNome").innerText = data.cliente || "-";
    document.getElementById("osNumero").innerText = data.osNumero || "-";
    document.getElementById("statusServico").innerText = data.status || "-";

    // ====== ANTES ======
    const antesDiv = document.getElementById("fotosAntesPreview");
    antesDiv.innerHTML = "";

    if (data.antes?.fotos?.length) {
      data.antes.fotos.forEach(url => {
        antesDiv.innerHTML += `<img src="${url}" style="width:80px;margin:5px;">`;
      });
    }

    const relatorioAntes = document.getElementById("relatorioAntes");
    const observacaoAntes = document.getElementById("observacaoAntes");

    if (document.activeElement !== relatorioAntes) {
      relatorioAntes.value = data.antes?.relatorio || "";
    }
    if (document.activeElement !== observacaoAntes) {
      observacaoAntes.value = data.antes?.observacao || "";
    }

    // ====== DEPOIS ======
    const depoisDiv = document.getElementById("fotosDepoisPreview");
    depoisDiv.innerHTML = "";

    if (data.depois?.fotos?.length) {
      data.depois.fotos.forEach(url => {
        depoisDiv.innerHTML += `<img src="${url}" style="width:80px;margin:5px;">`;
      });
    }

    const relatorioDepois = document.getElementById("relatorioDepois");
    const observacaoDepois = document.getElementById("observacaoDepois");

    if (document.activeElement !== relatorioDepois) {
      relatorioDepois.value = data.depois?.relatorio || "";
    }
    if (document.activeElement !== observacaoDepois) {
      observacaoDepois.value = data.depois?.observacao || "";
    }

  } catch (err) {
    console.error("Erro ao carregar serviço:", err);
    alert("Erro de conexão com servidor");
  }
}

// ===============================
// INICIAR
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  carregarServico();
  intervaloAtualizacao = setInterval(carregarServico, 3000);
});

window.addEventListener("beforeunload", () => {
  if (intervaloAtualizacao) clearInterval(intervaloAtualizacao);
});

// ===============================
// SALVAR ANTES
// ===============================
async function salvarAntes() {
  const fotos = document.getElementById("fotosAntes").files;
  const relatorio = document.getElementById("relatorioAntes").value;
  const observacao = document.getElementById("observacaoAntes").value;

  if (fotos.length === 0) {
    alert("Selecione pelo menos uma foto");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotos.length; i++) {
    formData.append("fotos", fotos[i]);
  }

  formData.append("relatorio", relatorio);
  formData.append("observacao", observacao);

  const res = await fetch(`${API}/projects/${servicoId}/antes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Erro ao salvar antes");
    return;
  }

  alert("ANTES salvo com sucesso!");
}

// ===============================
// SALVAR DEPOIS
// ===============================
async function salvarDepois() {
  const fotos = document.getElementById("fotosDepois").files;
  const relatorio = document.getElementById("relatorioDepois").value;
  const observacao = document.getElementById("observacaoDepois").value;

  if (fotos.length === 0) {
    alert("Selecione pelo menos uma foto");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotos.length; i++) {
    formData.append("fotos", fotos[i]);
  }

  formData.append("relatorio", relatorio);
  formData.append("observacao", observacao);

  const res = await fetch(`${API}/projects/${servicoId}/depois`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Erro ao salvar depois");
    return;
  }

  alert("Serviço finalizado com sucesso!");
  window.location.href = "dashboard.html";
}
