(function () {
  var SPEED_PX_PER_SEC = 40; // both strips drift at exactly this speed, however many items each has
  var RESUME_DELAY_MS = 1500; // how long after you let go before auto-scroll picks back up

  function card(item, isClone) {
    var a = document.createElement('a');
    a.className = 'photo-strip__item';
    a.href = 'photo-collection.html?id=' + encodeURIComponent(item.id);
    a.draggable = false; // don't fight our own drag-to-scroll with the browser's native link-drag
    if (isClone) {
      a.setAttribute('aria-hidden', 'true');
      a.setAttribute('tabindex', '-1');
    }
    // No loading="lazy" here on purpose: these cards drift in and out of
    // view continuously via the marquee, so "offscreen" is only ever a
    // momentary scroll state, not a real save — lazy-loading them caused a
    // broken-icon flash each time one scrolled into frame.
    a.innerHTML =
      '<span class="photo-strip__cover">' +
      '<img src="' + item.cover + '" alt="' + item.title + '" ' +
      'data-fallback-label="' + item.cover + '">' +
      '</span>' +
      '<span class="photo-strip__caption">' + item.title + '</span>';
    return a;
  }

  // With only a handful of real categories (e.g. 3 in Analog) one lap is
  // narrower than the visible strip itself, so the loop-around happens
  // almost immediately and the same 2-3 cards just sit there repeating
  // instead of visibly scrolling. Padding the underlying list out to at
  // least this many cards (by repeating it) before the seamless x2 dupe
  // keeps a full lap comfortably wider than the screen either way.
  var MIN_LAP_ITEMS = 8;

  // The track holds the collection list twice back-to-back; scrolling
  // exactly to the halfway point and jumping back to 0 (or vice versa)
  // loops it seamlessly. The second copy is hidden from assistive tech /
  // tab order since it's a visual duplicate.
  function render(strip, items) {
    if (!strip || !items.length) return null;
    strip.innerHTML = '';
    var track = document.createElement('div');
    track.className = 'photo-strip__track';
    var padded = items.slice();
    while (padded.length < MIN_LAP_ITEMS) { padded = padded.concat(items); }
    padded.forEach(function (item) { track.appendChild(card(item, false)); });
    padded.forEach(function (item) { track.appendChild(card(item, true)); });
    strip.appendChild(track);
    return track;
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = [];

  // Manual control on top of the auto-scroll: drag with the mouse, spin a
  // wheel/trackpad, or (natively, no JS needed for this part) swipe on
  // touch — so you can go look for a specific project or just see how many
  // there are instead of waiting for the marquee to bring it around.
  // Auto-scroll pauses the moment you interact and quietly resumes a
  // little while after you stop.
  function setupInteraction(row) {
    var strip = row.strip;

    function pause(temporary) {
      row.auto = false;
      if (row.resumeTimer) clearTimeout(row.resumeTimer);
      if (temporary) {
        row.resumeTimer = setTimeout(function () { row.auto = true; }, RESUME_DELAY_MS);
      }
    }

    // Removed the custom mouse-drag-to-scroll handling (pointerdown/move/up
    // + setPointerCapture + a capturing click-guard) — it was interfering
    // with plain clicks on a card actually opening the collection, per
    // explicit "quitar la de deslizar con la mano" follow-up once removing
    // the hover-grow animation alone didn't fix it. Touch users still get
    // native drag-to-scroll for free (real horizontal scroll container);
    // desktop mouse users get the auto-scroll marquee + the wheel redirect
    // below instead of a manual drag.

    // A plain vertical mouse wheel doesn't scroll a horizontal container by
    // default — redirect it. Trackpad horizontal swipes already arrive as
    // native deltaX and need no help.
    strip.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        strip.scrollLeft += e.deltaY;
        e.preventDefault();
      }
      pause(true);
    }, { passive: false });

    // Tabbing a card into focus (keyboard users aiming a click) pauses it
    // the same way hovering used to before that was removed; the pause
    // resumes shortly after you tab away.
    strip.addEventListener('focusin', function () { pause(false); });
    strip.addEventListener('focusout', function () { pause(true); });
  }

  function tick(now) {
    rows.forEach(function (row) {
      if (row.last == null) row.last = now;
      // Clamp elapsed time — a backgrounded/throttled tab can hand back a
      // huge gap between frames, which would otherwise make the strip
      // "jump" forward all at once the moment it's visible again.
      var dt = Math.min((now - row.last) / 1000, 0.1);
      row.last = now;
      if (reduceMotion || !row.auto) return;
      var half = row.track.scrollWidth / 2;
      if (half <= 0) return;
      row.strip.scrollLeft += row.direction * SPEED_PX_PER_SEC * dt;
      if (row.direction > 0 && row.strip.scrollLeft >= half) {
        row.strip.scrollLeft -= half;
      } else if (row.direction < 0 && row.strip.scrollLeft <= 0) {
        row.strip.scrollLeft += half;
      }
    });
    requestAnimationFrame(tick);
  }

  fetch('data/photos.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      [
        { id: 'grid-analog', items: data.analog || [], direction: 1 },
        // Bottom row drifts the opposite way — starts scrolled to its own
        // halfway point so it reads as moving the other direction from
        // the very first frame instead of both rows starting at 0.
        { id: 'grid-digital', items: data.digital || [], direction: -1 }
      ].forEach(function (def) {
        var strip = document.getElementById(def.id);
        var track = render(strip, def.items);
        if (!track) return;
        var row = { strip: strip, track: track, direction: def.direction, auto: true, resumeTimer: null, last: null };
        rows.push(row);
        setupInteraction(row);
        if (def.direction < 0) {
          requestAnimationFrame(function () { strip.scrollLeft = track.scrollWidth / 2; });
        }
      });
      requestAnimationFrame(tick);
    })
    .catch(function (err) {
      console.error('Could not load data/photos.json', err);
    });
})();
