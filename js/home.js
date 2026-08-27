(function () {
  var video = document.getElementById('hero-video');
  var control = document.getElementById('hero-control');
  if (!video || !control) return;

  function label(text) {
    control.querySelector('.hero__control-text').textContent = text;
  }

  // Video autoplays muted+looped by default (see home.html attributes).
  // The bottom-left control just lets the visitor pause / resume it.
  video.addEventListener('play', function () { label('Pause'); });
  video.addEventListener('pause', function () { label('Play'); });

  control.addEventListener('click', function () {
    if (video.paused) { video.play(); } else { video.pause(); }
  });

  // Belt-and-braces autoplay: some browsers only honor autoplay reliably
  // once `muted`/`playsInline` are also set as JS properties (not just
  // HTML attributes), and/or want play() called explicitly after the
  // source is ready. Retry a few times, then fall back to starting on the
  // visitor's first interaction (still silent — muted stays true).
  video.autoplay = true;
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;

  function tryPlay() {
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* left paused; control still works */ });
  }
  tryPlay();
  video.addEventListener('loadedmetadata', tryPlay);
  video.addEventListener('canplay', tryPlay);
  window.addEventListener('load', tryPlay);
  window.addEventListener('pageshow', tryPlay); // back/forward-cache restores
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && video.paused) tryPlay();
  });

  function playOnFirstInteraction() {
    if (video.paused) tryPlay();
  }
  ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach(function (evt) {
    window.addEventListener(evt, playOnFirstInteraction, { once: true, passive: true });
  });

  function showNoVideoFallback() {
    document.querySelector('.hero').classList.add('hero--no-video');
    control.style.display = 'none';
  }

  video.addEventListener('error', showNoVideoFallback, true);

  // Some browsers don't fire a bubbling 'error' event when every <source>
  // 404s (NETWORK_NO_SOURCE) — catch that case too.
  window.setTimeout(function () {
    if (video.error || (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE && video.readyState === 0)) {
      showNoVideoFallback();
    }
  }, 1200);
})();
