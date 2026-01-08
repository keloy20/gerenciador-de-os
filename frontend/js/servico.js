const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");
const servicoId = localStorage.getItem("servicoId");

if (!token || !servicoId) {
  alert("Sessão expirada. Faça login novamente.");
  window.location.href = "login.html";
}

// ===============================
// CARREGAR SERVIÇO
// ===============================
async function carregarServico() {
  try {
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

    document.getElementById("clienteNome").innerText = data.cliente;

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
