/* gelxit-feed.js — feed estilo Instagram: botones laterales (Xit, comentar, enviar, guardar) y guardados.
   Se carga DESPUÉS de gelxit-viewer.js. Guardar necesita sql/supabase-guardados.sql. */
(function(){
'use strict';
const FLAME='<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>';
const CMT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1.1-4.2A8.5 8.5 0 1 1 20.5 12z"/></svg>';
const SHR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 16 8-16 8 3-8zM7 12h13"/></svg>';
const BM='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/></svg>';
const SAVED=new Set();window.SAVED=SAVED;let loaded=false;

const _p=postHTML;
postHTML=function(p){
  let h=_p(p);
  if(!/<div class="post-media">/.test(h))return h;
  const id=E(String(p.id));
  const rail=`<div class="gx-rail"><button type="button" class="gx-rb ${p.mine?'liked':''}" data-xb="${id}" aria-pressed="${!!p.mine}" aria-label="Dar Xit" onclick="doXit('${id}',this)">${FLAME}<span>${fmt(p.xc)}</span></button><button type="button" class="gx-rb" aria-label="Comentarios" onclick="openViewer('${id}',true)">${CMT}<span>Comentar</span></button><button type="button" class="gx-rb" aria-label="Enviar" onclick="sharePost('${id}')">${SHR}<span>Enviar</span></button><button type="button" class="gx-rb ${SAVED.has(String(p.id))?'on':''}" data-sv="${id}" aria-label="Guardar" onclick="toggleSave('${id}',this)">${BM}<span>Guardar</span></button></div>`;
  h=h.replace(/(<div class="post-media">[\s\S]*?)<\/div>/,'$1'+rail+'</div>');
  h=h.replace(/<footer class="post-a">[\s\S]*?<\/footer>/,'');
  return h;
};

function paint(){document.querySelectorAll('[data-sv]').forEach(b=>{const on=SAVED.has(b.dataset.sv);b.classList.toggle('on',on);b.setAttribute('aria-pressed',String(on))})}
async function loadSaved(){
  if(loaded||typeof me==='undefined'||!me)return;loaded=true;
  const r=await sb.from('guardados').select('post_id').eq('user_id',me.id).limit(2000);
  if(!r.error){(r.data||[]).forEach(x=>SAVED.add(String(x.post_id)));paint()}
}
window.toggleSave=async function(id,b){
  id=String(id);if(LOCK.has('sv'+id))return;LOCK.add('sv'+id);
  const was=SAVED.has(id);
  try{
    const r=was?await sb.from('guardados').delete().eq('post_id',id).eq('user_id',me.id):await sb.from('guardados').insert({post_id:id,user_id:me.id});
    if(r.error)return toast(/does not exist|schema cache/i.test(r.error.message||'')?'Guardados disponibles pronto':msg(r.error));
    was?SAVED.delete(id):SAVED.add(id);paint();
    if(!was){b&&b.classList.add('pop');setTimeout(()=>b&&b.classList.remove('pop'),450);toast('Guardado')}
    document.dispatchEvent(new CustomEvent('gx-saved-changed'));
  }finally{LOCK.delete('sv'+id)}
};
const _d=drawFeed;
drawFeed=function(){const r=_d.apply(this,arguments);try{loadSaved()}catch(_){}return r};
})();
