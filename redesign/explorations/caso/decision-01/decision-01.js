/* =======================================================
   INICIO JS · EXPLORACIÓN DE LA DECISIÓN 01: EL MAPA (.d1)
   ======================================================= */
/* Va después de llego.js y antes del motor. La página parte en el resumen (sin hero), así que aquí se prende .lf-paso en
   escritorio para que la decisión suba como hoja sobre la portada del capítulo, igual que en el caso. El selector cambia
   entre el mapa y la pieza actual: la elegida queda justo después de la portada (la hoja sube solo sobre su vecina) */
(function () {
    const html = document.documentElement, cap = document.querySelector('.lf-cap-1');
    const mapa = document.getElementById('dec-01'), actual = document.getElementById('dec-01-actual');
    if (!cap || !mapa || !actual) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');

    /* --- 1. EL PASO SIN HERO --- */
    const paso = () => html.classList.toggle('lf-paso', !movil.matches && !quieto);
    paso(); movil.addEventListener('change', paso);

    /* --- 2. VER DE NUEVO: VUELVE A LA PORTADA, POCO ANTES DE QUE SUBA LA HOJA --- */
    const desdeLaPortada = () => {
        const r = cap.getBoundingClientRect(), alto = r.height - window.innerHeight;
        const f = html.classList.contains('lf-paso') ? 0.58 : 0;
        window.scrollTo({ top: Math.round(window.scrollY + r.top + f * alto), behavior: 'instant' });
    };

    /* --- 3. CAMBIAR DE PIEZA --- */
    const V = {
        mapa: 'La decisión como mapa del caso: la madre entra pieza por pieza, se dibujan los cuatro espacios libres (cada uno lleva a su decisión) y el quinto, el hallazgo, pasa a tipografía grande.',
        actual: 'La pieza que está hoy en el caso: dos listas y el hallazgo en un recuadro, para comparar.'
    };
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const activar = (nombre, volver) => {
        if (!V[nombre]) nombre = 'mapa';
        const sale = nombre === 'mapa' ? actual : mapa, entra = nombre === 'mapa' ? mapa : actual;
        cap.after(entra);
        entra.classList.remove('d1-oculta'); sale.classList.add('d1-oculta');
        desc.textContent = V[nombre];
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === nombre)));
        try { localStorage.setItem('d1-pieza', nombre); } catch (e) { /* sin almacenamiento, se parte en el mapa */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        try { history.replaceState(null, '', location.pathname + location.search + '#' + nombre); } catch (e) { /* un visor que no deja cambiar la dirección no corta el cambio */ }
        /* El motor vuelve a medir las pistas con el cambio de tamaño */
        requestAnimationFrame(() => { window.dispatchEvent(new Event('resize')); if (volver) desdeLaPortada(); });
    };
    botones.forEach(x => x.addEventListener('click', () => activar(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', desdeLaPortada);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key === '1') activar('mapa', true);
        else if (e.key === '2') activar('actual', true);
        else if (e.key === 'r' || e.key === 'R') desdeLaPortada();
    });
    /* --- 4. LOS ESPACIOS LIBRES LLEVAN A SU DECISIÓN --- */
    /* En el caso los toma llego.js (sección 5). Aquí solo está la 02: las otras no salen de la página */
    document.querySelectorAll('.lf-mapa-libre a').forEach(a => a.addEventListener('click', ev => {
        ev.preventDefault();
        const destino = document.querySelector(a.getAttribute('href'));
        if (destino) window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY, behavior: quieto ? 'auto' : 'smooth' });
    }));

    let guardada = null;
    try { guardada = localStorage.getItem('d1-pieza'); } catch (e) { /* sin almacenamiento */ }
    activar(location.hash.slice(1) || guardada || 'mapa', false);
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DE LA DECISIÓN 01: EL MAPA (.d1)
   ======================================================= */
