/* gelxit-patch.js — cargar DESPUÉS de app.js. No modifica app.js. */
(()=>{
const K=['foto_url','video_url','audio_url'],SIGN=new Map();
const isC=v=>typeof v==='string'&&v.startsWith('chat:');
async function signU(v){
  if(!isC(v))return;
  const p=v.slice(5),c=SIGN.get(p);
  if(c&&c.exp>Date.now())return;
  const r=await sb.storage.from('chat').createSignedUrl(p,3600);
  if(!r.error)SIGN.set(p,{url:r.data.signedUrl,exp:Date.now()+3300e3});
}

/* 1. Chat privado: fotos, videos y audios van al bucket privado "chat" */
const _upl=upl;
upl=async function(bucket,path,f){
  const chat=(bucket==='posts'&&/^[^/]+\/chat-/.test(path))||bucket==='audios';
  if(!chat||!cur)return _upl(bucket,path,f);
  const p=cur.id+'/'+path.split('/').pop();
  const u=await sb.storage.from('chat').upload(p,f,{contentType:f.type,upsert:false});
  if(u.error)throw u.error;
  await signU('chat:'+p);
  return 'chat:'+p;
};
const _bubble=bubble;
bubble=function(m){
  const c={...m};
  K.forEach(k=>{if(isC(c[k]))c[k]=SIGN.get(c[k].slice(5))?.url||''});
  return _bubble(c);
};
const _draw=drawMsgs;
drawMsgs=function(mode='stay'){
  const need=MS.flatMap(m=>K.map(k=>m[k])).filter(v=>isC(v)&&!(SIGN.get(v.slice(5))?.exp>Date.now()));
  _draw(mode);
  if(need.length)Promise.all(need.map(signU)).then(()=>_draw('stay'));
};

/* 2. Ajustes: el panel ya no se rompe al refrescar (bloquear/desbloquear) */
const _rs=renderSettings;
renderSettings=function(n){
  const b=$('#s-'+n+' [data-panel]');
  if(b){b.classList.add('settings-placeholder');delete b.dataset.panel}
  return _rs(n);
};

/* 3. Círculos: muestra errores y crea los de inicio si el usuario no tiene */
loadCirc=async function(){
  const r=await sb.from('circulos').select('*').eq('user_id',me.id).order('creado_en');
  if(r.error){console.error(r.error);CIRC=[];return}
  CIRC=r.data;
  if(!CIRC.length){
    const s=await sb.from('circulos').insert(['Familia','Escuela','Compas','Trabajo'].map(nombre=>({user_id:me.id,nombre,miembros:0}))).select();
    if(s.error)console.error(s.error);else CIRC=s.data;
  }
};
})();
