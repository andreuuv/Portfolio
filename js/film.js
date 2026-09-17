(function () {
  var list = document.getElementById('film-list');
  var stage = document.getElementById('film-stage');
  var stageVideo = document.getElementById('film-stage-video');
  if (!list) return;

  // One shared observer: only the list items actually scrolled near the
  // viewport start fetching/playing their clip. Originally every item's
  // video loaded eagerly on page load — invisible on localhost (zero real
  // network latency) but on a real host that's 5 clips (~20MB each)
  // downloading concurrently the instant the page opens, which is exactly
  // why they were "tardan mucho en cargar y no se autoreproducen": nothing
  // is actually broken, the videos just have to fight each other for
  // bandwidth before any of them buffer enough to start. Loading only
  // what's near-visible fixes that at the source instead of just
  // compressing the symptom away.
  var lazyVideoObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var video = entry.target;
          lazyVideoObserver.unobserve(video);
          startVideo(video);
        });
      }, { rootMargin: '200px 0px' })
    : null;

  function startVideo(video) {
    if (video.getAttribute('data-started')) return;
    video.setAttribute('data-started', 'true');
    video.preload = 'auto';
    var source = document.createElement('source');
    source.src = video.getAttribute('data-src');
    source.type = 'video/mp4';
    video.appendChild(source);
    video.load();

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
  }

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
      video.preload = 'none';
      video.poster = item.thumbnail;
      video.setAttribute('data-fallback-label', item.preview);
      video.setAttribute('data-src', item.preview);

      if (lazyVideoObserver) {
        lazyVideoObserver.observe(video);
      } else {
        startVideo(video); // no IntersectionObserver support — fall back to eager load
      }

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

  var grid = document.getElementById('film-grid');
  function gridCard(item) {
    var a = document.createElement('a');
    a.className = 'film-grid__item';
    a.href = 'film-project.html?id=' + encodeURIComponent(item.id);
    a.innerHTML =
      '<img src="' + item.thumbnail + '" alt="' + item.title + '" loading="lazy" data-fallback-label="' + item.thumbnail + '">' +
      '<span class="film-grid__caption">' + item.title + '</span>';
    return a;
  }

  fetch('data/projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      list.innerHTML = '';
      if (grid) grid.innerHTML = '';
      // Per explicit request: the Brandays colorist-only capsules stay
      // out of this list (they're still real projects, just not shown
      // here) — data/projects.json marks them hideFromFilmList:true
      // rather than removing them outright, since the Index tracklist
      // still uses the full list including these two. Same filter for
      // the Grid view, so both stay in sync.
      var visible = projects.filter(function (p) { return !p.hideFromFilmList; });
      visible.forEach(function (p) { list.appendChild(card(p)); });
      if (grid) visible.forEach(function (p) { grid.appendChild(gridCard(p)); });
    })
    .catch(function (err) {
      console.error('Could not load data/projects.json', err);
    });

  // Slider/Grid toggle — swaps .is-grid-view on <body> (see css/film.css
  // for what that hides/shows). Per explicit "podrias hacer el mismo
  // layout" request referencing a reference site with this exact toggle.
  var viewButtons = document.querySelectorAll('.film-view-toggle__btn');
  viewButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var isGrid = btn.getAttribute('data-view') === 'grid';
      document.body.classList.toggle('is-grid-view', isGrid);
      viewButtons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      if (isGrid && stage) stage.classList.remove('is-active');
    });
  });
})();
