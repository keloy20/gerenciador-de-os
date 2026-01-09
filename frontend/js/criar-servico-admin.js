const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

let tecnicosCache = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarTecnicos();
});

// ===============================
// CARREGAR TÉCNICOS
// ===============================
async function carregarTecnicos() {
  const select = document.getElementById("tecnico");

  try {
    const res = await fetch(`${API}/auth/tecnicos`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const tecnicos = await res.json();

    if (!res.ok) {
      console.error("Erro técnicos:", tecnicos);
      alert(tecnicos.error || "Erro ao carregar técnicos");
      return;
    }

    tecnicosCache = tecnicos;

    select.innerHTML = `<option value="">Selecione o técnico</option>`;

    tecnicos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t._id;
      opt.innerText = t.nome;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Erro ao carregar técnicos:", err);
    alert("Erro de conexão ao carregar técnicos");
  }
}

// ===============================
// CRIAR SERVIÇO (ADMIN)
// ===============================
async function criarServicoAdmin() {
  const cliente = document.getElementById("cliente").value;
  const subgrupo = document.getElementById("subgrupo").value;
  const unidade = document.getElementById("unidade").value;
  const marca = document.getElementById("marca").value;
  const endereco = document.getElementById("endereco").value;
  const tipoServico = document.getElementById("tipoServico").value;
  const tecnicoId = document.getElementById("tecnico").value;
  const msg = document.getElementById("msg");

  if (!cliente || !endereco || !tipoServico || !tecnicoId) {
    msg.innerText = "Preencha todos os campos obrigatórios";
    return;
  }

  try {
    const res = await fetch(`${API}/projects/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        cliente,
        subgrupo,
        unidade,
        marca,
        endereco,
        tipoServico,
        tecnicoId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.error || "Erro ao criar serviço";
      return;
    }

    msg.innerText = "Serviço criado com sucesso!";

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 800);

  } catch (err) {
    console.error(err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
