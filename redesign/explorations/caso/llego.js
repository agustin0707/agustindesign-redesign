/* =======================================================
   INICIO JS · CASO LLEGÓ FARMA (.lf-)
   ======================================================= */
/* Lo propio del caso, antes del motor común (caso-motor.js): el siguiente proyecto, la cinta del hero y las escenas
   que dibujan sus piezas con el scroll. Cada escena recibe su sección y devuelve una función de --p (0 a 1) */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const svg = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
    const pad = n => String(n).padStart(2, '0');
    /* Fases de las láminas: una fase va de 0 a 1 entre dos puntos del scroll, con curva firme y sin rebote */
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const tramo = (p, a, b) => curva(fijar((p - a) / (b - a)));
    const fase = (el, nombre, v) => el.style.setProperty(nombre, v.toFixed(4));
    /* Retícula del manual (la cita y el resultado): un tramo menos sus huecos, y los tramos dibujados como líneas de un svg
       que se reutilizan entre cuadros */
    const restar = (a, b, huecos) => huecos.reduce((tramos, h) => h[1] - h[0] <= 0 ? tramos : tramos.flatMap(s => {
        if (h[1] <= s[0] || h[0] >= s[1]) return [s];
        return [...(h[0] > s[0] ? [[s[0], h[0]]] : []), ...(h[1] < s[1] ? [[h[1], s[1]]] : [])];
    }), [[a, b]]);
    const trazar = (ret, segs) => {
        while (ret.childElementCount < segs.length) ret.appendChild(svg('line', {}));
        [...ret.children].forEach((l, i) => {
            const s = segs[i];
            if (!s) { l.setAttribute('visibility', 'hidden'); return; }
            l.removeAttribute('visibility');
            ['x1', 'y1', 'x2', 'y2'].forEach((k, j) => l.setAttribute(k, s[j].toFixed(1)));
        });
    };
    /* Una curva de Bézier evaluada en JS, para la llegada desde el home, que avanza dentro del cuadro de la cinta */
    const bezier = (x1, y1, x2, y2) => t => {
        if (t <= 0) return 0; if (t >= 1) return 1;
        let x = t;
        for (let i = 0; i < 10; i++) {
            const bx = 3 * x1 * x * (1 - x) ** 2 + 3 * x2 * x * x * (1 - x) + x ** 3 - t;
            const d = 3 * x1 * (1 - x) ** 2 + 6 * (x2 - x1) * x * (1 - x) + 3 * (1 - x2) * x * x;
            if (Math.abs(bx) < 1e-5 || !d) break;
            x = fijar(x - bx / d);
        }
        return 3 * y1 * x * (1 - x) ** 2 + 3 * y2 * x * x * (1 - x) + x ** 3;
    };

    /* --- 1. SIGUIENTE PROYECTO --- */
    window.CASO = {
        nombre: 'Llegó Farma',
        siguiente: { id: 'tapin', nombre: 'Tap In', numero: '02', bajada: 'Una startup de data intelligence que conecta comunidades en Chile y Perú.', tinte: '#08060F', url: 'tapin.html' }
    };

    /* --- 2. HERO: LA CINTA DE LLEGOFARMA.CL --- */
    /* El sitio real avanza en columnas de capturas sobre un plano inclinado (el horizonte de cinta-v2, con sus ajustes
       aprobados) y al bajar la columna del centro deja una carta de Inicio que crece hasta ser una ventana con el sitio
       en vivo. La escena del motor solo entrega el avance (--p); el cuadro corre en su propio bucle mientras el hero
       está en pantalla, porque la cinta avanza aunque no haya scroll */
    const cinta = (() => {
        const h = document.querySelector('.lf-h');
        if (!h) return null;
        const $ = (sel, raiz = h) => raiz.querySelector(sel);
        const suave = t => 1 - Math.pow(1 - t, 3);
        const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
        const TOMAS = ['hero', 's-capacidades', 's-propuesta', 's-calidad', 's-tecnologia', 's-experiencia', 's-categorias', 's-contacto'];
        const SITIO = '../works/sitios/llego/index.html';
        /* n columnas (impares, la del centro aterriza), ancho de carta sobre el ancho de pantalla, ángulos en grados,
           perspectiva en px, desvío como fracción de la pantalla. En la vista móvil, tres columnas más anchas */
        const HORIZONTE = { n: 5, ancho: 0.23, rx: 71, rz: -19, persp: 1050, dx: 0.19, dy: -0.04, vel: 1.25, niebla: 0.8 };
        const MOVIL = { n: 3, ancho: 0.5, dx: 0.06, dy: -0.12 };
        const fijo = $('.lf-h-fijo'), escena = $('.lf-h-escena'), plano = $('.lf-h-plano');
        const vivo = $('.lf-h-vivo'), marco = $('iframe', vivo), ancho = $('[data-ancho]'), linea = $('.lf-h-linea');
        const c = { W: 0, H: 0, cw: 0, ch: 0, g: 28, paso: 0, ciclo: 0, largo: 0, off: 0, p: 0, t: 0, esc: 1 };
        let P = HORIZONTE, cols = [], foco = 0, armado = 0;
        let mx = 0, my = 0, sx = 0, sy = 0, ox = 0, oy = 0, vx = 0, vy = 0, ult = 0, t0 = 0, hd = false, abierto = false, vez = 0, blanco = -1;

        /* --- 2.1 PRECARGA DEL SITIO --- */
        /* Un iframe invisible baja el sitio mientras se mira el hero, así la ventana en vivo abre al instante */
        let tibio = false;
        const entibiar = () => {
            if (tibio) return; tibio = true;
            const f = document.createElement('iframe');
            f.className = 'lf-h-tibio'; f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
            f.onload = () => setTimeout(() => f.remove(), 500);
            f.src = SITIO; document.body.appendChild(f);
        };

        /* --- 2.2 COLUMNAS Y MEDIDAS --- */
        const carta = (col, k) => {
            const img = TOMAS[(col.ini + k) % 8], n = document.createElement('i');
            n.className = 'lf-h-carta';
            n.innerHTML = `<img src="media/lf-cinta-${img}.jpg" alt="" decoding="async">`;
            col.el.appendChild(n);
            return { el: n, img: n.firstChild, hero: img === 'hero' };
        };
        /* Rehace las columnas solo si cambia la cantidad: la del centro parte en Inicio, el resto desfasadas de a tres
           secciones y más lentas o más rápidas según su distancia al centro */
        const armar = () => {
            if (P.n === armado) return;
            armado = P.n; plano.innerHTML = ''; hd = false; blanco = -1;
            foco = (P.n - 1) / 2;
            const paso = Math.min(0.22, 0.6 / Math.max(P.n - 1, 1));
            cols = Array.from({ length: P.n }, (_, i) => {
                const n = document.createElement('div'); n.className = 'lf-h-col' + (i === foco ? ' foco' : '');
                n.innerHTML = '<b class="lf-h-piso"></b>'; plano.appendChild(n);
                return { el: n, piso: n.firstChild, ini: (((i - foco) * 3) % 8 + 8) % 8, v: 1 + (i - foco) * paso, cartas: [] };
            });
        };
        c.medir = () => {
            P = movil.matches ? { ...HORIZONTE, ...MOVIL } : HORIZONTE;
            armar();
            c.W = fijo.clientWidth; c.H = fijo.clientHeight;
            c.cw = Math.round(c.W * P.ancho); c.ch = c.cw * 10 / 16; c.g = Math.round(fijar(c.cw * 0.067, 10, 36));
            c.paso = c.ch + c.g; c.ciclo = 8 * c.paso; c.largo = Math.max(c.W, c.H) * 3.4;
            const n = Math.ceil((c.largo + c.ciclo) / c.paso) + 1;
            cols.forEach(col => {
                while (col.cartas.length < n) col.cartas.push(carta(col, col.cartas.length));
                col.cartas.forEach((x, k) => { x.el.style.top = (k * c.paso).toFixed(1) + 'px'; });
                col.piso.style.height = (col.cartas.length * c.paso).toFixed(1) + 'px';
            });
            plano.style.setProperty('--cw', c.cw + 'px'); plano.style.setProperty('--g', c.g + 'px');
            plano.style.width = (P.n * c.cw + (P.n - 1) * c.g) + 'px'; plano.style.height = c.largo + 'px';
            escena.style.perspective = P.persp + 'px';
            fijo.style.setProperty('--foco', (50 + P.dx * 100).toFixed(1) + '%');
            /* La ventana final: la carta aterriza bajo la barra, en 16:10, y ahí se monta el sitio real. Si la ventana
               es angosta, el sitio se dibuja a 1440 y se escala, como la captura que reemplaza */
            const arriba = 96, abajo = 28, alto = c.H - arriba - abajo;
            c.fw = Math.min(alto * 1.6, c.W * 0.92); c.fh = c.fw / 1.6; c.fy = arriba + alto / 2;
            Object.assign(vivo.style, { left: ((c.W - c.fw) / 2).toFixed(1) + 'px', top: (c.fy - c.fh / 2).toFixed(1) + 'px', width: c.fw.toFixed(1) + 'px', height: c.fh.toFixed(1) + 'px' });
            const lw = c.fw < 1024 ? 1440 : c.fw, ie = c.fw / lw;
            vivo.style.setProperty('--iw', lw.toFixed(1) + 'px'); vivo.style.setProperty('--ih', (c.fh / ie).toFixed(1) + 'px'); vivo.style.setProperty('--ie', ie.toFixed(4));
            ancho.textContent = Math.round(lw) + ' px';
        };

        /* --- 2.3 EL CUADRO --- */
        c.cuadro = ahora => {
            const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora; c.t = ahora - t0;
            /* El mouse pasa por dos filtros medidos en tiempo y no en cuadros: el objetivo se suaviza (120 ms) y la cinta lo
               sigue con un resorte críticamente amortiguado. Se siente igual a 60 o a 120 Hz */
            const s = dt / 1000, k = 1 - Math.exp(-dt / 120), w = 4.2;
            sx += (mx - sx) * k; sy += (my - sy) * k;
            vx += (w * w * (sx - ox) - 2 * w * vx) * s; vy += (w * w * (sy - oy) - 2 * w * vy) * s;
            ox += vx * s; oy += vy * s;
            /* pa es el avance en la escala de la pista original (280): si el paso al resumen alarga la pista (esc), el
               aterrizaje no cambia de ritmo */
            const pa = c.p * c.esc, e = curva(fijar(pa / 0.85));
            /* Llegando del home, la carta parte aterrizada sobre la ventana de la portada (L = 1) y se suelta; E es el
               aterrizaje que se ve, el del scroll o el de la llegada, y r la caja donde aterriza */
            const ll = c.llega, L = ll ? 1 - ll.curva(fijar((ahora - ll.t0) / ll.dur)) : 0, E = Math.max(e, L);
            const r = L > e ? ll.r : { cx: c.W / 2, cy: c.fy, w: c.fw };
            const a = quieto || ll ? 1 : suave(fijar(c.t / 1600));
            /* Llega rápido y frena hasta su velocidad de crucero; las cartas chicas van más lento para pasar al mismo ritmo.
               En la llegada no hay empujón: la cinta acelera a medida que la carta se acuesta, así no se escapa del foco */
            const vel = 0.045 * (ll ? 1 : 1 + 7 * Math.exp(-c.t / 380)) * P.vel * (P.ancho / 0.3);
            if (!quieto) c.off += dt * vel * (ll ? (1 - E) ** 2 : 1 - e);
            cols.forEach((col, i) => {
                let pos = -((c.off * col.v) % c.ciclo);
                /* Al bajar, la columna del centro deja una carta de Inicio justo al centro */
                if (i === foco && E > 0) {
                    const base = c.largo / 2 - c.ch / 2, n = Math.round((base - pos) / c.ciclo);
                    pos += (base - n * c.ciclo - pos) * E;
                    if (n * 8 !== blanco) { col.cartas.forEach((x, k) => x.el.classList.toggle('blanco', k === n * 8)); blanco = n * 8; }
                }
                col.el.style.transform = `translate3d(0, ${pos.toFixed(1)}px, 0)`;
            });
            const esc = 1 + (r.w / c.cw - 1) * E;
            const tx = (c.W * P.dx + ox * 30) * (1 - E) + (r.cx - c.W / 2) * E, ty = (1 - a) * c.H * 0.4 + c.H * P.dy * (1 - E) + (r.cy - c.H / 2) * E;
            const rx = (P.rx - oy * 6) * (1 - E), rz = (P.rz + ox * 6) * (1 - E);
            plano.style.transform = `translate(-50%, -50%) translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${esc.toFixed(4)})`;
            plano.style.opacity = a >= 1 ? '' : fijar(c.t / 500).toFixed(3);
            /* La carta que va a llenar la pantalla cambia a la captura de 2880 px antes de crecer */
            if (!hd && e > 0.08) { hd = true; cols[foco].cartas.forEach(x => { if (x.hero) x.img.src = 'media/lf-hero.jpg'; }); }
            fijo.style.setProperty('--q', E.toFixed(3));
            fijo.style.setProperty('--niebla', (P.niebla * (1 - E)).toFixed(3));
            if (ll && ahora >= ll.t0 + ll.dur) { c.llega = null; ll.d.terminar(); }
            fijo.style.setProperty('--sub', fijar(pa / 0.12).toFixed(3));
            linea.style.setProperty('--sal', fijar((pa - 0.02) / 0.2).toFixed(3));
            /* Al aterrizar, la captura se vuelve el sitio real; cada vez se recarga para que corra su entrada */
            if (e > 0.985 && !abierto) {
                abierto = true;
                marco.onload = () => { if (abierto) vivo.classList.add('en'); };
                marco.src = `${SITIO}?v=${++vez}`;
            } else if (e < 0.95 && abierto) { abierto = false; vivo.classList.remove('en'); }
        };

        /* --- 2.4 EL LOGO: ENTRADA DEL HOME --- */
        /* El logo se arma al cargar (.llega), con la animación de la portada de Llegó en el home, y la clase sale cuando
           terminan sus animaciones. Recién ahí acepta el hover (.nodo), que también dura lo que duren las suyas */
        const logo = $('.lf-logo');
        let armadas = 0, pasadas = 0;
        const alTerminar = (clase, vuelta, actual) => Promise.allSettled(logo.getAnimations({ subtree: true }).map(x => x.finished)).then(() => { if (vuelta === actual()) logo.classList.remove(clase); });
        const armarLogo = () => {
            logo.classList.remove('llega', 'nodo'); void logo.getBoundingClientRect(); logo.classList.add('llega');
            alTerminar('llega', ++armadas, () => armadas);
        };

        /* --- 2.5 EL LOGO: ECO CON EL MOUSE --- */
        /* Como las letras del hero de Tap In, pero con resortes. Cada pieza mide su distancia al cursor y saca dos metas de
           una campana ancha (σ igual al 20 % del ancho del logo): el grado --lf-gw (la campana) y un tirón hacia el cursor (la
           campana por la distancia, que crece, toca techo a un σ y se apaga, así nunca salta al cruzar la pieza). Tres
           resortes por pieza persiguen esas metas en el cuadro de la cinta. Los centros salen del dibujo (getBBox), que no
           se mueve con los gestos; se miden la primera vez que el logo tiene tamaño. Solo con mouse */
        const conMouse = window.matchMedia('(hover: hover)').matches;
        const piezas = [...logo.querySelectorAll('.lf-lg-p')], iO = piezas.indexOf($('.lf-lg-o', logo));
        const VB = { x: -2, w: 440, h: 84 }, TIRON = 3, GOLPE = 15;
        let centros = null;
        const medirPiezas = () => {
            const cajas = piezas.map(p => p.getBBox());
            if (cajas.every(b => b.width)) centros = cajas.map(b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 }));
        };
        const resortes = piezas.map(() => ({ w: 0, vw: 0, px: 0, vpx: 0, py: 0, vpy: 0, mw: 0, mx: 0, my: 0, golpe: 0 }));
        let cursor = null, enReposo = true;
        const activo = () => conMouse && !quieto && !logo.classList.contains('llega') && window.scrollY < window.innerHeight * 0.3;
        /* Pasa los centros del dibujo a la pantalla con la caja actual del logo */
        const enPantalla = () => {
            const r = logo.getBoundingClientRect(), k = r.width / VB.w, y0 = r.top + (r.height - VB.h * k) / 2;
            return { k, puntos: centros.map(q => ({ x: r.left + (q.x - VB.x) * k, y: y0 + q.y * k })) };
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
        const apagar = () => {
            resortes.forEach(r => Object.assign(r, { w: 0, vw: 0, px: 0, vpx: 0, py: 0, vpy: 0, mw: 0, mx: 0, my: 0, golpe: 0 }));
            piezas.forEach(p => ['--lf-gw', '--px', '--py'].forEach(v => p.style.removeProperty(v)));
            enReposo = true;
        };
        /* Un paso de los resortes, casi críticos para que no se sientan de gelatina: el grado firme (ω 13, ζ 0,85, se
           asienta en ~350 ms sin rebote visible) y el tirón un poco más lento (ω 10, ζ 0,95). Euler semi implícito,
           estable con los 50 ms de tope del cuadro */
        const resorte = (r, v, m, w, z, s) => { const dv = 'v' + v; r[dv] += (w * w * (r[m] - r[v]) - 2 * z * w * r[dv]) * s; r[v] += r[dv] * s; };
        let antes = 0;
        const mover = ahora => {
            const s = Math.min(ahora - (antes || ahora), 50) / 1000; antes = ahora;
            if (enReposo) return;
            let quietas = 0;
            resortes.forEach((r, i) => {
                if (r.golpe && ahora >= r.golpe) { r.vw += GOLPE; r.golpe = 0; }
                resorte(r, 'w', 'mw', 13, 0.85, s); resorte(r, 'px', 'mx', 10, 0.95, s); resorte(r, 'py', 'my', 10, 0.95, s);
                const p = piezas[i].style;
                p.setProperty('--lf-gw', r.w.toFixed(4)); p.setProperty('--px', r.px.toFixed(3)); p.setProperty('--py', r.py.toFixed(3));
                if (!r.golpe && r.mw < 0.002 && Math.abs(r.w) + Math.abs(r.vw) + Math.abs(r.px) + Math.abs(r.vpx) + Math.abs(r.py) + Math.abs(r.vpy) < 0.002) quietas++;
            });
            if (quietas === piezas.length) apagar();
        };
        /* Una pasada por entrada del mouse: una ola de empujones a los resortes que parte del punto de entrada. Cada pieza
           lo recibe 0,8 ms por píxel de distancia después (hasta 460 ms) y se suma a lo que marque el cursor, sin pisarlo.
           La onda sale de la o cuando la ola llega a ella */
        logo.addEventListener('pointerenter', e => {
            if (quieto || !conMouse || logo.classList.contains('llega') || logo.classList.contains('nodo') || !centros && (medirPiezas(), !centros)) return;
            const { puntos } = enPantalla(), ahora = performance.now();
            const dl = puntos.map(q => Math.min(Math.hypot(e.clientX - q.x, e.clientY - q.y) * 0.8, 460));
            resortes.forEach((r, i) => { r.golpe = ahora + dl[i]; });
            logo.style.setProperty('--dl-o', Math.round(dl[iO] + 120) + 'ms');
            enReposo = false;
            logo.classList.add('nodo');
            alTerminar('nodo', ++pasadas, () => pasadas);
        });

        /* --- 2.6 ENTRADA, MOUSE Y BUCLE --- */
        /* El bucle corre solo con el hero en pantalla; al salir de la ventana o perder el foco la cinta vuelve al centro
           por el mismo resorte y el logo se rearma */
        let enVista = true, corriendo = false, listo = false;
        const bucle = ahora => {
            if (!enVista) { corriendo = false; ult = antes = 0; return; }
            c.cuadro(ahora); mover(ahora); requestAnimationFrame(bucle);
        };
        const correr = () => { if (listo && !corriendo && enVista) { corriendo = true; requestAnimationFrame(bucle); } };
        new IntersectionObserver(es => { enVista = es[0].isIntersecting; correr(); }).observe(h);
        window.addEventListener('pointermove', e => {
            cerca(e.clientX, e.clientY);
            mx = e.clientX / c.W - 0.5; my = e.clientY / c.H - 0.5;
        }, { passive: true });
        window.addEventListener('scroll', () => { if (cursor) cerca(cursor.x, cursor.y); }, { passive: true });
        const soltar = () => { mx = my = 0; lejos(); };
        document.addEventListener('mouseout', e => { if (!e.relatedTarget) soltar(); });
        window.addEventListener('blur', soltar);
        window.addEventListener('resize', () => c.medir());
        c.entrar = () => {
            h.classList.add('entra'); listo = true;
            c.medir(); t0 = performance.now(); ult = 0; c.off = 0;
            plano.style.opacity = quieto ? '' : '0';
            setTimeout(entibiar, 2600);
            armarLogo(); correr();
        };
        /* --- 2.7 LLEGADA DESDE EL HOME --- */
        /* La cinta arranca aterrizada en la caja de la ventana de la portada, con la captura del cuadro que se veía, y en
           ese mismo cuadro toma el relevo de la copia quieta (caso-llegada.js). El degradado del caso se enciende sobre el
           mundo de la portada, la carta se suelta en 2 s y el logo se arma cuando la cinta ya va tomando su ritmo */
        c.llegar = d => {
            h.classList.add('entra'); listo = true;
            c.medir(); t0 = performance.now(); ult = 0; c.off = 0;
            const v = d.ventana;
            c.llega = { d, r: { cx: v.x + v.w / 2, cy: v.y + v.h / 2, w: v.w }, t0: t0 + 120, dur: 2000, curva: bezier(0.45, 0, 0.2, 1) };
            c.cuadro(t0);
            const img = $('.lf-h-col.foco .blanco img');
            if (img && d.img) { Object.assign(img.style, { objectFit: 'cover', objectPosition: '50% 0' }); img.src = d.img; }
            d.tomar(800);
            $('.lf-degradado').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1100, easing: 'ease-in-out', fill: 'backwards' });
            $('.lf-h-ficha').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 2500, easing: 'linear', fill: 'backwards' });
            setTimeout(armarLogo, 1100);
            setTimeout(entibiar, 2600);
            correr();
        };
        return c;
    })();
    if (cinta && window.CASO_LLEGADA) cinta.llegar(window.CASO_LLEGADA);
    else if (cinta) {
        if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(cinta.entrar));
        else requestAnimationFrame(cinta.entrar);
    }

    /* --- 3. PASO DEL HERO AL RESUMEN: EL MENSAJERO --- */
    /* Solo en escritorio y con movimiento: la pista del hero se alarga (280 a 400) para que el resumen suba sobre su
       última pantalla. Cuenta s, cuánto subió el resumen (0 a 1), desde el avance del hero, sin medir en cada cuadro.
       La ventana se cierra en un punto (0,04 a 0,40), el punto viaja al primer hito (0,40 a 0,58), el brazo se estira
       por la ruta encendiendo los hitos (0,56 a 0,76) y el texto se despliega desde la línea (0,72 a 1).
       Dos cosas evitan el temblor: mientras el resumen sube, su panel queda fijo (.lf-sube), así no lo mueven el scroll
       y el JS a la vez; y lo que se ve sigue al scroll con un resorte de unos 90 ms, así la rueda no avanza a saltos */
    const paso = (() => {
        const h = document.querySelector('.lf-h'), res = document.querySelector('.lf-res');
        if (!h || !res || !cinta) return null;
        const html = document.documentElement, fijo = h.querySelector('.lf-h-fijo'), vivo = h.querySelector('.lf-h-vivo');
        const panel = res.querySelector('.lf-res-panel'), ruta = res.querySelector('[data-ruta]'), nodos = [...ruta.querySelectorAll('.lf-hitos li')];
        const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
        const PISTA = 400, pistaBase = parseFloat(h.style.getPropertyValue('--pista')) || 280, TAU = 90;
        const brazo = document.createElement('i');
        brazo.className = 'lf-brazo'; brazo.setAttribute('aria-hidden', 'true'); fijo.appendChild(brazo);
        const g = { H: 1, recorrido: 1, x: 0, y: 0, w: 0, nx: [] };
        let on = false, meta = 0, ver = 0, ult = 0, bucle = 0, sube = false, salto = true;
        const px = v => v.toFixed(2) + 'px';
        /* La ruta queda siempre en el mismo lugar de la pantalla mientras el panel está fijo: se mide una vez, relativa al
           panel, y los nodos por su centro (su posición sale de la escala de tiempo del HTML) */
        const medir = () => {
            g.H = window.innerHeight; g.recorrido = Math.max(h.offsetHeight - g.H, 1);
            const r = ruta.getBoundingClientRect(), pr = panel.getBoundingClientRect();
            g.x = r.left; g.y = r.top - pr.top + 6.5; g.w = r.width;
            g.nx = nodos.map(li => r.left + r.width * parseFloat(li.style.getPropertyValue('--x')));
        };
        const pintar = s => {
            const k = curva(fijar((s - 0.04) / 0.36)), mv = curva(fijar((s - 0.4) / 0.18)), b = curva(fijar((s - 0.56) / 0.2));
            fijo.style.setProperty('--lf-hund', s.toFixed(4));
            res.style.setProperty('--lf-t', curva(fijar((s - 0.72) / 0.28)).toFixed(4));
            /* La ventana: un recorte que termina en un punto de 14 px y viaja al centro del primer hito */
            const bw = parseFloat(vivo.style.width) || 0, bh = parseFloat(vivo.style.height) || 0;
            const cx = (parseFloat(vivo.style.left) || 0) + bw / 2, cy = (parseFloat(vivo.style.top) || 0) + bh / 2;
            vivo.classList.toggle('lf-cierra', k > 0);
            vivo.classList.toggle('lf-ido', b > 0.999);
            vivo.style.setProperty('--lf-k', k.toFixed(3));
            vivo.style.setProperty('--lf-ct', px((bh - 14) / 2 * k)); vivo.style.setProperty('--lf-cl', px((bw - 14) / 2 * k)); vivo.style.setProperty('--lf-cr', px(7 * k));
            vivo.style.setProperty('--lf-dx', px((g.nx[0] - cx) * mv)); vivo.style.setProperty('--lf-dy', px((g.y - cy) * mv));
            /* El brazo crece desde el primer hito hacia los dos lados; al llegar a los bordes, la ruta toma su lugar */
            const x0 = g.nx[0], izq = x0 - (x0 - g.x) * b, der = x0 + (g.x + g.w - x0) * b, listo = b > 0.999;
            brazo.style.setProperty('--lf-bx', px(izq)); brazo.style.setProperty('--lf-by', px(g.y)); brazo.style.setProperty('--lf-bw', px(der - izq));
            brazo.style.setProperty('--lf-bo', px(g.x - izq));
            brazo.classList.toggle('lf-vuela', b > 0 && !listo);
            ruta.classList.toggle('lf-trazo', listo);
            nodos.forEach((li, i) => li.classList.toggle('lf-on', listo || (b > 0 && g.nx[i] <= der + 1)));
        };
        const seguir = ahora => {
            const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora;
            ver += (meta - ver) * (salto ? 1 : 1 - Math.exp(-dt / TAU));
            if (Math.abs(meta - ver) < 0.0004) ver = meta;
            salto = false;
            pintar(ver);
            if (ver !== meta) bucle = requestAnimationFrame(seguir);
            else { bucle = 0; ult = 0; }
        };
        const cuadro = p => {
            if (!on) return;
            meta = fijar(1 - g.recorrido * (1 - p) / g.H);
            /* La posición del panel y el fondo siguen al scroll real, no al suavizado: así nunca se descalzan */
            const f = meta > 0 && meta < 1;
            if (f !== sube) { sube = f; res.classList.toggle('lf-sube', f); }
            res.classList.toggle('lf-opaco', meta > 0.999);
            /* Con el hero ya papel, la barra toma la tinta de los módulos claros */
            h.dataset.claro = meta > 0.25 ? '1' : '0';
            if (!bucle) bucle = requestAnimationFrame(seguir);
        };
        const limpiar = () => {
            fijo.style.removeProperty('--lf-hund'); res.style.removeProperty('--lf-t');
            ['--lf-k', '--lf-ct', '--lf-cl', '--lf-cr', '--lf-dx', '--lf-dy'].forEach(v => vivo.style.removeProperty(v));
            delete h.dataset.claro; res.classList.remove('lf-opaco', 'lf-sube'); sube = false;
            vivo.classList.remove('lf-cierra', 'lf-ido'); brazo.classList.remove('lf-vuela'); ruta.classList.remove('lf-trazo');
            nodos.forEach(li => li.classList.remove('lf-on'));
        };
        /* Entra y sale con el ancho: en la vista móvil el resumen queda quieto, con la ruta completa */
        let ultimoP = 0;
        const activar = () => {
            const quiere = !movil.matches && !quieto;
            if (quiere === on) return;
            on = quiere;
            html.classList.toggle('lf-paso', on);
            h.style.setProperty('--pista', String(on ? PISTA : pistaBase));
            cinta.esc = on ? (PISTA / 100 - 1) / (pistaBase / 100 - 1) : 1;
            if (!on) limpiar();
            /* Al entrar (o al cambiar de tamaño) se pinta directo, sin resorte */
            requestAnimationFrame(() => { medir(); salto = true; cuadro(ultimoP); });
        };
        movil.addEventListener('change', activar);
        window.addEventListener('resize', () => { if (on) { medir(); salto = true; cuadro(ultimoP); } });
        activar();
        return p => { ultimoP = p; cuadro(p); };
    })();

    /* --- 3.9 EL SITIO REAL DENTRO DE UNA ESCENA --- */
    /* Lo usan las decisiones 10 a la 14. Se monta en reposo y no puede enviar nada: el formulario real manda a la cuenta de
       Llegó, así que desde el portafolio no sale ningún envío ni enlace externo */
    const sitioEnEscena = (el, pant, listo, opciones = {}) => {
        let marco = null;
        const montar = () => {
            if (marco) return;
            marco = document.createElement('iframe');
            marco.title = 'llegofarma.cl'; marco.setAttribute('tabindex', '-1'); marco.inert = true;
            marco.onload = () => {
                let win, doc;
                try { win = marco.contentWindow; doc = marco.contentDocument; } catch (err) { return; }
                win.addEventListener('submit', e => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
                win.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href]'); if (a && !a.getAttribute('href').startsWith('#')) e.preventDefault(); }, true);
                /* La cámara salta: cada sección tiene que estar armada antes de que pase */
                doc.documentElement.classList.remove('m-titulos', 'm-entradas', 'm-reticula', 'm-imagenes', 'm-carga', 'cargado');
                if (opciones.fotos) doc.querySelectorAll('img[loading="lazy"]').forEach(i => { i.loading = 'eager'; });
                listo(marco, win, doc);
                setTimeout(() => pant.classList.add('listo'), 400);
            };
            if (opciones.alMontar) opciones.alMontar(marco);
            marco.src = el.dataset.ev;
            pant.appendChild(marco);
        };
        new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(montar); }), { rootMargin: '200% 0px' }).observe(el);
    };
    /* El velo es un solo trazado con huecos: lo marcado queda a opacidad completa y el resto, velado */
    const trazoRect = r => `M${r.x.toFixed(1)} ${r.y.toFixed(1)}h${r.w.toFixed(1)}v${r.h.toFixed(1)}h${(-r.w).toFixed(1)}z`;
    const marcarCaja = (caja, r, g, txt, ancho) => {
        const on = !!r && g > 0;
        caja.classList.toggle('on', on);
        if (!on) return;
        caja.style.setProperty('--lf-cx', r.x.toFixed(1) + 'px'); caja.style.setProperty('--lf-cy', r.y.toFixed(1) + 'px');
        caja.style.setProperty('--lf-cw', (r.w * g).toFixed(1) + 'px'); caja.style.setProperty('--lf-ch', r.h.toFixed(1) + 'px');
        caja.classList.toggle('abajo', r.y < 30);
        /* El rótulo se mide solo cuando cambia; va a la derecha si la marca está en el último cuarto o si no cabe */
        const s = caja.firstElementChild;
        if (s.textContent !== txt) { s.textContent = txt; caja.anchoTxt = s.offsetWidth; }
        caja.classList.toggle('der', (r.x + r.w > ancho * 0.75 && r.w < ancho * 0.5) || r.x + (caja.anchoTxt || 0) > ancho);
    };

    /* --- 4. ESCENAS PROPIAS --- */
    window.CASO_ESCENAS = {
        /* Hero: el avance de su pista endereza la cinta y la hace aterrizar */
        hero: () => p => { if (cinta) cinta.p = p; if (paso) paso(p); },
        /* Resumen: el proyecto avanza hito a hito como un envío rastreado. La ruta va en escala de tiempo: el mensajero
           recorre los días entre un hito y el siguiente al ritmo del scroll, suavizado (unos 90 ms), y lleva la semana y
           la fecha. Cada hito es un botón: al pasar muestra su línea del registro y con clic lleva el scroll a él */
        resumen: el => {
            const hitos = [...el.querySelectorAll('.lf-hitos li')], registro = [...el.querySelectorAll('.lf-registro li')];
            const ruta = el.querySelector('[data-ruta]'), estado = el.querySelector('[data-envio-estado]'), n = el.querySelector('[data-envio-n]');
            const num = el.querySelector('[data-envio-num]'), fecha = el.querySelector('[data-ruta-fecha]'), nota = el.querySelector('[data-ruta-nota]');
            /* data-tramo: la parte de la pista que usa la ruta (1 por defecto); el resto queda para el paso al capítulo.
               Se lee en cada cuadro porque la escena del capítulo lo pone y lo saca con el ancho */
            const caja = el.querySelector('.lf-estado'), total = hitos.length, TAU = 90, parte = () => +el.dataset.tramo || 1;
            const xs = hitos.map(li => parseFloat(li.style.getPropertyValue('--x'))), dias = hitos.map(li => +li.dataset.d);
            const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'], INICIO = Date.UTC(2026, 7, 25);
            const dia = d => { const f = new Date(INICIO + d * 864e5); return `Sem ${pad(Math.min(Math.floor(d / 7) + 1, 8))} · ${f.getUTCDate()} ${MESES[f.getUTCMonth()]}`; };
            let actual = -1, meta = 0, ver = -1, ult = 0, bucle = 0, hoy = -1;
            const relevo = (x, dir) => { x.style.setProperty('--dir', dir); x.classList.remove('cambia'); void x.offsetWidth; x.classList.add('cambia'); };
            const pintar = q => {
                const i = Math.min(Math.floor(q), total - 1), j = Math.min(i + 1, total - 1), t = q - i;
                ruta.style.setProperty('--lf-f', (xs[i] + (xs[j] - xs[i]) * t).toFixed(5));
                const d = Math.round(dias[i] + (dias[j] - dias[i]) * t);
                if (d !== hoy) { hoy = d; fecha.textContent = dia(d); }
            };
            const seguir = ahora => {
                const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora;
                ver = ver < 0 || quieto ? meta : ver + (meta - ver) * (1 - Math.exp(-dt / TAU));
                if (Math.abs(meta - ver) < 0.001) ver = meta;
                pintar(ver);
                if (ver !== meta) bucle = requestAnimationFrame(seguir);
                else { bucle = 0; ult = 0; }
            };
            /* Interacción: el foco (mouse o teclado) muestra la nota del hito; el clic lleva a su tramo de la pista */
            const mostrar = i => {
                hitos.forEach((li, k) => li.classList.toggle('foco', k === i));
                if (i < 0) { nota.classList.remove('ve'); return; }
                nota.innerHTML = registro[i].innerHTML;
                nota.style.setProperty('--x', xs[i]);
                nota.classList.add('ve');
            };
            hitos.forEach((li, i) => {
                const b = li.querySelector('button');
                b.setAttribute('aria-label', `${li.querySelector('b').textContent}, ${li.querySelector('.mono').textContent}: ir a este hito`);
                b.addEventListener('pointerenter', () => mostrar(i));
                b.addEventListener('pointerleave', () => mostrar(-1));
                b.addEventListener('focus', () => mostrar(i));
                b.addEventListener('blur', () => mostrar(-1));
                b.addEventListener('click', () => {
                    const r = el.getBoundingClientRect(), recorrido = (r.height - window.innerHeight) * parte();
                    window.scrollTo({ top: window.scrollY + r.top + (0.04 + 0.9 * (i + 0.5) / total) * recorrido, behavior: quieto ? 'auto' : 'smooth' });
                });
            });
            return p => {
                p = Math.min(p / parte(), 1);
                const q = fijar((p - 0.04) / 0.9) * total, k = Math.min(Math.floor(q), total - 1);
                meta = Math.min(q, total - 1);
                if (!bucle) bucle = requestAnimationFrame(seguir);
                if (k === actual) return;
                const dir = k > actual ? 1 : -1, primero = actual < 0;
                actual = k;
                hitos.forEach((li, i) => { li.classList.toggle('hecho', i < k); li.classList.toggle('actual', i === k); });
                registro.forEach((li, i) => li.classList.toggle('actual', i === k));
                estado.textContent = hitos[k].querySelector('b').textContent;
                n.textContent = `Hito ${pad(k + 1)} / ${pad(total)}`;
                num.textContent = pad(k + 1);
                if (!primero) { relevo(num, dir); relevo(caja, dir); }
            };
        },

        /* Capítulo 01, solo con el paso (.lf-paso: escritorio y con movimiento). La pista del resumen crece de 260 a 360
           (la ruta usa los primeros 160 y el resumen queda quieto los últimos 100) y la del capítulo de 100 a 400, así su
           portada sube fija sobre el resumen quieto. Su avance va en tres tercios: el hito del pitch se llena de la
           portada y crece hasta cubrir la pantalla; se traza el 01, crece la retícula y entra el título (empieza antes de
           terminar de abrir, así nunca queda vacía, y en la pausa entra el índice del capítulo); y la decisión 01 sube encima mientras la portada se hunde. Lo que se
           ve sigue al scroll con el resorte de 90 ms del resumen; abrir y la tinta de la barra siguen al scroll real */
        capitulo: el => {
            const res = document.querySelector('.lf-res'), fijo = el.querySelector('[data-cap]');
            if (!res || !fijo) return null;
            const html = document.documentElement, panel = res.querySelector('.lf-res-panel'), ruta = res.querySelector('[data-ruta]');
            const nodo = ruta.querySelectorAll('.lf-hitos li')[1];
            const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
            const base = { res: parseFloat(res.style.getPropertyValue('--pista')) || 260, cap: parseFloat(el.style.getPropertyValue('--pista')) || 100 };
            const VARS = ['--lf-pr', '--lf-px', '--lf-py', '--lf-pl', '--lf-pd', '--lf-pt', '--lf-pi', '--lf-ps'], TAU = 90;
            const g = { H: 1, R: 1, techo: 1 };
            let on = false, meta = 0, ver = 0, ult = 0, bucle = 0, salto = true, ultimoP = 0;
            const px = v => v.toFixed(2) + 'px';
            /* El centro del hito sale de la escala de tiempo de la ruta (no de su caja, que el paso escala), relativo al
               panel del resumen, que mientras la portada se abre está fijo arriba */
            const medir = () => {
                const W = window.innerWidth, r = ruta.getBoundingClientRect(), pr = panel.getBoundingClientRect();
                const x = r.left + r.width * parseFloat(nodo.style.getPropertyValue('--x')), y = r.top - pr.top + 6.5;
                g.H = window.innerHeight;
                g.R = Math.hypot(Math.max(x, W - x), Math.max(y, g.H - y));
                /* Desde este radio el círculo ya tapa la franja de la barra */
                g.techo = Math.hypot(Math.max(x, W - x), y);
                fijo.style.setProperty('--lf-px', px(x)); fijo.style.setProperty('--lf-py', px(y));
            };
            /* Primero el nodo se llena (hasta su radio de 6,5 px) y después crece con curva firme hasta la esquina más lejana */
            const radio = p => { const r = fijar(p * 3); return r < 0.08 ? 6.5 * r / 0.08 : 6.5 + (g.R - 6.5) * curva((r - 0.08) / 0.92); };
            const pintar = p => {
                fijo.style.setProperty('--lf-pr', px(radio(p)));
                fase(fijo, '--lf-pl', tramo(p, 0.227, 0.427));
                fase(fijo, '--lf-pd', tramo(p, 0.253, 0.533));
                fase(fijo, '--lf-pt', tramo(p, 0.32, 0.493));
                /* El índice del capítulo entra en la pausa, una línea a la vez (el CSS reparte --lf-pi con el --k de cada una) */
                fase(fijo, '--lf-pi', fijar((p - 0.4) / 0.22));
                /* La hoja de la decisión sube al ritmo del scroll: la portada se hunde en línea con ella */
                fase(fijo, '--lf-ps', fijar((p - 2 / 3) * 3));
                nodo.classList.toggle('lf-elegido', p > 0);
            };
            const seguir = ahora => {
                const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora;
                ver += (meta - ver) * (salto ? 1 : 1 - Math.exp(-dt / TAU));
                if (Math.abs(meta - ver) < 0.0004) ver = meta;
                salto = false;
                pintar(ver);
                if (ver !== meta) bucle = requestAnimationFrame(seguir);
                else { bucle = 0; ult = 0; }
            };
            const cuadro = p => {
                if (!on) return;
                meta = p;
                el.classList.toggle('lf-abre', p > 0.0005);
                /* La barra: tinta clara apenas la portada tapa su franja, y otra vez oscura cuando la hoja de la decisión llega arriba */
                if (radio(p) >= g.techo) res.dataset.claro = '0'; else delete res.dataset.claro;
                if (fijar((p - 2 / 3) * 3) > 1 - 32 / g.H) el.dataset.claro = '1'; else delete el.dataset.claro;
                if (!bucle) bucle = requestAnimationFrame(seguir);
            };
            const activar = () => {
                const quiere = html.classList.contains('lf-paso');
                if (quiere === on) return;
                on = quiere;
                res.style.setProperty('--pista', String(on ? base.res + 100 : base.res));
                el.style.setProperty('--pista', String(on ? 400 : base.cap));
                if (on) res.dataset.tramo = String((base.res - 100) / base.res); else delete res.dataset.tramo;
                if (!on) {
                    VARS.forEach(v => fijo.style.removeProperty(v));
                    el.classList.remove('lf-abre'); nodo.classList.remove('lf-elegido');
                    delete res.dataset.claro; delete el.dataset.claro;
                    return;
                }
                requestAnimationFrame(() => { medir(); salto = true; cuadro(ultimoP); });
            };
            /* El paso del hero decide .lf-paso con la misma consulta y escucha antes: aquí solo se sigue */
            movil.addEventListener('change', activar);
            window.addEventListener('resize', () => { if (on) { medir(); salto = true; cuadro(ultimoP); } });
            activar();
            return p => { ultimoP = p; cuadro(p); };
        },

        /* Sistema, el taller del nodo: mide la mesa y escribe la geometría. El paso de la trama (--P) parte cada tercio en un
           número entero de pasos, así el centro de los tres tercios (Farma, minería y food) cae sobre la trama. El nodo
           central (--cx, --cy) es el de Farma; los pasos 2 y 3 lo acercan al centro de la mesa. Dibuja la trama con los
           campos de la madre en los bordes (lámina 05) y escribe el paso actual en data-k: el resto lo hace el CSS */
        taller: (el, h) => {
            const pieza = el.querySelector('.lf-taller'), mesa = el.querySelector('[data-taller]'), trama = el.querySelector('[data-trama]');
            if (!pieza || !mesa || !trama) return null;
            /* Los cuatro pasos terminan antes del final de la pista: la última pantalla es la del filo a la 03 */
            const hasta = +el.dataset.pasosHasta || 1;
            const azar = (i, j, s) => { const x = Math.sin(i * 12.9898 + j * 78.233 + s * 37.719) * 43758.5453; return x - Math.floor(x); };
            /* Los campos de puntos, en fracciones de la mesa: arriba a la izquierda, arriba al centro, a la derecha y abajo */
            const campos = [[0, 0, 0.34, 0.3], [0.56, 0, 0.8, 0.18], [0.86, 0.3, 1, 1], [0.18, 0.82, 0.36, 1]];
            const px = v => v.toFixed(2) + 'px';
            let ancho = 0, alto = 0;
            const medir = () => {
                const W = mesa.clientWidth, H = mesa.clientHeight;
                if (!W || !H || (W === ancho && H === alto)) return;
                ancho = W; alto = H;
                const P = W / 3 / Math.max(4, Math.round(W / 3 / 34)), cx = W / 6, cy = H * 0.34;
                const rd = Math.max(1.6, P * 0.07), PZ = Math.min(H * 0.19, W * 0.15, 120), Z = PZ / P;
                const v = {
                    '--P': px(P), '--cx': px(cx), '--cy': px(cy), '--Z': Z.toFixed(4), '--PZ': px(PZ), '--s0': (rd / (P * 0.335)).toFixed(4),
                    '--t1x': px(W / 2 - Z * cx), '--t1y': px(H / 2 - Z * (cy + P / 2)), '--t2x': px(W / 2 - Z * cx), '--t2y': px(H / 2 - Z * cy)
                };
                Object.keys(v).forEach(k => mesa.style.setProperty(k, v[k]));
                /* La trama: cada punto sabe si es de un campo (--o, su intensidad) y cuánto espera para ordenarse (--d) */
                const i0 = Math.ceil((rd * 4 - cx) / P), i1 = Math.floor((W - rd * 4 - cx) / P);
                const j0 = Math.ceil((rd * 4 - cy) / P), j1 = Math.floor((H - rd * 4 - cy) / P);
                let puntos = '';
                for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
                    const x = cx + i * P, y = cy + j * P, u = x / W, w = y / H;
                    const dist = Math.min(...campos.map(([a, b, c, d]) => Math.hypot(Math.max(a - u, 0, u - c) * W / P, Math.max(b - w, 0, w - d) * H / P)));
                    const campo = dist === 0 || (dist < 2 && azar(i, j, 1) > dist / 2);
                    /* Dentro de los espacios de minería y food: la trama que queda encendida en el paso 4 */
                    const hueco = Math.abs(y - cy) < P * 1.6 && [W / 2, W * 5 / 6].some(hx => Math.abs(x - hx) < P * 1.6);
                    const espera = Math.min(Math.round(Math.hypot(i, j) * 22), 420);
                    puntos += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rd.toFixed(2)}"${campo || hueco ? ` class="${campo ? 'f' : ''}${hueco ? ' h' : ''}"` : ''} style="--d:${espera}${campo ? ';--o:' + (0.45 + 0.55 * azar(i, j, 2)).toFixed(2) : ''}"/>`;
                }
                /* Las cajas del isotipo: la de Farma se ve con la lente cerca, así que su trazo y su punteado se dividen por Z */
                const lado = P * 3.2692, r = (lado * 0.24).toFixed(1), caja = (hx, clase, z) => `<rect class="${clase}" x="${(hx - lado / 2).toFixed(1)}" y="${(cy - lado / 2).toFixed(1)}" width="${lado.toFixed(1)}" height="${lado.toFixed(1)}" rx="${r}" stroke-width="${(1 / z).toFixed(3)}" stroke-dasharray="${(4 / z).toFixed(2)} ${(4 / z).toFixed(2)}"/>`;
                trama.setAttribute('viewBox', `0 0 ${W} ${H}`);
                trama.innerHTML = puntos + caja(cx, 'caja', Z) + caja(W / 2, 'hueco', 1) + caja(W * 5 / 6, 'hueco', 1);
            };
            medir();
            let espera = null;
            window.addEventListener('resize', () => { cancelAnimationFrame(espera); espera = requestAnimationFrame(medir); });
            let actual = -1;
            return p => {
                const k = Math.min(Math.floor(h.fijar(p / hasta) * 4), 3);
                if (k === actual) return;
                actual = k; pieza.dataset.k = k;
                /* Si la mesa se midió oculta, se mide al llegar */
                if (!ancho) medir();
            };
        },

        /* Paleta, paso 1: caen las bandas, una tras otra. Paso 2: el degradado las funde y el mouse abre cada banda, con su HEX.
           Paso 3: la capa se recoge en un filete y de él suben los tres tonos */
        valores: el => {
            const pieza = el.querySelector('.lf-val'), bandas = el.querySelector('.lf-val-bandas'), liso = el.querySelector('.lf-val-liso');
            const tonos = ['104E56', '178181', '1B9C9C', '21B6B6', '49C2BF', '70CAC7', '80E2DF', 'B7E5E2', 'E8E8E8', 'F4F4F4'];
            bandas.innerHTML = tonos.map((c, k) => `<i style="--c:#${c}"><span class="mono"><b>${pad(k + 1)}</b>#${c}</span></i>`).join('');
            const tiras = [...bandas.children], bloques = [...el.querySelectorAll('.lf-val-tono')];
            const escala = () => pieza.style.setProperty('--fil-e', (10 / (pieza.clientHeight || 900)).toFixed(4));
            escala(); window.addEventListener('resize', escala);
            let mide = false, actual = -1;
            const abrir = k => {
                if (k === actual) return;
                if (k < 0) { const c = (actual + 0.5) * 10 + '%'; liso.style.setProperty('--lf-va', c); liso.style.setProperty('--lf-vb', c); pieza.classList.remove('mide'); actual = -1; return; }
                if (actual < 0) { const c = (k + 0.5) * 10 + '%'; liso.style.transition = 'none'; liso.style.setProperty('--lf-va', c); liso.style.setProperty('--lf-vb', c); void liso.offsetWidth; liso.style.transition = ''; }
                actual = k; pieza.classList.add('mide');
                liso.style.setProperty('--lf-va', k * 10 + '%'); liso.style.setProperty('--lf-vb', (k + 1) * 10 + '%');
            };
            pieza.addEventListener('pointermove', e => { if (!mide || e.pointerType === 'touch') return; const r = pieza.getBoundingClientRect(); abrir(Math.min(Math.floor(((e.clientX - r.left) / r.width) * 10), 9)); });
            pieza.addEventListener('pointerleave', () => abrir(-1));
            /* Con el paso (.lf-paso) la 03 entra con el filo: la línea descubre los diez valores ya puestos, sin pieza vacía */
            const html = document.documentElement;
            /* Si la pista suma la pantalla de un paso (data-pasos-hasta), la pieza termina antes de ella */
            const hasta = +el.dataset.pasosHasta || 1;
            return q => {
                const p = fijar(q / hasta), puestas = html.classList.contains('lf-paso');
                tiras.forEach((t, k) => fase(t, '--f', puestas ? 1 : tramo(p, 0.02 + k * 0.024, 0.12 + k * 0.024)));
                const l = tramo(p, 0.38, 0.5), f = tramo(p, 0.68, 0.78);
                fase(pieza, '--liso', l); fase(pieza, '--filete', f);
                bloques.forEach((b, k) => fase(b, '--f', tramo(p, 0.74 + k * 0.04, 0.84 + k * 0.04)));
                mide = l > 0.98 && f < 0.02;
                if (!mide) abrir(-1);
            };
        },

        /* Logo, como en el manual: composición, construcción con el módulo X, área de protección y mínimos */
        lockup: el => {
            const pieza = el.querySelector('.lf-lock'), pie = el.querySelector('[data-lock-pie]'), pag = el.querySelector('[data-lock-pag]');
            /* Cada paso con su página del brandbook */
            const nombres = ['Principal', 'Construcción', 'Área de protección', 'Mínimos'], paginas = ['03', '06', '08', '09'];
            /* Si la pista suma la pantalla del filo (data-pasos-hasta), la pieza termina antes de ella */
            const hasta = +el.dataset.pasosHasta || 1;
            /* Con el paso (.lf-paso) la 05 entra con el filo: la línea descubre el logo ya compuesto, sin pieza vacía */
            const html = document.documentElement;
            let paso = -1;
            return q => {
                const p = fijar(q / hasta);
                const c1 = html.classList.contains('lf-paso') ? 1 : tramo(p, 0.02, 0.16);
                fase(pieza, '--c1', c1); fase(pieza, '--c1o', c1 * (1 - tramo(p, 0.24, 0.29)));
                fase(pieza, '--c2', tramo(p, 0.27, 0.45)); fase(pieza, '--cx', tramo(p, 0.42, 0.48));
                fase(pieza, '--c3', tramo(p, 0.52, 0.68)); fase(pieza, '--c4', tramo(p, 0.76, 0.86));
                const k = Math.min(Math.floor(p * 4), 3);
                if (k !== paso) { paso = k; pie.textContent = nombres[k]; if (pag) pag.textContent = `Logotipo · Brandbook, pág. ${paginas[k]}`; }
            };
        },

        /* Caminos, en cinco pasos: el encargo con sus cuatro criterios, entran los isotipos, suben sus aplicaciones, se
           comparan en adjetivos y se marca el elegido */
        caminos: el => {
            const pieza = el.querySelector('.lf-cam'), cols = [...el.querySelectorAll('.lf-cam-col')], encargo = el.querySelector('.lf-cam-encargo');
            const hasta = +el.dataset.pasosHasta || 1;
            return q => {
                const p = fijar(q / hasta);
                if (encargo) { fase(encargo, '--ec', tramo(p, 0.01, 0.12)); fase(encargo, '--en', 1 - tramo(p, 0.17, 0.23)); }
                cols.forEach((c, k) => { fase(c, '--ci', tramo(p, 0.21 + k * 0.04, 0.29 + k * 0.04)); fase(c, '--fo', tramo(p, 0.42 + k * 0.04, 0.5 + k * 0.04)); });
                fase(pieza, '--cr', tramo(p, 0.62, 0.74)); fase(pieza, '--el', tramo(p, 0.82, 0.9));
            };
        },

        /* Manual: las páginas pasan y se detienen. Cada página queda al centro alrededor de su paso del rótulo y el cambio
           ocurre justo en el borde entre pasos. La curva nunca se detiene del todo (un 20 % lineal), así el scroll siempre
           mueve algo; y la posición sigue al scroll con inercia, para que una muesca de la rueda no salte media página.
           Si la sección tiene más pasos que páginas, el último es el cierre: --fin va de 0 a 1 con las páginas quietas. Si la
           pista suma la pantalla de un paso (data-pasos-hasta), todo termina antes de ella */
        manual: el => {
            const pags = [...el.querySelectorAll('.lf-man-pag')], n = pags.length, sec = el.querySelector('[data-man-sec]'), num = el.querySelector('[data-man-pag]');
            const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const pasos = Math.max(+el.dataset.pasos || n, n), hasta = +el.dataset.pasosHasta || 1;
            const suave = u => u * u * u * (u * (u * 6 - 15) + 10);
            const curvaPag = u => 0.8 * suave(fijar((u - 0.1) / 0.8)) + 0.2 * u;
            let actual = -1, objetivo = 0, mostrado = null, bucle = 0, antes = 0;
            const pintar = total => {
                const pos = Math.min(total, n - 1);
                if (pasos > n) fase(el, '--fin', fijar(total - (n - 1)));
                pags.forEach((g, i) => { const d = i - pos; fase(g, '--d', d); fase(g, '--o', fijar(1 - Math.abs(d) * 0.72, 0.16, 1)); });
                const c = Math.min(Math.max(Math.round(pos), 0), n - 1);
                if (c === actual) return;
                actual = c;
                const g = pags[c].dataset;
                /* La última hoja no es una página: es el desenlace */
                sec.textContent = g.sec; num.textContent = g.pag === 'Portada' ? 'Portada' : `Pág. ${g.pag} / 36`;
            };
            /* Seguimiento con inercia: se acerca al objetivo con una constante de 110 ms, sin pasarse */
            const seguir = ahora => {
                const dt = Math.min(64, antes ? ahora - antes : 16);
                antes = ahora;
                mostrado += (objetivo - mostrado) * (1 - Math.exp(-dt / 110));
                if (Math.abs(objetivo - mostrado) < 0.0006) mostrado = objetivo;
                pintar(mostrado);
                if (mostrado === objetivo) { bucle = 0; antes = 0; } else bucle = requestAnimationFrame(seguir);
            };
            return q => {
                const p = fijar(q / hasta), t = fijar(p * pasos - 0.5, 0, pasos - 1), k = Math.min(Math.floor(t), pasos - 2);
                objetivo = k + curvaPag(t - k);
                /* La primera vez, con movimiento reducido o en un salto largo (un enlace), se pinta directo */
                if (mostrado === null || quieto || Math.abs(objetivo - mostrado) > 2.5) { cancelAnimationFrame(bucle); bucle = 0; antes = 0; mostrado = objetivo; pintar(mostrado); return; }
                if (!bucle) bucle = requestAnimationFrame(seguir);
            };
        },

        /* Dominio: parte en llego.cl/farma, con Farma encerrada en el morado de la madre. Sobre ella, la dirección en grande:
           el QR apunta a ella y las llaves nombran sus partes; /farma se tacha, farma salta sobre .cl y queda llegofarma.cl
           mientras la barra se borra y se reescribe. Carga, y el morado se retira hasta que Farma llena la ventana
           (llego.css secciones 9 y 9.0) */
        dominio: el => {
            const chica = el.querySelector('[data-url-chica]'), dir = el.querySelector('.lf-dom-dir'), pant = el.querySelector('.lf-dom-pant');
            const viejo = 'llego.cl/farma', nuevo = 'llegofarma.cl';
            const lineal = (p, a, b) => fijar((p - a) / (b - a));
            const pz = {};
            dir.querySelectorAll('[data-pz]').forEach(n => { pz[n.dataset.pz] = n; });
            const llave = n => dir.querySelector(`[data-ll="${n}"]`);
            /* La pista suma la pantalla en que sube la 10: todo termina antes de ella */
            const hasta = +el.dataset.pasosHasta || 1;
            let previo = '', w = null, salto = -1, ultimo = 0;

            /* --- Anchos de cada pieza, en px y sin escala: de ahí salen el tachado, las llaves y el salto --- */
            const medir = () => {
                w = {};
                Object.keys(pz).forEach(k => { w[k] = pz[k].offsetWidth; });
                const dirCl = w.llego + w.cl, total = dirCl + w.barra + w.farma;
                dir.style.setProperty('--dw', total);
                dir.style.setProperty('--tx', dirCl); dir.style.setProperty('--tw', w.barra + w.farma);
                [['madre', 0, dirCl], ['carpeta', dirCl, w.barra + w.farma], ['propio', 0, w.llego + w.farma + w.cl]].forEach(([n, x, a]) => {
                    const l = llave(n); l.style.setProperty('--lx', x); l.style.setProperty('--lw', a);
                });
                salto = -1;
            };
            /* --- El salto: farma pasa por encima de .cl en arco, y .cl le cede el lugar con un leve hundimiento --- */
            const saltar = k => {
                const antes = { llego: 0, cl: w.llego, barra: w.llego + w.cl, farma: w.llego + w.cl + w.barra };
                const despues = { llego: 0, farma: w.llego, cl: w.llego + w.farma, barra: w.llego + w.farma };
                const arco = Math.sin(Math.PI * k);
                Object.keys(pz).forEach(n => { pz[n].style.setProperty('--x', (antes[n] + (despues[n] - antes[n]) * k).toFixed(1)); });
                pz.farma.style.setProperty('--y', (-0.62 * arco).toFixed(3));
                pz.cl.style.setProperty('--y', (0.1 * arco).toFixed(3));
                salto = k;
            };
            if ('ResizeObserver' in window) new ResizeObserver(() => { medir(); pintar(ultimo); }).observe(pant);
            if (document.fonts) document.fonts.ready.then(() => { medir(); pintar(ultimo); });

            const pintar = q => {
                ultimo = q;
                const p = fijar(q / hasta);
                if (!w) medir();
                const quedan = 1 - lineal(p, 0.34, 0.42), escrito = lineal(p, 0.46, 0.58);
                const html = p < 0.44 ? viejo.slice(0, Math.round(quedan * viejo.length)) : nuevo.slice(0, Math.round(escrito * nuevo.length));
                if (html !== previo) { chica.textContent = html; previo = html; }
                el.classList.toggle('lf-dom-escribe', p > 0.3 && p < 0.58);
                el.classList.toggle('lf-dom-ficha-on', p >= 0.82);
                fase(el, '--lf-dv', Math.min(lineal(p, 0.04, 0.12), 1 - lineal(p, 0.6, 0.68)));
                fase(el, '--lf-da', Math.min(lineal(p, 0.1, 0.18), 1 - lineal(p, 0.26, 0.31)));
                fase(el, '--lf-dt', lineal(p, 0.19, 0.26));
                fase(el, '--lf-dx', lineal(p, 0.27, 0.3));
                const k = tramo(p, 0.3, 0.44);
                fase(el, '--lf-dmz', k);
                if (k !== salto) saltar(k);
                fase(el, '--lf-db', lineal(p, 0.44, 0.52));
                fase(el, '--lf-qo', quedan);
                fase(el, '--lf-qn', escrito);
                fase(el, '--lf-dl', Math.min(lineal(p, 0.28, 0.32), 1 - lineal(p, 0.6, 0.66)));
                fase(el, '--carga', lineal(p, 0.58, 0.66));
                fase(el, '--lf-dm', 1 - tramo(p, 0.64, 0.84));
                fase(el, '--lf-dc', lineal(p, 0.82, 0.9));
            };
            return pintar;
        },

        /* Una página, una acción: el sitio real en la ventana que dejó la 09. El velo abre huecos a opacidad completa sobre
           lo que actúa y lo que navega; la página baja entera con el botón de la cabecera siempre marcado; la cámara se
           acerca al formulario, los seis campos se escriben y aparece la confirmación real. El avance solo mueve la cámara:
           nada se envía, ni desde el teclado (llego.css 9.1) */
        accion: el => {
            const pant = el.querySelector('.lf-ac-pant'), velo = el.querySelector('.lf-ac-velo'), hueco = velo.firstElementChild;
            const cajas = [...el.querySelectorAll('.lf-ac-caja')], datos = [...el.querySelectorAll('[data-ac-dato]')];
            const vistaMovil = window.matchMedia('(max-width: 768px)');
            const CAMPOS = [['f-nombre', 'Javiera Soto'], ['f-empresa', 'Laboratorio Ejemplo'], ['f-cargo', 'Jefa de logística'], ['f-email', 'javiera@ejemplo.cl'], ['f-tel', '+56 9 1234 5678'], ['f-msg', 'Necesitamos llevar cadena de frío a regiones.']];
            const TIEMPO = { velo: [0.05, 0.1], actuar: [0.07, 0.12], cabecera: [0.13, 0.18], navegar: [0.22, 0.27], sale: [0.35, 0.39], baja: [0.38, 0.6], acerca: [0.6, 0.67], forma: [0.65, 0.69], campos: [0.69, 0.9], envia: 0.93 };
            const PAD = 10;
            const lineal = (p, a, b) => fijar((p - a) / (b - a));
            const mezcla = (a, b, t) => a + (b - a) * t;
            let marco = null, win = null, doc = null, avance = 0, bucle = 0, escrito = false, W = 1440, H = 900, A = 742, B = 528;
            const cam = { e: 0, x: 0, y: 0, sy: 0 };

            const medir = () => {
                W = vistaMovil.matches ? 390 : 1440;
                A = pant.clientWidth; B = pant.clientHeight; H = Math.round(B / (A / W));
                if (marco) { marco.style.setProperty('--lf-iw', W + 'px'); marco.style.setProperty('--lf-ih', H + 'px'); }
                cam.e = 0;
            };
            sitioEnEscena(el, pant, (m, w, d) => { win = w; doc = d; medir(); pedir(); setTimeout(pedir, 420); }, { fotos: true, alMontar: m => { marco = m; medir(); } });

            /* --- Los seis campos, de vacíos a la confirmación --- */
            const formulario = (fo, p) => {
                if (p < TIEMPO.acerca[0]) {
                    if (escrito) { fo.classList.remove('enviado'); CAMPOS.forEach(([id]) => { doc.getElementById(id).value = ''; }); doc.getElementById('f-ok').checked = false; escrito = false; }
                    return 'Campo 1 de 6';
                }
                escrito = true;
                const [a, b] = TIEMPO.campos, tramoCampo = (b - a) / CAMPOS.length;
                let actual = 0;
                CAMPOS.forEach(([id, v], i) => {
                    const t = lineal(p, a + i * tramoCampo, a + (i + 0.92) * tramoCampo), n = doc.getElementById(id), texto = v.slice(0, Math.round(t * v.length));
                    if (n.value !== texto) n.value = texto;
                    if (t > 0) actual = i;
                });
                doc.getElementById('f-ok').checked = p >= b;
                const enviado = p >= TIEMPO.envia;
                if (enviado && !fo.classList.contains('enviado')) {
                    doc.querySelector('.exito-titulo').textContent = 'Gracias, Javiera.';
                    doc.querySelector('.exito-texto').textContent = 'Recibimos tu mensaje. Nuestro equipo te contactará pronto para conversar sobre tu operación.';
                }
                fo.classList.toggle('enviado', enviado);
                return enviado ? 'Enviado, sin recargar' : p >= b ? 'Enviar' : `Campo ${actual + 1} de 6`;
            };

            /* --- Cuadro a cuadro: cámara, velo, huecos y marcas --- */
            const pintar = () => {
                bucle = 0;
                if (!doc || !doc.body) return;
                const p = avance, T = TIEMPO, fo = doc.getElementById('formulario');
                if (!fo) return;
                /* Adónde va la cámara: al ancho en el hero, de cerca en el formulario */
                const fr = fo.getBoundingClientRect(), max = Math.max(doc.documentElement.scrollHeight - H, 0);
                const base = A / W, cerca = Math.min(A * 0.86 / fr.width, B * 0.82 / fr.height);
                const fin = fijar(fr.top + win.scrollY + fr.height / 2 - H / 2, 0, max);
                const z = tramo(p, T.acerca[0], T.acerca[1]);
                const ex = fijar(A / 2 - (fr.left + fr.width / 2) * cerca, Math.min(A - W * cerca, 0), 0), ey = fijar(B / 2 - (H / 2) * cerca, Math.min(B - H * cerca, 0), 0);
                /* Con el velo ya cerrado el borde del iframe no se ve: recién ahí el formulario se centra del todo */
                const centrado = mezcla(ex, A / 2 - (fr.left + fr.width / 2) * cerca, tramo(p, T.forma[1] - 0.02, T.forma[1] + 0.02));
                const meta = { e: mezcla(base, cerca, z), x: mezcla(0, centrado, z), y: mezcla(0, ey, z), sy: fin * tramo(p, T.baja[0], T.baja[1]) };
                const a = quieto || cam.e === 0 ? 1 : 0.2;
                let sigue = false;
                Object.keys(cam).forEach(k => { const d = meta[k] - cam[k]; if (Math.abs(d) > (k === 'e' ? 0.0004 : 0.4)) { cam[k] += d * a; sigue = true; } else cam[k] = meta[k]; });
                win.scrollTo({ top: cam.sy, behavior: 'instant' });
                marco.style.setProperty('--lf-ie', cam.e.toFixed(4)); marco.style.setProperty('--lf-ix', cam.x.toFixed(1) + 'px'); marco.style.setProperty('--lf-iy', cam.y.toFixed(1) + 'px');
                /* Lo que está marcado, medido en la pantalla del navegador */
                const medida = (sel, m = PAD) => {
                    const n = doc.querySelector(sel);
                    if (!n) return null;
                    const r = n.getBoundingClientRect();
                    return r.width ? { x: (r.left - m) * cam.e + cam.x, y: (r.top - m) * cam.e + cam.y, w: (r.width + m * 2) * cam.e, h: (r.height + m * 2) * cam.e } : null;
                };
                const texto = formulario(fo, p);
                const fuera = 1 - lineal(p, T.sale[0], T.sale[1]);
                const huecos = [
                    { r: medida('.s-hero .cta-grande'), g: lineal(p, T.actuar[0], T.actuar[1]) * (fuera > 0 ? 1 : 0), caja: 0, txt: 'Actuar' },
                    { r: medida(vistaMovil.matches ? '.barra-cta' : '.pildora.accion'), g: lineal(p, T.cabecera[0], T.cabecera[1]) * (p < T.acerca[0] + 0.02 ? 1 : 0), caja: 1, txt: p < T.sale[0] ? 'Actuar' : 'Siempre a la vista' },
                    p < T.sale[1]
                        ? { r: medida('.s-hero .indice'), g: lineal(p, T.navegar[0], T.navegar[1]) * (fuera > 0 ? 1 : 0), caja: 2, txt: 'Navegar' }
                        : { r: medida('.s-cta .campos', 0), g: lineal(p, T.forma[0], T.forma[1]), caja: 2, txt: texto }
                ];
                huecos.forEach(u => marcarCaja(cajas[u.caja], u.r, u.g, u.txt, A));
                /* El velo cae dos veces: sobre el hero, con el resto a la vista, y sobre el formulario, cerrado para dejarlo solo */
                velo.style.setProperty('--lf-av', Math.max(Math.min(lineal(p, T.velo[0], T.velo[1]), fuera), lineal(p, T.forma[0], T.forma[1])).toFixed(3));
                velo.style.setProperty('--lf-avo', mezcla(0.5, 1, lineal(p, T.forma[0], T.forma[1])).toFixed(3));
                const abiertos = huecos.filter(u => u.r && u.g > 0).map(u => trazoRect({ x: u.r.x, y: u.r.y, w: u.r.w * u.g, h: u.r.h }));
                hueco.setAttribute('d', trazoRect({ x: 0, y: 0, w: A, h: B }) + abiertos.join(''));
                datos.forEach((d, i) => d.classList.toggle('on', p >= [T.actuar[0], T.navegar[0], T.forma[0]][i]));
                if (sigue) pedir();
            };
            const pedir = () => { if (!bucle) bucle = requestAnimationFrame(pintar); };
            window.addEventListener('resize', () => { medir(); pedir(); });
            /* La pista suma la pantalla en que sube la 11: todo termina antes de ella */
            const hasta = +el.dataset.pasosHasta || 1;
            return q => { avance = fijar(q / hasta); pedir(); };
        },

        /* La retícula: llega en la ventana de la 10 con el PDF del manual abierto (llego.css 9.3.2). De su portada
           (1920 × 1080) a un cruce de sus líneas y, en ese mismo punto de la pantalla, al cruce de la web, con la barra de
           vuelta en llegofarma.cl. Al alejarse se encienden las líneas reales del sitio, se miden sus cuatro columnas, las fotos ocupan
           módulos y la cámara termina en un título, la única excepción (llego.css 9.3). Medido en el PDF: 7,6 px; en la web, 8 */
        reticula: el => {
            const esc = el.querySelector('.lf-rt-esc'), velo = el.querySelector('.lf-ac-velo'), hueco = velo.firstElementChild, cajas = [...el.querySelectorAll('.lf-ac-caja')];
            const med = el.querySelector('.lf-rt-med'), bandas = el.querySelector('.lf-rt-bandas'), datos = [...el.querySelectorAll('[data-rt-dato]')];
            const CRUCE = { x: 654.5, y: 358.7 }, CAMPO = 218, W = 1440;
            /* Sin tramos quietos: el PDF ya se abrió mientras subía la 11, así que la cámara entra apenas queda fija */
            const T = { entra: [0.03, 0.17], mide: [0.15, 0.18], cambia: [0.21, 0.26], aleja: [0.29, 0.41], lineas: [0.3, 0.4], columnas: [0.41, 0.47], llega: [0.49, 0.54], sale: [0.53, 0.56], modulos: [0.56, 0.71], titulo: [0.74, 0.83], marca: [0.83, 0.87] };
            const lineal = (p, a, b) => fijar((p - a) / (b - a));
            const mezcla = (a, b, t) => a + (b - a) * t;
            /* Zoom natural entre dos vistas: la escala avanza en proporción y todo gira en torno a un punto fijo */
            const zoom = (a, b, t) => {
                const rel = b.e / a.e, r = Math.pow(rel, t);
                if (Math.abs(rel - 1) < 0.001) return { e: a.e, x: mezcla(a.x, b.x, t), y: mezcla(a.y, b.y, t) };
                const fx = (b.x - a.x * rel) / (1 - rel), fy = (b.y - a.y * rel) / (1 - rel);
                return { e: a.e * r, x: fx + (a.x - fx) * r, y: fy + (a.y - fy) * r };
            };
            let marco = null, win = null, doc = null, avance = 0, suave = 0, bucle = 0, A = 818, B = 900, H = 1584, sy = -1, contenido = [], opacidad = '';
            const medir = () => {
                A = esc.clientWidth; B = esc.clientHeight; H = Math.round(B / (A / W));
                if (marco) { marco.style.setProperty('--lf-iw', W + 'px'); marco.style.setProperty('--lf-ih', H + 'px'); }
                sy = -1;
            };
            sitioEnEscena(el, esc, (m, w, d) => { win = w; doc = d; medir(); pedir(); setTimeout(() => { sy = -1; pedir(); }, 500); }, { alMontar: m => { marco = m; medir(); } });
            const pedir = () => { if (!bucle) bucle = requestAnimationFrame(pintar); };

            const pintarSitio = p => {
                const sec = doc.querySelector('.s-quees'), filas = doc.querySelectorAll('.s-quees .fila');
                if (!sec || filas.length < 4) return;
                /* El sitio queda quieto en la sección; solo se mueve la cámara */
                if (sy < 0) {
                    opacidad = '';
                    sy = Math.max(sec.getBoundingClientRect().top + win.scrollY, 0); win.scrollTo({ top: sy, behavior: 'instant' });
                    /* La cabecera, el indicador y la sección siguiente no son el tema: acá manda la retícula */
                    [...doc.querySelectorAll('header, .recorrido'), sec.nextElementSibling].forEach(n => { n.style.visibility = 'hidden'; });
                    contenido = [...doc.querySelectorAll('.s-quees .fila > *')];
                }
                const f = filas[2].getBoundingClientRect(), borde = Math.max(48, (f.width - 1440) / 2 + 48), col = (f.width - 2 * borde) / 4;
                const cx = borde + col * 3 + 0.5, cy = f.top + 0.5;
                const eZ = A / CAMPO, lejos = { e: A / W, x: 0, y: 0 };
                const cerca = { e: eZ, x: A / 2 - cx * eZ, y: B / 2 - cy * eZ };
                /* Primero solo las líneas; el contenido llega a ocupar la retícula después de medirla */
                const o = lineal(p, T.llega[0], T.llega[1]).toFixed(3);
                if (o !== opacidad) { opacidad = o; contenido.forEach(n => { n.style.opacity = o; }); }
                const lin = doc.querySelector('.s-quees h2 .linea'), fuerte = lin.querySelector('strong');
                /* El título se mide por su texto, no por su caja, que ocupa todo el ancho. La cámara encuadra las tres líneas
                   completas; las cajas marcan solo la primera */
                const rango = doc.createRange(); rango.selectNodeContents(lin);
                const tr = rango.getBoundingClientRect();
                rango.selectNodeContents(lin.parentElement);
                const tt = rango.getBoundingClientRect(), eT = Math.min(A * 0.92 / tt.width, B * 0.6 / tt.height, 1.1);
                const titulo = { e: eT, x: (A - tt.width * eT) / 2 - tt.left * eT, y: B / 2 - (tt.top + tt.height / 2) * eT };
                const t2 = tramo(p, T.titulo[0], T.titulo[1]);
                const c = t2 > 0 ? zoom(lejos, titulo, t2) : zoom(cerca, lejos, tramo(p, T.aleja[0], T.aleja[1]));
                marco.style.setProperty('--lf-ie', c.e.toFixed(4)); marco.style.setProperty('--lf-ix', c.x.toFixed(1) + 'px'); marco.style.setProperty('--lf-iy', c.y.toFixed(1) + 'px');
                /* Las líneas de verdad del sitio se encienden */
                const alfa = mezcla(0.18, 0.95, Math.min(lineal(p, T.lineas[0], T.lineas[1]), 1 - lineal(p, T.sale[0], T.sale[1])));
                sec.style.setProperty('--linea', `rgba(16, 78, 86, ${alfa.toFixed(3)})`);
                fase(bandas, '--lf-bv', lineal(p, T.columnas[0], T.columnas[1]));
                fase(bandas, '--lf-bo', 1 - lineal(p, T.llega[0], T.llega[1]));
                bandas.style.setProperty('--lf-bx', ((borde * c.e) + c.x).toFixed(1) + 'px'); bandas.style.setProperty('--lf-bw', (col * c.e).toFixed(1) + 'px');
                const medida = (n, m = 0) => { const r = n.getBoundingClientRect(); return { x: (r.left - m) * c.e + c.x, y: (r.top - m) * c.e + c.y, w: (r.width + m * 2) * c.e, h: (r.height + m * 2) * c.e }; };
                let huecos = [];
                if (p < T.titulo[0]) {
                    const piezas = ['.b-a', '.b-b', '.b-c', '.b-d'].map(s => doc.querySelector('.s-quees ' + s)), n = piezas.length, [a, b] = T.modulos, largo = (b - a) / n;
                    huecos = piezas.map((pz, i) => ({ r: medida(pz), g: lineal(p, a + i * largo, a + (i + 0.55) * largo), txt: ['2 columnas, 2 filas', '2 columnas', '1 columna', '1 columna'][i] }));
                    fase(velo, '--lf-av', Math.min(lineal(p, T.sale[0], T.sale[1]), 1 - lineal(p, T.modulos[1], T.titulo[0])));
                } else {
                    const g = lineal(p, T.marca[0], T.marca[1]), rf = medida(fuerte), fin = (tr.right * c.e + c.x);
                    const y = rf.y - 6, h = rf.h + 12, luz = rf.x + rf.w + 10;
                    huecos = [{ r: { x: rf.x - 6, y, w: rf.w + 12, h }, g, txt: 'Medium' }, { r: { x: luz, y, w: fin + 6 - luz, h }, g, txt: 'Light' }];
                    fase(velo, '--lf-av', g);
                }
                huecos.forEach((u, i) => marcarCaja(cajas[i], u.r, u.g, u.txt, A));
                cajas.slice(huecos.length).forEach(x => x.classList.remove('on'));
                hueco.setAttribute('d', trazoRect({ x: 0, y: 0, w: A, h: B }) + huecos.filter(u => u.g > 0).map(u => trazoRect({ x: u.r.x, y: u.r.y, w: u.r.w * u.g, h: u.r.h })).join(''));
            };
            const pintar = () => {
                bucle = 0;
                const d = avance - suave;
                suave = quieto || Math.abs(d) < 0.0002 ? avance : suave + d * 0.18;
                const p = suave;
                /* El impreso: de la portada completa, como una hoja sobre la mesa, al cruce */
                const m0 = A * 0.84 / 1920, mZ = A / CAMPO;
                const v = zoom({ e: m0, x: (A - 1920 * m0) / 2, y: (B - 1080 * m0) / 2 }, { e: mZ, x: A / 2 - CRUCE.x * mZ, y: B / 2 - CRUCE.y * mZ }, tramo(p, T.entra[0], T.entra[1]));
                esc.style.setProperty('--lf-m', v.e.toFixed(4)); esc.style.setProperty('--lf-mx', v.x.toFixed(1) + 'px'); esc.style.setProperty('--lf-my', v.y.toFixed(1) + 'px');
                const cambio = lineal(p, T.cambia[0], T.cambia[1]);
                fase(esc, '--lf-mo', 1 - cambio);
                /* La barra del visor se va al empezar a entrar; la de la dirección vuelve a llegofarma.cl con el cruce web */
                fase(esc, '--lf-po', 1 - lineal(p, T.entra[0], T.entra[0] + 0.04));
                fase(el, '--lf-ro', cambio);
                fase(esc, '--lf-co', lineal(p, T.entra[0] + 0.07, T.entra[1]));
                /* La medida del corte, en los dos soportes */
                const sale = 1 - lineal(p, T.aleja[0], T.aleja[0] + 0.02);
                med.classList.toggle('on', p >= T.mide[0] && sale > 0);
                med.style.setProperty('--lf-rh', (mezcla(7.6, 8, cambio > 0.5 ? 1 : 0) * mZ).toFixed(1) + 'px');
                const txt = cambio > 0.5 ? 'En la web: 8 px' : 'En el manual: 7,6 px';
                if (med.firstElementChild.textContent !== txt) med.firstElementChild.textContent = txt;
                datos.forEach((n, i) => n.classList.toggle('on', p >= [T.mide[0], T.columnas[0], T.marca[0]][i]));
                if (doc && doc.body) pintarSitio(p);
                if (suave !== avance) pedir();
            };
            window.addEventListener('resize', () => { medir(); pedir(); });
            medir();
            return p => { avance = p; pedir(); };
        },

        /* Texto: el Word del cliente con control de cambios. La hoja ya subió con la 12; el scroll aplica los cambios del
           hero uno por uno, cada uno con su globo y su fila del registro (data-tx dice cuándo). El rollo pasa a Propuesta de
           valor, se marcan las dos frases del propio texto y con ellas se escribe el titular nuevo. Al final la barra vuelve
           a llegofarma.cl, el Word se va y queda la sección publicada con su titular marcado. La ficha acompaña: los 56 al
           empezar, los 23 textos nuevos con el titular y el cero con la marca final */
        texto: el => {
            const pant = el.querySelector('.lf-tx-pant'), rollo = el.querySelector('.lf-tx-rollo'), hojas = [...el.querySelectorAll('.lf-tx-hoja')];
            const cambios = [...el.querySelectorAll('[data-tx]')].map(n => ({ n, en: +n.dataset.tx, on: null }));
            const velo = el.querySelector('.lf-ac-velo'), hueco = velo.firstElementChild, caja = el.querySelector('.lf-ac-caja'), datos = [...el.querySelectorAll('[data-tx-dato]')];
            const T = { pasa: [0.38, 0.46], arma: [0.6, 0.68], vuelve: [0.74, 0.8], marca: [0.81, 0.86] };
            const W = 1440, PAD = 10;
            const lineal = (p, a, b) => fijar((p - a) / (b - a));
            let marco = null, win = null, doc = null, avance = 0, suave = 0, bucle = 0, A = 744, B = 595, H = 1152, armado = false, salto = 0;
            const medir = () => {
                A = pant.clientWidth; B = pant.clientHeight; H = Math.round(B / (A / W));
                const angosto = A < 500, ancho = angosto ? 480 : 760;
                pant.classList.toggle('angosto', angosto);
                pant.style.setProperty('--lf-tl', ancho + 'px'); fase(pant, '--lf-te', A / ancho);
                /* El rollo sube lo justo para dejar la segunda hoja donde estaba la primera */
                salto = hojas[1].offsetTop - hojas[0].offsetTop;
                if (marco) { marco.style.setProperty('--lf-iw', W + 'px'); marco.style.setProperty('--lf-ih', H + 'px'); }
                armado = false;
            };
            const pedir = () => { if (!bucle) bucle = requestAnimationFrame(pintar); };
            sitioEnEscena(el, pant, (m, w, d) => { win = w; doc = d; medir(); pedir(); setTimeout(() => { armado = false; pedir(); }, 500); }, { alMontar: m => { marco = m; medir(); } });

            /* --- El sitio quieto en Propuesta de valor, a lo ancho de la ventana --- */
            const pintarSitio = p => {
                const sec = doc.querySelector('.s-valor'), tit = sec && sec.querySelector('h2');
                if (!tit) return;
                if (!armado) {
                    win.scrollTo({ top: Math.max(sec.getBoundingClientRect().top + win.scrollY, 0), behavior: 'instant' });
                    [...doc.querySelectorAll('header, .recorrido'), sec.previousElementSibling].forEach(n => { if (n) n.style.visibility = 'hidden'; });
                    armado = true;
                }
                const e = A / W;
                marco.style.setProperty('--lf-ie', e.toFixed(4)); marco.style.setProperty('--lf-ix', '0px'); marco.style.setProperty('--lf-iy', '0px');
                /* El titular se mide por su texto, no por su caja */
                const rango = doc.createRange(); rango.selectNodeContents(tit);
                const t = rango.getBoundingClientRect(), g = lineal(p, T.marca[0], T.marca[1]);
                const r = { x: (t.left - PAD) * e, y: (t.top - PAD) * e, w: (t.width + PAD * 2) * e, h: (t.height + PAD * 2) * e };
                marcarCaja(caja, r, g, '10 · Nuevo, con palabras del cliente', A);
                fase(velo, '--lf-av', g);
                hueco.setAttribute('d', trazoRect({ x: 0, y: 0, w: A, h: B }) + (g > 0 ? trazoRect({ x: r.x, y: r.y, w: r.w * g, h: r.h }) : ''));
            };
            const pintar = () => {
                bucle = 0;
                const d = avance - suave;
                suave = quieto || Math.abs(d) < 0.0002 ? avance : suave + d * 0.18;
                const p = suave;
                /* Los cambios se aplican en su punto, de una vez, como en el Word; el estado sigue al scroll en las dos direcciones */
                cambios.forEach(c => { const on = p >= c.en; if (on !== c.on) { c.on = on; c.n.classList.toggle('on', on); } });
                rollo.style.setProperty('--lf-ty', (-salto * tramo(p, T.pasa[0], T.pasa[1])).toFixed(1) + 'px');
                fase(el, '--lf-tw', lineal(p, T.arma[0], T.arma[1]));
                fase(el, '--lf-ro', lineal(p, T.vuelve[0], T.vuelve[1]));
                datos.forEach((n, i) => n.classList.toggle('on', p >= [0.06, T.arma[0], T.marca[0]][i]));
                if (doc && doc.body && marco) pintarSitio(p);
                if (suave !== avance) pedir();
            };
            window.addEventListener('resize', () => { medir(); pedir(); });
            (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { medir(); pedir(); });
            medir();
            return p => { avance = p; pedir(); };
        },

        /* Entrega: la carpeta que se le entregó a Llegó, en dos columnas, lo que estaba conmigo y lo que está en sus cuentas.
           El panel ya subió con la 14; el scroll hace entrar los archivos uno a uno (data-en), el formulario cruza, la
           carpeta se recoge en una tarjeta y cruza también, y con ella aparece la guía, que marca sus cuatro pasos. Al final
           la barra vuelve a llegofarma.cl, el panel se recoge y queda el sitio en su dominio, marcado. La ficha acompaña:
           los archivos con la carpeta, los pasos con la guía y el cero con la marca final. Si la pista suma la pantalla de
           la cita (data-pasos-hasta), todo termina antes de ella */
        entrega: el => {
            const pant = el.querySelector('.lf-en-pant'), lienzo = el.querySelector('.lf-en-lienzo'), carpeta = el.querySelector('.lf-en-carpeta'), guia = el.querySelector('.lf-en-guia');
            const pasos = [...el.querySelectorAll('[data-en]')].map(n => ({ n, en: +n.dataset.en, on: null }));
            const velo = el.querySelector('.lf-ac-velo'), hueco = velo.firstElementChild, caja = el.querySelector('.lf-ac-caja'), datos = [...el.querySelectorAll('[data-en-dato]')];
            const T = { forma: [0.3, 0.4], recoge: 0.46, carpeta: [0.48, 0.6], guia: [0.6, 0.64], vuelve: [0.82, 0.9], marca: [0.91, 0.97] };
            const hasta = +el.dataset.pasosHasta || 1, W = 1440, PAD = 12;
            const lineal = (p, a, b) => fijar((p - a) / (b - a));
            /* Cada tarjeta que cruza: sale de su lugar en mi columna y llega a su hueco en la de Llegó */
            const llaves = [...el.querySelectorAll('[data-en-va]')].map(n => ({ n, desde: el.querySelector(`[data-en-desde="${n.dataset.enVa}"]`), hasta: el.querySelector(`[data-en-hasta="${n.dataset.enVa}"]`) }));
            const [forma, carp] = llaves;
            let marco = null, win = null, doc = null, avance = 0, suave = 0, bucle = 0, A = 744, B = 595, H = 1152, armado = false;
            const medir = () => {
                A = pant.clientWidth; B = pant.clientHeight; H = Math.round(B / (A / W));
                const angosto = A < 500, ancho = angosto ? 480 : 760, e = A / ancho;
                pant.classList.toggle('angosto', angosto);
                pant.style.setProperty('--lf-tl', ancho + 'px'); pant.style.setProperty('--lf-th', (B / e).toFixed(1) + 'px'); fase(pant, '--lf-te', e);
                llaves.forEach(l => {
                    const s = l.n.style;
                    s.setProperty('--lf-w', l.hasta.offsetWidth + 'px');
                    s.setProperty('--lf-x0', l.desde.offsetLeft + 'px'); s.setProperty('--lf-y0', l.desde.offsetTop + 'px');
                    s.setProperty('--lf-x1', l.hasta.offsetLeft + 'px'); s.setProperty('--lf-y1', l.hasta.offsetTop + 'px');
                });
                if (marco) { marco.style.setProperty('--lf-iw', W + 'px'); marco.style.setProperty('--lf-ih', H + 'px'); }
                armado = false;
            };
            const pedir = () => { if (!bucle) bucle = requestAnimationFrame(pintar); };
            sitioEnEscena(el, pant, (m, w, d) => { win = w; doc = d; medir(); pedir(); setTimeout(() => { armado = false; pedir(); }, 500); }, { alMontar: m => { marco = m; medir(); } });

            /* --- El sitio en su dominio: el hero, a lo ancho de la ventana, con el titular marcado --- */
            const pintarSitio = p => {
                const tit = doc.querySelector('.s-hero h1');
                if (!tit) return;
                if (!armado) { win.scrollTo({ top: 0, behavior: 'instant' }); armado = true; }
                const e = A / W;
                marco.style.setProperty('--lf-ie', e.toFixed(4)); marco.style.setProperty('--lf-ix', '0px'); marco.style.setProperty('--lf-iy', '0px');
                const rango = doc.createRange(); rango.selectNodeContents(tit);
                const t = rango.getBoundingClientRect(), g = lineal(p, T.marca[0], T.marca[1]);
                const r = { x: (t.left - PAD) * e, y: (t.top - PAD) * e, w: (t.width + PAD * 2) * e, h: (t.height + PAD * 2) * e };
                marcarCaja(caja, r, g, 'En su dominio y en sus cuentas', A);
                fase(velo, '--lf-av', g);
                hueco.setAttribute('d', trazoRect({ x: 0, y: 0, w: A, h: B }) + (g > 0 ? trazoRect({ x: r.x, y: r.y, w: r.w * g, h: r.h }) : ''));
            };
            const pintar = () => {
                bucle = 0;
                const d = avance - suave;
                suave = quieto || Math.abs(d) < 0.0002 ? avance : suave + d * 0.18;
                const p = suave;
                pasos.forEach(c => { const on = p >= c.en; if (on !== c.on) { c.on = on; c.n.classList.toggle('on', on); } });
                /* El formulario está en mi columna desde el principio; la carpeta se recoge en su tarjeta antes de cruzar */
                forma.n.classList.add('on');
                fase(forma.n, '--lf-k', curva(lineal(p, T.forma[0], T.forma[1])));
                const recogida = p >= T.recoge;
                carpeta.classList.toggle('ida', recogida); carp.n.classList.toggle('on', recogida);
                fase(carp.n, '--lf-k', curva(lineal(p, T.carpeta[0], T.carpeta[1])));
                fase(guia, '--lf-go', lineal(p, T.guia[0], T.guia[1]));
                fase(el, '--lf-ro', lineal(p, T.vuelve[0], T.vuelve[1]));
                datos.forEach((n, i) => n.classList.toggle('on', p >= [0.23, 0.76, T.marca[0]][i]));
                if (doc && doc.body && marco) pintarSitio(p);
                if (suave !== avance) pedir();
            };
            window.addEventListener('resize', () => { medir(); pedir(); });
            (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { medir(); pedir(); });
            medir();
            return p => { avance = fijar(p / hasta); pedir(); };
        },

        /* Feria: el cierre del capítulo, en un calendario de octubre y noviembre. Al subir solo está el 1 de octubre; el
           scroll llena los días de trabajo hasta el 20, con sus hitos, y después cuenta en punteado los 14 de margen hasta
           que la feria se enciende con el QR de la 08. El rótulo lleva la cuenta y la ficha se enciende con cada tramo. Los
           días se encienden enteros, sin suavizado: un calendario no se llena a medias. Si la pista suma la pantalla de la
           cita (data-pasos-hasta), todo termina antes de ella */
        feria: el => {
            const cal = el.querySelector('.lf-fe-cal'), n = el.querySelector('[data-fe-n]'), que = el.querySelector('[data-fe-que]'), feria = el.querySelector('.lf-fe-feria');
            const trabajo = [...el.querySelectorAll('[data-fe-t]')], margen = [...el.querySelectorAll('[data-fe-m]')], datos = [...el.querySelectorAll('[data-fe-dato]')];
            const T = { trabajo: [0.04, 0.5], margen: [0.56, 0.84], feria: 0.88 };
            const HITOS = ['1 oct · Pidieron la web', , , , , , , , '9 oct · Contenido final', , , , , '14 oct · Entrega', , '16 oct · Carpeta entregada', , , , '20 oct · En línea en llegofarma.cl'];
            const hasta = +el.dataset.pasosHasta || 1;
            const cuantos = (p, [a, b], total) => Math.floor(fijar((p - a) / (b - a)) * total);
            let ultimo = '', hoy = null;
            const pintar = p => {
                const t = Math.max(1, cuantos(p, T.trabajo, trabajo.length)), m = t < trabajo.length ? 0 : cuantos(p, T.margen, margen.length), f = p >= T.feria;
                const clave = t + '|' + m + '|' + f;
                if (clave === ultimo) return;
                ultimo = clave;
                trabajo.forEach((c, i) => c.classList.toggle('on', i < t));
                margen.forEach((c, i) => c.classList.toggle('on', i < m));
                feria.classList.toggle('on', f);
                const nuevo = f ? null : m ? margen[m - 1] : trabajo[t - 1];
                if (hoy !== nuevo) { if (hoy) hoy.classList.remove('lf-fe-hoy'); if (nuevo) nuevo.classList.add('lf-fe-hoy'); hoy = nuevo; }
                /* El rótulo: los días desde el pedido, después los que faltan y al final el margen entero */
                const dias = k => k + (k === 1 ? ' día' : ' días');
                cal.classList.toggle('lf-fe-margen', t === trabajo.length && (m > 0 || f));
                if (f) { n.textContent = 'En línea 14 días antes'; que.textContent = '3 y 4 nov · Feria del sector'; }
                else if (m) { n.textContent = 'Faltan ' + dias(margen.length + 1 - m); que.textContent = 'Margen'; }
                else { n.textContent = dias(t - 1); que.textContent = HITOS.slice(0, t).filter(Boolean).pop(); }
                datos.forEach((d, i) => d.classList.toggle('on', [t === trabajo.length, f, f][i]));
            };
            return p => pintar(fijar(p / hasta));
        },

        /* Seguimiento: la sección Tecnología del sitio real. Primero entera, con la lista de seis capacidades y el panel
           marcados uno después del otro; la lista se apaga mientras la cámara se acerca al panel y el scroll lleva un pedido
           por las seis etapas, más lentas las dos primeras. Cada etapa se activa como en el sitio (el mismo evento que el
           cursor), su marca lleva el nombre de la capacidad, el tramo hasta la siguiente se llena al ritmo del scroll y la
           línea nueva del registro se enciende. Al cerrar, la cámara se aleja hasta el panel entero y marca su peso. La
           ficha se enciende con el relato: las fotos al verse la sección, las etapas con la sexta y el peso con su marca.
           En lo angosto no hay vista de lejos ni marca del contador: no se leerían y la cámara parte en el panel */
        seguimiento: el => {
            const pant = el.querySelector('.lf-sg-pant'), velo = el.querySelector('.lf-ac-velo'), hueco = velo.firstElementChild;
            const cajas = [...el.querySelectorAll('.lf-ac-caja')], datos = [...el.querySelectorAll('[data-sg-dato]')], brillo = el.querySelector('.lf-sg-brillo');
            const T = { lista: [0.02, 0.05], pedido: [0.08, 0.11], acerca: [0.17, 0.27], etapas: [0.29, 0.84], registro: [0.85, 0.88], aleja: [0.89, 0.95], peso: [0.93, 0.96] };
            /* Ritmo que acelera: el peso de cada etapa en su tramo */
            const PESOS = [1.5, 1.4, 1, 1, 1, 1], SUMA = PESOS.reduce((a, b) => a + b, 0);
            const CORTES = PESOS.map((_, i) => PESOS.slice(0, i).reduce((a, b) => a + b, 0) / SUMA);
            const W = 1440, PAD = 10, AIRE = 14, hasta = +el.dataset.pasosHasta || 1;
            const lineal = (p, a, b) => fijar((p - a) / (b - a));
            const mezcla = (a, b, t) => a + (b - a) * t;
            /* Zoom natural, como en la retícula: la escala avanza en proporción y todo gira en torno a un punto fijo */
            const zoom = (a, b, t) => {
                const rel = b.e / a.e, k = Math.pow(rel, t);
                if (Math.abs(rel - 1) < 0.001) return { e: a.e, x: mezcla(a.x, b.x, t), y: mezcla(a.y, b.y, t) };
                const fx = (b.x - a.x * rel) / (1 - rel), fy = (b.y - a.y * rel) / (1 - rel);
                return { e: a.e * k, x: fx + (a.x - fx) * k, y: fy + (a.y - fy) * k };
            };
            let marco = null, win = null, doc = null, avance = 0, suave = 0, bucle = 0, A = 744, B = 595, H = 1152, armado = false, ultimaEtapa = -1;
            const medir = () => {
                A = pant.clientWidth; B = pant.clientHeight; H = Math.round(B / (A / W));
                if (marco) { marco.style.setProperty('--lf-iw', W + 'px'); marco.style.setProperty('--lf-ih', H + 'px'); }
                armado = false;
            };
            const pedir = () => { if (!bucle) bucle = requestAnimationFrame(pintar); };
            sitioEnEscena(el, pant, (m, w, d) => { win = w; doc = d; medir(); pedir(); setTimeout(() => { armado = false; pedir(); }, 500); }, { alMontar: m => { marco = m; medir(); } });

            /* --- El sitio quieto en la sección: solo se mueve la cámara --- */
            const armar = sec => {
                win.scrollTo({ top: Math.max(sec.getBoundingClientRect().top + win.scrollY, 0), behavior: 'instant' });
                /* La cabecera, el indicador y las secciones vecinas no son el tema */
                [...doc.querySelectorAll('header, .recorrido'), sec.previousElementSibling, sec.nextElementSibling].forEach(n => { if (n) n.style.visibility = 'hidden'; });
                /* Si el sitio cambia de etapa por su cuenta, se vuelve a pintar la del relato */
                const ruta = sec.querySelector('.ruta');
                if (ruta && !ruta.dataset.vigilada) { ruta.dataset.vigilada = '1'; new win.MutationObserver(pedir).observe(ruta, { attributes: true, attributeFilter: ['data-paso'] }); }
                /* Los tramos los llena el scroll, no la transición del sitio */
                sec.querySelectorAll('.llenado').forEach(l => { l.style.transition = 'none'; });
                armado = true;
            };
            /* Una vista que encuadra un rectángulo del sitio con un margen */
            const encuadre = (r, m) => { const e = Math.min(A * m / r.width, B * m / r.height); return { e, x: A / 2 - (r.left + r.width / 2) * e, y: B / 2 - (r.top + r.height / 2) * e }; };
            const pintar = () => {
                bucle = 0;
                const d = avance - suave;
                suave = quieto || Math.abs(d) < 0.0002 ? avance : suave + d * 0.18;
                const p = suave, angosto = A < 500;
                const vista = angosto ? 0 : T.lista[0];
                datos.forEach((n, i) => n.classList.toggle('on', p >= [vista, T.etapas[0] + CORTES[5] * (T.etapas[1] - T.etapas[0]), T.peso[0]][i]));
                if (!doc || !doc.body) { if (suave !== avance) pedir(); return; }
                const sec = doc.querySelector('.s-tecno'), lista = doc.querySelector('.s-tecno .pasos'), ruta = doc.querySelector('.s-tecno .ruta');
                if (!sec || !lista || !ruta) return;
                if (!armado) armar(sec);
                const pasos = [...lista.querySelectorAll('.paso')], n = pasos.length;
                /* La etapa del pedido y cuánto avanzó dentro de ella; la primera ya está al acercarse */
                const u = lineal(p, T.etapas[0], T.etapas[1]);
                let k = 0;
                while (k < n - 1 && u >= CORTES[k + 1]) k++;
                const dentro = fijar((u - CORTES[k]) / ((CORTES[k + 1] || 1) - CORTES[k]));
                /* El sitio también activa etapas con su propio observador al moverse: manda la del relato */
                if (ruta.dataset.paso !== String(k)) pasos[k].dispatchEvent(new win.MouseEvent('mouseenter'));
                /* El tramo hacia la siguiente etapa se llena en la segunda mitad de la etapa */
                ruta.querySelectorAll('.llenado').forEach(l => { const i = +l.dataset.i; l.style.transform = `scaleX(${(i < k ? 1 : i === k && u > 0 ? curva(fijar((dentro - 0.35) / 0.6)) : 0).toFixed(3)})`; });
                /* La lista y el título se apagan mientras la cámara se acerca: no dejan una franja al costado ni asoman
                   sobre el panel cuando la cámara se aleja al cerrar */
                const apaga = angosto ? '0' : (1 - lineal(p, T.acerca[0], T.acerca[0] + 0.05)).toFixed(3);
                [lista, ...sec.querySelectorAll('.franja, .arriba')].forEach(n => { n.style.opacity = apaga; });
                /* Cámara: la sección entera, el panel y, al cerrar, el panel con aire */
                const rs = sec.getBoundingClientRect(), rr = ruta.getBoundingClientRect();
                const cerca = encuadre(rr, 0.9), lejos = angosto ? cerca : encuadre({ left: rs.left, top: rs.top, width: rs.width, height: Math.min(rs.height, rs.width * B / A) }, 0.98);
                const c = p < T.aleja[0] ? zoom(lejos, cerca, tramo(p, T.acerca[0], T.acerca[1])) : zoom(cerca, encuadre(rr, 0.78), tramo(p, T.aleja[0], T.aleja[1]));
                marco.style.setProperty('--lf-ie', c.e.toFixed(4)); marco.style.setProperty('--lf-ix', c.x.toFixed(1) + 'px'); marco.style.setProperty('--lf-iy', c.y.toFixed(1) + 'px');
                const medida = (nodo, m = PAD) => { const r = nodo.getBoundingClientRect(); return { x: (r.left - m) * c.e + c.x, y: (r.top - m) * c.e + c.y, w: (r.width + m * 2) * c.e, h: (r.height + m * 2) * c.e }; };
                /* Marcas: de lejos, primero las seis capacidades y después el pedido, con aire; de cerca, la etapa con el
                   nombre de su capacidad, el contador que avanza con el scroll y, al cerrar, el registro y el peso del panel */
                const sale = angosto ? 0 : 1 - lineal(p, T.acerca[0], T.acerca[0] + 0.03);
                const gLista = Math.min(lineal(p, T.lista[0], T.lista[1]), sale), gPedido = Math.min(lineal(p, T.pedido[0], T.pedido[1]), sale);
                let huecos;
                if (p < T.acerca[0] + 0.03) {
                    huecos = [{ r: medida(lista, AIRE), g: gLista, txt: '6 capacidades' }, { r: medida(ruta, AIRE), g: gPedido, txt: 'Un pedido' }, { g: 0 }];
                } else {
                    const hito = ruta.querySelector(`.hito[data-i="${k}"] .disco`), nombre = pasos[k].querySelector('h3'), cont = ruta.querySelector('.estado');
                    const g = lineal(p, T.etapas[0] - 0.02, T.etapas[0]) * (1 - lineal(p, T.registro[0], T.registro[0] + 0.01));
                    const reg = ruta.querySelector('.registro');
                    const gReg = lineal(p, T.registro[0], T.registro[1]) * (1 - lineal(p, T.aleja[0], T.aleja[0] + 0.01));
                    huecos = [{ r: hito && medida(hito, 8), g, txt: `${pad(k + 1)} · ${nombre ? nombre.textContent : ''}` },
                        gReg > 0 || p < T.aleja[0] ? { r: reg && medida(reg, 8), g: gReg, txt: 'Registro completo' } : { r: medida(ruta, 6), g: lineal(p, T.peso[0], T.peso[1]), txt: 'Todo el panel · 5,8 KB' },
                        { r: cont && medida(cont, 6), g: angosto ? 0 : g * (1 - lineal(p, T.etapas[0] + CORTES[2] * (T.etapas[1] - T.etapas[0]), T.etapas[0] + CORTES[2] * (T.etapas[1] - T.etapas[0]) + 0.01)), txt: 'Avanza con el scroll' }];
                }
                /* De lejos las marcas no crecen: entran enteras, así ninguna línea cruza el contenido */
                huecos.forEach((h, i) => marcarCaja(cajas[i], h.r, h.g > 0.5 ? 1 : 0, h.txt, A));
                /* La línea nueva del registro se enciende al escribirse */
                const linea = p >= T.etapas[0] && p < T.registro[0] && ruta.querySelector(`.registro text[data-i="${k}"]`);
                if (linea) {
                    const r = medida(linea, 4);
                    brillo.style.setProperty('--lf-cx', r.x.toFixed(1) + 'px'); brillo.style.setProperty('--lf-cy', r.y.toFixed(1) + 'px');
                    brillo.style.setProperty('--lf-cw', r.w.toFixed(1) + 'px'); brillo.style.setProperty('--lf-ch', r.h.toFixed(1) + 'px');
                }
                if (linea && k !== ultimaEtapa) { brillo.classList.remove('on'); void brillo.offsetWidth; brillo.classList.add('on'); }
                if (!linea) brillo.classList.remove('on');
                ultimaEtapa = linea ? k : -1;
                const vela = Math.max(gLista, gPedido);
                fase(velo, '--lf-av', vela);
                hueco.setAttribute('d', trazoRect({ x: 0, y: 0, w: A, h: B }) + (vela > 0 ? huecos.filter(h => h.r && h.g > 0.5).map(h => trazoRect(h.r)).join('') : ''));
                if (suave !== avance) pedir();
            };
            window.addEventListener('resize', () => { medir(); pedir(); });
            medir();
            /* La última pantalla de la pista es la de la cita, que sube sobre la 13 quieta */
            return p => { avance = fijar(p / hasta); pedir(); };
        },

        /* Cita: la retícula del manual impresa en la hoja que sube. Cuatro módulos en escritorio y dos en celular, en los
           bordes de la grilla del caso; cada línea se corta 8 px antes de cruzarse con otra y 8 px antes de la tinta del
           texto, medida con las métricas reales de Manrope en un canvas. Con el paso, el avance se reparte: la comilla se
           entinta marca por marca, cada corte se abre justo antes de su línea, "súper" llega sola tras una pausa, la caja
           de la 13 marca "súper enriquecido" y la línea de la ficha trae sus celdas al pasar por cada módulo (llego.css 12) */
        cita: el => {
            const fijo = el.querySelector('.cs-fijo'), ret = el.querySelector('.lf-ret'), comilla = el.querySelector('.lf-comilla');
            const cita = el.querySelector('.lf-cita-txt'), cuerpo = el.querySelector('.lf-cita-cuerpo'), etq = el.querySelector('.lf-cita-etq');
            const lineas = [...el.querySelectorAll('.lf-cita-txt p > span')], tarde = el.querySelector('.lf-cita-tarde');
            const marcas = [...el.querySelectorAll('.lf-cita-em')], ficha = el.querySelector('.lf-ficha'), celdas = [...ficha.children];
            const html = document.documentElement, movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
            const CORTE = 8, INICIOS = [0.12, 0.2, 0.28, 0.54], lienzo = document.createElement('canvas').getContext('2d');
            const caja = n => { let x = 0, y = 0, e = n; while (e && e !== fijo) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: n.offsetWidth, h: n.offsetHeight }; };
            const fuente = n => { const c = getComputedStyle(n); return `${c.fontWeight} ${c.fontSize} ${c.fontFamily}`; };
            const px = (n, k, v) => n.style.setProperty(k, v.toFixed(1) + 'px');
            let G = null, ultimo = '', ultP = 0;

            /* --- Medidas: módulos, horizontales, tinta de cada línea y la comilla --- */
            const medir = () => {
                const W = fijo.clientWidth, H = fijo.clientHeight, cs = getComputedStyle(fijo), gap = parseFloat(cs.columnGap) || 24, dos = movil.matches;
                const fc = celdas.map(caja), f = caja(ficha), arriba = caja(cita).y + parseFloat(getComputedStyle(cita).paddingTop);
                const xs = [parseFloat(cs.paddingLeft), ...(dos ? [fc[1].x] : fc.slice(1).map(c => c.x)).map(x => x - gap), W - parseFloat(cs.paddingRight)];
                const ys = [arriba, f.y, f.y + f.h, ...(dos ? [fc[2].y] : [])];
                const p = lineas[0].parentNode;
                lienzo.font = fuente(p);
                let textos;
                if (!dos) {
                    /* Escritorio: cada línea es un span; su tinta, con el texto real. La caja del remate entra en la cuenta */
                    textos = lineas.map((s, i) => {
                        const c = caja(s), m = lienzo.measureText(s.textContent.trim()), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
                        const base = c.y + (c.h - (fa + fd)) / 2 + fa;
                        return { x0: c.x, x1: c.x + c.w, y0: base - m.actualBoundingBoxAscent, y1: base + m.actualBoundingBoxDescent, ini: INICIOS[i] };
                    });
                } else {
                    /* Celular: las líneas las arma el ancho; se leen del rango, con la tinta de las letras más altas y más bajas */
                    const r = document.createRange(), o = fijo.getBoundingClientRect(), ma = lienzo.measureText('ÁÉÍÓÚT'), md = lienzo.measureText('pqy,'), filas = new Map();
                    r.selectNodeContents(p);
                    [...r.getClientRects()].forEach(q => {
                        if (!q.width) return;
                        const k = Math.round(q.top), fila = filas.get(k) || { x0: Infinity, x1: -Infinity, top: q.top - o.top };
                        fila.x0 = Math.min(fila.x0, q.left - o.left); fila.x1 = Math.max(fila.x1, q.right - o.left); filas.set(k, fila);
                    });
                    textos = [...filas.values()].map(fila => ({ x0: fila.x0, x1: fila.x1, y0: fila.top + ma.fontBoundingBoxAscent - ma.actualBoundingBoxAscent, y1: fila.top + ma.fontBoundingBoxAscent + md.actualBoundingBoxDescent, ini: 0 }));
                }
                /* Las cajas del remate cortan como un texto más: abrazan de la tilde al descendente (llego.css 12.3) */
                const ca = lienzo.measureText('súper'), alto = ca.fontBoundingBoxAscent + ca.fontBoundingBoxDescent;
                marcas.forEach((n, i) => {
                    const b = caja(n), fs = parseFloat(getComputedStyle(n).fontSize), top = b.y + b.h / 2 - alto / 2 + 0.24 * fs;
                    textos.push({ x0: b.x, x1: b.x + b.w, y0: top, y1: top + 1.12 * fs, ini: dos ? 0 : [0.42, 0.54][i] });
                });
                const e = caja(etq);
                textos.push({ x0: e.x, x1: e.x + e.w, y0: e.y, y1: e.y + e.h, ini: 0.08 });
                /* La comilla, alineada por su tinta: a un medianil del borde, arriba con la primera línea (en celular, sobre la cita) */
                lienzo.font = fuente(comilla);
                const m = lienzo.measureText('“'), fs = parseFloat(getComputedStyle(comilla).fontSize), fa = m.fontBoundingBoxAscent, fd = m.fontBoundingBoxDescent;
                const X = xs[0] + gap, Y = dos ? caja(cuerpo).y : textos[0].y0;
                const qx = X + m.actualBoundingBoxLeft, qy = Y + m.actualBoundingBoxAscent - fa - (fs - fa - fd) / 2;
                px(comilla, '--lf-qx', qx); px(comilla, '--lf-qy', qy); px(comilla, '--lf-qt', Y - qy - 1);
                px(comilla, '--lf-qh', m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 2);
                px(comilla, '--lf-qm', X - qx + (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / 2);
                G = { W, H, xs, ys, yf: f.y, textos };
                ultimo = '';
            };

            /* --- La retícula: k abre el corte de cada texto desde su centro, dib cuánto de la línea de la ficha está dibujada --- */
            const dibujar = (ab, dib) => {
                const segs = [];
                G.xs.forEach(x => {
                    const huecos = G.ys.map(y => [y - CORTE, y + CORTE]);
                    G.textos.forEach((t, i) => {
                        if (x < t.x0 - CORTE || x > t.x1 + CORTE) return;
                        const c = (t.y0 + t.y1) / 2, m = ((t.y1 - t.y0) / 2 + CORTE) * ab[i];
                        huecos.push([c - m, c + m]);
                    });
                    restar(0, G.H, huecos).forEach(s => segs.push([x + 0.5, s[0], x + 0.5, s[1]]));
                });
                G.ys.forEach(y => restar(0, y === G.yf ? G.W * dib : G.W, G.xs.map(x => [x - CORTE, x + CORTE])).forEach(s => segs.push([s[0], y + 0.5, s[1], y + 0.5])));
                trazar(ret, segs);
            };

            /* --- Cada cuadro: sin el paso todo vale 1 --- */
            const pintar = p => {
                if (!G) return;
                const vivo = html.classList.contains('lf-paso') && !movil.matches, v = (a, b) => (vivo ? tramo(p, a, b) : 1);
                fase(comilla, '--lf-k1', v(0, 0.1)); fase(comilla, '--lf-k2', v(0.05, 0.15));
                fase(etq, '--e', v(0.08, 0.16));
                lineas.forEach((s, i) => fase(s, '--e', v(INICIOS[i], INICIOS[i] + 0.08)));
                fase(tarde, '--e', v(0.42, 0.5));
                fase(marcas[0], '--lf-w', v(0.48, 0.55)); fase(marcas[1], '--lf-w', v(0.6, 0.67));
                const dib = v(0.7, 0.86), xf = G.W * dib;
                celdas.forEach((c, i) => fase(c, '--e', vivo ? curva(fijar((xf - (G.xs[i] || 0) - 24) / 160)) : 1));
                const ab = G.textos.map(t => v(t.ini - 0.04, t.ini + 0.02)), clave = ab.map(k => k.toFixed(3)).join() + dib.toFixed(3);
                if (clave !== ultimo) { ultimo = clave; dibujar(ab, dib); }
            };
            const rehacer = () => { medir(); pintar(ultP); };
            window.addEventListener('resize', rehacer);
            (document.fonts ? document.fonts.ready : Promise.resolve()).then(rehacer);
            rehacer();
            return p => { ultP = p; pintar(p); };
        },

        /* Teléfono: llegofarma.cl real a 390 px de ancho, montado en reposo y bajando con el scroll de la página. En
           escritorio y con movimiento, antes lee el QR del stand y la mira se abre sobre el sitio (llego.css 9.2) */
        telefono: (el, h) => {
            const tel = el.querySelector('[data-tel]'), pant = tel.querySelector('.lf-tel-pant');
            let marco = null, win = null, e = 1, H = 844, y = 0, meta = 0, bucle = null, ultimoP = 0;
            const medir = () => {
                e = pant.clientWidth / 390; H = Math.round(pant.clientHeight / e);
                tel.style.setProperty('--e', e.toFixed(4));
                if (marco) marco.style.height = H + 'px';
            };
            const pintar = () => {
                bucle = null;
                if (!win) return;
                const d = meta - y;
                y = Math.abs(d) < 0.5 || quieto ? meta : y + d * 0.12;
                win.scrollTo({ top: y, behavior: 'instant' });
                if (y !== meta) bucle = requestAnimationFrame(pintar);
            };
            const ir = p => {
                ultimoP = p;
                if (!win) return;
                /* La nota acompaña a la barra real del sitio, que decide cuándo se ve */
                tel.classList.toggle('con-barra', !!win.document.querySelector('.barra-cta.visible'));
                const max = Math.max(win.document.documentElement.scrollHeight - H, 0);
                meta = fijar((p - 0.08) / 0.84) * max;
                if (!bucle) bucle = requestAnimationFrame(pintar);
            };
            const montar = () => {
                if (marco) return;
                marco = document.createElement('iframe');
                marco.title = 'llegofarma.cl en un teléfono'; marco.setAttribute('tabindex', '-1'); marco.setAttribute('aria-hidden', 'true');
                marco.onload = () => {
                    try { win = marco.contentWindow; win.document; } catch (err) { win = null; return; }
                    tel.classList.add('listo'); ir(ultimoP);
                };
                medir();
                marco.src = tel.dataset.tel;
                pant.insertBefore(marco, pant.querySelector('.lf-tel-isla'));
            };
            new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(montar); }), { rootMargin: '150% 0px' }).observe(el);
            window.addEventListener('resize', () => { medir(); ir(ultimoP); });
            const conQR = window.matchMedia('(min-width: 769px) and (prefers-reduced-motion: no-preference)');
            const hasta = +el.dataset.pasosHasta || 1, lineal = (v, a, b) => fijar((v - a) / (b - a));
            return q => {
                if (!conQR.matches) { ir(q); return; }
                const p = fijar(q / hasta);
                fase(el, '--lf-qe', tramo(p, 0.1, 0.32)); fase(el, '--lf-qs', tramo(p, 0.3, 0.4));
                fase(el, '--lf-ql', tramo(p, 0.4, 0.44)); fase(el, '--lf-qt', lineal(p, 0.45, 0.5));
                fase(el, '--lf-qv', tramo(p, 0.48, 0.58)); fase(el, '--lf-qf', lineal(p, 0.55, 0.65));
                ir(lineal(p, 0.58, 1));
            };
        }
    };

    /* --- 5. ENLACES A LOS CAPÍTULOS Y A LAS DECISIONES, Y FONDO DEL ESTIRÓN --- */
    document.querySelectorAll('.lf-etapas a, .lf-indice a, .lf-mapa-libre a, .lf-cierre-sigue').forEach(a => a.addEventListener('click', ev => {
        const destino = document.querySelector(a.getAttribute('href'));
        if (!destino) return;
        ev.preventDefault();
        /* Con el paso, la portada del capítulo 01 empieza bajo el resumen: data-ancla dice en qué parte de su pista ya está abierta */
        const f = document.documentElement.classList.contains('lf-paso') ? +destino.dataset.ancla || 0 : 0;
        /* Lo que sube sobre la anterior (las decisiones con filo y la portada del 02) ya está arriba cuando su borde llega
           al techo: basta llegar a su inicio */
        window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY + f * (destino.offsetHeight - window.innerHeight), behavior: quieto ? 'auto' : 'smooth' });
    }));
    /* Arriba el turquesa del hero, abajo el morado de Tap In: el estirón del scroll nunca muestra un color ajeno */
    let abajo = null;
    const fondo = () => { const b = window.scrollY > document.documentElement.scrollHeight / 2; if (b !== abajo) { abajo = b; document.documentElement.classList.toggle('lf-abajo', b); } };
    window.addEventListener('scroll', fondo, { passive: true }); fondo();

    /* --- 5.1 LA RETÍCULA DE LAS PORTADAS SE CORTA ANTES DEL CONTENIDO --- */
    /* En escritorio las líneas de las portadas bajan enteras; la que toparía con el título, el texto o el índice se corta
       8 px antes (--fin), y la que cruza la cifra grande se interrumpe 8 px antes y después de su tinta (--gt, --gb): de la
       cifra solo se ve el contorno. El contenido se mide sin transformaciones (offsetTop), así el paso que lo sube no
       mueve los cortes (llego.css 7.1); la tinta de la cifra, con las métricas reales de su fuente en un canvas */
    (() => {
        const caps = [...document.querySelectorAll('.lf-cap')];
        if (!caps.length) return;
        const CORTE = 8;
        const caja = (n, raiz) => { let x = 0, y = 0, e = n; while (e && e !== raiz) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: n.offsetWidth, h: n.offsetHeight }; };
        const lienzo = document.createElement('canvas').getContext('2d');
        /* La caja de tinta de la cifra, relativa al panel: el texto va anclado al final (derecha) y sobre el borde de abajo del svg */
        const tinta = (svg, raiz) => {
            const tx = svg && svg.querySelector(':scope > text');
            if (!tx || !lienzo) return null;
            const cs = getComputedStyle(tx), fs = parseFloat(cs.fontSize), r = svg.getBoundingClientRect(), p = raiz.getBoundingClientRect();
            lienzo.font = `${cs.fontWeight} ${fs}px ${cs.fontFamily}`;
            if ('letterSpacing' in lienzo) lienzo.letterSpacing = (fs * -0.07).toFixed(2) + 'px';
            lienzo.textAlign = 'right';
            const m = lienzo.measureText(tx.textContent), x = r.right - p.left, y = r.bottom - p.top;
            return { l: x - m.actualBoundingBoxLeft, r: x + m.actualBoundingBoxRight, t: y - m.actualBoundingBoxAscent, b: y + m.actualBoundingBoxDescent };
        };
        const cortar = () => caps.forEach(cap => {
            const raiz = cap.querySelector('.lf-cap-fijo'), ret = cap.querySelector('.lf-reticula');
            if (!raiz || !ret) return;
            const alto = raiz.offsetHeight;
            const bloques = [...cap.querySelectorAll('.cs-cap-txt h2, .cs-cap-txt p, .lf-indice, .cs-cap-n')].map(n => caja(n, raiz));
            const cifra = tinta(cap.querySelector('.lf-cap-traza'), raiz);
            ret.querySelectorAll('i').forEach(l => {
                const x = caja(l, raiz).x;
                const tope = Math.min(...bloques.filter(b => b.x - CORTE <= x && x <= b.x + b.w + CORTE).map(b => b.y), alto + CORTE);
                l.style.setProperty('--fin', Math.max(alto - (tope - CORTE), 0) + 'px');
                /* Solo la que atraviesa la tinta: la del borde, a 8 px de la cifra, sigue entera */
                const cruza = cifra && cifra.l < x && x < cifra.r;
                l.style.setProperty('--gt', (cruza ? Math.max(cifra.t - CORTE, 0) : 0).toFixed(1) + 'px');
                l.style.setProperty('--gb', (cruza ? cifra.b + CORTE : 0).toFixed(1) + 'px');
            });
        });
        window.addEventListener('resize', cortar);
        (document.fonts ? document.fonts.ready : Promise.resolve()).then(cortar);
        cortar();
    })();

    /* --- 5.2 LA RETÍCULA DEL RESULTADO: SIGUE LA DE LA CITA --- */
    /* Las verticales bajan desde el corte en los mismos bordes de módulo que la cita (los de sus celdas) y se cierran 8 px
       antes de la última horizontal, bajo los créditos. Cada fila suma su horizontal. Como en la cita, las líneas se cortan
       8 px antes de cada cruce y de cada texto que atraviesan (en celular, el sitio y los créditos van a lo ancho). Las filas
       se miden sin transformaciones (offsetTop), así la aparición de las cifras no mueve la retícula */
    (() => {
        const sec = document.querySelector('.lf-resultado');
        if (!sec) return;
        const ret = sec.querySelector('.lf-ret'), filas = [...sec.querySelectorAll('.lf-fin-fila')], celdas = [...sec.querySelectorAll('.lf-fin-cifras li')];
        const textos = [...sec.querySelectorAll('.lf-fin-fila > .mono, .lf-fin-vivo a, .lf-fin-creditos dt, .lf-fin-creditos dd')];
        const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)'), CORTE = 8;
        const caja = n => { let x = 0, y = 0, e = n; while (e && e !== sec) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x, y, w: n.offsetWidth, h: n.offsetHeight }; };
        const dibujar = () => {
            const W = sec.clientWidth, cs = getComputedStyle(sec), gap = parseFloat(getComputedStyle(filas[0]).columnGap) || 24, dos = movil.matches;
            const xs = [parseFloat(cs.paddingLeft), ...(dos ? [celdas[1]] : celdas.slice(1)).map(c => caja(c).x - gap), W - parseFloat(cs.paddingRight)];
            const ys = filas.map(f => caja(f).y), ultima = caja(filas[filas.length - 1]);
            ys.push(ultima.y + ultima.h);
            if (dos) ys.push(caja(celdas[2]).y);
            const fin = ultima.y + ultima.h;
            /* La tinta de cada texto, leída del rango: solo lo que corta una vertical */
            const o = sec.getBoundingClientRect(), r = document.createRange();
            const tintas = textos.flatMap(n => { r.selectNodeContents(n); return [...r.getClientRects()].filter(q => q.width).map(q => ({ x0: q.left - o.left, x1: q.right - o.left, y0: q.top - o.top, y1: q.bottom - o.top })); });
            const segs = [];
            xs.forEach(x => {
                const huecos = ys.map(y => [y - CORTE, y + CORTE]);
                tintas.forEach(t => { if (x >= t.x0 - CORTE && x <= t.x1 + CORTE) huecos.push([t.y0 - CORTE, t.y1 + CORTE]); });
                restar(0, fin, huecos).forEach(s => segs.push([x + 0.5, s[0], x + 0.5, s[1]]));
            });
            ys.forEach(y => restar(0, W, xs.map(x => [x - CORTE, x + CORTE])).forEach(s => segs.push([s[0], y + 0.5, s[1], y + 0.5])));
            trazar(ret, segs);
        };
        window.addEventListener('resize', dibujar);
        (document.fonts ? document.fonts.ready : Promise.resolve()).then(dibujar);
        dibujar();
    })();

    /* --- 6. PASO ENTRE DECISIONES: EL FILO --- */
    /* Con el paso (.lf-paso), mientras una decisión .lf-filo-sec sube su primera pantalla sobre la anterior quieta,
       --lf-filo dice cuánto subió (0 a 1) y .lf-filo-on deja su panel fijo para descubrirlo en su lugar (llego.css 8.1.6).
       Una sola lectura por cuadro y por sección */
    (() => {
        /* En el relevo (.lf-relevo) y en el fundido (.lf-funde) la anterior recibe --lf-sale y .lf-sale-on para que su decisión se vaya mientras llega la nueva.
           Bajo la hoja oscura (.lf-hoja) recibe --lf-sale y .lf-baja-on: sube entera y se oscurece (llego.css 12) */
        const secs = [...document.querySelectorAll('.lf-filo-sec')].map(el => ({ el, ultimo: -1, crece: el.querySelector('[data-crece]'), desde: el.dataset.desde && document.querySelector(el.dataset.desde),
            sale: (el.classList.contains('lf-relevo') || el.classList.contains('lf-funde') || el.classList.contains('lf-hoja')) && el.previousElementSibling && el.previousElementSibling.closest('section'),
            claseSale: el.classList.contains('lf-hoja') ? 'lf-baja-on' : 'lf-sale-on' }));
        const px = v => v.toFixed(1) + 'px';
        /* La pieza que crece se recorta al rectángulo de la que deja la anterior y se abre hasta el suyo */
        const crecer = (s, t) => {
            const a = s.desde.getBoundingClientRect(), b = s.crece.getBoundingClientRect(), k = 1 - curva(fijar((t - 0.03) / 0.62));
            s.el.style.setProperty('--lf-vt', px(Math.max(a.top - b.top, 0) * k)); s.el.style.setProperty('--lf-vr', px(Math.max(b.right - a.right, 0) * k));
            s.el.style.setProperty('--lf-vb', px(Math.max(b.bottom - a.bottom, 0) * k)); s.el.style.setProperty('--lf-vl', px(Math.max(a.left - b.left, 0) * k));
            s.el.style.setProperty('--lf-vq', px(38 * k));
        };
        if (!secs.length) return;
        const html = document.documentElement;
        let pedido = 0;
        const cuadro = () => {
            pedido = 0;
            const paso = html.classList.contains('lf-paso'), vh = window.innerHeight;
            secs.forEach(s => {
                const t = paso ? fijar(1 - s.el.getBoundingClientRect().top / vh) : 1;
                s.el.classList.toggle('lf-filo-on', t > 0 && t < 1);
                if (s.sale) s.sale.classList.toggle(s.claseSale, t > 0 && t < 1);
                if (t !== s.ultimo) { s.ultimo = t; s.el.style.setProperty('--lf-filo', t.toFixed(4)); if (s.sale) s.sale.style.setProperty('--lf-sale', t.toFixed(4)); if (s.crece && s.desde && t > 0 && t < 1) crecer(s, t); }
            });
        };
        const pedir = () => { if (!pedido) pedido = requestAnimationFrame(cuadro); };
        window.addEventListener('scroll', pedir, { passive: true }); window.addEventListener('resize', pedir); cuadro();
    })();

    /* --- 7. PASO A LA PORTADA DEL CAPÍTULO 02: EL OSCURO SE ABRE --- */
    /* u cuenta cuántas pantallas subió la portada sobre la 03. Con el paso (.lf-paso) la pista crece de 200 a 340: de 0 a 1
       es la ventana (.lf-oscuro-on), en que el panel se abre desde el tono Oscuro de la paleta, medido al entrar; de 0,55
       a 1,85 entra lo de la portada, como en el 01; y en la última pantalla sube la 04 (--lf-ps). La tinta de la barra se
       decide aquí: clara apenas la portada tapa su franja, otra vez oscura cuando la 04 llega arriba (llego.css 7.2) */
    (() => {
        const cap = document.querySelector('.lf-cap-2'), d3 = document.getElementById('dec-03');
        if (!cap || !d3) return;
        const html = document.documentElement, oscuro = d3.querySelectorAll('.lf-val-tono')[2];
        const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
        const PISTA = 340, BASE = 200;
        const VARS = ['--lf-oe', '--lf-plano', '--lf-pl', '--lf-pd', '--lf-pt', '--lf-pi', '--lf-ps'];
        let on = false, medido = false, ultimo = -1, pedido = 0;
        const px = v => v.toFixed(1) + 'px';
        const medir = () => {
            if (!oscuro) return;
            const W = window.innerWidth, H = window.innerHeight, r = oscuro.getBoundingClientRect();
            cap.style.setProperty('--lf-ot', px(r.top)); cap.style.setProperty('--lf-or', px(W - r.right));
            cap.style.setProperty('--lf-ob', px(H - r.bottom)); cap.style.setProperty('--lf-ol', px(r.left));
        };
        const cuadro = () => {
            pedido = 0;
            const H = window.innerHeight, u = 1 - cap.getBoundingClientRect().top / H, t = fijar(u), e = curva(t);
            const pista = on ? PISTA : BASE, ps = fijar(u - (pista / 100 - 1));
            if (on && t > 0 && t < 1 && !medido) { medir(); medido = true; }
            if (!(t > 0 && t < 1)) medido = false;
            cap.classList.toggle('lf-oscuro-on', on && t > 0 && t < 1);
            if ((on ? e > 0.67 : u > 1 - 32 / H) && ps <= 1 - 32 / H) d3.dataset.claro = '0'; else delete d3.dataset.claro;
            if (ps > 1 - 32 / H) cap.dataset.claro = '1'; else delete cap.dataset.claro;
            if (!on || u === ultimo) return;
            ultimo = u;
            fase(cap, '--lf-oe', e);
            /* Liso mientras se abre; al llegar a los bordes se funde en el degradado de la portada */
            fase(cap, '--lf-plano', 1 - tramo(t, 0.45, 0.95));
            /* Lo de la portada empieza antes de terminar de abrir, así nunca queda vacía */
            fase(cap, '--lf-pl', tramo(u, 0.55, 1.2));
            fase(cap, '--lf-pd', tramo(u, 0.6, 1.5));
            fase(cap, '--lf-pt', tramo(u, 0.8, 1.3));
            fase(cap, '--lf-pi', tramo(u, 1.25, 1.85));
            fase(cap, '--lf-ps', ps);
        };
        const pedir = () => { if (!pedido) pedido = requestAnimationFrame(cuadro); };
        /* El paso del hero decide .lf-paso con la misma consulta y escucha antes: aquí solo se sigue. Corre antes que
           caso-motor.js, así el motor mide la pista ya decidida */
        const activar = () => {
            on = html.classList.contains('lf-paso');
            cap.style.setProperty('--pista', String(on ? PISTA : BASE));
            cap.dataset.ancla = on ? '0.375' : '0';
            if (!on) { VARS.forEach(v => cap.style.removeProperty(v)); cap.classList.remove('lf-oscuro-on'); }
            ultimo = -1; medido = false; pedir();
        };
        movil.addEventListener('change', activar);
        window.addEventListener('scroll', pedir, { passive: true });
        window.addEventListener('resize', () => { medido = false; pedir(); });
        activar();
    })();

    /* --- 8. PASO A LA PORTADA DEL CAPÍTULO 03: LA RETÍCULA PASA --- */
    /* u cuenta cuántas pantallas subió la portada sobre la que la 07 suma a su pista, con el manual cerrado. Con el paso
       (.lf-paso) la pista crece de 200 a 340: de 0 a 1 es el paso (.lf-pasa-on), en que las líneas del cierre de la 07
       pasan a ser la retícula de la portada (llego.css 7.3), medidas al entrar; de 0,6 a 1,85 entra lo de la portada,
       como en el 01 y el 02; y en la última pantalla sube la decisión siguiente (--lf-ps) */
    (() => {
        const cap = document.querySelector('.lf-cap-3'), d7 = document.getElementById('dec-07'), capa = document.querySelector('.lf-p3-capa');
        if (!cap || !d7 || !capa) return;
        const html = document.documentElement, px = v => v.toFixed(1) + 'px', mezcla = (a, b, e) => a + (b - a) * e;
        const lineas = {}, cortes = [...capa.querySelectorAll('[data-c]')];
        capa.querySelectorAll('[data-l]').forEach(l => { lineas[l.dataset.l] = l; });
        const movil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
        const PISTA = 340, BASE = 200;
        const VARS = ['--lf-pd', '--lf-pt', '--lf-pi', '--lf-ps'], VARS_HTML = ['--lf-p3f', '--lf-p3v', '--lf-p3c', '--lf-p3x', '--lf-p3y', '--lf-p3r', '--lf-p3o'];
        let on = false, m = null, ultimo = -1, pedido = 0;
        /* Las cuatro líneas del cierre y su rótulo de arriba a la izquierda; las cinco de la retícula, cada una cortada
           donde la corta su --fin (8 px antes del contenido, sección 5.1), medidas desde su panel, que queda arriba */
        const caja = el => { const r = el.getBoundingClientRect(); return { l: r.left, t: r.top, w: r.width, h: r.height }; };
        const medir = () => {
            const c = s => caja(d7.querySelector(s)), panel = caja(cap.querySelector('.lf-cap-fijo'));
            const ret = [...cap.querySelectorAll('.lf-reticula i')].map(i => { const r = caja(i), g = getComputedStyle(i), n = v => parseFloat(g.getPropertyValue(v)) || 0; return { l: r.l - panel.l, t: r.t - panel.t, w: 1, h: r.h - n('--fin'), gt: n('--gt'), gb: n('--gb') }; });
            const v1 = c('.lf-cierre-v1');
            m = ret.length === 5 && v1.h > 0 ? { v1, v2: c('.lf-cierre-v2'), h1: c('.lf-cierre-h1'), h2: c('.lf-cierre-h2'), rot: c('.lf-cierre-tl'), ret } : null;
        };
        const linea = (k, r, alfa, verde) => {
            const el = lineas[k];
            el.style.setProperty('--x', px(r.l)); el.style.setProperty('--y', px(r.t)); el.style.setProperty('--w', px(r.w)); el.style.setProperty('--h', px(r.h));
            fase(el, '--a', alfa); fase(el, '--k', verde);
        };
        const entre = (a, b, e) => ({ l: mezcla(a.l, b.l, e), t: mezcla(a.t, b.t, e), w: mezcla(a.w, b.w, e), h: mezcla(a.h, b.h, e) });
        const pasar = t => {
            const W = window.innerWidth, H = window.innerHeight, R = m.ret;
            /* 1 · La 07 se apaga bajo sus líneas, que se encienden en verde claro; la portada aparece al final, debajo */
            fase(html, '--lf-p3v', curva(tramo(t, 0, 0.3)));
            fase(html, '--lf-p3f', tramo(t, 0.5, 0.88));
            const luz = tramo(t, 0, 0.14), asienta = tramo(t, 0.72, 0.96);
            const alfa = mezcla(mezcla(0.22, 0.6, luz), 0.16, asienta), verde = luz * (1 - asienta);
            /* 2 · El marco del manual se abre hasta la pantalla: sus verticales van a los bordes de la retícula y sus
               horizontales a 96 px de arriba y de abajo, donde se apagan */
            const e = curva(tramo(t, 0.14, 0.56));
            const x0 = mezcla(m.v1.l, R[0].l, e), x1 = mezcla(m.v2.l, R[4].l, e), y0 = mezcla(m.h1.t, 96, e), y1 = mezcla(m.h2.t, H - 96, e);
            linea('v1', entre(m.v1, R[0], e), alfa, verde);
            linea('v5', entre(m.v2, R[4], e), alfa, verde);
            const fuera = 1 - tramo(t, 0.62, 0.82);
            linea('h1', { l: mezcla(m.h1.l, 0, e), t: y0, w: mezcla(m.h1.w, W, e), h: 1 }, alfa * fuera, verde);
            linea('h2', { l: mezcla(m.h2.l, 0, e), t: y1, w: mezcla(m.h2.w, W, e), h: 1 }, alfa * fuera, verde);
            /* 3 · Las tres columnas interiores se dibujan de arriba abajo, una tras otra, como en las portadas 01 y 02 */
            ['v2', 'v3', 'v4'].forEach((k, i) => {
                const d = curva(tramo(t, 0.46 + 0.07 * i, 0.74 + 0.07 * i)), r = R[i + 1];
                linea(k, { l: r.l, t: r.t, w: 1, h: r.h * d }, alfa, verde);
            });
            /* Las verticales llevan el mismo corte que su línea de destino donde cruza la cifra */
            [['v1', 0], ['v2', 1], ['v3', 2], ['v4', 3], ['v5', 4]].forEach(([k, i]) => { lineas[k].style.setProperty('--gt', px(R[i].gt)); lineas[k].style.setProperty('--gb', px(R[i].gb)); });
            /* Las marcas de corte, a 8 px de cada esquina hacia adentro: aparecen con la luz y se van al abrirse, porque
               la pantalla no se corta */
            fase(html, '--lf-p3c', tramo(t, 0.03, 0.14) * (1 - tramo(t, 0.4, 0.56)));
            const esquina = { tl: [x0 + 8, y0 + 8], tr: [x1 - 20, y0 + 8], bl: [x0 + 8, y1 - 20], br: [x1 - 20, y1 - 20] };
            cortes.forEach(c => { const [x, y] = esquina[c.dataset.c]; c.style.setProperty('--x', px(x)); c.style.setProperty('--y', px(y)); });
            /* 4 · El rótulo viaja con la esquina: de 36 páginas a una */
            html.style.setProperty('--lf-p3x', px(x0 + m.rot.l - m.v1.l)); html.style.setProperty('--lf-p3y', px(y0 + m.rot.t - m.h1.t));
            fase(html, '--lf-p3r', curva(tramo(t, 0.3, 0.4)));
            fase(html, '--lf-p3o', 1 - tramo(t, 0.7, 0.86));
        };
        const cuadro = () => {
            pedido = 0;
            const u = 1 - cap.getBoundingClientRect().top / window.innerHeight, t = fijar(u), dentro = on && t > 0 && t < 1;
            cap.classList.toggle('lf-pasa-on', dentro);
            html.classList.toggle('lf-p3-dentro', dentro);
            if (!dentro) m = null;
            if (!on || u === ultimo) return;
            ultimo = u;
            if (dentro) {
                if (!m) medir();
                if (m) pasar(t); else { ultimo = -1; pedir(); }
            }
            fase(cap, '--lf-pd', tramo(u, 0.6, 1.5));
            fase(cap, '--lf-pt', tramo(u, 0.8, 1.3));
            fase(cap, '--lf-pi', tramo(u, 1.25, 1.85));
            fase(cap, '--lf-ps', fijar(u - (PISTA / 100 - 1)));
        };
        const pedir = () => { if (!pedido) pedido = requestAnimationFrame(cuadro); };
        /* Como en el 7: corre antes que caso-motor.js, así el motor mide la pista ya decidida */
        const activar = () => {
            on = html.classList.contains('lf-paso');
            cap.style.setProperty('--pista', String(on ? PISTA : BASE));
            cap.dataset.ancla = on ? '0.375' : '0';
            if (!on) { VARS.forEach(v => cap.style.removeProperty(v)); VARS_HTML.forEach(v => html.style.removeProperty(v)); cap.classList.remove('lf-pasa-on'); html.classList.remove('lf-p3-dentro'); }
            ultimo = -1; m = null; pedir();
        };
        movil.addEventListener('change', activar);
        window.addEventListener('scroll', pedir, { passive: true });
        window.addEventListener('resize', () => { m = null; ultimo = -1; pedir(); });
        activar();
    })();
})();
/* =======================================================
   FIN JS · CASO LLEGÓ FARMA (.lf-)
   ======================================================= */
