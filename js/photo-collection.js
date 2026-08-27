(function () {
  var root = document.getElementById('collection-root');
  if (!root) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  fetch('data/photos.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var all = (data.analog || []).map(function (c) { return Object.assign({ group: 'Analog' }, c); })
        .concat((data.digital || []).map(function (c) { return Object.assign({ group: 'Digital' }, c); }));

      var index = all.findIndex(function (c) { return c.id === id; });
      var collection = all[index];

      if (!collection) {
        root.innerHTML =
          '<div class="project-header">' +
          '<a class="project-header__back label" href="photography.html">&larr; Back to Photography</a>' +
          '<h1 class="project-title">Collection not found</h1>' +
          '</div>';
        return;
      }

      document.title = collection.title + ' — Andreu Virgil';

      var photosHtml = (collection.photos || []).map(function (src, i) {
        // First image is above the fold on load — leave it eager so it
        // doesn't wait on the lazy-load trigger; everything after it can
        // wait until it's scrolled near.
        var loadingAttr = i === 0 ? '' : ' loading="lazy"';
        return '<div class="collection-grid__item">' +
          '<img src="' + src + '" alt="' + collection.title + '"' + loadingAttr + ' data-fallback-label="' + src + '">' +
          '</div>';
      }).join('');

      var prev = all[(index - 1 + all.length) % all.length];
      var next = all[(index + 1) % all.length];

      root.innerHTML =
        '<div class="project-header">' +
        '<a class="project-header__back label" href="photography.html">&larr; Back to Photography</a>' +
        '<h1 class="project-title">' + collection.title + '</h1>' +
        '<div class="project-meta"><span>' + collection.group + '</span>' +
        (collection.year ? '<span>' + collection.year + '</span>' : '') + '</div>' +
        '</div>' +
        '<div class="collection-grid">' + photosHtml + '</div>' +
        '<div class="project-nav">' +
        '<a href="photo-collection.html?id=' + encodeURIComponent(prev.id) + '">&larr; ' + prev.title + '</a>' +
        '<a href="photo-collection.html?id=' + encodeURIComponent(next.id) + '">' + next.title + ' &rarr;</a>' +
        '</div>';

      // Can't know a photo's real orientation until the browser's actually
      // read it — same "check on load, don't guess from the filename"
      // approach as the Index page's portrait-video handling. A landscape
      // photo gets .is-landscape (see css/photography.css), which spans 2
      // grid columns instead of being squeezed into the same narrow
      // portrait-shaped cell as everything else.
      Array.from(root.querySelectorAll('.collection-grid__item img')).forEach(function (img) {
        function markIfLandscape() {
          if (img.naturalWidth > img.naturalHeight) {
            img.closest('.collection-grid__item').classList.add('is-landscape');
          }
        }
        if (img.complete && img.naturalWidth) { markIfLandscape(); return; }
        img.addEventListener('load', markIfLandscape, { once: true });
      });
    })
    .catch(function (err) {
      console.error('Could not load data/photos.json', err);
    });
})();
