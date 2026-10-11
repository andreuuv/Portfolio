(function () {
  var root = document.getElementById('project-root');
  if (!root) return;

  var params = new URLSearchParams(window.location.search);
  var id = params.get('id');

  // Same 5 links/order as every other page's nav (see CLAUDE.md "Nav
  // system") — kept as a plain list here instead of the shared .site-nav
  // component since this page's top bar is a 3-column layout the shared
  // component doesn't natively support (brand centered, not grouped).
  var navLinks = [
    { href: 'film.html', label: 'Cinematography' },
    { href: 'photography.html', label: 'Photography' },
    { href: 'info.html', label: 'About Me' },
    { href: 'tracklist.html', label: 'Index' }
  ];

  fetch('data/projects.json')
    .then(function (r) { return r.json(); })
    .then(function (projects) {
      var index = projects.findIndex(function (p) { return p.id === id; });
      var project = projects[index];

      if (!project) {
        root.innerHTML =
          '<div class="project-frame">' +
          '<div class="project-top"><a class="project-top__back" href="film.html">&larr; Back to Cinematography</a></div>' +
          '<h1 class="project-title" style="padding: var(--edge);">Project not found</h1>' +
          '</div>';
        return;
      }

      document.title = project.title + ' — Andreu Virgil';

      // Where the full video lives is just data: `embedUrl` in
      // data/projects.json can be ANY iframe-embeddable player URL (YouTube
      // /embed/..., Vimeo player.vimeo.com/video/..., Bunny, Cloudflare
      // Stream...) or a direct .mp4 link (self-hosted on the same server or
      // any storage/CDN) — see videoMarkup() below. The old Bunny.net trial
      // library expired and every Bunny link started returning 404, which
      // is why this no longer assumes a specific provider.
      var isPlaceholderId = !project.embedUrl || project.embedUrl.indexOf('REPLACE') === 0;

      // Each project's real video has its own real aspect ratio — some are
      // 16:9 (1920x1080), Promise Me measured 1422x1080 (≈1.317), and
      // Capsule 3 is a vertical/portrait clip (720x1280, ≈0.5625). A pure
      // CSS aspect-ratio didn't hold up once a portrait clip was in the mix
      // (a landscape .project-columns__right box can't both letterbox a
      // wide video AND pillarbox a tall one with one fixed CSS rule), so
      // the actual pixel sizing is computed in JS — see fitProjectEmbed()
      // below, same "measure and set real px, don't guess" approach as the
      // Index page's own portrait-video handling.
      var ratioAttr = project.embedAspectRatio ? ' data-embed-ratio="' + project.embedAspectRatio + '"' : '';

      var isVideoFile = !isPlaceholderId && /\.(mp4|webm|mov)(\?|#|$)/i.test(project.embedUrl);
      var videoBlock = isPlaceholderId
        ? '<div class="media-placeholder"' + ratioAttr + '>' +
          '<span class="media-placeholder__label">Add the video link for "' + project.title +
          '" in data/projects.json (embedUrl — a YouTube/Vimeo/Bunny embed link or a direct .mp4).</span></div>'
        : isVideoFile
          ? '<video controls playsinline preload="metadata" poster="' + project.thumbnail + '"' + ratioAttr + ' src="' + project.embedUrl + '"></video>'
          : '<iframe src="' + project.embedUrl + '"' + ratioAttr + ' allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="' + project.title + '"></iframe>';

      var creditsHtml = (project.credits || [])
        .filter(function (c) { return c.role; })
        .map(function (c) {
          return '<dt>' + c.role + '</dt><dd>' + (c.name || '&mdash;') + '</dd>';
        }).join('');

      var metaLine = [project.client, project.year].filter(Boolean).join(' · ');

      var navLinksHtml = navLinks.map(function (l) {
        var current = l.href === 'film.html';
        return '<a href="' + l.href + '"' + (current ? ' aria-current="page"' : '') + '>' + l.label + '</a>';
      }).join('<span aria-hidden="true">, </span>');

      var prev = projects[(index - 1 + projects.length) % projects.length];
      var next = projects[(index + 1) % projects.length];

      root.innerHTML =
        '<div class="project-frame">' +

        '<header class="project-top">' +
        '<div class="project-top__left">' +
        '<a class="project-top__back" href="film.html">&larr; Back</a>' +
        '<span class="project-top__category">' + (project.category || '') + '</span>' +
        '<span class="project-top__title">' + project.title + '</span>' +
        '</div>' +
        '<div class="project-top__right">' +
        '<a class="project-top__email" href="mailto:andreu.virgil22@gmail.com">andreu.virgil22@gmail.com</a>' +
        '<nav class="project-top__nav" aria-label="Primary">' + navLinksHtml + '</nav>' +
        '</div>' +
        '</header>' +

        '<div class="project-columns">' +
        '<div class="project-columns__left">' +
        (project.description ? '<div class="project-info"><h3>Project</h3><p>' + project.description + '</p></div>' : '') +
        (creditsHtml ? '<div class="project-info"><h3>Credits</h3><dl>' + creditsHtml + '</dl></div>' : '') +
        (metaLine ? '<div class="project-info"><h3>Details</h3><p>' + metaLine + '</p></div>' : '') +
        '</div>' +
        '<div class="project-columns__right">' + videoBlock + '</div>' +
        '</div>' +

        '<div class="project-nav">' +
        '<a href="film-project.html?id=' + encodeURIComponent(prev.id) + '">&larr; ' + prev.title + '</a>' +
        '<a href="film-project.html?id=' + encodeURIComponent(next.id) + '">' + next.title + ' &rarr;</a>' +
        '</div>' +

        '</div>';

      fitProjectEmbed();
      if (!resizeListenerAdded) {
        window.addEventListener('resize', debouncedFit);
        resizeListenerAdded = true;
      }
    })
    .catch(function (err) {
      console.error('Could not load data/projects.json', err);
    });

  // Sizes the embed (iframe or placeholder) to the largest box that fits
  // inside .project-columns__right AND keeps the video's own real aspect
  // ratio — same "contain" behaviour as object-fit, done manually because
  // that CSS property doesn't reliably apply to cross-origin iframes.
  // Re-run on resize so it stays correct across breakpoints (mobile stacks
  // the video full-width below the info column instead of beside it).
  function fitProjectEmbed() {
    var box = document.querySelector('.project-columns__right');
    var media = box && box.querySelector('iframe, video, .media-placeholder');
    if (!box || !media) return;
    var bw = box.clientWidth, bh = box.clientHeight;
    if (!bw || !bh) return;
    var ratioAttr = media.getAttribute('data-embed-ratio');
    var ratio = 16 / 9;
    if (ratioAttr) {
      var parts = ratioAttr.split('/').map(function (n) { return parseFloat(n); });
      if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) ratio = parts[0] / parts[1];
    }
    var w, h;
    if (bw / bh > ratio) {
      h = bh; w = bh * ratio; // box relatively wider than the video — letterbox
    } else {
      w = bw; h = bw / ratio; // box relatively taller/narrower — pillarbox
    }
    media.style.width = w + 'px';
    media.style.height = h + 'px';
  }

  var resizeListenerAdded = false;
  var resizeTimer = null;
  function debouncedFit() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitProjectEmbed, 100);
  }
})();
