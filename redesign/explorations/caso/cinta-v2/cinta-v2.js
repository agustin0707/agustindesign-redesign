/* =======================================================
   INICIO JS · CINTA LLEGÓ FARMA, VARIANTES (.cv-)
   ======================================================= */
/* Un solo motor de cinta con sus ajustes a la vista (cantidad, ancho, ángulos, perspectiva, desvío, velocidad, niebla,
   piso y eje) y tres ejes que se combinan desde el dock: la cinta, el texto y la gráfica. El estado vive en el ancla
   (#cinta/texto/grafica) para poder compartir cada combinación */
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

    /* --- 2. LOS TRES EJES --- */
    /* Cada cinta es un juego de ajustes del mismo motor: n columnas (impares, la del centro aterriza), ancho de carta
       sobre el ancho de pantalla, ángulos en grados, perspectiva en px, desvío como fracción de la pantalla */
    const CINTAS = {
        base: { nombre: 'La base', idea: 'La base aprobada, sin cambios de composición: tres columnas, el plano inclinado a la derecha y el título libre a la izquierda.', n: 3, ancho: 0.3, rx: 50, ry: 0, rz: -26, persp: 2000, dx: 0.17, dy: 0, vel: 1, niebla: 0, piso: 0, eje: 'v' },
        linea: { nombre: 'La línea', idea: 'Una sola columna grande sobre su piso y sus rieles, como una cinta transportadora de verdad: cada sección pasa de a una y se lee entera.', n: 1, ancho: 0.42, rx: 52, ry: 0, rz: -30, persp: 1500, dx: 0.13, dy: 0, vel: 0.85, niebla: 0.55, piso: 1, eje: 'v' },
        campo: { nombre: 'El campo', idea: 'Siete columnas de cartas chicas que corren a distintas velocidades: el sitio completo de un vistazo, la escala del trabajo.', n: 7, ancho: 0.15, rx: 42, ry: 0, rz: -24, persp: 2600, dx: 0.1, dy: 0, vel: 1.1, niebla: 0.4, piso: 0, eje: 'v' },
        horizonte: { nombre: 'El horizonte', idea: 'La cámara baja casi al ras: la cinta se pierde en la distancia y la niebla le da la profundidad que a la base le falta.', n: 3, ancho: 0.24, rx: 70, ry: 0, rz: -14, persp: 1100, dx: 0.17, dy: -0.04, vel: 1.3, niebla: 0.92, piso: 1, eje: 'v' },
        tira: { nombre: 'La tira', idea: 'La cinta corre en horizontal, de derecha a izquierda y en escorzo: una tira que cruza la pantalla por encima del título.', n: 3, ancho: 0.19, rx: 10, ry: -28, rz: -3, persp: 1600, dx: 0.06, dy: -0.16, vel: 1, niebla: 0.5, piso: 1, eje: 'h' }
    };
    const TEXTOS = {
        nombre: { nombre: 'El nombre', idea: 'La versión actual: el cliente manda y la decisión va de bajada. Ahora en la grilla de 12: Farma y la bajada parten exacto en la columna 4.' },
        decision: { nombre: 'La decisión', idea: 'La decisión es el titular y el cliente pasa al riel: quien llega lee primero lo que logré, no para quién.' },
        ficha: { nombre: 'La ficha', idea: 'El nombre más contenido y una ficha con datos verificables: el encargo, lo que hice, lo que entregué y en cuánto (8 semanas, del 25 ago al 20 oct).' },
        oficio: { nombre: 'El oficio', idea: 'Los dos verbos del posicionamiento como titular: diseñé y programé. El verbo que me distingue va en el turquesa claro de la marca.' }
    };
    const GRAFICAS = {
        sin: { nombre: 'Sin', idea: 'Solo la cinta.' },
        reticula: { nombre: 'Retícula', idea: 'La retícula del manual se dibuja sobre la cinta, con sus cortes de 8 px en el cruce con la franja: la estructura de la marca a la vista.' },
        cotas: { nombre: 'Cotas', idea: 'Cada captura lleva sus cotas reales, 1440 por 900, dentro del plano: se inclinan y avanzan con la cinta. El detalle técnico como prueba.' },
        trama: { nombre: 'Trama', idea: 'La trama de puntos de Llegó, la que se volvió el sistema de nodos, es la superficie de la cinta y avanza con ella.' },
        etiqueta: { nombre: 'Guía', idea: 'Una guía de despacho con los hitos reales del proyecto: remite agustín.design, seis nodos que se llenan en orden y entrega el 20 de octubre.' }
    };
    const EJES = { cinta: CINTAS, texto: TEXTOS, grafica: GRAFICAS };
    const TECLAS = { cinta: '12345', texto: 'qwer', grafica: 'asdfg' };

    /* --- 3. EL MOTOR DE LA CINTA --- */
    const raiz = document.body, h = $('.cv-h'), fijo = $('.cv-fijo'), escena = $('.cv-escena'), plano = $('.cv-plano');
    const vivo = $('.cv-vivo'), marco = $('iframe', vivo), ancho = $('[data-ancho]');
    const P = { ...CINTAS.base };
    const c = { W: 0, H: 0, cw: 0, ch: 0, g: 28, paso: 0, ciclo: 0, largo: 0, off: 0, p: 0, e: 0, t: 0 };
    let cols = [], foco = 0, armado = '', lineas = [];
    let mx = 0, my = 0, ox = 0, oy = 0, ult = 0, t0 = 0, hd = false, abierto = false, vez = 0, blanco = -1;

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
        ox += (mx - ox) * 0.06; oy += (my - oy) * 0.06;
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
    const estado = { cinta: 'base', texto: 'nombre', grafica: 'sin' };
    let callar;
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
        history.replaceState(null, '', `#${estado.cinta}/${estado.texto}/${estado.grafica}`);
        if (repetir) entrar();
    };
    const entrar = () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        h.classList.remove('entra'); void h.offsetWidth; h.classList.add('entra');
        c.iniciar(); alScroll();
        dock.classList.remove('calla'); clearTimeout(callar); callar = setTimeout(() => dock.classList.add('calla'), 6000);
        setTimeout(entibiar, 2600);
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
    window.addEventListener('pointermove', e => {
        if (e.target.closest('.cv-dock, .cv-ajustes')) { mx = my = 0; return; }
        mx = e.clientX / c.W - 0.5; my = e.clientY / c.H - 0.5;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { mx = my = 0; });
    window.addEventListener('resize', () => { c.medir(); alScroll(); });
    const bucle = ahora => { c.cuadro(ahora); requestAnimationFrame(bucle); };
    history.scrollRestoration = 'manual';
    const desdeAncla = () => {
        const [ci, te, gr] = location.hash.slice(1).split('/');
        elegir('cinta', CINTAS[ci] ? ci : 'base', false); elegir('texto', TEXTOS[te] ? te : 'nombre', false); elegir('grafica', GRAFICAS[gr] ? gr : 'sin', false);
        idea.textContent = CINTAS[estado.cinta].idea;
        entrar();
    };
    window.addEventListener('hashchange', () => { if (location.hash.slice(1) !== `${estado.cinta}/${estado.texto}/${estado.grafica}`) desdeAncla(); });
    (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(() => { desdeAncla(); requestAnimationFrame(bucle); });
})();
/* =======================================================
   FIN JS · CINTA LLEGÓ FARMA, VARIANTES (.cv-)
   ======================================================= */
