/* =======================================================
   INICIO JS · FONDOS DEL CASO (TRES VARIANTES)
   ======================================================= */
/* Cómo pasa el fondo de una sección a la siguiente (?fondo=1|2|3 o C.fondo):
   1 · Fundido: cada sección nace del color de la anterior con un degradado.
   2 · Láminas: cada sección es una lámina redondeada que se apoya sobre la anterior, como en el índice.
   3 · Fondo que fluye: un solo fondo que cambia de color de forma continua según la sección que se lee */
(function () {
    const C = window.CASO;
    const v = new URLSearchParams(location.search).get('fondo') || C.fondo || '1';
    document.body.classList.add('fondo-' + v);
    const modo = s => (s.classList.contains('claro') ? 'claro' : s.classList.contains('marca') ? 'marca' : 'oscuro');

    (window.CASO_INICIOS = window.CASO_INICIOS || []).push(() => {
        const secciones = [...document.querySelectorAll('[data-caso] > .seccion')];
        /* 1 · Cada sección guarda el color de fondo de la anterior para fundirse desde él */
        if (v === '1') {
            secciones.forEach((s, k) => {
                if (!k) return;
                const prev = getComputedStyle(secciones[k - 1]).getPropertyValue('--c-fondo').trim();
                if (prev) s.style.setProperty('--fondo-prev', prev);
            });
        }
        /* Colores del caso registrados como interpolables (para el fondo que fluye, en la variante 3 o en los bloques .flujo) */
        const registrar = () => {
            if (!(window.CSS && CSS.registerProperty)) return;
            [['--c-fondo', '#110E22'], ['--c-texto', '#FFFFFF'], ['--c-texto-2', '#CCCCCC'], ['--c-texto-3', '#888888'], ['--c-linea', '#333333'], ['--c-acento', '#9B8EF0'], ['--c-acento-2', '#B5ABF5'], ['--c-superficie', '#222222'], ['--c-velo', '#000000'], ['--c-sobre-acento', '#110E22']]
                .forEach(([name, inicial]) => { try { CSS.registerProperty({ name, syntax: '<color>', inherits: true, initialValue: inicial }); } catch (e) { /* ya registrada */ } });
            [['--g-claro', '0'], ['--g-marca', '0']].forEach(([name, inicial]) => { try { CSS.registerProperty({ name, syntax: '<number>', inherits: true, initialValue: inicial }); } catch (e) { /* ya registrada */ } });
        };

        /* 2 · Láminas: cada bloque sube redondeado y más angosto, y se abre a todo el ancho al llegar arriba;
           el bloque de atrás se oscurece a medida que lo cubre. Dentro de un capítulo (.flujo), el fondo fluye */
        if (v === '2') {
            registrar();
            const laminas = [...document.querySelectorAll('[data-caso] > .seccion, [data-caso] > .flujo')];
            const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            let pend = false;
            const pintar = () => {
                pend = false;
                const h = window.innerHeight;
                laminas.forEach((l, k) => {
                    if (!k) return;
                    const p = quieto ? 1 : Math.min(Math.max(1 - l.getBoundingClientRect().top / h, 0), 1);
                    const pv = p.toFixed(3);
                    if (l._e !== pv) { l._e = pv; l.style.setProperty('--e', pv); l.classList.toggle('plena', p > 0.995); }
                    const prev = laminas[k - 1];
                    if (prev._q !== pv) { prev._q = pv; prev.style.setProperty('--q', pv); }
                });
            };
            window.addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(pintar); } }, { passive: true });
            window.addEventListener('resize', pintar);
            pintar();
            /* En cada capítulo, la sección que cruza el centro decide el color del bloque, que se interpola */
            document.querySelectorAll('[data-flujo]').forEach(f => {
                const io = new IntersectionObserver(es => es.forEach(e => {
                    if (!e.isIntersecting) return;
                    f.classList.remove('claro', 'oscuro', 'marca'); f.classList.add(modo(e.target));
                }), { rootMargin: '-45% 0px -45% 0px' });
                f.querySelectorAll(':scope > .seccion').forEach(s => io.observe(s));
            });
        }

        /* 3 · La sección que cruza el centro decide el modo de toda la página */
        if (v === '3') {
            registrar();
            const poner = m => { document.body.classList.remove('m-claro', 'm-oscuro', 'm-marca'); document.body.classList.add('m-' + m); };
            poner('oscuro');
            const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) poner(modo(e.target)); }), { rootMargin: '-45% 0px -45% 0px' });
            secciones.concat([...document.querySelectorAll('.sig')]).forEach(s => io.observe(s));
        }
    });
})();
/* =======================================================
   FIN JS · FONDOS DEL CASO (TRES VARIANTES)
   ======================================================= */
