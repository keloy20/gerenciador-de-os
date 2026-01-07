const API = "http://192.168.0.7:3000";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", carregarTecnicos);

let tecnicosCache = [];

async function carregarTecnicos() {
  const res = await fetch(`${API}/auth/tecnicos`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const tecnicos = await res.json();
  tecnicosCache = tecnicos;

  const select = document.getElementById("tecnico");

  tecnicos.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t._id;
    opt.innerText = t.nome;
    select.appendChild(opt);
  });
}

async function criarServico() {
  const cliente = document.getElementById("cliente").value;
  const endereco = document.getElementById("endereco").value;
  const tipoServico = document.getElementById("tipoServico").value;
  const tecnicoId = document.getElementById("tecnico").value;
  const msg = document.getElementById("msg");

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
    msg.innerText = data.error;
    return;
  }

  // WHATSAPP
  const tecnico = tecnicosCache.find(t => t._id === tecnicoId);

  if (!tecnico || !tecnico.telefone) {
    msg.innerText = "Técnico sem telefone cadastrado";
    return;
  }

  const texto = `
Novo serviço atribuído:

Cliente: ${cliente}
Endereço: ${endereco}
Serviço: ${tipoServico}

Acesse o sistema para iniciar o atendimento.
`;

  const link = `https://wa.me/${tecnico.telefone}?text=${encodeURIComponent(texto)}`;

  window.open(link, "_blank");

  msg.innerText = "Serviço criado e WhatsApp aberto!";
}
