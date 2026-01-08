const API = "https://gerenciador-de-os.onrender.com";
const token = localStorage.getItem("token");

let tecnicosCache = []; // 🔥 AGORA DEFINIDO

document.addEventListener("DOMContentLoaded", () => {
  const inputCliente = document.getElementById("cliente");

  if (!inputCliente) {
    console.error("❌ input #cliente não encontrado no HTML");
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
// BUSCAR UNIDADES (SÓ TIMÃO)
// ===============================
async function buscarUnidades() {
  const nome = document.getElementById("cliente").value.trim().toLowerCase();
  const listaUnidades = document.getElementById("listaUnidades");
  const boxTimao = document.getElementById("boxTimao");

  if (!listaUnidades || !boxTimao) {
    console.error("❌ listaUnidades ou boxTimao não encontrados no HTML");
    return;
  }

  if (nome !== "timao") {
    listaUnidades.innerHTML = "";
    boxTimao.style.display = "none";
    document.getElementById("unidade").value = "";
    document.getElementById("marca").value = "";
    return;
  }

  boxTimao.style.display = "block";

  try {
    const res = await fetch(`${API}/clientes/buscar?nome=${encodeURIComponent(nome)}`);
    const unidades = await res.json();

    listaUnidades.innerHTML = "";

    if (unidades.length === 0) {
      listaUnidades.innerHTML = "<li>Nenhuma unidade encontrada</li>";
      return;
    }

    unidades.forEach(u => {
      const li = document.createElement("li");
      li.innerText = `${u.nome} - ${u.marca}`;
      li.onclick = () => selecionarUnidade(u);
      listaUnidades.appendChild(li);
    });

  } catch (err) {
    console.error("Erro ao buscar unidades:", err);
  }
}

function selecionarUnidade(unidade) {
  document.getElementById("unidade").value = unidade.nome;
  document.getElementById("marca").value = unidade.marca;
  document.getElementById("listaUnidades").innerHTML = "";
}

// ===============================
// CRIAR SERVIÇO (ADMIN)
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

    // 🔥 WHATSAPP
    const tecnico = tecnicosCache.find(t => t._id === tecnicoId);

    if (tecnico && tecnico.telefone) {
      const texto = `Novo serviço atribuído:

Cliente: ${cliente}
${cliente.toLowerCase() === "timao" ? `Unidade: ${unidade}\nMarca: ${marca}\n` : ""}
Endereço: ${endereco}
Serviço: ${tipoServico}

Acesse o sistema para iniciar o atendimento.`;

      const link = `https://wa.me/${tecnico.telefone}?text=${encodeURIComponent(texto)}`;
      window.open(link, "_blank");
    }

    msg.innerText = "Serviço criado com sucesso!";
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 800);

  } catch (err) {
    console.error("Erro ao criar serviço:", err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
