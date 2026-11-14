/* gelxit-chat.js — borrar mensajes propios y quitar chats de la bandeja.
   Se carga DESPUÉS de app.js. Necesita sql/supabase-chat-borrar.sql en Supabase. */
(function(){
'use strict';
const TR='<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"/></svg>';
const nope=e=>/permission|policy|denied|row-level/i.test((e&&e.message)||'')?'Falta activar el borrado en la base de datos':msg(e);

/* ---- Mensajes: el id queda en la burbuja ---- */
const _b=bubble;
bubble=function(m){return _b(m).replace('<div class="bub','<div data-mid="'+E(String(m.id))+'" class="bub')};

async function delMsg(id){
  const m=MS.find(x=>String(x.id)===String(id));if(!m||m.user_id!==me.id)return;
  if(m.tmp){MS=MS.filter(x=>x!==m);drawMsgs('stay');return}
  const v=await ask('¿Eliminar este mensaje?',[{note:'Se borra para todos en este chat.'}],'Eliminar');if(!v)return;
  const r=await sb.from('messages').delete().eq('id',m.id).eq('user_id',me.id);
  if(r.error)return toast(nope(r.error));
  MS=MS.filter(x=>x.id!==m.id);drawMsgs('stay');toast('Mensaje eliminado');
}
const mineBub=t=>{const b=t.closest&&t.closest('#msgs .bub.me[data-mid]');return b&&!t.closest('audio,video,button')?b:null};
document.addEventListener('click',e=>{const b=mineBub(e.target);if(b)delMsg(b.dataset.mid)});
document.addEventListener('contextmenu',e=>{const b=mineBub(e.target);if(b){e.preventDefault();delMsg(b.dataset.mid)}});

/* ---- Chats: botón de eliminar en cada fila de la bandeja ---- */
async function delChat(i){
  const c=CH[i];if(!c)return;
  const v=await ask('¿Eliminar el chat con '+c.n+'?',[{note:'Lo quitas de tu bandeja y ya no verás sus mensajes. La otra persona conserva su copia.'}],'Eliminar');if(!v)return;
  const r=await sb.from('chat_members').delete().eq('chat_id',c.id).eq('user_id',me.id);
  if(r.error)return toast(nope(r.error));
  if(cur&&cur.id===c.id)cur=null;
  toast('Chat eliminado');chats();
}
window.delChat=delChat;
function decorate(){
  const L=document.getElementById('chatlist');if(!L)return;
  L.querySelectorAll(':scope > button[onclick^="openChat("]').forEach(b=>{
    if(b.querySelector('.gx-cd'))return;
    const i=+b.getAttribute('onclick').match(/\d+/)[0];
    b.style.position='relative';
    const x=document.createElement('span');x.className='gx-cd';x.setAttribute('role','button');x.setAttribute('aria-label','Eliminar chat');x.tabIndex=0;x.innerHTML=TR;
    const go=ev=>{ev.stopPropagation();ev.preventDefault();delChat(i)};
    x.addEventListener('click',go);x.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' ')go(ev)});
    b.appendChild(x);
  });
}
new MutationObserver(decorate).observe(document.getElementById('chatlist'),{childList:true});
decorate();

/* ---- Tiempo real: si borran un mensaje, desaparece al instante ---- */
let ch=null;
const _r=subRT;
subRT=function(){
  _r.apply(this,arguments);
  try{if(ch)sb.removeChannel(ch);
    ch=sb.channel('gx-msg-del').on('postgres_changes',{event:'DELETE',schema:'public',table:'messages'},p=>{
      const id=p.old&&p.old.id;if(!id||!cur)return;
      if(MS.some(x=>String(x.id)===String(id))){MS=MS.filter(x=>String(x.id)!==String(id));drawMsgs('stay')}
      else if(document.getElementById('s-inbox').classList.contains('on'))chats();
    }).subscribe();
  }catch(_){}
};

