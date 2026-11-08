/* =======================================================
   INICIO JS · EXPLORACIÓN DE LA PORTADA DEL CAPÍTULO 03 (.pw)
   ======================================================= */
(function () {
    const html = document.documentElement, pista = document.querySelector('.pw-pista'), fijo = document.querySelector('.pw-fijo');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const tramo = (v, a, b) => fijar((v - a) / (b - a));
    const NS = 'http://www.w3.org/2000/svg';
    const crear = (tag, attrs) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
    let version = 'a';

    /* --- 1. LA BARRA: EL DOMINIO SE CORRIGE A TAMAÑO DE PANTALLA --- */
    const b = document.querySelector('.pw-b'), url = b.querySelector('[data-url]'), VIEJO = 'llego.cl/farma', NUEVO = 'llegofarma.cl';
    let previo = '';
    const pintarB = p => {
        let t;
        if (p < 0.14) t = VIEJO;
        else if (p < 0.22) t = `<s>${VIEJO}</s>`;
        else if (p < 0.32) t = `<s>${VIEJO.slice(0, Math.round((1 - tramo(p, 0.22, 0.32)) * VIEJO.length))}</s>`;
        else t = NUEVO.slice(0, Math.round(tramo(p, 0.34, 0.54) * NUEVO.length));
        if (t !== previo) { url.innerHTML = t; previo = t; }
        b.style.setProperty('--carga', tramo(p, 0.56, 0.72).toFixed(3));
        b.style.setProperty('--dec', (0.3 + 0.7 * tramo(p, 0.14, 0.3)).toFixed(3));
    };

    /* --- 2. RETÍCULA VIVA: LÍNEAS CON CORTES, RUTA CON EL SCROLL Y NODO QUE SIGUE AL CURSOR --- */
    const ret = document.querySelector('.pw-c-ret');
    let nodos = [];
    const armarRet = () => {
        const W = window.innerWidth, H = window.innerHeight, M = parseFloat(getComputedStyle(pista).getPropertyValue('--margen')) || W * 0.05, C = 8;
        ret.setAttribute('viewBox', `0 0 ${W} ${H}`); ret.textContent = ''; nodos = [];
        const xs = [0, 1, 2, 3, 4].map(k => M + (W - 2 * M) * k / 4), ys = [112, H * 0.42, H - 112];
        const tramoV = (x, a, b) => ret.appendChild(crear('line', { x1: x, x2: x, y1: a, y2: b })), tramoH = (y, a, b) => ret.appendChild(crear('line', { x1: a, x2: b, y1: y, y2: y }));
        xs.forEach(x => { let a = 0; ys.forEach(y => { tramoV(x, a, y - C); a = y + C; }); tramoV(x, a, H); });
        ys.forEach(y => { let a = 0; xs.forEach(x => { tramoH(y, a, x - C); a = x + C; }); tramoH(y, a, W); });
        /* La ruta recorre los cruces en zigzag, fila por fila */
        ys.forEach((y, f) => (f % 2 ? [...xs].reverse() : xs).forEach(x => { const n = crear('circle', { cx: x, cy: y }); ret.appendChild(n); nodos.push({ n, x, y }); }));
    };
    const pintarC = p => { const hasta = Math.round(p * nodos.length); nodos.forEach((o, i) => o.n.classList.toggle('ruta', i < hasta)); };
    window.addEventListener('pointermove', e => {
        if (version !== 'c') return;
        let mejor = null, d = 1e9;
        nodos.forEach(o => { const h = Math.hypot(o.x - e.clientX, o.y - e.clientY); if (h < d) { d = h; mejor = o; } });
        nodos.forEach(o => o.n.classList.toggle('cerca', o === mejor));
    }, { passive: true });

    /* --- 3. EN VARIABLES: TRES LÍNEAS, TRES PIEZAS --- */
    const lineas = [...document.querySelectorAll('.pw-d-cod li[data-p]')], salidas = [...document.querySelectorAll('.pw-d-sal figure')];
    const pintarD = p => {
        const k = String(Math.min(Math.floor(p * 3), 2));
        lineas.forEach(l => l.classList.toggle('on', l.dataset.p === k));
        salidas.forEach(s => s.classList.toggle('on', s.dataset.p === k));
    };

    /* --- 4. EL QR: LOS MÓDULOS SON NODOS, UNIDOS CON SUS VECINOS --- */
    const caja = document.querySelector('[data-qr]'), filas = caja.dataset.qr.split(' '), N = filas.length, Q = 4;
    const lleno = (f, c) => f >= 0 && c >= 0 && f < N && c < N && filas[f][c] === '1';
    const esOjo = (f, c) => (f < 7 && c < 7) || (f < 7 && c >= N - 7) || (f >= N - 7 && c < 7);
    const dib = crear('svg', { viewBox: `0 0 ${N + 2 * Q} ${N + 2 * Q}` });
    const nodo = (tag, attrs, f, c) => { const n = crear(tag, Object.assign({ class: 'n' }, attrs)); n.style.setProperty('--k', (Math.hypot(f - N / 2, c - N / 2) / (N * 0.72)).toFixed(3)); dib.appendChild(n); };
    /* Los tres ojos van enteros, sólidos y sin radio: es lo primero que busca el lector */
    [[0, 0], [0, N - 7], [N - 7, 0]].forEach(([f, c]) => {
        nodo('path', { 'fill-rule': 'evenodd', d: `M${c + Q} ${f + Q}h7v7h-7zM${c + Q + 1} ${f + Q + 1}v5h5v-5z` }, f + 3, c + 3);
        nodo('rect', { x: c + Q + 2, y: f + Q + 2, width: 3, height: 3 }, f + 3, c + 3);
    });
    for (let f = 0; f < N; f++) for (let c = 0; c < N; c++) {
        if (!lleno(f, c) || esOjo(f, c)) continue;
        const x = c + Q + 0.5, y = f + Q + 0.5;
        nodo('circle', { cx: x, cy: y, r: 0.47 }, f, c);
        if (lleno(f, c + 1) && !esOjo(f, c + 1)) nodo('rect', { x, y: y - 0.3, width: 1, height: 0.6 }, f, c);
        if (lleno(f + 1, c) && !esOjo(f + 1, c)) nodo('rect', { x: x - 0.3, y, width: 0.6, height: 1 }, f, c);
    }
    caja.appendChild(dib);

    /* --- 5. AVANCE --- */
    let pedido = 0;
    const cuadro = () => {
        pedido = 0;
        const r = pista.getBoundingClientRect(), p = fijar(-r.top / (r.height - window.innerHeight));
        fijo.style.setProperty('--p', p.toFixed(4));
        pintarB(p); pintarC(p); pintarD(p);
    };
    const pedir = () => { if (!pedido) pedido = requestAnimationFrame(cuadro); };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', () => { armarRet(); pedir(); });

    /* --- 6. VER: VUELVE AL PRINCIPIO, REPITE LA ENTRADA Y RECORRE EL SCROLL SOLO --- */
    let viaje = 0;
    const entrar = () => { html.classList.remove('pw-entra'); void fijo.offsetWidth; html.classList.add('pw-entra'); };
    const ver = () => {
        cancelAnimationFrame(viaje);
        window.scrollTo({ top: 0, behavior: 'instant' });
        entrar();
        if (quieto) return;
        const fin = pista.offsetHeight - window.innerHeight, t0 = performance.now() + 1300, dur = 4200;
        const avanzar = ahora => {
            const k = fijar((ahora - t0) / dur);
            window.scrollTo({ top: Math.round(fin * k), behavior: 'instant' });
            if (k < 1) viaje = requestAnimationFrame(avanzar);
        };
        viaje = requestAnimationFrame(avanzar);
    };
    ['wheel', 'touchstart'].forEach(e => window.addEventListener(e, () => cancelAnimationFrame(viaje), { passive: true }));

    /* --- 7. SELECTOR DE VERSIONES --- */
    const V = {
        a: 'Índice. La misma portada que el 01 y el 02: riel con el dato, retícula, el 03 trazado y las seis decisiones. El capítulo vuelve al sistema. La decisión 08 pasa a tener su propia pantalla.',
        b: 'La barra. Toda la pantalla es el navegador y la dirección es el título. Con el scroll, llego.cl/farma se tacha y se corrige a llegofarma.cl: la decisión 08 es la portada.',
        c: 'Retícula viva. El hero del sitio a sangre con la retícula del manual encima. El nodo del cruce más cercano sigue al cursor, igual que en llegofarma.cl: la portada ya demuestra el sitio.',
        d: 'En variables. El manual escrito en CSS: las líneas reales de llegofarma.cl y lo que dibuja cada una. Es la portada que dice "lo programé yo" sin decirlo.',
        e: 'El QR. Un QR que funciona y lleva al sitio real, dibujado con los nodos de la marca. El visitante hace lo mismo que hacía la gente en el stand de la feria.'
    };
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const elegir = (v, repetir) => {
        if (!V[v]) v = 'a';
        version = v;
        Object.keys(V).forEach(k => html.classList.toggle('pw-v' + k, k === v));
        desc.textContent = V[v];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
        try { localStorage.setItem('pw-version', v); } catch (e) { /* sin almacenamiento, se parte en la 1 */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        try { history.replaceState(null, '', location.pathname + location.search + '#' + v); } catch (e) { /* un visor que no deja cambiar la dirección no corta el cambio */ }
        if (repetir) ver(); else { entrar(); cuadro(); }
    };
    botones.forEach(x => x.addEventListener('click', () => elegir(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', ver);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const n = '12345'.indexOf(e.key);
        if (n >= 0) elegir('abcde'[n], true);
        else if (e.key === 'r' || e.key === 'R') ver();
    });
    /* Los índices no llevan a ninguna parte en la exploración */
    document.querySelectorAll('.lf-indice a').forEach(a => a.addEventListener('click', ev => ev.preventDefault()));

    armarRet();
    let guardada = null;
    try { guardada = localStorage.getItem('pw-version'); } catch (e) { /* sin almacenamiento */ }
    elegir(location.hash.slice(1) || guardada || 'a', false);
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DE LA PORTADA DEL CAPÍTULO 03 (.pw)
   ======================================================= */
