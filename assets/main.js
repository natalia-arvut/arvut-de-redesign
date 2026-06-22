/* Arvut — Interaktionen: Header, Menü, Reveal, Cursor, Magnetic, Count-up */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header-Linie beim Scrollen
  var head = document.querySelector('.site-head');
  var onScroll = function () { if (head) head.classList.toggle('scrolled', window.scrollY > 12); };
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
    burger.addEventListener('click', function () { toggle(!menu.classList.contains('open')); });
    menu.addEventListener('click', function (e) { if (e.target.tagName === 'A') toggle(false); });
  }

  // ---- Count-up ----
  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to')) || 0;
    var dur = parseInt(el.getAttribute('data-dur') || '1100', 10);
    if (reduce) { el.textContent = to; return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);            // easeOutCubic
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = to;
    }
    requestAnimationFrame(step);
  }

  // ---- Reveal + Count-up beim Scrollen ----
  var items = document.querySelectorAll('.reveal');
  function fire(el) {
    el.classList.add('in');
    el.querySelectorAll('.count').forEach(countUp);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(fire);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { fire(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // ---- Custom Cursor (Punkt + Ring, lerp) ----
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (fine && !reduce) {
    var dot = document.createElement('div'); dot.className = 'cur';
    var ring = document.createElement('div'); ring.className = 'cur-ring';
    document.body.appendChild(dot); document.body.appendChild(ring);
    document.documentElement.classList.add('cursor-on');
    var rx = innerWidth / 2, ry = innerHeight / 2, tx = rx, ty = ry;
    addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY; dot.style.left = tx + 'px'; dot.style.top = ty + 'px';
    });
    (function loop() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(loop);
    })();
    var hot = 'a,button,.btn,.item,.flow .st,.stats .st,.prices .p,.roles,.arrow';
    document.addEventListener('mouseover', function (e) { if (e.target.closest(hot)) ring.classList.add('grow'); });
    document.addEventListener('mouseout', function (e) { if (e.target.closest(hot)) ring.classList.remove('grow'); });

    // ---- Magnetische Buttons ----
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var mx = (e.clientX - r.left - r.width / 2) * 0.3;
        var my = (e.clientY - r.top - r.height / 2) * 0.45;
        b.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }
})();
