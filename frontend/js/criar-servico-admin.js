const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

let tecnicosCache = [];

document.addEventListener("DOMContentLoaded", () => {
  carregarTecnicos();
});

async function carregarTecnicos() {
  const res = await fetch(`${API}/auth/tecnicos`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const tecnicos = await res.json();
  tecnicosCache = tecnicos;

  const select = document.getElementById("tecnico");
  select.innerHTML = `<option value="">Selecione o técnico</option>`;

  tecnicos.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t._id;
    opt.innerText = t.nome;
    select.appendChild(opt);
  });
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

    // WHATSAPP
    const tecnico = tecnicosCache.find(t => t._id === tecnicoId);

    if (tecnico?.telefone) {
      const texto = `Novo serviço atribuído:\n\nCliente: ${cliente}\nSubgrupo: ${subgrupo}\nEndereço: ${endereco}\nServiço: ${tipoServico}`;
      window.open(`https://wa.me/${tecnico.telefone}?text=${encodeURIComponent(texto)}`);
    }

    msg.innerText = "Serviço criado com sucesso!";
  } catch (err) {
    console.error(err);
    msg.innerText = "Erro de conexão com servidor";
  }
}
