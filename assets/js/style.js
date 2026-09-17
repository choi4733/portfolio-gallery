/* 콘텐츠 등장 효과 */
function initScrollReveal() {
  const items = document.querySelectorAll(".scroll_reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (
    !items.length ||
    !("IntersectionObserver" in window) ||
    reduceMotion.matches
  ) {
    items.forEach((item) => item.classList.remove("is_pending"));
    return;
  }

  // 화면 밖에 있는지 확인
  function isOutside(rect) {
    return rect.bottom <= 0 || rect.top >= window.innerHeight;
  }

  // 처음부터 보이는 콘텐츠는 그대로 표시
  items.forEach((item) => {
    item.classList.toggle(
      "is_pending",
      isOutside(item.getBoundingClientRect()),
    );
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("is_pending");
      } else if (isOutside(entry.boundingClientRect)) {
        // 완전히 화면 밖으로 나가면 다시 등장 준비
        entry.target.classList.add("is_pending");
      }
    });
  });

  // 초기 상태를 적용한 뒤 애니메이션 시작
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      items.forEach((item) => {
        item.classList.add("reveal_ready");
        observer.observe(item);
      });
    });
  });
}

/* 이벤트 페이지 모달 */
function initEventModal() {
  const openButtons = document.querySelectorAll("#openEvent, #viewEvent");
  const modal = document.querySelector("#eventModal");
  const closeButton = document.querySelector("#closeEvent");

  if (!openButtons.length || !modal || !closeButton) return;

  let previousOverflow = "";

  // 이미지 또는 전체보기 버튼 클릭 → 모달 열기
  openButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (modal.open) return;

      previousOverflow = document.documentElement.style.overflow;

      modal.showModal();
      modal.scrollTop = 0;

      // 뒤쪽 페이지 스크롤 잠금
      document.documentElement.style.overflow = "hidden";
    });
  });

  closeButton.addEventListener("click", () => {
    modal.close();
  });

  modal.addEventListener("close", () => {
    document.documentElement.style.overflow = previousOverflow;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEventModal, {
    once: true,
  });
} else {
  initEventModal();
}

/* 모바일 왼쪽 슬라이드 메뉴 */
function initMobileMenu() {
  const sidebar = document.querySelector(".sidebar");

  if (!sidebar || document.querySelector(".sidebar_toggle")) return;

  const mobile = window.matchMedia("(max-width: 768px)");
  const root = document.documentElement;
  const page = [
    document.querySelector(".main_content"),
    document.querySelector("#footer"),
  ].filter(Boolean);

  if (!sidebar.id) sidebar.id = "portfolioSidebar";

  // 사이드바 밖에 버튼을 만들어 닫혀 있어도 보이게 함
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sidebar_toggle";
  button.setAttribute("aria-controls", sidebar.id);
  button.innerHTML = `
    <svg
      class="sidebar_toggle_open"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>

    <svg
      class="sidebar_toggle_close"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  `;

  const backdrop = document.createElement("div");
  backdrop.className = "sidebar_backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  sidebar.before(button, backdrop);

  let isOpen = false;
  let previousOverflow = "";
  let previousInert = [];

  // 메뉴 상태 변경
  function setMenuOpen(open, returnFocus = false) {
    const nextOpen = mobile.matches && open;

    if (nextOpen && !isOpen) {
      previousOverflow = root.style.overflow;
      previousInert = page.map((element) => element.inert);

      root.style.overflow = "hidden";

      page.forEach((element) => {
        element.inert = true;
      });
    }

    if (!nextOpen && isOpen) {
      root.style.overflow = previousOverflow;

      page.forEach((element, index) => {
        element.inert = previousInert[index];
      });
    }

    // 사이드바를 숨기기 전에 포커스 이동
    if (!nextOpen && mobile.matches) {
      if (returnFocus || sidebar.contains(document.activeElement)) {
        button.focus({ preventScroll: true });
      }
    }

    isOpen = nextOpen;

    sidebar.classList.toggle("is_menu_open", isOpen);
    backdrop.classList.toggle("is_visible", isOpen);

    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "메뉴 닫기" : "메뉴 열기");

    // 닫힌 메뉴의 링크는 키보드로도 선택되지 않도록 설정
    sidebar.inert = mobile.matches && !isOpen;
  }

  // 버튼으로 열기·닫기
  button.addEventListener("click", () => {
    setMenuOpen(!isOpen);
  });

  // 바깥 배경을 누르면 닫기
  backdrop.addEventListener("click", () => {
    setMenuOpen(false, true);
  });

  // 메뉴 항목 선택 시 닫기
  // 링크의 기본 이동 기능은 그대로 유지
  sidebar.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!mobile.matches || !link) return;

    setMenuOpen(false, true);
  });

  // 키보드 조작
  document.addEventListener("keydown", (event) => {
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      setMenuOpen(false, true);
      return;
    }

    if (event.key !== "Tab") return;

    // 열린 메뉴와 닫기 버튼 안에서 Tab 이동
    const controls = [button, ...sidebar.querySelectorAll("a[href]")].filter(
      (element) => element.getClientRects().length > 0,
    );

    const first = controls[0];
    const last = controls[controls.length - 1];
    const active = document.activeElement;
    const isOutside = !controls.includes(active);

    if (event.shiftKey && (active === first || isOutside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || isOutside)) {
      event.preventDefault();
      first.focus();
    }
  });

  // PC ↔ 모바일 전환 시 메뉴·스크롤 잠금 초기화
  function syncLayout() {
    const wasButtonFocused = document.activeElement === button;

    setMenuOpen(false);

    if (!mobile.matches && wasButtonFocused) {
      sidebar.querySelector("a[href]")?.focus({
        preventScroll: true,
      });
    }
  }

  syncLayout();
  mobile.addEventListener("change", syncLayout);
}

