/* =======================================================
   INICIO JS · EXPLORACIÓN DEL PASO DE LA 01 A LA 02 (.p2)
   ======================================================= */
/* La mecánica común: la 02 sube 100lvh sobre el final de la pista de la 01 (que termina sus pasos antes), así la última
   pantalla de la 01 es una ventana con el mapa quieto. En esa ventana --t va de 0 a 1 según cuánto subió la 02. En la
   versión A (la hoja) la 02 sube tal cual; en las demás su panel queda fijo en pantalla durante la ventana (.p2-ventana)
   y cada versión lo revela a su modo; al terminar, el panel vuelve a ser sticky en el mismo lugar, sin salto.
   Este script mide lo que cada versión necesita (el espacio de la 02 en el mapa, su flecha, el logotipo de la madre en
   la ficha y en la lámina) y escribe --t y --e (t con curva) en el documento. El resto lo hace el CSS */
(function () {
    const html = document.documentElement;
    const d1 = document.getElementById('dec-01'), d2 = document.getElementById('dec-02');
    if (!d1 || !d2) return;
    const panel = d2.querySelector('.cs-fijo'), espacio = d1.querySelector('.lf-mapa-libre a[href="#dec-02"]');
    const flecha = espacio && espacio.querySelector('i');
    const ficha = d1.querySelector('.lf-mapa-llego'), lamina = d2.querySelector('.lf-taller-madre'), logo = d2.querySelector('.lf-taller-llego');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const px = v => v.toFixed(1) + 'px';
    const vh = () => window.innerHeight;
    let version = 'd';

    /* --- 1. MEDIDAS DE LA VENTANA --- */
    /* Se toman con el mapa quieto: el panel de la 01 está fijo y la 02, fija o no, ocupa la pantalla entera */
    const medir = () => {
        const W = window.innerWidth, H = vh();
        if (espacio) {
            const r = espacio.getBoundingClientRect();
            /* Recorte del espacio: los cuatro lados medidos desde el borde de la pantalla */
            html.style.setProperty('--p2-et', px(r.top)); html.style.setProperty('--p2-er', px(W - r.right));
            html.style.setProperty('--p2-eb', px(H - r.bottom)); html.style.setProperty('--p2-el', px(r.left));
        }
        if (flecha) {
            const r = flecha.getBoundingClientRect();
            html.style.setProperty('--p2-px', px(r.left + r.width / 2)); html.style.setProperty('--p2-py', px(r.top + r.height / 2));
            /* El círculo final cubre la esquina más lejana */
            const x = r.left + r.width / 2, y = r.top + r.height / 2;
            html.style.setProperty('--p2-pr', px(Math.hypot(Math.max(x, W - x), Math.max(y, H - y)) + 2));
        }
        /* Sin los recortes ni el viaje del logotipo: se mide cada cosa en su lugar */
        html.classList.add('p2-midiendo');
        if (ficha && lamina && logo) {
            /* La lámina parte recortada a la ficha del logotipo; el logotipo viaja de la ficha a la lámina */
            const f = ficha.parentElement.getBoundingClientRect(), l = lamina.getBoundingClientRect();
            html.style.setProperty('--p2-mt', px(f.top - l.top)); html.style.setProperty('--p2-mr', px(l.right - f.right));
            html.style.setProperty('--p2-mb', px(l.bottom - f.bottom)); html.style.setProperty('--p2-ml', px(f.left - l.left));
            /* Las dos máscaras usan contain: se compara la caja real del logotipo (200 × 77) en cada lugar */
            const caja = r => { const w = Math.min(r.width, r.height * 200 / 77); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w }; };
            const a = caja(ficha.getBoundingClientRect()), b = caja(logo.getBoundingClientRect());
            html.style.setProperty('--p2-lx', px(a.x - b.x)); html.style.setProperty('--p2-ly', px(a.y - b.y));
            html.style.setProperty('--p2-ls', (a.w / b.w).toFixed(4));
        }
        html.classList.remove('p2-midiendo');
    };

    /* --- 2. AVANCE: --t SEGÚN CUÁNTO SUBIÓ LA 02 --- */
    let ultimo = -1, medido = false;
    const cuadro = () => {
        const top = d2.getBoundingClientRect().top;
        const t = fijar(1 - top / vh());
        const ventana = t > 0 && t < 1;
        /* Al entrar en la ventana se mide, con todo en su lugar */
        if (ventana && !medido) { html.classList.add('p2-ventana'); medir(); medido = true; }
        if (!ventana) medido = false;
        html.classList.toggle('p2-ventana', ventana);
        html.classList.toggle('p2-antes', t <= 0);
        if (t === ultimo) return;
        ultimo = t;
        html.style.setProperty('--t', t.toFixed(4));
        html.style.setProperty('--e', curva(t).toFixed(4));
        /* Curvas que parten más tarde: --e2 deja ver la marca antes de abrir, --e3 trae lo que llega detrás */
        html.style.setProperty('--e2', curva(fijar((t - 0.15) / 0.85)).toFixed(4));
        html.style.setProperty('--e3', curva(fijar((t - 0.35) / 0.65)).toFixed(4));
    };
    let pedido = null;
    const pedir = () => { if (!pedido) pedido = requestAnimationFrame(() => { pedido = null; cuadro(); }); };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', () => { medido = false; pedir(); });

    /* --- 3. VER EL PASO: VUELVE AL INICIO DE LA VENTANA Y LA RECORRE SOLO --- */
    let viaje = null;
    const verElPaso = () => {
        cancelAnimationFrame(viaje);
        const inicio = Math.round(window.scrollY + d2.getBoundingClientRect().top - vh() * 1.15);
        const fin = inicio + Math.round(vh() * 1.15);
        window.scrollTo({ top: inicio, behavior: 'instant' });
        if (quieto) { window.scrollTo({ top: fin, behavior: 'instant' }); return; }
        const t0 = performance.now() + 350, dur = 1700;
        const paso = ahora => {
            const k = fijar((ahora - t0) / dur);
            window.scrollTo({ top: Math.round(inicio + (fin - inicio) * (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2)), behavior: 'instant' });
            if (k < 1) viaje = requestAnimationFrame(paso);
        };
        viaje = requestAnimationFrame(paso);
    };
    /* La rueda o el teclado cortan el recorrido */
    ['wheel', 'touchstart'].forEach(e => window.addEventListener(e, () => cancelAnimationFrame(viaje), { passive: true }));

    /* --- 4. SELECTOR DE VERSIONES --- */
    const V = {
        a: 'La hoja. La 02 sube sobre el mapa quieto, que se apaga un poco debajo: el mismo paso que lleva de la portada del capítulo a la 01.',
        b: 'El espacio se abre. El espacio "Un sistema gráfico" del mapa se marca y se abre hasta la pantalla: la 02 aparece por la ventana que el mapa le dejó.',
        c: 'El punto. La flecha del espacio de la 02 se vuelve un punto que crece y trae la 02: los puntos empiezan antes que su decisión.',
        d: 'La madre pasa. El logotipo deja su ficha en el mapa y se vuelve la lámina morada con que abre la 02; el resto llega detrás.',
        e: 'Fundido. Sin costura: el mapa se retira, el papel se oscurece y la 02 entra en el mismo lugar.',
        f: 'El filo. Una línea turquesa sube por la pantalla y descubre la 02 en su lugar, con el nombre de la decisión en el borde.'
    };
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const activar = (v, ver) => {
        if (!V[v]) v = 'd';
        version = v;
        Object.keys(V).forEach(k => html.classList.toggle('p2-v-' + k, k === v));
        desc.textContent = V[v];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
        try { localStorage.setItem('p2-version', v); } catch (e) { /* sin almacenamiento, se parte en la D */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        try { history.replaceState(null, '', location.pathname + location.search + '#' + v); } catch (e) { /* un visor que no deja cambiar la dirección no corta el cambio */ }
        medido = false; ultimo = -1;
        requestAnimationFrame(() => { window.dispatchEvent(new Event('resize')); if (ver) verElPaso(); else cuadro(); });
    };
    botones.forEach(x => x.addEventListener('click', () => activar(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', verElPaso);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const n = '123456'.indexOf(e.key);
        if (n >= 0) activar('abcdef'[n], true);
        else if (e.key === 'r' || e.key === 'R') verElPaso();
    });
    /* Los espacios libres del mapa: aquí solo están la 02 y la 03 */
    document.querySelectorAll('.lf-mapa-libre a').forEach(a => a.addEventListener('click', ev => {
        ev.preventDefault();
        const destino = document.querySelector(a.getAttribute('href'));
        if (destino) window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY, behavior: quieto ? 'auto' : 'smooth' });
    }));

    let guardada = null;
    try { guardada = localStorage.getItem('p2-version'); } catch (e) { /* sin almacenamiento */ }
    activar(location.hash.slice(1) || guardada || 'd', false);
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DEL PASO DE LA 01 A LA 02 (.p2)
   ======================================================= */
