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
        var loadingAttr = i === 0 ? ' fetchpriority="high"' : ' loading="lazy"';
        // width/height come from data/photos.json ("sizes") so the browser
        // reserves each photo's real aspect ratio before it loads — without
        // them the masonry columns jump around as lazy images pop in.
        var size = (collection.sizes || [])[i];
        var sizeAttr = size ? ' width="' + size[0] + '" height="' + size[1] + '"' : '';
        return '<div class="collection-grid__item">' +
          '<img src="' + src + '" alt="' + collection.title + '"' + sizeAttr + loadingAttr + ' decoding="async" data-fallback-label="' + src + '">' +
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
      // No orientation detection needed here — the masonry column layout
      // (css/photography.css) handles any landscape/portrait mix on its
      // own, since each photo just keeps its natural aspect ratio.
    })
    .catch(function (err) {
      console.error('Could not load data/photos.json', err);
    });
})();
