(function () {
  /** Верхний прогресс-бар при загрузке и переходах между страницами */
  const NAV_DURATION_MS = 520;

  const root = document.createElement("div");
  root.className = "page-progress";
  root.setAttribute("role", "progressbar");
  root.setAttribute("aria-valuemin", "0");
  root.setAttribute("aria-valuemax", "100");
  root.setAttribute("aria-valuenow", "0");
  root.setAttribute("aria-label", "Загрузка страницы");
  root.innerHTML = '<div class="page-progress__fill"></div>';
  document.body.prepend(root);

  const fill = root.querySelector(".page-progress__fill");
  let rafId = 0;
  let value = 0;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setValue(next) {
    value = Math.max(0, Math.min(100, next));
    fill.style.transform = "scaleX(" + value / 100 + ")";
    root.setAttribute("aria-valuenow", String(Math.round(value)));
    root.classList.toggle("is-active", value > 0 && value < 100);
    root.classList.toggle("is-complete", value >= 100);
  }

  function tick(target, speed) {
    cancelAnimationFrame(rafId);
    function step() {
      if (value < target) {
        const delta = Math.max(0.4, (target - value) * speed);
        setValue(value + delta);
      }
      if (value < target) {
        rafId = requestAnimationFrame(step);
      }
    }
    rafId = requestAnimationFrame(step);
  }

  function start() {
    root.classList.remove("is-hidden");
    setValue(0);
    tick(70, 0.06);
  }

  function finish() {
    tick(100, 0.14);
    window.setTimeout(function () {
      root.classList.add("is-hidden");
      setValue(0);
    }, prefersReducedMotion() ? 0 : 380);
  }

  function simulateInitialLoad() {
    if (prefersReducedMotion()) {
      setValue(0);
      return;
    }
    start();
    tick(88, 0.04);

    function onReady() {
      finish();
    }

    if (document.readyState === "complete") {
      window.setTimeout(onReady, 120);
    } else {
      window.addEventListener("load", onReady, { once: true });
    }
  }

  window.CineMatchProgress = { start: start, finish: finish };

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest("a[href]");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href || href === "#" || href.startsWith("#")) return;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

    try {
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const path = url.pathname.toLowerCase();
      if (!(path.endsWith(".html") || path.endsWith("/") || /\/index\.html?$/.test(path))) return;
    } catch {
      return;
    }

    if (prefersReducedMotion()) return;
    start();
    window.setTimeout(finish, NAV_DURATION_MS + 80);
  });

  simulateInitialLoad();
})();
