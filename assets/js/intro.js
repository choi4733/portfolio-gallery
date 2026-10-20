(() => {
 const section = document.querySelector('.immersive');
 if (!section) return;
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const gallery = section.querySelector('.orbit_gallery');
 const chapter = section.querySelector('.space_chapter');
 const clamp = n => Math.max(0, Math.min(1,n));
 let pending = false;
 function update() {
  pending = false;
  const rect = section.getBoundingClientRect();
  const p = reduced.matches ? 0 : clamp(-rect.top / Math.max(1,section.offsetHeight-innerHeight));
  const reveal = clamp((p-.25)/.35);
  section.style.setProperty('--travel',p);
  section.style.setProperty('--hero-alpha',1-clamp(p/.32));
  section.style.setProperty('--gallery-alpha',reveal);
  section.style.setProperty('--gallery-offset',`${(1-reveal)*90}px`);
  section.style.setProperty('--bg-scale',1+p*.12);
  section.style.setProperty('--bg-x',`${p*innerWidth*.045}px`);
  section.style.setProperty('--bg-y',`${p*innerHeight*.09}px`);
  const visible = reduced.matches || reveal > .65;
  gallery.classList.toggle('is_visible',visible);
  gallery.inert = !visible;
  chapter.textContent = p>.4 ? '02 / EXPLORE MY ORBIT' : '01 / INTRO';
  document.body.classList.toggle('intro_active', rect.bottom>0 && rect.top<=0);
 }
 function schedule() { if(!pending){pending=true;requestAnimationFrame(update);} }
 section.querySelector('.explore_orbit').addEventListener('click',e=>{
  if(reduced.matches) return;
  e.preventDefault();
  window.scrollTo({top:scrollY+section.getBoundingClientRect().top+(section.offsetHeight-innerHeight)*.68,behavior:'smooth'});
 });
 section.addEventListener('pointermove',e=>{
  if(reduced.matches || !matchMedia('(pointer:fine)').matches)return;
  section.style.setProperty('--pointer-x',`${(e.clientX/innerWidth-.5)*10}px`);
  section.style.setProperty('--pointer-y',`${(e.clientY/innerHeight-.5)*8}px`);
 });
 section.addEventListener('pointerleave',()=>{section.style.setProperty('--pointer-x','0px');section.style.setProperty('--pointer-y','0px');});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);schedule();
 const preview=section.querySelector('.orbit_preview');
 if(preview){
  const card=preview.closest('.orbit_card');let hovering=false;
  function stop(){preview.pause();card.classList.remove('is_playing');}
  function play(){
   if(reduced.matches||gallery.inert||document.hidden)return;
   const attempt=preview.play();
   if(attempt)attempt.then(()=>{if(reduced.matches||gallery.inert||document.hidden||(!hovering&&!card.contains(document.activeElement))){stop();return;}card.classList.add('is_playing');}).catch(()=>stop());
  }
  card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovering=true;play();}});
  card.addEventListener('pointerleave',()=>{hovering=false;stop();});
  card.addEventListener('focusin',play);card.addEventListener('focusout',stop);
  addEventListener('scroll',()=>{if(gallery.inert)stop();},{passive:true});
  reduced.addEventListener('change',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 }
})();
