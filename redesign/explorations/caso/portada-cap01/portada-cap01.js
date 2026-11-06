/* =======================================================
   INICIO JS · TRES PORTADAS PARA EL CAPÍTULO 01 (.pp)
   ======================================================= */
/* Va después de llego.js y antes del motor. La página parte en el resumen (sin hero), así que aquí se prende .lf-paso
   en escritorio para que la escena del capítulo haga el paso Nodo del caso. Esa escena se envuelve: además de abrir la
   portada, cada cuadro escribe lo propio de cada dirección, con el mismo resorte de 90 ms:
   --pp-i (0,40 a 0,62) entra el índice, --pp-f (0,30 a 0,64) corre el calendario y --pp-x (0,20 a 0,67) mueve la cinta de láminas cuando la portada ya está abierta */
(function () {
    const html = document.documentElement, cap = document.querySelector('.lf-cap-1'), res = document.querySelector('.lf-res');
    if (!cap || !res || !window.CASO_ESCENAS || !window.CASO_ESCENAS.capitulo) return;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
    const fijo = cap.querySelector('[data-cap]'), cinta = cap.querySelector('.pp-cinta'), TAU = 90;

    /* --- 1. EL PASO SIN HERO --- */
    const paso = () => html.classList.toggle('lf-paso', !movil.matches && !quieto);
    paso(); movil.addEventListener('change', paso);

    /* --- 2. LO PROPIO DE CADA PORTADA, SOBRE LA ESCENA DEL CASO --- */
    let meta = 0, ver = 0, ult = 0, bucle = 0, recorrido = 0;
    const medir = () => { recorrido = Math.max(cinta.scrollWidth - window.innerWidth, 0); };
    const pintar = p => {
        fijo.style.setProperty('--pp-i', fijar((p - 0.4) / 0.22).toFixed(4));
        fijo.style.setProperty('--pp-f', curva(fijar((p - 0.3) / 0.34)).toFixed(4));
        fijo.style.setProperty('--pp-x', (curva(fijar((p - 0.2) / 0.47)) * recorrido).toFixed(1));
    };
    const seguir = ahora => {
        const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora;
        ver += (meta - ver) * (1 - Math.exp(-dt / TAU));
        if (Math.abs(meta - ver) < 0.0004) ver = meta;
        pintar(ver);
        if (ver !== meta) bucle = requestAnimationFrame(seguir);
        else { bucle = 0; ult = 0; }
    };
    const delCaso = window.CASO_ESCENAS.capitulo;
    window.CASO_ESCENAS.capitulo = (el, h) => {
        const f = delCaso(el, h);
        return p => { if (f) f(p); meta = p; if (!bucle) bucle = requestAnimationFrame(seguir); };
    };
    window.addEventListener('load', () => { medir(); pintar(ver); });
    window.addEventListener('resize', () => { medir(); pintar(ver); });

    /* --- 3. CAMBIAR DE PORTADA --- */
    const V = {
        indice: 'El capítulo trae su índice: las tres decisiones que vienen, cada una un enlace, entran en la pausa antes de que suba la primera. El dato del riel lo resume: del brief al pitch, 9 días.',
        dias: 'La retícula se vuelve calendario: la línea es el eje del 19 al 28 de agosto y el avance corre por los días como el mensajero del resumen, prendiendo el brief, el diagnóstico y el pitch con sus decisiones.',
        laminas: 'La portada muestra el pitch real: nueve de las once láminas del 28 de agosto pasan en una cinta con el scroll, como el sitio en el hero. Quedan fuera la 2 (los años de Llegó) y la 9 (los descartes).'
    };
    const ORDEN = Object.keys(V), botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    /* Vuelve al último hito del resumen, poco antes de que la portada empiece a abrirse */
    const desdeElResumen = () => {
        const r = res.getBoundingClientRect(), tramo = +res.dataset.tramo || 1, alto = r.height - window.innerHeight;
        window.scrollTo({ top: Math.round(window.scrollY + r.top + (0.04 + 0.9 * 5.5 / 6) * alto * tramo), behavior: 'instant' });
    };
    const activar = (nombre, volver) => {
        if (!V[nombre]) nombre = 'indice';
        ORDEN.forEach(k => html.classList.toggle('pp-v-' + k, k === nombre));
        desc.textContent = V[nombre];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === nombre)));
        try { localStorage.setItem('pp-portada', nombre); } catch (e) { /* sin almacenamiento, se parte en Índice */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        history.replaceState(null, '', location.pathname + location.search + '#' + nombre);
        requestAnimationFrame(() => { medir(); pintar(ver); if (volver) desdeElResumen(); });
    };
    botones.forEach(x => x.addEventListener('click', () => activar(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', desdeElResumen);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const i = +e.key;
        if (i >= 1 && i <= ORDEN.length) activar(ORDEN[i - 1], true);
        else if (e.key === 'r' || e.key === 'R') desdeElResumen();
    });
    let guardada = null;
    try { guardada = localStorage.getItem('pp-portada'); } catch (e) { /* sin almacenamiento */ }
    activar(location.hash.slice(1) || guardada || 'indice', false);
})();
/* =======================================================
   FIN JS · TRES PORTADAS PARA EL CAPÍTULO 01 (.pp)
   ======================================================= */
