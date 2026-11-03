/* =======================================================
   INICIO JS · HERO 1 CAPAS
   ======================================================= */
(function () {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 1. LINKS CON LETRAS QUE RUEDAN --- */
    /* Separa cada link en letras con su índice para el hover en cascada. El link conserva su nombre accesible */
    hero.querySelectorAll('.links-actual a').forEach(a => {
        const texto = a.textContent.trim();
        a.setAttribute('aria-label', texto);
        a.innerHTML = [...texto].map((c, i) => `<span class="c" aria-hidden="true" style="--i:${i}">${c}</span>`).join('');
    });

    /* --- 2. PROGRESO DE SALIDA --- */
    /* Escribe --p (0 a 1) según cuánto se ha scrolleado: el CSS oscurece, escala la foto y apaga el nombre */
    let pendiente = false;
    const salida = () => {
        pendiente = false;
        const p = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1);
        hero.style.setProperty('--p', quieto ? 0 : p.toFixed(3));
    };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(salida); } }, { passive: true });
    salida();

    /* --- 3. NOMBRE VIVO --- */
    /* Las letras cercanas al cursor suben un poco, como una ola. Solo con mouse y sin reducir movimiento. La ola sigue a un
       cursor suavizado y su fuerza (presencia) crece al entrar y se apaga al salir, las dos con inercia medida en tiempo:
       las letras suben y bajan sin cortes, en vez de saltar al borde del hero */
    if (quieto || !window.matchMedia('(hover: hover)').matches) return;
    const letras = [...hero.querySelectorAll('.nombre .l')];
    let centros = [];
    const medir = () => { centros = letras.map(l => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; }); };
    setTimeout(medir, 2100);
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', () => { centros = []; }, { passive: true });
    const SIGUE = 160, ENTRA = 380, SALE = 620;
    let mx = 0, my = 0, sx = 0, sy = 0, dentro = 0, presencia = 0, cuadro = 0, antes = 0;
    const ola = t => {
        cuadro = 0;
        const dt = antes ? Math.min(t - antes, 64) : 16;
        antes = t;
        const k = 1 - Math.exp(-dt / SIGUE), kp = 1 - Math.exp(-dt / (dentro ? ENTRA : SALE));
        sx += (mx - sx) * k; sy += (my - sy) * k; presencia += (dentro - presencia) * kp;
        if (!centros.length) medir();
        letras.forEach((l, i) => {
            const c = centros[i];
            const d = Math.hypot(sx - c.x, (sy - c.y) * 0.6);
            const fuerza = Math.exp(-(d * d) / (2 * 140 * 140)) * presencia;
            l.style.translate = `0 ${(-fuerza * c.h * 0.07).toFixed(2)}px`;
        });
        const quieta = Math.abs(mx - sx) + Math.abs(my - sy) < 0.3 && Math.abs(dentro - presencia) < 0.002;
        if (quieta) { antes = 0; if (!dentro) { presencia = 0; letras.forEach(l => { l.style.translate = ''; }); } }
        else pedir();
    };
    const pedir = () => { if (!cuadro) cuadro = requestAnimationFrame(ola); };
    hero.addEventListener('mouseenter', e => { mx = sx = e.clientX; my = sy = e.clientY; dentro = 1; pedir(); });
    hero.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dentro = 1; pedir(); });
    hero.addEventListener('mouseleave', () => { dentro = 0; pedir(); });
})();
/* =======================================================
   FIN JS · HERO 1 CAPAS
   ======================================================= */
