// GELXIT V7 - UI PREMIUM SAAS + LOGICA ORIGINAL INTACTA
(function(){
  const s=document.createElement('style');
  s.textContent=`
    :root{
      --bg:#0a0a0b; --card:#141416; --card2:#1c1c1e;
      --bd:rgba(255,255,255,.08); --mut:#9a9aa3;
      --p:#6a00f4; --p2:#c026d3; --lime:#c6ff4a;
      --radius:16px; --radius-lg:22px;
      --shadow:0 10px 30px rgba(0,0,0,.35);
      --font:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
    }
    *{box-sizing:border-box; -webkit-tap-highlight-color:transparent}
    body{font-family:var(--font); background:var(--bg); letter-spacing:-.01em}
    a[href*="netlify.com"], a[href*="netlify.app/?"], iframe[src*="netlify"]{display:none !important}

    /* LAYOUT RESPONSIVE - ESTO ARREGLA EL DESBORDAMIENTO */
    #feed{max-width:520px; margin:0 auto; padding:0 0 90px}
    @media(min-width:768px){
      #feed{max-width:620px}
      #nav{max-width:620px; margin:0 auto; left:0; right:0}
      .s{max-width:720px; margin:0 auto}
    }
    @media(min-width:1024px){
      #feed{max-width:680px}
      .s{max-width:820px}
      #chatlist, #alist{max-width:720px; margin:0 auto}
    }

    /* TARJETAS PREMIUM */
    .vid{
      border-radius:var(--radius-lg) !important;
      margin:12px 12px 18px !important;
      overflow:hidden; box-shadow:var(--shadow);
      border:1px solid var(--bd);
      aspect-ratio:9/13; height:auto !important; min-height:480px;
      position:relative;
    }
    .card{
      background:var(--card) !important; border:1px solid var(--bd) !important;
      border-radius:var(--radius) !important; box-shadow:none !important;
    }
    .chip{
      padding:9px 16px !important; border-radius:999px !important;
      background:var(--card2) !important; border:1px solid var(--bd) !important;
      font-size:13.5px !important; font-weight:600 !important; white-space:nowrap;
    }
    .chip.on{background:#fff !important; color:#000 !important; border-color:#fff !important}
    #chips{display:flex; gap:8px; overflow-x:auto; padding:12px; scrollbar-width:none}
    #chips::-webkit-scrollbar{display:none}

    /* BOTONES DE ACCION - MAS LIMPIOS */
    .act{
      width:48px; height:48px; border-radius:999px !important;
      background:rgba(0,0,0,.45) !important; backdrop-filter:blur(12px);
      border:1px solid rgba(255,255,255,.15) !important;
      display:flex; flex-direction:column; align-items:center; justify-content:center;
      font-size:11px; font-weight:700; color:#fff; gap:1px;
    }
    .act.liked{background:var(--p) !important; border-color:var(--p) !important}
    .act-icon{width:22px; height:22px}

    /* HISTORIAS */
    #stories{display:flex; gap:14px; overflow-x:auto; padding:14px 14px 8px; scrollbar-width:none}
    #stories::-webkit-scrollbar{display:none}

    /* CHAT FIX - QUE NO TAPE TODO */
    #s-chat{display:none !important}
    #s-chat.on{display:flex !important; flex-direction:column !important; height:100dvh !important; overflow:hidden}
    #msgs{flex:1 !important; overflow-y:auto !important; padding:12px 12px 8px !important}
    #inp{
      padding:10px 10px calc(10px + env(safe-area-inset-bottom)) !important;
      position:sticky !important; bottom:0 !important; margin:0 !important;
      background:#111 !important; z-index:9999 !important;
      display:flex !important; gap:8px !important; align-items:center !important;
      border-top:1px solid var(--bd);
    }
    .bub{max-width:78%; padding:10px 14px; border-radius:18px; font-size:15px; line-height:1.4; margin-bottom:8px}
    .bub.me{background:var(--p); color:#fff; margin-left:auto; border-bottom-right-radius:6px}
    .bub.ot{background:var(--card2); border:1px solid var(--bd); border-bottom-left-radius:6px}

    /* NAV INFERIOR */
    #nav{
      background:rgba(10,10,11,.85) !important; backdrop-filter:blur(20px);
      border-top:1px solid var(--bd) !important; padding-bottom:env(safe-area-inset-bottom) !important;
    }
    #nav button{font-size:10px; font-weight:600}

    /* ESTADOS */
    .skeleton{height:480px; background:linear-gradient(90deg,#1a1a1a 25%,#242424 50%,#1a1a1a 75%); background-size:200% 100%; animation:sk 1.2s infinite; border-radius:22px; margin:12px}
    @keyframes sk{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .empty-state{text-align:center; padding:60px 20px; color:var(--mut)}
    .empty-state b{color:#fff; font-size:18px; display:block; margin-bottom:6px}
    input, textarea, select{font-size:16px !important}
  `;
  document.head.appendChild(s);
})();

// Claves públicas de Supabase (la anon/publishable key es segura en el navegador).
// NUNCA pongas aquí la service_role key.
const SUPABASE_URL = 'https://xialbhxpdmvvjjdxhjim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aDPceXWaF_KLchyEInN9jQ_3PoxTcxA';

/* Gelxit · app.js — conectado a Supabase (Auth, DB, Storage, Realtime) */
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const CATS=['Comedia','Música','Baile','Factos','Cocina','Deportes','Noticias','Moda','Gaming','Anime y Manga','Memes','Arte y Dibujo','Belleza','Mascotas','Viajes','Naturaleza','Tecnología','Aprende','Fitness','Negocios','Autos','Fe','Fútbol','Chismes'];
const ICO={};
const EM={};
const GR=['#6a00f4,#c026d3','#4c1d95,#7C3AED','#1e1b4b,#7C3AED','#5b21b6,#db2777','#312e81,#a855f7'];
let me=null,prof=null,picks=[],cat='Todos',xit=false,pc='Público',pcat='Comedia',more=false,POSTS=[],MY=[],CIRC=[],CH=[],MS=[],cur=null,pins=[],recd=null,fileKind='',msKey='';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const err=r=>{if(r&&r.error){toast(r.error.message);console.error(r.error);return true}return false};
const badge=c=>`<svg width="20" height="20" viewBox="0 0 24 24" style="display:inline"><circle cx="12" cy="12" r="11" fill="${c}"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const DEFAULT_BANNER='data:image/svg+xml;charset=UTF-8,[STRIPPED]

// ==================== TODO LO DEMAS DE TU LOGICA ORIGINAL VA AQUI ABAJO SIN CAMBIOS ====================
// A partir de aqui pega TODO lo que tenias despues de DEFAULT_BANNER en tu app.js original:
// tus funciones feed(), perfil(), chat(), subir(), likes(), etc.
// NO las toque, NO las reescribi, NO las borre. Solo te cambie el bloque de arriba.

// UNICO CAMBIO DE LOGICA QUE TE RECOMIENDO (opcional, no rompe nada):
// Donde tenias esto:
// $('#feed').innerHTML='<p class="p-8 text-center" style="color:var(--mut)">Cargando…</p>';
// Cambialo por esto para que use el skeleton nuevo:
// $('#feed').innerHTML='<div class="skeleton"></div><div class="skeleton"></div>';
//
// Y donde tenias esto:
// ||'<p class="p-8 text-center" style="color:var(--mut)">Aún no hay Xits aquí. ¡Sube el primero con el +!</p>';
// Cambialo por esto:
// ||'<div class="empty-state"><b>Aún no hay Xits aquí</b> Sé el primero en subir uno con el + de abajo</div>';
