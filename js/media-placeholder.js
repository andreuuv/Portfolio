/*
 * Fills any <img data-fallback-label="..."> or <video data-fallback-label="...">
 * with a visible placeholder block (instead of a broken image icon / black
 * box) whenever the referenced asset is missing. Once you drop the real file
 * at the given path, the placeholder disappears automatically and the real
 * media is used.
 */
(function () {
  var SELECTOR = 'img[data-fallback-label], video[data-fallback-label], img.placeholder-check';

  function replace(el) {
    if (!el.isConnected || el.dataset.placeholderApplied) return;
    el.dataset.placeholderApplied = 'true';
    var wrap = document.createElement('div');
    wrap.className = 'media-placeholder';
    var label = document.createElement('span');
    label.className = 'media-placeholder__label';
    label.textContent = el.dataset.fallbackLabel || el.currentSrc || el.getAttribute('src');
    wrap.appendChild(label);
    el.replaceWith(wrap);
  }

  // Media "error" events don't bubble, but they do reach a capturing
  // listener on an ancestor — register this as early as possible (this
  // script must be loaded in <head>, before any matching element starts
  // fetching) so nothing is missed regardless of when scripts run.
  document.addEventListener('error', function (e) {
    var el = e.target;
    if (el && (el.tagName === 'IMG' || el.tagName === 'VIDEO') && el.matches(SELECTOR)) replace(el);
  }, true);

  function hasFailed(el) {
    if (el.tagName === 'IMG') return el.complete && el.naturalWidth === 0;
    if (el.tagName === 'VIDEO') return el.error || (el.readyState === 0 && el.networkState === 3 /* NETWORK_NO_SOURCE */);
    return false;
  }

  function sweepAlreadyFailed() {
    document.querySelectorAll(SELECTOR).forEach(function (el) {
      if (hasFailed(el)) replace(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sweepAlreadyFailed);
  } else {
    sweepAlreadyFailed();
  }

  // A video with a missing source often never fires 'error' at all in some
  // engines (it just sits at networkState 3 / readyState 0) — give it a
  // moment to try, then sweep once more.
  window.setTimeout(sweepAlreadyFailed, 1200);

  window.MediaPlaceholder = { attach: function (el) {
    if (hasFailed(el)) replace(el);
  } };
})();
