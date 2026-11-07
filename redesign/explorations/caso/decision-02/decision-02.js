/* =======================================================
   INICIO JS · EXPLORACIÓN DE LA DECISIÓN 02: EL TALLER DEL NODO (.d2)
   ======================================================= */
/* Va después de llego.js y antes del motor. Suma la escena del taller a las del caso (pasa tal cual a llego.js) y el
   selector de la exploración, que cambia entre el taller y la pieza actual: la elegida queda justo después del mapa */
(function () {
    /* --- 1. LA ESCENA: EL TALLER DEL NODO --- */
    /* Mide la mesa y escribe la geometría: el paso de la trama (--P) parte cada tercio en un número entero de pasos,
       así el centro de los tres tercios (Farma, minería y food) cae sobre la trama. El nodo central (--cx, --cy) es el
       de Farma; los pasos 2 y 3 lo acercan al centro de la mesa. Dibuja la trama con los campos de la madre en los
       bordes (lámina 05) y escribe el paso actual en data-k: el resto lo hace el CSS */
    const taller = (el, h) => {
        const pieza = el.querySelector('.lf-taller'), mesa = el.querySelector('[data-taller]'), trama = el.querySelector('[data-trama]');
        if (!pieza || !mesa || !trama) return null;
        const azar = (i, j, s) => { const x = Math.sin(i * 12.9898 + j * 78.233 + s * 37.719) * 43758.5453; return x - Math.floor(x); };
        /* Los campos de puntos, en fracciones de la mesa: arriba a la izquierda, arriba al centro, a la derecha y abajo */
        const campos = [[0, 0, 0.34, 0.3], [0.56, 0, 0.8, 0.18], [0.86, 0.3, 1, 1], [0.18, 0.82, 0.36, 1]];
        const px = v => v.toFixed(2) + 'px';
        let ancho = 0, alto = 0;
        const medir = () => {
            const W = mesa.clientWidth, H = mesa.clientHeight;
            if (!W || !H || (W === ancho && H === alto)) return;
            ancho = W; alto = H;
            const P = W / 3 / Math.max(4, Math.round(W / 3 / 34)), cx = W / 6, cy = H * 0.34;
            const rd = Math.max(1.6, P * 0.07), PZ = Math.min(H * 0.19, W * 0.15, 120), Z = PZ / P;
            const v = {
                '--P': px(P), '--cx': px(cx), '--cy': px(cy), '--Z': Z.toFixed(4), '--PZ': px(PZ), '--s0': (rd / (P * 0.335)).toFixed(4),
                '--t1x': px(W / 2 - Z * cx), '--t1y': px(H / 2 - Z * (cy + P / 2)), '--t2x': px(W / 2 - Z * cx), '--t2y': px(H / 2 - Z * cy)
            };
            Object.keys(v).forEach(k => mesa.style.setProperty(k, v[k]));
            /* La trama: cada punto sabe si es de un campo (--o, su intensidad) y cuánto espera para ordenarse (--d) */
            const i0 = Math.ceil((rd * 4 - cx) / P), i1 = Math.floor((W - rd * 4 - cx) / P);
            const j0 = Math.ceil((rd * 4 - cy) / P), j1 = Math.floor((H - rd * 4 - cy) / P);
            let puntos = '';
            for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
                const x = cx + i * P, y = cy + j * P, u = x / W, w = y / H;
                const dist = Math.min(...campos.map(([a, b, c, d]) => Math.hypot(Math.max(a - u, 0, u - c) * W / P, Math.max(b - w, 0, w - d) * H / P)));
                const campo = dist === 0 || (dist < 2 && azar(i, j, 1) > dist / 2);
                /* Dentro de los espacios de minería y food: la trama que queda encendida en el paso 4 */
                const hueco = Math.abs(y - cy) < P * 1.6 && [W / 2, W * 5 / 6].some(hx => Math.abs(x - hx) < P * 1.6);
                const espera = Math.min(Math.round(Math.hypot(i, j) * 22), 420);
                puntos += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rd.toFixed(2)}"${campo || hueco ? ` class="${campo ? 'f' : ''}${hueco ? ' h' : ''}"` : ''} style="--d:${espera}${campo ? ';--o:' + (0.45 + 0.55 * azar(i, j, 2)).toFixed(2) : ''}"/>`;
            }
            /* Las cajas del isotipo: la de Farma se ve con la lente cerca, así que su trazo y su punteado se dividen por Z */
            const lado = P * 3.2692, r = (lado * 0.24).toFixed(1), caja = (hx, clase, z) => `<rect class="${clase}" x="${(hx - lado / 2).toFixed(1)}" y="${(cy - lado / 2).toFixed(1)}" width="${lado.toFixed(1)}" height="${lado.toFixed(1)}" rx="${r}" stroke-width="${(1 / z).toFixed(3)}" stroke-dasharray="${(4 / z).toFixed(2)} ${(4 / z).toFixed(2)}"/>`;
            trama.setAttribute('viewBox', `0 0 ${W} ${H}`);
            trama.innerHTML = puntos + caja(cx, 'caja', Z) + caja(W / 2, 'hueco', 1) + caja(W * 5 / 6, 'hueco', 1);
        };
        medir();
        let espera = null;
        window.addEventListener('resize', () => { cancelAnimationFrame(espera); espera = requestAnimationFrame(medir); });
        let actual = -1;
        return p => {
            const k = Math.min(Math.floor(h.fijar(p) * 4), 3);
            if (k === actual) return;
            actual = k; pieza.dataset.k = k;
            /* Si la mesa se midió oculta, se mide al llegar */
            if (!ancho) medir();
        };
    };
    window.CASO_ESCENAS = Object.assign(window.CASO_ESCENAS || {}, { taller });

    /* --- 2. SELECTOR DE LA EXPLORACIÓN --- */
    const mapa = document.getElementById('dec-01'), nuevo = document.getElementById('dec-02'), actual = document.getElementById('dec-02-actual');
    if (!mapa || !nuevo || !actual) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* Ver de nuevo: al inicio de la decisión 02 */
    const desdeElInicio = () => {
        const s = nuevo.classList.contains('d2-oculta') ? actual : nuevo;
        window.scrollTo({ top: Math.round(window.scrollY + s.getBoundingClientRect().top), behavior: 'instant' });
    };
    const V = {
        taller: 'La decisión como el taller del nodo: los puntos de la madre se ordenan, dos puntos y un conector forman el nodo con sus dos lecturas, la misma regla arma el isotipo y deja el espacio de las verticales que vienen.',
        actual: 'La pieza que está hoy en el caso: la trama blanca, una red de líneas y los círculos vacíos, para comparar.'
    };
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const activar = (nombre, volver) => {
        if (!V[nombre]) nombre = 'taller';
        const sale = nombre === 'taller' ? actual : nuevo, entra = nombre === 'taller' ? nuevo : actual;
        mapa.after(entra);
        entra.classList.remove('d2-oculta'); sale.classList.add('d2-oculta');
        desc.textContent = V[nombre];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === nombre)));
        try { localStorage.setItem('d2-pieza', nombre); } catch (e) { /* sin almacenamiento, se parte en el taller */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        try { history.replaceState(null, '', location.pathname + location.search + '#' + nombre); } catch (e) { /* un visor que no deja cambiar la dirección no corta el cambio */ }
        /* El motor vuelve a medir las pistas con el cambio de tamaño */
        requestAnimationFrame(() => { window.dispatchEvent(new Event('resize')); if (volver) desdeElInicio(); });
    };
    botones.forEach(x => x.addEventListener('click', () => activar(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', desdeElInicio);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === '1') activar('taller', true);
        else if (e.key === '2') activar('actual', true);
        else if (e.key === 'r' || e.key === 'R') desdeElInicio();
    });
    /* Los espacios libres del mapa: aquí solo están la 02 y la 03 */
    document.querySelectorAll('.lf-mapa-libre a').forEach(a => a.addEventListener('click', ev => {
        ev.preventDefault();
        const destino = document.querySelector(a.getAttribute('href'));
        if (destino) window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY, behavior: quieto ? 'auto' : 'smooth' });
    }));

    let guardada = null;
    try { guardada = localStorage.getItem('d2-pieza'); } catch (e) { /* sin almacenamiento */ }
    activar(location.hash.slice(1) || guardada || 'taller', false);
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DE LA DECISIÓN 02: EL TALLER DEL NODO (.d2)
   ======================================================= */
