/* =======================================================
   INICIO JS · ABOUT
   ======================================================= */
/* La hoja clara se abre al entrar y su portada se arma una vez. La ficha lleva la hora de Santiago en vivo y los atajos
   1 a 4 bajan a cada fila y la marcan. About (en el hero, la barra y el footer) y la tecla A llegan aquí */
(function () {
    const ab = document.getElementById('about');
    if (!ab) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ir = (y, corto) => window.desplazar(y, corto);
    const enVista = () => { const r = ab.getBoundingClientRect(), h = window.innerHeight; return r.top < h * 0.6 && r.bottom > h * 0.4; };

    /* --- 1. HORA DE SANTIAGO --- */
    const reloj = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: false });
    const hora = ab.querySelector('[data-ab-hora]');
    const tic = () => { hora.textContent = `${reloj.format(new Date())} en Santiago`; };
    tic(); setInterval(tic, 15000);

    /* --- 2. LA HOJA SE ABRE --- */
    /* --e va de 0 a 1 en el primer 60% de pantalla que recorre la hoja: los costados del fondo se cierran hacia el borde */
    let pendiente = 0;
    const abrir = () => {
        pendiente = 0;
        const e = quieto ? 1 : Math.min(1, Math.max(0, (window.innerHeight - ab.getBoundingClientRect().top) / (window.innerHeight * 0.6)));
        ab.style.setProperty('--e', e.toFixed(4));
    };
    window.addEventListener('scroll', () => { if (!pendiente) pendiente = requestAnimationFrame(abrir); }, { passive: true });
    window.addEventListener('resize', abrir);
    abrir();

    /* --- 3. ENTRADA --- */
    /* Retrato, bajada, datos y atajos esperan abajo y entran en cascada cuando la portada aparece (el título sube letra a
       letra con los demás) */
    const portada = ab.querySelector('[data-ab-portada]');
    if (!quieto && 'IntersectionObserver' in window) {
        ab.classList.add('espera');
        const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { ab.classList.remove('espera'); io.disconnect(); } }, { threshold: 0.3 });
        io.observe(portada);
    }

    /* --- 4. ATAJOS A LAS FILAS --- */
    /* Botones o teclas 1 a 4 (solo con el About en pantalla, así no chocan con las portadas). Deslizan sin el índice del
       home, porque no cambian de sección, y al llegar el rótulo se marca */
    const saltar = f => {
        const fila = ab.querySelector(`.ab-fila[data-f="${f}"]`);
        ir(fila.getBoundingClientRect().top + window.scrollY - 90, true);
        setTimeout(() => { fila.classList.add('marca'); setTimeout(() => fila.classList.remove('marca'), 1600); }, quieto ? 0 : 820);
    };
    const botones = [...ab.querySelectorAll('[data-ab-fila]')];
    botones.forEach(b => b.addEventListener('click', () => saltar(b.dataset.abFila)));

    /* --- 5. ENLACES Y TECLA A --- */
    const aAbout = () => { ir(ab.getBoundingClientRect().top + window.scrollY); history.replaceState(null, '', '#about'); };
    document.querySelectorAll('a[href="#about"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); aAbout(); }));
    window.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName) || e.target.closest('[role="listbox"]')) return;
        if (e.key.toLowerCase() === 'a') { aAbout(); return; }
        const b = botones[+e.key - 1];
        if (!b || !enVista()) return;
        b.classList.add('pulsada'); setTimeout(() => b.classList.remove('pulsada'), 160);
        saltar(b.dataset.abFila);
    });
})();
/* =======================================================
   FIN JS · ABOUT
   ======================================================= */
