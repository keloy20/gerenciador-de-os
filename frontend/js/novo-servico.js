const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

const inputCliente = document.getElementById("cliente");
const listaUnidades = document.getElementById("listaUnidades");
const campoUnidade = document.getElementById("unidade");
const campoMarca = document.getElementById("marca");

inputCliente.addEventListener("input", onClienteChange);

function onClienteChange() {
  const nome = inputCliente.value.trim().toLowerCase();

  // 🔹 Se NÃO for timao → esconde unidade/marca e limpa
  if (nome !== "timao") {
    listaUnidades.innerHTML = "";
    campoUnidade.value = "";
    campoMarca.value = "";

    campoUnidade.parentElement.style.display = "none";
    campoMarca.parentElement.style.display = "none";
    return;
  }

  // 🔹 Se for timao → mostra campos e busca unidades
  campoUnidade.parentElement.style.display = "block";
  campoMarca.parentElement.style.display = "block";

  buscarUnidades(nome);
}

async function buscarUnidades(nome) {
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
    console.error(err);
  }
}

function selecionarUnidade(unidade) {
  campoUnidade.value = unidade.nome;
  campoMarca.value = unidade.marca;
  listaUnidades.innerHTML = "";
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

  if (!cliente || !endereco || !tipoServico) {
    msg.innerText = "Preencha cliente, endereço e tipo de serviço";
    return;
  }

  // 🔴 Se for TIMAO e não tiver unidade/marca → bloqueia
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
    console.error(err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
