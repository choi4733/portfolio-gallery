const introVideo = document.querySelector("#introVideo");
const nav = document.querySelector("#nav");
const artwork = document.querySelector(".artwork");
const navLinks = document.querySelectorAll("#nav a");
const menuToggle = document.querySelector(".menu_toggle");

let lastScrollY = 0;
let isAutoScrolling = false;

/* intro */
function playIntroVideo() {
  if (!introVideo) return;

  nav?.classList.remove("show");
  introVideo.classList.add("show");

  introVideo.play().catch((err) => {
    console.log("video autoplay error:", err);
  });
}

window.addEventListener("load", () => {
  setTimeout(playIntroVideo, 500);
});

if (introVideo && artwork) {
  introVideo.addEventListener("ended", () => {
    if (window.scrollY > 100) {
      nav?.classList.add("show");
      activeNav();
      return;
    }

    isAutoScrolling = true;

    window.scrollTo({
      top: artwork.offsetTop,
      behavior: "smooth",
    });

    setTimeout(() => {
      isAutoScrolling = false;
      nav?.classList.add("show");
      activeNav();
    }, 1200);
  });
}

/* nav active */
function activeNav() {
  let currentId = "";

  navLinks.forEach((link) => {
    const targetId = link.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    link.parentElement.classList.remove("active");

    if (!targetSection) return;

    const rect = targetSection.getBoundingClientRect();

    if (
      rect.top <= window.innerHeight / 2 &&
      rect.bottom >= window.innerHeight / 2
    ) {
      currentId = targetId;
    }
  });

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentId) {
      link.parentElement.classList.add("active");
    }
  });
}

function closeMobileMenu() {
  menuToggle?.classList.remove("active");
  nav?.classList.remove("show_menu");
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => {
      item.parentElement.classList.remove("active");
    });

    link.parentElement.classList.add("active");
    closeMobileMenu();
  });
});

window.addEventListener("load", activeNav);
window.addEventListener("scroll", activeNav);

/* nav show / hide */
window.addEventListener("scroll", () => {
  if (!nav || isAutoScrolling) return;

  const currentScrollY = window.scrollY;

  if (currentScrollY < 100) {
    nav.classList.remove("show");
    lastScrollY = currentScrollY;
    return;
  }

  if (currentScrollY > lastScrollY) {
    nav.classList.remove("show");
  } else {
    nav.classList.add("show");
  }

  lastScrollY = currentScrollY;
});

/* mobile menu */
menuToggle?.addEventListener("click", () => {
  menuToggle.classList.toggle("active");
  nav?.classList.toggle("show_menu");
});

document.addEventListener("click", (e) => {
  const isNav = nav?.contains(e.target);
  const isToggle = menuToggle?.contains(e.target);

  if (!isNav && !isToggle) {
    closeMobileMenu();
  }
});

/* cursor */
const cursor = document.querySelector(".cursor");
const circle1 = document.querySelector(".circle1");
const circle2 = document.querySelector(".circle2");
const circle3 = document.querySelector(".circle3");

let mouseX = 0;
let mouseY = 0;

let c1X = 0;
let c1Y = 0;
let c2X = 0;
let c2Y = 0;
let c3X = 0;
let c3Y = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function cursorAnimation() {
  if (!circle1 || !circle2 || !circle3) return;

  c1X += (mouseX - c1X) * 0.35;
  c1Y += (mouseY - c1Y) * 0.35;

  c2X += (mouseX - c2X) * 0.18;
  c2Y += (mouseY - c2Y) * 0.18;

  c3X += (mouseX - c3X) * 0.1;
  c3Y += (mouseY - c3Y) * 0.1;

  circle1.style.transform = `translate(${c1X - 20}px, ${c1Y - 20}px)`;
  circle2.style.transform = `translate(${c2X - 20}px, ${c2Y - 20}px)`;
  circle3.style.transform = `translate(${c3X - 10}px, ${c3Y - 10}px)`;

  requestAnimationFrame(cursorAnimation);
}

