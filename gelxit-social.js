/* gelxit-social.js — listas de Seguidores y Siguiendo (con "Se siguen") y conteos reales.
   Se carga DESPUÉS de app.js. */
(function(){
'use strict';
const cnt=async(col,id)=>{const r=await sb.from('follows').select('id',{count:'exact',head:true}).eq(col,id);return r.error?null:r.count||0};
const counts=async id=>{const [s,g]=await Promise.all([cnt('seguido_id',id),cnt('seguidor_id',id)]);return{s,g}};
const ids=async(sel,col,id)=>{const r=await sb.from('follows').select(sel).eq(col,id).limit(200);return r.error?null:(r.data||[]).map(x=>x[sel])};
const FP='id,nombre,username,avatar_url,foto_url,es_creador,verificado_identidad,verificado_premium';
const toggle=(on)=>on?'on':'';

async function openFollows(uid,tab){
  tab=tab||'seg';
  const sheet=$('#sheet'),box=$('#sheetc');if(!sheet||!box)return;
  box.innerHTML='<div class="gx-fl"><div class="gx-fl-h"><b>Cargando…</b></div></div>';sheet.classList.remove('hidden');
  const [A,B]=await Promise.all([ids('seguidor_id','seguido_id',uid),ids('seguido_id','seguidor_id',uid)]);
  if(A===null||B===null){box.innerHTML='<div class="gx-fl"><p class="gx-fl-e">No se pudo cargar la lista.</p><button class="btn2 w-full" onclick="$(\'#sheet\').classList.add(\'hidden\')">Cerrar</button></div>';return}
  const SA=new Set(A),SB=new Set(B);
  const all=[...new Set([...A,...B])];
  const pr=all.length?await sb.from('profiles').select(FP).in('id',all):{data:[]};
  const P=Object.fromEntries((pr.data||[]).filter(u=>!isBanned(u)).map(u=>[u.id,u]));
  const draw=t=>{
    const list=(t==='seg'?A:B).filter(i=>P[i]);
    const mutual=i=>SA.has(i)&&SB.has(i);
    box.innerHTML=`<div class="gx-fl">
      <div class="gx-fl-t"><button class="gx-fl-b" aria-label="Volver">←</button><b>${uid===me.id?'Tu red':'@'+E((P[uid]||{}).username||'perfil')}</b></div>
      <div class="gx-fl-tabs"><button data-t="seg" class="${toggle(t==='seg')}">Seguidores <span>${fmt(A.length)}</span></button><button data-t="sig" class="${toggle(t==='sig')}">Siguiendo <span>${fmt(B.length)}</span></button></div>
      <div class="gx-fl-l">${list.length?list.map(i=>{const u=P[i];return `<button class="gx-fl-r" data-u="${E(i)}">${av(u,44)}<span class="gx-fl-n"><b>${E(u.nombre||u.username)}</b> ${vbadge(u)}<small>@${E(u.username)}</small></span>${mutual(i)?'<em class="gx-fl-m">Se siguen</em>':''}</button>`}).join(''):`<p class="gx-fl-e">${t==='seg'?'Aún no hay seguidores.':'Aún no sigue a nadie.'}</p>`}</div>
      <button class="btn2 w-full" style="margin-top:12px" onclick="$('#sheet').classList.add('hidden')">Cerrar</button></div>`;
    box.querySelectorAll('.gx-fl-tabs button').forEach(b=>b.onclick=()=>draw(b.dataset.t));
    box.querySelectorAll('.gx-fl-r').forEach(b=>b.onclick=()=>{$('#sheet').classList.add('hidden');if(b.dataset.u===me.id)go('profile');else verUser(b.dataset.u)});
    box.querySelector('.gx-fl-b').onclick=()=>{if(uid===me.id)$('#sheet').classList.add('hidden');else verUser(uid)};
  };
  draw(tab);
}
window.openFollows=openFollows;

/* ---- Perfil propio: números reales y tocables ---- */
function decorateOwn(){
  const s=$('#ps'),g=$('#pg');if(!s||!g||!prof)return;
  [[s,'seg'],[g,'sig']].forEach(([el,t])=>{const d=el.parentElement;if(d.dataset.gxf)return;d.dataset.gxf='1';d.style.cursor='pointer';d.setAttribute('role','button');d.tabIndex=0;
    const go=()=>openFollows(prof.id,t);d.addEventListener('click',go);d.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}})});
  counts(prof.id).then(c=>{if(c.s!==null)s.textContent=fmt(c.s);if(c.g!==null)g.textContent=fmt(c.g)});
}
const _perfil=perfil;
perfil=async function(){const r=await _perfil.apply(this,arguments);try{decorateOwn()}catch(_){}return r};

/* ---- Perfil de otra persona (hoja) ---- */
async function decorateSheet(id){
  const row=document.querySelector('#sheetc .flex.gap-6.mt-3.text-sm');if(!row)return;
  const c=await counts(id);
  const old=row.querySelectorAll('b');const xits=old[1]?old[1].textContent:'0';
  const s=c.s!==null?c.s:null;
  row.innerHTML=`<button class="gx-fl-c" data-t="seg"><b>${s===null?(old[0]?old[0].textContent:'0'):fmt(s)}</b> seguidores</button><button class="gx-fl-c" data-t="sig"><b>${c.g===null?'–':fmt(c.g)}</b> siguiendo</button><span><b>${xits}</b> Xits</span>`;
  row.querySelectorAll('.gx-fl-c').forEach(b=>b.onclick=()=>openFollows(id,b.dataset.t));
}
const _ver=verUser;
verUser=async function(id){const r=await _ver.apply(this,arguments);try{await decorateSheet(id)}catch(_){}return r};
const _seg=seguir;
seguir=async function(id){const r=await _seg.apply(this,arguments);try{await decorateSheet(id);if(prof&&$('#ps'))decorateOwn()}catch(_){}return r};
})();
