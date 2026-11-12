/* gelxit-panel.js — Panel de Dueño ampliado (reportes, filtros, anuncio, apelaciones, mantenimiento)
   + anuncio en el feed, pantalla de mantenimiento y pantalla de suspensión con apelación.
   Se carga DESPUÉS de app.js. Los permisos reales los aplica el servidor (supabase-panel.sql). */
(function(){
'use strict';
const when=t=>t?new Date(t).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
const missing=e=>/relation|schema cache|PGRST205|42P01|column .* does not exist|42703/i.test((e&&(e.message||e.code))||'');
const NOTE='<div class="empty-state"><b>Falta activar esta sección</b>Corre <b>supabase-panel.sql</b> en Supabase y vuelve a abrir el panel.</div>';

/* ================= Estado global: modo mantenimiento ================= */
let EST={mantenimiento:false,mensaje:''},bypass=false;
const ov=document.createElement('div');ov.id='gxmaint';ov.hidden=true;
ov.innerHTML='<img src="gelxit-logo.jpg" alt=""><h2>Volvemos en un momento</h2><p id="gxmm"></p><button class="btn" id="gxmr">Reintentar</button><button class="gx-lnk" id="gxmt">Acceso del equipo</button>';
document.body.appendChild(ov);
const bar=document.createElement('div');bar.id='gxmbar';bar.hidden=true;bar.textContent='Modo mantenimiento activo · solo tú puedes entrar';
document.body.appendChild(bar);
function applyMaint(){
  const adm=!!(me&&isAdmin());
  ov.hidden=!(EST.mantenimiento&&!adm&&!(bypass&&!me));
  bar.hidden=!(EST.mantenimiento&&adm);
  $('#gxmm').textContent=EST.mensaje||'';
}
async function loadEstado(){
  try{const r=await sb.from('app_estado').select('mantenimiento,mensaje').eq('id',1).maybeSingle();if(r.data)EST=r.data}catch(e){}
  applyMaint();
}
$('#gxmr').onclick=async()=>{await loadEstado();if(!EST.mantenimiento)location.reload()};
$('#gxmt').onclick=()=>{bypass=true;applyMaint();go('login')};
const _go=go;
go=function(n){_go.apply(this,arguments);applyMaint();if(n==='admin')openPanel();if(n==='feed')loadAnn()};
loadEstado();setInterval(()=>{if(!document.hidden)loadEstado()},60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)loadEstado()});

/* ================= Anuncio global en el feed ================= */
let annAt=0;
async function loadAnn(force){
  if(!me||isBanned(prof))return;
  if(!force&&Date.now()-annAt<12e4)return;annAt=Date.now();
  let box=$('#gxann');
  if(!box){box=document.createElement('div');box.id='gxann';const st=$('#stories');st?.parentNode.insertBefore(box,st)}
  try{
    const r=await sb.from('anuncios').select('id,texto').eq('activo',true).order('creado_en',{ascending:false}).limit(1);
    const a=r.data&&r.data[0];
    let seen='';try{seen=localStorage.getItem('gx-ann')||''}catch{}
    if(!a||seen===String(a.id)){box.innerHTML='';return}
    box.innerHTML=`<div class="gx-ann" role="note"><i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 10v4l3 .5L15 19V5L7 9.5 4 10zM18 9a4 4 0 0 1 0 6"/></svg></i><span>${E(a.texto)}</span><button aria-label="Cerrar anuncio" data-annx="${E(a.id)}"><svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>`;
  }catch(e){}
}
document.addEventListener('click',e=>{const x=e.target.closest('[data-annx]');if(!x)return;try{localStorage.setItem('gx-ann',x.dataset.annx)}catch{}$('#gxann').innerHTML=''});

/* ================= Pantalla de suspensión + apelación ================= */
window.banScreen=async function(p){
  const w=$('#banwhy');
  const hasta=p.ban_hasta?'hasta el '+new Date(p.ban_hasta).toLocaleDateString('es-MX',{day:'numeric',month:'long'}):'de forma permanente';
  w.textContent='Tu cuenta está suspendida '+hasta+'.'+(p.ban_motivo?' Motivo: '+p.ban_motivo:'');
  const st=$('#banst'),ap=$('#banap');st.classList.add('hidden');ap.style.display='';
  try{
    const r=await sb.from('apelaciones').select('estado').eq('user_id',p.id).eq('estado','pendiente').limit(1);
    if(r.data&&r.data.length){ap.style.display='none';st.textContent='Tu apelación está en revisión. Te avisaremos cuando se resuelva.';st.classList.remove('hidden')}
  }catch(e){}
};
window.sendAppeal=async function(){
  const t=($('#banmsg').value||'').trim();if(!t)return toast('Escribe tu mensaje');
  if(LOCK.has('apel'))return;LOCK.add('apel');
  try{
    const r=await sb.from('apelaciones').insert({user_id:me.id,mensaje:t.slice(0,500)});
    if(r.error){toast(r.error.code==='23505'?'Ya enviaste una apelación':missing(r.error)?'Las apelaciones aún no están activas':msg(r.error));if(r.error.code==='23505')banScreen(prof);return}
    $('#banmsg').value='';banScreen(prof);toast('Apelación enviada');
  }finally{LOCK.delete('apel')}
};