cursorAnimation();

document
  .querySelectorAll("a, button, #nav li, video, img")
  .forEach((target) => {
    target.addEventListener("mouseenter", () => {
      if (target.closest(".intro")) return;
      if (target.closest(".art_inner")) return;

      cursor?.classList.add("hover");
    });

    target.addEventListener("mouseleave", () => {
      cursor?.classList.remove("hover");
    });
  });

/* gsap animation */
if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray(".portfolio_section").forEach((section) => {
    const titleBox = section.querySelector(".section_title_box");

    if (!titleBox) return;

    gsap.fromTo(
      titleBox,
      {
        opacity: 0,
        y: 80,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",

        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      },
    );
  });

  gsap.fromTo(
    ".art_inner img",
    {
      opacity: 0,
      y: 80,
    },
    {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out",

      scrollTrigger: {
        trigger: ".artwork",
        start: "top 60%",
        toggleActions: "play none none reverse",
      },
    },
  );
}

/* illustrator 480 이하 modal */
const artImages = document.querySelectorAll(
  ".art_inner .art_color, .art_inner .art_line",
);

const artModal = document.querySelector(".art_modal");
const artModalImg = document.querySelector(".art_modal img");
const artClose = document.querySelector(".art_close");

function closeArtModal() {
  if (!artModal || !artModalImg) return;

  artModal.classList.remove("show");

  artModalImg.classList.remove("line_bg");
  artModalImg.src = "";
  artModalImg.alt = "";

  document.body.style.overflow = "";
}

artImages.forEach((img) => {
  img.addEventListener("click", () => {
    if (window.innerWidth > 480) return;
    if (!artModal || !artModalImg) return;

    artModalImg.src = img.src;
    artModalImg.alt = img.alt || "";

    if (img.classList.contains("art_line")) {
      artModalImg.classList.add("line_bg");
    } else {
      artModalImg.classList.remove("line_bg");
    }

    artModal.classList.add("show");
    document.body.style.overflow = "hidden";
  });
});

artClose?.addEventListener("click", closeArtModal);

artModal?.addEventListener("click", (e) => {
  if (e.target === artModal) {
    closeArtModal();
  }
});

/* photoshop preview / modal */
const bannerImages = document.querySelectorAll(
  ".banner_l > img, .banner_r img",
);
const eventPreview = document.querySelector(".event_preview");
const eventModal = document.querySelector(".event_modal");
const eventModalImg = document.querySelector(".event_modal_inner img");
const eventClose = document.querySelector(".event_close");

bannerImages.forEach((img) => {
  img.addEventListener("mouseenter", () => {
    if (!eventPreview) return;

    const previewImg = eventPreview.querySelector("img");

    previewImg.src = img.src;
    previewImg.alt = img.alt;

    eventPreview.classList.add("show");
  });

  img.addEventListener("mousemove", (e) => {
    if (!eventPreview) return;

    eventPreview.style.left = e.clientX + 24 + "px";
    eventPreview.style.top = e.clientY + 24 + "px";
  });

  img.addEventListener("mouseleave", () => {
    eventPreview?.classList.remove("show");
  });

  img.addEventListener("click", () => {
    if (!eventModal || !eventModalImg) return;

    eventModalImg.src = img.src;
    eventModalImg.alt = img.alt;

    eventModal.classList.add("show");
    eventPreview?.classList.remove("show");

    document.body.style.overflow = "hidden";
  });
});

function closeEventModal() {
  eventModal?.classList.remove("show");
  document.body.style.overflow = "";
}

eventClose?.addEventListener("click", closeEventModal);

eventModal?.addEventListener("click", (e) => {
  if (e.target === eventModal) {
    closeEventModal();
  }
});

/* banner horizontal scroll */
const bannerInner = document.querySelector(".banner_inner");

