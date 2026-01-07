const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", carregarTecnicos);

let tecnicosCache = [];

async function carregarTecnicos() {
  try {
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

  } catch (err) {
    console.error("Erro ao carregar técnicos:", err);
    alert("Erro ao carregar técnicos");
  }
}

async function criarServico() {
  const cliente = document.getElementById("cliente").value;
  const endereco = document.getElementById("endereco").value;
  const tipoServico = document.getElementById("tipoServico").value;
  const tecnicoId = document.getElementById("tecnico").value;
  const msg = document.getElementById("msg");

  if (!cliente || !endereco || !tipoServico || !tecnicoId) {
    msg.innerText = "Preencha todos os campos";
    return;
  }

  try {
    const res = await fetch(`${API}/projects/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ cliente, endereco, tipoServico, tecnicoId })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.error || "Erro ao criar serviço";
      return;
    }

    // WHATSAPP
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
    document.getElementById("cliente").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("tipoServico").value = "";
    document.getElementById("tecnico").value = "";

  } catch (err) {
    console.error("Erro ao criar serviço:", err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
