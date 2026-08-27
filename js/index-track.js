(function () {
  var body = document.getElementById('index-track-body');
  if (!body) return;

  // Using the real film projects list as the "tracklist" rows — the only
  // structured work data we already have. Columns are No/Title/Director/
  // Role/Client, answering "who directed, what I did, and for which
  // client" per project. Director comes from each project's own explicit
  // `director` field (not parsed out of the credits[] list — those role
  // labels vary per project, e.g. "Creative Director" vs "Direction" vs
  // no director-ish credit at all, so a plain string field set per
  // project is more reliable than pattern-matching role text). Shows an
  // em dash for a project with no director set (e.g. Promise Me).
  var stills = document.querySelector('.index-stills');
  var leftVideo = document.getElementById('index-stills-left-video');
  var rightVideo = document.getElementById('index-stills-right-video');
  var rightStill = document.getElementById('index-stills-right-still');

  // Hover/focus on a tracklist row fades out the single default video
  // (.index-stills__default, the homepage's own reel — see index.html (the homepage itself)) and
  // reveals a two-box preview stage underneath it: left plays that
  // project's own preview clip, right swaps to a static still
  // (thumbnail) instead of a second video. Leaving fades the default
  // video back in. Same reused-element / src-swap technique as the Film
  // page's hover stage (js/film.js) — no data-fallback-label on the
  // swapped elements, since media-placeholder.js would delete them from
  // the DOM on the first missing source and break every subsequent hover.
  // Belt-and-braces play retry, same pattern as the home hero video and
  // the Film page's hover stage: a single play() call right after load()
  // isn't reliable (nothing buffered yet), so retry on the events that
  // mean "there's enough data now".
  function tryPlay(video) {
    var p = video.play();
    if (p && p.catch) p.catch(function () {});
  }
  // Vertical/portrait clips (e.g. the Brandays capsules) shouldn't be
  // cropped to fill the box — per explicit "no lo escales de ancho"
  // request, .is-portrait (CSS) makes width follow the video's own
  // aspect ratio instead of stretching to 100%. Can't know the real
  // dimensions until the browser's read them, so this checks on
  // loadedmetadata rather than guessing from the filename.
  function markOrientation(video) {
    function apply() {
      video.classList.toggle('is-portrait', video.videoWidth > 0 && video.videoHeight > video.videoWidth);
    }
    if (video.readyState >= 1) { apply(); return; }
    video.addEventListener('loadedmetadata', apply, { once: true });
  }
  function swapSrc(video, src) {
    if (video.getAttribute('src') === src) { tryPlay(video); return; }
    video.setAttribute('src', src);
    video.load();
    markOrientation(video);
    tryPlay(video);
    video.addEventListener('loadedmetadata', function retry() {
      tryPlay(video);
      video.removeEventListener('loadedmetadata', retry);
    });
    video.addEventListener('canplay', function retry() {
      tryPlay(video);
      video.removeEventListener('canplay', retry);
    });
  }

  function activatePreview(p) {
    if (stills) stills.classList.add('is-previewing');
    if (leftVideo && p.preview) swapSrc(leftVideo, p.preview);
    if (rightStill && rightVideo && p.thumbnail) {
      rightStill.src = p.thumbnail;
      rightStill.alt = p.title;
      rightStill.hidden = false;
      rightVideo.style.visibility = 'hidden';
    }
  }
  function deactivatePreview() {
    if (stills) stills.classList.remove('is-previewing');
    if (rightStill && rightVideo) {
      rightStill.hidden = true;
      rightVideo.style.visibility = 'visible';
    }
  }

  fetch('data/projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      body.innerHTML = projects.map(function (p, i) {
        var no = String(i + 1).padStart(2, '0');
        // First row reads as the "active" one by default, matching the
        // reference's one-row-bold-rest-dimmed look at rest — hovering
        // any other row still takes over that highlight (see the CSS).
        var activeClass = i === 0 ? ' is-active' : '';
        var director = p.director || '—';
        var client = p.client || '—';
        return (
          '<a class="index-track__row' + activeClass + '" role="row" href="film-project.html?id=' + encodeURIComponent(p.id) + '">' +
          '<span role="cell" class="index-track__no">' + no + '</span>' +
          '<span role="cell" class="index-track__title">' + p.title + '</span>' +
          '<span role="cell" class="index-track__director">' + director + '</span>' +
          '<span role="cell" class="index-track__role">' + p.role + '</span>' +
          '<span role="cell" class="index-track__client">' + client + '</span>' +
          '</a>'
        );
      }).join('');

      Array.from(body.querySelectorAll('.index-track__row')).forEach(function (rowEl, i) {
        var p = projects[i];
        rowEl.addEventListener('mouseenter', function () { activatePreview(p); });
        rowEl.addEventListener('focus', function () { activatePreview(p); });
        rowEl.addEventListener('mouseleave', deactivatePreview);
        rowEl.addEventListener('blur', deactivatePreview);
      });
    })
    .catch(function (err) {
      console.error('Could not load data/projects.json', err);
    });
})();
