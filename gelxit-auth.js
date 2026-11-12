/* gelxit-auth.js — "Mostrar/Ocultar" contraseña y medidor de seguridad al crear cuenta. */
(function(){
'use strict';
document.addEventListener('click',e=>{
  const b=e.target.closest&&e.target.closest('.gx-eye');if(!b)return;
  const i=document.getElementById(b.dataset.for);if(!i)return;
  const show=i.type==='password';i.type=show?'text':'password';b.textContent=show?'Ocultar':'Mostrar';
});
const rp=document.getElementById('rp'),m=document.getElementById('gxmeter'),t=document.getElementById('gxmtxt');
if(rp&&m&&t){
  const L=['','Débil','Media','Buena','Fuerte'];
  rp.addEventListener('input',()=>{
    const v=rp.value;let s=0;
    if(v.length>=8)s++;
    if(/[a-z]/.test(v)&&/[A-Z]/.test(v))s++;
    if(/\d/.test(v))s++;
    if(/[^A-Za-z0-9]/.test(v)||v.length>=12)s++;
    if(!v)s=0;else if(v.length<8)s=Math.min(s,1);
    m.dataset.s=s;t.textContent=v?(v.length<8?'Seguridad: débil · mínimo 8 caracteres':'Seguridad: '+L[s].toLowerCase()):'';
  });
}
})();
