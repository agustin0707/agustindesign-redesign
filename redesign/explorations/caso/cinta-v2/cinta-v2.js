/* =======================================================
   INICIO JS · CINTA LLEGÓ FARMA, VARIANTES (.cv-)
   ======================================================= */
/* Un solo motor de cinta con sus ajustes a la vista (cantidad, ancho, ángulos, perspectiva, desvío, velocidad, niebla,
   piso y eje) y cuatro ejes que se combinan desde el dock: la cinta, el texto, la gráfica y el hover del logo. El
   estado vive en el ancla (#cinta/texto/grafica/hover) para poder compartir cada combinación */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const suave = t => 1 - Math.pow(1 - t, 3);
    const pad = n => String(n).padStart(2, '0');
    const $ = (sel, raiz = document) => raiz.querySelector(sel);

    /* --- 1. LAS SECCIONES DEL SITIO Y SU COPIA LOCAL --- */
    const TOMAS = ['hero', 's-capacidades', 's-propuesta', 's-calidad', 's-tecnologia', 's-experiencia', 's-categorias', 's-contacto'];
    const SITIO = '../../works/sitios/llego/index.html';
    let tibio = false;
    const entibiar = () => {
        if (tibio) return; tibio = true;
        const f = document.createElement('iframe');
        f.className = 'cv-tibio'; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
        f.onload = () => setTimeout(() => f.remove(), 500);
        f.src = SITIO; document.body.appendChild(f);
    };

    /* --- 2. LOS CUATRO EJES --- */
    /* Cada cinta es un juego de ajustes del mismo motor: n columnas (impares, la del centro aterriza), ancho de carta
       sobre el ancho de pantalla, ángulos en grados, perspectiva en px, desvío como fracción de la pantalla */
    const CINTAS = {
        base: { nombre: 'La base', idea: 'La base aprobada, sin cambios de composición: tres columnas, el plano inclinado a la derecha y el título libre a la izquierda.', n: 3, ancho: 0.3, rx: 50, ry: 0, rz: -26, persp: 2000, dx: 0.17, dy: 0, vel: 1, niebla: 0, piso: 0, eje: 'v' },
        linea: { nombre: 'La línea', idea: 'Una sola columna grande sobre su piso y sus rieles, como una cinta transportadora de verdad: cada sección pasa de a una y se lee entera.', n: 1, ancho: 0.42, rx: 52, ry: 0, rz: -30, persp: 1500, dx: 0.13, dy: 0, vel: 0.85, niebla: 0.55, piso: 1, eje: 'v' },
        campo: { nombre: 'El campo', idea: 'Siete columnas de cartas chicas que corren a distintas velocidades: el sitio completo de un vistazo, la escala del trabajo.', n: 7, ancho: 0.15, rx: 42, ry: 0, rz: -24, persp: 2600, dx: 0.1, dy: 0, vel: 1.1, niebla: 0.4, piso: 0, eje: 'v' },
        horizonte: { nombre: 'El horizonte', idea: 'La elegida: la cámara baja casi al ras y cinco columnas se pierden en la distancia; la niebla le da la profundidad que a la base le falta.', n: 5, ancho: 0.23, rx: 71, ry: 0, rz: -19, persp: 1050, dx: 0.19, dy: -0.04, vel: 1.25, niebla: 0.8, piso: 1, eje: 'v' },
        tira: { nombre: 'La tira', idea: 'La cinta corre en horizontal, de derecha a izquierda y en escorzo: una tira que cruza la pantalla por encima del título.', n: 3, ancho: 0.19, rx: 10, ry: -28, rz: -3, persp: 1600, dx: 0.06, dy: -0.16, vel: 1, niebla: 0.5, piso: 1, eje: 'h' }
    };
    const TEXTOS = {
        nombre: { nombre: 'El nombre', idea: 'La versión actual: el cliente manda y la decisión va de bajada. Ahora en la grilla de 12: Farma y la bajada parten exacto en la columna 4.' },
        decision: { nombre: 'La decisión', idea: 'La decisión es el titular y el cliente pasa al riel: quien llega lee primero lo que logré, no para quién.' },
        ficha: { nombre: 'La ficha', idea: 'La elegida: el logo horizontal, que se arma al entrar y responde al mouse, y tres datos cortos en la grilla, tan limpio como el hero de Tap In.' },
        oficio: { nombre: 'El oficio', idea: 'Los dos verbos del posicionamiento como titular: diseñé y programé. El verbo que me distingue va en el turquesa claro de la marca.' }
    };
    const GRAFICAS = {
        sin: { nombre: 'Sin', idea: 'Solo la cinta.' },
        reticula: { nombre: 'Retícula', idea: 'La retícula del manual se dibuja sobre la cinta, con sus cortes de 8 px en el cruce con la franja: la estructura de la marca a la vista.' },
        cotas: { nombre: 'Cotas', idea: 'Cada captura lleva sus cotas reales, 1440 por 900, dentro del plano: se inclinan y avanzan con la cinta. El detalle técnico como prueba.' },
        trama: { nombre: 'Trama', idea: 'La trama de puntos de Llegó, la que se volvió el sistema de nodos, es la superficie de la cinta y avanza con ella.' },
        etiqueta: { nombre: 'Guía', idea: 'Una guía de despacho con los hitos reales del proyecto: remite agustín.design, seis nodos que se llenan en orden y entrega el 20 de octubre.' }
    };
    const HOVERS = {
        mouse: { nombre: 'Eco con mouse', idea: 'El Eco en la lógica del hero de Tap In: cada pieza del logo se rebobina hacia su estado de partida mientras más cerca está el cursor, y se rearma al alejarse. Al entrar al logo, el Eco sale desde ese punto.' },
        eco: { nombre: 'Eco', idea: 'La versión anterior: la entrada entera en miniatura, de izquierda a derecha, igual en cada pasada.' }
    };
    const EJES = { cinta: CINTAS, texto: TEXTOS, grafica: GRAFICAS, hover: HOVERS };
    const TECLAS = { cinta: '12345', texto: 'qwer', grafica: 'asdfg', hover: 'cv' };

    /* --- 3. EL MOTOR DE LA CINTA --- */
    const raiz = document.body, h = $('.cv-h'), fijo = $('.cv-fijo'), escena = $('.cv-escena'), plano = $('.cv-plano');
    const vivo = $('.cv-vivo'), marco = $('iframe', vivo), ancho = $('[data-ancho]');
    const P = { ...CINTAS.base };
    const c = { W: 0, H: 0, cw: 0, ch: 0, g: 28, paso: 0, ciclo: 0, largo: 0, off: 0, p: 0, e: 0, t: 0 };
    let cols = [], foco = 0, armado = '', lineas = [];
    let mx = 0, my = 0, sx = 0, sy = 0, ox = 0, oy = 0, vx = 0, vy = 0, ult = 0, t0 = 0, hd = false, abierto = false, vez = 0, blanco = -1;

    const carta = (col, k) => {
        const img = TOMAS[(col.ini + k) % 8], n = document.createElement('i');
        n.className = 'cv-carta';
        n.innerHTML = `<img src="../media/lf-cinta-${img}.jpg" alt="" decoding="async"><u class="cv-cota"><s><b>1440</b></s><s><b>900</b></s></u>`;
        col.el.appendChild(n);
        return { el: n, img: n.firstChild, hero: img === 'hero' };
    };
    /* Rehace las columnas solo si cambia la cantidad o el eje: la del centro parte en Inicio, el resto desfasadas
       de a tres secciones y más lentas o más rápidas según su distancia al centro */
    const armar = () => {
        const firma = P.n + P.eje;
        if (firma === armado) return;
        armado = firma; plano.innerHTML = ''; hd = false; blanco = -1;
        plano.classList.toggle('h', P.eje === 'h');
        foco = (P.n - 1) / 2;
        const paso = Math.min(0.22, 0.6 / Math.max(P.n - 1, 1));
        cols = Array.from({ length: P.n }, (_, i) => {
            const n = document.createElement('div'); n.className = 'cv-col' + (i === foco ? ' foco' : '');
            n.innerHTML = '<b class="cv-piso"></b>'; plano.appendChild(n);
            return { el: n, piso: n.firstChild, ini: (((i - foco) * 3) % 8 + 8) % 8, v: 1 + (i - foco) * paso, pos: 0, cartas: [] };
        });
    };
    c.medir = () => {
        armar();
        c.W = fijo.clientWidth; c.H = fijo.clientHeight;
        c.cw = Math.round(c.W * P.ancho); c.ch = c.cw * 10 / 16; c.g = Math.round(fijar(c.cw * 0.067, 10, 36));
        const v = P.eje === 'v';
        c.paso = (v ? c.ch : c.cw) + c.g; c.ciclo = 8 * c.paso; c.largo = Math.max(c.W, c.H) * 3.4;
        const n = Math.ceil((c.largo + c.ciclo) / c.paso) + 1;
        cols.forEach(col => {
            while (col.cartas.length < n) col.cartas.push(carta(col, col.cartas.length));
            col.cartas.forEach((x, k) => { x.el.style[v ? 'top' : 'left'] = (k * c.paso).toFixed(1) + 'px'; x.el.style[v ? 'left' : 'top'] = ''; });
            col.piso.style[v ? 'height' : 'width'] = (col.cartas.length * c.paso).toFixed(1) + 'px';
            col.piso.style[v ? 'width' : 'height'] = '';
        });
        const cruz = P.n * (v ? c.cw : c.ch) + (P.n - 1) * c.g;
        plano.style.setProperty('--cw', c.cw + 'px'); plano.style.setProperty('--chh', c.ch + 'px'); plano.style.setProperty('--g', c.g + 'px');
        /* La trama tiene que repetir exacto en un ciclo, o salta cuando la columna vuelve al inicio */
        plano.style.setProperty('--tp', (c.ciclo / Math.round(c.ciclo / 22)).toFixed(3) + 'px');
        plano.style.width = (v ? cruz : c.largo) + 'px'; plano.style.height = (v ? c.largo : cruz) + 'px';
        escena.style.perspective = P.persp + 'px';
        raiz.dataset.piso = P.piso ? '1' : '0';
        fijo.style.setProperty('--nd', v ? '180deg' : (P.ry < 0 ? '90deg' : '270deg'));
        fijo.style.setProperty('--foco', (50 + P.dx * 100).toFixed(1) + '%');
        /* La ventana final: la carta aterriza bajo la barra, en 16:10, y ahí se monta el sitio real */
        const arriba = 96, abajo = 28, alto = c.H - arriba - abajo;
        c.fw = Math.min(alto * 1.6, c.W * 0.92); c.fh = c.fw / 1.6; c.fy = arriba + alto / 2;
        Object.assign(vivo.style, { left: ((c.W - c.fw) / 2).toFixed(1) + 'px', top: (c.fy - c.fh / 2).toFixed(1) + 'px', width: c.fw.toFixed(1) + 'px', height: c.fh.toFixed(1) + 'px' });
        ancho.textContent = Math.round(c.fw) + ' px';
    };
    c.iniciar = () => {
        c.medir(); t0 = performance.now(); ult = 0; c.off = 0;
        abierto = false; vivo.classList.remove('en'); plano.style.opacity = quieto ? '' : '0';
        lineas = [...document.querySelectorAll(`.cv-txt[data-t="${raiz.dataset.texto}"] .cv-linea`)];
    };
    c.cuadro = ahora => {
        const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora; c.t = ahora - t0;
        /* El mouse pasa por dos filtros medidos en tiempo y no en cuadros: el objetivo se suaviza (120 ms) y la cinta lo
           sigue con un resorte críticamente amortiguado. La velocidad y la aceleración nunca saltan, ni al entrar ni al
           salir de la ventana, y se siente igual a 60 o a 120 Hz */
        const s = dt / 1000, k = 1 - Math.exp(-dt / 120), w = 4.2;
        sx += (mx - sx) * k; sy += (my - sy) * k;
        vx += (w * w * (sx - ox) - 2 * w * vx) * s; vy += (w * w * (sy - oy) - 2 * w * vy) * s;
        ox += vx * s; oy += vy * s;
        const e = c.e = curva(fijar(c.p / 0.85));
        const a = quieto ? 1 : suave(fijar(c.t / 1600));
        const v = P.eje === 'v';
        /* Llega rápido y frena hasta su velocidad de crucero; las cartas chicas van más lento para pasar al mismo ritmo */
        const vel = 0.045 * (1 + 7 * Math.exp(-c.t / 380)) * P.vel * (P.ancho / 0.3);
        if (!quieto) c.off += dt * vel * (1 - e);
        cols.forEach((col, i) => {
            let pos = -((c.off * col.v) % c.ciclo);
            /* Al bajar, la columna del centro deja una carta de Inicio justo al centro */
            if (i === foco && e > 0) {
                const base = c.largo / 2 - (v ? c.ch : c.cw) / 2, n = Math.round((base - pos) / c.ciclo);
                pos += (base - n * c.ciclo - pos) * e;
                if (n * 8 !== blanco) { col.cartas.forEach((x, k) => x.el.classList.toggle('blanco', k === n * 8)); blanco = n * 8; }
            }
            col.pos = pos;
            col.el.style.transform = v ? `translate3d(0, ${pos.toFixed(1)}px, 0)` : `translate3d(${pos.toFixed(1)}px, 0, 0)`;
        });
        const esc = 1 + (c.fw / c.cw - 1) * e;
        const tx = (c.W * P.dx + ox * 30) * (1 - e), ty = (1 - a) * c.H * 0.4 + c.H * P.dy * (1 - e) + (c.fy - c.H / 2) * e;
        const rx = (P.rx - oy * 6) * (1 - e), ry = P.ry * (1 - e), rz = (P.rz + ox * 6) * (1 - e);
        plano.style.transform = `translate(-50%, -50%) translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${esc.toFixed(4)})`;
        plano.style.opacity = a >= 1 ? '' : fijar(c.t / 500).toFixed(3);
        /* La carta que va a llenar la pantalla cambia a la captura de 2880 px antes de crecer */
        if (!hd && e > 0.08) { hd = true; cols[foco].cartas.forEach(x => { if (x.hero) x.img.src = '../media/lf-hero.jpg'; }); }
        fijo.style.setProperty('--q', e.toFixed(3));
        fijo.style.setProperty('--niebla', (P.niebla * (1 - e)).toFixed(3));
        fijo.style.setProperty('--sub', fijar(c.p / 0.12).toFixed(3));
        lineas.forEach((l, i) => l.style.setProperty('--sal', fijar((c.p - 0.02 - i * 0.03) / 0.2).toFixed(3)));
        /* Al aterrizar, la captura se vuelve el sitio real; cada vez se recarga para que corra su entrada */
        if (e > 0.985 && !abierto) {
            abierto = true;
            marco.onload = () => { if (abierto) vivo.classList.add('en'); };
            marco.src = `${SITIO}?v=${++vez}`;
        } else if (e < 0.95 && abierto) { abierto = false; vivo.classList.remove('en'); }
    };

    /* --- 4. AJUSTES EN VIVO --- */
    /* Cada control escribe en P; los que cambian el tamaño o la cantidad vuelven a medir */
    const CONTROLES = [
        ['n', 'Columnas', 1, 7, 2, 0], ['ancho', 'Ancho de carta', 0.1, 0.5, 0.01, 2], ['rx', 'Inclinación', 0, 80, 1, 0],
        ['rz', 'Giro', -50, 30, 1, 0], ['ry', 'Escorzo', -45, 45, 1, 0], ['persp', 'Perspectiva', 600, 3200, 50, 0],
        ['dx', 'Desvío horizontal', -0.3, 0.35, 0.01, 2], ['dy', 'Desvío vertical', -0.3, 0.3, 0.01, 2],
        ['vel', 'Velocidad', 0, 3, 0.05, 2], ['niebla', 'Niebla', 0, 1, 0.01, 2]
    ];
    const ajustes = $('.cv-ajustes'), controles = $('[data-controles]', ajustes), lectura = $('[data-lectura]', ajustes);
    controles.innerHTML = CONTROLES.map(([k, nom, a, b, s]) => `<label>${nom}<output data-o="${k}"></output><input type="range" data-k="${k}" min="${a}" max="${b}" step="${s}"></label>`).join('')
        + '<label>Piso y rieles<input type="checkbox" data-k="piso"></label><label>Eje horizontal<input type="checkbox" data-k="eje"></label>';
    const pintarAjustes = () => {
        CONTROLES.forEach(([k, , , , , d]) => { $(`[data-k="${k}"]`, controles).value = P[k]; $(`[data-o="${k}"]`, controles).textContent = (+P[k]).toFixed(d); });
        $('[data-k="piso"]', controles).checked = !!P.piso; $('[data-k="eje"]', controles).checked = P.eje === 'h';
        lectura.textContent = CONTROLES.map(([k, , , , , d]) => `${k} ${(+P[k]).toFixed(d)}`).join(' · ') + ` · piso ${P.piso} · eje ${P.eje}`;
    };
    controles.addEventListener('input', e => {
        const k = e.target.dataset.k; if (!k) return;
        if (k === 'piso') P.piso = e.target.checked ? 1 : 0;
        else if (k === 'eje') P.eje = e.target.checked ? 'h' : 'v';
        else P[k] = +e.target.value;
        c.medir(); pintarAjustes();
    });
    $('[data-copiar]', ajustes).addEventListener('click', e => { navigator.clipboard && navigator.clipboard.writeText(lectura.textContent).then(() => { e.target.textContent = 'Copiado'; setTimeout(() => { e.target.textContent = 'Copiar'; }, 1400); }); });
    const alternarAjustes = () => { const a = ajustes.classList.toggle('abierto'); document.querySelectorAll('.cv-dock [data-ajustes]').forEach(b => b.setAttribute('aria-pressed', String(a))); };
    document.querySelectorAll('[data-ajustes]').forEach(b => b.addEventListener('click', alternarAjustes));

    /* --- 5. EL DOCK, EL ANCLA Y LA ENTRADA --- */
    const barra = $('[data-barra]'), dock = $('.cv-dock'), idea = $('[data-idea]', dock), sigue = $('.cv-sigue');
    const estado = { cinta: 'horizonte', texto: 'ficha', grafica: 'sin', hover: 'mouse' };
    let callar;
    /* El logo se arma en cada entrada (.llega), siempre con la animación de la portada del home, y la clase sale cuando
       terminan sus animaciones. Recién ahí acepta el hover (.nodo), que también dura lo que duren las suyas */
    const logo = $('.cv-logo');
    let armadas = 0, pasadas = 0;
    const alTerminar = (clase, vuelta, actual) => Promise.allSettled(logo.getAnimations({ subtree: true }).map(a => a.finished)).then(() => { if (vuelta === actual()) logo.classList.remove(clase); });
    const armarLogo = () => {
        logo.classList.remove('llega', 'nodo'); void logo.getBoundingClientRect(); logo.classList.add('llega');
        alTerminar('llega', ++armadas, () => armadas);
    };

    /* --- 5.1 ECO CON EL MOUSE --- */
    /* Como las letras del hero de Tap In, pero con resortes. Cada pieza mide su distancia al cursor y saca dos metas de
       una campana ancha (σ igual al 20 % del ancho del logo): el grado --w (la campana) y un tirón hacia el cursor (la
       campana por la distancia, que crece, toca techo a un σ y se apaga, así nunca salta al cruzar la pieza). Tres
       resortes por pieza persiguen esas metas en el cuadro de la cinta, en tiempo real y no en cuadros. Los centros
       salen del dibujo (getBBox), que no se mueve con los gestos; se miden la primera vez que el logo tiene tamaño. Solo con mouse */
    const conMouse = window.matchMedia('(hover: hover)').matches;
    const piezas = [...logo.querySelectorAll('.cv-lg-p')], iO = piezas.indexOf($('.cv-lg-o', logo));
    const VB = { x: -2, w: 440, h: 84 }, TIRON = 4, GOLPE = 11;
    let centros = null;
    const medirPiezas = () => {
        const cajas = piezas.map(p => p.getBBox());
        if (cajas.every(b => b.width)) centros = cajas.map(b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 }));
    };
    const resortes = piezas.map(() => ({ w: 0, vw: 0, px: 0, vpx: 0, py: 0, vpy: 0, mw: 0, mx: 0, my: 0, golpe: 0 }));
    let cursor = null, enReposo = true;
    const activo = () => estado.hover === 'mouse' && conMouse && !quieto && !logo.classList.contains('llega') && window.scrollY < window.innerHeight * 0.3;
    /* Pasa los centros del dibujo a la pantalla con la caja actual del logo */
    const enPantalla = () => {
        if (!centros) medirPiezas();
        const r = logo.getBoundingClientRect(), k = r.width / VB.w, y0 = r.top + (r.height - VB.h * k) / 2;
        return { k, puntos: centros.map(c => ({ x: r.left + (c.x - VB.x) * k, y: y0 + c.y * k })) };
    };
    const lejos = () => resortes.forEach(r => { r.mw = r.mx = r.my = 0; });
    const cerca = (x, y) => {
        cursor = { x, y };
        if (!activo() || !centros && (medirPiezas(), !centros)) return lejos();
        const { k, puntos } = enPantalla(), s = VB.w * k * 0.2;
        resortes.forEach((r, i) => {
            const dx = (x - puntos[i].x) / s, dy = (y - puntos[i].y) / s, g = Math.exp(-(dx * dx + dy * dy) / 2);
            r.mw = g; r.mx = TIRON * g * dx; r.my = TIRON * g * dy;
            if (g > 0.002) enReposo = false;
        });
    };
    /* Apaga todo de golpe: al cambiar de hover o al repetir la entrada */
    const apagar = () => {
        resortes.forEach(r => Object.assign(r, { w: 0, vw: 0, px: 0, vpx: 0, py: 0, vpy: 0, mw: 0, mx: 0, my: 0, golpe: 0 }));
        piezas.forEach(p => ['--w', '--px', '--py'].forEach(v => p.style.removeProperty(v)));
        enReposo = true;
    };
    /* Un paso de los resortes: el grado con algo de rebote (ω 11, ζ 0,62) para que la ola se sienta viva, el tirón más
       amortiguado (ω 9, ζ 0,8). Euler semi implícito, estable con los 50 ms de tope del cuadro */
    const resorte = (r, v, m, w, z, s) => { const dv = 'v' + v; r[dv] += (w * w * (r[m] - r[v]) - 2 * z * w * r[dv]) * s; r[v] += r[dv] * s; };
    let antes = 0;
    const mover = ahora => {
        const s = Math.min(ahora - (antes || ahora), 50) / 1000; antes = ahora;
        if (enReposo || estado.hover !== 'mouse') return;
        let quietas = 0;
        resortes.forEach((r, i) => {
            if (r.golpe && ahora >= r.golpe) { r.vw += GOLPE; r.golpe = 0; }
            resorte(r, 'w', 'mw', 11, 0.62, s); resorte(r, 'px', 'mx', 9, 0.8, s); resorte(r, 'py', 'my', 9, 0.8, s);
            const p = piezas[i].style;
            p.setProperty('--w', r.w.toFixed(4)); p.setProperty('--px', r.px.toFixed(3)); p.setProperty('--py', r.py.toFixed(3));
            if (!r.golpe && r.mw < 0.002 && Math.abs(r.w) + Math.abs(r.vw) + Math.abs(r.px) + Math.abs(r.vpx) + Math.abs(r.py) + Math.abs(r.vpy) < 0.002) quietas++;
        });
        if (quietas === piezas.length) apagar();
    };
    window.addEventListener('scroll', () => { if (cursor) cerca(cursor.x, cursor.y); }, { passive: true });

    /* Una pasada por entrada del mouse. En Eco con mouse es una ola de empujones a los resortes que parte del punto de
       entrada: cada pieza lo recibe 0,8 ms por píxel de distancia después (hasta 460 ms) y se suma a lo que marque el
       cursor, sin pisarlo. La onda sale de la o cuando la ola llega a ella */
    const pasar = (x, y) => {
        if (quieto || logo.classList.contains('llega')) return;
        if (estado.hover === 'mouse' && (centros || (medirPiezas(), centros))) {
            const { puntos } = enPantalla(), r = logo.getBoundingClientRect(), ahora = performance.now();
            if (x === undefined) { x = r.left; y = r.top + r.height / 2; }
            const dl = puntos.map(c => Math.min(Math.hypot(x - c.x, y - c.y) * 0.8, 460));
            resortes.forEach((r, i) => { r.golpe = ahora + dl[i]; });
            logo.style.setProperty('--dl-o', Math.round(dl[iO] + 120) + 'ms');
            enReposo = false;
        }
        logo.classList.remove('nodo'); void logo.getBoundingClientRect(); logo.classList.add('nodo');
        alTerminar('nodo', ++pasadas, () => pasadas);
    };
    logo.addEventListener('pointerenter', e => { if (!logo.classList.contains('nodo')) pasar(e.clientX, e.clientY); });

    Object.entries(EJES).forEach(([eje, lista]) => {
        $(`[data-eje="${eje}"]`, dock).insertAdjacentHTML('beforeend', Object.entries(lista).map(([id, o], i) => `<button type="button" data-id="${id}" aria-pressed="false"><kbd>${TECLAS[eje][i].toUpperCase()}</kbd>${o.nombre}</button>`).join(''));
    });
    const alScroll = () => {
        const r = h.getBoundingClientRect(); c.p = fijar(-r.top / Math.max(r.height - window.innerHeight, 1));
        if (c.p > 0.04) dock.classList.add('calla');
        barra.classList.toggle('sobre-claro', sigue.getBoundingClientRect().top <= 32);
    };
    /* Cambiar la cinta repone sus ajustes; cambiar texto o gráfica solo repite la entrada */
    const elegir = (eje, id, repetir = true) => {
        if (!EJES[eje][id]) return;
        estado[eje] = id; raiz.dataset[eje] = id;
        if (eje === 'cinta') { Object.assign(P, CINTAS[id]); pintarAjustes(); }
        dock.querySelectorAll(`[data-eje="${eje}"] button`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
        idea.textContent = EJES[eje][id].idea;
        history.replaceState(null, '', `#${estado.cinta}/${estado.texto}/${estado.grafica}/${estado.hover}`);
        /* Elegir un hover lo muestra una vez sin repetir la entrada */
        if (eje === 'hover') apagar();
        if (repetir) eje === 'hover' ? pasar() : entrar();
    };
    const entrar = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        h.classList.remove('entra'); void h.offsetWidth; h.classList.add('entra');
        c.iniciar(); alScroll();
        dock.classList.remove('calla'); clearTimeout(callar); callar = setTimeout(() => dock.classList.add('calla'), 6000);
        setTimeout(entibiar, 2600);
        apagar(); armarLogo();
    };
    dock.addEventListener('click', e => { const b = e.target.closest('[data-eje] button'); if (b) elegir(b.closest('[data-eje]').dataset.eje, b.dataset.id); });
    window.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input')) return;
        const k = e.key.toLowerCase();
        for (const eje in TECLAS) { const i = TECLAS[eje].indexOf(k); if (i >= 0) return elegir(eje, Object.keys(EJES[eje])[i]); }
        if (k === 'z') entrar();
        else if (k === 'x') alternarAjustes();
    });
    window.addEventListener('scroll', alScroll, { passive: true });
    /* Sobre el dock y los ajustes la cinta se queda donde estaba; al salir de la ventana o perder el foco vuelve al
       centro por el mismo resorte */
    window.addEventListener('pointermove', e => {
        cerca(e.clientX, e.clientY);
        if (e.target.closest('.cv-dock, .cv-ajustes')) return;
        mx = e.clientX / c.W - 0.5; my = e.clientY / c.H - 0.5;
    }, { passive: true });
    const soltar = () => { mx = my = 0; lejos(); };
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) soltar(); });
    window.addEventListener('blur', soltar);
    window.addEventListener('resize', () => { c.medir(); alScroll(); });
    const bucle = ahora => { c.cuadro(ahora); mover(ahora); requestAnimationFrame(bucle); };
    history.scrollRestoration = 'manual';
    const desdeAncla = () => {
        const [ci, te, gr, ho] = location.hash.slice(1).split('/');
        elegir('cinta', CINTAS[ci] ? ci : 'horizonte', false); elegir('texto', TEXTOS[te] ? te : 'ficha', false); elegir('grafica', GRAFICAS[gr] ? gr : 'sin', false); elegir('hover', HOVERS[ho] ? ho : 'mouse', false);
        idea.textContent = CINTAS[estado.cinta].idea;
        entrar();
    };
    window.addEventListener('hashchange', () => { if (location.hash.slice(1) !== `${estado.cinta}/${estado.texto}/${estado.grafica}/${estado.hover}`) desdeAncla(); });
    (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(() => { desdeAncla(); requestAnimationFrame(bucle); });
})();
/* =======================================================
   FIN JS · CINTA LLEGÓ FARMA, VARIANTES (.cv-)
   ======================================================= */
