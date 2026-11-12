/* gelxit-motion.js — splash, esqueletos, botones con carga, partículas de Xit y jalar para actualizar.
   Se carga DESPUÉS de app.js, gelxit-patch.js y gelxit-viewer.js. No cambia la lógica de la app. */
(function(){
'use strict';
const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1 · Splash: se quita cuando la app ya muestra una pantalla (mínimo ~0.8 s, máximo 6 s) */
(function(){
  const sp=document.getElementById('gxsplash');if(!sp)return;
  const t0=performance.now();let done=false;
  const hide=()=>{if(done)return;done=true;const w=Math.max(0,(reduce?0:800)-(performance.now()-t0));setTimeout(()=>{sp.classList.add('out');setTimeout(()=>sp.remove(),450)},w)};
  const ready=()=>!!document.querySelector('#app .s.on');
  if(ready())hide();
  else{const mo=new MutationObserver(()=>{if(ready()){mo.disconnect();hide()}});mo.observe(document.getElementById('app'),{subtree:true,attributes:true,attributeFilter:['class']})}
  setTimeout(hide,6000);
})();

/* 2 · Esqueletos del feed */
(function(){
  const box=document.getElementById('feed');if(!box)return;
  const card='<div class="sk-card" aria-hidden="true"><div class="row"><i class="av"></i><i class="ln"></i></div><i class="md"></i><i class="ln" style="width:80%"></i><div class="row"><i class="bt"></i><i class="bt" style="width:100px"></i></div></div>';
  new MutationObserver(()=>{if(box.querySelector('.skeleton'))box.innerHTML=card+card}).observe(box,{childList:true});
})();

/* 3 · Botones con carga: la app ya llama setStatus(texto,true) al empezar y setStatus('',false) al terminar */
(function(){
  let last=null;
  document.addEventListener('click',e=>{const b=e.target.closest('button.btn');if(b)last=b},true);
  const _ss=setStatus;
  setStatus=function(t,on){
    _ss.apply(this,arguments);
    const act=arguments.length>1?on:!!t;
    if(act){const b=(last&&last.isConnected&&last.closest('.s.on'))?last:document.querySelector('.s.on button.btn');b?.classList.add('loading')}
    else document.querySelectorAll('button.btn.loading').forEach(b=>b.classList.remove('loading'));
  };
})();

/* 5 · Xit con partículas */
function burst(b){
  if(reduce)return;
  const host=b.querySelector('i')||b;host.classList.add('xp-host');
  const N=8;for(let k=0;k<N;k++){
    const a=Math.PI*2*k/N+Math.random()*.4,d=34+Math.random()*16,p=document.createElement('span');
    p.className='xp-p';p.style.setProperty('--x',Math.cos(a)*d+'px');p.style.setProperty('--y',Math.sin(a)*d+'px');
    host.appendChild(p);setTimeout(()=>p.remove(),750);
  }
  b.classList.add('xp-pop');setTimeout(()=>b.classList.remove('xp-pop'),520);
}
const _dx=doXit;
doXit=async function(id,b){
  const was=b&&b.classList.contains('liked');
  const r=await _dx.apply(this,arguments);
  if(b&&!was&&b.classList.contains('liked'))burst(b);
  return r;
};

/* 6 · Jalar para actualizar el feed */
(function(){
  const sc=document.getElementById('s-feed'),app=document.getElementById('app');if(!sc||!app)return;
  const ind=document.createElement('div');ind.id='gxptr';ind.setAttribute('aria-hidden','true');app.appendChild(ind);
  let y0=null,dy=0,busy=false;
  const TH=110;
  const reset=()=>{ind.classList.add('rel');ind.classList.remove('ready','spin');ind.style.opacity='0';ind.style.transform='translate(-50%,-50px)'};
  sc.addEventListener('touchstart',e=>{
    if(busy||!sc.classList.contains('on')||sc.scrollTop>0||document.getElementById('gxv')){y0=null;return}
    y0=e.touches[0].clientY;dy=0;ind.classList.remove('rel');
  },{passive:true});
  sc.addEventListener('touchmove',e=>{
    if(y0==null)return;
    dy=e.touches[0].clientY-y0;
    if(dy<=0||sc.scrollTop>0){ind.style.opacity='0';return}
    ind.style.opacity=String(Math.min(1,dy/80));
    ind.style.transform='translate(-50%,'+(Math.min(dy*.5,70)-50)+'px) rotate('+dy*3+'deg)';
    ind.classList.toggle('ready',dy>TH);
  },{passive:true});
  sc.addEventListener('touchend',async()=>{
    if(y0==null)return;const go=dy>TH;y0=null;
    if(!go){reset();return}
    busy=true;ind.classList.add('rel','spin');ind.classList.remove('ready');ind.style.opacity='1';ind.style.transform='translate(-50%,24px)';
    const t=Date.now();
    try{await feed()}catch(e){console.error(e)}
    const w=Math.max(0,600-(Date.now()-t));setTimeout(()=>{reset();busy=false},w);
  },{passive:true});
})();
})();

/* Botón Xit en la barra de abajo (reemplaza el botón flotante del feed) */
(function(){
  window.goXit=function(){
    if(screen==='feed'){xitMode()}
    else{xit=true;go('feed')}
    setTimeout(syncXitNav,60);
  };
  function syncXitNav(){
    const b=document.getElementById('nxit');if(!b)return;
    const on=screen==='feed'&&!!xit;
    b.classList.toggle('act',on);on?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current');
    const hm=document.querySelector('#nav [data-g="feed"]');if(hm&&on){hm.classList.remove('act');hm.removeAttribute('aria-current')}
  }
  const _go=go;go=function(){const r=_go.apply(this,arguments);syncXitNav();return r};
  const _df=drawFeed;drawFeed=function(){const r=_df.apply(this,arguments);syncXitNav();return r};
})();

window.goHome=function(){if(screen==='feed'&&xit){xit=false;go('feed');feed()}else{xit=false;go('feed')}};
