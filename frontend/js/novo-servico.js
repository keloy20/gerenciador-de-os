const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

const inputCliente = document.getElementById("cliente");
const boxTimao = document.getElementById("boxTimao");

if (!token) {
  window.location.href = "login.html";
}


inputCliente.addEventListener("input", () => {
  const valor = inputCliente.value.toLowerCase();

  if (valor === "timao") {
    boxTimao.style.display = "block";
  } else {
    boxTimao.style.display = "none";
    document.getElementById("unidade").value = "";
    document.getElementById("marca").value = "";
  }
});

async function criarServico() {
  const cliente = document.getElementById("cliente").value.trim();
  const subgrupo = document.getElementById("subgrupo").value.trim();
  const unidade = document.getElementById("unidade").value.trim();
  const marca = document.getElementById("marca").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const tipoServico = document.getElementById("tipoServico").value.trim();
  const msg = document.getElementById("msg");

  if (!cliente || !endereco || !tipoServico) {
    msg.innerText = "Preencha cliente, endereço e tipo de serviço";
    return;
  }

  // REGRA DO TIMÃO
  if (cliente.toLowerCase() === "timao" && (!unidade || !marca)) {
    msg.innerText = "Para o cliente Timão, unidade e marca são obrigatórias";
    return;
  }

  try {
    const res = await fetch(`${API}/projects/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        cliente,
        subgrupo,
        unidade: cliente.toLowerCase() === "timao" ? unidade : null,
        marca: cliente.toLowerCase() === "timao" ? marca : null,
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
    }, 800);

  } catch (err) {
    console.error(err);
    msg.innerText = "Erro de conexão com servidor";
  }
}
