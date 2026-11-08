/* =======================================================
   INICIO JS · EXPLORACIÓN DEL PASO A LA PORTADA DEL CAPÍTULO 02 (.pc)
   ======================================================= */
/* La mecánica común: la portada sube 100lvh sobre el final de la pista de la 03 (que termina su pieza antes), así la
   última pantalla de la 03 es una ventana con la paleta quieta. u cuenta cuántas pantallas subió la portada: de 0 a 1
   es la ventana (--pc-t), y después entra lo de la portada y al final sube la 04. En la versión A (la hoja) la portada
   sube tal cual; en las otras su panel queda fijo durante la ventana (.pc-ventana) y cada versión lo revela a su modo.
   Solo en escritorio y con movimiento (.pc-paso); sin el paso la portada mide 200 y sube como hoja, entera */
(function () {
    const html = document.documentElement;
    const cap = document.getElementById('cap-2'), d3 = document.getElementById('dec-03');
    if (!cap || !d3) return;
    const oscuro = d3.querySelectorAll('.lf-val-tono')[2];
    const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const tramo = (v, a, b) => fijar((v - a) / (b - a));
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const px = v => v.toFixed(1) + 'px';
    const PISTA = 340, BASE = 200;
    const VARS = ['--pc-t', '--pc-e', '--pc-plano', '--pc-r', '--lf-pl', '--lf-pd', '--lf-pt', '--lf-pi', '--lf-ps'];
    const g = { R: 1 };
    let paso = false, medido = false, ultimo = -1, version = 'b';

    /* --- 1. MEDIDAS DE LA VENTANA: EL TONO OSCURO, CON LA PALETA QUIETA --- */
    const medir = () => {
        if (!oscuro) return;
        const W = window.innerWidth, H = window.innerHeight, r = oscuro.getBoundingClientRect();
        cap.style.setProperty('--pc-et', px(r.top)); cap.style.setProperty('--pc-er', px(W - r.right));
        cap.style.setProperty('--pc-eb', px(H - r.bottom)); cap.style.setProperty('--pc-el', px(r.left));
        /* El nodo nace en el centro del tono y su círculo final cubre la esquina más lejana */
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        cap.style.setProperty('--pc-px', px(x)); cap.style.setProperty('--pc-py', px(y));
        g.R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 2;
    };
    /* Primero el punto se llena (hasta 6,5 px, como el hito del 01) y después crece con curva firme */
    const radio = t => (t < 0.08 ? 6.5 * t / 0.08 : 6.5 + (g.R - 6.5) * curva((t - 0.08) / 0.92));

    /* --- 2. AVANCE: u SEGÚN CUÁNTO SUBIÓ LA PORTADA --- */
    let pedido = 0;
    const cuadro = () => {
        pedido = 0;
        if (!paso) return;
        const u = 1 - cap.getBoundingClientRect().top / window.innerHeight;
        const t = fijar(u), ventana = t > 0 && t < 1;
        /* Al entrar en la ventana se mide, con la paleta en su lugar */
        if (ventana && !medido) { html.classList.add('pc-ventana'); medir(); medido = true; }
        if (!ventana) medido = false;
        html.classList.toggle('pc-ventana', ventana);
        if (u === ultimo) return;
        ultimo = u;
        const fase = (n, v) => cap.style.setProperty(n, v.toFixed(4));
        fase('--pc-t', t); fase('--pc-e', curva(t));
        fase('--pc-plano', 1 - tramo(t, 0.45, 0.95));
        cap.style.setProperty('--pc-r', px(radio(t)));
        /* Lo de la portada empieza antes de terminar de abrir, así nunca queda vacía */
        fase('--lf-pl', tramo(u, 0.55, 1.2));
        fase('--lf-pd', tramo(u, 0.6, 1.5));
        fase('--lf-pt', tramo(u, 0.8, 1.3));
        fase('--lf-pi', tramo(u, 1.25, 1.85));
        /* La hoja de la 04 sube en la última pantalla de la pista */
        fase('--lf-ps', fijar(u - (PISTA / 100 - 1)));
    };
    const pedir = () => { if (!pedido) pedido = requestAnimationFrame(cuadro); };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', () => { medido = false; pedir(); });

    /* --- 3. ENTRA Y SALE CON EL ANCHO --- */
    /* Corre antes que caso-motor.js: el motor mide la pista ya decidida */
    const activar = () => {
        paso = !movil.matches && !quieto;
        html.classList.toggle('pc-paso', paso);
        cap.style.setProperty('--pista', String(paso ? PISTA : BASE));
        if (!paso) { VARS.forEach(v => cap.style.removeProperty(v)); html.classList.remove('pc-ventana'); }
        ultimo = -1; medido = false; pedir();
    };
    movil.addEventListener('change', () => { activar(); window.dispatchEvent(new Event('resize')); });
    activar();

    /* --- 4. VER EL PASO: VUELVE AL INICIO DE LA VENTANA Y LA RECORRE SOLO --- */
    let viaje = 0;
    const verElPaso = () => {
        cancelAnimationFrame(viaje);
        const vh = window.innerHeight, base = window.scrollY + cap.getBoundingClientRect().top;
        const inicio = Math.round(base - vh * 1.1), fin = Math.round(base + vh * 0.9);
        window.scrollTo({ top: inicio, behavior: 'instant' });
        if (quieto) { window.scrollTo({ top: fin, behavior: 'instant' }); return; }
        const t0 = performance.now() + 350, dur = 2400;
        const paso1 = ahora => {
            const k = fijar((ahora - t0) / dur);
            window.scrollTo({ top: Math.round(inicio + (fin - inicio) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)), behavior: 'instant' });
            if (k < 1) viaje = requestAnimationFrame(paso1);
        };
        viaje = requestAnimationFrame(paso1);
    };
    /* La rueda o el dedo cortan el recorrido */
    ['wheel', 'touchstart'].forEach(e => window.addEventListener(e, () => cancelAnimationFrame(viaje), { passive: true }));

    /* --- 5. SELECTOR DE VERSIONES --- */
    const V = {
        a: 'La hoja. La portada sube sobre la paleta quieta, que se apaga un poco debajo: el mismo gesto con que la 01 sube sobre la portada del 01.',
        b: 'El oscuro se abre. El tono Oscuro de la paleta (#104E56, el del texto) se abre hasta la pantalla y se vuelve el fondo del capítulo; después se traza el 02 y entra el índice.',
        c: 'El nodo. Como la portada del 01: un punto se llena en el tono Oscuro y crece hasta cubrir la pantalla. Los capítulos abren con el nodo y las decisiones con el filo.'
    };
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const elegir = (v, ver) => {
        if (!V[v]) v = 'b';
        version = v;
        Object.keys(V).forEach(k => html.classList.toggle('pc-v-' + k, k === v));
        desc.textContent = V[v];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
        try { localStorage.setItem('pc-version', v); } catch (e) { /* sin almacenamiento, se parte en la B */ }
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
    /* El índice: aquí solo está la 04; las demás no llevan a ninguna parte (con <base href> irían a otra página) */
    cap.querySelectorAll('.lf-indice a').forEach(a => a.addEventListener('click', ev => {
        if (!document.querySelector(a.getAttribute('href'))) ev.preventDefault();
    }));

    let guardada = null;
    try { guardada = localStorage.getItem('pc-version'); } catch (e) { /* sin almacenamiento */ }
    elegir(location.hash.slice(1) || guardada || 'b', false);
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DEL PASO A LA PORTADA DEL CAPÍTULO 02 (.pc)
   ======================================================= */
