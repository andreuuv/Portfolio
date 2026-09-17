(function () {
  var list = document.getElementById('film-list');
  var stage = document.getElementById('film-stage');
  var stageVideo = document.getElementById('film-stage-video');
  var metaDirector = document.getElementById('film-meta-director');
  var metaRole = document.getElementById('film-meta-role');
  if (!list) return;

  // The stage is a single reused <video> — only ever one clip loading/
  // playing at a time, swapped by src, so (unlike the old per-row-video
  // list) there's no concurrent-download problem to guard against here.
  var defaultProject = null;

  function activate(item) {
    if (!item) return;
    if (stageVideo && item.preview) {
      if (stageVideo.getAttribute('src') !== item.preview) {
        stageVideo.setAttribute('src', item.preview);
        stageVideo.load();
      }
      var p = stageVideo.play();
      if (p && p.catch) p.catch(function () { /* still blocked; dimmed stage stays as-is */ });
    }
    if (stage) stage.classList.add('is-ready');
    if (metaDirector) metaDirector.textContent = item.director || '—';
    if (metaRole) metaRole.textContent = item.role || '—';
  }

  // Plain-text row: TITLE | CLIENT on one line, year below, matching the
  // reference ("la quiero asi la de slider"). No per-row thumbnail — the
  // full-bleed stage behind everything takes that job instead. First row
  // is the resting "active" one (its clip is what the stage shows before
  // anything's been hovered); hovering/focusing any row shows that one
  // instead, and leaving reverts back to the first.
  function card(item, isFirst) {
    var a = document.createElement('a');
    a.className = 'film-list__item' + (isFirst ? ' is-active' : '');
    a.href = 'film-project.html?id=' + encodeURIComponent(item.id);

    var caption = document.createElement('span');
    caption.className = 'film-list__caption';
    caption.textContent = item.client ? (item.title + ' | ' + item.client) : item.title;

    var year = document.createElement('span');
    year.className = 'film-list__year';
    year.textContent = item.year || '';

    a.appendChild(caption);
    a.appendChild(year);

    a.addEventListener('mouseenter', function () { activate(item); });
    a.addEventListener('focus', function () { activate(item); });
    a.addEventListener('mouseleave', function () { activate(defaultProject); });
    a.addEventListener('blur', function () { activate(defaultProject); });

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
      visible.forEach(function (p, i) { list.appendChild(card(p, i === 0)); });
      if (grid) visible.forEach(function (p) { grid.appendChild(gridCard(p)); });

      defaultProject = visible[0];
      activate(defaultProject);
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
    });
  });
})();
