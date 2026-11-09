// === GELXIT APP.JS NUEVO - COMPLETO Y FUNCIONAL ===
const SUPABASE_URL = 'https://xialbhxpdmvvjjdxhjim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_aDPceXWaF_KLchyEInN9jQ_3PoxTcxA';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CATS = ['Comedia','Música','Baile','Factos','Cocina','Deportes','Noticias','Moda','Gaming','Anime y Manga','Memes','Arte y Dibujo','Belleza','Mascotas','Viajes','Naturaleza','Tecnología','Aprende','Fitness','Negocios','Autos','Fe','Fútbol','Chismes'];
let me = null, prof = null, POSTS = [], CH = [], MS = [], cur = null, msKey = '', cat = 'Todos', adminUsers = [];

// FIX SCROLL + CHAT + NETLIFY
(function(){
  const st = document.createElement('style');
  st.textContent = 'a[href*="netlify.com"],a[href*="netlify.app"],iframe[src*="netlify"],[id*="netlify" i],[class*="netlify" i]{display:none !important} html,body{overflow-y:auto !important;overflow-x:hidden !important;-webkit-overflow-scrolling:touch !important} .s{overflow-y:auto !important;-webkit-overflow-scrolling:touch !important;padding-bottom:90px !important;min-height:100dvh !important} #s-chat{display:flex !important;flex-direction:column !important;height:100dvh !important;overflow:hidden !important;padding-bottom:0 !important} #msgs{flex:1 !important;overflow-y:auto !important;-webkit-overflow-scrolling:touch !important;padding-bottom:12px !important} #inp{position:sticky !important;bottom:0 !important;padding:10px 10px calc(10px + env(safe-area-inset-bottom)) !important;margin:0 !important;background:#111 !important;z-index:9999 !important;display:flex !important;gap:8px !important;align-items:center !important} #inp input{flex:1 !important;min-width:0 !important}';
  document.head.appendChild(st);
})();

function toast(m){
  let t = $('#toast');
  if(!t){ t = document.createElement('div'); t.id = 'toast'; t.style.cssText = 'position:fixed;left:50%;bottom:80px;transform:translateX(-50%);background:#111;color:#fff;padding:12px 16px;border-radius:12px;z-index:99999;max-width:90%;text-align:center'; document.body.appendChild(t); }
  t.textContent = m; t.style.display = 'block'; clearTimeout(t._h); t._h = setTimeout(()=> t.style.display = 'none', 2600);
}
function go(id){
  $$('.s').forEach(x => x.classList.remove('on'));
  const el = document.getElementById('s-' + id) || document.getElementById(id);
  if(el) el.classList.add('on');
  window.scrollTo(0,0);
  if(id === 'chat') setTimeout(bajarChat, 150);
}
function bajarChat(){ const c = $('#msgs'); if(c) c.scrollTop = c.scrollHeight; }
function timeAgo(d){ if(!d) return ''; const s = (Date.now() - new Date(d).getTime())/1000; if(s < 60) return 'ahora'; if(s < 3600) return Math.floor(s/60) + 'm'; if(s < 86400) return Math.floor(s/3600) + 'h'; return Math.floor(s/86400) + 'd'; }

