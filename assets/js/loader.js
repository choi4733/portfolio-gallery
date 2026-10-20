(() => {
 const root = document.documentElement;
 const overlay = document.querySelector('.portfolio_loader');
 if (!root.classList.contains('portfolio_loading')) { overlay?.remove(); return; }
 const start = performance.now();
 let finished = false;
 function reveal() {
  if (finished) return;
  finished = true;
  const delay = Math.max(0, 850 - (performance.now() - start));
  setTimeout(() => {
   root.classList.add('portfolio_revealing');
   try { sessionStorage.setItem('portfolio-intro-seen', '1'); } catch (_) {}
   setTimeout(() => {
    root.classList.remove('portfolio_loading', 'portfolio_revealing');
    overlay?.remove();
   }, 850);
  }, delay);
 }
 const image = new Image();
 image.onload = reveal;
 image.onerror = reveal;
 image.src = new URL('../img/space-earth.png', document.currentScript.src).href;
 if (image.complete) reveal();
 setTimeout(reveal, 1000);
})();