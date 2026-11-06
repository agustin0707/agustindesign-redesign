/* =======================================================
   INICIO JS · SEIS RUTAS PARA EL PASO AL RESUMEN (.rt)
   ======================================================= */
/* Va después de la copia de llego.js y antes del motor. En las seis, la ventana en vivo se vuelve la línea del
   proyecto: cambia cómo se cierra y cómo llega a la ruta. En cada cuadro la ruta activa recibe el estado del paso:
   s, cuánto subió el resumen (0 a 1, mientras el hero se vuelve papel); b, pantallas desde el aterrizaje de la ventana;
   pr, el avance del resumen; la caja de la ventana y la de la ruta. Después de calzar, el avance por los seis hitos es
   continuo: la línea se llena entre un hito y el siguiente al ritmo del scroll */
(function () {
    const h = document.querySelector('.lf-h'), res = document.querySelector('.lf-res');
    if (!h || !res) return;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const html = document.documentElement, fijo = h.querySelector('.lf-h-fijo'), vivo = h.querySelector('.lf-h-vivo');
    const ruta = res.querySelector('[data-ruta]'), nodos = [...ruta.querySelectorAll('.lf-hitos li')], N = nodos.length;
    const destino = res.querySelector('[data-destino]'), copia = destino.querySelector('iframe'), est = res.querySelector('[data-destino-est]');
    const red = ruta.querySelector('[data-red]'), redBase = red.querySelector('.rt-red-base'), redAv = red.querySelector('.rt-red-avance');
    const SITIO = '../works/sitios/llego/index.html';
    document.body.appendChild(vivo); vivo.classList.add('rt-fuera');
    /* Las seis rutas usan la misma pista: el resumen empieza a subir unas 400 px después del aterrizaje */
    h.style.setProperty('--pista', '400');

    /* --- 1. LA LÍNEA EN VUELO --- */
    /* Un trazo fijo de 1 px, en seis tramos con su nodo al centro: es lo que queda de la ventana mientras viaja a la
       ruta. Al calzar, la ruta del resumen lo reemplaza en el mismo lugar */
    const linea = document.createElement('div');
    linea.className = 'rt-linea'; linea.setAttribute('aria-hidden', 'true'); linea.innerHTML = '<i></i>'.repeat(N);
    document.body.appendChild(linea);
    const tramos = [...linea.children];
    const trazar = (x, y, w, a) => {
        linea.style.setProperty('--lx', x.toFixed(2) + 'px'); linea.style.setProperty('--ly', y.toFixed(2) + 'px');
        linea.style.setProperty('--lw', Math.max(w, 0).toFixed(2) + 'px'); linea.style.setProperty('--la', a.toFixed(3));
    };
    const tramo = (i, o, n) => { tramos[i].style.setProperty('--o', o.toFixed(3)); tramos[i].style.setProperty('--n', n.toFixed(3)); };

    /* --- 2. AYUDAS --- */
    const caja = el => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: parseFloat(el.style.width), h: parseFloat(el.style.height) });
    const lerp = (a, b, k) => a + (b - a) * k;
    /* x del nodo i sobre la ruta: seis tramos iguales, cada nodo al centro del suyo */
    const nx = (r, i) => r.left + r.width * (i + 0.5) / N;
    /* De la ventana a la línea: de su eje horizontal (centro) a la ruta, estirándose a su ancho */
    const llevar = (b, r, y0, m, a) => trazar(lerp(b.x, r.left, m), lerp(y0, r.top + 6.5, m), lerp(b.w, r.width, m), a);
    /* La ventana se cierra en un punto turquesa (el nodo central del isotipo) y ese punto viaja al primer hito */
    const cerrarEnPunto = (b, r, k, mv) => {
        vivo.style.setProperty('--rt-ct', ((b.h - 14) / 2 * k).toFixed(2) + 'px');
        vivo.style.setProperty('--rt-cl', ((b.w - 14) / 2 * k).toFixed(2) + 'px');
        vivo.style.setProperty('--rt-cr', (7 * k).toFixed(2) + 'px');
        vivo.style.setProperty('--rt-k', k.toFixed(3));
        const dx = (nx(r, 0) - (b.x + b.w / 2)) * mv, dy = (r.top + 6.5 + punto0() - (b.y + b.h / 2)) * mv;
        vivo.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    };
    let alturas = null;
    const punto0 = () => (alturas ? alturas[0] : 0);
    const encender = f => nodos.forEach((li, i) => li.classList.toggle('rt-on', f(i)));
    const copiar = (f, marco, lw) => {
        const e = marco.clientWidth / lw, clave = `${lw}x${marco.clientWidth}x${marco.clientHeight}`;
        if (f.dataset.medida === clave) return;
        f.dataset.medida = clave;
        Object.assign(f.style, { width: lw + 'px', height: (marco.clientHeight / e).toFixed(1) + 'px', scale: e.toFixed(4) });
        if (!f.getAttribute('src')) f.src = SITIO;
    };

    /* --- 3. EL REPARTO: UNA RUTA CON GIROS POR LA RETÍCULA --- */
    /* Los hitos a distintas alturas y entre uno y otro un giro en ángulo recto a mitad de camino, como calles vistas
       desde arriba. Se mide el largo hasta cada nodo para llenar la ruta y mover el mensajero por ella */
    const DESVIOS = [0, -36, 0, 30, -18, 0];
    let largos = [], total = 1;
    const armarRed = () => {
        const r = ruta.getBoundingClientRect(), W = r.width, y0 = 6.5;
        const P = DESVIOS.map((d, i) => [W * (i + 0.5) / N, y0 + d]);
        let d = `M${P[0][0].toFixed(1)} ${P[0][1]}`, L = 0;
        largos = [0];
        for (let i = 1; i < N; i++) {
            const mx = (P[i - 1][0] + P[i][0]) / 2;
            d += ` H${mx.toFixed(1)} V${P[i][1]} H${P[i][0].toFixed(1)}`;
            L += P[i][0] - P[i - 1][0] + Math.abs(P[i][1] - P[i - 1][1]);
            largos.push(L);
        }
        total = L;
        redBase.setAttribute('d', d); redAv.setAttribute('d', d);
        red.setAttribute('viewBox', `0 0 ${W.toFixed(1)} ${r.height.toFixed(1)}`);
        red.style.setProperty('--rt-total', total.toFixed(1));
    };

    /* --- 4. LAS SEIS RUTAS --- */
    const R = {
        horizonte: {
            desc: 'La ventana se acuesta sobre el horizonte de la cinta hasta quedar de canto: lo que queda de ella es la línea del proyecto.',
            cuadro: (s, b, r) => {
                /* Gira sobre su eje horizontal hasta 90°: de canto, el sitio es una línea a la altura de su centro */
                const a = curva(fijar((s.s - 0.04) / 0.42)), m = curva(fijar((s.s - 0.46) / 0.26));
                vivo.style.transform = `perspective(1600px) rotateX(${(a * 90).toFixed(3)}deg)`;
                vivo.style.setProperty('--rt-k', a.toFixed(3));
                html.classList.toggle('rt-ida', a > 0.999);
                llevar(b, r, b.y + b.h / 2, m, m < 1 ? fijar((a - 0.75) / 0.2) : 0);
                return m > 0.999;
            }
        },
        escaneo: {
            desc: 'Una línea lee el sitio de arriba abajo, como el escaneo de un bulto al entregarlo, y lo que leyó sube a ser la ruta.',
            cuadro: (s, b, r) => {
                /* La lectura va a velocidad pareja, como una máquina; lo leído se borra sobre la línea */
                const sc = fijar((s.s - 0.04) / 0.4), m = curva(fijar((s.s - 0.46) / 0.26));
                vivo.style.setProperty('--rt-sc', sc.toFixed(4));
                html.classList.toggle('rt-ida', sc > 0.999);
                if (m <= 0) trazar(b.x, b.y + b.h * sc, b.w, sc > 0 ? 1 : 0);
                else llevar(b, r, b.y + b.h, m, m < 1 ? 1 : 0);
                linea.dataset.t = m > 0 ? 'Leído · llegofarma.cl' : `Leyendo llegofarma.cl · ${Math.round(sc * 100)} %`;
                linea.style.setProperty('--lt', fijar(1 - m * 2).toFixed(3));
                return m > 0.999;
            }
        },
        tramos: {
            desc: 'El sitio se cierra en seis tramos, uno por hito, de izquierda a derecha; cada tramo deja su nodo en la línea.',
            cuadro: (s, b, r) => {
                /* Un recorte con seis columnas que se cierran hacia el centro, desfasadas; al cerrarse, cada una es un
                   tramo turquesa con su nodo */
                const c = tramos.map((_, i) => curva(fijar((s.s - 0.04 - i * 0.05) / 0.24)));
                const top = c.map(k => k * (b.h / 2 - 0.5)), w = b.w / N, pts = [];
                c.forEach((_, i) => { pts.push(`${(i * w).toFixed(1)}px ${top[i].toFixed(1)}px`, `${((i + 1) * w).toFixed(1)}px ${top[i].toFixed(1)}px`); });
                for (let i = N - 1; i >= 0; i--) pts.push(`${((i + 1) * w).toFixed(1)}px ${(b.h - top[i]).toFixed(1)}px`, `${(i * w).toFixed(1)}px ${(b.h - top[i]).toFixed(1)}px`);
                vivo.style.clipPath = `polygon(${pts.join(', ')})`;
                c.forEach((k, i) => { const o = fijar((k - 0.8) / 0.2); tramo(i, o, o); });
                const m = curva(fijar((s.s - 0.56) / 0.2));
                html.classList.toggle('rt-ida', c[N - 1] > 0.999);
                llevar(b, r, b.y + b.h / 2, m, c[0] > 0.8 && m < 1 ? 1 : 0);
                return m > 0.999;
            },
            salir: () => { vivo.style.clipPath = ''; tramos.forEach((_, i) => tramo(i, 1, 0)); }
        },
        mensajero: {
            desc: 'El sitio se cierra en el nodo central del isotipo; el brazo se estira en la ruta y el mensajero la recorre hito a hito.',
            cuadro: (s, b, r) => {
                const k = curva(fijar((s.s - 0.04) / 0.36)), mv = curva(fijar((s.s - 0.4) / 0.18)), g = curva(fijar((s.s - 0.56) / 0.2));
                cerrarEnPunto(b, r, k, mv);
                html.classList.toggle('rt-ida', g > 0.999);
                /* El brazo crece desde el primer hito hacia los dos lados y enciende los nodos que alcanza */
                const x0 = nx(r, 0), izq = x0 - (x0 - r.left) * g, der = x0 + (r.right - x0) * g;
                trazar(izq, r.top + 6.5, der - izq, g > 0 && g < 1 ? 1 : 0);
                return g > 0.999 ? true : (encender(i => nx(r, i) <= der + 1 && g > 0), false);
            }
        },
        destino: {
            desc: 'El sitio queda al final de la ruta como su destino, y la línea se traza hacia atrás, del destino al diagnóstico.',
            cuadro: (s, b, r) => {
                if (s.b > -0.5) copiar(copia, destino, parseFloat(vivo.style.getPropertyValue('--iw')) || 1440);
                const k = curva(fijar((s.s - 0.04) / 0.46)), d = destino.getBoundingClientRect();
                const sc = 1 + (d.width / b.w - 1) * k;
                vivo.style.transform = `translate3d(${((d.left - b.x) * k).toFixed(2)}px, ${((d.top - b.y) * k).toFixed(2)}px, 0) scale(${sc.toFixed(5)})`;
                vivo.style.setProperty('--s', sc.toFixed(4)); vivo.style.setProperty('--rt-k', k.toFixed(3));
                vivo.style.setProperty('--alto', (Math.sin(Math.PI * k) / sc).toFixed(3));
                html.classList.toggle('rt-ida', s.pr > 0.98 || s.rr.bottom < s.H * 0.98);
                /* Del último hito hacia el primero (y el remate corto a la derecha) */
                const g = curva(fijar((s.s - 0.42) / 0.3)), x5 = nx(r, N - 1), izq = x5 - (x5 - r.left) * g, der = x5 + (r.right - x5) * g;
                ruta.style.setProperty('--rt-g', g.toFixed(3));
                trazar(izq, r.top + 6.5, der - izq, g > 0 && g < 1 ? 1 : 0);
                const e = s.q >= N - 1;
                if (e !== entregado) {
                    entregado = e; destino.parentElement.classList.toggle('entregado', e); est.textContent = e ? 'Entregado · 20 oct' : 'Destino';
                    est.classList.remove('cambia'); void est.offsetWidth; est.classList.add('cambia');
                }
                return g > 0.999 ? true : (encender(i => nx(r, i) >= izq - 1 && g > 0), false);
            }
        },
        reparto: {
            desc: 'El sitio se cierra en un punto de partida y la ruta se dibuja por la retícula como un reparto, con un giro entre hito e hito.',
            entrar: () => { alturas = DESVIOS; nodos.forEach((li, i) => li.style.setProperty('--rt-y', DESVIOS[i] + 'px')); armarRed(); },
            salir: () => { alturas = null; nodos.forEach(li => li.style.removeProperty('--rt-y')); },
            cuadro: (s, b, r) => {
                const k = curva(fijar((s.s - 0.04) / 0.36)), mv = curva(fijar((s.s - 0.4) / 0.18)), g = curva(fijar((s.s - 0.56) / 0.24));
                cerrarEnPunto(b, r, k, mv);
                html.classList.toggle('rt-ida', g > 0.02);
                red.style.setProperty('--rt-g', g.toFixed(4));
                trazar(0, 0, 0, 0);
                return g > 0.999 ? true : (encender(i => largos[i] <= g * total + 1 && g > 0), false);
            }
        }
    };
    const ORDEN = Object.keys(R);
    let entregado = false;

    /* --- 5. EL CUADRO COMÚN --- */
    let actual = null;
    const cuadro = () => {
        if (!actual) return;
        const H = window.innerHeight, rr = res.getBoundingClientRect(), L = h.offsetTop + H * 1.8 * 0.85;
        const s = { H, rr, s: fijar((H - rr.top) / H), b: (window.scrollY - L) / H, pr: fijar(-rr.top / (rr.height - H)) };
        /* q: el avance continuo por los hitos (0 a 5), con el mismo reparto de la pista que usa la escena del resumen */
        s.q = fijar((s.pr - 0.04) / 0.9) * N; s.q = Math.min(s.q, N - 1);
        fijo.style.setProperty('--hund', s.s.toFixed(4)); vivo.style.setProperty('--rt-s', s.s.toFixed(4));
        res.style.setProperty('--rt-falta', Math.max(rr.top, 0).toFixed(1));
        res.style.setProperty('--rt-t', curva(fijar((s.s - 0.72) / 0.28)).toFixed(4));
        res.classList.toggle('rt-opaco', s.s > 0.999);
        const listo = R[actual].cuadro(s, caja(vivo), ruta.getBoundingClientRect());
        res.classList.toggle('rt-trazo', listo);
        if (listo) encender(i => true);
        /* La línea se llena hasta el centro del hito actual y sigue hacia el próximo al ritmo del scroll */
        const f = (s.q + 0.5) / N;
        ruta.style.setProperty('--rt-f', f.toFixed(4));
        if (actual === 'reparto' && largos.length) {
            const i = Math.floor(s.q), lf = i >= N - 1 ? largos[N - 1] : lerp(largos[i], largos[i + 1], s.q - i);
            red.style.setProperty('--rt-lf', lf.toFixed(1));
            const p = redAv.getPointAtLength(lf);
            ruta.style.setProperty('--rt-mx', p.x.toFixed(1) + 'px'); ruta.style.setProperty('--rt-my', p.y.toFixed(1) + 'px');
        }
    };

    /* --- 6. CAMBIAR DE RUTA --- */
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const limpiar = () => {
        vivo.style.transform = '';
        ['--s', '--alto', '--rt-k', '--rt-sc', '--rt-ct', '--rt-cl', '--rt-cr'].forEach(p => vivo.style.removeProperty(p));
        html.classList.remove('rt-ida'); res.classList.remove('rt-trazo', 'rt-opaco');
        trazar(0, 0, 0, 0); tramos.forEach((_, i) => tramo(i, 1, 0)); encender(() => false);
        entregado = false; destino.parentElement.classList.remove('entregado'); est.textContent = 'Destino';
    };
    const desdeElZoom = () => window.scrollTo({ top: Math.round(h.offsetTop + window.innerHeight * 1.8 * 0.4), behavior: 'instant' });
    const activar = (nombre, volver) => {
        if (!R[nombre]) nombre = 'horizonte';
        if (actual && R[actual].salir) R[actual].salir();
        limpiar();
        ORDEN.forEach(k => html.classList.toggle('rt-v-' + k, k === nombre));
        actual = nombre;
        if (R[nombre].entrar) R[nombre].entrar();
        desc.textContent = R[nombre].desc;
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === nombre)));
        try { localStorage.setItem('rt-ruta', nombre); } catch (e) { /* sin almacenamiento, se parte en Horizonte */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        history.replaceState(null, '', location.pathname + location.search + '#' + nombre);
        if (volver) requestAnimationFrame(desdeElZoom);
    };
    botones.forEach(x => x.addEventListener('click', () => activar(x.dataset.v, true)));
    document.querySelector('[data-otra]').addEventListener('click', desdeElZoom);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const i = +e.key;
        if (i >= 1 && i <= ORDEN.length) activar(ORDEN[i - 1], true);
        else if (e.key === 'r' || e.key === 'R') desdeElZoom();
    });
    window.addEventListener('resize', () => { if (actual === 'reparto') armarRed(); });
    let guardada = null;
    try { guardada = localStorage.getItem('rt-ruta'); } catch (e) { /* sin almacenamiento */ }
    activar(location.hash.slice(1) || guardada || 'horizonte', false);

    /* --- 7. EL BUCLE, SOLO CON EL PASO A LA VISTA --- */
    const vistos = new Set();
    let corre = false;
    const bucle = () => { if (!vistos.size) { corre = false; return; } cuadro(); requestAnimationFrame(bucle); };
    const io = new IntersectionObserver(entradas => {
        entradas.forEach(en => (en.isIntersecting ? vistos.add(en.target) : vistos.delete(en.target)));
        if (vistos.size && !corre) { corre = true; requestAnimationFrame(bucle); }
        if (!vistos.size) cuadro();
    });
    io.observe(h); io.observe(res);
})();
/* =======================================================
   FIN JS · SEIS RUTAS PARA EL PASO AL RESUMEN (.rt)
   ======================================================= */
