/* =======================================================
   INICIO JS · EXPLORACIÓN DEL PASO DE LA DECISIÓN 07 A LA PORTADA DEL CAPÍTULO 03 (.pp3)
   ======================================================= */
/* llego.js fija la portada del 03 en la pantalla del paso (.lf-circulo-on, t de 0 a 1) y mide la entrada de su
   contenido. Este script lee el mismo t y mueve lo que viaja en .pp3-capa: las líneas del cierre del manual, que pasan
   a ser la retícula de la portada, sus marcas de corte y el rótulo de la esquina. Solo en escritorio y con movimiento.
   Va antes que llego.js: en el caso el paso (.lf-paso) lo enciende el hero, y esta página no lo tiene */
(function () {
    const html = document.documentElement;
    const d7 = document.getElementById('dec-07'), cap = document.getElementById('cap-3');
    if (!d7 || !cap) return;
    const capa = document.querySelector('.pp3-capa');
    const lineas = [...capa.querySelectorAll('[data-l]')], cortes = [...capa.querySelectorAll('[data-c]')];
    const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!movil.matches && !quieto) html.classList.add('lf-paso');
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const tramo = (v, a, b) => fijar((v - a) / (b - a));
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const mezcla = (a, b, e) => a + (b - a) * e;
    const px = v => v.toFixed(1) + 'px';
    const poner = (el, n, v) => el.style.setProperty(n, typeof v === 'number' ? v.toFixed(4) : v);
    let on = false, version = 'a', medido = false, ultimo = -1;
    const m = {};

    /* --- 1. MEDIDAS AL ENTRAR EN LA PANTALLA DEL PASO --- */
    /* Las cuatro líneas del cierre y su rótulo de arriba a la izquierda; las cinco de la retícula de la portada, cada una
       cortada donde la corta su --fin (8 px antes del contenido) */
    const caja = el => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; };
    const medir = () => {
        const c = s => caja(d7.querySelector(s));
        m.v1 = c('.lf-cierre-v1'); m.v2 = c('.lf-cierre-v2'); m.h1 = c('.lf-cierre-h1'); m.h2 = c('.lf-cierre-h2'); m.rot = c('.lf-cierre-tl');
        /* La portada puede no estar fija todavía en este cuadro: la retícula se mide desde su panel, que queda arriba */
        const panel = caja(cap.querySelector('.lf-cap-fijo'));
        m.ret = [...cap.querySelectorAll('.lf-reticula i')].map(i => { const r = caja(i), fin = parseFloat(getComputedStyle(i).getPropertyValue('--fin')) || 0; return { l: r.l - panel.l, t: r.t - panel.t, w: 1, h: r.h - fin }; });
        medido = m.ret.length === 5 && m.v1.h > 0;
    };
    const linea = (el, r, alfa, verde) => { poner(el, '--x', px(r.l)); poner(el, '--y', px(r.t)); poner(el, '--w', px(r.w)); poner(el, '--h', px(r.h)); poner(el, '--a', alfa); poner(el, '--k', verde); };
    const entre = (a, b, e) => ({ l: mezcla(a.l, b.l, e), t: mezcla(a.t, b.t, e), w: mezcla(a.w, b.w, e), h: mezcla(a.h, b.h, e) });
    const L = k => lineas.find(l => l.dataset.l === k);

    /* --- 2. LA RETÍCULA, MEJORADA: CUATRO TIEMPOS --- */
    const A = t => {
        const W = window.innerWidth, H = window.innerHeight, R = m.ret;
        /* 1 · La 07 se apaga bajo sus líneas, que se encienden en verde claro; la portada aparece al final, debajo */
        poner(html, '--pp3-vo', curva(tramo(t, 0, 0.3)));
        poner(html, '--pp3-f', tramo(t, 0.5, 0.88));
        const luz = tramo(t, 0, 0.14), asienta = tramo(t, 0.72, 0.96);
        const alfa = mezcla(mezcla(0.22, 0.6, luz), 0.16, asienta), verde = luz * (1 - asienta);
        /* 2 · El marco del manual se abre hasta la pantalla: sus verticales van a los bordes de la retícula y sus
           horizontales a 96 px de arriba y de abajo, donde se apagan */
        const e = curva(tramo(t, 0.14, 0.56));
        const x0 = mezcla(m.v1.l, R[0].l, e), x1 = mezcla(m.v2.l, R[4].l, e);
        const y0 = mezcla(m.h1.t, 96, e), y1 = mezcla(m.h2.t, H - 96, e);
        linea(L('v1'), entre(m.v1, R[0], e), alfa, verde);
        linea(L('v5'), entre(m.v2, R[4], e), alfa, verde);
        const fuera = 1 - tramo(t, 0.62, 0.82);
        linea(L('h1'), { l: mezcla(m.h1.l, 0, e), t: y0, w: mezcla(m.h1.w, W, e), h: 1 }, alfa * fuera, verde);
        linea(L('h2'), { l: mezcla(m.h2.l, 0, e), t: y1, w: mezcla(m.h2.w, W, e), h: 1 }, alfa * fuera, verde);
        /* 3 · Las tres columnas interiores se dibujan de arriba abajo, una tras otra, como en las portadas 01 y 02 */
        ['v2', 'v3', 'v4'].forEach((k, i) => {
            const d = curva(tramo(t, 0.46 + 0.07 * i, 0.74 + 0.07 * i)), r = R[i + 1];
            linea(L(k), { l: r.l, t: r.t, w: 1, h: r.h * d }, alfa, verde);
        });
        /* Las marcas de corte, a 8 px de cada esquina hacia adentro: aparecen con la luz y se van al abrirse,
           porque la pantalla no se corta */
        poner(html, '--pp3-co', tramo(t, 0.03, 0.14) * (1 - tramo(t, 0.4, 0.56)));
        const esquina = { tl: [x0 + 8, y0 + 8], tr: [x1 - 20, y0 + 8], bl: [x0 + 8, y1 - 20], br: [x1 - 20, y1 - 20] };
        cortes.forEach(c => { const [x, y] = esquina[c.dataset.c]; poner(c, '--x', px(x)); poner(c, '--y', px(y)); });
        /* 4 · El rótulo viaja con la esquina: de 36 páginas a una */
        poner(html, '--pp3-rx', px(x0 + m.rot.l - m.v1.l)); poner(html, '--pp3-ry', px(y0 + m.rot.t - m.h1.t));
        poner(html, '--pp3-rc', curva(tramo(t, 0.3, 0.4)));
        poner(html, '--pp3-ro', 1 - tramo(t, 0.7, 0.86));
    };

    /* --- 3. LA RETÍCULA, COMO ESTABA (PARA COMPARAR) --- */
    const ANTES = t => {
        poner(html, '--pp3-f', tramo(t, 0.05, 0.4));
        const e = curva(tramo(t, 0.25, 0.9)), eh = curva(tramo(t, 0.08, 0.5));
        const medio = { l: (m.v1.l + m.v2.l) / 2, t: (m.h1.t + m.h2.t) / 2, w: 1, h: 0 };
        const desde = { v1: m.v1, v2: m.v1, v3: medio, v4: m.v2, v5: m.v2 };
        lineas.forEach(l => {
            const k = l.dataset.l;
            if (k[0] === 'v') linea(l, entre(desde[k], m.ret[+k[1] - 1], e), mezcla(0.22, 0.16, e) + 0.4 * Math.sin(Math.PI * e), 0);
            else { const h = m[k]; linea(l, entre(h, { l: h.l + h.w / 2, t: h.t, w: 0, h: 1 }, eh), 0.22 * (1 - eh), 0); }
        });
    };
    const VERSION = { a: A, antes: ANTES };

    /* --- 4. CUADRO A CUADRO --- */
    let pedido = 0;
    const cuadro = () => {
        pedido = 0;
        if (!on) return;
        const u = 1 - cap.getBoundingClientRect().top / window.innerHeight, t = fijar(u), dentro = t > 0 && t < 1;
        html.classList.toggle('pp3-dentro', dentro);
        if (!dentro) { medido = false; return; }
        if (!medido) { medir(); if (!medido) { pedir(); return; } }
        if (u === ultimo) return;
        ultimo = u;
        VERSION[version](t);
    };
    const pedir = () => { if (!pedido) pedido = requestAnimationFrame(cuadro); };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', () => { medido = false; ultimo = -1; pedir(); });
    const activar = () => { on = !movil.matches && !quieto; html.classList.toggle('pp3-on', on); medido = false; ultimo = -1; pedir(); };
    movil.addEventListener('change', activar);
    activar();

    /* --- 5. VER EL PASO: VUELVE AL CIERRE Y LO RECORRE SOLO, HASTA LA PORTADA ENTERA --- */
    let viaje = 0;
    const verElPaso = () => {
        cancelAnimationFrame(viaje);
        const vh = window.innerHeight, base = window.scrollY + cap.getBoundingClientRect().top;
        const inicio = Math.round(base - vh * 1.3), fin = Math.round(base + vh * 0.9);
        window.scrollTo({ top: inicio, behavior: 'instant' });
        if (quieto) { window.scrollTo({ top: fin, behavior: 'instant' }); return; }
        const t0 = performance.now() + 400, dur = 5600;
        const avanzar = ahora => {
            const k = fijar((ahora - t0) / dur);
            window.scrollTo({ top: Math.round(inicio + (fin - inicio) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)), behavior: 'instant' });
            if (k < 1) viaje = requestAnimationFrame(avanzar);
        };
        viaje = requestAnimationFrame(avanzar);
    };
    /* La rueda o el dedo cortan el recorrido */
    ['wheel', 'touchstart'].forEach(e => window.addEventListener(e, () => cancelAnimationFrame(viaje), { passive: true }));

    /* --- 6. SELECTOR DE VERSIONES --- */
    const V = {
        a: 'La retícula, mejorada. La 07 se apaga y quedan sus cuatro líneas, encendidas, con las marcas de corte del impreso en las esquinas. El marco se abre hasta la pantalla y su rótulo pasa de 36 páginas a una; las columnas interiores se dibujan una tras otra y todo se asienta en la retícula de la portada.',
        antes: 'La retícula, como estaba. Todo se apaga menos las líneas que miden el manual cerrado, y se reparten hasta ser las cinco de la portada.'
    };
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const elegir = (v, ver) => {
        if (!V[v]) v = 'a';
        version = v;
        Object.keys(V).forEach(k => html.classList.toggle('pp3-v-' + k, k === v));
        desc.textContent = V[v];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
        try { localStorage.setItem('pp3-version', v); } catch (e) { /* sin almacenamiento, se parte en la mejorada */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        try { history.replaceState(null, '', location.pathname + location.search + '#' + v); } catch (e) { /* un visor que no deja cambiar la dirección no corta el cambio */ }
        medido = false; ultimo = -1;
        requestAnimationFrame(() => { if (ver) verElPaso(); else cuadro(); });
    };
    botones.forEach(x => x.addEventListener('click', () => elegir(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', verElPaso);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const n = ['1', '2'].indexOf(e.key);
        if (n >= 0) elegir(['a', 'antes'][n], true);
        else if (e.key === 'r' || e.key === 'R') verElPaso();
    });
    let guardada = null;
    try { guardada = localStorage.getItem('pp3-version'); } catch (e) { /* sin almacenamiento */ }
    elegir(location.hash.slice(1) || guardada || 'a', false);
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DEL PASO DE LA DECISIÓN 07 A LA PORTADA DEL CAPÍTULO 03 (.pp3)
   ======================================================= */