// AUTH
async function loadMe(){
  const {data:{user}} = await sb.auth.getUser(); me = user; if(!me) return;
  const {data} = await sb.from('profiles').select('*').eq('id', me.id).maybeSingle();
  prof = data || {};
  if(prof.baneado){
    if(prof.ban_hasta && new Date(prof.ban_hasta) < new Date()){
      await sb.from('profiles').update({baneado:false, ban_hasta:null, ban_motivo:null}).eq('id', me.id);
      prof.baneado = false;
    } else {
      const hasta = prof.ban_hasta ? ' hasta ' + new Date(prof.ban_hasta).toLocaleDateString('es-MX') : ' permanente';
      document.body.innerHTML = '<div style="padding:40px;text-align:center;color:#fff;background:#111;min-height:100vh"><h2>⛔ Cuenta baneada</h2><p>Tu cuenta está baneada' + hasta + '</p><p style="opacity:.6">Motivo: ' + E(prof.ban_motivo || 'Sin motivo') + '</p><button onclick="location.reload()" style="padding:12px 20px;border-radius:12px;border:0;background:#6a00f4;color:#fff;margin-top:16px">Reintentar</button></div>';
      throw new Error('baneado');
    }
  }
  const pe = $('#prof-email'); if(pe) pe.textContent = me.email || '';
  const pn = $('#prof-name'); if(pn) pn.textContent = prof.nombre || prof.username || 'Usuario';
  const pu = $('#prof-user'); if(pu) pu.textContent = '@' + (prof.username || 'usuario');
  const pb = $('#prof-bio'); if(pb) pb.textContent = prof.bio || '';
}

// FEED
async function loadPosts(){
  let q = sb.from('posts').select('*, profiles(username,nombre,avatar_url)').order('created_at', {ascending:false}).limit(50);
  if(cat && cat !== 'Todos') q = q.eq('categoria', cat);
  const {data} = await q; POSTS = data || []; drawFeed();
}
function drawFeed(){
  const c = $('#feed'); if(!c) return;
  if(!POSTS.length){ c.innerHTML = '<p style="opacity:.6;padding:20px;text-align:center">Aún no hay posts. ¡Sé el primero!</p>'; return; }
  c.innerHTML = POSTS.map(p => '<article style="background:#ffffff10;border:1px solid #ffffff14;border-radius:16px;padding:14px;margin:12px 0"><div style="display:flex;gap:10px;align-items:center"><b>@' + E(p.profiles?.username || 'usuario') + '</b><small style="opacity:.6">' + timeAgo(p.created_at) + '</small></div><p style="margin:10px 0;white-space:pre-wrap">' + E(p.texto || p.caption || '') + '</p>' + (p.media_url ? '<img src="' + E(p.media_url) + '" style="width:100%;border-radius:12px">' : '') + '<div style="display:flex;gap:16px;margin-top:10px;opacity:.8"><span>❤️ ' + (p.likes || 0) + '</span><span>💬</span></div></article>').join('');
}

// CHAT
async function loadChats(){
  if(!me) return;
  const {data} = await sb.from('chats').select('*').order('updated_at', {ascending:false});
  CH = data || []; drawChats();
}
function drawChats(){
  const c = $('#chat-list'); if(!c) return;
  if(!CH.length){ c.innerHTML = '<p style="opacity:.6;padding:20px">No tienes chats aún.</p>'; return; }
  c.innerHTML = CH.map(ch => '<div data-open-chat="' + ch.id + '" style="padding:14px;border-bottom:1px solid #ffffff14;cursor:pointer"><b>Chat ' + ch.id.slice(0,6) + '</b><br><small style="opacity:.6">' + E(ch.last_msg || '') + '</small></div>').join('');
}
async function openChat(id){
  cur = CH.find(x => x.id === id); if(!cur) return;
  msKey = id; go('chat');
  const t = $('#chat-title'); if(t) t.textContent = 'Chat';
  await loadMsgs();
}
async function loadMsgs(){
  if(!msKey) return;
  const {data} = await sb.from('messages').select('*').eq('chat_id', msKey).order('created_at', {ascending:true}).limit(100);
  MS = data || []; drawMsgs();
}
function drawMsgs(){
  const c = $('#msgs'); if(!c) return;
  c.innerHTML = MS.map(m => '<div style="display:flex;justify-content:' + (m.sender_id === me?.id ? 'flex-end' : 'flex-start') + ';margin:6px 0"><div style="max-width:80%;padding:10px 12px;border-radius:16px;background:' + (m.sender_id === me?.id ? '#6a00f4' : '#222') + ';color:#fff;white-space:pre-wrap">' + E(m.text || m.content || '') + '</div></div>').join('');
  bajarChat();
}
async function sendMsg(){
  const inp = $('#inp input') || $('#msg-input') || $('#chat-input'); if(!inp) return;
  const txt = inp.value.trim(); if(!txt || !msKey) return;
  inp.value = '';
  await sb.from('messages').insert({chat_id: msKey, sender_id: me.id, text: txt});
  await sb.from('chats').update({last_msg: txt, updated_at: new Date().toISOString()}).eq('id', msKey);
  await loadMsgs();
}

