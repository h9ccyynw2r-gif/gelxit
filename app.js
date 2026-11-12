'use strict';
/* Gelxit · app.js (Fase 2)
   Claves públicas de Supabase. NUNCA pongas aquí la service_role. */
const SUPABASE_URL='https://xialbhxpdmvvjjdxhjim.supabase.co';
const SUPABASE_KEY='sb_publishable_aDPceXWaF_KLchyEInN9jQ_3PoxTcxA';
const sb=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const CATS=['Comedia','Música','Baile','Factos','Cocina','Deportes','Noticias','Moda','Gaming','Anime y Manga','Memes','Arte y Dibujo','Belleza','Mascotas','Viajes','Naturaleza','Tecnología','Aprende','Fitness','Negocios','Autos','Fe','Fútbol','Chismes'];
const MINPASS=8,PAGE=15,PUBLIC=['home','login','reg','recover','reset','ban'],NAVS=['feed','search','inbox','profile'];
let me=null,prof=null,picks=[],cat='Todos',xit=false,pc='Público',pcat='Comedia',more=false;
let POSTS=[],EXTRA=[],MY=[],CIRC=[],CH=[],MS=[],cur=null,pins=[],recd=null,fileKind='',CFG=null,chatEnd=false;
let feedCursor=null,feedEnd=false,feedAt=0,USERS=[],ST={},LP={},SV={l:[],i:0,t:null},rtChan=null,IO=null,screen='home';
const SCR={},LOCK=new Set();

/* ---------- utilidades ---------- */
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const U=u=>{try{const x=new URL(u,location.href);return /^https?:$/.test(x.protocol)?x.href:''}catch{return ''}};
const cssUrl=u=>U(u).replace(/["\\()\s]/g,encodeURIComponent);
const fmt=n=>{n=+n||0;if(n>=1e6)return (n/1e6).toFixed(n%1e6===0?0:1).replace(/\.0$/,'')+'M';if(n>=1e3)return (n/1e3).toFixed(n%1e3===0?0:1).replace(/\.0$/,'')+'K';return String(n)};
const ext=f=>(f.name?.split('.').pop()||'bin').toLowerCase().replace(/[^a-z0-9]/g,'');
const dayAgo=()=>new Date(Date.now()-864e5).toISOString();
const isBanned=p=>!!p&&p.baneado===true&&(!p.ban_hasta||new Date(p.ban_hasta)>new Date());
const isOwner=p=>!!p&&p.es_creador===true;
const isAdmin=()=>!!prof&&prof.es_creador===true; // solo pista de interfaz: el permiso real lo exige el servidor
const withTimeout=(p,ms=20000)=>Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(Object.assign(new Error('timeout'),{timeout:true})),ms))]);
function msg(e){
  if(!navigator.onLine)return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
  if(e?.timeout)return 'Está tardando más de lo normal. Inténtalo de nuevo.';
  const m=(e?.message||'').toLowerCase(),c=e?.code||'';
  if(e?.status===429||m.includes('rate limit'))return 'Demasiados intentos. Espera un momento.';
  if(m.includes('invalid login'))return 'Correo o contraseña incorrectos.';
  if(m.includes('email not confirmed'))return 'Confirma tu correo antes de entrar.';
  if(c==='42501'||m.includes('row-level security'))return 'No tienes permiso para hacer esto.';
  if(c==='PGRST202'||m.includes('could not find the function'))return 'Esta acción aún no está activada en el servidor.';
  if(c==='23505')return 'Eso ya existe.';
  if(m.includes('exceeded')||m.includes('too large'))return 'El archivo es demasiado grande.';
  return 'No pudimos completar la acción. Inténtalo de nuevo.';
}
const err=r=>{if(r&&r.error){console.error(r.error);toast(msg(r.error));return true}return false};
function toast(t){const e=$('#toast');if(!e)return;e.textContent=t;e.setAttribute('role','status');e.setAttribute('aria-live','polite');e.classList.add('on');clearTimeout(e.h);e.h=setTimeout(()=>e.classList.remove('on'),3200)}
function setStatus(t,on=!!t){let e=$('#gxstatus');if(!e){e=document.createElement('div');e.id='gxstatus';e.setAttribute('role','status');e.setAttribute('aria-live','polite');e.innerHTML='<span></span><i class="gx-bar" aria-hidden="true"></i>';($('#app')||document.body).appendChild(e)}e.firstChild.textContent=t||'';e.classList.toggle('on',!!on)}
async function once(key,label,fn){
  if(LOCK.has(key))return;LOCK.add(key);
  const bs=$$('.s.on button.btn');bs.forEach(b=>b.disabled=true);setStatus(label,true);
  try{return await fn()}catch(e){console.error(e);toast(msg(e))}
  finally{LOCK.delete(key);bs.forEach(b=>b.disabled=false);setStatus('',false)}
}
const SVG={
  user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.7-3.2 3.1-5 7-5s6.3 1.8 7 5"/>',
  crown:'<path d="m3 7 4.5 4L12 5l4.5 6L21 7l-1.5 12h-15z"/><path d="M5 22h14"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
  send:'<path d="m4 4 16 8-16 8 3-8zM7 12h13"/>',
  share:'<path d="m5 12 14-8-4 16-4.2-6.1zM10.8 13.9 19 4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  spark:'<path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4M12 3.5c2.2 2.4 3.3 5.2 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.2-3.3-8.5S9.8 5.9 12 3.5Z"/>'
};
const svg=(n,cls='ico')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${SVG[n]||SVG.spark}</svg>`;
const badge=(c,l)=>`<svg role="img" aria-label="${l}" width="20" height="20" viewBox="0 0 24 24" style="display:inline"><title>${l}</title><circle cx="12" cy="12" r="11" fill="${c}"/><path d="M7 12.5l3.2 3.2L17 9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const vbadge=p=>{p=p||{};return (isOwner(p)?svg('crown','verified-icon')+' ':'')+(p.verificado_identidad?badge('#2563EB','Verificación azul'):'')+(p.verificado_premium?badge('#7C3AED','Premium'):'')};
const DEFAULT_BANNER='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 360"><rect width="1200" height="360" fill="#1d211b"/><path d="M-40 290 280 30M180 390 520 40M500 390 850 0M820 390 1180 70" stroke="#a0fbfd" stroke-width="2" opacity=".45"/><text x="62" y="235" fill="#fff8e7" font-family="Arial,sans-serif" font-size="116" font-weight="700">/Gelxit</text></svg>');
const bannerBg=u=>u&&cssUrl(u)?`url("${cssUrl(u)}") center/cover`:`url("${DEFAULT_BANNER}") center/cover`;
function av(p,s=40){p=p||{};const u=U(p.avatar_url||p.foto_url);return u?`<img src="${E(u)}" alt="" class="rounded-full object-cover flex-none" style="width:${s}px;height:${s}px">`:`<span aria-hidden="true" class="rounded-full flex-none inline-flex items-center justify-center font-bold text-white" style="width:${s}px;height:${s}px;font-size:${Math.round(s/2.2)}px;background:var(--p)">${E((p.nombre||p.username||'?')[0].toUpperCase())}</span>`}
function tema(){const r=document.documentElement,d=r.dataset.theme==='dark';r.dataset.theme=d?'light':'dark';try{localStorage.setItem('gx-theme',r.dataset.theme)}catch{}toast(d?'Modo claro':'Modo oscuro')}
async function upl(bucket,path,f){const u=await sb.storage.from(bucket).upload(path,f,{contentType:f.type,upsert:false});if(u.error)throw u.error;return sb.storage.from(bucket).getPublicUrl(path).data.publicUrl}
function ask(title,fields=[],ok='Aceptar'){return new Promise(res=>{
  const sh=$('#sheet'),f0=fields.map(f=>f.note?`<p class="text-sm" style="color:var(--mut)">${E(f.note)}</p>`:`<label class="flex flex-col gap-1 text-sm">${E(f.label)}<input name="${E(f.id)}" value="${E(f.value||'')}" placeholder="${E(f.ph||'')}" ${f.readonly?'readonly':''} type="${f.type||'text'}" autocapitalize="none" autocomplete="off"></label>`).join('');
  $('#sheetc').innerHTML=`<form id="askf" class="p-5 flex flex-col gap-3"><b class="text-lg">${E(title)}</b>${f0}<div class="flex gap-2"><button type="button" class="btn2" data-x>Cancelar</button><button class="btn">${E(ok)}</button></div></form>`;
  sh.classList.remove('hidden');
  const f=$('#askf'),close=v=>{sh.classList.add('hidden');sh.onclick=e=>{if(e.target===sh)sh.classList.add('hidden')};res(v)};
  sh.onclick=e=>{if(e.target===sh)close(null)};
  f.onsubmit=e=>{e.preventDefault();close(Object.fromEntries(new FormData(f)))};
  f.querySelector('[data-x]').onclick=()=>close(null);
  f.querySelector('input')?.focus();
})}
async function shareLink(url,title){
  try{if(navigator.share){await navigator.share({title,url});return}}catch(e){if(e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(url);toast('Enlace copiado')}catch{await ask('Copia este enlace',[{id:'u',label:'Enlace',value:url,readonly:true}],'Cerrar')}
}

/* ---------- AUTH ---------- */
function registro(){return once('reg','Creando tu cuenta…',async()=>{
  const nombre=$('#rn').value.trim(),username=$('#ru').value.trim().replace(/^@/,'').toLowerCase(),email=$('#re').value.trim(),password=$('#rp').value;
  if(!nombre||!username||!email||password.length<MINPASS)return toast(`Completa todo (contraseña de mínimo ${MINPASS} caracteres)`);
  if(!/^[a-z0-9_.]{3,20}$/.test(username))return toast('Usuario: 3-20 letras, números, _ o .');
  const {data:ex}=await withTimeout(sb.from('profiles').select('id').eq('username',username).maybeSingle());
  if(ex)return toast('Ese usuario ya existe');
  const {data,error}=await withTimeout(sb.auth.signUp({email,password,options:{data:{nombre,username},emailRedirectTo:location.origin+location.pathname}}));
  if(error)throw error;
  if(!data.session){toast('Cuenta creada. Revisa tu correo para confirmar tu dirección y continuar');return go('login')}
  if(await start(data.session.user)){toast('Cuenta creada. Te damos la bienvenida');go('onb')}
})}
function login(){return once('login','Iniciando sesión…',async()=>{
  const email=$('#le').value.trim(),password=$('#lp').value;
  if(!email||!password)return toast('Escribe tu correo y tu contraseña');
  const {data,error}=await withTimeout(sb.auth.signInWithPassword({email,password}));
  if(error)throw error;
  if(await start(data.user))go(prof.gustos?.length?'feed':'onb');
})}
function recoverPassword(){return once('rec','Enviando enlace…',async()=>{
  const email=$('#recoverEmail').value.trim();if(!email)return toast('Escribe tu correo');
  const {error}=await withTimeout(sb.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname}));
  if(error)throw error;
  toast('Si ese correo tiene cuenta, recibirás un enlace. Revisa también el spam.');
})}
function updatePassword(){return once('upw','Guardando contraseña…',async()=>{
  const a=$('#newPassword').value,b=$('#newPasswordConfirm').value;
  if(a.length<MINPASS)return toast(`La contraseña debe tener mínimo ${MINPASS} caracteres`);
  if(a!==b)return toast('Las contraseñas no coinciden');
  const {data,error}=await withTimeout(sb.auth.updateUser({password:a}));
  if(error)throw error;
  if(data.user&&await start(data.user)){go('feed');toast('Contraseña actualizada')}
})}
sb.auth.onAuthStateChange((ev,session)=>{if(ev==='PASSWORD_RECOVERY'){me=session?.user||me;go('reset')}});
async function start(u){
  me=u;
  const g=await sb.from('profiles').select('*').eq('id',u.id).maybeSingle();
  if(g.error){me=null;toast(msg(g.error));return false}
  let p=g.data;
  if(!p){
    const m=u.user_metadata||{};
    const r=await sb.from('profiles').insert({id:u.id,username:m.username||u.email.split('@')[0],nombre:m.nombre||'',gustos:[]}).select().single();
    if(err(r)){me=null;return false}
    p=r.data;
    await sb.from('circulos').insert(['Familia','Escuela','Compas','Trabajo'].map(nombre=>({user_id:u.id,nombre,miembros:0})));
  }
  if(isBanned(p)){prof=p;try{banScreen(p)}catch(e){console.error(e)}go('ban');return false} /* se conserva la sesión para poder apelar; las políticas del servidor le impiden publicar */
  prof=p;picks=Array.isArray(p.gustos)?p.gustos:[];
  try{pins=JSON.parse(localStorage['pins'+u.id]||'[]').map(String)}catch{pins=[]}
  CFG=null;await loadCirc();subRT();loadCfg().then(applyCfg);
  setTimeout(openFromHash,300);
  return true;
}
async function logout(){await sb.auth.signOut();sb.removeAllChannels();rtChan=null;me=prof=cur=null;POSTS=[];CFG=null;go('home')}

