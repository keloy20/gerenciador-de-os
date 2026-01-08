const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

const inputCliente = document.getElementById("clienteBusca");
const listaUnidades = document.getElementById("listaUnidades");

document.addEventListener("DOMContentLoaded", () => {
  carregarTecnicos();
  inputCliente.addEventListener("input", buscarUnidades);
});

let tecnicosCache = [];

// ===============================
// CARREGAR TÉCNICOS
// ===============================
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

// ===============================
// AUTOCOMPLETE TIMÃO
// ===============================
async function buscarUnidades() {
  const nome = inputCliente.value.trim();

  if (nome.length < 2) {
    listaUnidades.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`${API}/clientes/buscar?nome=${encodeURIComponent(nome)}`);
    const unidades = await res.json();

    listaUnidades.innerHTML = "";

    if (unidades.length === 0) {
      listaUnidades.innerHTML = `<li>Nenhuma unidade encontrada</li>`;
      return;
    }

    unidades.forEach(u => {
      const li = document.createElement("li");
      li.innerText = `${u.nome} - ${u.marca}`;
      li.onclick = () => selecionarUnidade(u);
      listaUnidades.appendChild(li);
    });

  } catch (err) {
    console.error("Erro buscarUnidades:", err);
  }
}

function selecionarUnidade(unidade) {
  document.getElementById("cliente").value = "timao";
  document.getElementById("unidade").value = unidade.nome;
  document.getElementById("marca").value = unidade.marca;
  inputCliente.value = `${unidade.nome} - ${unidade.marca}`;
  listaUnidades.innerHTML = "";
}

// ===============================
// CRIAR SERVIÇO (ADMIN)
// ===============================
async function criarServico() {
  const cliente = document.getElementById("cliente").value || inputCliente.value;
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

  // 🔴 REGRA: só exige unidade/marca se for TIMAO
  if (cliente.toLowerCase() === "timao" && (!unidade || !marca)) {
    msg.innerText = "Selecione a unidade e marca do Timão";
    return;
  }

  try {
    const res = await fetch(`${API}/projects/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        cliente,
        unidade: cliente.toLowerCase() === "timao" ? unidade : null,
        marca: cliente.toLowerCase() === "timao" ? marca : null,
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

    msg.innerText = "Serviço criado e enviado ao técnico com sucesso!";

    // limpar
    inputCliente.value = "";
    document.getElementById("cliente").value = "";
    document.getElementById("unidade").value = "";
    document.getElementById("marca").value = "";
    document.getElementById("endereco").value = "";
    document.getElementById("tipoServico").value = "";
    document.getElementById("tecnico").value = "";
    listaUnidades.innerHTML = "";

  } catch (err) {
    console.error("Erro ao criar serviço:", err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