/* 페이지 준비 후 한 번에 실행 */
function initPortfolio() {
  initMobileMenu();
  initScrollReveal();
  initActiveMenu();
  initTopButton();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPortfolio, {
    once: true,
  });
} else {
  initPortfolio();
}
/* 현재 보고 있는 섹션의 메뉴 활성화 */
function initActiveMenu() {
  const links = [...document.querySelectorAll('.sidebar_menu a[href^="#"]')];

  const items = links
    .map((link) => ({
      link,
      section: document.getElementById(link.getAttribute("href").slice(1)),
    }))
    .filter((item) => item.section);

  if (!items.length) return;

  let frameId = null;

  function updateActiveMenu() {
    frameId = null;

    // 화면 위쪽 기준선을 통과한 섹션을 현재 섹션으로 선택
    const referenceLine = Math.min(window.innerHeight * 0.25, 160);
    let current = items[0];

    items.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= referenceLine) {
        current = item;
      }
    });

    // 페이지 끝에서는 마지막 섹션 활성화
    const root = document.documentElement;
    const atBottom =
      window.scrollY + window.innerHeight >= root.scrollHeight - 2;

    if (atBottom && root.scrollHeight > window.innerHeight) {
      current = items[items.length - 1];
    }

    items.forEach(({ link }) => {
      const active = link === current.link;

      link.classList.toggle("is_active", active);

      if (active) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // 스크롤 이벤트가 반복되어도 한 프레임에 한 번만 계산
  function scheduleUpdate() {
    if (frameId !== null) return;

    frameId = requestAnimationFrame(updateActiveMenu);
  }

  window.addEventListener("scroll", scheduleUpdate, {
    passive: true,
  });

  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate, { once: true });
  window.addEventListener("hashchange", scheduleUpdate);

  // 이미지 로딩 등으로 섹션 높이가 바뀌어도 다시 계산
  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(scheduleUpdate);

    const main = document.querySelector(".main_content");
    if (main) observer.observe(main);
  }

  updateActiveMenu();
}

/* 마우스 원형 잔상 효과 */
(() => {
  function initCursorTrail() {
    if (document.querySelector(".cursor_ring")) return;

    const enabled = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    // 앞쪽 원일수록 빠르고 선명하게
    const settings = [
      { speed: 0.3, opacity: 0.75 },
      { speed: 0.2, opacity: 0.5 },
      { speed: 0.14, opacity: 0.3 },
    ];

    const rings = settings.map(({ speed, opacity }) => {
      const element = document.createElement("div");

      element.className = "cursor_ring";
      element.setAttribute("aria-hidden", "true");
      element.style.setProperty("--ring-opacity", opacity);
      document.body.append(element);

      return { element, speed, x: 0, y: 0 };
    });

    let mouseX = 0;
    let mouseY = 0;
    let visible = false;
    let frameId = null;
    let lastTime = 0;

    function draw(ring) {
      ring.element.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
    }

    function animate(time) {
      frameId = null;

      // 화면 주사율이 달라도 비슷한 속도로 움직이게 보정
      const delta = lastTime ? Math.min(time - lastTime, 50) : 16.67;
      lastTime = time;

      let moving = false;

      rings.forEach((ring) => {
        const ease = 1 - Math.pow(1 - ring.speed, delta / 16.67);

        ring.x += (mouseX - ring.x) * ease;
        ring.y += (mouseY - ring.y) * ease;

        if (Math.hypot(mouseX - ring.x, mouseY - ring.y) < 0.1) {
          ring.x = mouseX;
          ring.y = mouseY;
        } else {
          moving = true;
        }

        draw(ring);
      });

      // 원이 모두 모이면 계산 중지
      if (moving) {
        frameId = requestAnimationFrame(animate);
      }
    }

    function hideTrail() {
      visible = false;
      lastTime = 0;

      if (frameId !== null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }

      rings.forEach(({ element }) => {
        element.classList.remove("is_visible");
      });
    }

    document.addEventListener(
      "pointermove",
      (event) => {
        if (!enabled.matches || event.pointerType !== "mouse") {
          hideTrail();
          return;
        }

        mouseX = event.clientX;
        mouseY = event.clientY;

        // 첫 진입 시 화면 구석에서 날아오지 않도록 위치 맞춤
        if (!visible) {
          rings.forEach((ring) => {
            ring.x = mouseX;
            ring.y = mouseY;
            draw(ring);
            ring.element.classList.add("is_visible");
          });

          visible = true;
        }

        if (frameId === null) {
          lastTime = 0;
          frameId = requestAnimationFrame(animate);
        }
      },
      { passive: true },
    );

    // 화면을 벗어나거나 다른 창으로 이동하면 숨김
    document.documentElement.addEventListener("pointerleave", hideTrail);
    window.addEventListener("blur", hideTrail);
    enabled.addEventListener("change", hideTrail);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) hideTrail();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCursorTrail, {
      once: true,
    });
  } else {
    initCursorTrail();
  }
})();

/* Top 버튼 */
function initTopButton() {
  const topButton = document.querySelector(".top_btn");

  if (!topButton) return;

  function updateTopButton() {
    // 400px 이상 스크롤하면 표시
    topButton.classList.toggle("is_visible", window.scrollY > 400);
  }

  window.addEventListener("scroll", updateTopButton, {
    passive: true,
  });

  // 새로고침했을 때 현재 스크롤 위치 확인
  updateTopButton();
}
