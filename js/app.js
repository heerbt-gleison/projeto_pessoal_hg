// =========================================================
// CONTROLADOR PRINCIPAL E INTERFACE (js/app.js)
// =========================================================

let modoAdmin = false;

// 1. NAVEGAÇÃO ENTRE ABAS
document.querySelectorAll(".tab-btn").forEach(botao => {
  botao.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    botao.classList.add("active");
    const abaAlvo = botao.getAttribute("data-tab");
    document.getElementById(`tab-${abaAlvo}`).classList.add("active");
  });
});

// 2. RENDERIZAR INTERFACE COM BASE NOS DADOS (js/dados.js)
function renderizarTudo() {
  // Renderiza Status /now
  const statusBox = document.getElementById("status-now-content");
  statusBox.innerHTML = `
    <p>📚 <strong>Estudando:</strong> ${estadoSite.statusNow.estudando}</p>
    <p id="status-ouvindo-live">🎵 <strong>Ouvindo:</strong> ${estadoSite.statusNow.ouvindo}</p>
    <p>🎯 <strong>Foco:</strong> ${estadoSite.statusNow.foco}</p>
  `;

  // Atualiza card de música na aba Jardim Digital também
  document.getElementById("musica-atual-faixa").textContent = estadoSite.statusNow.ouvindo;

  // Renderiza Projetos
  const projetosGrid = document.getElementById("projetos-grid");
  projetosGrid.innerHTML = estadoSite.projetos.map(p => `
    <div class="item-row">
      <div>
        <strong>${p.nome}</strong>
        <p class="text-muted">${p.desc}</p>
      </div>
      <span class="tag">${p.tech}</span>
    </div>
  `).join("");

  // Renderiza Hobbies (com botão de excluir se Modo Admin estiver ativo)
  const hobbiesGrid = document.getElementById("hobbies-grid");
  hobbiesGrid.innerHTML = estadoSite.hobbies.map(h => `
    <div class="item-row">
      <div>
        <strong>${h.icone} ${h.titulo}</strong>
        <p class="text-muted">${h.desc}</p>
      </div>
      ${modoAdmin ? `<button class="btn-delete" onclick="removerHobby(${h.id})">🗑️ Excluir</button>` : ""}
    </div>
  `).join("");
}

// 3. LOGIN DISCRETO (3 Cliques no Monograma <HL/>)
let cliquesLogo = 0;
let timerClique = null;

document.getElementById("admin-trigger").addEventListener("click", () => {
  cliquesLogo++;
  clearTimeout(timerClique);

  if (cliquesLogo === 3) {
    cliquesLogo = 0;
    if (!modoAdmin) {
      const senha = prompt("🔒 Modo Desenvolvedor — Digite sua chave:");
      if (senha === "Juar@12") {
        modoAdmin = true;
        atualizarBotoesAdmin();
      } else if (senha !== null) {
        alert("Senha incorreta!");
      }
    } else {
      modoAdmin = false;
      atualizarBotoesAdmin();
    }
  }

  timerClique = setTimeout(() => { cliquesLogo = 0; }, 700);
});

function atualizarBotoesAdmin() {
  const elementosAdmin = [
    document.getElementById("btn-edit-spotify"),
    document.getElementById("admin-badge"),
    document.getElementById("btn-edit-status"),
    document.getElementById("btn-edit-chess"),
    document.getElementById("btn-add-hobby")
  ];

  elementosAdmin.forEach(el => el.classList.toggle("hidden", !modoAdmin));
  renderizarTudo();
}

// 4. FUNÇÕES DE EDIÇÃO DO MODO ADMIN
function editarStatusNow() {
  const novoEstudo = prompt("O que você está estudando agora?", estadoSite.statusNow.estudando);
  const novaMusica = prompt("Qual música/banda está ouvindo agora?", estadoSite.statusNow.ouvindo);
  const novoFoco = prompt("Qual seu foco da semana?", estadoSite.statusNow.foco);

  if (novoEstudo && novaMusica && novoFoco) {
    estadoSite.statusNow = { estudando: novoEstudo, ouvindo: novaMusica, foco: novoFoco };
    salvarEstado();
    renderizarTudo();
  }
}

function adicionarHobby() {
  const icone = prompt("Digite um emoji para o hobby (ex: 🎸, 📷, ♟️):", "⚡");
  const titulo = prompt("Nome do Hobby ou Interesse:");
  const desc = prompt("Breve descrição:");

  if (titulo && desc) {
    estadoSite.hobbies.push({
      id: Date.now(),
      icone: icone || "⚡",
      titulo: titulo,
      desc: desc
    });
    salvarEstado();
    renderizarTudo();
  }
}

function removerHobby(id) {
  estadoSite.hobbies = estadoSite.hobbies.filter(h => h.id !== id);
  salvarEstado();
  renderizarTudo();
}

function trocarUsuarioChess() {
  const novoNick = prompt("Digite seu username do Chess.com:", estadoSite.chessUsername);
  if (novoNick) {
    estadoSite.chessUsername = novoNick.trim();
    salvarEstado();
    carregarChessCom(estadoSite.chessUsername);
  }
}

function configurarSpotifyAdmin() {
  const novoUser = prompt("Digite seu username do Last.fm:", estadoSite.lastfmUser);
  const novaKey = prompt("Cole sua API Key do Last.fm:", estadoSite.lastfmApiKey);
  if (novoUser && novaKey) {
    estadoSite.lastfmUser = novoUser.trim();
    estadoSite.lastfmApiKey = novaKey.trim();
    salvarEstado();
    carregarSpotifyAoVivo();
  }
}

// 5. CALCULADORA DE CFTV (Aba Lab)
function calcularCFTV() {
  const cams = Number(document.getElementById("cftv-cams").value) || 1;
  const dias = Number(document.getElementById("cftv-dias").value) || 1;
  const gbPorDia = Number(document.getElementById("cftv-res").value) || 20;

  const totalGB = cams * dias * gbPorDia;
  const totalTB = (totalGB / 1024).toFixed(2);
  const hdSugerido = Math.ceil(totalGB / 1024) || 1;

  document.getElementById("cftv-resultado").innerHTML = `
    Consumo Total: <strong>${totalTB} TB</strong> (${totalGB} GB)<br>
    HD Recomendado (Purple/SkyHawk): <strong>Mínimo ${hdSugerido} TB</strong>
  `;
}

["cftv-cams", "cftv-dias", "cftv-res"].forEach(id => {
  document.getElementById(id).addEventListener("input", calcularCFTV);
});

// INICIALIZAÇÃO QUANDO A PÁGINA ABRE
async function iniciarAplicacao() {
  // 1. Mostra rápido o que já tem na memória e calcula o CFTV
  renderizarTudo();
  calcularCFTV();

  // 2. Busca as atualizações mais recentes lá no Supabase (Nuvem)
  await sincronizarComNuvem();

  // 3. Re-renderiza a tela com os dados da nuvem e chama as APIs ao vivo
  renderizarTudo();
  carregarChessCom(estadoSite.chessUsername);
  carregarSpotifyAoVivo();

  // 4. Mantém o Spotify atualizando a cada 30 segundos
  setInterval(carregarSpotifyAoVivo, 30000);
}

iniciarAplicacao();