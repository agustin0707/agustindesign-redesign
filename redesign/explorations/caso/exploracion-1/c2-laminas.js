/* =======================================================
   INICIO JS · CASO 2 LÁMINAS
   ======================================================= */
(function () {
    const C = window.CASO;
    const n2 = i => String(i + 1).padStart(2, '0');
    const total = n2(C.decisiones.length - 1);
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 1. LÁMINAS --- */
    const pila = document.querySelector('[data-laminas]');
    pila.innerHTML = C.decisiones.map((d, i) => `
        <article class="lam" id="d-${d.id}">
            <div class="lam-texto">
                <span class="lam-num" aria-hidden="true">${n2(i)}</span>
                <h3 data-letras>${d.titulo}</h3>
                <p>${d.texto}</p>
                <p class="porque"><span class="etiqueta">Por qué</span>${d.porque}</p>
            </div>
            <div class="lam-pieza">${window.CASO_PIEZA(d)}</div>
            <div class="velo" aria-hidden="true"></div>
        </article>`).join('');
    const lams = [...pila.querySelectorAll('.lam')];

    /* --- 2. CUÁNTO CUBRE LA SIGUIENTE Y CONTADOR --- */
    /* Igual que en la Pila: --q es el avance de la lámina siguiente subiendo sobre la actual */
    const contador = document.querySelector('.contador'), cuenta = document.querySelector('[data-cuenta]'), segs = document.querySelector('[data-segs]');
    segs.innerHTML = lams.map(() => '<i></i>').join('');
    const marcas = [...segs.children];
    const ultimo = new Map();
    let actual = -1, pendiente = false;
    const movil = () => window.matchMedia('(max-width: 768px)').matches;
    const pintar = () => {
        pendiente = false;
        const h = window.innerHeight;
        let i = -1;
        lams.forEach((l, k) => {
            const r = l.getBoundingClientRect();
            if (r.top <= h * 0.5) i = k;
            const sig = lams[k + 1];
            const q = quieto || movil() || !sig ? 0 : Math.min(Math.max(1 - sig.getBoundingClientRect().top / h, 0), 1);
            const v = q.toFixed(3);
            if (ultimo.get(l) !== v) { l.style.setProperty('--q', v); ultimo.set(l, v); }
        });
        const fin = lams[lams.length - 1].getBoundingClientRect();
        const dentro = i >= 0 && fin.bottom > h * 0.4;
        contador.classList.toggle('on', dentro);
        if (i !== actual && i >= 0) { cuenta.textContent = `${n2(i)} / ${total}`; marcas.forEach((m, k) => m.classList.toggle('ya', k <= i)); }
        actual = i;
    };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }, { passive: true });
    window.addEventListener('resize', pintar);
    pintar();
})();
/* =======================================================
   FIN JS · CASO 2 LÁMINAS
   ======================================================= */
