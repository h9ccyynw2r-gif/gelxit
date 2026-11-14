/* Gelxit · notificaciones, #hashtags/@menciones, Explorar, color de acento y reto del día */
(function(){
'use strict';
const KEY='gx-seen-'; let ITEMS=[],SEEN=new Set();
const ls={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const uid=()=>((typeof me!=="undefined"&&me)?me.id:null);
function loadSeen(){try{SEEN=new Set(JSON.parse(ls.get(KEY+uid())||'[]'))}catch{SEEN=new Set()}}
function saveSeen(){ls.set(KEY+uid(),JSON.stringify([...SEEN].slice(-300)))}
function ago(t){if(!t)return '';const s=(Date.now()-new Date(t))/1000;if(s<60)return 'ahora';if(s<3600)return Math.floor(s/60)+' min';if(s<86400)return Math.floor(s/3600)+' h';return Math.floor(s/86400)+' d'}

/* ---------- Notificaciones (se derivan de xits, comentarios y follows) ---------- */
async function fetchNotifs(){
  if(!uid())return [];
  const mine=await sb.from('posts').select('id,titulo').eq('user_id',uid()).order('creado_en',{ascending:false}).limit(100);
  const pm=Object.fromEntries((mine.data||[]).map(p=>[p.id,p])),ids=Object.keys(pm);
  const q=(t,f)=>f.then(r=>r.error?[]:(r.data||[]).map(x=>({...x,_t:t}))).catch(()=>[]);
  const [xs,cs,fs]=await Promise.all([
    ids.length?q('xit',sb.from('xits').select('*').in('post_id',ids).neq('user_id',uid()).limit(40)):[],
    ids.length?q('cm',sb.from('comentarios').select('*').in('post_id',ids).neq('user_id',uid()).order('creado_en',{ascending:false}).limit(40)):[],
    q('fol',sb.from('follows').select('*').eq('seguido_id',uid()).limit(40))]);
  const raw=[...xs,...cs,...fs],actors=[...new Set(raw.map(x=>x._t==='fol'?x.seguidor_id:x.user_id))];
  const pr=actors.length?(await sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,es_creador,baneado,ban_hasta,verificado_identidad,verificado_premium').in('id',actors)).data||[]:[];
  const pp=Object.fromEntries(pr.map(x=>[x.id,x]));
  return raw.map(x=>{const a=x._t==='fol'?x.seguidor_id:x.user_id;return{key:x._t+':'+(x.id||x.post_id+a),t:x._t,u:pp[a]||{},uid:a,post:pm[x.post_id],pid:x.post_id,txt:x.texto,ts:x.creado_en||x.created_at||null}})
    .filter(n=>n.u.username).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
}
function badge(n){document.querySelectorAll('#s-feed button[aria-label^="Notificaciones"]').forEach(b=>{b.style.position='relative';let d=b.querySelector('.gx-nb');if(!n){d&&d.remove();return}if(!d){d=document.createElement('i');d.className='gx-nb';b.appendChild(d)}d.textContent=n>9?'9+':n})}
async function refresh(){try{loadSeen();ITEMS=await fetchNotifs();badge(ITEMS.filter(n=>!SEEN.has(n.key)).length)}catch(e){}}
function line(n){const w=n.t==='xit'?'dio Xit a tu publicación':n.t==='cm'?'comentó':'empezó a seguirte';return w}
function openNotifs(){
  const box=$('#sheetc'),sh=$('#sheet');if(!box||!sh)return;
  const fresh=n=>!SEEN.has(n.key);
  box.innerHTML=`<div class="gx-nc"><div class="gx-nh"><b>Notificaciones</b><button class="gx-nx" aria-label="Cerrar">✕</button></div><div class="gx-nl">${ITEMS.length?ITEMS.map((n,i)=>`<button class="gx-ni ${fresh(n)?'new':''}" data-i="${i}">${av(n.u,40)}<span class="gx-nt"><b>@${E(n.u.username)}</b> ${E(line(n))}${n.t==='cm'?`: <em>“${E((n.txt||'').slice(0,80))}”</em>`:n.post?`: <em>${E((n.post.titulo||'').slice(0,50))}</em>`:''}<small>${ago(n.ts)}</small></span></button>`).join(''):'<div class="empty-state"><b>Todo en calma por aquí</b>Cuando alguien te dé Xit, te comente o te siga, aparece aquí.</div>'}</div></div>`;
  sh.classList.remove('hidden');
  box.querySelector('.gx-nx').onclick=()=>sh.classList.add('hidden');
  box.querySelectorAll('.gx-ni').forEach(b=>b.onclick=()=>{const n=ITEMS[+b.dataset.i];sh.classList.add('hidden');if(n.t==='fol')verUser(n.uid);else if(n.pid&&window.openViewer)openViewer(n.pid,n.t==='cm')});
  ITEMS.forEach(n=>SEEN.add(n.key));saveSeen();badge(0);
}
function hookBell(){document.querySelectorAll('#s-feed button[aria-label="Notificaciones"]').forEach(b=>{if(b.dataset.gx)return;b.dataset.gx=1;b.setAttribute('aria-label','Notificaciones');b.onclick=async e=>{e.stopImmediatePropagation();if(!ITEMS.length)await refresh();openNotifs()}})}

/* ---------- #hashtags y @menciones tocables ---------- */
const RX=/(^|[\s(])([#@][\p{L}\p{N}_]{2,30})/gu;
function linkify(root){
  root.querySelectorAll('.post-t:not([data-lk]),.pv-cap:not([data-lk]),.pv-ct p:not([data-lk])').forEach(p=>{
    p.dataset.lk=1;if(!/[#@]/.test(p.textContent))return;
    p.innerHTML=p.innerHTML.replace(/(^|[\s(])([#@][\p{L}\p{N}_]{2,30})/gu,(m,a,t)=>`${a}<a class="gx-tag" data-q="${t}">${t}</a>`);
  });
}
document.addEventListener('click',e=>{const a=e.target.closest&&e.target.closest('.gx-tag');if(!a)return;e.preventDefault();e.stopPropagation();
  const v=document.getElementById('pv');if(v&&window.closeViewer)closeViewer();
  go('search');const i=$('#s-search input');if(i){i.value=a.dataset.q;i.dispatchEvent(new Event('input'))}},true);

/* ---------- Explorar ---------- */
const RETOS=['Muestra algo que hiciste hoy en 10 segundos','Tu mejor facto del día 🤯','Baila lo que sea, sin pena','Enseña tu rincón favorito de tu casa','Cuenta tu anécdota más ridícula','Algo que aprendiste esta semana','Tu mascota o la de un amigo haciendo algo gracioso','Un talento raro que tengas','Tu comida favorita, sin filtros','Un “antes y después” de lo que sea'];
const reto=()=>{const d=new Date();return RETOS[Math.floor(d/864e5+d.getTimezoneOffset()/1440)%RETOS.length]};
const COLORS=['#a0fbfd','#8e6cff','#ff8ad8','#ffd166','#7dffa0','#ff8078'];
function applyAccent(c){if(!c)return;let s=document.getElementById('gx-acc');if(!s){s=document.createElement('style');s.id='gx-acc';document.head.appendChild(s)}
  s.textContent=`html:root,html:root[data-theme="dark"],html:root[data-theme="light"]{--p:${c};--x:${c};--p-strong:${c}}`}
function explorer(){
  const box=$('#trend'),inp=$('#s-search input');if(!box||(inp&&inp.value.trim()))return;
  const sec=$('#s-search');let ex=$('#gx-ex');if(!ex){ex=document.createElement('div');ex.id='gx-ex';sec.insertBefore(ex,sec.querySelector('h3'))}
  const tags={};(typeof POSTS!=="undefined"?POSTS:[]).forEach(p=>{(p.titulo||'').match(/#[\p{L}\p{N}_]{2,30}/gu)?.forEach(t=>tags[t.toLowerCase()]=(tags[t.toLowerCase()]||0)+1)});
  const top=Object.entries(tags).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const cur=ls.get('gx-accent')||COLORS[0];
  ex.innerHTML=`<div class="gx-reto"><small>RETO DEL DÍA</small><b>${E(reto())}</b><button class="pill" onclick="go('create')">Participar</button></div>`+
   (top.length?`<div class="gx-tags">${top.map(([t])=>`<a class="gx-tag chip" data-q="${E(t)}">${E(t)}</a>`).join('')}</div>`:'')+
   `<div class="gx-col"><small>Tu color</small>${COLORS.map(c=>`<button class="gx-sw ${c===cur?'on':''}" data-c="${c}" style="background:${c}" aria-label="Color ${c}"></button>`).join('')}</div>`;
  ex.querySelectorAll('.gx-sw').forEach(b=>b.onclick=()=>{ls.set('gx-accent',b.dataset.c);applyAccent(b.dataset.c);ex.querySelectorAll('.gx-sw').forEach(x=>x.classList.toggle('on',x===b))});
  if(!box.children.length)box.innerHTML='<div class="empty-state"><b>Aún no hay nada en tendencia</b>Sube un Xit y sé el primero en aparecer aquí</div>';
}
const _trend=window.trend;window.trend=async function(){const r=await _trend.apply(this,arguments);try{explorer();linkify(document)}catch{}return r};
const _go=window.go;window.go=function(n){const r=_go.apply(this,arguments);if(n==='feed')setTimeout(hookBell,0);return r};

applyAccent(ls.get('gx-accent'));
new MutationObserver(()=>{linkify(document);hookBell()}).observe(document.body,{childList:true,subtree:true});
const iv=setInterval(()=>{if(typeof me!=="undefined"&&me){clearInterval(iv);hookBell();refresh();setInterval(refresh,60000)}},800);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&typeof me!=="undefined"&&me)refresh()});
})();