/* ---------- NAVEGACIÓN ---------- */
function go(n){
  if(!me&&!PUBLIC.includes(n))n='home';
  if(n==='admin'&&!isAdmin()){toast('No tienes permiso');n='feed'}
  const old=$('.s.on');if(old)SCR[old.id]=old.scrollTop;
  $$('video').forEach(v=>v.pause());
  $$('.s').forEach(e=>e.classList.toggle('on',e.id==='s-'+n));
  $('#nav').style.display=NAVS.includes(n)?'flex':'none';
  $$('#nav [data-g]').forEach(b=>{const on=b.dataset.g===n;b.classList.toggle('act',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});
  const R={feed:()=>feed({reuse:screen!=='feed'&&screen!=='home'}),search:trend,inbox:chats,create:cpick,circ:circList,onb:bubbles,profile:perfil,admin:adminList,edit:editInit};
  const prev=screen;screen=n;
  if(n.startsWith('settings-'))renderSettings(n);else R[n]?.();
  if(prev!==n&&SCR['s-'+n])requestAnimationFrame(()=>{const el=$('#s-'+n);if(el)el.scrollTop=SCR['s-'+n]});
}
addEventListener('hashchange',()=>{if(me)openFromHash()});
async function openFromHash(){
  const h=location.hash;let m;
  if(m=h.match(/^#post-([\w-]+)$/)){
    const r=await sb.from('posts').select('*').eq('id',m[1]).maybeSingle();
    if(!r.data)return toast('No encontramos esa publicación o no tienes acceso');
    await hydrate([r.data]);EXTRA=[r.data];
    $('#sheetc').innerHTML=`<div class="p-3" style="max-height:85dvh;overflow-y:auto">${postHTML(r.data)}<button class="btn2 mt-3" onclick="$('#sheet').classList.add('hidden')">Cerrar</button></div>`;$('#sheet').classList.remove('hidden');
  }else if(m=h.match(/^#u-([a-z0-9_.]{3,20})$/)){
    const r=await sb.from('profiles').select('id').eq('username',m[1]).maybeSingle();
    r.data?verUser(r.data.id):toast('No encontramos ese perfil');
  }
}

/* ---------- GUSTOS ---------- */
function bubbles(){$('#more').textContent=more?'Ver menos −':'Ver más gustos +';$('#bubbles').innerHTML=(more?CATS:CATS.slice(0,8)).map(c=>`<button class="chip ${picks.includes(c)?'on':''}" aria-pressed="${picks.includes(c)}" style="padding:12px 20px;font-size:17px" onclick="pick('${c}')">${c}</button>`).join('')}
function toggleMore(){more=!more;bubbles()}
function pick(c){picks=picks.includes(c)?picks.filter(x=>x!==c):[...picks,c];bubbles()}
async function saveGustos(){
  if(!picks.length)return toast('Elige al menos un gusto');
  const r=await sb.from('profiles').update({gustos:picks}).eq('id',me.id);if(err(r))return;
  prof.gustos=picks;go('feed');
}

/* ---------- FEED (scroll natural, un video activo) ---------- */
function chips(){$('#chips').innerHTML=['Todos','Comedia','Música','Factos','Cocina','Deportes'].map(c=>`<button class="chip ${c===cat&&!xit?'on':''}" aria-pressed="${c===cat&&!xit}" onclick="setCat('${c}')">${c}</button>`).join('')}
function setCat(c){cat=c;xit=false;feed()}
function goCat(c){cat=c||'Todos';xit=false;go('feed')}
function xitMode(){xit=!xit;feed()}
async function hydrate(l){
  const ids=l.map(p=>p.id),uids=[...new Set(l.map(p=>p.user_id))];
  const [a,b]=await Promise.all([ids.length?sb.from('xits').select('post_id,user_id').in('post_id',ids):{data:[]},uids.length?sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,es_creador,baneado,ban_hasta,verificado_identidad,verificado_premium').in('id',uids):{data:[]}]);
  const pm=Object.fromEntries((b.data||[]).map(x=>[x.id,x]));
  l.forEach(p=>{const xs=(a.data||[]).filter(x=>x.post_id===p.id);p.xc=xs.length;p.mine=xs.some(x=>x.user_id===me.id);p.pr=pm[p.user_id]||{}});
}
async function loadPosts(reset){
  if(reset){POSTS=[];feedCursor=null;feedEnd=false}
  let q=sb.from('posts').select('*').or(`circulo.is.null,circulo.eq.Público,user_id.eq.${me.id}`).order('creado_en',{ascending:false}).limit(xit?60:PAGE);
  if(cat!=='Todos'&&!xit)q=q.eq('categoria',cat);
  if(feedCursor&&!xit)q=q.lt('creado_en',feedCursor);
  const r=await withTimeout(q);if(r.error)throw r.error;
  if(r.data.length<PAGE||xit)feedEnd=true;
  if(r.data.length)feedCursor=r.data[r.data.length-1].creado_en;
  await hydrate(r.data);
  POSTS=POSTS.concat(r.data.filter(p=>!isBanned(p.pr)));
}
async function feed(o={}){
  chips();$('#xban').classList.toggle('hidden',!xit);
  const box=$('#feed'),fresh=!(o.reuse&&POSTS.length&&Date.now()-feedAt<12e4);
  if(fresh){
    stories();
    box.innerHTML='<div class="skeleton" aria-hidden="true"></div><div class="skeleton" aria-hidden="true"></div>';
    try{await loadPosts(true);feedAt=Date.now()}catch(e){console.error(e);box.innerHTML='<div class="empty-state"><b>No pudimos cargar el feed</b><button class="pill" onclick="feed()">Reintentar</button></div>';return}
  }
  drawFeed();
  if(!fresh)requestAnimationFrame(()=>{const s=$('#s-feed');if(s&&SCR['s-feed'])s.scrollTop=SCR['s-feed']});
  const h=location.hash.match(/^#post-([\w-]+)$/);if(h)$('#post-'+h[1])?.scrollIntoView();
}
function visibleList(){
  let l=[...POSTS];
  if(xit)return l.sort((a,b)=>b.xc-a.xc).slice(0,8);
  if(cat==='Todos'&&picks.length)l.sort((a,b)=>picks.includes(b.categoria)-picks.includes(a.categoria));
  return l;
}
function drawFeed(){
  const l=visibleList(),box=$('#feed');
  const note=xit?'Los 8 Xits con más reacciones entre los más recientes.':'Orden: lo más reciente; tus gustos suben primero. Son reglas simples, sin IA.';
  const foot=!l.length?'':(feedEnd||xit?'<p class="text-center text-sm p-6" style="color:var(--mut)">Estás al día</p>':'<div class="text-center p-4"><button class="pill" onclick="moreFeed()">Cargar más</button></div>');
  box.innerHTML=`<p class="text-xs px-1" style="color:var(--mut)">${note}</p>`+(l.map(postHTML).join('')||'<div class="empty-state"><b>Aún no hay Xits aquí</b>Sé el primero en subir uno con el + de abajo</div>')+foot;
  watchVideos();
}
async function moreFeed(){try{await loadPosts(false);drawFeed()}catch(e){toast(msg(e))}}
function postHTML(p){
  const u=p.pr||{},vu=U(p.video_url),fu=U(p.foto_url);
  const m=vu?`<video src="${E(vu)}" controls loop muted playsinline preload="metadata" aria-label="Video de @${E(u.username||'usuario')}"></video>`:fu?`<img src="${E(fu)}" alt="${E(p.titulo||'Imagen')}" loading="lazy">`:'';
  const id=E(p.id);
  return `<article class="post" id="post-${id}"><header class="post-h"><button class="who" onclick="verUser('${E(p.user_id)}')">${av(u,36)}<span><b>@${E(u.username||'usuario')}</b> ${vbadge(u)}</span></button><span class="tag">${E(p.circulo&&p.circulo!=='Público'?'Solo '+p.circulo:(p.categoria||''))}</span></header>${m?`<div class="post-media">${m}</div>`:''}<p class="post-t">${E(p.titulo)}</p><footer class="post-a"><button class="act ${p.mine?'liked':''}" aria-pressed="${!!p.mine}" aria-label="Xit" onclick="doXit('${id}',this)">${svg('plus','act-icon')}<span>${fmt(p.xc)}</span></button><button class="act" aria-label="Compartir" onclick="sharePost('${id}')">${svg('share','act-icon')}<span>Compartir</span></button></footer></article>`;
}
function watchVideos(){
  IO?.disconnect();IO=null;
  if(CFG&&CFG.autoplay===false)return;
  IO=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting&&e.intersectionRatio>=.6){$$('#feed video').forEach(x=>{if(x!==v)x.pause()});v.play().catch(()=>{})}else v.pause()}),{threshold:[0,.6]});
  $$('#feed video').forEach(v=>IO.observe(v));
}
async function doXit(id,b){
  const p=[...POSTS,...EXTRA].find(x=>String(x.id)===String(id));if(!p||LOCK.has('x'+id))return;LOCK.add('x'+id);
  try{
    if(p.mine){const r=await sb.from('xits').delete().eq('post_id',p.id).eq('user_id',me.id);if(err(r))return;p.mine=false;p.xc--}
    else{const r=await sb.from('xits').insert({post_id:p.id,user_id:me.id});if(err(r))return;p.mine=true;p.xc++}
    b.classList.toggle('liked',p.mine);b.setAttribute('aria-pressed',String(p.mine));b.querySelector('span').textContent=fmt(p.xc);
  }finally{LOCK.delete('x'+id)}
}
function sharePost(id){shareLink(location.origin+location.pathname+'#post-'+id,'Mira esto en Gelxit')}
function shareP(){shareLink(location.origin+location.pathname+'#u-'+prof.username,'Mi perfil en Gelxit')}

/* ---------- BUSCAR ---------- */
async function trend(){
  const inp=$('#s-search input');
  if(inp&&!inp.dataset.on){inp.dataset.on=1;inp.setAttribute('aria-label','Buscar');inp.oninput=()=>{clearTimeout(inp._t);inp._t=setTimeout(()=>search(inp.value),300)}}
  if(inp&&inp.value.trim())return search(inp.value);
  if(!POSTS.length){try{await loadPosts(true);feedAt=Date.now()}catch{}}
  $('#trend').innerHTML=[...POSTS].sort((a,b)=>b.xc-a.xc).slice(0,10).map(p=>`<button class="card p-3 flex items-center gap-3 text-left" data-c="${E(p.categoria)}" onclick="goCat(this.dataset.c)"><div class="flex-1"><b>@${E(p.pr.username||'usuario')}</b><div class="text-sm" style="color:var(--mut)">${E(p.titulo)}</div></div><span class="text-sm font-bold" style="color:var(--p)">${fmt(p.xc)} Xits</span></button>`).join('')||'<p class="text-sm" style="color:var(--mut)">Aún no hay Xits pegando.</p>';
}
async function search(raw){
  const q=raw.trim().replace(/^@/,'').replace(/[%_,()\\]/g,'');
  if(!q)return trend();
  const [a,b]=await Promise.all([sb.from('posts').select('id,titulo,categoria,user_id').ilike('titulo','%'+q+'%').limit(10),sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,es_creador,baneado,ban_hasta,verificado_identidad,verificado_premium').ilike('username','%'+q+'%').limit(10)]);
  const ppl=(b.data||[]).filter(u=>!isBanned(u)).map(u=>`<button class="card p-3 flex items-center gap-3 text-left" onclick="verUser('${E(u.id)}')">${av(u,40)}<div><b>@${E(u.username)}</b> ${vbadge(u)}<div class="text-sm" style="color:var(--mut)">${E(u.nombre||'')}</div></div></button>`);
  const pst=(a.data||[]).map(p=>`<button class="card p-3 text-left" onclick="location.hash='#post-${E(p.id)}'">${E(p.titulo)}<div class="text-sm" style="color:var(--mut)">${E(p.categoria||'')}</div></button>`);
  $('#trend').innerHTML=[...ppl,...pst].join('')||'<p class="text-sm" style="color:var(--mut)">Sin resultados.</p>';
}

/* ---------- CREAR ---------- */
function setPC(c){pcat=c;cpick()}
function cpick(){
  $('#circPick').innerHTML=['Público',...CIRC.map(c=>c.nombre)].map(c=>`<button class="chip ${c===pc?'on':''}" aria-pressed="${c===pc}" data-c="${E(c)}" onclick="pc=this.dataset.c;cpick()">${c==='Público'?svg('globe'):''}${E(c)}</button>`).join('');
  if(!$('#catPick').children.length)$('#catPick').innerHTML=CATS.map(c=>`<button class="chip" data-c="${c}" onclick="setPC('${c}')">${c}</button>`).join('');
  $$('#catPick .chip').forEach(b=>{const on=b.dataset.c===pcat;b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))});
}
function prevVid(i){$('#vn').textContent=i.files[0]?.name||'Sube o graba tu Xit'}
function publicar(){return once('pub','Subiendo tu Xit…',async()=>{
  const f=$('#vf').files[0];if(!f)return toast('Elige un video primero');
  if(!f.type.startsWith('video/'))return toast('Ese archivo no es un video');
  if(f.size>50*1048576)return toast('El video pesa más de 50 MB');
  const t=$('#cap').value.trim()||'Mi nuevo Xit',path=`${me.id}/${Date.now()}.${ext(f)}`;
  const url=await upl('posts',path,f);
  const r=await sb.from('posts').insert({user_id:me.id,titulo:t.slice(0,80),descripcion:t,video_url:url,categoria:pcat,circulo:pc});
  if(r.error){await sb.storage.from('posts').remove([path]);throw r.error}
  $('#cap').value='';$('#vf').value='';$('#vn').textContent='Sube o graba tu Xit';cat='Todos';feedAt=0;
  toast(pc==='Público'?'Publicado':'Publicado. Solo lo ves tú ('+pc+')');go('feed');
})}

/* ---------- CÍRCULOS (hoy: audiencias privadas) ---------- */
async function loadCirc(){const r=await sb.from('circulos').select('*').eq('user_id',me.id).order('creado_en');CIRC=r.data||[]}
function circList(){$('#circList').innerHTML=CIRC.map(c=>`<div class="card p-4 flex items-center gap-3"><div class="flex-1"><b>${E(c.nombre)}</b><div class="text-sm" style="color:var(--mut)">Audiencia privada · solo tú</div></div><button class="pill" data-c="${E(c.nombre)}" onclick="pc=this.dataset.c;go('create')">Subir aquí</button></div>`).join('')}
async function newCirc(){
  const v=await ask('Nuevo círculo',[{id:'n',label:'Nombre',ph:'Ej. Proyecto de cocina'}],'Crear');
  const n=(v?.n||'').trim().slice(0,40);if(!n)return;
  const r=await sb.from('circulos').insert({user_id:me.id,nombre:n,miembros:0});if(err(r))return;
  await loadCirc();circList();
}

/* ---------- CHAT (Realtime, sin sondeo) ---------- */
async function chats(){
  const m=await sb.from('chat_members').select('chat_id').eq('user_id',me.id);if(err(m))return;
  const ids=(m.data||[]).map(x=>x.chat_id);
  if(!ids.length){CH=[];$('#chatlist').innerHTML='<p class="p-8 text-center" style="color:var(--mut)">Aún no tienes chats. Toca “+ Nuevo”.</p>';return}
  const [c,mm,ms]=await Promise.all([sb.from('chats').select('*').in('id',ids),sb.from('chat_members').select('chat_id,user_id').in('chat_id',ids),sb.from('messages').select('chat_id,texto,foto_url,video_url,audio_url,creado_en').in('chat_id',ids).order('creado_en',{ascending:false}).limit(200)]);
  const uids=[...new Set((mm.data||[]).map(x=>x.user_id))];
  const pr=await sb.from('profiles').select('id,nombre,username,avatar_url,foto_url,es_creador,verificado_identidad,verificado_premium').in('id',uids);
  const P=Object.fromEntries((pr.data||[]).map(x=>[x.id,x]));
  CH=(c.data||[]).map(x=>{
    const o=(mm.data||[]).filter(y=>y.chat_id===x.id&&y.user_id!==me.id).map(y=>P[y.user_id]).filter(Boolean),last=(ms.data||[]).find(y=>y.chat_id===x.id);
    const l=!last?'Sin mensajes':last.texto||(last.foto_url?'Foto':last.video_url?'Video':last.audio_url?'Audio':'Archivo');
    return {...x,n:x.es_grupo?(x.nombre_grupo||'Grupo'):(o[0]?.nombre||o[0]?.username||'Chat'),a:x.es_grupo?null:o[0],l,ts:last?.creado_en||x.creado_en||''};
  }).sort((a,b)=>a.ts<b.ts?1:-1);
  $('#chatlist').innerHTML=CH.map((c,i)=>`<button class="flex items-center gap-3 w-full px-4 py-3 text-left" onclick="openChat(${i})">${c.a?av(c.a,48):`<span class="w-12 h-12 rounded-full flex items-center justify-center flex-none" style="background:var(--card)">${svg('user')}</span>`}<div class="flex-1 min-w-0"><b>${E(c.n)}</b> ${c.a?vbadge(c.a):''}${c.es_grupo?' <span class="text-xs" style="color:var(--p)">Grupo</span>':''}<div class="text-sm truncate" style="color:var(--mut)">${E(c.l)}</div></div></button>`).join('');
}
async function openChat(i){
  cur=CH[i];MS=[];chatEnd=false;
  $('#chh').innerHTML=E(cur.n)+' '+(cur.a?vbadge(cur.a):'');
  $('#blk').classList.add('hidden');$('#inp').style.display='flex';$('#msgs').innerHTML='';go('chat');
  loadMsgs(true);
  if(cur.a){const b=await sb.from('blocked_users').select('blocked_id').eq('blocker_id',me.id).eq('blocked_id',cur.a.id).maybeSingle();if(b.data){$('#blk').classList.remove('hidden');$('#inp').style.display='none'}}
}
async function loadMsgs(first){
  if(!cur)return;const id=cur.id;
  let q=sb.from('messages').select('*').eq('chat_id',id).order('creado_en',{ascending:false}).limit(40);
  if(!first&&MS.length)q=q.lt('creado_en',MS[0].creado_en);
  const r=await q;if(r.error)return err(r);if(cur?.id!==id)return;
  if(r.data.length<40)chatEnd=true;
  const rows=r.data.reverse();MS=first?rows:[...rows,...MS];
  drawMsgs(first?'bottom':'keep');markRead();
}
async function syncTail(){
  if(!cur)return;const id=cur.id;
  const r=await sb.from('messages').select('*').eq('chat_id',id).order('creado_en',{ascending:false}).limit(40);
  if(r.error||cur?.id!==id)return;let ch=false;
  r.data.reverse().forEach(m=>{const i=MS.findIndex(x=>x.id===m.id);if(i<0){MS.push(m);ch=true}else if(MS[i].leido!==m.leido){MS[i]=m;ch=true}});
  if(ch){MS.sort((a,b)=>a.creado_en<b.creado_en?-1:1);drawMsgs('stay');markRead()}
}
function bubble(m){
  const mine=m.user_id===me.id;
  const body=m.foto_url?`<img src="${E(U(m.foto_url))}" alt="Imagen enviada" loading="lazy" class="rounded-xl max-w-full">`:m.video_url?`<video src="${E(U(m.video_url))}" controls playsinline preload="metadata" class="rounded-xl max-w-full"></video>`:m.audio_url?`<audio src="${E(U(m.audio_url))}" controls class="max-w-full" style="height:36px"></audio>`:E(m.texto);
  const st=!mine?'':m.fail?`<button class="retry" onclick="retry('${E(m.tmp)}')">No se envió. Reintentar</button>`:m.tmp?'Enviando…':m.leido?'Leído':'Enviado';
  return `<div class="bub ${mine?'me':'ot'}">${body}${st?`<div class="bst">${st}</div>`:''}</div>`;
}
function drawMsgs(mode='stay'){
  const e=$('#msgs'),near=e.scrollHeight-e.scrollTop-e.clientHeight<80,pH=e.scrollHeight,pT=e.scrollTop;
  e.innerHTML=(chatEnd?'':'<button class="pill self-center" onclick="loadMsgs()">Cargar mensajes anteriores</button>')+MS.map(bubble).join('');
  if(mode==='bottom'||(mode==='stay'&&near))e.scrollTop=e.scrollHeight;
  else if(mode==='keep')e.scrollTop=pT+(e.scrollHeight-pH);
  else e.scrollTop=pT;
}
function markRead(){const un=MS.filter(m=>m.user_id!==me.id&&!m.leido&&!m.tmp).map(m=>m.id);if(un.length)sb.from('messages').update({leido:true}).in('id',un).then(()=>{})}
function push(o){
  const tmp='t'+Date.now()+Math.random().toString(36).slice(2,6);
  const row={id:tmp,tmp,chat_id:cur.id,user_id:me.id,creado_en:new Date().toISOString(),...o};
  MS.push(row);drawMsgs('bottom');transmit(row);
}
async function transmit(row){
  const {tmp,id,fail,creado_en,...payload}=row;row.fail=false;
  try{
    const r=await withTimeout(sb.from('messages').insert(payload).select().single(),15000);if(r.error)throw r.error;
    const i=MS.findIndex(m=>m.tmp===tmp),real=MS.findIndex(m=>m.id===r.data.id);
    if(real>=0&&i>=0)MS.splice(i,1);else if(i>=0)MS[i]=r.data;
  }catch(e){row.fail=true}
  if(cur&&row.chat_id===cur.id)drawMsgs('stay');
}
function retry(tmp){const r=MS.find(m=>m.tmp===tmp);if(r){r.fail=false;drawMsgs('stay');transmit(r)}}
function send(){const i=$('#mi'),t=i.value.trim();if(!t||!cur)return;i.value='';push({texto:t})}
function pickF(a,k){fileKind=k;const f=$('#cf');f.accept=a;f.click()}
async function sendFile(i){
  const f=i.files[0];i.value='';if(!f||!cur)return;
  if(f.size>25*1048576)return toast('El archivo pesa más de 25 MB');
  const chatId=cur.id;
  await once('file','Enviando archivo…',async()=>{const url=await upl('posts',`${me.id}/chat-${chatId}-${Date.now()}.${ext(f)}`,f);if(cur?.id===chatId)push({[fileKind+'_url']:url})});
}
function setMicState(on){const e=$('#mic');if(e){e.innerHTML=on?svg('close'):svg('mic');e.setAttribute('aria-label',on?'Detener y enviar audio':'Grabar audio')}}
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
      if(!ch.length)return toast('No se grabó nada');
      const chatId=cur?.id;if(!chatId)return;
      await once('aud','Enviando audio…',async()=>{const url=await upl('audios',`${me.id}/voz-${Date.now()}.${t.includes('mp4')?'m4a':'webm'}`,new Blob(ch,{type:t}));if(cur?.id===chatId)push({audio_url:url})});
    };
    recd.start();setMicState(true);toast('Grabando… toca de nuevo para enviar');
  }catch{recd=null;toast('Permite el micrófono para grabar')}
}
async function bloq(){
  if(!cur||!cur.a)return toast('Solo puedes bloquear en chats de dos personas');
  const v=await ask('¿Bloquear a @'+cur.a.username+'?',[{note:'Guardamos tu bloqueo. Puedes deshacerlo en Configuración > Privacidad.'}],'Bloquear');if(!v)return;
  const r=await sb.from('blocked_users').insert({blocker_id:me.id,blocked_id:cur.a.id});if(err(r))return;
  $('#blk').classList.remove('hidden');$('#inp').style.display='none';toast('Usuario bloqueado');
}
async function reportar(){
  if(!cur)return;
  const v=await ask('Reportar esta conversación',[{id:'m',label:'¿Qué pasó?',ph:'Cuéntalo en pocas palabras'}],'Enviar reporte');
  if(!v||!v.m.trim())return;
  const r=await sb.from('reports').insert({reporter_id:me.id,chat_id:cur.id,target_user_id:cur.a?.id||null,motivo:v.m.trim().slice(0,500)});
  if(err(r))return;toast('Reporte enviado. Lo revisará el equipo.');
}
async function newChat(){
  const v=await ask('Nuevo chat',[{id:'t',label:'Usuario (varios separados por coma para un grupo)',ph:'@usuario'}],'Continuar');if(!v)return;
  const us=v.t.split(',').map(x=>x.trim().replace(/^@/,'').toLowerCase()).filter(Boolean);if(!us.length)return;
  const pr=await sb.from('profiles').select('id,username').in('username',us);if(err(pr))return;
  const others=pr.data.filter(x=>x.id!==me.id);if(!others.length)return toast('No encontré ese usuario');
  const g=others.length>1;let nombre=null;
  if(g){const n=await ask('Nombre del grupo',[{id:'n',label:'Nombre'}],'Crear');if(!n)return;nombre=n.n.trim().slice(0,40)||'Grupo'}
  const c=await sb.from('chats').insert({es_grupo:g,nombre_grupo:nombre}).select().single();if(err(c))return;
  const m=await sb.from('chat_members').insert([me.id,...others.map(x=>x.id)].map(user_id=>({chat_id:c.data.id,user_id})));if(err(m))return;
  await chats();openChat(CH.findIndex(x=>x.id===c.data.id));
}
function subRT(){
  if(rtChan)sb.removeChannel(rtChan);
  rtChan=sb.channel('gx-messages').on('postgres_changes',{event:'*',schema:'public',table:'messages'},p=>{
    const m=p.new;if(!m||!m.id)return;
    if(cur&&m.chat_id===cur.id&&$('#s-chat').classList.contains('on')){
      const i=MS.findIndex(x=>x.id===m.id);
      if(i>=0)MS[i]=m;else if(p.eventType==='INSERT')MS.push(m);
      drawMsgs('stay');if(m.user_id!==me.id)markRead();
    }else if($('#s-inbox').classList.contains('on'))chats();
  }).subscribe();
}
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&me)syncTail()});
addEventListener('online',()=>{if(me)syncTail()});

