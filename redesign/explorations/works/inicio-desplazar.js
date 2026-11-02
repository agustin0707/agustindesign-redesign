/* =======================================================
   INICIO JS · NAVEGACIÓN SUAVE
   ======================================================= */
/* Un solo desplazamiento para todo el home: volver arriba, works, contacto, archivo y cada portada. El scroll nativo con
   behavior smooth tiene duración fija y cruza los saltos largos a toda velocidad; este acelera y frena con una curva
   suave, dura según la distancia y se detiene si la persona toma el control (rueda, toque o tecla) */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 1. CURVA Y CORTINA --- */
    const curva = t => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    const velo = document.createElement('div');
    velo.className = 'velo-nav'; velo.setAttribute('aria-hidden', 'true'); document.body.appendChild(velo);
    let cuadro = 0, espera = 0, activo = false;
    const parar = () => { cancelAnimationFrame(cuadro); clearTimeout(espera); velo.classList.remove('on'); activo = false; };
    ['wheel', 'touchstart', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (activo) parar(); }, { passive: true }));

    /* --- 2. DESLIZAR --- */
    const deslizar = (desde, hasta, dura) => {
        const t0 = performance.now();
        const paso = ahora => {
            const k = Math.min(1, (ahora - t0) / dura);
            window.scrollTo(0, desde + (hasta - desde) * curva(k));
            if (k < 1) cuadro = requestAnimationFrame(paso); else activo = false;
        };
        activo = true; cuadro = requestAnimationFrame(paso);
    };

    /* --- 3. IR A UNA POSICIÓN --- */
    /* Hasta tres pantallas, desliza directo (de 450 a 1100 ms). Más lejos, la cortina cubre 220 ms, el salto ocurre detrás
       hasta quedar a casi una pantalla del destino y desde ahí llega deslizando mientras la cortina se retira */
    window.desplazar = y => {
        parar();
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const hasta = Math.round(Math.max(0, Math.min(max, y))), desde = window.scrollY, d = Math.abs(hasta - desde);
        if (quieto || d < 2) { window.scrollTo(0, hasta); return; }
        if (d <= window.innerHeight * 3) { deslizar(desde, hasta, Math.min(1100, 450 + d * 0.3)); return; }
        activo = true; velo.classList.add('on');
        espera = setTimeout(() => {
            const cerca = hasta + Math.sign(desde - hasta) * window.innerHeight * 0.9;
            window.scrollTo(0, cerca); velo.classList.remove('on'); deslizar(cerca, hasta, 950);
        }, 220);
    };
})();
/* =======================================================
   FIN JS · NAVEGACIÓN SUAVE
   ======================================================= */
