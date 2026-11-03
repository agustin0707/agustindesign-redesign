/* =======================================================
   INICIO JS · ABOUT
   ======================================================= */
/* La hoja clara sube tapando al archivo, el retrato sube desde la base de su panel y la portada se arma una vez. La ficha lleva
   la hora de Santiago en vivo, Quién se enciende palabra a palabra al leerlo y el índice (o las teclas 1 a 4) baja a cada
   fila y la marca. About (en el hero, la barra y el footer) y la tecla A llegan aquí */
(function () {
    const ab = document.getElementById('about');
    if (!ab) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ir = (y, corto) => window.desplazar(y, corto);
    const enVista = () => { const r = ab.getBoundingClientRect(), h = window.innerHeight; return r.top < h * 0.6 && r.bottom > h * 0.4; };

    /* --- 1. HORA DE SANTIAGO --- */
    const reloj = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: false });
    const hora = ab.querySelector('[data-ab-hora]');
    const tic = () => { const [h, m] = reloj.format(new Date()).split(':'); hora.innerHTML = `${h}<i>:</i>${m}`; };
    tic(); setInterval(tic, 15000);

    /* --- 2. LA HOJA TAPA AL ARCHIVO Y EL RETRATO SUBE --- */
    /* El archivo queda fijo en su último tramo y --p (0 a 1 en el 85% de pantalla que recorre la hoja) lo achica y apaga;
       cuando la hoja llega arriba, el archivo deja de pintarse. --sube va de 0 a 1 en el 90% de la pantalla y saca el
       recorte desde la base del panel. Cada palabra de Quién se enciende cuando la línea de lectura (62% de la pantalla)
       pasa por ella; dentro de cada línea, de izquierda a derecha */
    const panel = ab.querySelector('.ab-panel');
    const limitar = x => Math.min(1, Math.max(0, x));
    const hoja = quieto ? null : document.querySelector('.hoja');
    const fijar = () => hoja.style.setProperty('--fija', `${Math.min(0, window.innerHeight - hoja.offsetHeight)}px`);
    if (hoja) { hoja.classList.add('pila'); fijar(); new ResizeObserver(fijar).observe(hoja); window.addEventListener('resize', fijar); }

    /* Quién se separa en palabras (.w) sin tocar el HTML; las que van en negrita parten encendidas desde el CSS */
    const lectura = ab.querySelector('[data-ab-lectura]');
    [...lectura.childNodes].flatMap(n => n.nodeType === 3 ? [n] : [...n.childNodes].filter(c => c.nodeType === 3)).forEach(t => {
        const f = document.createDocumentFragment();
        t.textContent.split(/(\s+)/).forEach(p => f.append(/^\s*$/.test(p) ? p : Object.assign(document.createElement('span'), { className: 'w', textContent: p })));
        t.replaceWith(f);
    });
    const palabras = [...lectura.querySelectorAll(':scope > .w')];
    let pendiente = 0;
    const abrir = () => {
        pendiente = 0;
        const vh = window.innerHeight;
        if (hoja) {
            const top = ab.getBoundingClientRect().top;
            hoja.style.setProperty('--p', limitar((vh - top) / (vh * 0.85)).toFixed(4));
            hoja.classList.toggle('tapada', top <= 0);
        }
        panel.style.setProperty('--sube', (quieto ? 1 : limitar((vh - panel.getBoundingClientRect().top) / (vh * 0.9))).toFixed(4));
        if (!quieto) {
            const q = lectura.getBoundingClientRect(), tramo = vh * 0.08;
            palabras.forEach(w => { const r = w.getBoundingClientRect(); w.style.setProperty('--k', limitar((vh * 0.62 - r.top - (r.left - q.left) / q.width * tramo) / tramo).toFixed(3)); });
        }
    };
    window.addEventListener('scroll', () => { if (!pendiente) pendiente = requestAnimationFrame(abrir); }, { passive: true });
    window.addEventListener('resize', abrir);
    abrir();

    /* --- 3. ENTRADA --- */
    /* Retrato, bajada, ficha e índice esperan abajo y entran en cascada cuando la portada aparece (el título sube letra a
       letra con los demás) */
    const portada = ab.querySelector('[data-ab-portada]');
    if (!quieto && 'IntersectionObserver' in window) {
        ab.classList.add('espera');
        const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { ab.classList.remove('espera'); io.disconnect(); } }, { threshold: 0.3 });
        io.observe(portada);
    }

    /* --- 4. ÍNDICE Y ATAJOS A LAS FILAS --- */
    /* Índice o teclas 1 a 4 (solo con el About en pantalla, así no chocan con las portadas). Deslizan sin el índice del
       home, porque no cambian de sección, y al llegar el rótulo se marca */
    const saltar = f => {
        const fila = ab.querySelector(`.ab-fila[data-f="${f}"]`);
        ir(fila.getBoundingClientRect().top + window.scrollY - 90, true);
        setTimeout(() => { fila.classList.add('marca'); setTimeout(() => fila.classList.remove('marca'), 1600); }, quieto ? 0 : 820);
    };
    const botones = [...ab.querySelectorAll('[data-ab-fila]')];
    botones.forEach(b => b.addEventListener('click', e => { e.preventDefault(); saltar(b.dataset.abFila); }));

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