/* ---- Audios del chat: burbuja con play, onda, duración y velocidad ---- */
(function(){
  const NB=30,SP=[1,1.5,2];
  const H=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
  const bars=src=>{let h=H(src),o='';for(let i=0;i<NB;i++){h=Math.imul(h^(h>>>13),1274126177)>>>0;const v=.28+.72*((h%1000)/1000)*(0.55+0.45*Math.sin(i/NB*Math.PI));o+=`<i style="height:${Math.round(v*100)}%"></i>`}return o};
  const fmt2=s=>{if(!isFinite(s)||s<0)s=0;s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
  const ICP='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>',ICQ='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';
  const _b2=bubble;
  bubble=function(m){
    let h=_b2(m);
    if(!m.audio_url)return h;
    return h.replace(/<audio src="([^"]+)"[^>]*><\/audio>/,(x,src)=>`<div class="gx-aud" data-src="${src}"><button type="button" class="gx-ap" aria-label="Reproducir audio">${ICP}</button><div class="gx-wave" role="slider" aria-label="Progreso del audio">${bars(src)}</div><span class="gx-at">–:––</span><button type="button" class="gx-asp" aria-label="Velocidad">1x</button></div>`);
  };
  let A=null,cur=null,rate=1,DUR=new Map();
  const box=src=>[...document.querySelectorAll('.gx-aud')].filter(b=>b.dataset.src===src);
  const setUI=(src,playing,p,t,d)=>box(src).forEach(b=>{
    b.classList.toggle('on',playing);b.querySelector('.gx-ap').innerHTML=playing?ICQ:ICP;
    const bs=b.querySelectorAll('.gx-wave i'),n=Math.round(p*bs.length);bs.forEach((e,i)=>e.classList.toggle('f',i<n));
    b.querySelector('.gx-at').textContent=playing||p>0?fmt2(t)+' / '+fmt2(d):fmt2(d);
    b.querySelector('.gx-asp').textContent=rate+'x';
  });
  function stop(reset){if(A){A.pause();if(reset)A.currentTime=0}}
  function play(src){
    if(cur&&cur!==src){stop(true);setUI(cur,false,0,0,DUR.get(cur)||0)}
    if(cur!==src||!A){cur=src;A=new Audio(src);A.preload='auto';A.playbackRate=rate;
      A.addEventListener('loadedmetadata',()=>{if(isFinite(A.duration))DUR.set(src,A.duration)});
      A.addEventListener('timeupdate',()=>{const d=isFinite(A.duration)?A.duration:(DUR.get(src)||0);if(d)DUR.set(src,d);setUI(src,!A.paused,d?A.currentTime/d:0,A.currentTime,d)});
      A.addEventListener('ended',()=>{setUI(src,false,0,0,DUR.get(src)||0);A.currentTime=0});
      A.addEventListener('pause',()=>{if(A&&!A.ended)setUI(src,false,(A.currentTime/(DUR.get(src)||A.duration||1)),A.currentTime,DUR.get(src)||A.duration||0)});
    }
    A.playbackRate=rate;A.play().catch(()=>toast('No se pudo reproducir el audio'));
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest('.gx-aud');if(!b)return;
    e.stopPropagation();const src=b.dataset.src;
    if(e.target.closest('.gx-asp')){rate=SP[(SP.indexOf(rate)+1)%SP.length];if(A)A.playbackRate=rate;document.querySelectorAll('.gx-asp').forEach(x=>x.textContent=rate+'x');return}
    if(e.target.closest('.gx-wave')){const r=b.querySelector('.gx-wave').getBoundingClientRect();const p=cl01((e.clientX-r.left)/r.width);
      if(cur!==src||!A){play(src);setTimeout(()=>{if(A&&isFinite(A.duration))A.currentTime=A.duration*p},120)}else if(isFinite(A.duration))A.currentTime=A.duration*p;return}
    if(e.target.closest('.gx-ap')){if(cur===src&&A&&!A.paused)A.pause();else play(src)}
  },true);
  const cl01=x=>Math.min(1,Math.max(0,x));
  /* Duración visible sin reproducir */
  function prime(){document.querySelectorAll('.gx-aud').forEach(b=>{const src=b.dataset.src;
    if(DUR.has(src)){if(cur!==src)setUI(src,false,0,0,DUR.get(src));return}
    if(b._p)return;b._p=1;const a=new Audio();a.preload='metadata';a.src=src;
    a.addEventListener('loadedmetadata',()=>{if(isFinite(a.duration)){DUR.set(src,a.duration);setUI(src,cur===src&&A&&!A.paused,0,0,a.duration)}else{a.currentTime=1e7;a.addEventListener('timeupdate',function f(){a.removeEventListener('timeupdate',f);if(isFinite(a.duration)){DUR.set(src,a.duration);setUI(src,false,0,0,a.duration)}})}});
  })}
  const _d=drawMsgs;
  drawMsgs=function(){const r=_d.apply(this,arguments);try{prime();if(cur&&A)setUI(cur,!A.paused,(DUR.get(cur)?A.currentTime/DUR.get(cur):0),A.currentTime,DUR.get(cur)||0)}catch(_){}return r};
})();

})();
