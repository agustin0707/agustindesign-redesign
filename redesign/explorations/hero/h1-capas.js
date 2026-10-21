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
    /* Las letras cercanas al cursor suben un poco, como una ola. Solo con mouse y sin reducir movimiento */
    if (quieto || !window.matchMedia('(hover: hover)').matches) return;
    const letras = [...hero.querySelectorAll('.nombre .l')];
    let centros = [];
    const medir = () => { centros = letras.map(l => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height }; }); };
    setTimeout(medir, 2100);
    window.addEventListener('resize', medir);
    window.addEventListener('scroll', () => { centros = []; }, { passive: true });
    let mx = -9999, my = -9999, cuadro = false;
    const ola = () => {
        cuadro = false;
        if (!centros.length) medir();
        letras.forEach((l, i) => {
            const c = centros[i];
            const d = Math.hypot(mx - c.x, (my - c.y) * 0.6);
            const fuerza = Math.exp(-(d * d) / (2 * 140 * 140));
            l.style.translate = `0 ${(-fuerza * c.h * 0.07).toFixed(2)}px`;
        });
    };
    hero.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (!cuadro) { cuadro = true; requestAnimationFrame(ola); } });
    hero.addEventListener('mouseleave', () => { mx = my = -9999; requestAnimationFrame(ola); });
})();
/* =======================================================
   FIN JS · HERO 1 CAPAS
   ======================================================= */
