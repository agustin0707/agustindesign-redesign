/* =======================================================
   INICIO JS · CASO LLEGÓ FARMA, COPIA PARA LA EXPLORACIÓN DEL PASO AL RESUMEN (.lf-)
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
        siguiente: { id: 'tapin', nombre: 'Tap In', numero: '02', bajada: 'De la cafetería del campus a la plataforma del colegio.', tinte: '#110E22', url: 'tapin.html' }
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
        const c = { W: 0, H: 0, cw: 0, ch: 0, g: 28, paso: 0, ciclo: 0, largo: 0, off: 0, p: 0, t: 0, escala: 1 };
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
            c.escala = (parseFloat(getComputedStyle(h).getPropertyValue('--pista')) - 100) / 180;
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
            /* Copia: pa es el avance en la escala de la pista original (280), así el aterrizaje no cambia de ritmo */
            const pa = c.p * c.escala, e = curva(fijar(pa / 0.85));
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
           una campana ancha (σ igual al 20 % del ancho del logo): el grado --w (la campana) y un tirón hacia el cursor (la
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
            piezas.forEach(p => ['--w', '--px', '--py'].forEach(v => p.style.removeProperty(v)));
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
                p.setProperty('--w', r.w.toFixed(4)); p.setProperty('--px', r.px.toFixed(3)); p.setProperty('--py', r.py.toFixed(3));
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

    /* --- 3. ESCENAS PROPIAS --- */
    window.CASO_ESCENAS = {
        /* Hero: el avance de su pista endereza la cinta y la hace aterrizar */
        hero: () => p => { if (cinta) cinta.p = p; },
        /* Resumen: el proyecto avanza hito a hito como un envío rastreado */
        resumen: el => {
            const hitos = [...el.querySelectorAll('.lf-hitos li')], registro = [...el.querySelectorAll('.lf-registro li')];
            const linea = el.querySelector('.lf-hitos'), estado = el.querySelector('[data-envio-estado]'), n = el.querySelector('[data-envio-n]');
            const total = hitos.length;
            let actual = -1;
            return p => {
                const k = Math.min(Math.floor(fijar((p - 0.04) / 0.9) * total), total - 1);
                if (k === actual) return;
                actual = k;
                hitos.forEach((li, i) => { li.classList.toggle('hecho', i < k); li.classList.toggle('actual', i === k); });
                registro.forEach((li, i) => { li.classList.toggle('visto', i <= k); li.classList.toggle('actual', i === k); });
                linea.style.setProperty('--avance', (k / (total - 1)).toFixed(3));
                estado.textContent = hitos[k].querySelector('b').textContent;
                n.textContent = `Hito ${pad(k + 1)} / ${pad(total)}`;
            };
        },

        /* Sistema: la trama de puntos de Llegó; en el paso 2 una ruta de puntos se vuelve nodos conectados */
        sistema: el => {
            const lienzo = el.querySelector('[data-sis-red]');
            /* Una red y no una línea: un centro con ramas, como la molécula y como el reparto desde una bodega */
            const ruta = [[7, 5], [4, 3], [4, 7], [10, 3], [11, 7], [2, 5], [7, 8]];
            const tramos = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [0, 6]];
            const lineas = tramos.map(([i, j], k) => {
                const a = ruta[i], q = ruta[j], l = svg('line', { x1: a[0] * 40 + 20, y1: a[1] * 40 + 20, x2: q[0] * 40 + 20, y2: q[1] * 40 + 20, pathLength: 1 });
                l.style.transitionDelay = k * 120 + 'ms'; lienzo.appendChild(l); return l;
            });
            const puntos = [];
            for (let f = 0; f < 10; f++) for (let c = 0; c < 15; c++) {
                const pt = svg('circle', { cx: c * 40 + 20, cy: f * 40 + 20, r: 3 });
                pt.nodo = ruta.some(q => q[0] === c && q[1] === f);
                if (pt.nodo) pt.style.transitionDelay = ruta.findIndex(q => q[0] === c && q[1] === f) * 120 + 'ms';
                lienzo.appendChild(pt); puntos.push(pt);
            }
            let actual = -1;
            return p => {
                const k = Math.min(Math.floor(p * 3), 2);
                if (k === actual) return;
                actual = k;
                lineas.forEach(l => l.classList.toggle('unido', k >= 1));
                puntos.forEach(pt => { pt.classList.toggle('nodo', pt.nodo && k >= 1); pt.classList.toggle('apagado', !pt.nodo && k >= 1); });
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
            return p => {
                tiras.forEach((t, k) => fase(t, '--f', tramo(p, 0.02 + k * 0.024, 0.12 + k * 0.024)));
                const l = tramo(p, 0.38, 0.5), f = tramo(p, 0.68, 0.78);
                fase(pieza, '--liso', l); fase(pieza, '--filete', f);
                bloques.forEach((b, k) => fase(b, '--f', tramo(p, 0.74 + k * 0.04, 0.84 + k * 0.04)));
                mide = l > 0.98 && f < 0.02;
                if (!mide) abrir(-1);
            };
        },

        /* Logo: composición, construcción con el módulo X, área de protección y mínimos */
        lockup: el => {
            const pieza = el.querySelector('.lf-lock'), pie = el.querySelector('[data-lock-pie]');
            const nombres = ['Principal', 'Construcción', 'Área de protección', 'Mínimos'];
            let paso = -1;
            return p => {
                const c1 = tramo(p, 0.02, 0.16);
                fase(pieza, '--c1', c1); fase(pieza, '--c1o', c1 * (1 - tramo(p, 0.24, 0.29)));
                fase(pieza, '--c2', tramo(p, 0.27, 0.45)); fase(pieza, '--cx', tramo(p, 0.42, 0.48));
                fase(pieza, '--c3', tramo(p, 0.52, 0.68)); fase(pieza, '--c4', tramo(p, 0.76, 0.86));
                const k = Math.min(Math.floor(p * 4), 3);
                if (k !== paso) { paso = k; pie.textContent = nombres[k]; }
            };
        },

        /* Caminos: entran los isotipos, suben sus aplicaciones, se leen los criterios y se marca el elegido */
        caminos: el => {
            const pieza = el.querySelector('.lf-cam'), cols = [...el.querySelectorAll('.lf-cam-col')];
            return p => {
                cols.forEach((c, k) => { fase(c, '--ci', tramo(p, 0.02 + k * 0.05, 0.12 + k * 0.05)); fase(c, '--fo', tramo(p, 0.27 + k * 0.05, 0.37 + k * 0.05)); });
                fase(pieza, '--cr', tramo(p, 0.52, 0.68)); fase(pieza, '--el', tramo(p, 0.77, 0.87));
            };
        },

        /* Manual: las páginas pasan y se detienen. La posición avanza página a página: el 40 % de cada tramo queda quieto y el resto es el paso a la siguiente. La
           primera y la última tienen su pausa completa */
        manual: el => {
            const pags = [...el.querySelectorAll('.lf-man-pag')], n = pags.length, sec = el.querySelector('[data-man-sec]'), num = el.querySelector('[data-man-pag]');
            let actual = -1;
            return p => {
                const t = fijar(p * (n - 0.4) - 0.3, 0, n - 1), k = Math.min(Math.floor(t), n - 2), pos = k + curva(fijar((t - k - 0.2) / 0.6));
                pags.forEach((g, i) => { const d = i - pos; fase(g, '--d', d); fase(g, '--o', fijar(1 - Math.abs(d) * 0.72, 0.16, 1)); });
                const c = Math.round(pos);
                if (c === actual) return;
                actual = c;
                const g = pags[c].dataset;
                sec.textContent = g.sec; num.textContent = g.pag === 'Portada' ? 'Portada' : `Pág. ${g.pag} / 36`;
            };
        },

        /* Dominio: se escribe llego.cl/farma, se tacha y se borra; se escribe llegofarma.cl y el sitio carga */
        dominio: el => {
            const url = el.querySelector('[data-url]'), viejo = 'llego.cl/farma', nuevo = 'llegofarma.cl';
            let previo = '';
            const tramo = (p, a, b) => fijar((p - a) / (b - a));
            return p => {
                let html;
                if (p < 0.3) html = viejo.slice(0, Math.round(tramo(p, 0.08, 0.26) * viejo.length));
                else if (p < 0.36) html = `<s>${viejo}</s>`;
                else if (p < 0.42) html = `<s>${viejo.slice(0, Math.round((1 - tramo(p, 0.36, 0.42)) * viejo.length))}</s>`;
                else html = nuevo.slice(0, Math.round(tramo(p, 0.44, 0.56) * nuevo.length));
                if (html !== previo) { url.innerHTML = html; previo = html; }
                el.style.setProperty('--carga', tramo(p, 0.56, 0.66).toFixed(3));
                el.style.setProperty('--dibuja', tramo(p, 0.62, 0.8).toFixed(3));
            };
        },

        /* Teléfono: llegofarma.cl real a 390 px de ancho, montado en reposo y bajando con el scroll de la página */
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
            return ir;
        }
    };

    /* --- 4. ENLACES A LOS CAPÍTULOS Y FONDO DEL ESTIRÓN --- */
    document.querySelectorAll('.lf-etapas a').forEach(a => a.addEventListener('click', ev => {
        const destino = document.querySelector(a.getAttribute('href'));
        if (!destino) return;
        ev.preventDefault();
        window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY, behavior: quieto ? 'auto' : 'smooth' });
    }));
    /* Arriba el turquesa del hero, abajo el morado de Tap In: el estirón del scroll nunca muestra un color ajeno */
    let abajo = null;
    const fondo = () => { const b = window.scrollY > document.documentElement.scrollHeight / 2; if (b !== abajo) { abajo = b; document.documentElement.classList.toggle('lf-abajo', b); } };
    window.addEventListener('scroll', fondo, { passive: true }); fondo();
})();
/* =======================================================
   FIN JS · CASO LLEGÓ FARMA, COPIA PARA LA EXPLORACIÓN DEL PASO AL RESUMEN (.lf-)
   ======================================================= */
