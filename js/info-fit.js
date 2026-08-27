(function () {
  // Fits .info-contact__email / .info-contact__cta-l1 so each line always
  // spans the full width of its container, no matter how long the text is
  // or how wide the viewport is — same trick as those "big responsive
  // headline" scripts: measure the text's natural width at a known
  // reference font-size, then scale the font-size by the ratio of
  // available width to that natural width.
  //
  // The CTA's second line ("To — Life") isn't fit independently — it's a
  // flex row (justify-content:space-between) rather than a single run of
  // text, so "natural width" doesn't mean the same thing there. It
  // inherits line 1's resulting font-size instead — both CTA lines share
  // the exact same size now (Andreu's Photoshop mockup measured identical
  // settings for both "Let's Bring Your Ideas" and "To — Life"; used to
  // be scaled bigger here before that clarification).
  var email = document.querySelector('.info-contact__email');
  var ctaLine1 = document.querySelector('.info-contact__cta-l1');
  var ctaLine2 = document.querySelector('.info-contact__cta-l2');
  if (!email && !ctaLine1) return;

  var REF = 100; // px — arbitrary reference size used only for measuring

  function measuredFontSize(el) {
    var container = el.parentElement;
    var available = container.clientWidth;
    if (available <= 0) return null;
    el.style.fontSize = REF + 'px';
    var naturalWidth = el.scrollWidth;
    if (naturalWidth <= 0) return null;
    return (available / naturalWidth) * REF;
  }

  function fitAll() {
    if (email) {
      var emailSize = measuredFontSize(email);
      if (emailSize) email.style.fontSize = emailSize + 'px';
    }
    if (ctaLine1) {
      var ctaSize = measuredFontSize(ctaLine1);
      if (ctaSize) {
        ctaLine1.style.fontSize = ctaSize + 'px';
        // Line 2 shares line 1's resulting size (Andreu's original spec —
        // both CTA lines use the exact same settings).
        if (ctaLine2) ctaLine2.style.fontSize = ctaSize + 'px';
      }
    }
  }

  fitAll();

  // The custom font can finish loading a beat after first paint —
  // measuring against the fallback font's metrics would size it slightly
  // wrong, so re-fit once the real font is confirmed in.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitAll);
  }

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitAll, 120);
  });
})();
