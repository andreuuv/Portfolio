(function () {
  var list = document.getElementById('film-list');
  var stage = document.getElementById('film-stage');
  var stageVideo = document.getElementById('film-stage-video');
  if (!list) return;

  // Small looping preview clip per list item (own <video>, not shared —
  // safe to give it a data-fallback-label, unlike the single reused stage
  // video below). Falls back to the static thumbnail image if a project
  // has no preview clip yet.
  function itemMedia(item) {
    if (item.preview) {
      var video = document.createElement('video');
      video.className = 'film-list__video';
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      video.preload = 'auto';
      video.poster = item.thumbnail;
      video.setAttribute('data-fallback-label', item.preview);
      var source = document.createElement('source');
      source.src = item.preview;
      source.type = 'video/mp4';
      video.appendChild(source);

      // Same belt-and-braces approach as the home hero video: a single
      // play() call right after creating the element is too early (nothing
      // buffered yet, preload="auto" only starts fetching then) and
      // autoplay support/timing varies enough across browsers that one
      // attempt isn't reliable. Retry on the events that mean "there's
      // enough data now" and on first user interaction as a last resort.
      function tryPlay() {
        var p = video.play();
        if (p && p.catch) p.catch(function () { /* still blocked; poster keeps showing */ });
      }
      tryPlay();
      video.addEventListener('loadedmetadata', tryPlay);
      video.addEventListener('loadeddata', tryPlay);
      video.addEventListener('canplay', tryPlay);
      document.addEventListener('visibilitychange', function () {
        if (!document.hidden && video.paused) tryPlay();
      });
      window.addEventListener('pointerdown', tryPlay, { once: true, passive: true });

      return video;
    }
    var img = document.createElement('img');
    img.className = 'film-list__image';
    img.loading = 'lazy';
    img.alt = item.title;
    img.src = item.thumbnail;
    img.setAttribute('data-fallback-label', item.thumbnail);
    return img;
  }

  function card(item) {
    var a = document.createElement('a');
    a.className = 'film-list__item';
    a.href = 'film-project.html?id=' + encodeURIComponent(item.id);

    var videoWrap = document.createElement('span');
    videoWrap.className = 'film-list__video-wrap';
    videoWrap.appendChild(itemMedia(item));

    var caption = document.createElement('span');
    caption.className = 'film-list__caption';
    caption.textContent = item.title;

    a.appendChild(videoWrap);
    a.appendChild(caption);

    // Hover (mouse) or focus (keyboard) plays the same clip large in the
    // stage behind the nav. Leaving clears it back to empty.
    function activate() {
      if (!stage || !stageVideo || !item.preview) return;
      // No data-fallback-label here on purpose: the stage is a single
      // reused <video>, and media-placeholder.js would delete it from the
      // DOM on the first missing source, breaking every hover after that.
      // A silent black stage is the right fallback until real clips exist.
      if (stageVideo.getAttribute('src') !== item.preview) {
        stageVideo.setAttribute('src', item.preview);
        stageVideo.load();
      }
      var p = stageVideo.play();
      if (p && p.catch) p.catch(function () {});
      stage.classList.add('is-active');
    }
    function deactivate() {
      if (!stage) return;
      stage.classList.remove('is-active');
    }

    a.addEventListener('mouseenter', activate);
    a.addEventListener('mouseleave', deactivate);
    a.addEventListener('focus', activate);
    a.addEventListener('blur', deactivate);

    return a;
  }

  fetch('data/projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      list.innerHTML = '';
      // Per explicit request: the Brandays colorist-only capsules stay
      // out of this list (they're still real projects, just not shown
      // here) — data/projects.json marks them hideFromFilmList:true
      // rather than removing them outright, since the Index tracklist
      // still uses the full list including these two.
      projects
        .filter(function (p) { return !p.hideFromFilmList; })
        .forEach(function (p) { list.appendChild(card(p)); });
    })
    .catch(function (err) {
      console.error('Could not load data/projects.json', err);
    });
})();
