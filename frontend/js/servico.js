const API = "https://gerenciador-de-os.onrender.com";
const servicoId = localStorage.getItem("servicoId");
const token = localStorage.getItem("token");

if (!token || !servicoId) {
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", carregarServico);

// ===============================
// CARREGAR SERVIÇO + MARCAR EM ANDAMENTO
// ===============================
async function carregarServico() {
  try {
    // 🔥 AVISA O BACKEND QUE O TÉCNICO ABRIU O CHAMADO
    await fetch(`${API}/projects/${servicoId}/abrir`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // 🔥 BUSCA OS DADOS DO SERVIÇO
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

    // ====== DADOS ======
    document.getElementById("clienteNome").innerText = data.cliente;
    document.getElementById("osNumero").innerText = data.osNumero || "-";
    document.getElementById("statusServico").innerText = data.status;

    // ====== ANTES ======
    const antesDiv = document.getElementById("fotosAntesPreview");
    antesDiv.innerHTML = "";

    if (data.antes?.fotos?.length) {
      data.antes.fotos.forEach(url => {
        antesDiv.innerHTML += `<img src="${url}" style="width:80px;margin:5px;">`;
      });
    }

    document.getElementById("relatorioAntes").value = data.antes?.relatorio || "";
    document.getElementById("observacaoAntes").value = data.antes?.observacao || "";

    // ====== DEPOIS ======
    const depoisDiv = document.getElementById("fotosDepoisPreview");
    depoisDiv.innerHTML = "";

    if (data.depois?.fotos?.length) {
      data.depois.fotos.forEach(url => {
        depoisDiv.innerHTML += `<img src="${url}" style="width:80px;margin:5px;">`;
      });
    }

    document.getElementById("relatorioDepois").value = data.depois?.relatorio || "";
    document.getElementById("observacaoDepois").value = data.depois?.observacao || "";

  } catch (err) {
    console.error(err);
    alert("Erro de conexão com servidor");
  }
}

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
  carregarServico();
}

// ===============================
// SALVAR DEPOIS (FINALIZA)
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
