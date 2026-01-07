const API = "https://gerenciador-de-os.onrender.com/";
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

// ===============================
// AO CARREGAR A PÁGINA
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  if (role === "admin") {
    carregarTecnicos();
  } else {
    const bloco = document.getElementById("blocoTecnico");
    if (bloco) bloco.style.display = "none";
  }
});

// ===============================
// CARREGAR TÉCNICOS (SÓ ADMIN)
// ===============================
async function carregarTecnicos() {
  const select = document.getElementById("tecnico");
  if (!select) return;

  try {
    const res = await fetch(`${API}/auth/tecnicos`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const tecnicos = await res.json();

    select.innerHTML = `<option value="">Selecione o técnico</option>`;

    tecnicos.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t._id;
      opt.innerText = t.nome;
      select.appendChild(opt);
    });

  } catch (err) {
    console.error("Erro ao carregar técnicos:", err);
  }
}

// ===============================
// AUTOCOMPLETE CLIENTE / UNIDADE
// ===============================
const inputCliente = document.getElementById("clienteBusca");
const listaUnidades = document.getElementById("listaUnidades");

let timeoutBusca;

if (inputCliente) {
  inputCliente.addEventListener("keyup", () => {
    clearTimeout(timeoutBusca);

    timeoutBusca = setTimeout(async () => {
      const valor = inputCliente.value.trim();

      if (valor.length < 2) {
        listaUnidades.innerHTML = "";
        return;
      }

      try {
        const res = await fetch(`${API}/clientes/buscar?nome=${valor}`);
        const unidades = await res.json();

        listaUnidades.innerHTML = "";

        unidades.forEach(u => {
          const div = document.createElement("div");
          div.className = "autocomplete-item";
          div.innerText = `${u.nome} - ${u.marca}`;

          div.onclick = () => {
            inputCliente.value = `${u.nome} - ${u.marca}`;
            listaUnidades.innerHTML = "";

            // SALVA SEPARADO (NUNCA MUDA ESSES IDs)
            document.getElementById("cliente").value = "timao";
            document.getElementById("unidade").value = u.nome;
            document.getElementById("marca").value = u.marca;
          };

          listaUnidades.appendChild(div);
        });

      } catch (err) {
        console.error("Erro no autocomplete:", err);
      }
    }, 300);
  });
}

// ===============================
// CRIAR SERVIÇO (ADMIN OU TÉCNICO)
// ===============================
async function criarServico() {
  const clienteEl = document.getElementById("cliente");
  const unidadeEl = document.getElementById("unidade");
  const marcaEl = document.getElementById("marca");
  const enderecoEl = document.getElementById("endereco");
  const tipoServicoEl = document.getElementById("tipoServico");
  const msg = document.getElementById("msg");

  if (!clienteEl || !unidadeEl || !marcaEl || !enderecoEl || !tipoServicoEl) {
    msg.innerText = "Erro interno na tela. Recarregue a página.";
    return;
  }

  const cliente = clienteEl.value;
  const unidade = unidadeEl.value;
  const marca = marcaEl.value;
  const endereco = enderecoEl.value;
  const tipoServico = tipoServicoEl.value;

  if (!cliente || !unidade || !marca) {
    msg.innerText = "Selecione uma unidade da lista (clique em uma opção)";
    return;
  }

  let tecnicoId = null;

  if (role === "admin") {
    const tecnicoEl = document.getElementById("tecnico");
    if (!tecnicoEl || !tecnicoEl.value) {
      msg.innerText = "Selecione o técnico";
      return;
    }
    tecnicoId = tecnicoEl.value;
  }

  try {
    const url = role === "admin"
      ? `${API}/projects/admin/create`
      : `${API}/projects/start`;

    const body = role === "admin"
      ? { cliente, unidade, marca, endereco, tipoServico, tecnicoId }
      : { cliente, unidade, marca, endereco, tipoServico };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.error || "Erro ao criar serviço";
      return;
    }

    msg.innerText = "Serviço criado com sucesso!";
    setTimeout(() => {
      window.location.href = role === "admin" ? "admin.html" : "dashboard.html";
    }, 1200);

  } catch (err) {
    console.error("ERRO FETCH:", err);
    msg.innerText = "Erro de conexão";
  }
}