/* ---------- HISTORIAS ---------- */
async function stories(){
  const a=await sb.from('historias').select('*').gt('creado_en',dayAgo()).order('creado_en');
  const hs=a.data||[],ids=[...new Set([...hs.map(x=>x.user_id),me.id])];
  const [pr,vs]=await Promise.all([sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,baneado,ban_hasta,es_creador,verificado_identidad,verificado_premium').in('id',ids),sb.from('historia_vistas').select('historia_id').eq('user_id',me.id)]);
  LP=Object.fromEntries((pr.data||[]).map(x=>[x.id,x]));
  const seen=new Set((vs.data||[]).map(x=>x.historia_id)),g={};
  hs.forEach(h=>{if(isBanned(LP[h.user_id]))return;(g[h.user_id]=g[h.user_id]||[]).push(h)});ST=g;
  const mine=g[me.id],B='class="flex flex-col items-center gap-1 flex-none"';
  let h=`<button ${B} onclick="${mine?`openStory('${me.id}')`:'subirHist()'}" aria-label="Tu historia"><div class="p-0.5 rounded-full" style="border:2.5px solid ${mine?'var(--p)':'var(--bd)'}">${av(prof,52)}</div><span class="text-[11px]">Tu historia</span></button><button ${B} onclick="subirHist()" aria-label="Subir historia"><div class="rounded-full flex items-center justify-center" style="width:58px;height:58px;border:1.5px dashed var(--bd)">${svg('plus')}</div><span class="text-[11px]">Subir</span></button>`;
  Object.keys(g).filter(u=>u!==me.id).forEach(u=>{const p=LP[u];if(!p)return;const nu=g[u].some(x=>!seen.has(x.id));h+=`<button ${B} onclick="openStory('${u}')" aria-label="Historia de ${E(p.username)}"><div class="p-0.5 rounded-full" style="border:2.5px solid ${nu?'var(--p)':'var(--bd)'}">${av(p,52)}</div><span class="text-[11px] truncate" style="max-width:60px">${E(p.username)}</span></button>`});
  $('#stories').innerHTML=h;
  sb.from('historias').delete().eq('user_id',me.id).lte('creado_en',dayAgo()).then(()=>{});
}
function subirHist(){$('#sf').click()}
async function upHist(i){
  const f=i.files[0];i.value='';if(!f)return;
  if(f.size>50*1048576)return toast('El archivo pesa más de 50 MB');
  await once('hist','Subiendo historia…',async()=>{
    const url=await upl('historias',`${me.id}/${Date.now()}.${ext(f)}`,f);
    const r=await sb.from('historias').insert({user_id:me.id,media_url:url,tipo:f.type.startsWith('video')?'video':'foto'});if(r.error)throw r.error;
    toast('Historia publicada');stories();
  });
}
function openStory(u){SV={l:ST[u]||[],i:0,t:null};showS()}
function showS(){
  clearTimeout(SV.t);const h=SV.l[SV.i];if(!h)return closeS();
  const p=LP[h.user_id]||prof,mine=h.user_id===me.id,vid=h.tipo==='video',mu=E(U(h.media_url));
  $('#sv').style.display='flex';
  $('#svm').innerHTML=vid?`<video src="${mu}" autoplay playsinline class="w-full h-full object-contain" onended="nextS()"></video>`:`<img src="${mu}" alt="Historia de @${E(p.username)}" class="w-full h-full object-contain">`;
  $('#svh').innerHTML=`${av(p,36)}<b>@${E(p.username)}</b> ${vbadge(p)}<span class="text-xs opacity-70 ml-auto">${SV.i+1}/${SV.l.length}</span>`;
  $('#svb').innerHTML=mine?`<button class="pill" onclick="verVistas('${h.id}')">${svg('user')} Quién la vio</button><button class="pill" aria-label="Borrar historia" onclick="borrarHist('${h.id}')">Borrar</button>`:`<input id="svr" aria-label="Responder" placeholder="Responder…" onfocus="clearTimeout(SV.t)" onkeydown="if(event.key==='Enter')respH()"><button class="pill" aria-label="Enviar respuesta" onclick="respH()">${svg('send')}</button>`;
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
  $('#sheetc').innerHTML=`<div class="p-5"><b>${fmt(p.length)} vieron tu historia</b><div class="mt-3 flex flex-col gap-2" style="max-height:18rem;overflow-y:auto">${p.map(u=>`<div class="flex items-center gap-3">${av(u,36)}<span>@${E(u.username)}</span></div>`).join('')||'<span class="text-sm" style="color:var(--mut)">Aún nadie</span>'}</div><button class="btn2 mt-4" onclick="$('#sheet').classList.add('hidden');showS()">Cerrar</button></div>`;
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
  const t=$('#svr').value.trim();if(!t||LOCK.has('resp'))return;LOCK.add('resp');
  try{const c=await dm(SV.l[SV.i].user_id);if(!c)return;
    const r=await sb.from('messages').insert({chat_id:c,user_id:me.id,texto:'Respuesta a tu historia: '+t});if(err(r))return;
    $('#svr').value='';toast('Respuesta enviada')}finally{LOCK.delete('resp')}
}

/* ---------- PERFIL ---------- */
async function verUser(id){
  const [a,b,f]=await Promise.all([sb.from('profiles').select('*').eq('id',id).maybeSingle(),sb.from('posts').select('id',{count:'exact',head:true}).eq('user_id',id),sb.from('follows').select('id').eq('seguidor_id',me.id).eq('seguido_id',id).maybeSingle()]);
  const u=a.data;if(!u)return toast('No se pudo cargar el perfil');
  $('#sheetc').innerHTML=`<div style="height:90px;background:${bannerBg(u.banner_url)}"></div><div class="flex flex-col items-center text-center px-6 pb-6" style="margin-top:-36px"><div style="border:4px solid var(--bg);border-radius:999px">${av(u,72)}</div><h3 class="mt-2 text-lg font-extrabold">${E(u.nombre||u.username)} ${vbadge(u)}</h3><div class="text-sm" style="color:var(--mut)">@${E(u.username)}${isOwner(u)?' · Creador de Gelxit':''}</div><p class="mt-2 text-sm">${E(u.bio||'')}</p><div class="flex gap-6 mt-3 text-sm"><span><b>${fmt(u.seguidores_count||0)}</b> seguidores</span><span><b>${fmt(b.count||0)}</b> Xits</span></div><div class="flex gap-2 mt-4 w-full">${u.id===me.id?'':`<button class="btn" id="fb" style="padding:10px" onclick="seguir('${E(id)}')">${f.data?'Siguiendo':'Seguir'}</button>`}<button class="btn2" style="padding:10px" onclick="$('#sheet').classList.add('hidden')">Cerrar</button></div></div>`;
  $('#sheet').classList.remove('hidden');
}
async function seguir(id){
  const b=$('#fb');if(!b||LOCK.has('fol'))return;LOCK.add('fol');
  try{const on=b.textContent==='Siguiendo';
    const r=on?await sb.from('follows').delete().eq('seguidor_id',me.id).eq('seguido_id',id):await sb.from('follows').insert({seguidor_id:me.id,seguido_id:id});
    if(err(r))return;b.textContent=on?'Seguir':'Siguiendo'}finally{LOCK.delete('fol')}
}
function setAv(){const a=$('#av'),u=cssUrl(prof.avatar_url||prof.foto_url);a.style.background=u?`url("${u}") center/cover`:'var(--p)';$('#avi').textContent=u?'':(prof.nombre||prof.username||'?')[0].toUpperCase()}
async function perfil(){
  const p=prof;
  $('#bn').style.background=bannerBg(p.banner_url);
  $('#pn').textContent=p.nombre||p.username;
  $('#pu').textContent='@'+p.username+(isOwner(p)?' · Creador de Gelxit':'');
  $('#pb').textContent=p.bio||'Cuéntale al mundo quién eres';
  $('#ps').textContent=fmt(p.seguidores_count||0);$('#pg').textContent=fmt(p.siguiendo_count||0);
  $('#vb').innerHTML=vbadge(p);
  $('#b1').innerHTML=badge('#2563EB','Verificación azul');$('#b2').innerHTML=badge('#7C3AED','Premium');
  const d=$('#v1')?.previousElementSibling?.lastElementChild;if(d)d.textContent='Estamos preparando un proceso seguro de verificación.';
  $('#v1').textContent=p.verificado_identidad?'Verificado':'Pronto';$('#v2').textContent=p.verificado_premium?'Activo':'Pronto';
  $('#v1').onclick=()=>toast('Aún no pedimos documentos. No los envíes por mensajes.');
  $('#adm').innerHTML=isAdmin()?`<button class="btn2 mt-3" style="border-color:var(--p)" onclick="go('admin')">${svg('crown','verified-icon')} Panel de Dueño</button>`:'';
  const hint=$('#s-profile p.text-xs');if(hint)hint.textContent='Fijados: se guardan solo en este dispositivo (máximo 3). Toca una publicación para gestionarla.';
  setAv();
  const r=await sb.from('posts').select('*').eq('user_id',me.id).order('creado_en',{ascending:false});
  MY=r.data||[];$('#pv').textContent=fmt(MY.length);
  let xc=0;if(MY.length){const x=await sb.from('xits').select('id',{count:'exact',head:true}).in('post_id',MY.map(v=>v.id));xc=x.count||0}
  $('#px').textContent=fmt(xc);grid();
}
function grid(){
  const l=[...MY].sort((a,b)=>pins.includes(String(b.id))-pins.includes(String(a.id)));
  $('#grid').innerHTML=l.map(p=>{const vu=U(p.video_url),fu=U(p.foto_url);return `<button class="gcell" onclick="postMenu('${E(p.id)}')" aria-label="${E(p.titulo||'Xit')}">${vu?`<video src="${E(vu)}#t=0.1" preload="metadata" muted playsinline></video>`:fu?`<img src="${E(fu)}" alt="" loading="lazy">`:`<span>${E(p.titulo||'')}</span>`}${pins.includes(String(p.id))?'<i class="pin">Fijado</i>':''}</button>`}).join('')||'<p class="col-span-3 text-center text-sm p-6" style="color:var(--mut)">Aún no has publicado nada.</p>';
}
function postMenu(id){
  const p=MY.find(x=>String(x.id)===String(id));if(!p)return;const pinned=pins.includes(String(id));
  $('#sheetc').innerHTML=`<div class="p-5 flex flex-col gap-2"><b class="text-lg truncate">${E(p.titulo||'Xit')}</b><button class="btn2" onclick="togglePin('${E(id)}')">${pinned?'Quitar de fijados':'Fijar arriba'}</button><button class="btn2" onclick="$('#sheet').classList.add('hidden');sharePost('${E(id)}')">Compartir enlace</button><button class="btn2" style="color:#ff6b6b" onclick="delPost('${E(id)}')">Eliminar</button><button class="btn2" onclick="$('#sheet').classList.add('hidden')">Cerrar</button></div>`;
  $('#sheet').classList.remove('hidden');
}
function togglePin(id){
  id=String(id);
  if(pins.includes(id))pins=pins.filter(x=>x!==id);else{if(pins.length>=3)return toast('Máximo 3 fijados');pins.push(id)}
  try{localStorage['pins'+me.id]=JSON.stringify(pins)}catch{}
  $('#sheet').classList.add('hidden');grid();
}
async function delPost(id){
  const v=await ask('¿Eliminar esta publicación?',[{note:'Se borra para todos y no se puede deshacer.'}],'Eliminar');if(!v)return;
  const r=await sb.from('posts').delete().eq('id',id).eq('user_id',me.id);if(err(r))return;
  pins=pins.filter(x=>x!==String(id));feedAt=0;toast('Publicación eliminada');perfil();
}
function prevImg(i,id){const f=i.files[0];if(!f)return;const e=$('#'+id);e.style.background=`url("${URL.createObjectURL(f)}") center/cover`;if(id==='av2')e.textContent=''}
async function upAvatar(i){
  const f=i.files[0];i.value='';if(!f)return;
  if(!f.type.startsWith('image/')||f.size>5*1048576)return toast('Elige una imagen de máximo 5 MB');
  await once('av','Subiendo foto…',async()=>{
    const url=await upl('avatars',`${me.id}/avatar-${Date.now()}.${ext(f)}`,f);
    const r=await sb.from('profiles').update({avatar_url:url,foto_url:url}).eq('id',me.id);if(r.error)throw r.error;
    prof.avatar_url=prof.foto_url=url;setAv();toast('Foto actualizada');
  });
}
function editInit(){
  $('#enm').value=prof.nombre||'';$('#eus').value=prof.username||'';$('#ebi').value=prof.bio||'';
  const a=cssUrl(prof.avatar_url||prof.foto_url);
  $('#bn2').style.background=bannerBg(prof.banner_url);
  $('#av2').style.background=a?`url("${a}") center/cover`:'var(--p)';
}
function saveEdit(){return once('edit','Guardando perfil…',async()=>{
  const nombre=$('#enm').value.trim().slice(0,50),username=$('#eus').value.trim().replace(/^@/,'').toLowerCase(),bio=$('#ebi').value.trim().slice(0,150);
  if(!/^[a-z0-9_.]{3,20}$/.test(username))return toast('Usuario: 3-20 letras, números, _ o .');
  if(username!==prof.username){const {data:ex}=await sb.from('profiles').select('id').eq('username',username).maybeSingle();if(ex)return toast('Ese usuario ya existe')}
  const d={nombre,username,bio},af=$('#eaf').files[0],bf=$('#ebf').files[0];
  for(const f of [af,bf])if(f&&(!f.type.startsWith('image/')||f.size>5*1048576))return toast('Las imágenes deben pesar máximo 5 MB');
  if(af){const u=await upl('avatars',`${me.id}/avatar-${Date.now()}.${ext(af)}`,af);d.avatar_url=d.foto_url=u}
  if(bf){d.banner_url=await upl('banners',`${me.id}/banner-${Date.now()}.${ext(bf)}`,bf)}
  const r=await sb.from('profiles').update(d).eq('id',me.id);if(r.error)throw r.error;
  Object.assign(prof,d);$('#eaf').value='';$('#ebf').value='';toast('Perfil actualizado');go('profile');
})}
function plusMenu(){$('#plus').classList.remove('hidden')}
function pm(a){$('#plus').classList.add('hidden');({xit:()=>{$('#cap').value='#xit ';go('create')},hist:subirHist,vid:()=>go('create')})[a]?.()}

/* ---------- PANEL DE DUEÑO (acciones por RPC; el servidor decide) ---------- */
async function adminList(){
  if(!isAdmin())return;
  const q=($('#aq').value||'').trim().replace(/^@/,'').toLowerCase().replace(/[%_,()\\]/g,'');
  let r=sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,es_creador,baneado,ban_hasta,ban_motivo,verificado_identidad,verificado_premium,creado_en').order('creado_en',{ascending:false}).limit(25);
  if(q)r=r.ilike('username','%'+q+'%');
  if(window.AF==='ban')r=r.eq('baneado',true);else if(window.AF==='ver')r=r.or('verificado_identidad.eq.true,verificado_premium.eq.true');else if(window.AF==='new')r=r.gt('creado_en',new Date(Date.now()-7*864e5).toISOString());
  const {data,error}=await r;if(error)return toast(msg(error));
  USERS=data;
  $('#alist').innerHTML=data.map(u=>`<div class="card p-3 flex flex-col gap-2"><div class="flex items-center gap-3">${av(u,44)}<div class="flex-1 min-w-0"><b>${E(u.nombre||u.username)}</b> ${vbadge(u)}<div class="text-sm" style="color:var(--mut)">@${E(u.username)}${isBanned(u)?' · Suspendido'+(u.ban_hasta?' hasta '+new Date(u.ban_hasta).toLocaleDateString('es-MX'):' permanente'):''}</div></div></div><div class="flex flex-wrap gap-2"><button class="pill" onclick="admVerify('${u.id}','identidad')">${u.verificado_identidad?'Quitar verificación':'Verificar'}</button><button class="pill" onclick="admVerify('${u.id}','premium')">${u.verificado_premium?'Quitar Premium':'Dar Premium'}</button>${isBanned(u)?`<button class="pill" onclick="admUnban('${u.id}')">Quitar suspensión</button>`:`<button class="pill" style="color:#ff6b6b" onclick="admBan('${u.id}')">Suspender</button>`}<button class="pill" onclick="verUser('${u.id}')">Ver perfil</button></div></div>`).join('')||'<p class="text-sm" style="color:var(--mut)">Sin resultados.</p>'+(data.length===25?'':'');
}
async function admVerify(id,kind){
  const u=USERS.find(x=>x.id===id);if(!u)return;
  const col=kind==='premium'?'verificado_premium':'verificado_identidad',val=!u[col];
  const v=await ask((val?'Conceder ':'Quitar ')+(kind==='premium'?'Premium':'verificación')+' a @'+u.username,[{id:'r',label:'Motivo (obligatorio)'}],'Confirmar');
  if(!v)return;if(!v.r.trim())return toast('El motivo es obligatorio');
  const r=await sb.rpc('admin_set_verification',{p_user:id,p_kind:kind,p_value:val,p_reason:v.r.trim()});
  if(err(r))return;toast('Hecho y registrado');adminList();
}
async function admBan(id){
  const u=USERS.find(x=>x.id===id);if(!u||id===me.id)return toast('No puedes suspenderte a ti');
  const v=await ask('Suspender a @'+u.username,[{id:'d',label:'Días (vacío = permanente)',ph:'Ej. 7',type:'number'},{id:'r',label:'Motivo (obligatorio)'}],'Suspender');
  if(!v)return;if(!v.r.trim())return toast('El motivo es obligatorio');
  const dias=v.d.trim()===''?null:parseInt(v.d,10);if(dias!==null&&!(dias>0))return toast('Pon un número de días válido');
  const r=await sb.rpc('admin_ban_user',{p_user:id,p_days:dias,p_reason:v.r.trim()});
  if(err(r))return;toast(dias?`Suspendido ${dias} día(s)`:'Suspendido de forma permanente');adminList();
}
async function admUnban(id){
  const u=USERS.find(x=>x.id===id);if(!u)return;
  const v=await ask('Quitar suspensión a @'+u.username,[{id:'r',label:'Motivo (obligatorio)'}],'Confirmar');
  if(!v)return;if(!v.r.trim())return toast('El motivo es obligatorio');
  const r=await sb.rpc('admin_unban_user',{p_user:id,p_reason:v.r.trim()});
  if(err(r))return;toast('Suspensión retirada');adminList();
}

/* ---------- AJUSTES (se pintan al abrir cada sección, sin sondeo) ---------- */
async function loadCfg(){if(CFG)return CFG;const r=await sb.from('user_settings').select('*').eq('user_id',me.id).maybeSingle();CFG=r.data||{};return CFG}
function applyCfg(){
  if(!CFG)return;
  if(CFG.tema==='dark'||CFG.tema==='light'){document.documentElement.dataset.theme=CFG.tema;try{localStorage.setItem('gx-theme',CFG.tema)}catch{}}
  if(/^#[0-9a-f]{6}$/i.test(CFG.color_acento||''))document.documentElement.style.setProperty('--p',CFG.color_acento);
}
async function saveCfg(patch){
  const r=await sb.from('user_settings').upsert({user_id:me.id,...patch,updated_at:new Date().toISOString()},{onConflict:'user_id'});
  if(err(r))return false;CFG={...CFG,...patch};applyCfg();toast('Guardado');return true;
}
const sw=(label,key,desc,def=false)=>`<label class="srow"><span><b>${label}</b><small>${desc}</small></span><input type="checkbox" role="switch" data-cfg="${key}" ${(CFG[key]??def)?'checked':''}></label>`;
const fld=(label,key,ph,type='text')=>`<label class="flex flex-col gap-1 text-sm mt-3">${label}<input type="${type}" data-in="${key}" placeholder="${ph}" autocomplete="off"></label>`;
const act=(label,a,danger)=>`<button class="btn2 mt-3" data-act="${a}" ${danger?'style="color:#ff6b6b"':''}>${label}</button>`;
const NOTE='<p class="text-xs mt-4" style="color:var(--mut)">Estas preferencias se guardan en tu cuenta. Su aplicación en el servidor se activa con la fase de seguridad.</p>';
async function renderSettings(n){
  const box=$('#s-'+n+' .settings-placeholder');if(!box)return;
  box.classList.remove('settings-placeholder');box.dataset.panel=n;
  await loadCfg();
  let h='';
  if(n==='settings-account'){
    const {data:{user}}=await sb.auth.getUser();
    h=`<div class="srow" style="display:block"><b>Sesión actual</b><small>Conectado como ${E(user?.email||me.email||'')}<br>Cuenta creada: ${user?.created_at?new Date(user.created_at).toLocaleDateString('es-MX'):'—'}</small></div>${fld('Cambiar correo','new-email','Nuevo correo','email')}${act('Cambiar mi correo','changeEmail')}${act('Cerrar sesión en este dispositivo','logout')}${act('Cerrar sesión en todos los dispositivos','logoutAll')}${act('Eliminar mi cuenta','deleteAccount',true)}`;
  }else if(n==='settings-privacy'){
    const [b,q]=await Promise.all([sb.from('blocked_users').select('blocked_id').eq('blocker_id',me.id),sb.from('follow_requests').select('id,from_id').eq('to_id',me.id).eq('status','pending')]);
    const ids=[...new Set([...(b.data||[]).map(x=>x.blocked_id),...(q.data||[]).map(x=>x.from_id)])];
    const P=ids.length?Object.fromEntries(((await sb.from('profiles').select('id,username,nombre').in('id',ids)).data||[]).map(x=>[x.id,x])):{};
    const bl=(b.data||[]).map(x=>`<div class="srow"><span><b>@${E(P[x.blocked_id]?.username||'usuario')}</b><small>${E(P[x.blocked_id]?.nombre||'')}</small></span><button class="pill" data-act="unblock" data-id="${E(x.blocked_id)}">Desbloquear</button></div>`).join('')||'<p class="text-sm" style="color:var(--mut)">No tienes a nadie bloqueado.</p>';
    const rq=(q.data||[]).map(x=>`<div class="srow"><span><b>@${E(P[x.from_id]?.username||'usuario')}</b></span><span class="flex gap-2"><button class="pill" data-act="reqAccept" data-id="${E(x.id)}">Aceptar</button><button class="pill" data-act="reqReject" data-id="${E(x.id)}">Rechazar</button></span></div>`).join('');
    h=`${sw('Cuenta privada','cuenta_privada','Solo seguidores aprobados ven tu contenido')}${sw('Permitir que me encuentren','permitir_busqueda','Apareces en la búsqueda',true)}${sw('Permitir mensajes','permitir_mensajes','Otras personas pueden escribirte',true)}${sw('Mostrar mi actividad','mostrar_actividad','Se muestra si estás activo')}<b class="block mt-5">Usuarios bloqueados</b>${fld('Bloquear por usuario','block-user','@usuario')}${act('Bloquear','block')}${bl}${rq?`<b class="block mt-5">Solicitudes para seguirte</b>${rq}`:''}${NOTE}`;
  }else if(n==='settings-security'){
    h=`${fld('Nueva contraseña','new-pass',`Mínimo ${MINPASS} caracteres`,'password')}${fld('Repite la contraseña','new-pass2','Repite la contraseña','password')}${act('Cambiar contraseña','changePass')}${act('Cerrar sesión en todos los dispositivos','logoutAll')}<p class="text-sm mt-4" style="color:var(--mut)">Si alguien entró a tu cuenta, cambia tu contraseña y cierra sesión en todos los dispositivos. No compartas tu contraseña.</p>`;
  }else if(n==='settings-notifications'){
    h=`${sw('Xits','notif_likes','Cuando reaccionan a tus publicaciones',true)}${sw('Comentarios','notif_comentarios','Cuando comentan',true)}${sw('Nuevos seguidores','notif_seguidores','Cuando te siguen',true)}${sw('Mensajes','notif_mensajes','Cuando te escriben',true)}${sw('Inicios de sesión','notif_login','Si alguien entra a tu cuenta',true)}${NOTE}`;
  }else if(n==='settings-personalization'){
    h=`<label class="flex flex-col gap-1 text-sm mt-2">Tema<select data-cfgsel="tema"><option value="dark" ${CFG.tema!=='light'?'selected':''}>Oscuro</option><option value="light" ${CFG.tema==='light'?'selected':''}>Claro</option></select></label><label class="flex flex-col gap-1 text-sm mt-3">Color de acento<input type="color" data-cfgsel="color_acento" value="${/^#[0-9a-f]{6}$/i.test(CFG.color_acento||'')?CFG.color_acento:'#a0fbfd'}" style="height:44px"></label>${sw('Reproducción automática','autoplay','Los videos se reproducen al verlos',true)}`;
  }else if(n==='settings-profile'){
    h=`<p class="text-sm" style="color:var(--mut)">Nombre, usuario, bio, foto y banner se editan en un solo lugar.</p>${act('Editar perfil','editProfile')}`;
  }
  box.innerHTML=h;
}
const val=k=>document.querySelector(`[data-in="${k}"]`)?.value?.trim()||'';
const refresh=()=>renderSettings(screen);
const ACT={
  async changeEmail(){const e=val('new-email');if(!e.includes('@'))return toast('Escribe un correo válido');const {error}=await sb.auth.updateUser({email:e},{emailRedirectTo:location.origin+location.pathname});if(error)return toast(msg(error));toast('Te enviamos un correo para confirmar el cambio')},
  async logout(){await sb.auth.signOut();location.reload()},
  async logoutAll(){if(!await ask('¿Cerrar sesión en todos los dispositivos?',[{note:'Tendrás que volver a entrar también aquí.'}],'Cerrar sesiones'))return;await sb.auth.signOut({scope:'global'});location.reload()},
  async changePass(){const a=val('new-pass');if(a.length<MINPASS)return toast(`Mínimo ${MINPASS} caracteres`);if(a!==val('new-pass2'))return toast('Las contraseñas no coinciden');const {error}=await sb.auth.updateUser({password:a});if(error)return toast(msg(error));toast('Contraseña cambiada')},
  async deleteAccount(){
    const v=await ask('Eliminar mi cuenta',[{note:'Esta acción es permanente. Confirma con tu contraseña.'},{id:'p',label:'Contraseña',type:'password'}],'Eliminar para siempre');if(!v)return;
    const {error:ea}=await sb.auth.signInWithPassword({email:me.email,password:v.p});if(ea)return toast('Contraseña incorrecta');
    const r=await sb.rpc('delete_my_account');if(err(r))return;
    await sb.auth.signOut();location.reload();
  },
  async block(b){const u=val('block-user').replace(/^@/,'').toLowerCase();if(!u)return toast('Escribe el @usuario');const {data:t}=await sb.from('profiles').select('id').eq('username',u).maybeSingle();if(!t)return toast('No existe ese usuario');if(t.id===me.id)return toast('No puedes bloquearte');const r=await sb.from('blocked_users').insert({blocker_id:me.id,blocked_id:t.id});if(err(r))return;toast('Usuario bloqueado');refresh()},
  async unblock(b){const r=await sb.from('blocked_users').delete().eq('blocker_id',me.id).eq('blocked_id',b.dataset.id);if(err(r))return;toast('Desbloqueado');refresh()},
  async reqAccept(b){const r=await sb.from('follow_requests').update({status:'accepted'}).eq('id',b.dataset.id);if(err(r))return;toast('Solicitud aceptada');refresh()},
  async reqReject(b){const r=await sb.from('follow_requests').update({status:'rejected'}).eq('id',b.dataset.id);if(err(r))return;toast('Solicitud rechazada');refresh()},
  editProfile(){go('edit')}
};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b||b.dataset.busy)return;
  const f=ACT[b.dataset.act];if(!f)return;b.dataset.busy=1;
  Promise.resolve(f(b)).catch(x=>{console.error(x);toast(msg(x))}).finally(()=>delete b.dataset.busy);
});
document.addEventListener('change',async e=>{
  const t=e.target;
  if(t.dataset.cfg){if(!await saveCfg({[t.dataset.cfg]:t.checked}))t.checked=!t.checked;else if(t.dataset.cfg==='autoplay')watchVideos()}
  else if(t.dataset.cfgsel){await saveCfg({[t.dataset.cfgsel]:t.value})}
});

