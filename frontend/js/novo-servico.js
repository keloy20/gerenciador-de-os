const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

const inputCliente = document.getElementById("cliente");
const listaUnidades = document.getElementById("listaUnidades");

inputCliente.addEventListener("input", buscarUnidades);

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
    console.error(err);
  }
}

function selecionarUnidade(unidade) {
  document.getElementById("unidade").value = unidade.nome;
  document.getElementById("marca").value = unidade.marca;
  listaUnidades.innerHTML = "";
}

// ===============================
// CRIAR SERVIÇO (TÉCNICO) – SEM TECNICOID
// ===============================
async function criarServico() {
  const cliente = document.getElementById("cliente").value;
  const unidade = document.getElementById("unidade").value;
  const marca = document.getElementById("marca").value;
  const endereco = document.getElementById("endereco").value;
  const tipoServico = document.getElementById("tipoServico").value;
  const msg = document.getElementById("msg");

  if (!cliente || !unidade || !marca || !endereco || !tipoServico) {
    msg.innerText = "Preencha todos os campos";
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
        unidade,
        marca,
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
