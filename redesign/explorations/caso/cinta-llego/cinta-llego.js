/* =======================================================
   INICIO JS · CINTA LLEGÓ FARMA (.ci-)
   ======================================================= */
/* Cuatro versiones del hero de la cinta en una página. Todas comparten el motor de la cinta (plano, columnas, llegada,
   enderezado, la captura en alta y el sitio en vivo al final); cada versión agrega lo suyo con ganchos:
   { e0, e1, velocidad, medir, iniciar, puntero, cuadro } */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const suave = t => 1 - Math.pow(1 - t, 3);
    const pad = n => String(n).padStart(2, '0');
    const $ = (sel, raiz = document) => raiz.querySelector(sel);
    const hora = () => new Date().toLocaleTimeString('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    /* --- 1. LAS SECCIONES DEL SITIO Y SU COPIA LOCAL --- */
    /* En el orden de llegofarma.cl, con el ancla real de cada una */
    const TOMAS = [['hero', 'Inicio', 'inicio'], ['s-capacidades', 'Capacidades', 'capacidades'], ['s-propuesta', 'Propuesta', 'propuesta'], ['s-calidad', 'Calidad', 'calidad'], ['s-tecnologia', 'Tecnología', 'tecnologia'], ['s-experiencia', 'Experiencia', 'experiencia'], ['s-categorias', 'Categorías', 'categorias'], ['s-contacto', 'Contacto', 'contacto']]
        .map(([img, nombre, ancla], i) => ({ i, img, nombre, ancla, n: pad(i + 1) }));
    const SITIO = '../../works/sitios/llego/index.html';
    /* Una carga invisible del sitio deja sus fuentes e imágenes en caché: al final, el iframe aparece sin esperar */
    let tibio = false;
    const entibiar = () => {
        if (tibio) return; tibio = true;
        const f = document.createElement('iframe');
        f.className = 'ci-tibio'; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
        f.onload = () => setTimeout(() => f.remove(), 500);
        f.src = SITIO; document.body.appendChild(f);
    };

    /* --- 2. EL MOTOR DE LA CINTA --- */
    const crearCinta = (el, o = {}) => {
        const fijo = $('.ci-fijo', el), plano = $('.ci-plano', el), vivo = $('.ci-vivo', el), marco = $('iframe', vivo), ancho = $('[data-ancho]', el);
        const lineas = [...el.querySelectorAll('.ci-linea')];
        const e0 = o.e0 || 0, e1 = o.e1 || 0.85, desvio = o.desvio ?? 0.17;
        /* Tres columnas con las ocho secciones desfasadas y a velocidades distintas; la del centro parte en Inicio */
        const cols = [[3, 0.78], [0, 1], [6, 1.22]].map(([ini, v]) => {
            const n = document.createElement('div'); n.className = 'ci-col'; plano.appendChild(n);
            return { el: n, ini, v, y: 0, cartas: [] };
        });
        const c = { el, fijo, plano, cols, W: 0, H: 0, cw: 0, ch: 0, g: 28, P: 0, ciclo: 0, colH: 0, off: 0, p: 0, e: 0, t: 0 };
        let mx = 0, my = 0, ox = 0, oy = 0, ult = 0, t0 = 0, hd = false, abierto = false, vez = 0;
        const carta = (col, k) => {
            const t = TOMAS[(col.ini + k) % 8], n = document.createElement('i');
            n.className = 'ci-carta'; n.dataset.t = t.i;
            n.innerHTML = `<img src="../media/lf-cinta-${t.img}.jpg" alt="" decoding="async"><b class="ci-nodo"></b><span class="ci-rotulo mono">${t.n} · ${t.nombre}</span>`;
            col.el.appendChild(n);
            return { el: n, img: n.firstChild, toma: t, k, visto: undefined };
        };
        c.medir = () => {
            c.W = fijo.clientWidth; c.H = fijo.clientHeight;
            c.cw = Math.round(c.W * 0.3); c.ch = c.cw * 10 / 16; c.g = Math.round(fijar(c.W * 0.02, 20, 36));
            c.P = c.ch + c.g; c.ciclo = 8 * c.P; c.colH = c.H * 3;
            const n = Math.ceil((c.colH + c.ciclo) / c.P) + 1;
            cols.forEach(col => {
                while (col.cartas.length < n) col.cartas.push(carta(col, col.cartas.length));
                col.cartas.forEach((x, k) => { x.el.style.top = (k * c.P).toFixed(1) + 'px'; });
            });
            plano.style.setProperty('--cw', c.cw + 'px'); plano.style.setProperty('--g', c.g + 'px');
            plano.style.width = (c.cw * 3 + c.g * 2) + 'px'; plano.style.height = c.colH + 'px';
            /* La ventana final: la carta aterriza bajo la barra, en 16:10, y ahí se monta el sitio real */
            const arriba = 96, abajo = 28, alto = c.H - arriba - abajo;
            c.fw = Math.min(alto * 1.6, c.W * 0.92); c.fh = c.fw / 1.6; c.fy = arriba + alto / 2;
            Object.assign(vivo.style, { left: ((c.W - c.fw) / 2).toFixed(1) + 'px', top: (c.fy - c.fh / 2).toFixed(1) + 'px', width: c.fw.toFixed(1) + 'px', height: c.fh.toFixed(1) + 'px' });
            if (ancho) ancho.textContent = Math.round(c.fw) + ' px';
            if (o.medir) o.medir(c);
        };
        c.iniciar = () => {
            c.medir(); t0 = performance.now(); ult = 0; c.off = 0; c.p = 0;
            abierto = false; vivo.classList.remove('en'); plano.style.opacity = quieto ? '' : '0';
            if (o.iniciar) o.iniciar(c);
        };
        c.puntero = (x, y) => {
            if (x == null) { mx = my = 0; } else { mx = x / c.W - 0.5; my = y / c.H - 0.5; }
            if (o.puntero) o.puntero(x, y);
        };
        c.fijarP = v => { c.p = v; };
        c.cuadro = ahora => {
            const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora; c.t = ahora - t0;
            ox += (mx - ox) * 0.06; oy += (my - oy) * 0.06;
            const e = c.e = curva(fijar((c.p - e0) / (e1 - e0)));
            const a = quieto ? 1 : suave(fijar(c.t / 1600));
            /* Llega rápido y frena hasta su velocidad de crucero: la cinta "llega" en vez de aparecer */
            const v = 0.045 * (1 + 7 * Math.exp(-c.t / 380)) * (o.velocidad ? o.velocidad(c) : 1);
            if (!quieto) c.off += dt * v * (1 - e);
            cols.forEach((col, i) => {
                let y = -((c.off * col.v) % c.ciclo);
                /* Al bajar, la columna del centro deja una carta de Inicio justo al centro */
                if (i === 1 && e > 0) {
                    const base = c.colH / 2 - c.ch / 2, n = Math.round((base - y) / c.ciclo), meta = base - n * c.ciclo; y += (meta - y) * e;
                    if (n * 8 !== c.blanco) { col.cartas.forEach((x, k) => x.el.classList.toggle('blanco', k === n * 8)); c.blanco = n * 8; }
                }
                col.y = y;
                col.el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
            });
            const esc = 1 + (c.fw / c.cw - 1) * e;
            const tx = (c.W * desvio + ox * 30) * (1 - e), ty = (1 - a) * c.H * 0.4 + (c.fy - c.H / 2) * e;
            const rx = (50 - oy * 6) * (1 - e), rz = (-26 + ox * 6) * (1 - e);
            plano.style.transform = `translate(-50%, -50%) translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${esc.toFixed(4)})`;
            plano.style.opacity = a >= 1 ? '' : fijar(c.t / 500).toFixed(3);
            /* La carta que va a llenar la pantalla cambia a la captura de 2880 px antes de crecer */
            if (!hd && e > 0.08) { hd = true; cols[1].cartas.forEach(x => { if (x.toma.img === 'hero') x.img.src = '../media/lf-hero.jpg'; }); }
            el.style.setProperty('--q', e.toFixed(3));
            el.style.setProperty('--sub', fijar(c.p / 0.12).toFixed(3));
            lineas.forEach((l, i) => l.style.setProperty('--sal', fijar((c.p - 0.02 - i * 0.03) / 0.2).toFixed(3)));
            /* Al aterrizar en la ventana, la captura se vuelve el sitio real; cada vez se recarga para que corra su entrada */
            if (e > 0.985 && !abierto) {
                abierto = true;
                marco.onload = () => { if (abierto) vivo.classList.add('en'); };
                marco.src = `${SITIO}?v=${++vez}`;
            } else if (e < 0.95 && abierto) { abierto = false; vivo.classList.remove('en'); }
            if (o.cuadro) o.cuadro(c);
        };
        return c;
    };

    /* --- 3. EL CONTROL: LA LÍNEA DE CALIDAD Y SU REGISTRO --- */
    const control = el => {
        const lista = $('[data-registro]', el);
        let puerta = null, G = 0, listo = false;
        const anotar = (x, marca = true) => {
            const li = document.createElement('li');
            li.innerHTML = `<time>${hora()}</time><span>${x.toma.n} · ${x.toma.nombre}</span><b>Validada</b>`;
            lista.prepend(li);
            while (lista.children.length > 5) lista.lastElementChild.remove();
            if (!marca) return;
            x.el.classList.add('pasa'); setTimeout(() => x.el.classList.remove('pasa'), 120);
        };
        return {
            medir(c) {
                if (!puerta) { puerta = document.createElement('div'); puerta.className = 'ci-puerta'; puerta.innerHTML = '<span class="mono">Control de calidad · LF</span><i></i><i></i>'; c.plano.appendChild(puerta); }
                G = c.colH / 2 + c.ch * 0.2; puerta.style.top = G.toFixed(1) + 'px';
            },
            iniciar(c) { listo = false; lista.innerHTML = ''; c.cols.forEach(col => col.cartas.forEach(x => { x.visto = undefined; })); },
            cuadro(c) {
                const avisa = listo && c.e < 0.02;
                c.cols.forEach(col => col.cartas.forEach(x => {
                    const visto = x.k * c.P + col.y + c.ch / 2 < G;
                    if (visto === x.visto) return;
                    const antes = x.visto; x.visto = visto; x.el.classList.toggle('visto', visto);
                    if (visto && antes === false && avisa) anotar(x);
                }));
                /* Al terminar la llegada, el registro parte con la última carta validada de cada columna */
                if (!listo && c.t > 1100) {
                    listo = true;
                    c.cols.map(col => col.cartas.filter(x => x.visto).sort((a, b) => b.k - a.k)[0]).filter(Boolean)
                        .sort((a, b) => a.k * c.P - b.k * c.P).forEach(x => anotar(x, false));
                }
            }
        };
    };

    /* --- 4. LA PIEZA: EL MOUSE FRENA LA CINTA Y LEVANTA UNA SECCIÓN --- */
    const pieza = el => {
        const tag = $('[data-etiqueta]', el), num = $('b', tag), nom = $('span span', tag), ancla = $('em', tag);
        let toma = null, f = 1, px = null, py = null;
        return {
            velocidad: () => f,
            puntero(x, y) { px = x; py = y; },
            iniciar() { if (toma) toma.classList.remove('toma'); toma = null; f = 1; },
            cuadro(c) {
                let hit = null;
                if (px != null && c.e < 0.02 && c.t > 1500) { const n = document.elementFromPoint(px, py); hit = n && n.closest('.ci-carta'); if (hit && !el.contains(hit)) hit = null; }
                if (hit !== toma) {
                    if (toma) toma.classList.remove('toma');
                    toma = hit; c.plano.classList.toggle('frena', !!toma);
                    if (toma) {
                        const t = TOMAS[+toma.dataset.t];
                        toma.classList.add('toma'); num.textContent = t.n; nom.textContent = t.nombre; ancla.textContent = `llegofarma.cl/#${t.ancla}`;
                    }
                }
                /* Frena firme al tomar y retoma de a poco al soltar */
                f += ((toma ? 0 : 1) - f) * (toma ? 0.16 : 0.035);
                tag.classList.toggle('en', !!toma);
                if (toma) tag.style.transform = `translate(${Math.min(px + 22, c.W - 260)}px, ${py + 22}px)`;
            }
        };
    };

    /* --- 5. LA LETRA: LA CINTA DENTRO DE FARMA Y EL ZOOM POR EL ASTA DE LA F --- */
    const letra = el => {
        const zoom = $('.ci-zoom', el), farma = $('.ci-farma', el), franja = $('.ci-franja', el), cab = $('.ci-cab', el);
        let ox = 0, oy = 0, sMax = 30;
        return {
            /* La cinta va centrada: tiene que llenar toda la palabra, no solo la derecha */
            e0: 0.5, e1: 0.92, desvio: 0,
            /* La medida depende de Manrope 500: si todavía no carga, se vuelve a medir cuando llegue */
            iniciar(c) { if (document.fonts && !document.fonts.check('500 100px Manrope')) document.fonts.load('500 100px Manrope').then(() => c.medir()); },
            medir(c) {
                zoom.style.transform = '';
                const f = c.fijo.getBoundingClientRect(), m = franja.getBoundingClientRect().left - f.left;
                farma.style.fontSize = '100px';
                const fs = 100 * (c.W - 2 * m) / farma.getBoundingClientRect().width;
                farma.style.fontSize = fs.toFixed(1) + 'px';
                /* El asta se mide en un canvas con la misma fuente: su centro es el origen del zoom */
                const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
                cv.width = Math.ceil(fs); cv.height = Math.ceil(fs * 1.2);
                ctx.font = `500 ${fs}px Manrope`; ctx.fillText('F', 0, fs);
                const med = ctx.measureText('F'), cap = med.actualBoundingBoxAscent, alto = cap * 0.22;
                const fila = ctx.getImageData(0, Math.round(fs - alto), cv.width, 1).data;
                let x0 = -1, x1 = -1;
                for (let x = 0; x < cv.width; x++) { const on = fila[x * 4 + 3] > 128; if (on && x0 < 0) x0 = x; if (!on && x0 >= 0) { x1 = x; break; } }
                const rango = document.createRange(); rango.setStart(farma.firstChild, 0); rango.setEnd(farma.firstChild, 1);
                const r = rango.getBoundingClientRect();
                const base = r.top - f.top + med.fontBoundingBoxAscent;
                ox = r.left - f.left + (x0 + x1) / 2; oy = base - alto;
                /* Llegó y la bajada se apoyan sobre la palabra, no contra la barra: el título se lee como una unidad */
                cab.style.bottom = (c.H - (base - cap) + c.H * 0.07).toFixed(1) + 'px';
                sMax = Math.max(c.W / Math.max(x1 - x0, 1), c.H / (cap * 0.4)) * 1.2;
                zoom.style.transformOrigin = `${ox.toFixed(1)}px ${oy.toFixed(1)}px`;
            },
            cuadro(c) {
                const z = curva(fijar(c.p / 0.46)), s = Math.pow(sMax, z);
                zoom.style.transform = z > 0 ? `translate(${((c.W / 2 - ox) * z).toFixed(1)}px, ${((c.H / 2 - oy) * z).toFixed(1)}px) scale(${s.toFixed(3)})` : '';
                el.style.setProperty('--z', z.toFixed(3));
                el.classList.toggle('abierta', z > 0.995);
            }
        };
    };

    /* --- 6. EL SELECTOR, EL SCROLL Y EL MOUSE --- */
    const ganchos = { control, pieza, letra };
    const versiones = [...document.querySelectorAll('.ci-h')].map(el => crearCinta(el, ganchos[el.dataset.v] ? ganchos[el.dataset.v](el) : {}));
    const barra = $('[data-barra]'), dock = $('.ci-dock'), idea = $('[data-idea]', dock), botones = $('.ci-dock-botones', dock), sigue = $('.ci-sigue');
    let activo = null, callar;
    botones.innerHTML = versiones.map((v, i) => `<button type="button" data-i="${i}" aria-pressed="false"><span>${pad(i + 1)}</span>${v.el.dataset.nombre}</button>`).join('');
    const alScroll = () => {
        if (!activo) return;
        const r = activo.el.getBoundingClientRect(), p = fijar(-r.top / Math.max(r.height - window.innerHeight, 1));
        activo.fijarP(p);
        if (p > 0.04) dock.classList.add('calla');
        barra.classList.toggle('sobre-claro', sigue.getBoundingClientRect().top <= 32 || (activo.el.dataset.claro === '1' && p < 0.26));
    };
    const activar = i => {
        const v = versiones[i]; if (!v) return;
        versiones.forEach(o => o.el.classList.remove('activo', 'entra'));
        activo = v; v.el.classList.add('activo');
        window.scrollTo({ top: 0, behavior: 'instant' });
        void v.el.offsetWidth; v.el.classList.add('entra');
        v.iniciar(); alScroll();
        botones.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
        idea.textContent = v.el.dataset.idea; dock.classList.remove('calla'); clearTimeout(callar); callar = setTimeout(() => dock.classList.add('calla'), 7000);
        history.replaceState(null, '', '#' + v.el.dataset.v);
        setTimeout(entibiar, 2600);
    };
    botones.addEventListener('click', e => { const b = e.target.closest('button'); if (b) activar(+b.dataset.i); });
    window.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const i = versiones.indexOf(activo), n = versiones.length;
        if (/^[1-4]$/.test(e.key)) activar(+e.key - 1);
        else if (e.key === 'ArrowRight') activar((i + 1) % n);
        else if (e.key === 'ArrowLeft') activar((i + n - 1) % n);
        else if (e.key === 'r' || e.key === 'R') activar(i);
    });
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('pointermove', e => { if (activo) activo.puntero(e.target.closest('.ci-dock') ? null : e.clientX, e.clientY); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { if (activo) activo.puntero(null); });
    window.addEventListener('resize', () => { if (activo) { activo.medir(); alScroll(); } });
    const bucle = ahora => { if (activo) activo.cuadro(ahora); requestAnimationFrame(bucle); };
    requestAnimationFrame(bucle);
    history.scrollRestoration = 'manual';
    const desdeAncla = () => versiones.findIndex(v => '#' + v.el.dataset.v === location.hash);
    window.addEventListener('hashchange', () => { const i = desdeAncla(); if (i >= 0 && versiones[i] !== activo) activar(i); });
    (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(() => activar(Math.max(desdeAncla(), 0)));
})();
/* =======================================================
   FIN JS · CINTA LLEGÓ FARMA (.ci-)
   ======================================================= */
