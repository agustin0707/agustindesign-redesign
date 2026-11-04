/* =======================================================
   INICIO JS · CASO LLEGÓ FARMA (.lf-)
   ======================================================= */
/* Lo propio del caso, antes del motor común (caso-motor.js): el siguiente proyecto, la carga del hero y las escenas
   que dibujan sus piezas con el scroll. Cada escena recibe su sección y devuelve una función de --p (0 a 1) */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const svg = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
    const pad = n => String(n).padStart(2, '0');

    /* --- 1. SIGUIENTE PROYECTO --- */
    window.CASO = {
        nombre: 'Llegó Farma',
        siguiente: { id: 'tapin', nombre: 'Tap In', numero: '02', bajada: 'De la cafetería del campus a la plataforma del colegio.', tinte: '#110E22', url: 'tapin.html' }
    };

    /* --- 2. HERO: LA TRAMA DE PUNTOS SE VUELVE EL ISOTIPO --- */
    /* Una grilla de 9 x 9 puntos con el paso del isotipo Nodos (11 unidades). Al cargar se encienden desde el centro;
       después los cinco de la cruz crecen hasta el tamaño de sus nodos, dos conectores los unen y queda el isotipo */
    const cruz = document.querySelector('[data-cruz]');
    if (cruz) {
        const lienzo = cruz.querySelector('svg');
        lienzo.setAttribute('viewBox', '0 0 88 88');
        const claves = ['44,11', '77,44', '11,44', '44,77', '44,44'];
        for (let f = 0; f < 9; f++) for (let c = 0; c < 9; c++) {
            const x = c * 11, y = f * 11, k = claves.indexOf(`${x},${y}`);
            const punto = svg('circle', { cx: x, cy: y, r: 1.6 });
            punto.style.setProperty('--d', Math.round(Math.hypot(x - 44, y - 44) * 9) + 'ms');
            if (k >= 0) { punto.classList.add('clave'); punto.style.setProperty('--k', k * 110 + 'ms'); }
            lienzo.appendChild(punto);
        }
        /* Los conectores del isotipo: del nodo izquierdo al centro y del centro al inferior */
        lienzo.appendChild(svg('rect', { x: 11, y: 39, width: 33, height: 10, style: '--o:right center' }));
        lienzo.appendChild(svg('rect', { x: 39, y: 44, width: 10, height: 33, style: '--o:center top' }));
    }
    const arrancar = () => {
        document.body.classList.add('lf-listo');
        if (!cruz) return;
        if (quieto) { cruz.classList.add('forma', 'final'); return; }
        setTimeout(() => cruz.classList.add('forma'), 1500);
        setTimeout(() => cruz.classList.add('final'), 3000);
    };
    if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(arrancar));
    else requestAnimationFrame(arrancar);

    /* --- 3. ESCENAS PROPIAS --- */
    window.CASO_ESCENAS = {
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

        /* Manual: el encabezado de la lámina nombra la regla; la retícula alterna sola entre sin y con cortes */
        manual: el => {
            const pag = el.querySelector('[data-man-pag]'), nombres = ['Retícula', 'Grano', 'Tipografía', 'Nodos'];
            const ret = el.querySelector('.lf-r-reticula'), pares = [...ret.querySelectorAll('.lf-r-par span')];
            let reloj = null, actual = -1;
            const alternar = () => { const sin = ret.classList.toggle('sin'); pares.forEach((s, i) => s.classList.toggle('on', i === (sin ? 0 : 1))); };
            return p => {
                const k = Math.min(Math.floor(p * 4), 3), activa = k === 0 && p > 0 && p < 1 && !quieto;
                if (activa && !reloj) reloj = setInterval(alternar, 1600);
                if (!activa && reloj) { clearInterval(reloj); reloj = null; }
                if (k === actual) return;
                actual = k; pag.textContent = nombres[k];
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
   FIN JS · CASO LLEGÓ FARMA (.lf-)
   ======================================================= */
