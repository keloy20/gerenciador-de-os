const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

const inputCliente = document.getElementById("clienteBusca");
const listaUnidades = document.getElementById("listaUnidades");

inputCliente.addEventListener("input", buscarUnidades);

// ===============================
// AUTOCOMPLETE TIMAO
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
// CARREGAR TÉCNICOS
// ===============================
document.addEventListener("DOMContentLoaded", carregarTecnicos);

async function carregarTecnicos() {
  try {
    const res = await fetch(`${API}/auth/tecnicos`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    const tecnicos = await res.json();
    const select = document.getElementById("tecnico");

    tecnicos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t._id;
      opt.innerText = t.nome;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Erro carregarTecnicos:", err);
  }
}

// ===============================
// CRIAR SERVIÇO
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

    msg.innerText = "Serviço criado com sucesso!";

  } catch (err) {
    console.error(err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