// PANEL DUEÑO CON BANEO POR DIAS
async function adminList(){
  const c = $('#admin-list') || $('#owner-list') || $('#panel-list'); if(!c) return;
  const q = $('#admin-search')?.value?.trim() || '';
  let query = sb.from('profiles').select('*').order('created_at', {ascending:false}).limit(30);
  if(q) query = query.ilike('username', '%' + q.replace('@','') + '%');
  const {data} = await query; adminUsers = data || [];
  if(!adminUsers.length){ c.innerHTML = '<p style="opacity:.6;padding:20px">Sin usuarios.</p>'; return; }
  c.innerHTML = adminUsers.map(u => {
    const baneado = u.baneado ? ' · <span style="color:#f87171">baneado' + (u.ban_hasta ? ' hasta ' + new Date(u.ban_hasta).toLocaleDateString('es-MX') : ' permanente') + '</span>' : '';
    return '<div style="background:#ffffff10;border:1px solid #ffffff14;border-radius:16px;padding:14px;margin:12px 0"><div style="display:flex;gap:10px;align-items:center"><div style="width:44px;height:44px;border-radius:50%;background:#6a00f4;display:flex;align-items:center;justify-content:center;font-weight:800">' + E((u.username || 'U')[0].toUpperCase()) + '</div><div><b>' + E(u.nombre || u.username || 'Usuario') + '</b><br><small style="opacity:.6">@' + E(u.username || 'usuario') + baneado + '</small></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button onclick="toggleVerificado(\'' + u.id + '\',' + (!!u.verificado) + ')" style="padding:8px 12px;border-radius:10px;border:0;background:#222;color:#fff">' + (u.verificado ? 'Quitar verificación' : 'Verificar') + '</button><button onclick="togglePremium(\'' + u.id + '\',' + (!!u.premium) + ')" style="padding:8px 12px;border-radius:10px;border:0;background:#222;color:#fff">' + (u.premium ? 'Quitar Premium' : 'Dar Premium') + '</button>' + (u.baneado ? '<button onclick="unbanUser(\'' + u.id + '\')" style="padding:8px 12px;border-radius:10px;border:1px solid #22c55e;background:transparent;color:#22c55e">Desbanear</button>' : '') + '</div>' + (!u.baneado ? '<div style="background:#00000040;padding:10px;border-radius:12px;margin-top:10px"><b style="font-size:13px">⏳ ¿Cuánto lo baneas?</b><select id="ban-tiempo-' + u.id + '" style="width:100%;padding:10px;border-radius:10px;background:#111;color:#fff;margin-top:8px;border:1px solid #ffffff20"><option value="0">♾️ Permanente</option><option value="1">1 día</option><option value="7">7 días</option><option value="30">30 días</option><option value="custom">✏️ Días personalizados</option></select><input id="ban-dias-' + u.id + '" type="number" min="1" placeholder="¿Cuántos días? Ej: 3" style="width:100%;padding:10px;border-radius:10px;background:#111;color:#fff;margin-top:8px;border:1px solid #ffffff20"><input id="ban-motivo-' + u.id + '" placeholder="Motivo (opcional)" style="width:100%;padding:10px;border-radius:10px;background:#111;color:#fff;margin-top:8px;border:1px solid #ffffff20"><button onclick="banUser(\'' + u.id + '\')" style="width:100%;padding:11px;border:0;border-radius:10px;background:#ef4444;color:#fff;font-weight:700;margin-top:8px">Banear con este tiempo</button></div>' : '') + '</div>';
  }).join('');
}
async function banUser(id){
  const sel = document.getElementById('ban-tiempo-' + id); const diasInput = document.getElementById('ban-dias-' + id); const motivoInput = document.getElementById('ban-motivo-' + id);
  let val = sel ? sel.value : '0'; let dias = 0;
  if(val === 'custom') dias = parseInt(diasInput?.value || '0');
  else dias = parseInt(val || '0');
  if(val === 'custom' && (!dias || dias <= 0)) return toast('Pon cuántos días, wey');
  const motivo = motivoInput?.value?.trim() || 'Baneado por el dueño';
  if(!confirm(dias === 0 ? '¿Banear PERMANENTE?' : '¿Banear por ' + dias + ' día(s)?')) return;
  let patch = {baneado:true, ban_motivo:motivo, ban_hasta:null};
  if(dias > 0){ const h = new Date(); h.setDate(h.getDate() + dias); patch.ban_hasta = h.toISOString(); }
  const {error} = await sb.from('profiles').update(patch).eq('id', id);
  if(error) return toast(error.message);
  toast(dias === 0 ? 'Baneado permanente' : 'Baneado por ' + dias + ' día(s)');
  adminList();
}
async function unbanUser(id){
  const {error} = await sb.from('profiles').update({baneado:false, ban_hasta:null, ban_motivo:null}).eq('id', id);
  if(error) return toast(error.message);
  toast('Desbaneado'); adminList();
}
async function toggleVerificado(id, actual){
  const {error} = await sb.from('profiles').update({verificado:!actual}).eq('id', id);
  if(error) return toast(error.message); toast(!actual ? 'Verificado' : 'Verificación quitada'); adminList();
}
async function togglePremium(id, actual){
  const {error} = await sb.from('profiles').update({premium:!actual}).eq('id', id);
  if(error) return toast(error.message); toast(!actual ? 'Premium dado' : 'Premium quitado'); adminList();
}

