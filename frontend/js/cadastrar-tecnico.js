const API = "http://192.168.0.7:3000";

function cadastrarTecnico() {
  const token = localStorage.getItem("token");

  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;
  const senha = document.getElementById("senha").value;
  const msg = document.getElementById("msg");

  if (!token) {
    msg.innerText = "Você não está logado como admin.";
    return;
  }

  fetch(`${API}/auth/register-tecnico`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ nome, email, telefone, senha })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        msg.innerText = data.error;
        return;
      }

      msg.innerText = "Técnico cadastrado com sucesso!";
      document.getElementById("nome").value = "";
      document.getElementById("email").value = "";
      document.getElementById("telefone").value = "";
      document.getElementById("senha").value = "";
    })
    .catch(err => {
      console.error(err);
      msg.innerText = "Erro de conexão com o servidor";
    });
}
