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
})();
