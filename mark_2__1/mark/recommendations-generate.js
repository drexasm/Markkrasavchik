(function () {
  /** Имитация генерации персональной подборки на главной */
  const section = document.querySelector(".section-generate");
  if (!section) return;

  const btn = document.getElementById("btn-generate-recs");
  const progressWrap = section.querySelector(".generate-progress");
  const progressFill = section.querySelector(".generate-progress__fill");
  const progressLabel = section.querySelector(".generate-progress__label");
  const statusEl = section.querySelector(".generate-status");
  const grid = section.querySelector(".generate-results");

  if (!btn || !grid) return;

  const pool = [];

  function collectPool() {
    document.querySelectorAll(".movie-card").forEach(function (card) {
      if (card.closest(".section-generate")) return;
      const title = card.querySelector(".movie-card__title")?.textContent.trim();
      const poster = card.querySelector(".movie-card__poster img")?.src;
      const meta = card.querySelectorAll(".movie-card__meta span");
      const rating = (card.querySelector(".movie-card__rating")?.textContent || "")
        .replace("★", "")
        .trim();
      if (!title || !poster) return;
      pool.push({
        title: title,
        poster: poster,
        year: meta[0]?.textContent.trim() || "",
        genre: meta[2]?.textContent.trim() || "",
        rating: rating,
      });
    });
  }

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function buildCard(item) {
    const card = document.createElement("article");
    card.className = "movie-card generate-card";
    card.innerHTML =
      '<div class="movie-card__poster">' +
      '<img src="' +
      item.poster +
      '" alt="Постер: ' +
      item.title +
      '" width="228" height="342" />' +
      '<span class="generate-card__tag">AI</span>' +
      "</div>" +
      '<div class="movie-card__body">' +
      '<h3 class="movie-card__title">' +
      item.title +
      "</h3>" +
      '<div class="movie-card__meta"><span>' +
      item.year +
      '</span><span>•</span><span>' +
      item.genre +
      "</span></div>" +
      '<div class="movie-card__rating"><span>★</span> ' +
      item.rating +
      "</div></div>";
    return card;
  }

  function setProgress(percent, text) {
    if (progressFill) progressFill.style.width = percent + "%";
    if (progressLabel) progressLabel.textContent = text;
    if (progressWrap) progressWrap.hidden = percent <= 0;
  }

  function runGeneration() {
    if (pool.length === 0) collectPool();
    if (pool.length === 0) return;

    btn.disabled = true;
    section.classList.add("is-generating");
    grid.hidden = true;
    grid.innerHTML = "";
    if (statusEl) {
      statusEl.hidden = false;
      statusEl.textContent = "Анализируем ваши предпочтения…";
    }

    const steps = [
      { p: 18, t: "Собираем жанры…" },
      { p: 42, t: "Сопоставляем рейтинги…" },
      { p: 68, t: "Формируем подборку…" },
      { p: 92, t: "Почти готово…" },
    ];

    let stepIndex = 0;
    setProgress(8, steps[0].t);

    const timer = window.setInterval(function () {
      if (stepIndex < steps.length) {
        setProgress(steps[stepIndex].p, steps[stepIndex].t);
        if (statusEl) statusEl.textContent = steps[stepIndex].t;
        stepIndex += 1;
        return;
      }

      window.clearInterval(timer);
      setProgress(100, "Готово");

      const picks = shuffle(pool).slice(0, 4);
      picks.forEach(function (item, i) {
        const card = buildCard(item);
        card.style.animationDelay = i * 0.08 + "s";
        grid.appendChild(card);
      });

      grid.hidden = false;
      section.classList.remove("is-generating");
      section.classList.add("has-results");
      btn.disabled = false;
      btn.textContent = "Обновить подборку";

      if (statusEl) {
        statusEl.textContent = "Подборка обновлена — " + picks.length + " тайтла";
      }

      window.setTimeout(function () {
        setProgress(0, "");
        if (progressWrap) progressWrap.hidden = true;
      }, 600);

      window.dispatchEvent(new CustomEvent("generate-complete"));
    }, 420);
  }

  btn.addEventListener("click", runGeneration);
  collectPool();
})();
