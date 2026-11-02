/* =======================================================
   INICIO JS · NAVEGACIÓN SUAVE
   ======================================================= */
/* Un solo desplazamiento para todo el home: volver arriba, works, contacto, archivo, cada portada y los atajos. Acelera
   decidido y llega largo y suave, dura según la distancia y se detiene si la persona toma el control (rueda, toque o
   tecla). En los saltos largos muestra el índice del home mientras recorre el camino */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 1. CURVA --- */
    /* Bézier cúbica resuelta con Newton, en la misma notación que CSS: arranque decidido, llegada larga */
    const bezier = (x1, y1, x2, y2) => {
        const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = a => 3 * a;
        const f = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t, d = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
        return x => { let t = x; for (let i = 0; i < 6; i++) { const e = f(t, x1, x2) - x, s = d(t, x1, x2); if (Math.abs(e) < 1e-5 || !s) break; t -= e / s; } return f(Math.min(1, Math.max(0, t)), y1, y2); };
    };
    const curva = bezier(0.6, 0, 0.12, 1);

    /* --- 2. VELO E ÍNDICE --- */
    /* Las secciones se registran con su posición (las portadas las suma inicio-works.js). El índice se arma en cada salto,
       con los tramos en su proporción real y los rótulos a 17 px como mínimo para no chocar */
    const secciones = [];
    const velo = document.createElement('div'), indice = document.createElement('div');
    velo.className = 'velo-nav'; indice.className = 'indice-nav';
    velo.setAttribute('aria-hidden', 'true'); indice.setAttribute('aria-hidden', 'true');
    indice.innerHTML = '<div class="riel"></div>';
    document.body.append(velo, indice);
    const riel = indice.firstChild;
    let lista = [], ets = [], segs = [], marca = null, viaje = null;
    const seccionEn = y => { let k = 0; lista.forEach((s, i) => { if (s.y <= y + 1) k = i; }); return k; };
    const armar = () => {
        lista = secciones.map(s => ({ nombre: s.nombre, y: s.y() })).sort((a, b) => a.y - b.y);
        riel.innerHTML = lista.map((s, i) => `<b class="seg"></b><span class="et" style="--i:${i}">${s.nombre}</span>`).join('') + '<i class="marca"></i>';
        ets = [...riel.querySelectorAll('.et')]; segs = [...riel.querySelectorAll('.seg')]; marca = riel.querySelector('.marca');
    };
    const pintar = () => {
        const total = document.documentElement.scrollHeight, alto = riel.clientHeight, centro = window.scrollY + window.innerHeight / 2, aqui = seccionEn(centro);
        const [a, b] = [Math.min(viaje.desde, viaje.hacia), Math.max(viaje.desde, viaje.hacia)], baja = viaje.hacia > viaje.desde;
        let antes = -99;
        lista.forEach((s, i) => {
            const y0 = s.y / total * alto, largo = ((i < lista.length - 1 ? lista[i + 1].y : total) - s.y) / total * alto;
            segs[i].style.top = (y0 + 2) + 'px'; segs[i].style.height = Math.max(2, largo - 4) + 'px';
            antes = Math.max(y0, antes + 17); ets[i].style.top = antes + 'px';
            const estado = i === aqui ? 'aqui' : i < a || i > b ? '' : (baja ? i < aqui : i > aqui) ? 'pasado' : 'camino';
            [ets[i], segs[i]].forEach(el => { el.classList.toggle('aqui', estado === 'aqui'); el.classList.toggle('pasado', estado === 'pasado'); el.classList.toggle('camino', estado === 'camino'); });
            ets[i].classList.toggle('destino', i === viaje.hacia && i !== aqui);
        });
        marca.style.top = (centro / total * alto) + 'px';
    };
    const ocultar = () => { indice.classList.add('sale'); indice.classList.remove('on'); velo.classList.remove('on'); };

    /* --- 3. DESLIZAR --- */
    let cuadro = 0, esperas = [], activo = false;
    const despues = (fn, ms) => esperas.push(setTimeout(fn, ms));
    const parar = () => { cancelAnimationFrame(cuadro); esperas.forEach(clearTimeout); esperas = []; if (activo && viaje) ocultar(); activo = false; };
    ['wheel', 'touchstart', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (activo) parar(); }, { passive: true }));
    const deslizar = (desde, hasta, dura, cada, fin) => {
        const t0 = performance.now();
        const paso = ahora => {
            const k = Math.min(1, (ahora - t0) / dura);
            window.scrollTo(0, desde + (hasta - desde) * curva(k));
            if (cada) cada(k);
            if (k < 1) cuadro = requestAnimationFrame(paso); else if (fin) fin(); else activo = false;
        };
        activo = true; cuadro = requestAnimationFrame(paso);
    };

    /* --- 4. IR A UNA POSICIÓN --- */
    /* Menos de 1,2 pantallas: solo desliza (hasta 800 ms). Más lejos: el velo baja la página a un tercio, el índice se
       dibuja y la marca recorre el riel (de 650 a 1200 ms); en el último 30% la página se vuelve a encender, y al llegar la
       marca se asienta y el destino parpadea una vez */
    window.desplazar = y => {
        parar();
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const hasta = Math.round(Math.max(0, Math.min(max, y))), desde = window.scrollY, d = Math.abs(hasta - desde), h = window.innerHeight;
        if (quieto || d < 2) { window.scrollTo(0, hasta); return; }
        if (d < h * 1.2) { viaje = null; deslizar(desde, hasta, Math.min(800, 420 + d * 0.3)); return; }
        armar();
        let hacia = 0; lista.forEach((s, i) => { if (Math.abs(s.y - hasta) < Math.abs(lista[hacia].y - hasta)) hacia = i; });
        viaje = { desde: seccionEn(desde + h / 2), hacia };
        indice.classList.remove('sale'); pintar(); void indice.offsetWidth;
        indice.classList.add('on'); velo.classList.add('on'); activo = true;
        despues(() => deslizar(desde, hasta, Math.min(1200, 650 + 260 * Math.log2(1 + d / h)), k => { pintar(); if (k > 0.7) velo.classList.remove('on'); }, () => {
            pintar(); velo.classList.remove('on');
            marca.classList.add('asienta'); ets[viaje.hacia].classList.add('confirma');
            despues(() => { ocultar(); activo = false; }, 520);
        }), 140);
    };
    window.desplazar.seccion = (nombre, y) => secciones.push({ nombre, y });
    const arriba = sel => () => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + window.scrollY : 0; };
    window.desplazar.seccion('Inicio', () => 0);
    window.desplazar.seccion('Works', arriba('#works'));
    window.desplazar.seccion('Archivo', arriba('#archivo'));
    window.desplazar.seccion('Contacto', arriba('#contacto'));
    window.desplazar.seccion('Final', arriba('[data-pie]'));
})();
/* =======================================================
   FIN JS · NAVEGACIÓN SUAVE
   ======================================================= */
