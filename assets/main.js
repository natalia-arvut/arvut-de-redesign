/* Arvut — leise Interaktionen */
(function () {
  // Header bekommt Linie/Hintergrund beim Scrollen
  var head = document.querySelector('.site-head');
  var onScroll = function () {
    if (!head) return;
    head.classList.toggle('scrolled', window.scrollY > 12);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile-Menü
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.m-menu');
  if (burger && menu) {
    var toggle = function (open) {
      menu.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () {
      toggle(!menu.classList.contains('open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') toggle(false);
    });
  }

  // Reveal beim Scrollen — respektiert reduced-motion
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
})();
