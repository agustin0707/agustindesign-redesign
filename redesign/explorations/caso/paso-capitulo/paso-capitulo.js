/* =======================================================
   INICIO JS · TRES PASOS DEL RESUMEN AL CAPÍTULO 01 (.pc)
   ======================================================= */
/* Va después de llego.js y antes del motor: agrega la escena "capitulo". Su avance p (0 a 1) se reparte en dos
   mitades: hasta 0,5 la portada se abre sobre el resumen quieto (cada dirección a su manera) y desde ahí se traza el
   01, crece la retícula y entra el título. Las cajas de origen se miden relativas al panel del resumen, que mientras
   tanto está fijo arriba */
(function () {
    const res = document.querySelector('.lf-res'), cap = document.querySelector('.pc-cap');
    if (!res || !cap || !window.CASO_ESCENAS) return;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const html = document.documentElement, fijo = cap.querySelector('[data-cap]'), panel = res.querySelector('.lf-res-panel');
    const nodo = res.querySelectorAll('.lf-hitos li')[1], tarjeta = res.querySelector('.lf-etapas a');
    const px = v => v.toFixed(2) + 'px';
    let caja = null, ultimo = 0;
    const medir = () => {
        const pr = panel.getBoundingClientRect(), n = nodo.querySelector('i').getBoundingClientRect(), t = tarjeta.getBoundingClientRect();
        caja = { W: window.innerWidth, H: window.innerHeight,
            nx: n.left + n.width / 2, ny: n.top - pr.top + n.height / 2,
            t: { l: t.left, t: t.top - pr.top, r: window.innerWidth - t.right, b: window.innerHeight - (t.bottom - pr.top) } };
    };

    /* --- 1. LAS TRES DIRECCIONES --- */
    const V = {
        nodo: {
            desc: 'La portada sale del hito del pitch (28 ago): el nodo se llena de ella y crece desde su centro hasta cubrir la pantalla. El capítulo es un hito de la ruta.',
            abrir: r => {
                /* Primero el nodo se llena (hasta su radio de 6,5 px) y después crece con curva firme hasta la esquina más lejana */
                const R = Math.hypot(Math.max(caja.nx, caja.W - caja.nx), Math.max(caja.ny, caja.H - caja.ny));
                const radio = r < 0.08 ? 6.5 * (r / 0.08) : 6.5 + (R - 6.5) * curva((r - 0.08) / 0.92);
                fijo.style.setProperty('--pc-r', px(radio)); fijo.style.setProperty('--pc-x', px(caja.nx)); fijo.style.setProperty('--pc-y', px(caja.ny));
                nodo.classList.toggle('pc-elegido', r > 0);
            },
            salir: () => nodo.classList.remove('pc-elegido')
        },
        indice: {
            desc: 'La tarjeta "01 El pitch" del índice del resumen se llena y crece hasta ser la portada; su rótulo la acompaña y se apaga.',
            abrir: r => {
                const k = curva(fijar((r - 0.06) / 0.94)), c = caja.t;
                fijo.style.setProperty('--pc-it', px(c.t * (1 - k))); fijo.style.setProperty('--pc-ir', px(c.r * (1 - k)));
                fijo.style.setProperty('--pc-ib', px(c.b * (1 - k))); fijo.style.setProperty('--pc-il', px(c.l * (1 - k)));
                fijo.style.setProperty('--pc-ro', fijar(1 - k * 4).toFixed(3));
            }
        },
        reticula: {
            desc: 'La portada sube en las cuatro columnas de la retícula de Llegó, desfasadas de izquierda a derecha, y las líneas de la retícula quedan.',
            abrir: r => {
                for (let i = 0; i < 4; i++) fijo.style.setProperty('--pc-t' + i, ((1 - curva(fijar((r - i * 0.12) / 0.64))) * 100).toFixed(3) + '%');
            }
        }
    };
    const ORDEN = Object.keys(V);
    let actual = null;

    /* --- 2. EL CUADRO DE LA ESCENA --- */
    const pintar = p => {
        ultimo = p;
        if (!actual) return;
        if (!caja) medir();
        html.classList.toggle('pc-abre', p > 0.0005);
        V[actual].abrir(fijar(p / 0.5));
        /* Lo de adentro empieza antes de que termine de abrir, así la portada nunca queda vacía */
        fijo.style.setProperty('--pc-l', curva(fijar((p - 0.34) / 0.3)).toFixed(4));
        fijo.style.setProperty('--pc-d', curva(fijar((p - 0.38) / 0.42)).toFixed(4));
        fijo.style.setProperty('--pc-t', curva(fijar((p - 0.48) / 0.26)).toFixed(4));
    };
    window.CASO_ESCENAS.capitulo = () => pintar;

    /* --- 3. CAMBIAR DE DIRECCIÓN --- */
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    /* Vuelve al hito 05 del resumen, poco antes de que la portada empiece a abrirse */
    const desdeElResumen = () => {
        const r = res.getBoundingClientRect(), tramo = +res.dataset.tramo || 1, recorrido = (r.height - window.innerHeight) * tramo;
        window.scrollTo({ top: Math.round(window.scrollY + r.top + (0.04 + 0.9 * 4.5 / 6) * recorrido), behavior: 'instant' });
    };
    const activar = (nombre, volver) => {
        if (!V[nombre]) nombre = 'nodo';
        if (actual && V[actual].salir) V[actual].salir();
        ORDEN.forEach(k => html.classList.toggle('pc-v-' + k, k === nombre));
        actual = nombre;
        desc.textContent = V[nombre].desc;
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === nombre)));
        try { localStorage.setItem('pc-paso', nombre); } catch (e) { /* sin almacenamiento, se parte en Nodo */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        history.replaceState(null, '', location.pathname + location.search + '#' + nombre);
        pintar(ultimo);
        if (volver) requestAnimationFrame(desdeElResumen);
    };
    botones.forEach(x => x.addEventListener('click', () => activar(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', desdeElResumen);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const i = +e.key;
        if (i >= 1 && i <= ORDEN.length) activar(ORDEN[i - 1], true);
        else if (e.key === 'r' || e.key === 'R') desdeElResumen();
    });
    window.addEventListener('resize', () => { caja = null; pintar(ultimo); });
    let guardada = null;
    try { guardada = localStorage.getItem('pc-paso'); } catch (e) { /* sin almacenamiento */ }
    activar(location.hash.slice(1) || guardada || 'nodo', false);
})();
/* =======================================================
   FIN JS · TRES PASOS DEL RESUMEN AL CAPÍTULO 01 (.pc)
   ======================================================= */
