/* =======================================================
   INICIO JS · EXPLORACIÓN DEL CIERRE DEL MANUAL Y EL PASO AL CAPÍTULO 03 (.p3)
   ======================================================= */
/* El cierre lo dibuja el CSS con --fin (llego.js, décimo paso de la 07). Aquí: la pista de la 07 suma la pantalla del
   paso; en esa ventana la portada del 03 sube con su panel fijo y este script mueve lo que viaja de una a otra, medido
   en su lugar al entrar: la portada del manual hasta la pantalla del sitio (A), las líneas de la retícula hasta el
   marco del navegador (B) o el nodo del 1 de octubre hasta el cursor de la barra de direcciones (C).
   Solo en escritorio y con movimiento (.p3-paso); sin el paso la portada del 03 entra como siempre */
(function () {
    const html = document.documentElement;
    const d7 = document.getElementById('dec-07'), cap = document.getElementById('cap-3');
    if (!d7 || !cap) return;
    const capa = cap.querySelector('.p3-capa'), vuelo = capa.querySelector('.p3-vuelo'), nodo = capa.querySelector('.p3-nodo');
    const lineas = [...capa.querySelectorAll('[data-l]')];
    const portada = d7.querySelector('.lf-man-pag'), escenario = d7.querySelector('.lf-man'), oct = d7.querySelector('.p3-cc-oct i');
    const nav = cap.querySelector('.lf-dom-nav'), pant = cap.querySelector('.lf-dom-pant'), cursor = cap.querySelector('.lf-dom-cursor');
    const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const tramo = (v, a, b) => fijar((v - a) / (b - a));
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const mezcla = (a, b, e) => a + (b - a) * e;
    const px = v => v.toFixed(1) + 'px';
    const PISTA = 630, BASE = 530, HASTA = (PISTA - 200) / (PISTA - 100);
    let paso = false, medido = false, ultimo = -1, version = 'a';
    const m = {};

    /* --- 1. MEDIDAS: LO QUE SALE DE LA 07 Y DONDE LLEGA EN LA PORTADA --- */
    const caja = el => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; };
    const medir = () => {
        m.portada = caja(portada); m.esc = caja(escenario); m.oct = oct ? caja(oct) : null;
        m.nav = caja(nav); m.pant = caja(pant); m.cursor = caja(cursor);
        const S = m.esc, N = m.nav;
        /* B: las cuatro líneas de la retícula (tercios del escenario) y el marco del navegador, con la línea de la barra */
        m.lineas = {
            v1: [{ l: S.l + S.w / 3, t: S.t, w: 1, h: S.h }, { l: N.l, t: N.t, w: 1, h: N.h }],
            v2: [{ l: S.l + S.w * 2 / 3, t: S.t, w: 1, h: S.h }, { l: N.l + N.w - 1, t: N.t, w: 1, h: N.h }],
            h1: [{ l: S.l, t: S.t + S.h / 3, w: S.w, h: 1 }, { l: N.l, t: N.t, w: N.w, h: 1 }],
            h2: [{ l: S.l, t: S.t + S.h * 2 / 3, w: S.w, h: 1 }, { l: N.l, t: N.t + N.h - 1, w: N.w, h: 1 }],
            h3: [{ l: N.l, t: N.t + 40, w: 0, h: 1 }, { l: N.l, t: N.t + 40, w: N.w, h: 1 }]
        };
    };
    const colocar = (el, a, b, e) => {
        el.style.setProperty('--p3-x', px(mezcla(a.l, b.l, e))); el.style.setProperty('--p3-y', px(mezcla(a.t, b.t, e)));
        el.style.setProperty('--p3-w', px(mezcla(a.w, b.w, e))); el.style.setProperty('--p3-h', px(mezcla(a.h, b.h, e)));
    };

    /* --- 2. AVANCE: t SEGÚN CUÁNTO SUBIÓ LA PORTADA DEL 03 --- */
    /* Cada versión con sus tiempos: [fondo desde, hasta, textos desde, hasta, marco desde, hasta] */
    const TIEMPOS = { a: [0.05, 0.5, 0.55, 0.95, 0.72, 1], b: [0.05, 0.45, 0.55, 0.95, 0.9, 1], c: [0.15, 0.55, 0.55, 0.95, 0.65, 1] };
    let pedido = 0;
    const cuadro = () => {
        pedido = 0;
        if (!paso) return;
        const u = 1 - cap.getBoundingClientRect().top / window.innerHeight;
        const t = fijar(u), ventana = t > 0 && t < 1;
        /* Al entrar en la ventana se mide, con el panel de la portada ya fijo en su lugar */
        if (ventana && !medido) { html.classList.add('p3-ventana'); medir(); medido = true; }
        if (!ventana) { medido = false; html.classList.remove('p3-vuela'); }
        html.classList.toggle('p3-ventana', ventana);
        if (!ventana || u === ultimo) return;
        ultimo = u;
        const T = TIEMPOS[version], fase = (n, v) => cap.style.setProperty(n, v.toFixed(4));
        fase('--p3-fondo', tramo(t, T[0], T[1])); fase('--p3-texto', curva(tramo(t, T[2], T[3]))); fase('--p3-marco', tramo(t, T[4], T[5]));
        /* A: la portada sale desde donde está la del manual en este cuadro (la inercia del manual puede seguir
           asentándola); la del manual se esconde solo cuando el vuelo ya partió */
        if (version === 'a') {
            const e = curva(tramo(t, 0.12, 0.88));
            m.portada = caja(portada);
            colocar(vuelo, m.portada, m.pant, e);
            html.classList.toggle('p3-vuela', e > 0);
        }
        if (version === 'b') {
            const e = curva(tramo(t, 0.15, 0.85)), e3 = curva(tramo(t, 0.6, 0.9));
            lineas.forEach(l => { const [a, b] = m.lineas[l.dataset.l]; colocar(l, a, b, l.dataset.l === 'h3' ? e3 : e); });
        }
        if (version === 'c' && m.oct) {
            const e = curva(tramo(t, 0.3, 0.85));
            colocar(nodo, m.oct, m.cursor, e);
            nodo.style.setProperty('--r', px(mezcla(m.oct.w / 2, 0, e)));
            nodo.style.setProperty('--ne', e.toFixed(4));
            nodo.style.setProperty('--lleno', tramo(t, 0.06, 0.28).toFixed(4));
        }
    };
    const pedir = () => { if (!pedido) pedido = requestAnimationFrame(cuadro); };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', () => { medido = false; ultimo = -1; pedir(); });

    /* --- 3. ENTRA Y SALE CON EL ANCHO --- */
    /* Corre antes que caso-motor.js: el motor mide la pista ya decidida */
    const activar = () => {
        paso = !movil.matches && !quieto;
        html.classList.toggle('p3-paso', paso);
        d7.style.setProperty('--pista', String(paso ? PISTA : BASE));
        d7.dataset.pasosHasta = paso ? HASTA.toFixed(4) : '1';
        if (!paso) html.classList.remove('p3-ventana');
        ultimo = -1; medido = false; pedir();
    };
    movil.addEventListener('change', () => { activar(); window.dispatchEvent(new Event('resize')); });
    activar();

    /* --- 4. VER EL PASO: VUELVE AL PRINCIPIO DEL CIERRE Y LO RECORRE SOLO, HASTA LA PORTADA --- */
    let viaje = 0;
    const verElPaso = () => {
        cancelAnimationFrame(viaje);
        const vh = window.innerHeight, base = window.scrollY + cap.getBoundingClientRect().top;
        const paso1 = (d7.offsetHeight - vh) * (paso ? HASTA : 1) / 10;
        const inicio = Math.round(base - vh - paso1 * 1.3), fin = Math.round(base + vh * 0.05);
        window.scrollTo({ top: inicio, behavior: 'instant' });
        if (quieto) { window.scrollTo({ top: fin, behavior: 'instant' }); return; }
        const t0 = performance.now() + 350, dur = 3600;
        const avanzar = ahora => {
            const k = fijar((ahora - t0) / dur);
            window.scrollTo({ top: Math.round(inicio + (fin - inicio) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)), behavior: 'instant' });
            if (k < 1) viaje = requestAnimationFrame(avanzar);
        };
        viaje = requestAnimationFrame(avanzar);
    };
    /* La rueda o el dedo cortan el recorrido */
    ['wheel', 'touchstart'].forEach(e => window.addEventListener(e, () => cancelAnimationFrame(viaje), { passive: true }));

    /* --- 5. SELECTOR DE VERSIONES --- */
    const V = {
        a: 'El manual se cierra. Las páginas se juntan bajo la portada y la retícula del manual mide la pila. Después la portada viaja a la ventana del navegador y el sitio carga encima: el manual se vuelve la web.',
        b: 'La retícula. El resultado se compone como la portada del manual, con los datos en sus celdas. Después las líneas de la retícula se mueven hasta ser el marco del navegador: la retícula es el puente entre el manual y la web.',
        c: 'El nodo. Una página por día, del 15 al 23 de septiembre: el nodo lleno es lo aprobado y el de contorno, el 1 de octubre, lo que vino. Ese nodo se llena, viaja y se vuelve el cursor que escribe el dominio.'
    };
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const elegir = (v, ver) => {
        if (!V[v]) v = 'a';
        version = v;
        Object.keys(V).forEach(k => html.classList.toggle('p3-v-' + k, k === v));
        desc.textContent = V[v];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
        try { localStorage.setItem('p3-version', v); } catch (e) { /* sin almacenamiento, se parte en la A */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        try { history.replaceState(null, '', location.pathname + location.search + '#' + v); } catch (e) { /* un visor que no deja cambiar la dirección no corta el cambio */ }
        medido = false; ultimo = -1;
        requestAnimationFrame(() => { if (ver) verElPaso(); else cuadro(); });
    };
    botones.forEach(x => x.addEventListener('click', () => elegir(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', verElPaso);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const n = '123'.indexOf(e.key);
        if (n >= 0) elegir('abc'[n], true);
        else if (e.key === 'r' || e.key === 'R') verElPaso();
    });

    let guardada = null;
    try { guardada = localStorage.getItem('p3-version'); } catch (e) { /* sin almacenamiento */ }
    elegir(location.hash.slice(1) || guardada || 'a', false);
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DEL CIERRE DEL MANUAL Y EL PASO AL CAPÍTULO 03 (.p3)
   ======================================================= */
