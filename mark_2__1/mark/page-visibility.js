(function () {
  /** Пауза hero-видео, когда вкладка неактивна (Page Visibility API) */
  const heroVideo = document.querySelector(".hero-bg__video");
  if (!heroVideo) return;

  let wasPlaying = false;

  function setHiddenState(hidden) {
    document.documentElement.classList.toggle("is-tab-hidden", hidden);

    if (hidden) {
      wasPlaying = !heroVideo.paused;
      heroVideo.pause();
      return;
    }

    if (wasPlaying) {
      heroVideo.play().catch(function () {
        /* автоплей может быть заблокирован браузером */
      });
    }
  }

  document.addEventListener("visibilitychange", function () {
    setHiddenState(document.hidden);
  });

  setHiddenState(document.hidden);
})();
