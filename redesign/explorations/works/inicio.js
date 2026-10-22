/* =======================================================
   INICIO JS · HOME (HERO + WORKS)
   ======================================================= */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ir = y => window.scrollTo({ top: y, behavior: quieto ? 'auto' : 'smooth' });

    /* --- 1. ENLACES INTERNOS --- */
    /* Works y "ver proyectos" bajan a la apertura de works; el logo y About vuelven arriba */
    const works = document.getElementById('works');
    document.querySelectorAll('a[href="#works"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); ir(works.getBoundingClientRect().top + window.scrollY); history.replaceState(null, '', '#works'); }));
    document.querySelectorAll('[data-arriba]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); ir(0); history.replaceState(null, '', location.pathname); }));

    /* --- 2. BARRA COMPACTA --- */
    /* Aparece cuando la apertura de works ya cubrió el hero */
    const barra = document.querySelector('[data-barra-home]');
    let pendiente = false;
    const revisar = () => { pendiente = false; barra.classList.toggle('visible', works.getBoundingClientRect().top <= 1); };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(revisar); } }, { passive: true });
    revisar();
})();
/* =======================================================
   FIN JS · HOME (HERO + WORKS)
   ======================================================= */
