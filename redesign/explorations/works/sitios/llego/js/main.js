/* Header, scroll a secciones, ruta de tecnología, cifras y formulario */
(function () {
  'use strict';

  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.getElementById('hdr');
  var altoHeader = function () { return hdr ? hdr.offsetHeight : 0; };

  /* ---------- Scroll animado a una sección; al llegar, destella el nodo de su franja ---------- */
  function curva(t) { return t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; }
  function destellar(seccion) {
    var franja = seccion.querySelector('.franja');
    if (!franja) return;
    franja.classList.add('destello');
    setTimeout(function () { franja.classList.remove('destello'); }, 900);
  }
  function ir(id) {
    var destino = document.getElementById(id);
    if (!destino) return;
    var y = id === 'inicio' ? 0 : destino.getBoundingClientRect().top + window.scrollY - altoHeader();
    var desde = window.scrollY, distancia = y - desde;
    if (reducir || Math.abs(distancia) < 4) { window.scrollTo(0, y); destellar(destino); return; }
    var duracion = Math.min(1600, 700 + Math.abs(distancia) * .25), t0 = null;
    function paso(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / duracion);
      window.scrollTo(0, desde + distancia * curva(p));
      if (p < 1) requestAnimationFrame(paso); else destellar(destino);
    }
    requestAnimationFrame(paso);
  }
  window.LF_ir = ir;
  document.querySelectorAll('[data-ir]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      ir(a.getAttribute('data-ir'));
      if (a.getAttribute('data-ir') === 'contacto') {
        setTimeout(function () { var c = document.getElementById('f-nombre'); if (c) c.focus({ preventScroll: true }); }, reducir ? 0 : 1200);
      }
    });
  });

  /* ---------- Transición entre páginas (onepage ↔ privacidad.html; estilos en css/transicion.css) ----------
     Un enlace a la otra página cubre la pantalla con el telón y navega al terminar.
     La página nueva se descubre solo si se llegó así (marca en sessionStorage, ver el script del <head>). */
  var raizDoc = document.documentElement;
  if (raizDoc.classList.contains('llega')) setTimeout(function () { raizDoc.classList.remove('llega'); }, 1500);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || reducir) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '')) return;
    e.preventDefault();
    try { sessionStorage.setItem('lf-llega', '1'); } catch (err) {}
    raizDoc.classList.add('sale');
    var espera = parseInt(getComputedStyle(raizDoc).getPropertyValue('--tr-salida'), 10) || 560;
    setTimeout(function () { location.href = url.href; }, espera);
  });
  /* al volver con el botón Atrás la página sale de la caché tal como quedó: se destapa */
  window.addEventListener('pageshow', function (e) { if (e.persisted) raizDoc.classList.remove('sale', 'llega'); });

  /* ---------- Header: cambia según el tono de la sección que tiene debajo ---------- */
  var secciones = Array.prototype.slice.call(document.querySelectorAll('[data-tono]'));
  var pendiente = false;
  function tono() {
    pendiente = false;
    if (!hdr) return;
    var y = altoHeader() / 2, actual = null;
    for (var i = 0; i < secciones.length; i++) {
      var r = secciones[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) { actual = secciones[i]; break; }
    }
    var t = actual ? actual.dataset.tono : 'foto';
    hdr.classList.toggle('sobre-claro', t === 'claro');
    hdr.classList.toggle('sobre-oscuro', t === 'oscuro' || (t === 'foto' && window.scrollY > 40));
  }
  window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; requestAnimationFrame(tono); } }, { passive: true });
  tono();


  /* ---------- Tecnología: seguimiento ilustrativo de un envío (gráfica C, decidido 11.10) ----------
     El paso activo cambia con el cursor y, al recorrer la lista con el scroll, solo (también en celular).
     Pasos anteriores: hechos (turquesa); el actual: blanco; los tramos se llenan y el registro se completa hasta el paso actual. */
  var pasos = Array.prototype.slice.call(document.querySelectorAll('.s-tecno .paso'));
  var panelRuta = document.querySelector('.s-tecno .ruta');
  if (pasos.length && panelRuta) {
    var marcar = function (lista, fn) { Array.prototype.forEach.call(panelRuta.querySelectorAll(lista), fn); };
    var activar = function (i) {
      panelRuta.dataset.paso = i;
      pasos.forEach(function (p, j) { p.classList.toggle('activo', j === i); p.classList.toggle('hecho', j < i); });
      marcar('.hito', function (h) { var j = +h.dataset.i; h.classList.toggle('hecho', j < i); h.classList.toggle('actual', j === i); });
      marcar('.llenado', function (t) { t.classList.toggle('hecho', +t.dataset.i < i); });
      marcar('.registro text', function (t) { var j = +t.dataset.i; t.classList.toggle('visible', j <= i); t.classList.toggle('ultimo', j === i); });
      document.getElementById('r-etapa').textContent = 'Etapa 0' + (i + 1) + ' / 06';
    };
    pasos.forEach(function (p, i) { p.addEventListener('mouseenter', function () { activar(i); }); });
    if ('IntersectionObserver' in window) {
      var obsPasos = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) activar(pasos.indexOf(e.target)); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      pasos.forEach(function (p) { obsPasos.observe(p); });
    }
    activar(0);
  }

  /* ---------- Qué es: cuánto baja el texto de cada módulo del bento para esconder la descripción (sube en hover) ---------- */
  var modulos = document.querySelectorAll('.s-quees .modulo');
  function medirModulos() {
    modulos.forEach(function (m) {
      var p = m.querySelector('.sobre p');
      if (p) m.style.setProperty('--alto-p', (p.offsetHeight + 8) + 'px');
    });
  }
  if (modulos.length) {
    medirModulos();
    window.addEventListener('load', medirModulos);
    window.addEventListener('resize', medirModulos);
    /* Tablet táctil (12.10): tocar un módulo muestra su descripción; tocar otro la cambia (css/secciones.css) */
    var tactil = window.matchMedia('(hover: none) and (min-width: 768px)');
    Array.prototype.forEach.call(modulos, function (m) {
      m.addEventListener('click', function () {
        if (!tactil.matches) return;
        var abierto = m.classList.contains('toca');
        Array.prototype.forEach.call(modulos, function (x) { x.classList.remove('toca'); });
        if (!abierto) m.classList.add('toca');
      });
    });
  }

  /* ---------- Qué es, sin cursor (celular y tablet): el destacador de cada párrafo se dibuja al llegar al centro de la pantalla ---------- */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches && 'IntersectionObserver' in window) {
    var obsDestacador = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('en-vista'); obsDestacador.unobserve(e.target); } });
    }, { rootMargin: '-35% 0px -45% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('.s-quees .intro p'), function (p) { obsDestacador.observe(p); });
  }

  /* ---------- Propuesta de valor en celular: cada pilar se marca al llegar al centro de la pantalla (css/celular.css) ---------- */
  if ('IntersectionObserver' in window) {
    var obsPilares = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('llego'); obsPilares.unobserve(e.target); } });
    }, { rootMargin: '-30% 0px -40% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('.s-valor .pilar'), function (p) { obsPilares.observe(p); });
  }

  /* ---------- Celular: el botón fijo "Conversemos" aparece después del hero y se esconde al llegar al formulario ---------- */
  var barraCta = document.querySelector('.barra-cta');
  var heroSec = document.querySelector('.s-hero'), ctaSec = document.getElementById('contacto');
  if (barraCta && heroSec && ctaSec) {
    var pendienteB = false;
    var revisarBarra = function () {
      pendienteB = false;
      var visible = heroSec.getBoundingClientRect().bottom < 0 && ctaSec.getBoundingClientRect().top > window.innerHeight * .6;
      barraCta.classList.toggle('visible', visible);
    };
    window.addEventListener('scroll', function () { if (!pendienteB) { pendienteB = true; requestAnimationFrame(revisarBarra); } }, { passive: true });
    revisarBarra();
  }

  /* ---------- Celular: la barra de la hora y la del buscador toman el color de la sección que está detrás (decidido 11.10) ----------
     Safari nuevo lee el fondo de la página; Chrome y Safari anteriores leen la etiqueta theme-color: se actualizan las dos. */
  var metaTema = document.querySelector('meta[name="theme-color"]');
  var celular = window.matchMedia('(max-width: 767px)');
  var COLORES = [['.s-hero', '#0B3439'], ['.s-quees', '#F4F4F4'], ['.s-valor', '#178181'], ['.s-calidad', '#104E56'], ['.s-tecno', '#F4F4F4'],
    ['.s-exp', '#0A1415'], ['.s-cat', '#F4F4F4'], ['.s-cta', '#0B3439'], ['.s-pie', '#FFFFFF']]
    .map(function (c) { return [document.querySelector(c[0]), c[1]]; }).filter(function (c) { return c[0]; });
  var colorEn = function (y) {
    var col = '#0B3439';
    COLORES.forEach(function (c) { var r = c[0].getBoundingClientRect(); if (r.top <= y && r.bottom > y) col = c[1]; });
    return col;
  };
  var pendienteT = false;
  var tonoBarras = function () {
    pendienteT = false;
    if (!celular.matches) { document.body.style.backgroundColor = ''; document.documentElement.style.backgroundColor = ''; return; }
    var arriba = colorEn(2);
    if (metaTema) metaTema.setAttribute('content', arriba);
    document.body.style.backgroundColor = arriba;
    document.documentElement.style.backgroundColor = colorEn(window.innerHeight - 2);
  };
  window.addEventListener('scroll', function () { if (!pendienteT) { pendienteT = true; requestAnimationFrame(tonoBarras); } }, { passive: true });
  if (celular.addEventListener) celular.addEventListener('change', tonoBarras);
  tonoBarras();

  /* ---------- Tecnología: el gráfico se centra en su panel en escritorio y se recorta al estado y los hitos en celular ---------- */
  var grafico = document.querySelector('.s-tecno .seguimiento');
  var ajustarGrafico = function () { if (grafico) grafico.setAttribute('preserveAspectRatio', celular.matches ? 'xMidYMin slice' : 'xMidYMid meet'); };
  if (celular.addEventListener) celular.addEventListener('change', ajustarGrafico);
  ajustarGrafico();

  /* ---------- Carrusel de clientes: con el cursor encima no se detiene, baja suavemente la velocidad ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.carrusel'), function (c) {
    var pista = c.querySelector('.pista');
    if (!pista || !pista.getAnimations) return;
    var velocidad = function (v) {
      pista.getAnimations().forEach(function (a) { if (a.updatePlaybackRate) a.updatePlaybackRate(v); else a.playbackRate = v; });
    };
    c.addEventListener('mouseenter', function () { velocidad(.35); });
    c.addEventListener('mouseleave', function () { velocidad(1); });
  });

  /* ---------- Cifras: conteo al entrar en pantalla ---------- */
  var formato = function (n) { return n.toLocaleString('es-CL'); };
  /* Deja cada carácter en su propia caja (para el hover "rodillo" del +21 del hero y de las cifras de Experiencia) */
  function digitos(el) {
    var texto = el.textContent;
    el.setAttribute('aria-label', texto);
    el.innerHTML = texto.split('').map(function (c, i) {
      return '<span class="dig" style="--i:' + i + '" aria-hidden="true"><span>' + c + '</span><span>' + c + '</span></span>';
    }).join('');
  }
  function contar(el, dur, listo) {
    var hasta = +el.dataset.cuenta, pre = el.dataset.pre || '', suf = el.dataset.suf || '', t0 = null;
    (function paso(ts) {
      if (ts === undefined) return requestAnimationFrame(paso);
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = pre + formato(Math.round(hasta * (1 - Math.pow(1 - p, 3)))) + suf;
      if (p < 1) requestAnimationFrame(paso); else if (listo) listo();
    })();
  }
  var cifras = document.querySelectorAll('[data-cuenta]');
  var cifraHero = document.querySelector('.s-hero [data-cuenta]');
  if ('IntersectionObserver' in window && !reducir) {
    var obsCifras = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (!e.isIntersecting) return;
        obsCifras.unobserve(e.target);
        var el = e.target;
        setTimeout(function () { contar(el, 1600, (el === cifraHero || el.closest('.s-exp')) ? function () { digitos(el); } : null); }, +(el.dataset.retraso || 0));
      });
    }, { threshold: .6 });
    cifras.forEach(function (c) { obsCifras.observe(c); });
  } else if (cifraHero) {
    digitos(cifraHero);
  }
  /* ---------- Página de privacidad: el índice marca la parte que se está leyendo ---------- */
  var indice = document.querySelector('.priv-indice');
  if (indice && 'IntersectionObserver' in window) {
    var enlaces = {};
    indice.querySelectorAll('a').forEach(function (a) { enlaces[a.hash.slice(1)] = a; });
    var obsIndice = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        indice.querySelectorAll('[aria-current]').forEach(function (a) { a.removeAttribute('aria-current'); });
        if (enlaces[e.target.id]) enlaces[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    document.querySelectorAll('.priv-sec').forEach(function (sec) { obsIndice.observe(sec); });
  }

  /* ---------- Formulario: envío a Formspree sin recargar la página ----------
     Valida al enviar (no mientras se escribe), marca los campos que faltan y muestra
     la confirmación dentro del panel. El honeypot es el campo _gotcha (Formspree lo descarta). */
  var form = document.getElementById('formulario');
  if (form) {
    /* índice de cada campo para la entrada escalonada (css/movimiento.css 2d) */
    Array.prototype.forEach.call(form.querySelectorAll('.campos > *'), function (c, k) { c.style.setProperty('--k', k); });
    /* el mensaje crece con el texto */
    var mensaje = document.getElementById('f-msg');
    if (mensaje) mensaje.addEventListener('input', function () { mensaje.style.height = 'auto'; mensaje.style.height = mensaje.scrollHeight + 'px'; });

    var TEXTOS = {
      revisar: 'Revisa los campos marcados.',
      enviando: 'Enviando…',
      exitoTitulo: 'Gracias, {nombre}.',
      exitoTexto: 'Recibimos tu mensaje. Nuestro equipo te contactará pronto para conversar sobre tu operación.',
      errorEnvio: 'No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos o escríbenos a contacto@llego.cl.',
      campos: {
        nombre: 'Escribe tu nombre.',
        empresa: 'Escribe el nombre de tu empresa.',
        email: 'Escribe un email válido, por ejemplo nombre@empresa.cl.',
        emailVacio: 'Escribe tu email.',
        acepta_privacidad: 'Acepta la Política de Privacidad para continuar.'
      }
    };
    var msg = document.getElementById('f-mensaje');
    var boton = form.querySelector('button[type="submit"]');
    var botonTxt = boton.querySelector('span');
    var botonOriginal = botonTxt.textContent;
    var exito = document.getElementById('f-exito');
    var intentado = false;

    /* línea de error bajo cada campo obligatorio, asociada con aria-describedby */
    var obligatorios = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    obligatorios.forEach(function (el) {
      var p = document.createElement('p');
      p.className = 'error'; p.id = 'e-' + el.id;
      (el.closest('.campo') || el.closest('.casilla')).appendChild(p);
      el.setAttribute('aria-describedby', p.id);
    });
    function textoError(el) {
      if (el.validity.valid) return '';
      if (el.name === 'email') return el.validity.valueMissing ? TEXTOS.campos.emailVacio : TEXTOS.campos.email;
      return TEXTOS.campos[el.name] || '';
    }
    function marcar(el) {
      var t = textoError(el), caja = el.closest('.campo') || el.closest('.casilla');
      caja.classList.toggle('con-error', !!t);
      el.setAttribute('aria-invalid', t ? 'true' : 'false');
      document.getElementById('e-' + el.id).textContent = t;
      return !t;
    }
    function validar() {
      var primero = null;
      obligatorios.forEach(function (el) { if (!marcar(el) && !primero) primero = el; });
      return primero;
    }
    /* después del primer intento, cada campo se corrige solo al escribir */
    form.addEventListener('input', function (e) { if (intentado && e.target.required) { marcar(e.target); if (!form.querySelector('.con-error')) msg.textContent = ''; } });
    form.addEventListener('change', function (e) { if (intentado && e.target.type === 'checkbox') { marcar(e.target); if (!form.querySelector('.con-error')) msg.textContent = ''; } });

    function enviando(si) {
      boton.disabled = si;
      botonTxt.textContent = si ? TEXTOS.enviando : botonOriginal;
      form.classList.toggle('enviando', si);
    }
    function mostrarExito(nombre) {
      var primer = (nombre || '').trim().split(/\s+/)[0];
      /* {nombre} se cambia por el primer nombre; si no hay, se quita junto con su coma */
      function poner(t) { return primer ? t.replace('{nombre}', primer) : t.replace(/,?\s*\{nombre\}/, ''); }
      exito.querySelector('.exito-titulo').textContent = poner(TEXTOS.exitoTitulo);
      exito.querySelector('.exito-texto').textContent = poner(TEXTOS.exitoTexto);
      msg.textContent = '';
      form.classList.add('enviado');
      form.reset();
      if (mensaje) mensaje.style.height = '';
      exito.querySelector('.exito-titulo').focus({ preventScroll: true });
      /* en celular el panel es alto: si la confirmación no está a la vista, se lleva al centro */
      var r = exito.getBoundingClientRect(), h = window.innerHeight;
      if (r.top + r.height / 2 < 0 || r.top + r.height / 2 > h) exito.scrollIntoView({ block: 'center', behavior: reducir ? 'auto' : 'smooth' });
    }
    function mostrarError() {
      form.classList.add('con-falla');
      msg.textContent = TEXTOS.errorEnvio;
    }
    exito.querySelector('.exito-otro').addEventListener('click', function () {
      form.classList.remove('enviado');
      intentado = false;
      document.getElementById('f-nombre').focus();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('enviando')) return;
      intentado = true;
      form.classList.remove('con-falla');
      var primero = validar();
      if (primero) { msg.textContent = TEXTOS.revisar; primero.focus(); return; }
      msg.textContent = '';
      var datos = new FormData(form);
      enviando(true);
      fetch(form.action, { method: 'POST', body: datos, headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); mostrarExito(datos.get('nombre')); })
        .catch(mostrarError)
        .then(function () { enviando(false); });
    });
  }
})();