if (bannerInner) {
  bannerInner.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      bannerInner.scrollLeft += e.deltaY;
    },
    { passive: false },
  );

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  bannerInner.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - bannerInner.offsetLeft;
    scrollLeft = bannerInner.scrollLeft;
  });

  bannerInner.addEventListener("mouseleave", () => {
    isDown = false;
  });

  bannerInner.addEventListener("mouseup", () => {
    isDown = false;
  });

  bannerInner.addEventListener("mousemove", (e) => {
    if (!isDown) return;

    e.preventDefault();

    const x = e.pageX - bannerInner.offsetLeft;
    const walk = (x - startX) * 1.5;

    bannerInner.scrollLeft = scrollLeft - walk;
  });
}

/* After Effects Swiper */
const afterSwiperEl = document.querySelector(".afterSwiper");

if (afterSwiperEl && typeof Swiper !== "undefined") {
  const pagination = document.createElement("div");
  pagination.className = "swiper-pagination";
  afterSwiperEl.appendChild(pagination);

  new Swiper(".afterSwiper", {
    slidesPerView: 3,
    spaceBetween: 10,
    loop: false,
    rewind: true,
    speed: 800,
    observer: true,
    observeParents: true,

    pagination: {
      el: ".afterSwiper .swiper-pagination",
      clickable: true,
    },

    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      600: {
        slidesPerView: 2,
      },
      900: {
        slidesPerView: 3,
      },
    },
  });
}

/* after modal */
const afterSlides = document.querySelectorAll(".after_slide");
const afterModal = document.querySelector(".after_modal");
const afterModalVideo = document.querySelector(".after_modal_inner video");
const afterClose = document.querySelector(".after_close");

afterSlides.forEach((slide) => {
  slide.addEventListener("click", () => {
    const thumb = slide.querySelector(".after_thumb");

    if (!thumb || !afterModal || !afterModalVideo) return;

    const videoSrc = thumb.dataset.video;

    if (!videoSrc) return;

    afterModalVideo.src = videoSrc;
    afterModal.classList.add("show");
    document.body.style.overflow = "hidden";

    afterModalVideo.currentTime = 0;
    afterModalVideo.play().catch(() => {});
  });
});

function closeAfterModal() {
  if (!afterModal || !afterModalVideo) return;

  afterModal.classList.remove("show");
  afterModalVideo.pause();
  afterModalVideo.removeAttribute("src");
  afterModalVideo.load();

  document.body.style.overflow = "";
}

afterClose?.addEventListener("click", closeAfterModal);

afterModal?.addEventListener("click", (e) => {
  if (e.target === afterModal) {
    closeAfterModal();
  }
});

/* premiere modal */
const premiereTriggers = document.querySelectorAll(
  ".premiere_thumb[data-video], .premiere_btn[data-video]",
);
const premiereModal = document.querySelector(".premiere_modal");
const premiereIframe = document.querySelector(".premiere_modal iframe");
const premiereClose = document.querySelector(".premiere_close");

function closePremiereModal() {
  if (!premiereModal || !premiereIframe) return;

  premiereModal.classList.remove("active");
  premiereIframe.src = "";
  document.body.style.overflow = "";
}

premiereTriggers.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();

    if (!premiereModal || !premiereIframe) return;

    const videoUrl = item.dataset.video;

    if (!videoUrl) return;

    premiereIframe.src = videoUrl;
    premiereModal.classList.add("active");
    document.body.style.overflow = "hidden";
  });
});

premiereClose?.addEventListener("click", closePremiereModal);

premiereModal?.addEventListener("click", (e) => {
  if (e.target === premiereModal) {
    closePremiereModal();
  }
});

/* top button */
const topBtn = document.querySelector(".top_btn");

if (topBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      topBtn.classList.add("show");
    } else {
      topBtn.classList.remove("show");
    }
  });

  topBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

/* escape close */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePremiereModal();
    closeEventModal();
    closeAfterModal();
    closeArtModal();
    closeMobileMenu();
  }
});
