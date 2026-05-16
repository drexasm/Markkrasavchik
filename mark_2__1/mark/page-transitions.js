(function () {
  const DURATION_MS = 520;
  const ENTER_DELAY_MS = 60;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isInternalPageLink(anchor) {
    const href = anchor.getAttribute("href");
    if (!href || href === "#" || href.startsWith("#")) return false;
    if (anchor.target === "_blank" || anchor.hasAttribute("download")) return false;

    try {
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return false;
      const path = url.pathname.toLowerCase();
      return path.endsWith(".html") || path.endsWith("/") || /\/index\.html?$/.test(path);
    } catch {
      return false;
    }
  }

  function revealPage() {
    const root = document.documentElement;
    root.classList.remove("is-page-loading");
    root.classList.add("is-page-ready");
  }

  function navigateWithTransition(url) {
    if (prefersReducedMotion()) {
      window.location.href = url;
      return;
    }

    const root = document.documentElement;
    root.classList.remove("is-page-ready");
    root.classList.add("is-page-leaving");

    window.setTimeout(function () {
      window.location.href = url;
    }, DURATION_MS);
  }

  function initEnterTransition() {
    if (!document.documentElement.classList.contains("is-page-loading")) {
      document.documentElement.classList.add("is-page-ready");
      return;
    }

    if (prefersReducedMotion()) {
      revealPage();
      return;
    }

    window.setTimeout(revealPage, ENTER_DELAY_MS);
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest("a[href]");
    if (!anchor || !isInternalPageLink(anchor)) return;

    event.preventDefault();
    navigateWithTransition(anchor.href);
  });

  window.addEventListener("pageshow", function (event) {
    if (!event.persisted) return;
    document.documentElement.classList.remove("is-page-leaving");
    document.documentElement.classList.add("is-page-ready");
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initEnterTransition);
  } else {
    initEnterTransition();
  }
})();