// CONFIG V7
let __cfgCache = null, __lastCfgTitle = '';
async function getCfg(){
  if(!me) return null; if(__cfgCache) return __cfgCache;
  const {data} = await sb.from('user_settings').select('*').eq('user_id', me.id).maybeSingle();
  if(data){ __cfgCache = data; return data; }
  const {data:created} = await sb.from('user_settings').insert({user_id: me.id}).select().single();
  __cfgCache = created || {}; return __cfgCache;
}
async function saveCfg(patch){
  if(!me) return; __cfgCache = {...(__cfgCache||{}), ...patch};
  const {error} = await sb.from('user_settings').upsert({user_id: me.id, ...patch, updated_at: new Date().toISOString()});
  if(error) return toast(error.message); toast('Guardado en Supabase');
}
function sw(label, key, val, desc){ return '<label style="display:flex;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid #ffffff14;cursor:pointer"><span><b style="display:block">' + label + '</b><small style="opacity:.65">' + desc + '</small></span><input type="checkbox" data-cfg="' + key + '" ' + (val ? 'checked' : '') + ' style="width:44px;height:24px;accent-color:#6a00f4"></label>'; }
function inpF(label, key, val, ph, type){ return '<label style="display:block;margin:12px 0"><b>' + label + '</b><input type="' + (type || 'text') + '" data-cfg-input="' + key + '" value="' + String(val ?? '').replace(/"/g,'') + '" placeholder="' + ph + '" style="width:100%;margin-top:6px;padding:12px;border-radius:12px;background:#00000040;color:#fff;border:1px solid #ffffff20"></label>'; }
function btnF(label, id, color){ return '<button id="' + id + '" style="width:100%;padding:13px;border:0;border-radius:12px;background:' + (color || '#6a00f4') + ';color:#fff;font-weight:700;margin-top:12px">' + label + '</button>'; }
function isVisible(el){ if(!el) return false; let p = el; while(p && p !== document.body){ const s = getComputedStyle(p); if(s.display === 'none' || s.visibility === 'hidden') return false; p = p.parentElement; } const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
function getVisibleTitle(){
  const titles = ['Gestión del perfil','Personalización','Notificaciones','Privacidad','Seguridad','Cuenta'];
  const els = [...document.querySelectorAll('h1,h2,h3,div,span,b')].filter(el => titles.includes(el.textContent?.trim()) && el.children.length === 0 && isVisible(el));
  if(!els.length) return ''; els.sort((a,b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top); return els[0].textContent.trim();
}
async function renderRealSettings(){
  const all = [...document.querySelectorAll('div,p,span')];
  const placeholder = all.find(el => el.textContent?.trim() === 'Esta sección está lista para conectar sus controles reales.' && isVisible(el));
  if(!placeholder) return;
  const title = getVisibleTitle(); if(!title) return;
  const box = placeholder.parentElement || placeholder;
  if(box.dataset.cfgTitle === title && __lastCfgTitle === title) return;
  box.dataset.cfgTitle = title; __lastCfgTitle = title;
  const cfg = await getCfg() || {}; const prof2 = prof || {}; let html = '';
  if(title === 'Cuenta'){
    const {data:{user}} = await sb.auth.getUser(); const fecha = user?.created_at ? new Date(user.created_at).toLocaleDateString('es-MX') : 'Hoy';
    html = '<p style="opacity:.7">Administra los datos de tu cuenta.</p><div style="background:#00000040;padding:14px;border-radius:12px;margin:12px 0"><b>🔒 Sesión actual</b><br><small style="opacity:.7">Conectado como:<br>' + E(me?.email || '') + '</small><br><small style="opacity:.7">Cuenta creada: ' + fecha + '</small></div>' + inpF('Cambiar email','new-email','','Nuevo email','email') + btnF('Cambiar mi email','cfg-change-email') + btnF('Cerrar sesión en este dispositivo','cfg-logout','#ef4444') + btnF('Cerrar sesión en TODOS los dispositivos','cfg-logout-all','#7f1d1d') + '<div style="background:#7f1d1d30;border:1px solid #ef444444;padding:14px;border-radius:12px;margin-top:16px"><b style="color:#fca5a5">⚠️ Zona peligrosa</b>' + inpF('Escribe tu contraseña para confirmar','delete-pass','','Tu contraseña actual','password') + btnF('Eliminar mi cuenta para siempre','cfg-delete','#ef4444') + '</div>';
  } else if(title === 'Privacidad'){
    const {data:bloq} = await sb.from('blocked_users').select('blocked_id').eq('blocker_id', me.id);
    let bloqHtml = '<p style="opacity:.6">No tienes a nadie bloqueado.</p>';
    if(bloq && bloq.length){ bloqHtml = ''; for(const b of bloq){ const {data:p} = await sb.from('profiles').select('username,nombre').eq('id', b.blocked_id).maybeSingle(); bloqHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #ffffff14"><span><b>' + E(p?.username || 'Usuario') + '</b></span><button data-unblock="' + b.blocked_id + '" style="padding:8px 14px;border-radius:8px;border:0;background:#ef4444;color:#fff">Desbloquear</button></div>'; } }
    html = '<p style="opacity:.7">Define quién puede encontrarte.</p>' + sw('Perfil público','perfil_publico',cfg.perfil_publico,'Si lo apagas, tu cuenta es privada') + sw('Cuenta privada','cuenta_privada',cfg.cuenta_privada,'Solo seguidores aprobados ven tu contenido') + sw('Permitir que me encuentren','permitir_busqueda',cfg.permitir_busqueda,'Apareces en búsqueda') + sw('Permitir mensajes','permitir_mensajes',cfg.permitir_mensajes,'Otros pueden escribirte') + sw('Mostrar mi actividad','mostrar_actividad',cfg.mostrar_actividad,'Se muestra si estás activo') + sw('Ocultar mi email','ocultar_email',cfg.ocultar_email ?? true,'Tu email nunca se muestra') + '<div style="margin-top:18px"><b>🚫 Usuarios bloqueados</b>' + inpF('Bloquear por usuario','block-user','','@usuario') + btnF('Bloquear usuario','cfg-block','#ef4444') + bloqHtml + '</div>';
  } else if(title === 'Seguridad'){
    html = '<p style="opacity:.7">Protege tu cuenta.</p>' + inpF('Nueva contraseña','new-pass','','Mínimo 6 caracteres','password') + btnF('Cambiar contraseña','cfg-pass') + btnF('Cerrar sesión en TODOS los dispositivos','cfg-logout-all2','#7f1d1d');
  } else if(title === 'Notificaciones'){
    html = '<p style="opacity:.7">Configura los avisos.</p>' + sw('Me gusta','notif_likes',cfg.notif_likes,'Cuando dan like') + sw('Comentarios','notif_comentarios',cfg.notif_comentarios,'Cuando comentan') + sw('Nuevos seguidores','notif_seguidores',cfg.notif_seguidores,'Cuando te siguen') + sw('Mensajes','notif_mensajes',cfg.notif_mensajes,'Cuando te escriben') + sw('Alertas de inicio de sesión','notif_login',cfg.notif_login,'Si alguien entra a tu cuenta');
  } else if(title === 'Personalización'){
    html = '<p style="opacity:.7">Ajusta la apariencia.</p><label style="display:block;margin:12px 0"><b>Tema</b><select data-cfg-select="tema" style="width:100%;padding:12px;border-radius:12px;background:#111;color:#fff;margin-top:6px"><option value="dark" ' + (cfg.tema === 'dark' ? 'selected' : '') + '>Oscuro</option><option value="light" ' + (cfg.tema === 'light' ? 'selected' : '') + '>Claro</option></select></label><label style="display:block;margin:12px 0"><b>Color de acento</b><input type="color" data-cfg-select="color_acento" value="' + (cfg.color_acento || '#6a00f4') + '" style="width:100%;height:44px"></label>' + sw('Reproducción automática','autoplay',cfg.autoplay,'Videos solos');
  } else if(title === 'Gestión del perfil'){
    html = '<p style="opacity:.7">Edita tu información pública.</p>' + inpF('Nombre','nombre',prof2.nombre,'Tu nombre') + inpF('Usuario','username',prof2.username,'@usuario') + inpF('Biografía','bio',prof2.bio,'Cuéntanos de ti...') + btnF('Guardar perfil','cfg-save-perfil');
  }
  if(!html) return; box.innerHTML = html; if(cfg.tema) document.documentElement.dataset.theme = cfg.tema;
}

// EVENTOS
document.addEventListener('click', async (e) => {
  const open = e.target.closest('[data-open-chat]'); if(open){ openChat(open.dataset.openChat); return; }
  const nav = e.target.closest('[data-go]'); if(nav){ go(nav.dataset.go); if(nav.dataset.go === 'home') loadPosts(); if(nav.dataset.go === 'chats') loadChats(); if(nav.dataset.go === 'owner' || nav.dataset.go === 'admin') adminList(); return; }
  const send = e.target.closest('#send-btn') || e.target.closest('[data-send]'); if(send){ sendMsg(); return; }
  if(e.target.id === 'cfg-logout'){ await sb.auth.signOut(); location.reload(); }
  if(e.target.id === 'cfg-logout-all' || e.target.id === 'cfg-logout-all2'){ if(!confirm('¿Cerrar sesión en TODOS los dispositivos?')) return; await sb.auth.signOut({scope:'global'}); location.reload(); }
  if(e.target.id === 'cfg-delete'){
    const pass = document.querySelector('[data-cfg-input="delete-pass"]')?.value; if(!pass) return toast('Escribe tu contraseña');
    const {error:errAuth} = await sb.auth.signInWithPassword({email:me.email, password:pass}); if(errAuth) return toast('Contraseña incorrecta');
    if(!confirm('¿SEGURO? Esto borra tu cuenta para siempre.')) return;
    await sb.from('profiles').delete().eq('id', me.id); await sb.auth.signOut(); location.reload();
  }
  if(e.target.id === 'cfg-change-email'){
    const ne = document.querySelector('[data-cfg-input="new-email"]')?.value; if(!ne || !ne.includes('@')) return toast('Pon un email válido');
    const {error} = await sb.auth.updateUser({email:ne}); if(error) return toast(error.message); toast('Te mandamos un correo para confirmar');
  }
  if(e.target.id === 'cfg-pass'){
    const pass = document.querySelector('[data-cfg-input="new-pass"]')?.value; if(!pass || pass.length < 6) return toast('Pon mínimo 6');
    const {error} = await sb.auth.updateUser({password:pass}); if(error) return toast(error.message); toast('Contraseña cambiada');
  }
  if(e.target.id === 'cfg-save-perfil'){
    const nombre = document.querySelector('[data-cfg-input="nombre"]')?.value; const username = document.querySelector('[data-cfg-input="username"]')?.value; const bio = document.querySelector('[data-cfg-input="bio"]')?.value;
    const {error} = await sb.from('profiles').update({nombre, username, bio}).eq('id', me.id); if(error) return toast(error.message); toast('Perfil guardado'); location.reload();
  }
  if(e.target.id === 'cfg-block'){
    const u = document.querySelector('[data-cfg-input="block-user"]')?.value?.replace('@','').trim(); if(!u) return toast('Escribe el @usuario');
    const {data:target} = await sb.from('profiles').select('id').eq('username', u).maybeSingle(); if(!target) return toast('No existe ese usuario');
    const {error} = await sb.from('blocked_users').insert({blocker_id:me.id, blocked_id:target.id}); if(error) return toast('Ya está bloqueado'); toast('Bloqueado'); __lastCfgTitle = ''; renderRealSettings();
  }
  const unblockId = e.target.dataset?.unblock; if(unblockId){ await sb.from('blocked_users').delete().eq('blocker_id', me.id).eq('blocked_id', unblockId); toast('Desbloqueado'); __lastCfgTitle = ''; renderRealSettings(); }
  const adminSearchBtn = e.target.closest('[data-admin-search]'); if(adminSearchBtn){ adminList(); }
});
document.addEventListener('change', async (e) => {
  const k = e.target.dataset.cfg; if(k){ await saveCfg({[k]: e.target.checked}); return; }
  const ks = e.target.dataset.cfgSelect; if(ks){ await saveCfg({[ks]: e.target.value}); if(ks === 'tema') document.documentElement.dataset.theme = e.target.value; }
  const catEl = e.target.closest('[data-cat]'); if(catEl){ cat = catEl.dataset.cat; loadPosts(); }
});
document.addEventListener('input', (e) => { if(e.target.id === 'admin-search') adminList(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Enter' && e.target.closest('#inp')){ e.preventDefault(); sendMsg(); } });
setInterval(renderRealSettings, 800);
setInterval(()=>{ if(me && document.querySelector('#s-chat.on')) loadMsgs(); }, 3000);

// INIT
(async () => {
  try{ await loadMe(); }catch(err){ console.log(err.message); return; }
  if(me){ await loadPosts(); await loadChats(); }
  sb.channel('msgs-live').on('postgres_changes', {event:'INSERT', schema:'public', table:'messages'}, () => { if(msKey) loadMsgs(); }).subscribe();
})();
