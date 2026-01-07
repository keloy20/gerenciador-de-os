const API = "https://gerenciador-de-os.onrender.com/";
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

    document.getElementById("clienteNome").innerText = servico.cliente || "Cliente";

    // ANTES
    const antesDiv = document.getElementById("fotosAntesPreview");
    antesDiv.innerHTML = "";

    if (servico.antes && servico.antes.fotos) {
      servico.antes.fotos.forEach(url => {
        antesDiv.innerHTML += `<img src="${url}">`;
      });
      document.getElementById("relatorioAntes").value = servico.antes.relatorio || "";
    }

    // DEPOIS
    const depoisDiv = document.getElementById("fotosDepoisPreview");
    depoisDiv.innerHTML = "";

    if (servico.depois && servico.depois.fotos) {
      servico.depois.fotos.forEach(url => {
        depoisDiv.innerHTML += `<img src="${url}">`;
      });
      document.getElementById("relatorioDepois").value = servico.depois.relatorio || "";
    }

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

  if (!input) {
    alert("Input fotosAntes não encontrado");
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
    alert("Input fotosDepois não encontrado");
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

    alert("DEPOIS salvo com sucesso!");
    carregarServico();

  } catch (err) {
    console.error(err);
    alert("Erro de conexão ao salvar DEPOIS");
  }
}
