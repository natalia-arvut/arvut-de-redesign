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
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = parseInt(el.getAttribute('data-dur') || '1100', 10);
    var fmt = function (n) { return dec ? n.toFixed(dec) : Math.round(n).toString(); };
    if (reduce) { el.textContent = fmt(to); return; }
    var t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);            // easeOutCubic
      el.textContent = fmt(to * e);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(to);
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

  // ---- Scramble / Decode-Text (von razgon-demo adaptiert) ----
  var CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%@&*<>/';
  function scramble(el, dur) {
    var text = el.getAttribute('data-text') || el.textContent;
    if (reduce) { el.textContent = text; return; }
    var len = text.length, start = null;
    function tick(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / dur, 1);
      var reveal = Math.floor(p * len), out = '';
      for (var i = 0; i < len; i++) {
        out += (i < reveal || text[i] === ' ') ? text[i] : CH[Math.floor(Math.random() * CH.length)];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
    }
    requestAnimationFrame(tick);
  }
  // Hero-Wörter (Scramble) — startet nach dem Intro
  function startHeroScramble() {
    document.querySelectorAll('.h-hero .scram').forEach(function (el, i) {
      el.textContent = el.getAttribute('data-text');
      setTimeout(function () { scramble(el, 850); }, 150 + i * 430);
    });
  }

  // ---- Intro-Loader: "ARVUT" tippt sich, dann teilt sich der Vorhang ----
  (function () {
    var intro = document.getElementById('intro');
    var iw = document.getElementById('iw');
    if (!intro || !iw) { startHeroScramble(); return; }
    // Intro nur einmal pro Sitzung — beim Sprachwechsel nicht erneut
    var seen = false; try { seen = sessionStorage.getItem('arvIntro') === '1'; } catch (e) {}
    if (reduce || seen) { intro.classList.add('done'); startHeroScramble(); return; }
    try { sessionStorage.setItem('arvIntro', '1'); } catch (e) {}
    document.body.classList.add('intro-lock');
    // Decode-Effekt wie auf der Startseite (tyk-tyk-tyk)
    iw.setAttribute('data-text', 'ARVUT');
    iw.textContent = '';
    scramble(iw, 1100);
    var t = 1550;
    setTimeout(function () { intro.classList.add('fade'); }, t);
    setTimeout(function () { intro.classList.add('open'); }, t + 260);
    setTimeout(function () {
      intro.classList.add('done'); document.body.classList.remove('intro-lock'); startHeroScramble();
    }, t + 1450);
    // Sicherheits-Fallback: nie dauerhaft sperren
    setTimeout(function () { document.body.classList.remove('intro-lock'); if (intro) intro.classList.add('done'); }, 6000);
  })();
  // CTA-Wort beim Scrollen in den Viewport
  var sv = document.querySelectorAll('.scram-view');
  if (sv.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      sv.forEach(function (el) { el.textContent = el.getAttribute('data-text'); });
    } else {
      var io2 = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { scramble(en.target, 850); io2.unobserve(en.target); } });
      }, { threshold: 0.5 });
      sv.forEach(function (el) { io2.observe(el); });
    }
  }
})();
