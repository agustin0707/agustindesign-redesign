/* empresa.js — drivers de la región importada (hero + ecosistema).
   Aislado: solo toca elementos empx-*. No interfiere con main.js. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── HERO STACK · entrada + flotación suave ── */
  var stack = document.querySelector('.empx-hero-stack');
  if (stack) {
    var shown = false;
    var reveal = function () {
      if (shown) return; shown = true;
      setTimeout(function () { stack.classList.add('empx-animate-in'); }, 600);
      if (reduce) return;
      setTimeout(function () {
        var mid = stack.querySelector('.empx-stack-layer--mid');
        var front = stack.querySelector('.empx-stack-layer--front');
        var t = 0;
        (function float() {
          t += 0.008;
          if (mid)   mid.style.transform   = 'translateY(' + (Math.sin(t) * 5) + 'px)';
          if (front) front.style.transform = 'translateY(' + (Math.sin(t + 1.2) * 7) + 'px)';
          requestAnimationFrame(float);
        })();
      }, 2200);
    };
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { reveal(); so.disconnect(); } });
    }, { threshold: 0.15 });
    so.observe(stack);
    setTimeout(reveal, 1800); // fallback
  }

  /* ── ECOSISTEMA · entrada escalonada de kicker/título/pills ── */
  var prod = document.querySelector('.empx-section-productos');
  if (prod) {
    var heads = prod.querySelectorAll('.empx-section-kicker, .empx-section-title');
    var pills = prod.querySelectorAll('.empx-pill');
    heads.forEach(function (el) { el.classList.add('empx-prod-hidden'); });
    pills.forEach(function (el) { el.classList.add('empx-prod-hidden'); });
    var fired = false;
    var fire = function () {
      if (fired) return; fired = true;
      heads.forEach(function (el, i) { setTimeout(function () { el.classList.add('empx-prod-in'); }, i * 120); });
      var d = [300, 480, 640];
      pills.forEach(function (el, i) { setTimeout(function () { el.classList.add('empx-prod-in'); }, d[i] || 300 + i * 180); });
    };
    var po = new IntersectionObserver(function (es) {
      if (es.some(function (e) { return e.isIntersecting; })) { fire(); po.disconnect(); }
    }, { threshold: 0 });
    po.observe(prod);
    setTimeout(fire, 2500); // fallback: garantiza visibilidad
  }

  /* ── PILLS · spotlight que sigue el cursor ── */
  document.querySelectorAll('[data-empx-tilt]').forEach(function (card) {
    var spot = card.querySelector('.empx-card-spotlight');
    if (!spot) return;
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      spot.style.background = 'radial-gradient(650px circle at ' + (e.clientX - r.left) + 'px ' + (e.clientY - r.top) + 'px, rgba(107,92,231,.07), transparent 40%)';
    });
    card.addEventListener('mouseleave', function () { spot.style.background = 'none'; });
  });

})();
