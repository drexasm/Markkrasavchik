(function () {
  /** Горячие клавиши и справка по сочетаниям (e.code — не зависит от раскладки) */
  const ROUTES = {
    Digit1: "index.html",
    Digit2: "films.html",
    Digit3: "series.html",
    Digit4: "my-list.html",
  };

  const SHORTCUTS = [
    { keys: "Ctrl / ⌘ + K", action: "Открыть или закрыть поиск" },
    { keys: "/", action: "Быстрый фокус на поиск" },
    { keys: "?", action: "Показать эту подсказку" },
    { keys: "1 – 4", action: "Переход: главная, фильмы, сериалы, мой список" },
    { keys: "G", action: "Сгенерировать подборку (только главная)" },
    { keys: "Esc", action: "Закрыть модальные окна" },
  ];

  let panel = null;

  function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
  }

  function hasModifiers(e) {
    return e.metaKey || e.ctrlKey || e.altKey;
  }

  function buildHelpModal() {
    const root = document.createElement("div");
    root.id = "hotkeys-modal";
    root.className = "hotkeys-modal";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML =
      '<div class="hotkeys-modal__backdrop" data-close-hotkeys tabindex="-1"></div>' +
      '<div class="hotkeys-modal__panel" role="dialog" aria-modal="true" aria-labelledby="hotkeys-modal-title">' +
      '<header class="hotkeys-modal__header">' +
      '<h2 id="hotkeys-modal-title">Горячие клавиши</h2>' +
      '<button type="button" class="hotkeys-modal__close" data-close-hotkeys aria-label="Закрыть">×</button>' +
      "</header>" +
      '<ul class="hotkeys-modal__list" id="hotkeys-modal-list"></ul>' +
      '<p class="hotkeys-modal__hint">Работают при любой раскладке — по физическим клавишам, как на QWERTY</p>' +
      "</div>";
    document.body.appendChild(root);

    const list = root.querySelector("#hotkeys-modal-list");
    SHORTCUTS.forEach(function (item) {
      const li = document.createElement("li");
      li.innerHTML =
        "<kbd>" + item.keys + "</kbd><span>" + item.action + "</span>";
      list.appendChild(li);
    });

    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-hotkeys]")) closeHelp();
    });

    return root;
  }

  function isHelpOpen() {
    return panel && panel.classList.contains("hotkeys-modal--open");
  }

  function openHelp() {
    if (!panel) panel = buildHelpModal();
    panel.classList.add("hotkeys-modal--open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("hotkeys-modal-open");
    panel.querySelector(".hotkeys-modal__close").focus();
  }

  function closeHelp() {
    if (!panel) return;
    panel.classList.remove("hotkeys-modal--open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("hotkeys-modal-open");
  }

  function openSearch() {
    const btn = document.querySelector(".search-pill, .search-icon-btn");
    if (btn) btn.click();
  }

  function triggerGenerate() {
    const btn = document.getElementById("btn-generate-recs");
    if (btn && !btn.disabled) btn.click();
  }

  function goToPage(file) {
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith(file.toLowerCase())) return;
    const link = document.querySelector('a[href="' + file + '"]');
    if (link) {
      link.click();
      return;
    }
    window.location.href = file;
  }

  document.querySelectorAll(".hotkeys-pill").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (isHelpOpen()) closeHelp();
      else openHelp();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (isTypingTarget(e.target)) {
      if (e.code === "Escape" && isHelpOpen()) {
        e.preventDefault();
        closeHelp();
      }
      return;
    }

    if (e.code === "Slash" && e.shiftKey && !hasModifiers(e)) {
      e.preventDefault();
      if (isHelpOpen()) closeHelp();
      else openHelp();
      return;
    }

    if (e.code === "Slash" && !e.shiftKey && !hasModifiers(e)) {
      e.preventDefault();
      openSearch();
      return;
    }

    if (ROUTES[e.code] && !hasModifiers(e)) {
      e.preventDefault();
      goToPage(ROUTES[e.code]);
      return;
    }

    if (e.code === "KeyG" && !hasModifiers(e)) {
      e.preventDefault();
      triggerGenerate();
      return;
    }

    if (e.code === "Escape" && isHelpOpen()) {
      e.preventDefault();
      closeHelp();
    }
  });
})();
