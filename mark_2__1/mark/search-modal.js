(function () {
  const ASSETS = {
    search: "https://www.figma.com/api/mcp/asset/901f0686-01ad-4cff-8e29-c2deb82114d8",
    close: "https://www.figma.com/api/mcp/asset/bcd83289-c016-40af-a47a-ad99305bca67",
    searchLarge: "https://www.figma.com/api/mcp/asset/d31089ba-4f1a-48a6-919b-7220f9f6f260",
  };

  function buildModal() {
    const root = document.createElement("div");
    root.id = "search-modal";
    root.className = "search-modal";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="search-modal__backdrop" data-close-search tabindex="-1"></div>' +
      '<div class="search-modal__panel" role="dialog" aria-modal="true" aria-labelledby="search-modal-input">' +
      '<div class="search-modal__header">' +
      '<img class="search-modal__header-icon" src="' +
      ASSETS.search +
      '" alt="" width="24" height="24">' +
      '<input type="search" id="search-modal-input" class="search-modal__input" placeholder="Поиск фильмов и сериалов..." autocomplete="off" />' +
      '<button type="button" class="search-modal__close" aria-label="Закрыть" data-close-search>' +
      '<img src="' +
      ASSETS.close +
      '" alt="" width="20" height="20">' +
      "</button></div>" +
      '<div class="search-modal__body" id="search-modal-body">' +
      '<img class="search-modal__body-icon" src="' +
      ASSETS.searchLarge +
      '" alt="" width="48" height="48">' +
      '<p class="search-modal__hint">Начните вводить для поиска</p>' +
      "</div></div>";
    document.body.appendChild(root);
    return root;
  }

  const modal = buildModal();
  const panel = modal.querySelector(".search-modal__panel");
  const input = modal.querySelector("#search-modal-input");
  const bodyEmpty = modal.querySelector("#search-modal-body");
  let lastFocus = null;

  function isOpen() {
    return modal.classList.contains("search-modal--open");
  }

  function syncEmptyState() {
    bodyEmpty.classList.toggle("is-muted", input.value.trim().length > 0);
  }

  function open(fromEl) {
    lastFocus = fromEl && typeof fromEl.focus === "function" ? fromEl : null;
    modal.classList.add("search-modal--open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("search-modal-open");
    input.value = "";
    syncEmptyState();
    window.requestAnimationFrame(function () {
      input.focus();
    });
  }

  function close() {
    modal.classList.remove("search-modal--open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("search-modal-open");
    input.value = "";
    syncEmptyState();
    if (lastFocus && document.body.contains(lastFocus)) {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  document.querySelectorAll(".search-pill, .search-icon-btn").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      if (isOpen()) {
        close();
      } else {
        open(btn);
      }
    });
  });

  input.addEventListener("input", syncEmptyState);

  modal.addEventListener("click", function (e) {
    if (e.target.closest("[data-close-search]")) {
      close();
    }
  });

  panel.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.code === "KeyK") {
      e.preventDefault();
      if (isOpen()) {
        close();
      } else {
        var t = document.querySelector(".search-pill, .search-icon-btn");
        open(t || null);
      }
      return;
    }
    if (e.code === "Escape" && isOpen()) {
      e.preventDefault();
      close();
    }
  });
})();
