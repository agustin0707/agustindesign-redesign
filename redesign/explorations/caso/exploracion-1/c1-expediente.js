/* =======================================================
   INICIO JS · CASO 1 EXPEDIENTE
   ======================================================= */
(function () {
    const C = window.CASO;
    const n2 = i => String(i + 1).padStart(2, '0');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 1. ENTRADAS Y RIEL --- */
    const entradas = document.querySelector('[data-decisiones]');
    entradas.innerHTML = C.decisiones.map((d, i) => `
        <article class="entrada" id="d-${d.id}">
            <span class="num etiqueta">Decisión ${n2(i)}</span>
            <h3 data-letras>${d.titulo}</h3>
            <p class="texto" data-aparece>${d.texto}</p>
            <p class="porque" data-aparece style="--retraso:120ms"><span class="etiqueta">Por qué</span>${d.porque}</p>
            <div data-aparece style="--retraso:180ms" class="pz-envoltura">${window.CASO_PIEZA(d)}</div>
        </article>`).join('');
    const riel = document.querySelector('[data-riel]');
    riel.insertAdjacentHTML('beforeend', C.decisiones.map((d, i) => `<li><a href="#d-${d.id}"><span class="etiqueta">${n2(i)}</span><span>${d.titulo}</span></a></li>`).join(''));
    const links = [...riel.querySelectorAll('a')];
    const articulos = [...entradas.querySelectorAll('.entrada')];

    /* --- 2. ENTRADA ACTUAL Y AVANCE --- */
    /* La entrada actual es la última cuyo borde superior ya pasó el tercio de la pantalla */
    let actual = -1, pendiente = false;
    const seccion = document.getElementById('decisiones');
    const pintar = () => {
        pendiente = false;
        const linea = window.innerHeight * 0.35;
        let i = -1;
        articulos.forEach((a, k) => { if (a.getBoundingClientRect().top < linea) i = k; });
        if (i !== actual) { links.forEach((l, k) => l.classList.toggle('actual', k === Math.max(i, 0))); actual = i; }
        const r = entradas.getBoundingClientRect();
        const avance = Math.min(Math.max((linea - r.top) / r.height, 0), 1);
        riel.style.setProperty('--avance', avance.toFixed(4));
    };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }, { passive: true });
    window.addEventListener('resize', pintar);
    pintar();

    /* --- 3. NAVEGACIÓN: CLICS Y ATAJOS J / K --- */
    const ir = i => { const a = articulos[Math.min(Math.max(i, 0), articulos.length - 1)]; a.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' }); };
    links.forEach((l, k) => l.addEventListener('click', e => { e.preventDefault(); ir(k); }));
    const teclas = { j: 1, k: -1 };
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
        const paso = teclas[e.key.toLowerCase()]; if (!paso) return;
        const r = seccion.getBoundingClientRect();
        if (r.top > window.innerHeight || r.bottom < 0) return;
        ir(actual + paso);
        const kbd = document.querySelector(`.atajos kbd[data-k="${e.key.toLowerCase()}"]`);
        if (kbd) { kbd.classList.add('on'); setTimeout(() => kbd.classList.remove('on'), 160); }
    });
})();
/* =======================================================
   FIN JS · CASO 1 EXPEDIENTE
   ======================================================= */
