// =========================================================
// CAMADA DE DADOS (js/dados.js)
// Responsável por guardar e salvar as informações do site
// =========================================================

const SUPABASE_URL = "https://nhrbfeyrzwpuzrewsufe.supabase.co/rest/v1/"; // Ex: https://xyz.supabase.co
const SUPABASE_KEY = "sb_publishable_8jvULESd5x-WwRdH1BCNbg_NOOodwkV";

const DADOS_INICIAIS = {
  chessUsername: "ningumSS", // Troque pelo seu nick real do Chess.com pelo Modo Admin!
  lastfmUsername: "HG_DEV",
  lastfmApiKey: "2e545201d642ff118b3604b517510df0", // API Key do Last
  statusNow: {
    estudando: "Estruturas de Dados em Java & C",
    ouvindo: "Imagine Dragons — Demons",
    foco: "Desenvolvimento Web & Infraestrutura"
  },
  projetos: [
    {
      nome: "Fatto Per Te — Catálogo Web",
      desc: "Vitrine digital interativa publicada no GitHub Pages.",
      tech: "HTML • CSS • JS"
    },
    {
      nome: "NutriChef - integrat with AI Assistant",
      desc: "Sistema nutricional integrado à API do Gemini, FastAPI e banco PostgreSQL.",
      tech: "Python • FastAPI • Supabase"
    },
    {
      nome: "Infraestrutura UniFi & CFTV Multi-Site",
      desc: "Configuração e monitoramento de rede e câmeras em 11 unidades hoteleiras.",
      tech: "Redes • Ubiquiti • CFTV"
    }
  ],
  hobbies: [
    { id: 1, icone: "🥋", titulo: "Jiu-Jitsu & Boxe", desc: "Disciplina física, estratégia e arte suave no tatame." },
    { id: 2, icone: "✒️", titulo: "Caligrafia Clássica", desc: "Prática de escrita Copperplate (mão direita) e Itálica (mão esquerda)." },
    { id: 3, icone: "🎹", titulo: "Teclado & Piano", desc: "Estudo prático de coordenação e repertório musical." },
    { id: 4, icone: "🎣", titulo: "Parques & Fotografias", desc: "Lazer ao ar livre e registros fotográficos em Curitiba." }
  ]
};

const cacheLocal = JSON.parse(localStorage.getItem("heerbt_hub_db")) || {};
let estadoSite = { ...DADOS_INICIAIS, ...cacheLocal };

async function sincronizarComNuvem() {
  if (!SUPABASE_URL || SUPABASE_URL === "https://nhrbfeyrzwpuzrewsufe.supabase.co/rest/v1/") {
    console.warn("Supabase ainda não configurado. Usando memória local.");
    return;
  }

  try {
    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/hub_state?id=eq.1&select=conteudo`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!resposta.ok) throw new Error("Erro ao ler banco na nuvem");

    const linhas = await resposta.json();
    const conteudoNuvem = linhas[0]?.conteudo;

    // Se a nuvem já tiver dados salvos, atualiza o site inteiro com eles!
    if (conteudoNuvem && Object.keys(conteudoNuvem).length > 0) {
      estadoSite = { ...DADOS_INICIAIS, ...conteudoNuvem };
      localStorage.setItem("heerbt_hub_db", JSON.stringify(estadoSite));
    } else {
      // Se a nuvem estiver vazia (primeira vez), sobe os DADOS_INICIAIS para lá
      await salvarEstado();
    }
  } catch (erro) {
    console.error("Falha ao sincronizar com Supabase:", erro);
  }
}

// Função para salvar alterações
async function salvarEstado() {
  // Salva cópia instantânea no navegador
  localStorage.setItem("heerbt_hub_db", JSON.stringify(estadoSite));

  if (!SUPABASE_URL || SUPABASE_URL === "https://nhrbfeyrzwpuzrewsufe.supabase.co/rest/v1/") return;

  try {
    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/hub_state?id=eq.1`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({
        conteudo: estadoSite,
        updated_at: new Date().toISOString()
      })
    });

    if (!resposta.ok) throw new Error("Erro ao gravar no Supabase");
    console.log("☁️ Dados salvos na nuvem com sucesso!");
  } catch (erro) {
    console.error("Erro ao salvar na nuvem:", erro);
    alert("Salvo apenas localmente. Verifique sua URL/Key do Supabase.");
  }
}