const API = "https://seu-backend-aqui.com"; // depois eu ajusto com você

document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  const msg = document.getElementById("msg");

  msg.innerText = "Entrando...";

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, senha })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.error || "Erro ao logar";
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    localStorage.setItem("nome", data.nome);

    if (data.role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "tecnico.html";
    }

  } catch (err) {
    msg.innerText = "Erro de conexão com o servidor";
  }
});
