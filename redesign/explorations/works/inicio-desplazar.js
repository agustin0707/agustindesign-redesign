/* =======================================================
   INICIO JS · NAVEGACIÓN SUAVE
   ======================================================= */
/* Un solo desplazamiento para todo el home: volver arriba, works, contacto, archivo, cada portada y los atajos. Acelera
   decidido y llega largo y suave, dura según la distancia y se detiene si la persona toma el control (rueda, toque o
   tecla). En los saltos largos muestra el índice del home (Hero, Works, Archivo, About y Contact) mientras recorre el camino */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- 1. CURVA --- */
    /* Bézier cúbica resuelta con Newton, en la misma notación que CSS: arranque firme y llegada larga, con un pico de
       velocidad moderado (2,9 veces el promedio) para que los saltos largos no se vean a tirones */
    const bezier = (x1, y1, x2, y2) => {
        const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = a => 3 * a;
        const f = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t, d = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
        return x => { let t = x; for (let i = 0; i < 6; i++) { const e = f(t, x1, x2) - x, s = d(t, x1, x2); if (Math.abs(e) < 1e-5 || !s) break; t -= e / s; } return f(Math.min(1, Math.max(0, t)), y1, y2); };
    };
    const curva = bezier(0.45, 0, 0.2, 1);

    /* --- 2. VELO E ÍNDICE --- */
    /* Las secciones se registran con su posición y el índice se arma en cada salto. Es una lupa: los rótulos se reparten
       parejo y su cercanía a la posición del viaje (--g) los agranda y les da más espacio. Esa posición no copia el scroll
       (las secciones miden muy distinto y eso la hacía tironear): avanza del origen al destino con la misma curva y el mismo
       tiempo del viaje, así llegan juntas. Se mueve con transform para no recalcular el layout en cada cuadro */
    const secciones = [];
    const velo = document.createElement('div'), indice = document.createElement('div');
    velo.className = 'velo-nav'; indice.className = 'indice-nav';
    velo.setAttribute('aria-hidden', 'true'); indice.setAttribute('aria-hidden', 'true');
    indice.innerHTML = '<div class="riel"></div>';
    document.body.append(velo, indice);
    const riel = indice.firstChild;
    let lista = [], ets = [], viaje = null;
    const anclas = () => { const max = document.documentElement.scrollHeight - window.innerHeight; return lista.map(s => Math.min(s.y, max)); };
    const posicion = top => {
        const a = anclas(); let k = 0;
        a.forEach((y, i) => { if (top >= y - 1) k = i; });
        const sig = k < a.length - 1 ? a[k + 1] : a[k];
        return k + (sig > a[k] ? Math.min(1, Math.max(0, (top - a[k]) / (sig - a[k]))) : 0);
    };
    const armar = () => {
        lista = secciones.map(s => ({ nombre: s.nombre, y: s.y() })).sort((a, b) => a.y - b.y);
        riel.innerHTML = lista.map((s, i) => `<span class="et" style="--i:${i}"><span class="nom">${s.nombre}</span></span>`).join('');
        ets = [...riel.querySelectorAll('.et')];
    };
    const pintar = (k = 0) => {
        const alto = riel.clientHeight, pos = viaje.p0 + (viaje.hacia - viaje.p0) * curva(k), aqui = Math.round(pos);
        const [a, b] = [Math.min(viaje.desde, viaje.hacia), Math.max(viaje.desde, viaje.hacia)], baja = viaje.hacia > viaje.desde;
        const g = ets.map((_, i) => { const x = Math.max(0, 1 - Math.abs(i - pos) / 1.5); return x * x * (3 - 2 * x); });
        const w = g.map(x => 1 + 1.6 * x), suma = w.reduce((t, x) => t + x, 0);
        let acc = 0;
        const ys = w.map(x => { const y = (acc + x / 2) / suma * alto; acc += x; return y; });
        ets.forEach((el, i) => {
            el.style.transform = `translateY(${ys[i]}px)`; el.style.setProperty('--g', g[i].toFixed(3));
            const estado = i === aqui ? 'aqui' : i < a || i > b ? '' : (baja ? i < aqui : i > aqui) ? 'pasado' : 'camino';
            el.classList.toggle('aqui', estado === 'aqui'); el.classList.toggle('pasado', estado === 'pasado'); el.classList.toggle('camino', estado === 'camino');
            el.classList.toggle('destino', i === viaje.hacia && i !== aqui);
        });
    };
    const ocultar = () => { indice.classList.add('sale'); indice.classList.remove('on'); velo.classList.remove('on'); };

    /* --- 3. DESLIZAR --- */
    /* Mientras navega un botón, la barra de scroll no aparece: con barras flotantes (macOS) se oculta y con barras fijas
       (Windows) se vuelve transparente, para que la página no se corra. Vuelve 1,2 s después de llegar, cuando la barra
       flotante ya se apagó sola, o apenas la persona hace scroll por su cuenta */
    const raiz = document.documentElement;
    const tapar = si => { raiz.classList.remove('nav-oculta', 'nav-tapada'); if (si) raiz.classList.add(window.innerWidth > raiz.clientWidth ? 'nav-tapada' : 'nav-oculta'); };
    let cuadro = 0, esperas = [], activo = false;
    const despues = (fn, ms) => esperas.push(setTimeout(fn, ms));
    const parar = () => { cancelAnimationFrame(cuadro); esperas.forEach(clearTimeout); esperas = []; if (activo && viaje) ocultar(); activo = false; tapar(false); };
    ['wheel', 'touchstart', 'keydown'].forEach(ev => window.addEventListener(ev, () => { if (activo) parar(); else tapar(false); }, { passive: true }));
    const deslizar = (desde, hasta, dura, cada, fin) => {
        const t0 = performance.now();
        const paso = ahora => {
            const k = Math.min(1, (ahora - t0) / dura);
            window.scrollTo(0, desde + (hasta - desde) * curva(k));
            if (cada) cada(k);
            if (k < 1) cuadro = requestAnimationFrame(paso);
            else { despues(() => tapar(false), 1200); if (fin) fin(); else activo = false; }
        };
        activo = true; tapar(true); cuadro = requestAnimationFrame(paso);
    };

    /* --- 4. IR A UNA POSICIÓN --- */
    /* Menos de 1,2 pantallas: solo desliza (hasta 800 ms). Más lejos: el velo baja la página a un tercio, el índice entra
       en cascada y la lupa lo recorre (de 700 a 1300 ms); en el último 30% la página se vuelve a encender. Al llegar no hay
       pulso ni parpadeo (se leían como un rebote): la lupa se asienta sola y el índice se apaga sin moverse. Con corto
       (saltos dentro de una misma sección, como las filas del About) solo desliza, sin índice */
    window.desplazar = (y, corto) => {
        parar();
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const hasta = Math.round(Math.max(0, Math.min(max, y))), desde = window.scrollY, d = Math.abs(hasta - desde), h = window.innerHeight;
        if (quieto || d < 2) { window.scrollTo(0, hasta); return; }
        if (d < h * 1.2 || corto) { viaje = null; deslizar(desde, hasta, Math.min(800, 420 + d * 0.3)); return; }
        armar();
        const a = anclas(); let hacia = 0; a.forEach((y, i) => { if (Math.abs(y - hasta) < Math.abs(a[hacia] - hasta)) hacia = i; });
        const p0 = posicion(desde);
        viaje = { desde: Math.round(p0), hacia, p0 };
        indice.classList.remove('sale'); pintar(); void indice.offsetWidth;
        indice.classList.add('on'); velo.classList.add('on'); activo = true;
        despues(() => deslizar(desde, hasta, Math.min(1300, 700 + 260 * Math.log2(1 + d / h)), k => { pintar(k); if (k > 0.7) velo.classList.remove('on'); }, () => {
            pintar(1); velo.classList.remove('on');
            despues(() => { ocultar(); activo = false; }, 420);
        }), 140);
    };
    window.desplazar.seccion = (nombre, y) => secciones.push({ nombre, y });
    const arriba = sel => () => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + window.scrollY : 0; };
    window.desplazar.seccion('Hero', () => 0);
    window.desplazar.seccion('Works', arriba('#works'));
    window.desplazar.seccion('Archivo', arriba('#archivo'));
    window.desplazar.seccion('About', arriba('#about'));
    window.desplazar.seccion('Contact', arriba('#contacto'));
})();
/* =======================================================
   FIN JS · NAVEGACIÓN SUAVE
   ======================================================= */
