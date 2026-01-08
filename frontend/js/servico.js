const API = "https://gerenciador-de-os.onrender.com";
const servicoId = localStorage.getItem("servicoId");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}


// ===============================
// CARREGAR SERVIÇO
// ===============================
async function carregarServico() {
  try {
    // 🔥 1. Avisa o backend que o técnico abriu o serviço (muda para em_andamento)
    await fetch(`${API}/projects/${servicoId}/abrir`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // 🔥 2. Busca os dados do serviço
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

    // 🔥 3. Preenche os dados na tela
    document.getElementById("clienteNome").innerText = data.cliente;
    document.getElementById("osNumero").innerText = data.osNumero || "-";

    // ANTES
    const antesDiv = document.getElementById("fotosAntesPreview");
    antesDiv.innerHTML = "";

    if (data.antes?.fotos?.length) {
      data.antes.fotos.forEach(url => {
        antesDiv.innerHTML += `<img src="${url}">`;
      });
      document.getElementById("relatorioAntes").value = data.antes.relatorio || "";
      document.getElementById("observacaoAntes").value = data.antes.observacao || "";
    }

    // DEPOIS
    const depoisDiv = document.getElementById("fotosDepoisPreview");
    depoisDiv.innerHTML = "";

    if (data.depois?.fotos?.length) {
      data.depois.fotos.forEach(url => {
        depoisDiv.innerHTML += `<img src="${url}">`;
      });
      document.getElementById("relatorioDepois").value = data.depois.relatorio || "";
      document.getElementById("observacaoDepois").value = data.depois.observacao || "";
    }

  } catch (err) {
    console.error(err);
    alert("Erro de conexão com servidor");
  }
}


carregarServico();

// ===============================
// SALVAR ANTES
// ===============================
async function salvarAntes() {
  const fotos = document.getElementById("fotosAntes").files;
  const relatorio = document.getElementById("relatorioAntes").value;

  if (fotos.length === 0) {
    alert("Selecione pelo menos uma foto");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotos.length; i++) {
    formData.append("fotos", fotos[i]);
  }

  formData.append("relatorio", relatorio);

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


// SALVAR DEPOIS

async function salvarDepois() {
  const fotos = document.getElementById("fotosDepois").files;
  const relatorio = document.getElementById("relatorioDepois").value;

  if (fotos.length === 0) {
    alert("Selecione pelo menos uma foto");
    return;
  }

  const formData = new FormData();

  for (let i = 0; i < fotos.length; i++) {
    formData.append("fotos", fotos[i]);
  }

  formData.append("relatorio", relatorio);

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

  alert("DEPOIS salvo com sucesso!");
  window.location.href = "dashboard.html";
}
