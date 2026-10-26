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
    /* Aparece cuando la apertura de works ya cubrió el hero. Se esconde al bajar y vuelve con una subida clara
       (90 px seguidos), como en los casos */
    const barra = document.querySelector('[data-barra-home]');
    let pendiente = false, antes = window.scrollY, subida = 0;
    const revisar = () => {
        pendiente = false;
        const y = window.scrollY, dy = y - antes, top = works.getBoundingClientRect().top;
        antes = y;
        barra.classList.toggle('visible', top <= 1);
        if (dy > 0) { subida = 0; if (top < -120) barra.classList.add('oculta'); }
        else if (dy < 0) { subida -= dy; if (subida > 90 || top > -120) barra.classList.remove('oculta'); }
    };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(revisar); } }, { passive: true });
    revisar();
})();
/* =======================================================
   FIN JS · HOME (HERO + WORKS)
   ======================================================= */
