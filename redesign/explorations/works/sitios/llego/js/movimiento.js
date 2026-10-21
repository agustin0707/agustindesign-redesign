/* Capas de movimiento activables por separado.
   Cada capa activa agrega una clase en <html> (m-entradas, m-reticula, ...).
   Con prefers-reduced-motion no se activa ninguna y todo queda visible y quieto.
   Decidido 10.10: quedan las seis activas. Para apagar una, cambiar su valor a false. */
(function () {
  'use strict';

  var CAPAS = {
    entradas: true,   /* 1. Los bloques entran al aparecer en pantalla */
    reticula: true,   /* 2. Las líneas se dibujan y los nodos de las franjas se encienden al recorrer */
    titulos: true,    /* 3. Los títulos entran línea por línea, tras una máscara */
    imagenes: true,   /* 4. Las imágenes se revelan y la foto del hero tiene paralaje */
    cursor: true,     /* 5. Escritorio: la intersección más cercana al cursor se enciende con un nodo */
    recorrido: true   /* 6. Indicador fijo del recorrido: un nodo por sección */
  };
  window.LF_CAPAS = CAPAS;

  var raiz = document.documentElement;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  var punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var toArray = function (l) { return Array.prototype.slice.call(l); };
  var filas = toArray(document.querySelectorAll('main .fila, footer .fila'));

  /* Observa elementos una sola vez y ejecuta fn al entrar en pantalla */
  function alEntrar(elementos, fn, margen) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { fn(e.target); obs.unobserve(e.target); } });
    }, { rootMargin: margen || '0px 0px -8% 0px' });
    elementos.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- 3. Títulos línea por línea (se prepara antes que las entradas) ---------- */
  if (CAPAS.titulos) {
    raiz.classList.add('m-titulos');
    var titulos = toArray(document.querySelectorAll('main .t-display, main .t-h2'));
    titulos.forEach(function (t) {
      if (!t.querySelector('.linea')) t.innerHTML = '<span class="linea">' + t.innerHTML + '</span>';
      var base = t.closest('.s-hero') ? 560 : 0;   /* en el hero, el título entra después del header y la franja */
      toArray(t.querySelectorAll('.linea')).forEach(function (l, i) {
        l.innerHTML = '<span class="li">' + l.innerHTML + '</span>';
        l.style.setProperty('--d', (base + i * 120) + 'ms');
      });
    });
    alEntrar(titulos, function (t) { t.classList.add('titulo-visible'); });
  }

  /* ---------- 1. Entradas por bloque ---------- */
  if (CAPAS.entradas) {
    var selector = 'main .sec:not(.s-hero) .franja, .intro > p, .modulo, .pilar, .lista-fila, .lc, .cifra, .paso, .ruta, .categorias li, .campos, .s-calidad .parrafos, .s-calidad .normas, .bajada, .s-pie .columnas > div';
    if (!CAPAS.titulos) selector += ', .t-display, .t-h2';
    var bloques = toArray(document.querySelectorAll(selector));
    raiz.classList.add('m-entradas');
    bloques.forEach(function (el) { el.classList.add('rv'); });
    /* Categorías en celular (C3, 11.10): ícono y nombre de cada fila en cascada al entrar la lista */
    toArray(document.querySelectorAll('.s-cat .categorias')).forEach(function (l) {
      toArray(l.children).forEach(function (li, i) { li.style.setProperty('--i', i); });
    });
    alEntrar(toArray(document.querySelectorAll('.s-cat .categorias')), function (l) { l.classList.add('cae'); }, '0px 0px -15% 0px');
    alEntrar(bloques, function (el) {
      var hermanos = toArray(el.parentElement.children).filter(function (h) { return h.classList.contains('rv'); });
      el.style.transitionDelay = (Math.max(0, hermanos.indexOf(el)) % 6) * 80 + 'ms';
      el.classList.add('visible');
    });

    /* Secuencia de carga del hero: header, franja, título (capa 3), bajada, CTA, +21 e índice.
       Cada elemento declara su momento en data-carga (ms) y su dirección en data-desde. */
    var deCarga = toArray(document.querySelectorAll('[data-carga]'));
    deCarga.forEach(function (el) { el.style.setProperty('--dc', el.dataset.carga + 'ms'); });
    raiz.classList.add('m-carga');
    requestAnimationFrame(function () { requestAnimationFrame(function () { raiz.classList.add('cargado'); }); });
    /* al terminar, se quitan las clases para que cada elemento recupere sus propias transiciones de hover */
    setTimeout(function () { raiz.classList.remove('m-carga', 'cargado'); }, 2800);
  }

  /* ---------- 2. Retícula viva ---------- */
  if (CAPAS.reticula) {
    raiz.classList.add('m-reticula');
    filas.forEach(function (f) {
      var hermanas = toArray(f.parentElement.children).filter(function (h) { return h.classList.contains('fila'); });
      f.style.setProperty('--d', (hermanas.indexOf(f) % 4) * 120 + 'ms');
    });
    alEntrar(filas, function (f) { f.classList.add('trazada'); }, '0px 0px -4% 0px');
    /* Calidad: cada fila de la lista se marca como hito cumplido al llegar a media pantalla */
    alEntrar(toArray(document.querySelectorAll('.s-calidad .lc')), function (f) { f.classList.add('hito'); }, '0px 0px -45% 0px');
    /* Ruta de la Propuesta de valor: se dibuja cuando los pilares entran */
    alEntrar(toArray(document.querySelectorAll('.s-valor .pilares')), function (g) { g.classList.add('ruta-on'); }, '0px 0px -25% 0px');
    /* Categorías en celular (M6, 11.10): la línea de avance crece según la lista cruza el 55 % de la pantalla */
    var listaCat = document.querySelector('.s-cat .categorias');
    var celular = window.matchMedia('(max-width: 767px)');
    if (listaCat) {
      var pendienteA = false;
      var avance = function () {
        pendienteA = false;
        if (!celular.matches) return;
        var r = listaCat.getBoundingClientRect();
        listaCat.style.setProperty('--prog', Math.max(0, Math.min(1, (window.innerHeight * .55 - r.top) / r.height)).toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!pendienteA) { pendienteA = true; requestAnimationFrame(avance); } }, { passive: true });
      avance();
    }
    /* Relleno = ya ocurrió: el nodo de la franja se enciende cuando la sección se recorre */
    alEntrar(toArray(document.querySelectorAll('main .sec')), function (s) { s.classList.add('recorrida'); }, '0px 0px -55% 0px');
  }

  /* ---------- 4. Imágenes: revelado y paralaje ---------- */
  if (CAPAS.imagenes) {
    raiz.classList.add('m-imagenes');
    /* Cortina que baja: un telón por módulo, escalonados cada 140 ms dentro de su grupo */
    toArray(document.querySelectorAll('.modulo.cortina')).forEach(function (m) {
      var grupo = toArray(m.parentElement.querySelectorAll('.modulo.cortina'));
      var t = document.createElement('span');
      t.className = 'telon';
      t.setAttribute('aria-hidden', 'true');
      m.appendChild(t);
      m.style.setProperty('--di', grupo.indexOf(m) * 140 + 'ms');
    });
    alEntrar(toArray(document.querySelectorAll('.modulo')), function (m) { m.classList.add('revelada'); });
    var fotoHero = document.querySelector('.s-hero .foto');
    if (fotoHero) {
      requestAnimationFrame(function () { fotoHero.classList.add('revelada'); });
      var imgHero = fotoHero.querySelector('img');
      var hero = document.querySelector('.s-hero');
      var pendienteP = false;
      var paralaje = function () {
        pendienteP = false;
        var y = Math.max(0, window.scrollY);   /* en el rebote (scroll negativo) la foto no se mueve */
        if (y > hero.offsetHeight) return;
        imgHero.style.transform = 'translate3d(0,' + (y * .22).toFixed(1) + 'px,0) scale(var(--zoom, 1))';
      };
      window.addEventListener('scroll', function () { if (!pendienteP) { pendienteP = true; requestAnimationFrame(paralaje); } }, { passive: true });
      paralaje();
    }
  }

  /* ---------- 5. Cursor: enciende la intersección más cercana (solo con mouse) ---------- */
  if (CAPAS.cursor && punteroFino) {
    raiz.classList.add('m-cursor');
    var cruce = document.createElement('span');
    cruce.className = 'cruce';
    cruce.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cruce);
    var mx = -1, my = -1, pendienteC = false;
    var buscar = function () {
      pendienteC = false;
      var mejor = null, dmin = 90;
      for (var i = 0; i < filas.length; i++) {
        var f = filas[i];
        if (f.classList.contains('sin-verticales')) continue;
        var r = f.getBoundingClientRect();
        if (my < r.top - dmin || my > r.bottom + dmin) continue;
        var cs = getComputedStyle(f);
        var borde = parseFloat(cs.paddingLeft), ancho = r.width - 2 * borde;
        var ys = [];
        if (f.previousElementSibling && f.previousElementSibling.classList.contains('fila') || f.classList.contains('con-linea')) ys.push(r.top);
        if (f.nextElementSibling && f.nextElementSibling.classList.contains('fila')) ys.push(r.bottom);
        for (var k = 0; k <= 4; k++) {
          var x = r.left + borde + ancho * k / 4;
          for (var j = 0; j < ys.length; j++) {
            var d = Math.hypot(x - mx, ys[j] - my);
            if (d < dmin) { dmin = d; mejor = { x: x, y: ys[j], f: f }; }
          }
        }
      }
      if (mejor) {
        var oscuro = !!mejor.f.closest('.es-oscuro');
        cruce.classList.toggle('sobre-oscuro', oscuro);
        cruce.style.transform = 'translate3d(' + (mejor.x - 2).toFixed(1) + 'px,' + (mejor.y - 2).toFixed(1) + 'px,0)';
        cruce.classList.add('activo');
      } else {
        cruce.classList.remove('activo');
      }
    };
    var pedir = function () { if (!pendienteC) { pendienteC = true; requestAnimationFrame(buscar); } };
    window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; pedir(); }, { passive: true });
    window.addEventListener('scroll', function () { if (mx >= 0) pedir(); }, { passive: true });
    document.addEventListener('mouseleave', function () { cruce.classList.remove('activo'); });
  }

  /* ---------- 6. Indicador de recorrido ---------- */
  if (CAPAS.recorrido) {
    raiz.classList.add('m-recorrido');
    var secciones = toArray(document.querySelectorAll('main .sec[id]'));
    var nav = document.createElement('nav');
    nav.className = 'recorrido';
    nav.setAttribute('aria-label', 'Recorrido por las secciones');
    secciones.forEach(function (s, i) {
      var nombre = s.querySelector('.franja .nombre');
      var a = document.createElement('a');
      a.href = '#' + s.id;
      a.innerHTML = '<span class="punto"></span><span class="rot">' + ('0' + i).slice(-2) + ' · ' + (nombre ? nombre.textContent.trim() : '') + '</span>';
      a.addEventListener('click', function (e) { e.preventDefault(); if (window.LF_ir) window.LF_ir(s.id); });
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
    var enlaces = toArray(nav.querySelectorAll('a'));
    var pendienteR = false;
    var marcar = function () {
      pendienteR = false;
      var medio = window.innerHeight / 2, actual = 0;
      secciones.forEach(function (s, i) { if (s.getBoundingClientRect().top <= medio) actual = i; });
      enlaces.forEach(function (a, i) { a.classList.toggle('pasado', i < actual); a.classList.toggle('actual', i === actual); });
      var tono = secciones[actual].dataset.tono;
      nav.classList.toggle('sobre-claro', tono === 'claro');
    };
    window.addEventListener('scroll', function () { if (!pendienteR) { pendienteR = true; requestAnimationFrame(marcar); } }, { passive: true });
    marcar();
  }
})();
