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

/* 1. Chat privado */
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

/* 2. Ajustes */
const _rs=renderSettings;
renderSettings=function(n){
  const b=$('#s-'+n+' [data-panel]');
  if(b){b.classList.add('settings-placeholder');delete b.dataset.panel}
  return _rs(n);
};

/* 3. Círculos */
loadCirc=async function(){
  const r=await sb.from('circulos').select('*').eq('user_id',me.id).order('creado_en');
  if(r.error){console.error(r.error);CIRC=[];return}
  CIRC=r.data;
  if(!CIRC.length){
    const s=await sb.from('circulos').insert(['Familia','Escuela','Compas','Trabajo'].map(nombre=>({user_id:me.id,nombre,miembros:0}))).select();
    if(s.error)console.error(s.error);else CIRC=s.data;
  }
};

/* 4. Fotos de perfil: sin foto, muestra la inicial */
av=function(p,s=40){
  p=p||{};
  const r=p.avatar_url||p.foto_url,u=typeof r==='string'&&/^https?:\/\//.test(r)?r:'';
  if(u)return '<img src="'+E(u)+'" alt="" class="rounded-full object-cover flex-none" style="width:'+s+'px;height:'+s+'px">';
  return '<span aria-hidden="true" class="rounded-full flex-none inline-flex items-center justify-center font-bold text-white" style="width:'+s+'px;height:'+s+'px;font-size:'+Math.round(s/2.2)+'px;background:var(--p)">'+E((p.nombre||p.username||'?')[0].toUpperCase())+'</span>';
};
})();
