/* Shared overlay menu (mobile nav + INDEX). Include on every page. */
(function () {
  function init() {
    var openTriggers = document.querySelectorAll('[data-menu-open]');
    var overlay = document.getElementById('overlay-menu');
    if (!overlay) return;
    var closeTrigger = overlay.querySelector('[data-menu-close]');

    function open() {
      overlay.classList.add('is-open');
      document.body.classList.add('menu-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    function close() {
      overlay.classList.remove('is-open');
      document.body.classList.remove('menu-open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    openTriggers.forEach(function (btn) {
      btn.addEventListener('click', open);
    });
    if (closeTrigger) closeTrigger.addEventListener('click', close);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
