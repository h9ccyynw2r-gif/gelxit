/* gelxit-profile.js — pestañas del perfil: Publicaciones, Xits (los que diste) y Guardados.
   Se carga DESPUÉS de app.js y gelxit-feed.js. */
(function(){
'use strict';
const IC={
  pub:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.6"/><rect x="13" y="4" width="7" height="7" rx="1.6"/><rect x="4" y="13" width="7" height="7" rx="1.6"/><rect x="13" y="13" width="7" height="7" rx="1.6"/></svg>',
  xit:'<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-x"/></svg>',
  sav:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1z"/></svg>'
};
const G=document.getElementById('grid');if(!G)return;
const hint=[...document.querySelectorAll('#s-profile p')].find(p=>/Fija hasta 3/.test(p.textContent));
const tabs=document.createElement('div');tabs.id='gxptabs';tabs.className='gx-ptabs';tabs.setAttribute('role','tablist');
tabs.innerHTML=`<button role="tab" data-t="pub" class="on" aria-selected="true">${IC.pub}<span>Publicaciones</span></button><button role="tab" data-t="xit" aria-selected="false">${IC.xit}<span>Xits</span></button><button role="tab" data-t="sav" aria-selected="false">${IC.sav}<span>Guardados</span></button>`;
(hint||G).before(tabs);
let T='pub';
const EMPTY={xit:['Aún no das Xit','Los Xits que des aparecerán aquí.'],sav:['Nada guardado','Toca el marcador en una publicación para guardarla. Solo tú lo ves.']};
const cell=p=>{const vu=U(p.video_url),fu=U(p.foto_url);
  return `<button class="gcell" onclick="openViewer('${E(String(p.id))}')" aria-label="${E(p.titulo||'Xit')}">${vu?`<video src="${E(vu)}#t=0.1"${fu?` poster="${E(fu)}"`:''} preload="metadata" muted playsinline></video>`:fu?`<img src="${E(fu)}" alt="" loading="lazy">`:`<span>${E(p.titulo||'')}</span>`}</button>`};
async function byIds(ids){
  if(!ids.length)return[];
  const r=await sb.from('posts').select('*').in('id',ids);if(r.error)return null;
  const rows=r.data||[];await hydrate(rows);
  const have=new Set(EXTRA.map(x=>String(x.id)));EXTRA=EXTRA.concat(rows.filter(x=>!have.has(String(x.id))));
  const ord=new Map(ids.map((id,i)=>[String(id),i]));
  return rows.filter(p=>!isBanned(p.pr)).sort((a,b)=>ord.get(String(a.id))-ord.get(String(b.id)));
}
async function show(t){
  T=t;
  tabs.querySelectorAll('button').forEach(b=>{const on=b.dataset.t===t;b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on))});
  if(hint)hint.style.display=t==='pub'?'':'none';
  if(t==='pub'){grid();return}
  G.innerHTML='<div class="gx-pl">Cargando…</div>';
  let ids=[];
  if(t==='xit'){const r=await sb.from('xits').select('post_id,creado_en').eq('user_id',me.id).order('creado_en',{ascending:false}).limit(60);if(r.error){G.innerHTML='<div class="gx-pl">No se pudo cargar.</div>';return}ids=(r.data||[]).map(x=>x.post_id)}
  else{const r=await sb.from('guardados').select('post_id,creado_en').eq('user_id',me.id).order('creado_en',{ascending:false}).limit(60);
    if(r.error){G.innerHTML=/does not exist|schema cache/i.test(r.error.message||'')?'<div class="gx-pl"><b>Guardados disponibles pronto</b></div>':'<div class="gx-pl">No se pudo cargar.</div>';return}ids=(r.data||[]).map(x=>x.post_id)}
  if(T!==t)return;
  const l=await byIds(ids);if(T!==t)return;
  if(l===null){G.innerHTML='<div class="gx-pl">No se pudo cargar.</div>';return}
  G.innerHTML=l.length?l.map(cell).join(''):`<div class="gx-pl"><b>${EMPTY[t][0]}</b>${EMPTY[t][1]}</div>`;
}
tabs.addEventListener('click',e=>{const b=e.target.closest('button[data-t]');if(b&&b.dataset.t!==T)show(b.dataset.t)});
/* Al abrir el perfil o cambiar de guardados, refresca la pestaña activa */
const _perfil=perfil;
perfil=async function(){const r=await _perfil.apply(this,arguments);try{if(T!=='pub')show(T)}catch(_){}return r};
document.addEventListener('gx-saved-changed',()=>{if(T==='sav'&&document.getElementById('s-profile').classList.contains('on'))show('sav')});
})();
