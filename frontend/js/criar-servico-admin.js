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
  select.innerHTML = `<option value="">Carregando técnicos...</option>`;

  try {
    const res = await fetch(`${API}/auth/tecnicos`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const tecnicos = await res.json();

    console.log("TÉCNICOS RECEBIDOS:", tecnicos);

    if (!res.ok) {
      alert(tecnicos.error || "Erro ao carregar técnicos");
      select.innerHTML = `<option value="">Erro ao carregar</option>`;
      return;
    }

    tecnicosCache = tecnicos;

    select.innerHTML = `<option value="">Selecione o técnico</option>`;

    tecnicos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t._id;
      opt.innerText = `${t.nome} (${t.telefone || "sem telefone"})`;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("ERRO FETCH TÉCNICOS:", err);
    alert("Erro de conexão ao carregar técnicos");
    select.innerHTML = `<option value="">Erro de conexão</option>`;
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

    // ===== WHATSAPP =====
    const tecnico = tecnicosCache.find(t => t._id === tecnicoId);

    if (tecnico && tecnico.telefone) {
      const texto = `
Novo serviço atribuído:

Cliente: ${cliente}
Endereço: ${endereco}
Serviço: ${tipoServico}

Acesse o sistema para iniciar o atendimento.
`;

      const link = `https://wa.me/${tecnico.telefone}?text=${encodeURIComponent(texto)}`;
      window.open(link, "_blank");
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
