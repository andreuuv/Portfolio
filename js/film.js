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
  var rows = []; // filled once the list renders — used by arrange() below

  // Mini 3D-carousel: the active row sits at full opacity/no tilt, and
  // every other row rotates away (rotateX) + dims based on how far its
  // own index is from the active one — like they're mounted around a
  // drum and the active one has turned to face front. Per explicit "como
  // si estuvieran en un circulo 3d...el que este en medio [= active] mas
  // opacidad" request.
  function arrange(activeIndex) {
    rows.forEach(function (row, i) {
      var d = i - activeIndex;
      var ad = Math.min(Math.abs(d), 3);
      row.style.opacity = Math.max(1 - ad * 0.3, 0.18);
      row.style.transform = 'rotateX(' + (d * -13) + 'deg) scale(' + (1 - ad * 0.06) + ')';
    });
  }

  function activate(item, index) {
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
    if (typeof index === 'number') arrange(index);
  }

  // Plain-text row: TITLE | CLIENT on one line, year below, matching the
  // reference ("la quiero asi la de slider"). No per-row thumbnail — the
  // full-bleed stage behind everything takes that job instead. First row
  // is the resting "active" one (its clip is what the stage shows before
  // anything's been hovered); hovering/focusing any row shows that one
  // instead, and leaving reverts back to the first.
  function card(item, index) {
    var a = document.createElement('a');
    a.className = 'film-list__item' + (index === 0 ? ' is-active' : '');
    a.href = 'film-project.html?id=' + encodeURIComponent(item.id);

    var caption = document.createElement('span');
    caption.className = 'film-list__caption';
    caption.textContent = item.client ? (item.title + ' | ' + item.client) : item.title;

    var year = document.createElement('span');
    year.className = 'film-list__year';
    year.textContent = item.year || '';

    a.appendChild(caption);
    a.appendChild(year);

    a.addEventListener('mouseenter', function () { activate(item, index); });
    a.addEventListener('focus', function () { activate(item, index); });
    a.addEventListener('mouseleave', function () { activate(defaultProject, 0); });
    a.addEventListener('blur', function () { activate(defaultProject, 0); });

    return a;
  }

  var grid = document.getElementById('film-grid');

  // Landscape thumbnail with the caption (title/client) below it instead
  // of overlaid on the image. No category label/filter — tried and
  // explicitly reverted ("quita las categorias...ponlos todos juntos"),
  // every project just shows together in one grid now.
  function gridCard(item) {
    var a = document.createElement('a');
    a.className = 'film-grid__item';
    a.href = 'film-project.html?id=' + encodeURIComponent(item.id);
    var titleLine = item.client ? (item.title + ' - ' + item.client) : item.title;
    a.innerHTML =
      '<span class="film-grid__cover">' +
      '<img src="' + item.thumbnail + '" alt="' + item.title + '" loading="lazy" data-fallback-label="' + item.thumbnail + '">' +
      '</span>' +
      '<span class="film-grid__caption">' + titleLine + '</span>';
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
      visible.forEach(function (p, i) { list.appendChild(card(p, i)); });
      if (grid) visible.forEach(function (p) { grid.appendChild(gridCard(p)); });

      rows = Array.from(list.children);
      defaultProject = visible[0];
      activate(defaultProject, 0);
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
