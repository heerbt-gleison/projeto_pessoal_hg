// =========================================================
// CAMADA DE SERVIÇOS E APIS EXTERNAS (js/apis.js)
// Responsável por buscar dados ao vivo na internet
// =========================================================

async function carregarChessCom(username) {
  const statusTexto = document.getElementById("chess-status");
  const elRapid = document.getElementById("chess-rapid");
  const elBlitz = document.getElementById("chess-blitz");
  const elBullet = document.getElementById("chess-bullet");
  const linkPerfil = document.getElementById("chess-profile-link");

  const nickLimpo = username.trim().toLowerCase();
  statusTexto.textContent = `Buscando estatísticas de @${nickLimpo}...`;

  try {
    // Chamada HTTP GET para a API pública oficial do Chess.com
    const resposta = await fetch(`https://api.chess.com/pub/player/${nickLimpo}/stats`);
    
    if (!resposta.ok) {
      throw new Error("Jogador não encontrado");
    }

    const dados = await resposta.json();

    // Preenche os ratings na tela (se não tiver rating na modalidade, mostra '---')
    elRapid.textContent = dados.chess_rapid?.last?.rating || "---";
    elBlitz.textContent = dados.chess_blitz?.last?.rating || "---";
    elBullet.textContent = dados.chess_bullet?.last?.rating || "---";

    statusTexto.textContent = `Conectado ao perfil oficial: @${nickLimpo}`;
    linkPerfil.href = `https://www.chess.com/member/${nickLimpo}`;

  } catch (erro) {
    statusTexto.textContent = `Usuário "${nickLimpo}" não encontrado no Chess.com.`;
    elRapid.textContent = "---";
    elBlitz.textContent = "---";
    elBullet.textContent = "---";
  }
}

// =========================================================
// INTEGRAÇÃO SPOTIFY AO VIVO VIA LAST.FM API
// =========================================================

// =========================================================
// INTEGRAÇÃO SPOTIFY AO VIVO VIA LAST.FM API (VERSÃO COM DIAGNÓSTICO)
// =========================================================

async function carregarSpotifyAoVivo() {
  const user = (estadoSite.lastfmUser || "").trim();
  const apiKey = (estadoSite.lastfmApiKey || "").trim();

  const badgeStatus = document.getElementById("spotify-badge");
  const tituloMusica = document.getElementById("musica-atual-titulo");
  const nomeArtista = document.getElementById("musica-atual-faixa");
  const capaAlbum = document.getElementById("spotify-capa");
  const linkMusica = document.getElementById("spotify-link");
  const statusNowOuvindo = document.getElementById("status-ouvindo-live");

  if (!badgeStatus) return;

  // 1. Verifica se o usuário e a chave foram preenchidos
  if (!user || !apiKey || user === "SEU_USUARIO_LASTFM" || apiKey === "SUA_API_KEY_AQUI") {
    badgeStatus.textContent = "⚙️ Modo Offline (Clique em API no Modo Admin)";
    return;
  }

  // encodeURIComponent evita que espaços ou símbolos quebrem a URL
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`;

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    // 2. Se o Last.fm devolver um código de erro, mostra o motivo exato!
    if (dados.error) {
      if (dados.error === 10) {
        badgeStatus.textContent = "❌ API Key inválida (Confira os 32 caracteres)";
      } else if (dados.error === 6) {
        badgeStatus.textContent = `❌ Usuário "${user}" não existe no Last.fm`;
      } else if (dados.error === 17) {
        badgeStatus.textContent = "🔒 Perfil privado (Ative o histórico no Last.fm)";
      } else {
        badgeStatus.textContent = `❌ Erro Last.fm (${dados.error}): ${dados.message}`;
      }
      return;
    }

    const faixas = dados.recenttracks?.track;

    if (!faixas || faixas.length === 0) {
      badgeStatus.textContent = "⏸️ Nenhuma música registrada no Last.fm ainda";
      return;
    }

    // 3. Pega a música mais recente com segurança
    const ultimaFaixa = Array.isArray(faixas) ? faixas[0] : faixas;
    const nome = ultimaFaixa.name || "Faixa desconhecida";
    const artista = ultimaFaixa.artist?.["#text"] || "Artista";
    const imagemUrl = ultimaFaixa.image?.[2]?.["#text"] || "";
    const tocandoAgora = ultimaFaixa["@attr"]?.nowplaying === "true";

    if (tituloMusica) tituloMusica.textContent = nome;
    if (nomeArtista) nomeArtista.textContent = artista;
    if (linkMusica && ultimaFaixa.url) linkMusica.href = ultimaFaixa.url;

    if (capaAlbum && imagemUrl) {
      capaAlbum.src = imagemUrl;
      capaAlbum.classList.remove("hidden");
    }

    if (tocandoAgora) {
      badgeStatus.innerHTML = `<span class="equalizer"><i></i><i></i><i></i></span> Tocando agora no Spotify`;
      badgeStatus.classList.add("live-active");
    } else {
      badgeStatus.textContent = "⏸️ Última música ouvida";
      badgeStatus.classList.remove("live-active");
    }

    if (statusNowOuvindo) {
      statusNowOuvindo.innerHTML = tocandoAgora
        ? `🟢 <strong>Tocando agora:</strong> ${artista} — ${nome}`
        : `🎵 <strong>Última ouvida:</strong> ${artista} — ${nome}`;
    }

  } catch (erro) {
    console.error("Detalhes técnicos do erro:", erro);
    badgeStatus.textContent = "🛡️ Bloqueado por AdBlock/Brave ou sem internet";
  }
}