/* Reveal navigation on upward scroll; ignore tiny scroll movements. */
(() => {
  const header = document.querySelector(".sidebar");
  if (!header) return;
  const body = document.body;
  const mobile = window.matchMedia("(max-width: 768px)");
  let previousY = Math.max(0, window.scrollY);
  let distance = 0;
  let direction = 0;
  let scheduled = false;
  const show = () => body.classList.remove("nav_hidden");

  function update() {
    scheduled = false;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const y = Math.max(0, Math.min(window.scrollY, maxY));
    const delta = y - previousY;
    previousY = y;
    const focus = document.activeElement;
    const interacting = header.classList.contains("is_menu_open") ||
      header.contains(focus) ||
      focus?.closest(".sidebar_toggle, .mobile_masthead");
    if (y < 80 || interacting) {
      show();
      distance = 0;
      return;
    }
    if (!delta) return;
    const nextDirection = Math.sign(delta);
    if (nextDirection !== direction) distance = 0;
    direction = nextDirection;
    distance += Math.abs(delta);
    if (distance >= 10) {
      body.classList.toggle("nav_hidden", direction > 0);
      distance = 0;
    }
  }
  window.addEventListener("scroll", () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  document.addEventListener("focusin", event => {
    if (event.target.closest(".sidebar, .sidebar_toggle, .mobile_masthead")) show();
  });
  mobile.addEventListener("change", () => {
    show();
    previousY = Math.max(0, window.scrollY);
    distance = 0;
  });
})();
