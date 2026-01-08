const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => {

  const inputCliente = document.getElementById("cliente");
  const listaUnidades = document.getElementById("listaUnidades");
  const boxTimao = document.getElementById("boxTimao");

  if (!inputCliente) {
    console.error("❌ input cliente não encontrado no HTML");
    return;
  }

  inputCliente.addEventListener("input", buscarUnidades);

  carregarTecnicos();

});

// ===============================
// CARREGAR TÉCNICOS
// ===============================
async function carregarTecnicos() {
  try {
    const res = await fetch(`${API}/auth/tecnicos`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tecnicos = await res.json();

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
// BUSCAR UNIDADES (TIMÃO)
// ===============================
async function buscarUnidades() {
  const nome = document.getElementById("cliente").value.trim().toLowerCase();
  const listaUnidades = document.getElementById("listaUnidades");
  const boxTimao = document.getElementById("boxTimao");

  if (nome !== "timao") {
    listaUnidades.innerHTML = "";
    boxTimao.style.display = "none";
    return;
  }

  boxTimao.style.display = "block";

  try {
    const res = await fetch(`${API}/clientes/buscar?nome=${encodeURIComponent(nome)}`);
    const unidades = await res.json();

    listaUnidades.innerHTML = "";

    unidades.forEach(u => {
      const li = document.createElement("li");
      li.innerText = `${u.nome} - ${u.marca}`;
      li.onclick = () => selecionarUnidade(u);
      listaUnidades.appendChild(li);
    });

  } catch (err) {
    console.error(err);
  }
}

function selecionarUnidade(unidade) {
  document.getElementById("unidade").value = unidade.nome;
  document.getElementById("marca").value = unidade.marca;
  document.getElementById("listaUnidades").innerHTML = "";
}

// ===============================
// CRIAR SERVIÇO ADMIN
// ===============================
async function criarServicoAdmin() {
  const cliente = document.getElementById("cliente").value;
  const unidade = document.getElementById("unidade").value;
  const marca = document.getElementById("marca").value;
  const endereco = document.getElementById("endereco").value;
  const tipoServico = document.getElementById("tipoServico").value;
  const tecnicoId = document.getElementById("tecnico").value;
  const msg = document.getElementById("msg");

  if (!cliente || !endereco || !tipoServico || !tecnicoId) {
    msg.innerText = "Preencha todos os campos";
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
    }, 1000);

  } catch (err) {
    console.error(err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
