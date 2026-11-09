// === SQL PARA SUPABASE (corre esto 1 vez, no va en app.js) ===
// alter table profiles add column if not exists ban_hasta timestamptz;
// alter table profiles add column if not exists ban_motivo text;

// FIX: Scroll todo + Chat pegado sin hueco negro
(function(){
  const s=document.createElement('style');
  s.textContent=`
    a[href*="netlify.com"], a[href*="netlify.app/?"], iframe[src*="netlify"], [id*="netlify" i], [class*="netlify" i]{display:none !important;}
    html,body{height:auto !important; overflow-y:auto !important; overflow-x:hidden !important; -webkit-overflow-scrolling:touch !important;}
    .s, .screen, section{overflow-y:auto !important; -webkit-overflow-scrolling:touch !important; padding-bottom:90px !important; min-height:100dvh !important;}
    #s-chat{display:flex !important; flex-direction:column !important; height:100dvh !important; min-height:100dvh !important; max-height:100dvh !important; overflow:hidden !important; padding-bottom:0 !important;}
    #msgs{flex:1 !important; overflow-y:auto !important; -webkit-overflow-scrolling:touch !important; padding-bottom:12px !important;}
    #inp{position:sticky !important; bottom:0 !important; padding:10px 10px calc(10px + env(safe-area-inset-bottom)) !important; margin:0 !important; background:#111 !important; z-index:9999 !important; display:flex !important; gap:8px !important; align-items:center !important;}
    #inp input{flex:1 !important; min-width:0 !important;}
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
const DEFAULT_BANNER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360"><rect width="1200" height="360" fill="#1d211b"/><path d="M-40 290 280 30M180 390 520 40M500 390 850 0M820 390 1180 70" stroke="#c6ff4a" stroke-width="2" opacity=".45"/><path d="M0 310h1200M0 40h1200" stroke="#c6ff4a" stroke-width="1" opacity=".2"/><text x="62" y="235" fill="#fff8e7" font-family="Arial,sans-serif" font-size="116" font-weight="700">/Gelxit</text><circle cx="1100" cy="70" r="28" fill="#c6ff4a" opacity=".9"/></svg>`);
function bannerBackground(url){return url?`url("${url}") center/cover`:`url("${DEFAULT_BANNER}") center/cover`;}
const SVG={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>',
  inbox:'<path d="M4 5.5h16v12H4z"/><path d="m4 7 8 6 8-6"/>',
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"/>',
  bell:'<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z"/><path d="M10 21h4"/>',
  sun:'<circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon:'<path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"/>',
  crown:'<path d="m3 7 4.5 4L12 5l4.5 6L21 7l-1.5 12h-15z"/><path d="M5 22h14"/>',
  settings:'<path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4m9.2 9.2L18 18M6 18l1.4-1.4m9.2-9.2L18 6"/><circle cx="12" cy="12" r="4.2"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  back:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m4 17 5-5 3 3 2-2 6 6"/>',
  play:'<path d="m9 6 9 6-9 6z"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
  send:'<path d="m4 4 16 8-16 8 3-8zM7 12h13"/>',
  heart:'<path d="M20.8 8.8c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.8 2.4Z"/>',
  comment:'<path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.7 8.7 0 0 1-4-.9L4 20l1.3-3.2A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z"/>',
  share:'<path d="m5 12 14-8-4 16-4.2-6.1zM10.8 13.9 19 4"/>',
  bookmark:'<path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21z"/>',
  upload:'<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
  shield:'<path d="M12 3 19 6v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6z"/><path d="m9 12 2 2 4-4"/>',
  lock:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  useredit:'<circle cx="9" cy="8" r="3"/><path d="M3 20c.5-3 2.5-5 6-5 1.5 0 2.7.3 3.7.9M16 13l4 4-4.5 1-1-4z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  spark:'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.2-3.3-8.5S9.8 5.9 12 3.5Z"/>'
};
function svg(n,cls='ico'){return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SVG[n]||SVG.arrow}</svg>`;}
function tema(){const r=document.documentElement,d=r.dataset.theme==='dark';r.dataset.theme=d?'light':'dark';toast(d?'Modo claro ':'Modo oscuro ')}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(e.h);e.h=setTimeout(()=>e.classList.remove('on'),2400)}
async function upl(bucket,path,f){const u=await sb.storage.from(bucket).upload(path,f,{contentType:f.type,upsert:true});if(err(u))return;return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl}
const ext=f=>(f.name?.split('.').pop()||'bin').toLowerCase();

/* ---------- AUTH ---------- */
async function registro(){
  const nombre=$('#rn').value.trim(),username=$('#ru').value.trim().replace(/^@/,'').toLowerCase(),email=$('#re').value.trim(),password=$('#rp').value;
  if(!nombre||!username||!email||password.length<6)return toast('Completa todo (contraseña mín. 6)');
  if(!/^[a-z0-9_.]{3,20}$/.test(username))return toast('Usuario: 3-20 letras, números, _ o .');
  const {data:ex}=await sb.from('profiles').select('id').eq('username',username).maybeSingle();
  if(ex)return toast('Ese usuario ya existe');
  const {data,error}=await sb.auth.signUp({email,password,options:{data:{nombre,username}}});
  if(error)return toast(error.message);
  if(!data.session){toast('Revisa tu correo para confirmar y luego entra');return go('login')}
  if(await start(data.session.user))go('onb');
}
async function login(){
  const {data,error}=await sb.auth.signInWithPassword({email:$('#le').value.trim(),password:$('#lp').value});
  if(error)return toast(error.message);
  if(await start(data.user))go(prof.gustos?.length?'feed':'onb');
}
async function recoverPassword(){
  const email=$('#recoverEmail').value.trim();
  if(!email)return toast('Escribe tu correo');
  const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
  if(error)return toast(error.message);
  toast('Te enviamos un correo, revisa tu bandeja y spam');
}
async function updatePassword(){
  const nueva=$('#newPassword').value;
  const confirmacion=$('#newPasswordConfirm').value;
  if(nueva.length<6)return toast('La contraseña debe tener mínimo 6 caracteres');
  if(nueva!==confirmacion)return toast('Las contraseñas no coinciden');
  const {data,error}=await sb.auth.updateUser({password:nueva});
  if(error)return toast(error.message);
  if(data.user){await start(data.user);go('feed');toast('Contraseña actualizada');}
}
sb.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){ me=session?.user||me; go('reset'); }
});
async function start(u){
  me=u;
  let {data:p}=await sb.from('profiles').select('*').eq('id',u.id).maybeSingle();
  if(!p){
    const m=u.user_metadata||{};
    const r=await sb.from('profiles').insert({id:u.id,username:m.username||u.email.split('@')[0],nombre:m.nombre||'',gustos:[]}).select().single();
    if(err(r)){me=null;return false}
    p=r.data;
    await sb.from('circulos').insert(['Familia','Escuela','Compas','Trabajo'].map(nombre=>({user_id:u.id,nombre,miembros:0})));
  }
  prof=p;picks=Array.isArray(p.gustos)?p.gustos:[];
  try{pins=JSON.parse(localStorage['pins'+u.id]||'[]')}catch(e){pins=[]}
  await loadCirc();subRT();return true;
}
async function logout(){await sb.auth.signOut();sb.removeAllChannels();me=prof=cur=null;go('home')}
(async()=>{const {data:{session}}=await sb.auth.getSession();const recovery=location.hash.includes('type=recovery')||location.search.includes('type=recovery');if(recovery){me=session?.user||null;go('reset')}else if(session&&await start(session.user))go(prof.gustos?.length?'feed':'onb');else if(!$('#s-ban').classList.contains('on'))go('home')})();

/* ---------- GUSTOS ---------- */
function bubbles(){$('#more').textContent=more?'Ver menos −':'Ver más gustos +';$('#bubbles').innerHTML=(more?CATS:CATS.slice(0,8)).map(c=>`<button class="chip text-base ${picks.includes(c)?'on':''}" style="padding:12px 20px;font-size:17px" onclick="pick('${c}')">${svg('spark')} ${c}</button>`).join('')}
function toggleMore(){more=!more;bubbles()}
function pick(c){picks=picks.includes(c)?picks.filter(x=>x!==c):[...picks,c];bubbles()}
async function saveGustos(){
  if(!picks.length)return toast('Elige al menos un gusto');
  const r=await sb.from('profiles').update({gustos:picks}).eq('id',me.id);if(err(r))return;
  prof.gustos=picks;go('feed');
}

/* ---------- FEED ---------- */
function chips(){$('#chips').innerHTML=['Todos','Comedia','Música','Factos','Cocina','Deportes'].map(c=>`<button class="chip ${c===cat&&!xit?'on':''}" onclick="setCat('${c}')">${c}</button>`).join('')}
function setCat(c){cat=c;xit=false;feed()}
function goCat(c){cat=c||'Todos';xit=false;go('feed')}
function xitMode(){xit=!xit;feed()}
async function loadPosts(){
  const r=await sb.from('posts').select('*').order('creado_en',{ascending:false}).limit(60);if(err(r))return;
  const l=r.data.filter(p=>!p.circulo||p.circulo==='Público'||p.user_id===me.id);
  const ids=l.map(p=>p.id),uids=[...new Set(l.map(p=>p.user_id))];
  const [a,b]=await Promise.all([ids.length?sb.from('xits').select('post_id,user_id').in('post_id',ids):{data:[]},uids.length?sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,es_creador,baneado,verificado_identidad,verificado_premium').in('id',uids):{data:[]}]);
  const pm=Object.fromEntries((b.data||[]).map(x=>[x.id,x]));
  l.forEach(p=>{const xs=(a.data||[]).filter(x=>x.post_id===p.id);p.xc=xs.length;p.mine=xs.some(x=>x.user_id===me.id);p.pr=pm[p.user_id]||{}});
  POSTS=l.filter(p=>!p.pr.baneado);
}
async function feed(){
  chips();stories();$('#xban').classList.toggle('hidden',!xit);
  $('#feed').innerHTML='<p class="p-8 text-center" style="color:var(--mut)">Cargando…</p>';
  await loadPosts();
  let l=[...POSTS];
  if(xit)l=l.sort((a,b)=>b.xc-a.xc).slice(0,8);
  else if(cat!=='Todos')l=l.filter(p=>p.categoria===cat);
  else if(picks.length)l.sort((a,b)=>picks.includes(b.categoria)-picks.includes(a.categoria));
  $('#feed').innerHTML=l.map((p,i)=>`<div class="vid" style="background:linear-gradient(160deg,${GR[i%5]})">
   ${p.video_url?`<video src="${E(p.video_url)}" loop muted playsinline preload="metadata" class="absolute inset-0 w-full h-full object-cover" onclick="this.muted=!this.muted"></video>`:p.foto_url?`<img src="${E(p.foto_url)}" class="absolute inset-0 w-full h-full object-cover">`:`<div class="absolute inset-0 flex items-center justify-center text-[110px] opacity-40">${svg('spark')}</div>`}
   <div class="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" style="background:linear-gradient(transparent,#000b)"></div>
   <div class="absolute right-3 flex flex-col gap-4" style="bottom:90px">
     <button class="act ${p.mine?'liked':''}" onclick="doXit('${p.id}',this)">${svg('plus','act-icon')}<span>${p.xc}</span></button>
     <button class="act" onclick="this.classList.toggle('liked');this.classList.toggle('liked')">${svg('heart','act-icon')}Like</button>
     <button class="act" onclick="toast('Comentarios (próximamente)')">${svg('comment','act-icon')}${p.comentarios_count||0}</button>
     <button class="act" onclick="toast('Enlace copiado')">${svg('share','act-icon')}Compartir</button>
     <button class="act" onclick="this.classList.toggle('saved');toast('Guardado')">${svg('bookmark','act-icon')}Guardar</button>
   </div>
   <div class="absolute left-4 right-24 text-white pointer-events-none" style="bottom:86px">
     <span class="inline-flex items-center gap-1 pointer-events-auto" onclick="verUser('${p.user_id}')">${av(p.pr,24)}<b>@${E(p.pr.username||'usuario')}</b></span> ${vbadge(p.pr)}${isOwner(p.pr)?'<span class="text-[11px] font-bold" style="color:#f5c518">Creador de Gelxit</span>':''}<span class="text-xs px-2 py-0.5 rounded-full ml-1" style="background:#0008">${p.circulo&&p.circulo!=='Público'?' '+E(p.circulo):E(p.categoria||'')}</span>
     <p class="mt-1 text-sm">${E(p.titulo)}</p></div></div>`).join('')||'<p class="p-8 text-center" style="color:var(--mut)">Aún no hay Xits aquí. ¡Sube el primero con el +!</p>';
  const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target.querySelector('video');if(v)e.isIntersecting?v.play().catch(()=>{}):v.pause()}),{root:$('#feed'),threshold:.6});
  $$('.vid').forEach(v=>io.observe(v));
}
async function doXit(id,b){
  const p=POSTS.find(x=>String(x.id)===String(id));if(!p)return;
  if(p.mine){const r=await sb.from('xits').delete().eq('post_id',p.id).eq('user_id',me.id);if(err(r))return;p.mine=false;p.xc--}
  else{const r=await sb.from('xits').insert({post_id:p.id,user_id:me.id});if(err(r))return;p.mine=true;p.xc++;toast('Xit enviado')}
  b.classList.toggle('liked',p.mine);b.querySelector('span').textContent=p.xc;
  sb.from('posts').update({xits_count:p.xc}).eq('id',p.id).then(()=>{});
}
async function trend(){
  if(!POSTS.length)await loadPosts();
  $('#trend').innerHTML=[...POSTS].sort((a,b)=>b.xc-a.xc).slice(0,10).map((p,i)=>`<button class="card p-3 flex items-center gap-3 text-left" data-c="${E(p.categoria)}" onclick="goCat(this.dataset.c)"><span class="text-3xl">${svg('spark')}</span><div class="flex-1"><b>@${E(p.pr.username||'usuario')}</b><div class="text-sm" style="color:var(--mut)">${E(p.titulo)}</div></div><span class="text-sm font-bold" style="color:var(--p)">${svg('plus')} ${p.xc}</span></button>`).join('')||'<p class="text-sm" style="color:var(--mut)">Aún no hay Xits pegando.</p>';
}

/* ---------- CREAR ---------- */
function setPC(c){pcat=c;cpick()}
function cpick(){
  $('#circPick').innerHTML=['Público',...CIRC.map(c=>c.nombre)].map(c=>`<button class="chip ${c===pc?'on':''}" data-c="${E(c)}" onclick="pc=this.dataset.c;cpick()">${c==='Público'?svg('globe'):''}${E(c)}</button>`).join('');
  if(!$('#catPick').children.length)$('#catPick').innerHTML=CATS.map(c=>`<button class="chip" data-c="${c}" onclick="setPC('${c}')">${svg('spark')} ${c}</button>`).join('');
  $$('#catPick .chip').forEach(b=>b.classList.toggle('on',b.dataset.c===pcat));
}
function prevVid(i){$('#vn').textContent=i.files[0]?.name||'Sube o graba tu video'}
async function publicar(){
  const f=$('#vf').files[0];if(!f)return toast('Elige un video primero');
  const t=$('#cap').value.trim()||'Mi nuevo Xit';
  toast('Subiendo Xit…');
  const url=await upl('posts',`${me.id}/${Date.now()}.${ext(f)}`,f);if(!url)return;
  const r=await sb.from('posts').insert({user_id:me.id,titulo:t.slice(0,80),descripcion:t,video_url:url,categoria:pcat,circulo:pc});if(err(r))return;
  $('#cap').value='';$('#vf').value='';$('#vn').textContent='Sube o graba tu video';cat='Todos';
  toast(pc==='Público'?'¡Publicado!':'Solo lo ve: '+pc);go('feed');
}

/* ---------- CÍRCULOS ---------- */
async function loadCirc(){const r=await sb.from('circulos').select('*').eq('user_id',me.id).order('creado_en');CIRC=r.data||[]}
function circList(){$('#circList').innerHTML=CIRC.map(c=>`<div class="card p-4 flex items-center gap-3"><span class="text-3xl">${svg('spark')}</span><div class="flex-1"><b>${E(c.nombre)}</b><div class="text-sm" style="color:var(--mut)">${c.miembros||0} personas</div></div><button class="pill" data-c="${E(c.nombre)}" onclick="pc=this.dataset.c;go('create')">Subir aquí</button></div>`).join('')}
async function newCirc(){const n=(prompt('Nombre del círculo')||'').trim();if(!n)return;const r=await sb.from('circulos').insert({user_id:me.id,nombre:n,miembros:0});if(err(r))return;await loadCirc();circList()}

/* ---------- CHAT (messages + Realtime) ---------- */
async function chats(){
  const m=await sb.from('chat_members').select('chat_id').eq('user_id',me.id);if(err(m))return;
  const ids=(m.data||[]).map(x=>x.chat_id);
  if(!ids.length){CH=[];$('#chatlist').innerHTML='<p class="p-8 text-center" style="color:var(--mut)">Aún no tienes chats. Toca “+ Nuevo”.</p>';return}
  const [c,mm,ms]=await Promise.all([sb.from('chats').select('*').in('id',ids),sb.from('chat_members').select('chat_id,user_id').in('chat_id',ids),sb.from('messages').select('*').in('chat_id',ids).order('creado_en',{ascending:false}).limit(200)]);
  const uids=[...new Set((mm.data||[]).map(x=>x.user_id))];
  const pr=await sb.from('profiles').select('id,nombre,username,avatar_url,foto_url,es_creador,verificado_identidad,verificado_premium').in('id',uids);
  const P=Object.fromEntries((pr.data||[]).map(x=>[x.id,x]));
  CH=(c.data||[]).map(x=>{
    const o=(mm.data||[]).filter(y=>y.chat_id===x.id&&y.user_id!==me.id).map(y=>P[y.user_id]).filter(Boolean),last=(ms.data||[]).find(y=>y.chat_id===x.id);
    return {...x,n:x.es_grupo?(x.nombre_grupo||'Grupo'):(o[0]?.nombre||o[0]?.username||'Chat'),e:x.es_grupo?'':'',a:x.es_grupo?null:o[0],l:last?(last.texto||' Archivo'):'Sin mensajes',ts:last?.creado_en||x.creado_en||''};
  }).sort((a,b)=>a.ts<b.ts?1:-1);
  $('#chatlist').innerHTML=CH.map((c,i)=>`<button class="flex items-center gap-3 w-full px-4 py-3 text-left" onclick="openChat(${i})">${c.a?av(c.a,48):`<span class="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-none" style="background:var(--card)">${c.e}</span>`}<div class="flex-1 min-w-0"><b>${E(c.n)}</b> ${c.a?vbadge(c.a):''}${c.es_grupo?' <span class="text-xs" style="color:var(--p)">Grupo</span>':''}<div class="text-sm truncate" style="color:var(--mut)">${E(c.l)}</div></div></button>`).join('');
}
function openChat(i){cur=CH[i];msKey='';MS=[];$('#chh').innerHTML=E(cur.e+' '+cur.n)+' '+(cur.a?vbadge(cur.a):'');$('#blk').classList.add('hidden');$('#inp').style.display='flex';$('#msgs').innerHTML='';go('chat');loadMsgs()}
async function loadMsgs(quiet){
  if(!cur)return;
  const r=await sb.from('messages').select('*').eq('chat_id',cur.id).order('creado_en').limit(200);
  if(r.error){quiet||err(r);return}
  MS=r.data;const k=MS.map(m=>m.id+':'+m.leido).join();
  if(k!==msKey){msKey=k;drawMsgs()}
  const un=MS.filter(m=>m.user_id!==me.id&&!m.leido).map(m=>m.id);
  if(un.length)sb.from('messages').update({leido:true}).in('id',un).then(()=>{});
}
function drawMsgs(){
  const e=$('#msgs');
  e.innerHTML=MS.map(m=>{const mine=m.user_id===me.id,body=m.foto_url?`<img src="${E(m.foto_url)}" class="rounded-xl max-w-full">`:m.video_url?`<video src="${E(m.video_url)}" controls playsinline class="rounded-xl max-w-full"></video>`:m.audio_url?`<audio src="${E(m.audio_url)}" controls class="max-w-full" style="height:36px"></audio>`:E(m.texto);
    return `<div class="bub ${mine?'me':'ot'}">${body}${mine?`<span class="${m.leido?'ok':'ok2'}">${m.leido?'':''}</span>`:''}</div>`}).join('');
  e.scrollTop=e.scrollHeight;
}
async function ins(o){const r=await sb.from('messages').insert({chat_id:cur.id,user_id:me.id,...o});if(err(r))return;loadMsgs(true)}
function send(){const i=$('#mi'),t=i.value.trim();if(!t)return;i.value='';ins({texto:t})}
function pickF(a,k){fileKind=k;const f=$('#cf');f.accept=a;f.click()}
async function sendFile(i){
  const f=i.files[0];i.value='';if(!f)return;toast('Enviando…');
  const url=await upl('posts',`${me.id}/chat-${cur.id}-${Date.now()}.${ext(f)}`,f);if(url)ins({[fileKind+'_url']:url});
}
function setMicState(recording){const e=$('#mic');if(e)e.innerHTML=recording?svg('close'):svg('mic')}
async function rec(){
  if(recd){recd.stop();return}
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:true}),ch=[];recd=new MediaRecorder(s);
    recd.ondataavailable=e=>ch.push(e.data);
    recd.onstop=async()=>{s.getTracks().forEach(t=>t.stop());const mt=recd.mimeType||'audio/webm';recd=null;setMicState(false);toast('Enviando nota de voz…');
      const url=await upl('posts',`${me.id}/voz-${Date.now()}.${mt.includes('mp4')?'m4a':'webm'}`,new Blob(ch,{type:mt}));if(url)ins({audio_url:url})};
    recd.start();setMicState(true);toast('Grabando… toca ⏹ para enviar');
  }catch(e){recd=null;toast('No hay permiso de micrófono')}
}
function bloq(){$('#blk').classList.remove('hidden');$('#inp').style.display='none';toast('Usuario bloqueado')}
async function newChat(){
  const t=prompt('Usuario con quien chatear (para grupo, varios separados por coma)');if(!t)return;
  const us=t.split(',').map(x=>x.trim().replace(/^@/,'').toLowerCase()).filter(Boolean);
  const pr=await sb.from('profiles').select('id,username').in('username',us);if(err(pr))return;
  if(!pr.data.length)return toast('No encontré ese usuario');
  const g=pr.data.length>1,nombre=g?(prompt('Nombre del grupo')||'Grupo'):null;
  const c=await sb.from('chats').insert({es_grupo:g,nombre_grupo:nombre}).select().single();if(err(c))return;
  const m=await sb.from('chat_members').insert([me.id,...pr.data.map(x=>x.id)].map(user_id=>({chat_id:c.data.id,user_id})));if(err(m))return;
  await chats();openChat(CH.findIndex(x=>x.id===c.data.id));
}
function subRT(){
  sb.removeAllChannels();
  sb.channel('gx-messages').on('postgres_changes',{event:'*',schema:'public',table:'messages'},p=>{
    const m=p.new||{};
    if(cur&&m.chat_id===cur.id&&$('#s-chat').classList.contains('on'))loadMsgs(true);
    else if($('#s-inbox').classList.contains('on'))chats();
  }).subscribe();
}
setInterval(()=>{if(me&&cur&&$('#s-chat').classList.contains('on'))loadMsgs(true)},5000);

/* ================= v2: Panel de Dueño, baneo, perfil/banner e historias ================= */
let USERS=[],ST={},LP={},SV={l:[],i:0,t:null};
const isAdmin=()=>!!prof&&(prof.es_creador===true||prof.username==='angelxit');
const isOwner=p=>!!p&&p.username==='angelxit';
const dayAgo=()=>new Date(Date.now()-864e5).toISOString();
function av(p,s=40,fb=''){p=p||{};const u=p.avatar_url||p.foto_url;return u?`<img src="${E(u)}" class="rounded-full object-cover flex-none" style="width:${s}px;height:${s}px">`:`<span class="rounded-full flex-none inline-flex items-center justify-center font-bold text-white" style="width:${s}px;height:${s}px;font-size:${Math.round(s/2.2)}px;background:linear-gradient(135deg,#6a00f4,#c026d3)">${E(fb||(p.nombre||p.username||'?')[0].toUpperCase())}</span>`}
function vbadge(p){p=p||{};return (isOwner(p)?svg('crown','verified-icon')+' ':'')+(p.verificado_identidad?badge('#2563EB'):'')+(p.verificado_premium?badge('#7C3AED'):'')}

function go(n){
  if(!me&&!['home','login','reg','recover','reset','ban'].includes(n))n='home';
  if(n==='admin'&&!isAdmin()){toast('No tienes permiso');n='feed'}
  $$('.s').forEach(e=>e.classList.toggle('on',e.id==='s-'+n));
  $('#nav').style.display=['feed','search','inbox','profile'].includes(n)?'flex':'none';
  $$('#nav [data-g]').forEach(b=>b.classList.toggle('act',b.dataset.g===n));
  ({feed,search:trend,inbox:chats,create:cpick,circ:circList,onb:bubbles,profile:perfil,admin:adminList,edit:editInit})[n]?.();
}
addEventListener('hashchange',()=>{if(location.hash==='#admin')go('admin')});

async function start(u){
  me=u;
  let {data:p}=await sb.from('profiles').select('*').eq('id',u.id).maybeSingle();
  if(!p){
    const m=u.user_metadata||{};
    const r=await sb.from('profiles').insert({id:u.id,username:m.username||u.email.split('@')[0],nombre:m.nombre||'',gustos:[]}).select().single();
    if(err(r)){me=null;return false}
    p=r.data;
    await sb.from('circulos').insert(['Familia','Escuela','Compas','Trabajo'].map(nombre=>({user_id:u.id,nombre,miembros:0})));
  }
  // Si el baneo por días ya caducó, se desbanea solo
  if(p.baneado && p.ban_hasta && new Date(p.ban_hasta) < new Date()){
    await sb.from('profiles').update({baneado:false, ban_hasta:null, ban_motivo:null}).eq('id', u.id);
    p.baneado = false; p.ban_hasta = null;
  }
  if(p.baneado){
    // Guardamos el motivo para mostrarlo en la pantalla de baneo
    localStorage['ban_motivo'] = p.ban_motivo || '';
    localStorage['ban_hasta'] = p.ban_hasta || 'permanente';
    await sb.auth.signOut();me=prof=null;go('ban');return false
  }
  prof=p;picks=Array.isArray(p.gustos)?p.gustos:[];
  try{pins=JSON.parse(localStorage['pins'+u.id]||'[]')}catch(e){pins=[]}
  await loadCirc();subRT();
  if(location.hash==='#admin')setTimeout(()=>go('admin'),300);
  return true;
}

/* ---------- PANEL DE DUEÑO + BANEO POR TIEMPO ---------- */
function banLabel(u){
  if(!u.baneado) return '';
  if(!u.ban_hasta) return ' · <span style="color:var(--danger)">BANEADO PERMA</span>';
  return ` · <span style="color:var(--danger)">Baneado hasta ${new Date(u.ban_hasta).toLocaleDateString('es-MX')} ${new Date(u.ban_hasta).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}</span>${u.ban_motivo?` · Motivo: ${E(u.ban_motivo)}`:''}`;
}
async function adminList(){
  if(!isAdmin())return;
  const q=($('#aq').value||'').trim().replace(/^@/,'').toLowerCase();
  let r=sb.from('profiles').select('*').order('creado_en',{ascending:false}).limit(100);
  if(q)r=r.ilike('username','%'+q+'%');
  const {data,error}=await r;if(error)return toast(error.message);
  USERS=data;
  $('#alist').innerHTML=data.map(u=>`<div class="card p-3 flex flex-col gap-2"><div class="flex items-center gap-3">${av(u,44)}<div class="flex-1 min-w-0"><b>${E(u.nombre||u.username)}</b> ${vbadge(u)}<div class="text-sm" style="color:var(--mut)">@${E(u.username)}${banLabel(u)}</div></div></div>
   <div class="flex flex-wrap gap-2">
    <button class="pill" onclick="adm('${u.id}','verificado_identidad')">${u.verificado_identidad?'Quitar verificación':'Verificar'}</button>
    <button class="pill" onclick="adm('${u.id}','verificado_premium')">${u.verificado_premium?'Quitar Premium':'Dar Premium'}</button>
    <button class="pill" onclick="verUser('${u.id}')">Ver perfil</button></div>
   <div style="background:#00000030;border:1px solid #ffffff14;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px">
    <b style="font-size:13px">🔨 Banear a @${E(u.username)}</b>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <select id="ban-dias-${u.id}" style="flex:1;padding:10px;border-radius:10px;background:#111;color:#fff;border:1px solid #ffffff20">
        <option value="1">1 día</option><option value="3">3 días</option><option value="7" selected>7 días</option><option value="30">30 días</option><option value="0">PERMANENTE</option><option value="custom">Escribir días...</option>
      </select>
      <input id="ban-custom-${u.id}" type="number" min="1" placeholder="Días" style="width:80px;padding:10px;border-radius:10px;background:#111;color:#fff;border:1px solid #ffffff20;display:none">
      <input id="ban-motivo-${u.id}" placeholder="Motivo (opcional)" style="flex:1;padding:10px;border-radius:10px;background:#111;color:#fff;border:1px solid #ffffff20">
    </div>
    <div style="display:flex;gap:8px">
      <button class="pill" style="flex:1;background:#ef4444;color:#fff;border:0" onclick="banUser('${u.id}')">Banear</button>
      ${u.baneado?`<button class="pill" style="flex:1;background:#22c55e;color:#fff;border:0" onclick="unbanUser('${u.id}')">Desbanear</button>`:''}
    </div>
   </div></div>`).join('')||'<p class="text-sm" style="color:var(--mut)">Sin resultados.</p>';
  // Mostrar/ocultar el input de días custom
  $$('select[id^="ban-dias-"]').forEach(sel=>{
    sel.onchange=()=>{ const id=sel.id.replace('ban-dias-',''); const inp=document.getElementById('ban-custom-'+id); if(inp) inp.style.display = sel.value==='custom' ? 'block' : 'none'; };
  });
}
async function banUser(id){
  if(!isAdmin())return toast('No tienes permiso');
  if(id===me.id)return toast('No puedes banearte a ti');
  const u=USERS.find(x=>String(x.id)===String(id)); if(!u) return;
  const sel=document.getElementById('ban-dias-'+id);
  let dias = sel ? sel.value : '7';
  if(dias==='custom'){ dias = document.getElementById('ban-custom-'+id)?.value || ''; if(!dias || Number(dias)<1) return toast('Escribe cuántos días'); }
  const motivo=document.getElementById('ban-motivo-'+id)?.value?.trim() || '';
  const esPerma = String(dias)==='0';
  const hasta = esPerma ? null : new Date(Date.now() + Number(dias)*864e5).toISOString();
  if(!confirm(`¿Banear a @${u.username} ${esPerma?'PERMANENTE':('por '+dias+' días')}?${motivo?'\nMotivo: '+motivo:''}`)) return;
  const r=await sb.from('profiles').update({baneado:true, ban_hasta:hasta, ban_motivo:motivo||null}).eq('id',id).select(); if(err(r))return;
  if(!r.data.length)return toast('Sin permiso: corre el SQL de ban_hasta en Supabase');
  toast(esPerma?'Baneado permanente':'Baneado por '+dias+' días'); adminList();
}
async function unbanUser(id){
  if(!isAdmin())return;
  const r=await sb.from('profiles').update({baneado:false, ban_hasta:null, ban_motivo:null}).eq('id',id).select(); if(err(r))return;
  toast('Desbaneado'); adminList();
}
async function adm(id,col){
  if(!isAdmin())return toast('No tienes permiso');
  const u=USERS.find(x=>String(x.id)===String(id));if(!u)return;const v=!u[col];
  const r=await sb.from('profiles').update({[col]:v}).eq('id',id).select();if(err(r))return;
  if(!r.data.length)return toast('Sin permiso: corre supabase.sql en Supabase');
  toast('Listo');adminList();
}
async function verUser(id){
  const [a,b,f]=await Promise.all([sb.from('profiles').select('*').eq('id',id).single(),sb.from('posts').select('*',{count:'exact',head:true}).eq('user_id',id),sb.from('follows').select('id').eq('seguidor_id',me.id).eq('seguido_id',id).maybeSingle()]);
  const u=a.data;if(!u)return toast('No se pudo cargar');
  $('#sheetc').innerHTML=`<div style="height:90px;background:${bannerBackground(u.banner_url)}"></div><div class="flex flex-col items-center text-center px-6 pb-6" style="margin-top:-36px"><div style="border:4px solid var(--bg);border-radius:999px">${av(u,72)}</div><h3 class="mt-2 text-lg font-extrabold">${E(u.nombre||u.username)} ${vbadge(u)}</h3><div class="text-sm" style="color:var(--mut)">@${E(u.username)}${isOwner(u)?' · <span style="color:#f5c518;font-weight:700">Creador de Gelxit</span>':''}</div><p class="mt-2 text-sm">${E(u.bio||'')}</p><div class="flex gap-6 mt-3 text-sm"><span><b>${u.seguidores_count||0}</b> seguidores</span><span><b>${b.count||0}</b> Xits</span></div><div class="flex gap-2 mt-4 w-full">${u.id===me.id?'':`<button class="btn" id="fb" style="padding:10px" onclick="seguir('${id}')">${f.data?'Siguiendo':'Seguir'}</button>`}<button class="btn2" style="padding:10px" onclick="$('#sheet').classList.add('hidden')">Cerrar</button></div></div>`;
  $('#sheet').classList.remove('hidden');
}
async function seguir(id){
  const b=$('#fb'),on=b.textContent==='Siguiendo';
  const r=on?await sb.from('follows').delete().eq('seguidor_id',me.id).eq('seguido_id',id):await sb.from('follows').insert({seguidor_id:me.id,seguido_id:id});
  if(err(r))return;b.textContent=on?'Seguir':'Siguiendo';
}

/* ---------- PERFIL, BANNER, EDITAR ---------- */
function setAv(){const a=$('#av'),u=prof.avatar_url||prof.foto_url;a.style.background=u?`url("${u}") center/cover`:'linear-gradient(135deg,#6a00f4,#c026d3)';$('#avi').textContent=u?'':(prof.nombre||prof.username||'?')[0].toUpperCase()}
async function perfil(){
  const p=prof;
  $('#bn').style.background=bannerBackground(p.banner_url);$('#bn').dataset.hasBanner=p.banner_url?'true':'false';
  $('#pn').textContent=p.nombre||p.username;
  $('#pu').innerHTML='@'+E(p.username)+(isOwner(p)?' · <span style="color:var(--p);font-weight:700">Creador de Gelxit</span>':'');
  $('#pb').textContent=p.bio||'Cuéntale al mundo quién eres';
  $('#ps').textContent=p.seguidores_count||0;$('#pg').textContent=p.siguiendo_count||0;
  $('#vb').innerHTML=vbadge(p);
  $('#b1').innerHTML=badge('#2563EB');$('#b2').innerHTML=badge('#7C3AED');
  $('#v1').textContent=p.verificado_identidad?'Verificado ':'Pronto';$('#v2').textContent=p.verificado_premium?'Verificado ':'Pronto';
  $('#adm').innerHTML=isAdmin()?`<button class="btn2 mt-3" style="border-color:var(--p)" onclick="go('admin')">${svg('crown','verified-icon')} Panel de Dueño</button>`:'';
  setAv();
  const r=await sb.from('posts').select('*').eq('user_id',me.id).order('creado_en',{ascending:false});
  MY=r.data||[];$('#pv').textContent=MY.length;
  let xc=0;if(MY.length){const x=await sb.from('xits').select('*',{count:'exact',head:true}).in('post_id',MY.map(v=>v.id));xc=x.count||0}
  $('#px').textContent=xc;grid();
}
async function upAvatar(i){
  const f=i.files[0];i.value='';if(!f)return;toast('Subiendo foto…');
  const url=await upl('avatars',`${me.id}/avatar-${Date.now()}.${ext(f)}`,f);if(!url)return;
  const r=await sb.from('profiles').update({avatar_url:url,foto_url:url}).eq('id',me.id);if(err(r))return;
  prof.avatar_url=prof.foto_url=url;setAv();toast('Foto actualizada');
}
function prevImg(i,id){const f=i.files[0];if(!f)return;const e=$('#'+id);e.style.background=`url("${URL.createObjectURL(f)}") center/cover`;e.dataset.hasBanner=id==='bn2'?'true':e.dataset.hasBanner;if(id==='av2')e.textContent=''}
function editInit(){
  $('#enm').value=prof.nombre||'';$('#eus').value=prof.username||'';$('#ebi').value=prof.bio||'';
  const a=prof.avatar_url||prof.foto_url;
  $('#bn2').style.background=bannerBackground(prof.banner_url);$('#bn2').dataset.hasBanner=prof.banner_url?'true':'false';
  $('#av2').style.background=a?`url("${a}") center/cover`:'linear-gradient(135deg,#6a00f4,#c026d3)';$('#av2').textContent=a?'':'';
}
async function saveEdit(){
  const nombre=$('#enm').value.trim(),username=$('#eus').value.trim().replace(/^@/,'').toLowerCase(),bio=$('#ebi').value.trim();
  if(!/^[a-z0-9_.]{3,20}$/.test(username))return toast('Usuario: 3-20 letras, números, _ o .');
  if(username!==prof.username){const {data:ex}=await sb.from('profiles').select('id').eq('username',username).maybeSingle();if(ex)return toast('Ese usuario ya existe')}
  const d={nombre,username,bio},af=$('#eaf').files[0],bf=$('#ebf').files[0];
  toast('Guardando…');
  if(af){const u=await upl('avatars',`${me.id}/avatar-${Date.now()}.${ext(af)}`,af);if(!u)return;d.avatar_url=d.foto_url=u}
  if(bf){const u=await upl('banners',`${me.id}/banner-${Date.now()}.${ext(bf)}`,bf);if(!u)return;d.banner_url=u}
  const r=await sb.from('profiles').update(d).eq('id',me.id);if(err(r))return;
  Object.assign(prof,d);$('#eaf').value='';$('#ebf').value='';toast('Perfil actualizado');go('profile');
}

/* ---------- AUDIO ---------- */
function setMicState(recording){const e=$('#mic');if(e)e.innerHTML=recording?svg('close'):svg('mic')}
async function rec(){
  if(recd){recd.stop();return}
  if(!window.MediaRecorder)return toast('Tu navegador no graba audio');
  try{
    const s=await navigator.mediaDevices.getUserMedia({audio:true}),ch=[];
    const mt=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
    recd=mt?new MediaRecorder(s,{mimeType:mt}):new MediaRecorder(s);
    recd.ondataavailable=e=>e.data.size&&ch.push(e.data);
    recd.onstop=async()=>{
      s.getTracks().forEach(t=>t.stop());const t=(recd.mimeType||mt||'audio/mp4').split(';')[0];recd=null;setMicState(false);
      if(!ch.length)return toast('No se grabó nada');toast('Enviando audio…');
      const url=await upl('audios',`${me.id}/voz-${Date.now()}.${t.includes('mp4')?'m4a':'webm'}`,new Blob(ch,{type:t}));if(url)ins({audio_url:url});
    };
    recd.start();setMicState(true);toast('Grabando… toca ⏹ para enviar');
  }catch(e){recd=null;toast('Permite el micrófono para grabar')}
}

/* ---------- MENÚ + ---------- */
function plusMenu(){$('#plus').classList.remove('hidden')}
function pm(a){$('#plus').classList.add('hidden');({xit:()=>{$('#cap').value='#xit ';go('create')},hist:subirHist,vid:()=>go('create')})[a]?.()}

/* ---------- HISTORIAS ---------- */
async function stories(){
  const a=await sb.from('historias').select('*').gt('creado_en',dayAgo()).order('creado_en');
  const hs=a.data||[],ls=[];
  const ids=[...new Set([...hs.map(x=>x.user_id),me.id])];
  const [pr,vs]=await Promise.all([sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,baneado,es_creador').in('id',ids),sb.from('historia_vistas').select('historia_id').eq('user_id',me.id)]);
  LP=Object.fromEntries((pr.data||[]).map(x=>[x.id,x]));
  const seen=new Set((vs.data||[]).map(x=>x.historia_id)),g={};
  hs.forEach(h=>{if(LP[h.user_id]?.baneado)return;(g[h.user_id]=g[h.user_id]||[]).push(h)});ST=g;
  const mine=g[me.id],B='class="flex flex-col items-center gap-1 flex-none"';
  let h=`<button ${B} onclick="${mine?`openStory('${me.id}')`:'subirHist()'}"><div class="relative p-0.5 rounded-full" style="border:2.5px solid ${mine?'var(--p)':'var(--bd)'}">${av(prof,52)}<span class="absolute -right-1 -bottom-1 w-5 h-5 rounded-full text-white text-sm font-bold flex items-center justify-center" style="background:var(--p)" onclick="event.stopPropagation();subirHist()">+</span></div><span class="text-[11px]">Tu historia</span></button>`;
  Object.keys(g).filter(u=>u!==me.id).forEach(u=>{const p=LP[u];if(!p)return;const nu=g[u].some(x=>!seen.has(x.id));h+=`<button ${B} onclick="openStory('${u}')"><div class="p-0.5 rounded-full" style="border:2.5px solid ${nu?'var(--p)':'var(--bd)'}">${av(p,52)}</div><span class="text-[11px] truncate" style="max-width:60px">${E(p.username)}</span></button>`});
  $('#stories').innerHTML=h;
  sb.from('historias').delete().eq('user_id',me.id).lte('creado_en',dayAgo()).then(()=>{});
}
function subirHist(){$('#sf').click()}
async function upHist(i){
  const f=i.files[0];i.value='';if(!f)return;toast('Subiendo historia…');
  const url=await upl('historias',`${me.id}/${Date.now()}.${ext(f)}`,f);if(!url)return;
  const r=await sb.from('historias').insert({user_id:me.id,media_url:url,tipo:f.type.startsWith('video')?'video':'foto'});if(err(r))return;
  toast('Historia publicada');stories();
}
function openStory(u){SV={l:ST[u]||[],i:0,t:null};showS()}
function showS(){
  clearTimeout(SV.t);const h=SV.l[SV.i];if(!h)return closeS();
  const p=LP[h.user_id]||prof,mine=h.user_id===me.id,vid=h.tipo==='video';
  $('#sv').style.display='flex';
  $('#svm').innerHTML=vid?`<video src="${E(h.media_url)}" autoplay playsinline class="w-full h-full object-contain" onended="nextS()"></video>`:`<img src="${E(h.media_url)}" class="w-full h-full object-contain">`;
  $('#svh').innerHTML=`${av(p,36)}<b>@${E(p.username)}</b> ${vbadge(p)}<span class="text-xs opacity-70 ml-auto">${SV.i+1}/${SV.l.length}</span>`;
  $('#svb').innerHTML=mine?`<button class="pill" onclick="verVistas('${h.id}')">${svg('user')} Quién la vio</button><button class="pill" onclick="borrarHist('${h.id}')">${svg('close')}</button>`:`<input id="svr" placeholder="Responder…" onfocus="clearTimeout(SV.t)" onkeydown="if(event.key==='Enter')respH()"><button class="pill" onclick="respH()"></button>`;
  if(!mine)sb.from('historia_vistas').insert({historia_id:h.id,user_id:me.id}).then(()=>{});
  if(!vid)SV.t=setTimeout(nextS,5000);
}
function nextS(){SV.i++;showS()}
function prevS(){SV.i=Math.max(0,SV.i-1);showS()}
function closeS(){clearTimeout(SV.t);$('#sv').style.display='none';$('#svm').innerHTML='';stories()}
async function borrarHist(id){const r=await sb.from('historias').delete().eq('id',id);if(err(r))return;SV.l.splice(SV.i,1);toast('Historia borrada');showS()}
async function verVistas(id){
  clearTimeout(SV.t);
  const r=await sb.from('historia_vistas').select('user_id').eq('historia_id',id),ids=(r.data||[]).map(x=>x.user_id);
  const p=ids.length?(await sb.from('profiles').select('id,username,nombre,avatar_url,foto_url').in('id',ids)).data||[]:[];
  $('#sheetc').innerHTML=`<div class="p-5"><b> ${p.length} vieron tu historia</b><div class="mt-3 flex flex-col gap-2 max-h-72 overflow-y-auto">${p.map(u=>`<div class="flex items-center gap-3">${av(u,36)}<span>@${E(u.username)}</span></div>`).join('')||'<span class="text-sm" style="color:var(--mut)">Aún nadie</span>'}</div><button class="btn2 mt-4" onclick="$('#sheet').classList.add('hidden');showS()">Cerrar</button></div>`;
  $('#sheet').classList.remove('hidden');
}
async function dm(uid){
  const m=await sb.from('chat_members').select('chat_id').eq('user_id',me.id),ids=(m.data||[]).map(x=>x.chat_id);
  if(ids.length){const o=await sb.from('chat_members').select('chat_id').eq('user_id',uid).in('chat_id',ids),cs=(o.data||[]).map(x=>x.chat_id);
    if(cs.length){const c=await sb.from('chats').select('id').in('id',cs).eq('es_grupo',false).limit(1);if(c.data?.[0])return c.data[0].id}}
  const c=await sb.from('chats').insert({es_grupo:false}).select().single();if(err(c))return;
  const r=await sb.from('chat_members').insert([me.id,uid].map(user_id=>({chat_id:c.data.id,user_id})));if(err(r))return;return c.data.id;
}
async function respH(){
  const t=$('#svr').value.trim();if(!t)return;const c=await dm(SV.l[SV.i].user_id);if(!c)return;
  const r=await sb.from('messages').insert({chat_id:c,user_id:me.id,texto:'Respuesta a tu historia: '+t});if(err(r))return;
  $('#svr').value='';toast('Respuesta enviada');
}

// === CONFIG REAL GELXIT V7 FINAL ===
let __cfgCache = null; let __lastCfgTitle='';
async function getCfg(){
  if(!me) return null; if(__cfgCache) return __cfgCache;
  const {data} = await sb.from('user_settings').select('*').eq('user_id', me.id).maybeSingle();
  if(data){ __cfgCache = data; return data; }
  const {data:created} = await sb.from('user_settings').insert({user_id: me.id}).select().single();
  __cfgCache = created || {}; return __cfgCache;
}
async function saveCfg(patch){
  if(!me) return; __cfgCache = {...(__cfgCache||{}), ...patch};
  const {error} = await sb.from('user_settings').upsert({user_id: me.id, ...patch, updated_at: new Date().toISOString()});
  if(error) return toast(error.message); toast('Guardado en Supabase');
}
function sw(label, key, val, desc){ return `<label style="display:flex;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid #ffffff14;cursor:pointer"><span><b style="display:block">${label}</b><small style="opacity:.65">${desc}</small></span><input type="checkbox" data-cfg="${key}" ${val?'checked':''} style="width:44px;height:24px;accent-color:#6a00f4"></label>`; }
function inp(label, key, val, ph, type){ return `<label style="display:block;margin:12px 0"><b>${label}</b><input type="${type||'text'}" data-cfg-input="${key}" value="${String(val??'').replace(/"/g,'')}" placeholder="${ph}" style="width:100%;margin-top:6px;padding:12px;border-radius:12px;background:#00000040;color:#fff;border:1px solid #ffffff20"></label>`; }
function btn(label, id, color){ return `<button id="${id}" style="width:100%;padding:13px;border:0;border-radius:12px;background:${color||'#6a00f4'};color:#fff;font-weight:700;margin-top:12px">${label}</button>`; }
function isVisibleCfg(el){ if(!el) return false; let p=el; while(p && p!==document.body){ const s=getComputedStyle(p); if(s.display==='none'||s.visibility==='hidden') return false; p=p.parentElement; } const r=el.getBoundingClientRect(); return r.width>0 && r.height>0; }
function getVisibleTitle(){
  const titles=['Gestión del perfil','Personalización','Notificaciones','Privacidad','Seguridad','Cuenta'];
  const els=[...document.querySelectorAll('h1,h2,h3,div,span,b')].filter(el=>titles.includes(el.textContent?.trim()) && el.children.length===0 && isVisibleCfg(el));
  if(!els.length) return ''; els.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top); return els[0].textContent.trim();
}
async function renderRealSettings(){
  const all=[...document.querySelectorAll('div,p,span')];
  const placeholder=all.find(el=>el.textContent?.trim()==='Esta sección está lista para conectar sus controles reales.' && isVisibleCfg(el));
  if(!placeholder) return;
  const title=getVisibleTitle(); if(!title) return;
  const box=placeholder.parentElement||placeholder;
  if(box.dataset.cfgTitle===title && __lastCfgTitle===title) return;
  box.dataset.cfgTitle=title; __lastCfgTitle=title;
  const cfg=await getCfg()||{}; const prof2=prof||{}; let html='';
  if(title==='Cuenta'){
    const {data:{user}} = await sb.auth.getUser();
    const fecha=user?.created_at?new Date(user.created_at).toLocaleDateString('es-MX'):'Hoy';
    html=`<p style="opacity:.7">Administra los datos de tu cuenta. Tu email nunca se muestra a otros.</p><div style="background:#00000040;padding:14px;border-radius:12px;margin:12px 0"><b>🔒 Sesión actual</b><br><small style="opacity:.7">Conectado como:<br>${E(me?.email||'')}</small><br><small style="opacity:.7">Cuenta creada: ${fecha}</small><br><small style="opacity:.7">Dispositivo: Este teléfono</small></div>${inp('Cambiar email','new-email','','Nuevo email','email')}${btn('Cambiar mi email','cfg-change-email')}${btn('Cerrar sesión en este dispositivo','cfg-logout','#ef4444')}${btn('Cerrar sesión en TODOS los dispositivos','cfg-logout-all','#7f1d1d')}<div style="background:#7f1d1d30;border:1px solid #ef444444;padding:14px;border-radius:12px;margin-top:16px"><b style="color:#fca5a5">⚠️ Zona peligrosa</b><p style="opacity:.7;font-size:13px">Al eliminar tu cuenta se borra tu perfil y tu configuración para siempre.</p>${inp('Escribe tu contraseña para confirmar','delete-pass','','Tu contraseña actual','password')}${btn('Eliminar mi cuenta para siempre','cfg-delete','#ef4444')}</div>`;
  } else if(title==='Privacidad'){
    const {data:bloq}=await sb.from('blocked_users').select('blocked_id').eq('blocker_id',me.id);
    let bloqHtml='<p style="opacity:.6">No tienes a nadie bloqueado.</p>';
    if(bloq && bloq.length){ bloqHtml=''; for(const b of bloq){ const {data:p}=await sb.from('profiles').select('username,nombre').eq('id',b.blocked_id).maybeSingle(); bloqHtml+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #ffffff14"><span><b>${E(p?.username||'Usuario')}</b><br><small style="opacity:.6">${E(p?.nombre||'')}</small></span><button data-unblock="${b.blocked_id}" style="padding:8px 14px;border-radius:8px;border:0;background:#ef4444;color:#fff">Desbloquear</button></div>`; } }
    const {data:reqs}=await sb.from('follow_requests').select('*').eq('to_id',me.id).eq('status','pending');
    let reqHtml='';
    if(reqs && reqs.length){ reqHtml=`<div style="margin-top:16px"><b>Solicitudes de seguimiento (${reqs.length})</b>`; for(const r of reqs){ const {data:p}=await sb.from('profiles').select('username').eq('id',r.from_id).maybeSingle(); reqHtml+=`<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #ffffff14"><span>@${E(p?.username||'usuario')}</span><span><button data-req-accept="${r.id}" style="padding:6px 12px;border:0;border-radius:8px;background:#22c55e;color:#fff;margin-right:6px">Aceptar</button><button data-req-reject="${r.id}" style="padding:6px 12px;border:0;border-radius:8px;background:#ef4444;color:#fff">Rechazar</button></span></div>`; } reqHtml+=`</div>`; }
    html=`<p style="opacity:.7">Define cómo se comparte tu contenido y quién puede encontrarte.</p>${sw('Perfil público','perfil_publico',cfg.perfil_publico,'Si lo apagas, tu cuenta es privada y nadie te sigue sin tu aprobación')}${sw('Cuenta privada','cuenta_privada',cfg.cuenta_privada,'Solo tus seguidores aprobados ven tu contenido')}${sw('Permitir que me encuentren','permitir_busqueda',cfg.permitir_busqueda,'Apareces en búsqueda')}${sw('Permitir mensajes','permitir_mensajes',cfg.permitir_mensajes,'Otros pueden escribirte')}${sw('Mostrar mi actividad','mostrar_actividad',cfg.mostrar_actividad,'Se muestra si estás activo')}${sw('Ocultar mi email','ocultar_email',cfg.ocultar_email ?? true,'Tu email nunca se muestra a otros')}<div style="margin-top:18px"><b>🚫 Usuarios bloqueados</b><p style="opacity:.6;font-size:13px">Los bloqueados no pueden ver tu perfil ni escribirte.</p>${inp('Bloquear por usuario','block-user','','@usuario')}${btn('Bloquear usuario','cfg-block','#ef4444')}${bloqHtml}</div>${reqHtml}`;
  } else if(title==='Seguridad'){
    html=`<p style="opacity:.7">Protege tu cuenta. Usa una contraseña que solo tú sepas.</p>${inp('Nueva contraseña','new-pass','','Mínimo 6 caracteres','password')}${btn('Cambiar contraseña','cfg-pass')}${inp('Confirmar contraseña actual','confirm-pass','','Para verificar que eres tú','password')}<div style="background:#00000040;padding:12px;border-radius:12px;margin-top:12px"><b>Consejos de seguridad</b><br><small style="opacity:.7">• No compartas tu contraseña<br>• Cierra sesión si usas otro cel<br>• Si alguien entra a tu cuenta, cambia tu contraseña y cierra sesión en todos los dispositivos</small></div>${btn('Cerrar sesión en TODOS los dispositivos','cfg-logout-all2','#7f1d1d')}`;
  } else if(title==='Notificaciones'){
    html=`<p style="opacity:.7">Configura los avisos.</p>${sw('Me gusta','notif_likes',cfg.notif_likes,'Cuando dan like')}${sw('Comentarios','notif_comentarios',cfg.notif_comentarios,'Cuando comentan')}${sw('Nuevos seguidores','notif_seguidores',cfg.notif_seguidores,'Cuando te siguen')}${sw('Mensajes','notif_mensajes',cfg.notif_mensajes,'Cuando te escriben')}${sw('Alertas de inicio de sesión','notif_login',cfg.notif_login,'Si alguien entra a tu cuenta')}`;
  } else if(title==='Personalización'){
    html=`<p style="opacity:.7">Ajusta la apariencia de Gelxit.</p><label style="display:block;margin:12px 0"><b>Tema</b><select data-cfg-select="tema" style="width:100%;padding:12px;border-radius:12px;background:#111;color:#fff;margin-top:6px"><option value="dark" ${cfg.tema==='dark'?'selected':''}>Oscuro</option><option value="light" ${cfg.tema==='light'?'selected':''}>Claro</option></select></label><label style="display:block;margin:12px 0"><b>Color de acento</b><input type="color" data-cfg-select="color_acento" value="${cfg.color_acento||'#6a00f4'}" style="width:100%;height:44px"></label>${sw('Reproducción automática','autoplay',cfg.autoplay,'Videos solos')}`;
  } else if(title==='Gestión del perfil'){
    html=`<p style="opacity:.7">Edita tu información pública. Tu email nunca se muestra aquí.</p>${inp('Nombre','nombre',prof2.nombre,'Tu nombre')}${inp('Usuario','username',prof2.username,'@usuario')}${inp('Biografía','bio',prof2.bio,'Cuéntanos de ti...')}${btn('Guardar perfil','cfg-save-perfil')}`;
  }
  if(!html) return; box.innerHTML=html; if(cfg.tema) document.documentElement.dataset.theme=cfg.tema;
}
document.addEventListener('click', async (e)=>{
  if(e.target.id==='cfg-logout'){ await sb.auth.signOut(); location.reload(); }
  if(e.target.id==='cfg-logout-all' || e.target.id==='cfg-logout-all2'){ if(!confirm('¿Cerrar sesión en TODOS los dispositivos?')) return; await sb.auth.signOut({scope:'global'}); location.reload(); }
  if(e.target.id==='cfg-delete'){
    const pass=document.querySelector('[data-cfg-input="delete-pass"]')?.value; if(!pass) return toast('Escribe tu contraseña para confirmar');
    const {error:errAuth}=await sb.auth.signInWithPassword({email:me.email,password:pass}); if(errAuth) return toast('Contraseña incorrecta');
    if(!confirm('¿SEGURO? Esto borra tu cuenta para siempre.')) return;
    await sb.from('profiles').delete().eq('id',me.id); await sb.auth.signOut(); location.reload();
  }
  if(e.target.id==='cfg-change-email'){
    const ne=document.querySelector('[data-cfg-input="new-email"]')?.value; if(!ne||!ne.includes('@')) return toast('Pon un email válido');
    const {error}=await sb.auth.updateUser({email:ne}); if(error) return toast(error.message); toast('Te mandamos un correo para confirmar el cambio');
  }
  if(e.target.id==='cfg-pass'){
    const pass=document.querySelector('[data-cfg-input="new-pass"]')?.value; if(!pass||pass.length<6) return toast('Pon mínimo 6');
    const {error}=await sb.auth.updateUser({password:pass}); if(error) return toast(error.message); toast('Contraseña cambiada');
  }
  if(e.target.id==='cfg-save-perfil'){ const nombre=document.querySelector('[data-cfg-input="nombre"]')?.value; const username=document.querySelector('[data-cfg-input="username"]')?.value; const bio=document.querySelector('[data-cfg-input="bio"]')?.value; const {error}=await sb.from('profiles').update({nombre,username,bio}).eq('id',me.id); if(error) return toast(error.message); toast('Perfil guardado'); location.reload(); }
  if(e.target.id==='cfg-block'){
    const u=document.querySelector('[data-cfg-input="block-user"]')?.value?.replace('@','').trim(); if(!u) return toast('Escribe el @usuario');
    const {data:target}=await sb.from('profiles').select('id').eq('username',u).maybeSingle(); if(!target) return toast('No existe ese usuario');
    if(target.id===me.id) return toast('No te puedes bloquear a ti');
    const {error}=await sb.from('blocked_users').insert({blocker_id:me.id,blocked_id:target.id}); if(error) return toast('Ya está bloqueado'); toast('Usuario bloqueado'); __lastCfgTitle=''; renderRealSettings();
  }
  const unblockId=e.target.dataset?.unblock; if(unblockId){ await sb.from('blocked_users').delete().eq('blocker_id',me.id).eq('blocked_id',unblockId); toast('Desbloqueado'); __lastCfgTitle=''; renderRealSettings(); }
  const acc=e.target.dataset?.reqAccept; if(acc){ await sb.from('follow_requests').update({status:'accepted'}).eq('id',acc); toast('Solicitud aceptada'); __lastCfgTitle=''; renderRealSettings(); }
  const rej=e.target.dataset?.reqReject; if(rej){ await sb.from('follow_requests').update({status:'rejected'}).eq('id',rej); toast('Solicitud rechazada'); __lastCfgTitle=''; renderRealSettings(); }
});
document.addEventListener('change', async (e)=>{
  const k=e.target.dataset.cfg; if(k){ await saveCfg({[k]:e.target.checked}); return; }
  const ks=e.target.dataset.cfgSelect; if(ks){ await saveCfg({[ks]:e.target.value}); if(ks==='tema') document.documentElement.dataset.theme=e.target.value; }
});

async function banConTiempo(id, btn){
  const card = btn.closest('div');
  // Busca los controles que están en esa tarjeta
  const wrap = btn.parentElement.parentElement;
  const sel = wrap.querySelector('[data-ban-tiempo]');
  const diasInput = wrap.querySelector('[data-ban-dias]');
  const motivoInput = wrap.querySelector('[data-ban-motivo]');
  let tiempo = sel ? sel.value : 'perma';
  let dias = 0;
  if(tiempo === 'custom') dias = parseInt(diasInput?.value || '0');
  else if(tiempo !== 'perma') dias = parseInt(tiempo);
  const motivo = motivoInput?.value?.trim() || 'Baneado por el dueño';

  if(tiempo === 'custom' && (!dias || dias <= 0)) return toast('Pon cuántos días, wey');
  if(!confirm(tiempo === 'perma' ? '¿Banear PERMANENTE?' : `¿Banear por ${dias} día(s)?`)) return;

  let patch = { baneado: true, ban_motivo: motivo, ban_hasta: null };
  if(dias > 0){
    const hasta = new Date(); hasta.setDate(hasta.getDate() + dias);
    patch.ban_hasta = hasta.toISOString();
  }
  const {error} = await sb.from('profiles').update(patch).eq('id', id);
  if(error) return toast(error.message);
  toast(tiempo === 'perma' ? 'Baneado permanente' : `Baneado por ${dias} día(s)`);
  if(typeof adminList === 'function') adminList();
}

// Esto le mete los controles de días a cada tarjeta del Panel de Dueño
setInterval(()=>{
  const btns = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Banear' && !b.dataset.banPatch);
  btns.forEach(b => {
    b.dataset.banPatch = '1';
    // Sacamos el id del onclick original: adm('ban','ID')
    const onclick = b.getAttribute('onclick') || '';
    const m = onclick.match(/'([^']+)'\s*,\s*'([^']+)'/) || onclick.match(/"([^"]+)"/);
    // Mejor: buscamos el id en el onclick completo
    const idMatch = onclick.match(/[a-f0-9-]{36}/);
    if(!idMatch) return;
    const id = idMatch[0];
    // Cambiamos el botón original para que abra los controles
    b.outerHTML = `<div style="margin-top:10px;background:#00000040;padding:10px;border-radius:12px">
      <b style="font-size:13px">⏳ ¿Cuánto lo baneas?</b>
      <select data-ban-tiempo style="width:100%;padding:10px;border-radius:10px;background:#111;color:#fff;margin-top:8px;border:1px solid #ffffff20">
        <option value="perma">♾️ Permanente</option>
        <option value="1">1 día</option>
        <option value="7">7 días</option>
        <option value="30">30 días</option>
        <option value="custom">✏️ Días personalizados...</option>
      </select>
      <input data-ban-dias type="number" min="1" placeholder="¿Cuántos días? Ej: 3" style="width:100%;padding:10px;border-radius:10px;background:#111;color:#fff;margin-top:8px;border:1px solid #ffffff20">
      <input data-ban-motivo placeholder="Motivo (opcional)" style="width:100%;padding:10px;border-radius:10px;background:#111;color:#fff;margin-top:8px;border:1px solid #ffffff20">
      <button onclick="banConTiempo('${id}', this)" style="width:100%;padding:11px;border:0;border-radius:10px;background:#ef4444;color:#fff;font-weight:700;margin-top:8px">Banear con este tiempo</button>
    </div>`;
  });
}, 800);
