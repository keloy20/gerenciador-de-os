// 🔹 Coloque seu token JWT aqui (do Insomnia ou login)
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWQyMjZjYzZiMGNmYzZiNDE3ODNhOCIsImlhdCI6MTc2NzcxMTQwMywiZXhwIjoxNzY4MzE2MjAzfQ.y0Tsiipm6KosnRKRUOHNiDlh78P2FXniZiBZ2fp5O_I";


// 🔹 Detecta automaticamente o IP do PC onde o frontend está rodando
const backendURL = `${window.location.protocol}//${window.location.hostname}:3000`;

// Criar projeto
document.getElementById("createProjectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const cliente = document.getElementById("cliente").value;
  const endereco = document.getElementById("endereco").value;
  const tipoServico = document.getElementById("tipoServico").value;

  try {
    const res = await fetch(`${backendURL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ cliente, endereco, tipoServico })
    });

    const data = await res.json();
    if (res.ok) {
      alert("Projeto criado com sucesso!");
      document.getElementById("createProjectForm").reset();
      loadProjects();
    } else {
      alert("Erro ao criar projeto: " + data.error);
      console.error(data);
    }
  } catch (err) {
    alert("Erro de conexão com o servidor. Verifique se o backend está rodando e se o firewall permite acesso à porta 3000.");
    console.error(err);
  }
});

// Carregar projetos
async function loadProjects() {
  try {
    const res = await fetch(`${backendURL}/projects`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    const projects = Array.isArray(data) ? data : data.projects || [];
    const listDiv = document.getElementById("projectsList");
    listDiv.innerHTML = "";

    if (projects.length === 0) {
      listDiv.innerHTML = "<p>Nenhum projeto encontrado.</p>";
      return;
    }

    projects.forEach(p => {
      const div = document.createElement("div");
      div.className = "projectCard";

      div.innerHTML = `
        <h3>${p.cliente}</h3>
        <p>${p.endereco || ""}</p>
        <p>${p.tipoServico || ""}</p>
        <p>Status: ${p.status || "em andamento"}</p>

        <h4>Antes:</h4>
        ${p.antes?.fotos?.map(f => `<img src="${f}" alt="Foto antes">`).join("") || "Nenhuma foto"}
        <p>${p.antes?.relatorio || ""}</p>
        <input type="file" id="fotosAntes_${p._id}" multiple>
        <input type="text" id="relatorioAntes_${p._id}" placeholder="Relatório antes">
        <button onclick="uploadAntes('${p._id}')">Enviar Antes</button>

        <h4>Depois:</h4>
        ${p.depois?.fotos?.map(f => `<img src="${f}" alt="Foto depois">`).join("") || "Nenhuma foto"}
        <p>${p.depois?.relatorio || ""}</p>
        <input type="file" id="fotosDepois_${p._id}" multiple>
        <input type="text" id="relatorioDepois_${p._id}" placeholder="Relatório depois">
        <button onclick="uploadDepois('${p._id}')">Enviar Depois</button>
      `;

      listDiv.appendChild(div);
    });

  } catch (err) {
    console.error("Erro ao carregar projetos:", err);
    document.getElementById("projectsList").innerHTML = "<p>Erro ao carregar projetos.</p>";
  }
}

// Funções de upload de fotos
async function uploadAntes(projectId) {
  const fotos = document.getElementById(`fotosAntes_${projectId}`).files;
  const relatorio = document.getElementById(`relatorioAntes_${projectId}`).value;
  const formData = new FormData();
  for (let f of fotos) formData.append("fotos", f);
  formData.append("relatorio", relatorio);

  try {
    const res = await fetch(`${backendURL}/projects/${projectId}/antes`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    console.log("Antes enviado:", data);
    loadProjects();
  } catch (err) {
    alert("Erro ao enviar fotos antes.");
    console.error(err);
  }
}

async function uploadDepois(projectId) {
  const fotos = document.getElementById(`fotosDepois_${projectId}`).files;
  const relatorio = document.getElementById(`relatorioDepois_${projectId}`).value;
  const formData = new FormData();
  for (let f of fotos) formData.append("fotos", f);
  formData.append("relatorio", relatorio);

  try {
    const res = await fetch(`${backendURL}/projects/${projectId}/depois`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    console.log("Depois enviado:", data);
    loadProjects();
  } catch (err) {
    alert("Erro ao enviar fotos depois.");
    console.error(err);
  }
}

// Carrega os projetos ao abrir a página
loadProjects();