/* ================= Panel de Dueño ================= */
const TABS=[['users','Usuarios'],['reports','Reportes'],['ann','Anuncio'],['appeals','Apelaciones'],['sys','Sistema']];
let tab='users',REPF='abierto',pane=null;
const chipRow=(items,cur,fn)=>`<div class="hs" style="padding:0">${items.map(([k,l])=>`<button class="chip ${k===cur?'on':''}" data-${fn}="${k}">${l}</button>`).join('')}</div>`;
function mount(){
  const s=$('#s-admin');if(!s||s.dataset.m)return;s.dataset.m='1';
  const hdr=s.firstElementChild;
  const tabs=document.createElement('div');tabs.id='admtabs';tabs.className='hs';tabs.style.padding='0';
  hdr.after(tabs);
  const f=document.createElement('div');f.id='admf';f.innerHTML=chipRow([['','Todos'],['ban','Suspendidos'],['ver','Verificados'],['new','Nuevos (7 días)']],'','af');
  tabs.after(f);
  pane=document.createElement('div');pane.id='admpane';pane.style.display='none';s.appendChild(pane);
  s.addEventListener('click',e=>{
    const t=e.target.closest('[data-tab]'),a=e.target.closest('[data-af]'),r=e.target.closest('[data-rf]');
    if(t)setTab(t.dataset.tab);
    else if(a){window.AF=a.dataset.af;$$('#admf .chip').forEach(c=>c.classList.toggle('on',c===a));adminList()}
    else if(r){REPF=r.dataset.rf;viewReports()}
  });
}
function drawTabs(c){
  $('#admtabs').innerHTML=TABS.map(([k,l])=>`<button class="chip ${k===tab?'on':''}" data-tab="${k}">${l}${c&&c[k]?` <span class="gx-n">${c[k]}</span>`:''}</button>`).join('');
}
async function counts(){
  const c={};
  try{
    const [a,b]=await Promise.all([sb.from('reports').select('id',{count:'exact',head:true}).eq('estado','abierto'),sb.from('apelaciones').select('id',{count:'exact',head:true}).eq('estado','pendiente')]);
    c.reports=a.count||0;c.appeals=b.count||0;
  }catch(e){}
  drawTabs(c);
}
function openPanel(){
  if(!isAdmin())return;
  mount();window.AF='';$$('#admf .chip').forEach((c,i)=>c.classList.toggle('on',i===0));
  setTab('users');counts();
}
function setTab(t){
  tab=t;drawTabs();
  const users=t==='users';
  $('#admf').style.display=users?'':'none';$('#aq').style.display=users?'':'none';$('#alist').style.display=users?'':'none';
  pane.style.display=users?'none':'flex';
  if(users)return;
  pane.innerHTML='<div class="sk-card" aria-hidden="true"><div class="row"><i class="ln"></i></div><i class="ln" style="width:70%"></i></div>';
  ({reports:viewReports,ann:viewAnn,appeals:viewAppeals,sys:viewSys})[t]();
}
async function profs(ids){
  ids=[...new Set(ids.filter(Boolean))];if(!ids.length)return {};
  const r=await sb.from('profiles').select('id,username,nombre,avatar_url,foto_url,es_creador,baneado,ban_hasta,ban_motivo,verificado_identidad,verificado_premium,creado_en').in('id',ids);
  const m={};(r.data||[]).forEach(u=>{m[u.id]=u;if(!USERS.some(x=>x.id===u.id))USERS.push(u)});return m;
}
const uTag=u=>u?`<b>@${E(u.username||'usuario')}</b> ${vbadge(u)}`:'<b>usuario eliminado</b>';