/* ---------- ARRANQUE ---------- */
(function init(){
  try{const t=localStorage.getItem('gx-theme');if(t)document.documentElement.dataset.theme=t}catch{}
  $$('input:not([type=file]):not([type=checkbox])').forEach(i=>{if(!i.getAttribute('aria-label')&&i.placeholder)i.setAttribute('aria-label',i.placeholder);if(i.placeholder)i.placeholder=i.placeholder.replace('mín. 6',`mín. ${MINPASS}`)});
  $$('input[type=password]').forEach(i=>{const b=document.createElement('button');b.type='button';b.className='text-sm self-start';b.style.color='var(--mut)';b.textContent='Mostrar contraseña';b.setAttribute('aria-pressed','false');b.onclick=()=>{const s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Ocultar contraseña':'Mostrar contraseña';b.setAttribute('aria-pressed',String(s))};i.after(b)});
  $('#nav button:not([data-g])')?.setAttribute('aria-label','Crear');
  $$('#s-chat .pill').forEach(b=>{if(b.textContent.includes('Reportar'))b.onclick=reportar});
  $$('#s-feed button[aria-label="Notificaciones"]').forEach(b=>b.onclick=()=>toast('El centro de notificaciones llegará pronto'));
  $$('#s-chat button.text-2xl,#s-create button.text-2xl,#s-circ button.text-2xl,#s-admin button.text-2xl,#s-edit button.text-2xl').forEach(b=>b.setAttribute('aria-label','Volver'));
  if(window.visualViewport){const f=()=>{const c=$('#s-chat');if(c&&c.classList.contains('on')){c.style.height=visualViewport.height+'px';scrollTo(0,0)}else if(c)c.style.height=''};visualViewport.addEventListener('resize',f)}
  (async()=>{
    try{
      const {data:{session}}=await sb.auth.getSession();
      const rec=location.hash.includes('type=recovery')||location.search.includes('type=recovery');
      if(rec){me=session?.user||null;go('reset')}
      else if(session&&await start(session.user))go(prof.gustos?.length?'feed':'onb');
      else if(!$('#s-ban').classList.contains('on'))go('home');
    }catch(e){console.error(e);go('home');toast(msg(e))}
  })();
})();
