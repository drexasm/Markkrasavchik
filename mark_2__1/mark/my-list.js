(function () {
  const STORAGE_KEY = "cinematch-my-list";

  function getList() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveList(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("mylist-updated"));
  }

  function slugify(title) {
    return title
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zа-яё0-9-]/gi, "");
  }

  function isSeriesYear(year) {
    return /–|—/.test(year) || (year.includes("-") && year.length > 5);
  }

  function extractCardData(card) {
    const titleEl = card.querySelector(".movie-card__title");
    const posterEl = card.querySelector(".movie-card__poster img");
    const metaSpans = card.querySelectorAll(".movie-card__meta span");
    const ratingEl = card.querySelector(".movie-card__rating");

    const title = titleEl?.textContent.trim() || "";
    const year = metaSpans[0]?.textContent.trim() || "";
    const genre = metaSpans[2]?.textContent.trim() || "";
    const rating = (ratingEl?.textContent || "").replace("★", "").trim();

    return {
      id: slugify(title),
      title,
      poster: posterEl?.src || "",
      year,
      genre,
      rating,
      type: isSeriesYear(year) ? "series" : "film",
    };
  }

  function isInList(id) {
    return getList().some((item) => item.id === id);
  }

  function toggleItem(data) {
    const list = getList();
    const index = list.findIndex((item) => item.id === data.id);
    if (index >= 0) {
      list.splice(index, 1);
    } else {
      list.push({ ...data, addedAt: Date.now() });
    }
    saveList(list);
    return index < 0;
  }

  function createAddButton(card, data) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "movie-card__add-btn";

    const updateState = () => {
      const added = isInList(data.id);
      btn.classList.toggle("is-added", added);
      btn.innerHTML = added
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 8.5 6.5 11 12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
      btn.setAttribute(
        "aria-label",
        added ? "Убрать из моего списка" : "Добавить в мой список"
      );
      btn.setAttribute("aria-pressed", added ? "true" : "false");
    };

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleItem(data);
      updateState();
      document.querySelectorAll(`.movie-card__add-btn[data-id="${data.id}"]`).forEach((other) => {
        if (other !== btn) {
          const added = isInList(data.id);
          other.classList.toggle("is-added", added);
          other.innerHTML = added
            ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 8.5 6.5 11 12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
          other.setAttribute(
            "aria-label",
            added ? "Убрать из моего списка" : "Добавить в мой список"
          );
          other.setAttribute("aria-pressed", added ? "true" : "false");
        }
      });
    });

    btn.dataset.id = data.id;
    updateState();
    return btn;
  }

  function initCardButtons() {
    document.querySelectorAll(".movie-card").forEach((card) => {
      if (card.closest(".mylist-grid")) return;

      const poster = card.querySelector(".movie-card__poster");
      if (!poster || poster.querySelector(".movie-card__add-btn")) return;

      const data = extractCardData(card);
      if (!data.title) return;

      poster.appendChild(createAddButton(card, data));
    });
  }

  function buildListCard(item) {
    const card = document.createElement("article");
    card.className = "movie-card";
    card.innerHTML =
      '<div class="movie-card__poster">' +
      `<img src="${item.poster}" alt="Постер: ${item.title}" width="228" height="342" />` +
      "</div>" +
      '<div class="movie-card__body">' +
      `<h3 class="movie-card__title">${item.title}</h3>` +
      '<div class="movie-card__meta">' +
      `<span>${item.year}</span><span>•</span><span>${item.genre}</span>` +
      "</div>" +
      `<div class="movie-card__rating"><span>★</span> ${item.rating}</div>` +
      `<span class="movie-card__type-badge">${item.type === "series" ? "Сериал" : "Фильм"}</span>` +
      "</div>";

    const poster = card.querySelector(".movie-card__poster");
    poster.appendChild(createAddButton(card, item));

    return card;
  }

  function renderMyListPage() {
    const empty = document.querySelector(".mylist-empty");
    let grid = document.querySelector(".mylist-grid");
    if (!empty) return;

    if (!grid) {
      grid = document.createElement("div");
      grid.className = "card-grid mylist-grid";
      grid.setAttribute("aria-label", "Сохранённый контент");
      empty.insertAdjacentElement("afterend", grid);
    }

    const list = getList().sort((a, b) => b.addedAt - a.addedAt);
    grid.innerHTML = "";

    if (list.length === 0) {
      empty.hidden = false;
      grid.hidden = true;
      return;
    }

    empty.hidden = true;
    grid.hidden = false;
    list.forEach((item) => grid.appendChild(buildListCard(item)));
  }

  function init() {
    initCardButtons();
    renderMyListPage();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("generate-complete", initCardButtons);
  window.addEventListener("mylist-updated", () => {
    document.querySelectorAll(".movie-card__add-btn").forEach((btn) => {
      const id = btn.dataset.id;
      if (!id) return;
      const added = isInList(id);
      btn.classList.toggle("is-added", added);
      btn.innerHTML = added
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 8.5 6.5 11 12 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
      btn.setAttribute(
        "aria-label",
        added ? "Убрать из моего списка" : "Добавить в мой список"
      );
      btn.setAttribute("aria-pressed", added ? "true" : "false");
    });
    renderMyListPage();
  });
})();