/* ---- Reportes ---- */
async function viewReports(){
  const st=REPF;
  let q=sb.from('reports').select('*').order('creado_en',{ascending:false,nullsFirst:false}).limit(60);
  q=st==='abierto'?q.eq('estado','abierto'):q.neq('estado','abierto');
  const r=await q;
  if(tab!=='reports')return;
  const head=chipRow([['abierto','Abiertos'],['cerrado','Cerrados']],st,'rf');
  if(r.error){pane.innerHTML=head+(missing(r.error)?NOTE:`<div class="empty-state"><b>No se pudo cargar</b>${E(msg(r.error))}</div>`);return}
  const rows=r.data||[],pm=await profs(rows.flatMap(x=>[x.reporter_id,x.target_user_id]));
  pane.innerHTML=head+(rows.length?rows.map(x=>{
    const t=pm[x.target_user_id],canBan=t&&!t.es_creador&&!isBanned(t);
    return `<div class="card p-3 flex flex-col gap-2" data-rep="${E(x.id)}"><div class="text-sm" style="color:var(--mut)">${when(x.creado_en)}${x.estado&&x.estado!=='abierto'?' · '+E(x.estado):''}</div>
<div class="text-sm">${uTag(pm[x.reporter_id])} reportó a ${uTag(t)}</div><p class="gx-quote">${E(x.motivo||'(sin motivo)')}</p>
<div class="flex flex-wrap gap-2">${st==='abierto'?`${canBan?`<button class="pill" data-rb="${E(x.target_user_id)}">Suspender</button>`:''}<button class="pill" data-rr="resuelto">Resuelto</button><button class="pill" data-rr="descartado">Descartar</button>`:`<button class="pill" data-rr="abierto">Reabrir</button>`}</div></div>`}).join(''):`<div class="empty-state"><b>${st==='abierto'?'Sin reportes abiertos':'Aún no hay reportes cerrados'}</b>${st==='abierto'?'Todo tranquilo por ahora.':''}</div>`);
}
async function closeReport(id,estado){
  const abierto=estado==='abierto';
  const r=await sb.from('reports').update({estado,resuelto_en:abierto?null:new Date().toISOString(),resuelto_por:abierto?null:me.id}).eq('id',id);
  if(r.error)return toast(msg(r.error));toast(abierto?'Reporte reabierto':'Reporte cerrado');viewReports();counts();
}

/* ---- Anuncio ---- */
async function viewAnn(){
  const r=await sb.from('anuncios').select('id,texto,activo,creado_en').order('creado_en',{ascending:false}).limit(8);
  if(tab!=='ann')return;
  if(r.error){pane.innerHTML=missing(r.error)?NOTE:`<div class="empty-state"><b>No se pudo cargar</b>${E(msg(r.error))}</div>`;return}
  const act=(r.data||[]).find(a=>a.activo),hist=(r.data||[]).filter(a=>!a.activo).slice(0,4);
  pane.innerHTML=`<div class="card p-3 flex flex-col gap-2"><b>Anuncio para todos</b><p class="text-sm" style="color:var(--mut)">Aparece arriba del feed hasta que cada persona lo cierre. Solo hay uno activo a la vez.</p>
<textarea id="annt" maxlength="280" rows="3" placeholder="Ej. Ya puedes comentar y dar Xit a los comentarios" aria-label="Texto del anuncio"></textarea><button class="btn" id="annp">Publicar anuncio</button></div>
${act?`<div class="card p-3 flex flex-col gap-2"><div class="text-sm" style="color:var(--p-text)">Activo ahora · ${when(act.creado_en)}</div><p>${E(act.texto)}</p><div><button class="pill" data-annq="${E(act.id)}">Quitar anuncio</button></div></div>`:'<div class="empty-state"><b>No hay anuncio activo</b></div>'}
${hist.length?`<div class="text-sm" style="color:var(--mut)">Anteriores</div>${hist.map(a=>`<div class="card p-3 text-sm" style="color:var(--mut)">${E(a.texto)}<div class="text-xs mt-1">${when(a.creado_en)}</div></div>`).join('')}`:''}`;
  $('#annp').onclick=async()=>{
    const t=($('#annt').value||'').trim();if(!t)return toast('Escribe el anuncio');
    if(LOCK.has('ann'))return;LOCK.add('ann');
    try{
      const a=await sb.from('anuncios').update({activo:false}).eq('activo',true);if(a.error)return toast(msg(a.error));
      const i=await sb.from('anuncios').insert({texto:t.slice(0,280),creado_por:me.id});if(i.error)return toast(msg(i.error));
      toast('Anuncio publicado');annAt=0;viewAnn();
    }finally{LOCK.delete('ann')}
  };
}
async function quitAnn(id){
  const r=await sb.from('anuncios').update({activo:false}).eq('id',id);
  if(r.error)return toast(msg(r.error));toast('Anuncio retirado');annAt=0;viewAnn();
}

