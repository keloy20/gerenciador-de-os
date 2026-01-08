const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

const inputCliente = document.getElementById("cliente");
const listaUnidades = document.getElementById("listaUnidades");
const campoUnidade = document.getElementById("unidade");
const campoMarca = document.getElementById("marca");

const boxUnidade = document.getElementById("boxUnidade");
const boxMarca = document.getElementById("boxMarca");

inputCliente.addEventListener("input", onClienteChange);

// ===============================
// QUANDO DIGITA CLIENTE
// ===============================
function onClienteChange() {
  const nome = inputCliente.value.trim().toLowerCase();

  // 🔹 NÃO é timao → esconde tudo
  if (nome !== "timao") {
    listaUnidades.innerHTML = "";
    listaUnidades.style.display = "none";

    campoUnidade.value = "";
    campoMarca.value = "";

    boxUnidade.style.display = "none";
    boxMarca.style.display = "none";
    return;
  }

  // 🔹 É timao → mostra campos e busca unidades
  boxUnidade.style.display = "block";
  boxMarca.style.display = "block";
  listaUnidades.style.display = "block";

  buscarUnidades(nome);
}

// ===============================
// BUSCAR UNIDADES DO TIMAO
// ===============================
async function buscarUnidades(nome) {
  if (nome.length < 2) {
    listaUnidades.innerHTML = "";
    listaUnidades.style.display = "none";
    return;
  }

  try {
    const res = await fetch(`${API}/clientes/buscar?nome=${encodeURIComponent(nome)}`);
    const unidades = await res.json();

    listaUnidades.innerHTML = "";

    if (!Array.isArray(unidades) || unidades.length === 0) {
      listaUnidades.innerHTML = `<li>Nenhuma unidade encontrada</li>`;
      listaUnidades.style.display = "block";
      return;
    }

    unidades.forEach(u => {
      const li = document.createElement("li");
      li.innerText = `${u.nome} - ${u.marca}`;
      li.onclick = () => selecionarUnidade(u);
      listaUnidades.appendChild(li);
    });

    listaUnidades.style.display = "block";

  } catch (err) {
    console.error("Erro ao buscar unidades:", err);
  }
}

// ===============================
// SELECIONAR UNIDADE
// ===============================
function selecionarUnidade(unidade) {
  campoUnidade.value = unidade.nome;
  campoMarca.value = unidade.marca;
  listaUnidades.innerHTML = "";
  listaUnidades.style.display = "none";
}

// ===============================
// CRIAR SERVIÇO (TÉCNICO)
// ===============================
async function criarServico() {
  const cliente = inputCliente.value.trim();
  const unidade = campoUnidade.value.trim();
  const marca = campoMarca.value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const tipoServico = document.getElementById("tipoServico").value.trim();
  const msg = document.getElementById("msg");

  msg.innerText = "";

  if (!cliente || !endereco || !tipoServico) {
    msg.innerText = "Preencha cliente, endereço e tipo de serviço";
    return;
  }

  // 🔴 Se for TIMAO, exige unidade
  if (cliente.toLowerCase() === "timao" && (!unidade || !marca)) {
    msg.innerText = "Selecione a unidade do Timão";
    return;
  }

  try {
    const res = await fetch(`${API}/projects/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        cliente,
        unidade: cliente.toLowerCase() === "timao" ? unidade : "",
        marca: cliente.toLowerCase() === "timao" ? marca : "",
        endereco,
        tipoServico
      })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.error || "Erro ao criar serviço";
      return;
    }

    msg.innerText = "Serviço criado com sucesso!";
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);

  } catch (err) {
    console.error("Erro ao criar serviço:", err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
