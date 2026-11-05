/* =======================================================
   INICIO JS · PASOS DE LA PORTADA AL CASO (EXPLORACIÓN)
   ======================================================= */
/* Cada paso es una función async que anima piezas de la portada, del hero y de la capa fx. Todo el tiempo pasa por
   anim() y tween(), que respetan la cámara lenta y se cancelan juntos al reiniciar */
(function () {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)];
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const lerp = (a, b, t) => a + (b - a) * t;
    const W = 1440, H = 900;
    const lienzo = $('[data-lienzo]'), pantalla = $('[data-pantalla]'), fx = $('[data-fx]');

    const CURVA = 'cubic-bezier(0.4, 0, 0.1, 1)';
    const SALE = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const MORPH = 'cubic-bezier(0.76, 0, 0.24, 1)';
    const SE_VA = 'cubic-bezier(0.4, 0, 1, 1)';

    /* --- 1. ESCALA DEL LIENZO --- */
    let k = 1;
    const escalar = () => { k = pantalla.clientWidth / W; lienzo.style.setProperty('--k', k); };
    new ResizeObserver(escalar).observe(pantalla);
    escalar();

    /* --- 2. TIEMPO: CÁMARA LENTA, CANCELACIÓN Y CURVAS --- */
    let lento = false, turno = 0, vivas = [];
    const tocados = new Set();
    const F = () => (lento ? 4 : 1);
    const anim = (el, kf, o = {}) => {
        const a = el.animate(kf, { fill: 'both', easing: CURVA, ...o, duration: (o.duration ?? 400) * F(), delay: (o.delay ?? 0) * F() });
        vivas.push(a); return a;
    };
    const luego = (ms, fn) => { const yo = turno; setTimeout(() => { if (yo === turno) fn(); }, ms * F()); };
    /* Una curva de Bézier evaluada en JS, para los tweens que escriben estilos cuadro a cuadro */
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
    const tween = (dur, delay, curva, fn) => {
        const yo = turno;
        return new Promise(listo => {
            const t0 = performance.now() + delay * F();
            const paso = ahora => {
                if (yo !== turno) return listo();
                if (ahora >= t0) { const u = fijar((ahora - t0) / (dur * F())); fn(curva(u), u); if (u >= 1) return listo(); }
                requestAnimationFrame(paso);
            };
            requestAnimationFrame(paso);
        });
    };
    /* Las animaciones de CSS que disparan las clases (la entrada del logo, el tap de la i) siguen la cámara lenta */
    const ritmo = raiz => raiz.getAnimations({ subtree: true }).forEach(a => { if (a instanceof CSSAnimation) a.playbackRate = 1 / F(); });
    const estilo = (el, props) => { Object.assign(el.style, props); tocados.add(el); };

    /* --- 3. MEDIDAS EN EL LIENZO --- */
    /* Cajas en coordenadas del lienzo (1440 × 900), sin importar la escala de la pantalla */
    const caja = el => {
        const r = el.getBoundingClientRect(), l = lienzo.getBoundingClientRect();
        return { x: (r.left - l.left) / k, y: (r.top - l.top) / k, w: r.width / k, h: r.height / k };
    };
    const union = cs => {
        const x = Math.min(...cs.map(c => c.x)), y = Math.min(...cs.map(c => c.y));
        return { x, y, w: Math.max(...cs.map(c => c.x + c.w)) - x, h: Math.max(...cs.map(c => c.y + c.h)) - y };
    };
    /* La tinta de un texto (sin el interlineado): mide los glifos con canvas y los ubica en su caja de línea */
    const lienzoTxt = document.createElement('canvas').getContext('2d');
    const tinta = el => {
        const cs = getComputedStyle(el), b = caja(el);
        lienzoTxt.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        lienzoTxt.letterSpacing = cs.letterSpacing;
        const m = lienzoTxt.measureText(el.textContent), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs;
        const base = b.y + (lh - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
        return { x: b.x - m.actualBoundingBoxLeft, y: base - m.actualBoundingBoxAscent, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, h: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, caja: b };
    };
    /* Copia una pieza de la portada a la capa fx, en el mismo lugar, para que viaje por encima de todo */
    const volador = el => {
        const b = caja(el), c = el.cloneNode(true);
        c.classList.add('volador');
        Object.assign(c.style, { left: b.x + 'px', top: b.y + 'px' });
        fx.appendChild(c);
        estilo(el, { visibility: 'hidden' });
        return c;
    };

    /* --- 4. LA CINTA DE LLEGÓ (EL HERO DEL CASO, EN MINIATURA) --- */
    /* Las mismas cuentas de caso/llego.js para 1440 × 900: cinco columnas sobre un plano inclinado que avanza. e es el
       aterrizaje (0 la cinta, 1 la carta de Inicio plana en rect), a la llegada desde abajo y op la opacidad */
    const cinta = (() => {
        const raiz = $('[data-hero="lf"]'), plano = $('.lf-h-plano', raiz);
        const P = { n: 5, ancho: 0.23, rx: 71, rz: -19, dx: 0.19, dy: -0.04, vel: 1.25, niebla: 0.8 };
        const TOMAS = ['hero', 's-capacidades', 's-propuesta', 's-calidad', 's-tecnologia', 's-experiencia', 's-categorias', 's-contacto'];
        const cw = Math.round(W * P.ancho), ch = cw * 10 / 16, g = Math.round(fijar(cw * 0.067, 10, 36));
        const paso = ch + g, ciclo = 8 * paso, largo = Math.max(W, H) * 3.4, foco = (P.n - 1) / 2;
        const n = Math.ceil((largo + ciclo) / paso) + 1, vpaso = Math.min(0.22, 0.6 / (P.n - 1));
        const cols = Array.from({ length: P.n }, (_, i) => {
            const el = document.createElement('div');
            el.className = 'lf-h-col' + (i === foco ? ' foco' : '');
            el.innerHTML = '<b class="lf-h-piso"></b>';
            const ini = (((i - foco) * 3) % 8 + 8) % 8;
            const cartas = Array.from({ length: n }, (_, j) => {
                const c = document.createElement('i');
                c.className = 'lf-h-carta'; c.style.top = (j * paso).toFixed(1) + 'px';
                c.innerHTML = `<img src="../media/lf-cinta-${TOMAS[(ini + j) % 8]}.jpg" alt="" decoding="async">`;
                el.appendChild(c); return c;
            });
            el.firstChild.style.height = (n * paso).toFixed(1) + 'px';
            plano.appendChild(el);
            return { el, cartas, v: 1 + (i - foco) * vpaso };
        });
        plano.style.cssText = `--cw:${cw}px;--g:${g}px;width:${P.n * cw + (P.n - 1) * g}px;height:${largo}px`;
        raiz.style.setProperty('--foco', (50 + P.dx * 100) + '%');
        const s = { e: 0, a: 1, op: 0, off: 0, t: 0, modo: 'quieto', rect: null, blanco: -1, ult: 0 };
        const suave = t => 1 - Math.pow(1 - t, 3);
        const pintar = () => {
            const e = s.e, r = s.rect || { cx: W / 2, cy: H / 2, w: cw };
            cols.forEach((col, i) => {
                let pos = -((s.off * col.v) % ciclo);
                if (i === foco && e > 0) {
                    const base = largo / 2 - ch / 2, m = Math.round((base - pos) / ciclo);
                    pos += (base - m * ciclo - pos) * e;
                    if (m * 8 !== s.blanco) { col.cartas.forEach((x, j) => x.classList.toggle('blanco', j === m * 8)); s.blanco = m * 8; }
                }
                col.el.style.transform = `translate3d(0, ${pos.toFixed(1)}px, 0)`;
            });
            const esc = 1 + (r.w / cw - 1) * e;
            const tx = W * P.dx * (1 - e) + (r.cx - W / 2) * e;
            const ty = (1 - s.a) * H * 0.4 + H * P.dy * (1 - e) + (r.cy - H / 2) * e;
            plano.style.transform = `translate(-50%, -50%) translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) rotateX(${(P.rx * (1 - e)).toFixed(2)}deg) rotateZ(${(P.rz * (1 - e)).toFixed(2)}deg) scale(${esc.toFixed(4)})`;
            plano.style.opacity = s.op.toFixed(3);
            raiz.style.setProperty('--q', e.toFixed(3));
            raiz.style.setProperty('--niebla', (P.niebla * (1 - e)).toFixed(3));
        };
        /* Llega rápido y frena hasta su velocidad de crucero, como en el caso; solo avanza lo que no está aterrizado */
        const cuadro = ahora => {
            const dt = Math.min(ahora - (s.ult || ahora), 50) / F(); s.ult = ahora;
            if (s.modo !== 'quieto') {
                s.t += dt;
                if (s.modo === 'entra') { s.a = suave(fijar(s.t / 1600)); s.op = fijar(s.t / 500); }
                s.off += dt * 0.045 * (1 + 7 * Math.exp(-s.t / 380)) * P.vel * (P.ancho / 0.3) * (1 - s.e);
            }
            pintar(); requestAnimationFrame(cuadro);
        };
        requestAnimationFrame(cuadro);
        return {
            s, cw,
            preparar(o = {}) { Object.assign(s, { e: 0, a: 1, op: 0, off: 0, t: 0, modo: 'quieto', rect: null, blanco: -1 }, o); pintar(); },
            andar(modo) { s.modo = modo; s.t = 0; },
            /* La carta que aterriza puede llevar la misma captura de la portada, así el relevo no se nota */
            poster(src) { pintar(); const img = $('.lf-h-col.foco .blanco img', plano); if (img) { img.dataset.antes = img.dataset.antes || img.getAttribute('src'); img.src = src; } },
            limpiar() { $$('img[data-antes]', plano).forEach(img => { img.src = img.dataset.antes; delete img.dataset.antes; }); }
        };
    })();

    /* --- 5. PIEZAS DE LAS PORTADAS Y DE LOS HEROS --- */
    const cov = id => {
        const r = $(`[data-cov="${id}"]`);
        return { r, mundo: $('.cov-mundo', r), tope: $('.cov-tope', r), caps: $('.cov-caps', r), ventana: $('.cov-ventana', r), barra: $('.cov-barra', r), pant: $('.cov-pant', r), txt: $('.cov-txt', r), h3: $('h3', r), w1: $('h3 .w1', r), w2: $('h3 .w2', r), p: $('.cov-txt p', r), cifra: $('.cov-cifra', r), ver: $('.cov-ver', r), regla: $('.cov-regla', r), cinta: $('.pt-cinta', r) };
    };
    const hlf = (() => { const r = $('[data-hero="lf"]'); return { r, barra: $('.h-barra', r), franja: $$('.lf-h-franja > *', r), logo: $('.lf-logo', r), ficha: $('.lf-h-ficha', r), items: $$('.lf-h-ficha li', r) }; })();
    const htp = (() => { const r = $('[data-hero="tp"]'); return { r, fondo: $('.tp-fondo', r), mundo: $('.tp-mundo', r), ventana: $('.tp-ventana', r), vbarra: $('.tp-barra', r), barra: $('.h-barra', r), mono: $('.tp-txt .mono', r), h2: $('.tp-txt h2', r), wm: $('.tp-txt svg', r), letras: $$('[data-letra]', r), p: $('.tp-txt p', r), link: $('.tp-link', r), pista: $('.tp-pista', r) }; })();

    const pulsar = (el, hondo = 0.95) => anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${hondo})`, offset: 0.4 }, { transform: 'scale(1)' }], { duration: 240, easing: 'ease-out' });
    const apagar = (els, o = {}) => els.forEach((el, i) => anim(el, [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: `0 ${o.y ?? -8}px` }], { duration: o.duration ?? 240, delay: (o.delay ?? 0) + i * (o.paso ?? 0), easing: SE_VA, fill: 'forwards' }));
    const fundir = (el, de, a, o) => anim(el, [{ opacity: de }, { opacity: a }], { easing: 'linear', ...o });

    /* La entrada del hero de Llegó: barra, franja, logo (su secuencia completa) y ficha, cada una cuando el paso diga */
    const lfEntra = ({ barra = 700, franja = 900, logo = 1000, ficha = 2000, linea = true, farmaAntes = false } = {}) => {
        fundir(hlf.barra, 0, 1, { duration: 500, delay: barra });
        hlf.franja.forEach((el, i) => anim(el, [{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 900, delay: franja + i * 80, easing: SALE }));
        luego(logo, () => { hlf.logo.classList.toggle('farma-antes', farmaAntes); hlf.logo.classList.add('llega'); ritmo(hlf.logo); });
        if (linea) fundir(hlf.ficha, 0, 1, { duration: 600, delay: ficha });
        hlf.items.forEach((el, i) => anim(el, [{ opacity: 0, translate: '0 14px' }, { opacity: 1, translate: '0 0' }], { duration: 900, delay: ficha + i * 80, easing: SALE }));
    };
    /* La entrada del hero de Tap In; null deja la pieza para que el paso la anime a su manera */
    const tpEntra = ({ barra = 600, mono = 150, letras = 250, p = 620, link = 740, pista = 1800, ventana = null, fondo = null } = {}) => {
        fundir(htp.barra, 0, 1, { duration: 500, delay: barra });
        const sube = (el, d) => anim(el, [{ opacity: 0, translate: '0 40px' }, { opacity: 1, translate: '0 0' }], { duration: 1000, delay: d, easing: CURVA });
        if (mono !== null) sube(htp.mono, mono);
        if (letras !== null) htp.letras.forEach((g, i) => anim(g, [{ opacity: 0, transform: 'translateY(70px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 1000, delay: letras + i * 70, easing: CURVA }));
        if (p !== null) sube(htp.p, p);
        if (link !== null) sube(htp.link, link);
        if (pista !== null) sube(htp.pista, pista);
        if (ventana !== null) anim(htp.mundo, [{ opacity: 0, translate: '0 540px', offset: 0 }, { opacity: 1, offset: 0.4 }, { opacity: 1, translate: '0 0', offset: 1 }], { duration: 1700, delay: ventana, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
        if (fondo !== null) anim(htp.fondo, [{ opacity: 0.6, filter: 'saturate(0.6)' }, { opacity: 1, filter: 'saturate(1)' }], { duration: 1400, delay: fondo, easing: 'ease-out' });
    };
    const centro = b => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

    /* =======================================================
       LOS PASOS DE LLEGÓ FARMA
       ======================================================= */
    const PASOS = { lf: [], tp: [] };

    /* --- 6. LLEGÓ 1 · VUELVE A LA CINTA --- */
    /* La cinta del caso parte aterrizada justo sobre la pantalla de la portada (con la misma captura) y se suelta:
       la ventana se recuesta, se vuelve la carta del centro y la cámara se aleja mientras la cinta arranca */
    PASOS.lf.push({
        nombre: 'Vuelve a la cinta', dur: '1,5 s', recomendada: true,
        uno: 'La ventana de la portada se recuesta y se vuelve la carta central de la cinta.',
        idea: 'Todo lo de la portada se calla menos la ventana. La ventana se inclina, baja al plano y queda como la carta del centro; la cámara se aleja, aparecen las otras columnas y la cinta arranca y frena hasta su ritmo.',
        relacion: 'El hero hace exactamente esto al revés cuando bajas: una carta crece hasta ser la ventana del sitio en vivo. La llegada usa la gramática del propio hero, por eso se siente una sola pieza.',
        construye: 'El home guarda el rectángulo de la ventana; el caso abre con la cinta aterrizada en ese rectángulo y la suelta. Un solo movimiento continuo, sin capturas que se crucen, y funciona igual sin View Transitions.',
        async correr() {
            const c = cov('lf'), pant = { x: 612, y: 210, w: 796 };
            cinta.preparar({ e: 1, a: 1, op: 1, rect: { cx: pant.x + pant.w / 2, cy: pant.y + pant.w / 1.6 / 2, w: pant.w } });
            cinta.poster('../../works/media/lf-web.jpg');
            pulsar(c.ver);
            apagar([c.tope, c.caps, c.txt, c.regla], { duration: 260, delay: 60 });
            fundir(c.barra, 1, 0, { duration: 200, delay: 80, fill: 'forwards' });
            fundir(c.mundo, 1, 0, { duration: 520, delay: 120, fill: 'forwards' });
            anim(c.ventana, [{ opacity: 1, boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 50px 90px -40px rgba(0,0,0,0.8)' }, { opacity: 0, boxShadow: '0 0 0 1px rgba(255,255,255,0), 0 50px 90px -40px rgba(0,0,0,0)' }], { duration: 320, delay: 200, easing: 'linear', fill: 'forwards' });
            lfEntra({ barra: 700, franja: 950, logo: 1050, ficha: 2100 });
            cinta.andar('aterriza');
            await tween(1500, 220, bezier(0.6, 0, 0.12, 1), v => { cinta.s.e = 1 - v; });
        }
    });

    /* --- 7. LLEGÓ 2 · DESPACHO --- */
    /* La portada completa se acuesta en la pose del plano, como una carta más, y la cinta se la lleva al horizonte
       mientras la cinta del caso entra desde abajo con su frenada */
    PASOS.lf.push({
        nombre: 'Despacho', dur: '1,4 s',
        uno: 'La portada entera se acuesta en la cinta y sale hacia el horizonte.',
        idea: 'Se apaga el texto y la portada completa se inclina hasta la pose exacta del plano del hero, del tamaño de una carta. La cinta se la lleva hacia el horizonte mientras el resto de la cinta entra desde abajo y frena.',
        relacion: 'La portada se despacha y el caso llega: la idea de logística de Llegó, literal y sin una palabra. La portada termina siendo una carta más del sitio que muestra.',
        construye: 'Salida en el home (la portada se inclina en 3D con CSS) y la entrada que el hero ya tiene. No depende de View Transitions, así que se ve igual en Safari, Chrome y Firefox.',
        async correr() {
            const c = cov('lf');
            cinta.preparar({ op: 0, a: 0 });
            pulsar(c.ver);
            apagar([c.tope, c.caps, c.txt, c.regla], { duration: 220 });
            estilo(c.r, { outline: '1px solid rgba(255,255,255,0.2)' });
            const pose = (s, y) => `translate3d(${s === 1 ? 0 : 274}px, ${s === 1 ? 0 : -36}px, 0) rotateX(${s === 1 ? 0 : 71}deg) rotateZ(${s === 1 ? 0 : -19}deg) scale(${s}) translateY(${y}px)`;
            anim(c.r, [
                { transform: pose(1, 0), offset: 0, easing: 'cubic-bezier(0.6, 0, 0.2, 1)' },
                { transform: pose(0.23, 0), offset: 0.55, easing: 'cubic-bezier(0.3, 0, 1, 1)' },
                { transform: pose(0.23, -1500), offset: 1 }
            ], { duration: 1500, easing: 'linear' });
            anim(c.r, [{ opacity: 1, offset: 0 }, { opacity: 1, offset: 0.62 }, { opacity: 0, offset: 1 }], { duration: 1500, easing: 'linear' });
            luego(380, () => cinta.andar('entra'));
            lfEntra({ barra: 700, franja: 900, logo: 1000, ficha: 2100 });
        }
    });

    /* --- 8. LLEGÓ 3 · EL NOMBRE SE VUELVE MARCA --- */
    /* El título viaja hasta el logotipo y queda encima, en Geist; la entrada del logo corre debajo y el barrido del
       mensajero borra la palabra escrita a medida que destapa la marca */
    PASOS.lf.push({
        nombre: 'El nombre se vuelve marca', dur: '0,9 s + logo',
        uno: 'El título viaja al logo y el mensajero lo reescribe como marca.',
        idea: 'El título de la portada vuela al lugar del logo y se ajusta al tamaño del logotipo. Debajo se arma el isotipo, entra farma y el nodo mensajero cruza la palabra: donde pasa, el nombre escrito en Geist se vuelve el logotipo.',
        relacion: 'De nombre a marca: lo que hice para Llegó Farma, contado en un gesto. Es el paso más editorial y el que más luce el logo.',
        construye: 'El título viaja con FLIP entre páginas (el home guarda su caja y el caso parte ahí). El borrado sigue la entrada del logo que ya existe; con View Transitions o sin ellas.',
        async correr() {
            const c = cov('lf');
            cinta.preparar({ op: 0, a: 0 });
            pulsar(c.ver);
            apagar([c.tope, c.caps, c.p, c.cifra, c.ver, c.regla], { duration: 220 });
            anim(c.ventana, [{ opacity: 1, transform: 'translateY(0) scale(1)' }, { opacity: 0, transform: 'translateY(-24px) scale(0.92)' }], { duration: 520, delay: 40, easing: SE_VA, fill: 'forwards' });
            fundir(c.mundo, 1, 0, { duration: 620, delay: 160, fill: 'forwards' });
            luego(260, () => cinta.andar('entra'));
            /* Del título (su tinta) al logotipo (Llegó con la tilde, sin el isotipo ni farma) */
            const de = tinta(c.w1), a = union($$('.lf-lg-letra, .lf-lg-o, .lf-lg-tilde', hlf.logo).map(caja));
            const s = a.h / de.h, h3 = caja(c.h3);
            const dx = a.x - (h3.x + (de.x - h3.x) * s), dy = a.y - (h3.y + (de.y - h3.y) * s);
            estilo(c.h3, { transformOrigin: '0 0' });
            anim(c.h3, [{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${s.toFixed(4)})` }], { duration: 900, delay: 40, easing: 'cubic-bezier(0.65, 0, 0.2, 1)' });
            lfEntra({ barra: 700, franja: 900, logo: 700, ficha: 1800, farmaAntes: true });
            /* Farma escrito cede su lugar cuando entra farma del logo */
            anim(c.w2, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-10px)' }], { duration: 360, delay: 1550, easing: SE_VA, fill: 'forwards' });
            /* El borrado de Llegó sigue al borde del barrido del logo (de 56 a 300 unidades del dibujo) */
            const lg = caja(hlf.logo), u = lg.w / 440;
            await tween(1100, 700 + 1340, bezier(0.76, 0, 0.24, 1), v => {
                const borde = lg.x + (lerp(56, 300, v) + 2) * u;
                const local = (borde - (h3.x + dx)) / s - (c.w1.offsetLeft);
                c.w1.style.webkitMaskImage = c.w1.style.maskImage = `linear-gradient(90deg, transparent ${(local - 30).toFixed(1)}px, #000 ${(local + 10).toFixed(1)}px)`;
                tocados.add(c.w1);
            });
        }
    });

    /* --- 9. LLEGÓ 4 · RASTREO --- */
    /* Ver caso se encoge a un punto y traza la ruta con tres hitos sobre la línea de la ficha; un barrido vertical
       avanza con el punto y destapa el caso. Los hitos se vuelven los puntos de la ficha */
    PASOS.lf.push({
        nombre: 'Rastreo', dur: '1,7 s',
        uno: 'Ver caso se vuelve un envío rastreado que barre la portada.',
        idea: 'El botón se encoge hasta ser un punto, traza una ruta con tres hitos (despachado, en ruta, llegó) y avanza por ella; un barrido vertical lo acompaña y destapa el caso. Al llegar, la ruta queda como el filete de la ficha y los hitos como sus puntos.',
        relacion: 'El resumen del caso ya cuenta el proyecto como un envío rastreado con sus hitos. La transición lo anticipa y le da sentido al nombre: Llegó.',
        construye: 'Coreografía corta en el home y barrido con View Transitions (recorte animado sobre la página nueva). Sin ellas, el mismo barrido como telón entre las dos páginas.',
        async correr() {
            const c = cov('lf');
            cinta.preparar({ op: 0, a: 0 });
            cinta.andar('entra');
            const fi = caja(hlf.ficha), y = fi.y, x0 = fi.x, x1 = fi.x + fi.w;
            const hitos = hlf.items.map(li => caja(li).x + 3);
            const etq = ['Despachado', 'En ruta', 'Llegó'];
            /* El botón pasa a la capa fx y se vuelve el punto */
            const vb = caja(c.ver), boton = document.createElement('span');
            boton.className = 'rs-boton'; boton.innerHTML = '<span>Ver caso →</span>';
            Object.assign(boton.style, { left: vb.x + 'px', top: vb.y + 'px', width: vb.w + 'px', height: vb.h + 'px', borderRadius: '22px', background: '#EDEDEA' });
            const linea = document.createElement('i'); linea.className = 'rs-linea';
            Object.assign(linea.style, { left: x0 + 'px', top: y + 'px', width: (x1 - x0) + 'px', transform: 'scaleX(0)' });
            const ps = hitos.map(x => { const h = document.createElement('i'); h.className = 'rs-hito'; Object.assign(h.style, { left: x + 'px', top: y + 'px', opacity: 0 }); return h; });
            const ls = hitos.map((x, i) => { const l = document.createElement('span'); l.className = 'rs-etq'; l.textContent = etq[i]; Object.assign(l.style, { left: (x + 13) + 'px', top: (y + 16) + 'px', opacity: 0 }); return l; });
            const barrido = document.createElement('i'); barrido.className = 'rs-barrido'; barrido.style.opacity = 0;
            fx.append(linea, ...ps, ...ls, barrido, boton);
            pulsar(c.ver);
            fundir(c.ver, 1, 0, { duration: 1, delay: 100, fill: 'forwards' });
            apagar([c.tope, c.caps, c.p, c.cifra, c.regla], { duration: 240 });
            fundir(boton, 0, 1, { duration: 1, delay: 100 });
            anim(boton.firstChild, [{ opacity: 1 }, { opacity: 0 }], { duration: 120, delay: 110, easing: 'linear', fill: 'forwards' });
            anim(boton, [
                { left: vb.x + 'px', top: vb.y + 'px', width: vb.w + 'px', height: vb.h + 'px', borderRadius: '22px', backgroundColor: '#EDEDEA' },
                { left: (hitos[0] - 6.5) + 'px', top: (y - 6.5) + 'px', width: '13px', height: '13px', borderRadius: '7px', backgroundColor: '#70CAC7' }
            ], { duration: 400, delay: 110, easing: CURVA });
            anim(linea, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 560, delay: 420, easing: SALE });
            ps.forEach((h, i) => anim(h, [{ opacity: 0, transform: 'scale(0.3)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 360, delay: 440 + i * 110, easing: SALE }));
            ls.forEach((l, i) => anim(l, [{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: 400, delay: 480 + i * 110, easing: SALE }));
            fundir(barrido, 0, 1, { duration: 120, delay: 800 });
            lfEntra({ barra: 900, franja: 1100, logo: 1250, ficha: 1900, linea: false });
            /* El punto viaja por la ruta y el barrido destapa el caso desde la izquierda */
            await tween(950, 820, bezier(0.65, 0, 0.35, 1), v => {
                const x = lerp(hitos[0], W + 30, v);
                barrido.style.translate = x + 'px 0';
                c.r.style.clipPath = `inset(0 0 0 ${x.toFixed(1)}px)`; tocados.add(c.r);
                boton.style.transform = `translateX(${(Math.min(x, hitos[2]) - hitos[0]).toFixed(1)}px)`;
                ps.forEach((h, i) => h.classList.toggle('hecho', x >= hitos[i] - 1));
            });
            ps[2].classList.add('actual');
            /* La ruta se vuelve la ficha: la línea queda como su filete y las etiquetas ceden su lugar */
            fundir(hlf.ficha, 0, 1, { duration: 300, delay: 200 });
            fundir(linea, 1, 0, { duration: 400, delay: 250, fill: 'forwards' });
            fundir(barrido, 1, 0, { duration: 200, fill: 'forwards' });
            ls.forEach((l, i) => anim(l, [{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -8px' }], { duration: 260, delay: 60 + i * 60, easing: SE_VA, fill: 'forwards' }));
            [...ps, boton].forEach(el => anim(el, [{ opacity: 1, scale: 1 }, { opacity: 0, scale: 0.46 }], { duration: 400, delay: 320, easing: CURVA, fill: 'forwards' }));
        }
    });

    /* =======================================================
       LOS PASOS DE TAP IN
       ======================================================= */

    /* --- 10. TAP IN 1 · LA VENTANA SE RECUESTA --- */
    /* La ventana del hero parte plana sobre la de la portada y viaja a su pose: abajo, al centro y recostada en 3D.
       El título sube y se vuelve el wordmark mientras las letras entran donde aterriza */
    PASOS.tp.push({
        nombre: 'La ventana se recuesta', dur: '1,1 s',
        uno: 'La ventana viaja al centro y se recuesta; el título se vuelve el wordmark.',
        idea: 'La ventana de la portada viaja hacia abajo y al centro y, en el camino, se recuesta hasta la inclinación del hero. El título sube a su lugar y se convierte en el wordmark, que entra letra por letra. La cinta se va hacia arriba y el morado se aclara al del caso.',
        relacion: 'Misma ventana, mismo nombre, mismo mundo: cada pieza de la portada termina en su lugar del hero. Es la versión fluida y continua de lo que tenemos hoy.',
        construye: 'FLIP entre páginas: el home guarda el rectángulo de la ventana y el del título, y el caso parte con ellos y los anima a su pose. El 3D de la ventana no se puede con View Transitions, por eso va así.',
        async correr() {
            const c = cov('tp');
            lienzo.classList.add('hero-arriba');
            fundir(htp.fondo, 0, 1, { duration: 620, delay: 120 });
            const tit = volador(c.h3);
            pulsar(c.ver);
            apagar([c.tope, c.caps, c.p, c.cifra, c.ver, c.regla], { duration: 220 });
            anim(c.cinta, [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-110px)' }], { duration: 700, easing: SE_VA, fill: 'forwards' });
            fundir(c.ventana, 0, 0, { duration: 1 });
            anim(htp.ventana, [
                { left: '612px', top: '180px', width: '796px', height: '619px', transform: 'translateY(0px) rotateX(0deg) scale(1)', borderRadius: '12px', boxShadow: '0 50px 90px -40px rgba(0,0,0,0.8)' },
                { left: '0px', top: '0px', width: '1440px', height: '900px', transform: 'translateY(324px) rotateX(38deg) scale(0.74)', borderRadius: '21.6px', boxShadow: '0 80px 140px -40px rgba(14,9,50,0.75)' }
            ], { duration: 1150, easing: 'cubic-bezier(0.5, 0, 0.1, 1)' });
            anim(htp.vbarra, [{ height: '30px' }, { height: '40px' }], { duration: 1150, easing: 'cubic-bezier(0.5, 0, 0.1, 1)' });
            /* Del título (Geist) a la tinta del wordmark, alineando centros y alto */
            const de = tinta(c.h3), a = union(htp.letras.map(caja));
            const s = a.h / de.h, t0 = caja(tit);
            const dx = (a.x + a.w / 2) - (t0.x + (de.x - t0.x + de.w / 2) * s), dy = a.y - (t0.y + (de.y - t0.y) * s);
            anim(tit, [{ transform: 'translate(0px, 0px) scale(1)' }, { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${s.toFixed(4)})` }], { duration: 760, delay: 40, easing: 'cubic-bezier(0.6, 0, 0.15, 1)' });
            fundir(tit, 1, 0, { duration: 260, delay: 540, fill: 'forwards' });
            htp.letras.forEach((g, i) => anim(g, [{ opacity: 0, transform: 'translateY(16px) scale(0.96)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 620, delay: 480 + i * 45, easing: SALE }));
            tpEntra({ barra: 650, mono: 650, letras: null, p: 760, link: 860, pista: 1400 });
        }
    });

    /* --- 11. TAP IN 2 · A TRAVÉS DE LA CINTA --- */
    /* La cámara se lanza hacia un "tap in" impreso: lo centra, lo endereza y se acerca hasta que la cinta llena la
       pantalla. Ahí cambia de página; la banda se cierra en una línea y el impreso, ya wordmark, baja a su tamaño */
    PASOS.tp.push({
        nombre: 'A través de la cinta', dur: '1,6 s', recomendada: true,
        uno: 'La cámara entra en un "tap in" de la cinta y sale con el wordmark.',
        idea: 'La cámara se lanza hacia uno de los "tap in" impresos en la cinta: lo centra, lo endereza y se acerca hasta que la cinta llena la pantalla. Ahí está el caso: la banda se cierra como una línea y el impreso, ya convertido en wordmark, se asienta en su lugar.',
        relacion: 'La cinta es la firma de la portada y lo que imprime es justo el nombre que el hero pone en grande. El paso une las dos piezas más reconocibles de la marca.',
        construye: 'Acercamiento en el home (transform sobre el SVG, unos 750 ms) hasta que la pantalla queda cubierta por la cinta; se navega con la pantalla tapada y el caso abre desde ese mismo cuadro. Igual en todos los navegadores.',
        async correr() {
            const c = cov('tp'), svg = c.cinta;
            svg.pauseAnimations();
            /* El impreso más cercano al centro izquierdo de la pantalla, entero a la vista */
            const m = svg.getScreenCTM(), l = lienzo.getBoundingClientRect();
            const aL = pt => ({ x: (m.a * pt.x + m.c * pt.y + m.e - l.left) / k, y: (m.b * pt.x + m.d * pt.y + m.f - l.top) / k });
            const imps = $$('.impreso', svg).map(t => {
                const nn = t.getNumberOfChars(), i0 = aL(t.getStartPositionOfChar(0)), i1 = aL(t.getEndPositionOfChar(nn - 1));
                const ang = Math.atan2(i1.y - i0.y, i1.x - i0.x), largo = Math.hypot(i1.x - i0.x, i1.y - i0.y);
                /* Las posiciones caen sobre el trazo de la cinta; el centro de la tinta queda 0,42 unidades debajo */
                const baja = 0.42 * 10;
                return { ang, largo, cx: (i0.x + i1.x) / 2 - Math.sin(ang) * baja, cy: (i0.y + i1.y) / 2 + Math.cos(ang) * baja, x0: Math.min(i0.x, i1.x), x1: Math.max(i0.x, i1.x) };
            }).filter(o => o.x0 > 80 && o.x1 < 1180).sort((p, q) => Math.hypot(p.cx - 520, p.cy - 300) - Math.hypot(q.cx - 520, q.cy - 300));
            const imp = imps[0], Z = 12.5, C = { x: W / 2, y: H / 2 }, deg = imp.ang * 180 / Math.PI;
            estilo(svg, { transformOrigin: '0 0' });
            const cuadros = Array.from({ length: 25 }, (_, i) => {
                const u = i / 24, z = Math.pow(Z, u);
                return { transform: `translate(${lerp(imp.cx, C.x, u).toFixed(2)}px, ${lerp(imp.cy, C.y, u).toFixed(2)}px) rotate(${(-deg * u).toFixed(3)}deg) scale(${z.toFixed(4)}) translate(${(-imp.cx).toFixed(2)}px, ${(-imp.cy).toFixed(2)}px)` };
            });
            pulsar(c.ver);
            apagar([c.tope, c.caps, c.txt, c.regla], { duration: 220 });
            anim(c.ventana, [{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(140px)' }], { duration: 420, easing: SE_VA, fill: 'forwards' });
            const zoom = anim(svg, cuadros, { duration: 820, delay: 40, easing: 'cubic-bezier(0.62, 0, 0.38, 1)' });
            await zoom.finished.catch(() => {});
            if (!zoom.playState || zoom.playState === 'idle') return;
            /* Cambio de página: la banda que llena la pantalla es la misma que dibuja el caso al abrir */
            lienzo.classList.add('hero-arriba');
            /* La banda reproduce las capas de la cinta (cuerpo, volumen y brillo) con su eje 0,42 unidades sobre el impreso */
            const u = 10 * Z, eje = H / 2 - 0.42 * u, banda = document.createElement('div');
            const capa = (col, a, b) => `${col} ${(eje + a * u).toFixed(1)}px, ${col} ${(eje + b * u).toFixed(1)}px`;
            banda.className = 'banda';
            banda.style.background = `linear-gradient(180deg, ${capa('#4A3CAE', -60, -2.8)}, ${capa('#6253D5', -2.8, -0.8)}, ${capa('#7D6FE4', -0.8, 0.8)}, ${capa('#6253D5', 0.8, 2.8)}, ${capa('#4A3CAE', 2.8, 60)})`;
            banda.classList.add('fx-temp'); htp.r.appendChild(banda);
            /* El wordmark parte del tamaño y lugar del impreso y baja a su lugar */
            /* Al final del acercamiento el impreso queda derecho y centrado; su ancho de tinta es el largo de la línea base
               (menos los márgenes laterales de las letras), así el wordmark parte del mismo tamaño y lugar */
            const a = union(htp.letras.map(caja)), ac = centro(a), s0 = (imp.largo * Z * 0.97) / a.w;
            estilo(htp.h2, { transformOrigin: `${(ac.x - caja(htp.h2).x).toFixed(1)}px ${(ac.y - caja(htp.h2).y).toFixed(1)}px` });
            htp.letras.forEach(g => fundir(g, 1, 1, { duration: 1 }));
            anim(htp.h2, [{ transform: `translate(${(C.x - ac.x).toFixed(1)}px, ${(C.y - ac.y).toFixed(1)}px) scale(${s0.toFixed(3)})` }, { transform: 'translate(0px, 0px) scale(1)' }], { duration: 950, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
            anim(banda, [{ transform: 'translateY(0px) scaleY(1)', opacity: 1 }, { transform: `translateY(${(ac.y - C.y).toFixed(1)}px) scaleY(0.004)`, opacity: 0.6, offset: 0.85 }, { transform: `translateY(${(ac.y - C.y).toFixed(1)}px) scaleY(0)`, opacity: 0 }], { duration: 820, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' });
            fundir(c.r, 0, 0, { duration: 1 });
            tpEntra({ barra: 500, mono: 520, letras: null, p: 620, link: 720, pista: 1300, ventana: 260 });
        }
    });

    /* --- 12. TAP IN 3 · TAP --- */
    /* El clic es un tap: desde el punto donde se toca se abre una onda que recorta el hero; cuando el borde llega al
       punto de la i, la i responde con el tap que ya tiene en el caso */
    PASOS.tp.push({
        nombre: 'Tap', dur: '1,0 s',
        uno: 'Desde donde haces clic se abre una onda que descubre el caso.',
        idea: 'El clic en Ver caso es un tap. Desde el punto exacto donde tocas sale una onda con dos ecos y, dentro de ella, aparece el caso. Cuando la onda alcanza el punto de la i del wordmark, la i responde con su propio tap.',
        relacion: 'Tap In es un gesto: acercar la credencial y que pase algo. La transición es ese gesto, y el punto de la i (que en el hero ya hace tap al pasar el mouse) cierra la rima.',
        construye: 'View Transitions con un recorte circular sobre la página nueva desde la coordenada del clic (se guarda al hacer clic). Es el más liviano de construir; en Firefox, fundido.',
        async correr(o = {}) {
            const c = cov('tp'), vb = caja(c.ver);
            const pt = o.punto || { x: vb.x + vb.w * 0.4, y: vb.y + vb.h / 2 };
            const R = Math.hypot(Math.max(pt.x, W - pt.x), Math.max(pt.y, H - pt.y)) + 40;
            const curva = [0.55, 0, 0.12, 1], RET = 90, DUR = 1000;
            lienzo.classList.add('hero-arriba');
            pulsar(c.ver, 0.9);
            anim(htp.r, [{ clipPath: `circle(0px at ${pt.x}px ${pt.y}px)` }, { clipPath: `circle(${R.toFixed(0)}px at ${pt.x}px ${pt.y}px)` }], { duration: DUR, delay: RET, easing: `cubic-bezier(${curva})` });
            [0, 130, 260].forEach((d, i) => {
                const o2 = document.createElement('i'); o2.className = 'onda';
                Object.assign(o2.style, { left: pt.x + 'px', top: pt.y + 'px' }); fx.appendChild(o2);
                const r = i ? R * (0.8 - i * 0.12) : R;
                anim(o2, [{ width: '0px', height: '0px', opacity: i ? 0.5 : 0.9 }, { width: 2 * r + 'px', height: 2 * r + 'px', opacity: 0 }], { duration: DUR + i * 120, delay: RET + d, easing: `cubic-bezier(${curva})` });
            });
            anim(htp.mundo, [{ transform: 'translateY(70px)' }, { transform: 'translateY(0)' }], { duration: 1300, delay: RET, easing: SALE });
            /* El borde de la onda llega a la i: se busca en la curva cuándo el radio alcanza esa distancia */
            const punto = centro(caja($('.tp-wm-punto', htp.wm))), d = Math.hypot(punto.x - pt.x, punto.y - pt.y);
            const ev = bezier(...curva); let t = 0; while (t < 1 && ev(t) * R < d) t += 0.01;
            luego(RET + t * DUR, () => { htp.wm.classList.remove('tap'); void htp.wm.getBoundingClientRect(); htp.wm.classList.add('tap'); ritmo(htp.wm); });
            tpEntra({ barra: 400, mono: 260, letras: 200, p: 520, link: 620, pista: 1300 });
        }
    });

    /* --- 13. TAP IN 4 · TRES CREDENCIALES --- */
    /* Las credenciales de los tres productos suben una sobre otra y tapan la portada; se van hacia arriba en orden
       inverso y dejan el caso */
    const NFC = '<svg class="cred-nfc" viewBox="0 0 24 24"><path d="M7 8.5a5 5 0 0 1 0 7"/><path d="M11 5.5a9.5 9.5 0 0 1 0 13"/><path d="M15 2.5a14 14 0 0 1 0 19"/></svg>';
    PASOS.tp.push({
        nombre: 'Tres credenciales', dur: '1,5 s',
        uno: 'Las credenciales de Campus, Connect y Health tapan la portada y dejan el caso.',
        idea: 'Las tres credenciales de la marca (Health, Connect y Campus) suben desde abajo una sobre otra, apenas giradas, hasta tapar la portada. Se van hacia arriba en orden inverso y, detrás de la última, está el caso.',
        relacion: 'Son los tres productos de Tap In: los mismos de la cinta lejana de la portada y de su capítulo Marca. La credencial es el objeto real de la marca.',
        construye: 'Telón entre páginas: sube en el home, se navega tapado y baja en el caso. Funciona igual en todos los navegadores, pero es el recurso más conocido de los cuatro.',
        async correr() {
            const c = cov('tp');
            const wm = $('.tp-txt svg', htp.r).outerHTML.replace('<svg', '<svg class="cred-wm"');
            const datos = [['Health', '#9B8EF0', '03'], ['Connect', '#6B5CE7', '02'], ['Campus', '#4A3CAE', '01']];
            const cs = datos.map(([n, col, num]) => {
                const d = document.createElement('div'); d.className = 'cred'; d.style.background = col;
                d.innerHTML = `${wm}${NFC}<span class="cred-nom">${n}</span><span class="cred-num">Credencial · ${num}</span>`;
                d.style.transform = 'translateY(115%)'; fx.appendChild(d); return d;
            });
            pulsar(c.ver);
            cs.forEach((d, i) => anim(d, [
                { transform: 'translateY(115%) rotate(-7deg)', offset: 0, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' },
                { transform: 'translateY(0%) rotate(0deg)', offset: 0.42 },
                { transform: 'translateY(0%) rotate(0deg)', offset: 0.42 + (2 - i) * 0.035 + 0.06, easing: 'cubic-bezier(0.7, 0, 0.2, 1)' },
                { transform: 'translateY(-118%) rotate(4deg)', offset: 1 }
            ], { duration: 1500 + (2 - i) * 80, delay: 40 + i * 110, easing: 'linear' }));
            luego(980, () => { fundir(c.r, 0, 0, { duration: 1 }); lienzo.classList.add('hero-arriba'); });
            tpEntra({ fondo: 980, ventana: 1150, barra: 1300, mono: 1200, letras: 1250, p: 1600, link: 1700, pista: 2400 });
        }
    });

    /* =======================================================
       PANEL, MANDOS Y REINICIO
       ======================================================= */

    /* --- 14. REINICIO A LA PORTADA --- */
    let caso = 'lf', idx = 0;
    const limpiar = () => {
        turno++;
        vivas.forEach(a => a.cancel()); vivas = [];
        fx.innerHTML = '';
        $$('.fx-temp').forEach(el => el.remove());
        tocados.forEach(el => el.removeAttribute('style')); tocados.clear();
        lienzo.classList.remove('hero-arriba');
        hlf.logo.classList.remove('llega', 'farma-antes');
        htp.wm.classList.remove('tap');
        $$('.pt-cinta').forEach(s => s.unpauseAnimations());
        cinta.limpiar();
        cinta.preparar({ op: 0 });
    };
    const correr = (o = {}) => {
        limpiar();
        const yo = turno;
        requestAnimationFrame(() => { if (yo === turno) PASOS[caso][idx].correr(o); });
    };

    /* --- 15. PANEL --- */
    const lista = $('[data-pasos]');
    const pintarPanel = () => {
        lista.innerHTML = PASOS[caso].map((p, i) => `
            <li class="paso${i === idx ? ' on' : ''}">
                <button type="button" data-i="${i}"><span class="paso-num">0${i + 1}</span><span class="paso-nom">${p.nombre}${p.recomendada ? '<span class="paso-tag">Recomendado</span>' : ''}</span><span class="paso-dur">${p.dur}</span><span class="paso-uno">${p.uno}</span></button>
                <div class="paso-mas"><dl>
                    <div><dt>La idea</dt><dd>${p.idea}</dd></div>
                    <div><dt>La relación</dt><dd>${p.relacion}</dd></div>
                    <div><dt>Cómo se construye</dt><dd>${p.construye}</dd></div>
                </dl></div>
            </li>`).join('');
    };
    const elegir = (c, i, play = true) => {
        caso = c; idx = i;
        lienzo.dataset.caso = c;
        $$('[data-caso]', $('.casos')).forEach(b => b.setAttribute('aria-selected', String(b.dataset.caso === c)));
        history.replaceState(null, '', `#${c}-${i + 1}`);
        pintarPanel();
        limpiar();
        if (play) { const yo = turno; setTimeout(() => { if (yo === turno) correr(); }, 650); }
    };
    lista.addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) elegir(caso, +b.dataset.i); });
    $('.casos').addEventListener('click', e => { const b = e.target.closest('[data-caso]'); if (b && b.dataset.caso !== caso) elegir(b.dataset.caso, 0); });

    /* --- 16. MANDOS Y TECLADO --- */
    const btnLento = $('[data-lento]');
    const alternarLento = () => { lento = !lento; btnLento.setAttribute('aria-pressed', String(lento)); };
    $('[data-reproducir]').addEventListener('click', () => correr());
    btnLento.addEventListener('click', alternarLento);
    $$('[data-ver]').forEach(b => b.addEventListener('click', e => {
        const l = lienzo.getBoundingClientRect();
        correr({ punto: { x: (e.clientX - l.left) / k, y: (e.clientY - l.top) / k } });
    }));
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.code === 'Space') { e.preventDefault(); correr(); }
        else if (e.key === 'l' || e.key === 'L') alternarLento();
        else if (e.key === 'c' || e.key === 'C') elegir(caso === 'lf' ? 'tp' : 'lf', 0);
        else if (/^[1-4]$/.test(e.key)) elegir(caso, +e.key - 1);
    });

    /* --- 17. ARRANQUE (EL HASH ELIGE CASO Y PASO: #tp-2) --- */
    const h = location.hash.match(/^#(lf|tp)-([1-4])$/);
    elegir(h ? h[1] : 'lf', h ? +h[2] - 1 : 0, false);
})();
/* =======================================================
   FIN JS · PASOS DE LA PORTADA AL CASO
   ======================================================= */