/* ---- Apelaciones ---- */
async function viewAppeals(){
  const r=await sb.from('apelaciones').select('*').eq('estado','pendiente').order('creado_en',{ascending:true}).limit(50);
  if(tab!=='appeals')return;
  if(r.error){pane.innerHTML=missing(r.error)?NOTE:`<div class="empty-state"><b>No se pudo cargar</b>${E(msg(r.error))}</div>`;return}
  const rows=r.data||[],pm=await profs(rows.map(x=>x.user_id));
  pane.innerHTML=rows.length?rows.map(x=>{
    const u=pm[x.user_id];
    return `<div class="card p-3 flex flex-col gap-2" data-ap="${E(x.id)}" data-u="${E(x.user_id)}"><div class="text-sm" style="color:var(--mut)">${when(x.creado_en)}</div><div class="text-sm">${uTag(u)}${u&&isBanned(u)?` · suspendido${u.ban_motivo?': '+E(u.ban_motivo):''}`:' · ya no está suspendido'}</div>
<p class="gx-quote">${E(x.mensaje)}</p><div class="flex flex-wrap gap-2">${u&&isBanned(u)?'<button class="pill" data-aa="ok">Aceptar y quitar suspensión</button>':''}<button class="pill" data-aa="no">${u&&isBanned(u)?'Rechazar':'Cerrar'}</button></div></div>`}).join(''):'<div class="empty-state"><b>Sin apelaciones pendientes</b></div>';
}
async function resolveAppeal(id,uid,ok){
  const u=USERS.find(x=>x.id===uid);
  if(ok){
    const v=await ask('Quitar suspensión a @'+(u?.username||''),[{id:'r',label:'Motivo (obligatorio)'}],'Confirmar');
    if(!v)return;if(!v.r.trim())return toast('El motivo es obligatorio');
    const r=await sb.rpc('admin_unban_user',{p_user:uid,p_reason:'Apelación aceptada: '+v.r.trim()});
    if(r.error)return toast(msg(r.error));
  }
  const r=await sb.from('apelaciones').update({estado:ok?'aprobada':'rechazada',resuelto_por:me.id,resuelto_en:new Date().toISOString()}).eq('id',id);
  if(r.error)return toast(msg(r.error));
  toast(ok?'Suspensión retirada':'Apelación cerrada');viewAppeals();counts();
}

/* ---- Sistema (mantenimiento) ---- */
function viewSys(){
  const on=!!EST.mantenimiento;
  pane.innerHTML=`<div class="card p-3 flex flex-col gap-3"><div class="flex items-center gap-3"><div class="flex-1"><b>Modo mantenimiento</b><div class="text-sm" style="color:var(--mut)">${on?'ACTIVO: los demás ven la pantalla de mantenimiento.':'Apagado: todos usan Gelxit normal.'}</div></div><button class="gx-sw ${on?'on':''}" id="msw" role="switch" aria-checked="${on}" aria-label="Modo mantenimiento"><i></i></button></div>
<textarea id="mmsg" maxlength="200" rows="2" aria-label="Mensaje de mantenimiento">${E(EST.mensaje||'Estamos mejorando Gelxit. Volvemos en un momento.')}</textarea><button class="btn2" id="msave">Guardar mensaje</button>
<p class="text-xs" style="color:var(--mut)">Tú sigues entrando con tu cuenta. Es una pantalla de aviso en la app: no cierra la base de datos.</p></div>`;
  const save=async(val,confirmTxt)=>{
    const m=($('#mmsg').value||'').trim()||'Estamos mejorando Gelxit. Volvemos en un momento.';
    const r=await sb.from('app_estado').update({mantenimiento:val,mensaje:m.slice(0,200),actualizado_en:new Date().toISOString()}).eq('id',1);
    if(r.error)return toast(missing(r.error)?'Falta correr supabase-panel.sql':msg(r.error));
    EST={mantenimiento:val,mensaje:m};applyMaint();toast(confirmTxt);viewSys();
  };
  $('#msw').onclick=async()=>{
    if(!on){const v=await ask('Activar modo mantenimiento',[{note:'Todos los demás verán la pantalla de mantenimiento hasta que lo apagues. Tú sigues entrando.'}],'Activar');if(!v)return;save(true,'Mantenimiento activado')}
    else save(false,'Mantenimiento apagado');
  };
  $('#msave').onclick=()=>save(on,'Mensaje guardado');
}

/* ---- Clics de las acciones dentro del panel ---- */
document.addEventListener('click',e=>{
  if(!$('#s-admin')?.classList.contains('on'))return;
  const rr=e.target.closest('[data-rr]'),rb=e.target.closest('[data-rb]'),aq=e.target.closest('[data-annq]'),aa=e.target.closest('[data-aa]');
  if(rr)closeReport(rr.closest('[data-rep]').dataset.rep,rr.dataset.rr);
  else if(rb)admBan(rb.dataset.rb);
  else if(aq)quitAnn(aq.dataset.annq);
  else if(aa){const c=aa.closest('[data-ap]');resolveAppeal(c.dataset.ap,c.dataset.u,aa.dataset.aa==='ok')}
});
})();
