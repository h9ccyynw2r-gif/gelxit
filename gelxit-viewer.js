/* gelxit-viewer.js — visor de publicaciones a pantalla completa (estilo Instagram) + comentarios con Xit.
   Se carga DESPUÉS de app.js y gelxit-patch.js. No modifica app.js: envuelve postHTML y añade un visor. */
(function(){
'use strict';
const FLAME='<svg class="act-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>';
const CMT='<svg class="act-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.1-4.2A8.5 8.5 0 1 1 20.5 12z"/></svg>';
const SHR='<svg class="act-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/></svg>';
const CLOSE='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
const TRASH='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/></svg>';
const SEND='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 8-16 8 3-8zM7 12h13"/></svg>';
const find=id=>[...POSTS,...EXTRA].find(x=>String(x.id)===String(id));
const ago=t=>{const s=Math.max(1,(Date.now()-new Date(t))/1000|0);if(s<60)return 'ahora';const m=s/60|0;if(m<60)return m+' min';const h=m/60|0;if(h<24)return h+' h';const d=h/24|0;return d<7?d+' d':new Date(t).toLocaleDateString('es-MX',{day:'numeric',month:'short'})};

/* ---- 1. Tarjetas del feed: Xit con flama, botón de comentar, video sin controles ---- */
const _post=postHTML;
postHTML=function(p){
  let h=_post(p);
  h=h.replace(/ controls(?=[ >])/,'');                       // el toque abre el visor en vez de mostrar controles
  const id=E(p.id);
  const foot=`<footer class="post-a"><button class="act ${p.mine?'liked':''}" aria-pressed="${!!p.mine}" aria-label="Dar Xit" onclick="doXit('${id}',this)">${FLAME}<span>${fmt(p.xc)}</span></button><button class="act" aria-label="Comentarios" onclick="openViewer('${id}',true)">${CMT}<span>Comentar</span></button><button class="act" aria-label="Compartir" onclick="sharePost('${id}')">${SHR}</button></footer>`;
  h=h.replace(/<footer class="post-a">[\s\S]*?<\/footer>/,foot);
  h=h.replace('<article class="post"','<article class="post" data-open="1"');
  return h;
};
document.addEventListener('click',e=>{
  const a=e.target.closest('#feed .post[data-open]');
  if(!a||e.target.closest('.post-h,.post-a,button,a'))return;
  openViewer(a.id.replace(/^post-/,''));
});

/* ---- 2. Visor ---- */
let V=null;                                    // estado del visor abierto
function sync(p){
  document.querySelectorAll('[data-xb="'+p.id+'"]').forEach(b=>{b.classList.toggle('liked',!!p.mine);b.setAttribute('aria-pressed',String(!!p.mine));const s=b.querySelector('span');if(s)s.textContent=fmt(p.xc)});
  const fb=document.querySelector('#post-'+CSS.escape(String(p.id))+' .post-a .act');
  if(fb){fb.classList.toggle('liked',!!p.mine);fb.setAttribute('aria-pressed',String(!!p.mine));const s=fb.querySelector('span');if(s)s.textContent=fmt(p.xc)}
}
async function toggleXit(p,btn){
  const was=!!p.mine;
  await doXit(String(p.id),btn);                  // reutiliza la lógica existente (RLS, bloqueo de doble toque)
  sync(p);
  return p.mine&&!was;
}
function burst(x,y){
  if(!V)return;
  const n=document.createElement('div');n.className='pv-burst';n.style.left=x+'px';n.style.top=y+'px';
  n.innerHTML='<svg viewBox="0 0 24 24"><use href="#i-x"/></svg>';
  V.el.appendChild(n);setTimeout(()=>n.remove(),900);
}
window.openViewer=function(id,withComments){
  const p=find(id);if(!p||V)return;
  const u=p.pr||{},vu=U(p.video_url),fu=U(p.foto_url);
  document.querySelectorAll('video').forEach(v=>v.pause());
  const el=document.createElement('div');el.id='gxv';el.className='pv';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Publicación de @'+(u.username||'usuario'));
  const media=vu?`<video src="${E(vu)}" loop playsinline autoplay preload="auto"></video>`:fu?`<img src="${E(fu)}" alt="${E(p.titulo||'Imagen')}">`:`<div class="pv-txt">${E(p.descripcion||p.titulo||'')}</div>`;
  const tag=p.circulo&&p.circulo!=='Público'?'Solo '+p.circulo:(p.categoria||'');
  el.innerHTML=`<div class="pv-media">${media}<div class="pv-pause" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></div></div>
<div class="pv-top"><button class="pv-x" aria-label="Salir de la publicación">${CLOSE}</button><span class="pv-tag">${E(tag)}</span></div>
<div class="pv-rail">
  <button class="pv-b ${p.mine?'liked':''}" data-xb="${E(p.id)}" aria-pressed="${!!p.mine}" aria-label="Dar Xit"><i>${FLAME}</i><span>${fmt(p.xc)}</span></button>
  <button class="pv-b" id="pvc" aria-label="Comentarios"><i>${CMT}</i><span>…</span></button>
  <button class="pv-b" id="pvs" aria-label="Compartir"><i>${SHR}</i><span>Enviar</span></button>
</div>
<div class="pv-info"><button class="pv-who" onclick="closeViewer();verUser('${E(p.user_id)}')">${av(u,38)}<b>@${E(u.username||'usuario')}</b> ${vbadge(u)}</button><p class="pv-cap">${E(p.titulo||'')}</p></div>
<div class="pv-cm" id="pvcm" aria-hidden="true"><div class="pv-cmh"><b id="pvch">Comentarios</b><button class="pv-cx" id="pvcx" aria-label="Cerrar comentarios">${CLOSE}</button></div><div class="pv-cl" id="pvcl"></div><form class="pv-cf" id="pvcf"><input id="pvci" maxlength="500" placeholder="Añade un comentario…" autocomplete="off" aria-label="Comentario"><button class="pv-send" aria-label="Publicar comentario">${SEND}</button></form></div>`;
  $('#app').appendChild(el);
  V={el,p,cm:[],open:false,t:0};
  history.pushState({pv:1},'');
  // eventos
  el.querySelector('.pv-x').onclick=()=>closeViewer();
  el.querySelector('[data-xb]').onclick=async function(){const on=await toggleXit(p,this);if(on)this.classList.add('pop')};
  el.querySelector('#pvs').onclick=()=>sharePost(String(p.id));
  el.querySelector('#pvc').onclick=()=>toggleComments();
  el.querySelector('#pvcx').onclick=()=>toggleComments(false);
  el.querySelector('#pvcf').onsubmit=ev=>{ev.preventDefault();sendComment()};
  const m=el.querySelector('.pv-media'),vid=el.querySelector('video');
  m.addEventListener('click',ev=>{
    const now=Date.now();
    if(now-V.t<320){                                  // doble toque = Xit
      V.t=0;clearTimeout(V.tt);const r=el.getBoundingClientRect();burst(ev.clientX-r.left,ev.clientY-r.top);
      if(!p.mine)toggleXit(p,el.querySelector('[data-xb]'));
      return;
    }
    V.t=now;
    V.tt=setTimeout(()=>{if(V&&V.open){toggleComments(false);return}if(vid){if(vid.paused){vid.play().catch(()=>{});el.classList.remove('paused')}else{vid.pause();el.classList.add('paused')}}},330);
  });
  if(vid){vid.play().catch(()=>{vid.muted=true;vid.play().catch(()=>{})})}
  loadComments();
  if(withComments)toggleComments(true);
  el.querySelector('.pv-x').focus();
};
window.closeViewer=function(){
  if(!V)return;
  const el=V.el;V=null;
  el.querySelector('video')?.pause();
  el.classList.add('out');setTimeout(()=>el.remove(),180);
  if(history.state&&history.state.pv)history.back();
  try{watchVideos()}catch(e){}
};
window.addEventListener('popstate',()=>{if(V){const el=V.el;V=null;el.querySelector('video')?.pause();el.classList.add('out');setTimeout(()=>el.remove(),180);try{watchVideos()}catch(e){}}});
document.addEventListener('keydown',e=>{if(!V)return;if(e.key==='Escape'){if(V.open)toggleComments(false);else closeViewer()}});

/* ---- 3. Comentarios ---- */
function toggleComments(force){
  if(!V)return;
  const open=typeof force==='boolean'?force:!V.open;V.open=open;
  V.el.classList.toggle('cm-open',open);
  V.el.querySelector('#pvcm').setAttribute('aria-hidden',String(!open));
  if(open)setTimeout(()=>V&&V.el.querySelector('#pvci')?.focus({preventScroll:true}),250);
}
function cRow(c){
  const u=c.pr||{},mine=c.user_id===me.id,canDel=mine||isAdmin()||V.p.user_id===me.id;
  return `<div class="pv-c" data-c="${E(c.id)}">${av(u,34)}<div class="pv-ct"><div class="pv-cn"><b>@${E(u.username||'usuario')}</b> ${vbadge(u)}<span>${ago(c.creado_en)}</span></div><p>${E(c.texto)}</p></div>
<div class="pv-ca"><button class="pv-cb ${c.mine?'liked':''}" data-cx="${E(c.id)}" aria-pressed="${!!c.mine}" aria-label="Dar Xit al comentario">${FLAME}<span>${c.xc?fmt(c.xc):''}</span></button>${canDel?`<button class="pv-cb del" data-cd="${E(c.id)}" aria-label="Eliminar comentario">${TRASH}</button>`:''}</div></div>`;
}
function drawComments(){
  if(!V)return;
  const l=V.el.querySelector('#pvcl'),n=V.cm.length;
  V.el.querySelector('#pvch').textContent=n?`Comentarios · ${fmt(n)}`:'Comentarios';
  V.el.querySelector('#pvc span').textContent=n?fmt(n):'Comentar';
  l.innerHTML=n?V.cm.map(cRow).join(''):`<div class="pv-empty"><i>${FLAME}</i><b>Sé el primero en comentar</b><span>Dile algo a @${E((V.p.pr||{}).username||'usuario')}</span></div>`;
}
async function loadComments(){
  const v=V;if(!v)return;
  const l=v.el.querySelector('#pvcl');l.innerHTML='<div class="pv-ld"><i></i><i></i><i></i></div>';
  try{
    const r=await withTimeout(sb.from('comentarios').select('id,post_id,user_id,texto,creado_en').eq('post_id',v.p.id).order('creado_en',{ascending:true}).limit(150));
    if(r.error)throw r.error;
    const cs=r.data||[];
    const uids=[...new Set(cs.map(c=>c.user_id))],ids=cs.map(c=>c.id);
    const [pr,xs]=await Promise.all([
      uids.length?sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,es_creador,baneado,ban_hasta,verificado_identidad,verificado_premium').in('id',uids):{data:[]},
      ids.length?sb.from('comentario_xits').select('comentario_id,user_id').in('comentario_id',ids):{data:[]}]);
    const pm=Object.fromEntries((pr.data||[]).map(x=>[x.id,x]));
    cs.forEach(c=>{const x=(xs.data||[]).filter(k=>k.comentario_id===c.id);c.xc=x.length;c.mine=x.some(k=>k.user_id===me.id);c.pr=pm[c.user_id]||{}});
    if(V!==v)return;
    v.cm=cs.filter(c=>!isBanned(c.pr));drawComments();
  }catch(e){
    if(V!==v)return;
    const off=/comentarios|relation|schema cache|PGRST205|42P01/i.test((e&&(e.message||e.code))||'');
    l.innerHTML=`<div class="pv-empty"><i>${FLAME}</i><b>${off?'Comentarios disponibles pronto':'No pudimos cargar los comentarios'}</b>${off?'':'<button class="pill" id="pvr">Reintentar</button>'}</div>`;
    v.el.querySelector('#pvc span').textContent='Comentar';
    l.querySelector('#pvr')?.addEventListener('click',loadComments);
  }
}
async function sendComment(){
  const v=V;if(!v||LOCK.has('cmt'))return;
  const i=v.el.querySelector('#pvci'),t=i.value.trim();if(!t)return;
  LOCK.add('cmt');
  try{
    const r=await withTimeout(sb.from('comentarios').insert({post_id:v.p.id,user_id:me.id,texto:t.slice(0,500)}).select('id,post_id,user_id,texto,creado_en').single());
    if(r.error){toast(msg(r.error));return}
    const c=r.data;c.xc=0;c.mine=false;c.pr=prof||{};
    i.value='';v.cm.push(c);drawComments();
    const l=v.el.querySelector('#pvcl');l.scrollTop=l.scrollHeight;
  }catch(e){toast(msg(e))}finally{LOCK.delete('cmt')}
}
document.addEventListener('click',async e=>{
  if(!V)return;
  const x=e.target.closest('[data-cx]'),d=e.target.closest('[data-cd]');
  if(x){
    const id=x.dataset.cx,c=V.cm.find(k=>String(k.id)===id);if(!c||LOCK.has('c'+id))return;LOCK.add('c'+id);
    try{
      if(c.mine){const r=await sb.from('comentario_xits').delete().eq('comentario_id',c.id).eq('user_id',me.id);if(r.error){toast(msg(r.error));return}c.mine=false;c.xc--}
      else{const r=await sb.from('comentario_xits').insert({comentario_id:c.id,user_id:me.id});if(r.error){toast(msg(r.error));return}c.mine=true;c.xc++;x.classList.add('pop')}
      x.classList.toggle('liked',c.mine);x.setAttribute('aria-pressed',String(c.mine));x.querySelector('span').textContent=c.xc?fmt(c.xc):'';
    }finally{LOCK.delete('c'+id)}
  }else if(d){
    const id=d.dataset.cd;
    if(!confirm('¿Eliminar este comentario?'))return;
    const r=await sb.from('comentarios').delete().eq('id',id);
    if(r.error){toast(msg(r.error));return}
    V.cm=V.cm.filter(k=>String(k.id)!==id);drawComments();
  }
});
})();

/* Historias: Escape y deslizar hacia abajo cierran la historia */
(function(){
  const sv=()=>document.getElementById('sv');
  const open=()=>{const e=sv();return e&&e.style.display!=='none'};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&open()&&typeof closeS==='function')closeS()});
  let y0=null;
  document.addEventListener('touchstart',e=>{y0=open()&&e.target.closest&&e.target.closest('#sv')?e.touches[0].clientY:null},{passive:true});
  document.addEventListener('touchend',e=>{if(y0!==null&&open()&&e.changedTouches[0].clientY-y0>120&&typeof closeS==='function')closeS();y0=null},{passive:true});
})();
