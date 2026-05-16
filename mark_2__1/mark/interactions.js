(function () {
  /** Скролл и мягкое свечение фона (hero/видео не трогаем) */
  const SCROLL_THRESHOLD = 28;
  const REVEAL_OFFSET = 0.88;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initCursorGlow() {
    if (prefersReducedMotion()) return;

    const glow = document.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    document.body.prepend(glow);

    let overHero = false;

    function setPosition(clientX, clientY) {
      document.documentElement.style.setProperty("--cursor-x", clientX + "px");
      document.documentElement.style.setProperty("--cursor-y", clientY + "px");
    }

    document.addEventListener(
      "mousemove",
      function (e) {
        setPosition(e.clientX, e.clientY);
        document.body.classList.add("is-cursor-active");

        const hero = document.querySelector(".hero");
        if (hero) {
          const rect = hero.getBoundingClientRect();
          const inside =
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom;
          if (inside !== overHero) {
            overHero = inside;
            document.body.classList.toggle("is-cursor-over-hero", overHero);
          }
        }
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseleave",
      function () {
        document.body.classList.remove("is-cursor-active", "is-cursor-over-hero");
        overHero = false;
      },
      { passive: true }
    );
  }

  function initScroll() {
    const revealTargets = document.querySelectorAll(
      ".section, .films-listing, .series-listing"
    );

    let ticking = false;

    function updateScroll() {
      ticking = false;
      const scrollY = window.scrollY;
      const doc = document.documentElement;

      doc.classList.toggle("is-scrolled", scrollY > SCROLL_THRESHOLD);
      doc.style.setProperty("--scroll-y", scrollY + "px");

      const maxScroll = doc.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(1, scrollY / maxScroll) : 0;
      doc.style.setProperty("--scroll-progress", String(progress));

      if (prefersReducedMotion()) return;

      const triggerLine = window.innerHeight * REVEAL_OFFSET;
      revealTargets.forEach(function (el) {
        const top = el.getBoundingClientRect().top;
        if (top < triggerLine) {
          el.classList.add("is-scroll-revealed");
        }
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initCursorGlow();
      initScroll();
    });
  } else {
    initCursorGlow();
    initScroll();
  }
})();
