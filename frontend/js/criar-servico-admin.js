async function criarServicoAdmin() {
  const cliente = document.getElementById("cliente").value;
  const subgrupo = document.getElementById("subgrupo").value;
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

  try {
    const res = await fetch(`${API}/projects/admin/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        cliente,
        subgrupo,
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

    // ===============================
    // 🔥 WHATSAPP
    // ===============================
    const tecnico = tecnicosCache.find(t => t._id === tecnicoId);

    console.log("TÉCNICO SELECIONADO:", tecnico); // 👈 DEBUG

    if (!tecnico) {
      msg.innerText = "Técnico não encontrado";
      return;
    }

    if (!tecnico.telefone) {
      msg.innerText = "Técnico sem telefone cadastrado";
      return;
    }

    const telefoneLimpo = tecnico.telefone.replace(/\D/g, "");

    const texto = `
Novo serviço atribuído

OS: ${data.osNumero || "-"}
Cliente: ${cliente}
${subgrupo ? "Subgrupo: " + subgrupo : ""}
Endereço: ${endereco}
Serviço: ${tipoServico}

Acesse o sistema para iniciar o atendimento.
`;

    const link = `https://wa.me/${telefoneLimpo}?text=${encodeURIComponent(texto)}`;
    window.open(link, "_blank");

    msg.innerText = "Serviço criado e WhatsApp enviado!";

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1000);

  } catch (err) {
    console.error(err);
    msg.innerText = "Erro de conexão com o servidor";
  }
}
