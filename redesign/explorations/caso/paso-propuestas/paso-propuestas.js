/* =======================================================
   INICIO JS · SEIS PROPUESTAS PARA EL PASO AL RESUMEN (.pv)
   ======================================================= */
/* Va después de la copia de llego.js (que ya tomó sus referencias a la ventana) y antes del motor. Saca la ventana en
   vivo del hero para que pueda quedar sobre o bajo el resumen, y en cada cuadro le pasa a la propuesta activa el estado
   del paso: b, pantallas desde que la ventana aterrizó; sube, cuánto subió el resumen (0 a 1); falta, los px que le
   faltan para llegar arriba; pr, el avance del resumen. Cada propuesta alarga la pista del hero lo que necesita */
(function () {
    const h = document.querySelector('.lf-h'), res = document.querySelector('.lf-res');
    if (!h || !res) return;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const pad = n => String(n).padStart(2, '0');
    const html = document.documentElement, fijo = h.querySelector('.lf-h-fijo'), vivo = h.querySelector('.lf-h-vivo');
    const marco = vivo.querySelector('iframe'), cab = vivo.querySelector('.lf-h-vivo-cab'), ancho = vivo.querySelector('[data-ancho]');
    const hueco = res.querySelector('[data-comp-marco]'), copia = hueco.querySelector('iframe'), est = res.querySelector('[data-comp-est]');
    const tel = res.querySelector('[data-tel-marco]'), copiaTel = tel.querySelector('iframe'), hitos = res.querySelector('.lf-hitos');
    const SITIO = '../works/sitios/llego/index.html';
    document.body.appendChild(vivo); vivo.classList.add('pv-fuera');

    /* --- 1. PIEZAS QUE AGREGAN LAS PROPUESTAS A LA VENTANA --- */
    /* La sección del one page (Recorrido), su riel de scroll y la lupa con su rótulo (Cotas) */
    const sec = document.createElement('span'); sec.className = 'pv-sec';
    cab.insertBefore(sec, cab.lastElementChild);
    const riel = document.createElement('b'); riel.className = 'pv-riel'; riel.innerHTML = '<i></i>';
    const capa = document.createElement('b'); capa.className = 'pv-capa';
    const lupa = document.createElement('b'); lupa.className = 'pv-lupa';
    const nota = document.createElement('span'); nota.className = 'pv-nota mono';
    capa.append(lupa, nota); vivo.append(riel, capa);

    /* --- 2. AYUDAS --- */
    const caja = el => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top), w: parseFloat(el.style.width), h: parseFloat(el.style.height) });
    const doc = f => { try { return f.contentDocument && f.contentDocument.body ? f.contentDocument : null; } catch (e) { return null; } };
    /* La ventana viaja de su caja a la del destino con translate y scale desde arriba a la izquierda. --s mantiene el
       borde en 1 px de pantalla y --alto le da sombra en el aire */
    const volar = (b, d, k) => {
        const s = 1 + (d.width / b.w - 1) * k, x = (d.left - b.x) * k, y = (d.top - b.y) * k;
        vivo.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
        vivo.style.setProperty('--s', s.toFixed(4));
        vivo.style.setProperty('--alto', (Math.sin(Math.PI * k) / s).toFixed(3));
        vivo.style.setProperty('--k', k.toFixed(3));
    };
    /* Una copia del sitio en un hueco del resumen toma el lugar de la ventana cuando el resumen se suelta: así nada
       movido por JS va contra el scroll. Se dibuja al ancho lógico (lw) y se escala al hueco */
    const copiar = (f, marcoHueco, lw) => {
        const e = marcoHueco.clientWidth / lw, clave = `${lw}x${marcoHueco.clientWidth}x${marcoHueco.clientHeight}`;
        if (f.dataset.medida === clave) return;
        f.dataset.medida = clave;
        Object.assign(f.style, { width: lw + 'px', height: (marcoHueco.clientHeight / e).toFixed(1) + 'px', scale: e.toFixed(4) });
        if (!f.getAttribute('src')) f.src = SITIO;
    };

    /* --- 3. LAS PROPUESTAS --- */
    /* grupo: hoja (el resumen sube opaco y tapa la ventana) o funde (el hero se vuelve papel y la ventana llega a un
       lugar del resumen). pista: el alto del hero en pantallas; el aterrizaje queda siempre en el mismo punto */
    const NOMBRES = { inicio: 'Inicio', capacidades: 'Capacidades', propuesta: 'Propuesta', calidad: 'Calidad', tecnologia: 'Tecnología', experiencia: 'Experiencia', categorias: 'Categorías', contacto: 'Contacto' };
    const COTAS = [
        { sel: '.hdr .logo', txt: 'Isotipo de nodos, elegido entre tres caminos' },
        { sel: '.s-hero h1', txt: 'Manrope en Light y Bold, en una misma frase' },
        { sel: '.s-hero .fila-tope', txt: 'Retícula con cortes, una regla del manual' },
        { sel: '.s-hero .nodo', txt: 'El nodo del sistema como punto de estado' }
    ];
    let secciones = null, secDoc = null, pasoTel = -1, cotaN = -2, base0 = null;
    const DISP = [null, { lw: 834, lh: 1112, n: 'Tablet' }, { lw: 390, lh: 844, n: 'Celular' }];

    const V = {
        telon: {
            n: 1, grupo: 'hoja', pista: 403,
            desc: 'El sitio se queda quieto y la hoja del resumen lo cubre. Sin vuelo y sin miniatura: el marco calla.'
        },
        recorrido: {
            n: 2, grupo: 'hoja', pista: 653,
            desc: 'El scroll del caso recorre el one page entero, sección por sección, y recién al final sube el resumen.',
            cuadro: s => {
                const k = fijar((s.b - 0.15) / 2.7), d = doc(marco);
                vivo.style.setProperty('--pv-k', k.toFixed(4));
                if (!d) return;
                const w = marco.contentWindow, max = d.documentElement.scrollHeight - w.innerHeight, y = Math.round(k * max);
                if (Math.abs(w.scrollY - y) > 0.5) w.scrollTo({ top: y, behavior: 'instant' });
                vivo.style.setProperty('--pv-t', fijar(w.innerHeight / d.documentElement.scrollHeight).toFixed(4));
                if (secDoc !== d) { secDoc = d; secciones = [...d.querySelectorAll('main > section[id]')]; }
                let i = 0;
                secciones.forEach((el, j) => { if (el.getBoundingClientRect().top < w.innerHeight * 0.45) i = j; });
                const id = secciones[i] ? secciones[i].id : 'inicio', t = `${pad(i + 1)} / ${pad(secciones.length)} · ${NOMBRES[id] || id}`;
                if (sec.textContent !== t) sec.textContent = t;
            },
            salir: () => { const w = marco.contentWindow; if (doc(marco)) w.scrollTo({ top: 0, behavior: 'instant' }); sec.textContent = ''; }
        },
        lamina: {
            n: 3, grupo: 'funde', pista: 388,
            desc: 'La ventana se retira a la derecha y el resumen se arma a su lado: el sitio queda grande, como la pieza de una lámina.',
            cuadro: s => {
                if (s.b > -0.5) copiar(copia, hueco, parseFloat(vivo.style.getPropertyValue('--iw')) || 1440);
                const k = curva(fijar((s.sube - 0.08) / 0.84));
                volar(s.base, hueco.getBoundingClientRect(), k);
                fijo.style.setProperty('--ks', k.toFixed(3));
                html.classList.toggle('pv-dejo', s.pr > 0.98 || s.rr.bottom < s.H * 0.98);
            },
            entrar: () => { est.textContent = 'En línea · 20 oct'; }
        },
        responsivo: {
            n: 4, grupo: 'funde', pista: 503,
            desc: 'El sitio real se angosta de escritorio a tablet y a celular, y el celular queda junto al resumen.',
            cuadro: s => {
                /* Tres anchos de verdad: el iframe se dibuja a cada ancho y el sitio responde con sus propios cortes */
                const paso = s.b < 0.45 ? 0 : s.b < 1 ? 1 : 2;
                if (paso !== pasoTel) {
                    /* La caja de escritorio se guarda al dejarla, ya medida por la cinta */
                    if (pasoTel === 0 && paso > 0) {
                        base0 = { caja: { left: vivo.style.left, top: vivo.style.top, width: vivo.style.width, height: vivo.style.height }, ancho: ancho.textContent };
                        ['--iw', '--ih', '--ie'].forEach(p => (base0[p] = vivo.style.getPropertyValue(p)));
                    }
                    pasoTel = paso;
                    const D = DISP[paso], H = s.H, alto = H - 124;
                    if (!D) { if (base0) { Object.assign(vivo.style, base0.caja); ['--iw', '--ih', '--ie'].forEach(p => vivo.style.setProperty(p, base0[p])); ancho.textContent = base0.ancho; } }
                    else {
                        const e = alto / D.lh, w = D.lw * e;
                        Object.assign(vivo.style, { left: ((window.innerWidth - w) / 2).toFixed(1) + 'px', top: '96px', width: w.toFixed(1) + 'px', height: alto.toFixed(1) + 'px' });
                        vivo.style.setProperty('--iw', D.lw + 'px'); vivo.style.setProperty('--ih', D.lh + 'px'); vivo.style.setProperty('--ie', e.toFixed(4));
                        ancho.textContent = `${D.n} · ${D.lw} px`;
                    }
                }
                fijo.style.setProperty('--ks', paso ? '1' : '0');
                if (s.b > 0.6) copiar(copiaTel, tel, 390);
                const k = curva(fijar((s.sube - 0.08) / 0.84));
                volar(caja(vivo), tel.getBoundingClientRect(), k);
                html.classList.toggle('pv-dejo', s.pr > 0.98 || s.rr.bottom < s.H * 0.98);
            },
            entrar: () => { base0 = null; pasoTel = 0; },
            /* Al salir, la cinta vuelve a medir la ventana como siempre */
            salir: () => { base0 = null; window.dispatchEvent(new Event('resize')); }
        },
        ruta: {
            n: 5, grupo: 'funde', pista: 388,
            desc: 'La ventana se cierra en una línea, y esa línea es la ruta del proyecto: seis hitos, del diagnóstico al sitio en línea.',
            cuadro: s => {
                /* Primero se cierra hasta 1 px a la altura de su centro (c); después la línea viaja y se estira hasta la
                   ruta (m). Al calzar, la ruta del resumen la reemplaza y se encienden sus nodos */
                const c = curva(fijar((s.sube - 0.04) / 0.46)), m = curva(fijar((s.sube - 0.5) / 0.46));
                const b = s.base, r = hitos.getBoundingClientRect(), ly = r.top + 6.5;
                const sx = 1 + (r.width / b.w - 1) * m, tx = (r.left - b.x) * m, ty = (ly - (b.y + b.h / 2)) * m;
                vivo.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${sx.toFixed(5)}, 1)`;
                vivo.style.setProperty('--pv-c', c.toFixed(4));
                vivo.style.setProperty('--k', c.toFixed(3));
                fijo.style.setProperty('--ks', c.toFixed(3));
                res.classList.toggle('pv-trazo', m > 0.999); html.classList.toggle('pv-dejo', m > 0.999);
            }
        },
        cotas: {
            n: 6, grupo: 'hoja', pista: 573,
            desc: 'Antes de irse, el sitio se anota como una lámina del manual: isotipo, tipografía, retícula y nodo, uno por uno.',
            cuadro: s => {
                /* Una lupa (la caja de evidencia del marco) recorre cuatro elementos reales del sitio, medidos en su DOM */
                const n = s.b < 0.25 || s.b > 2.15 ? -1 : Math.min(Math.floor((s.b - 0.25) / 0.45), COTAS.length - 1), d = doc(marco);
                vivo.classList.toggle('pv-anota', n >= 0);
                if (n < 0 || !d) { cotaN = -1; return; }
                const el = d.querySelector(COTAS[n].sel);
                if (!el) return;
                const e = parseFloat(vivo.style.getPropertyValue('--ie')) || 1, r = el.getBoundingClientRect(), m = 10;
                const x = r.left * e - m, y = r.top * e - m, w = r.width * e + m * 2, alto = r.height * e + m * 2;
                lupa.style.setProperty('--lx', x.toFixed(1) + 'px'); lupa.style.setProperty('--ly', y.toFixed(1) + 'px');
                lupa.style.setProperty('--lw', w.toFixed(1) + 'px'); lupa.style.setProperty('--lh', alto.toFixed(1) + 'px');
                /* El rótulo va bajo la lupa, o arriba si abajo no cabe */
                const abajo = y + alto + 64 < parseFloat(vivo.style.height);
                nota.style.setProperty('--lx', Math.max(x, 0).toFixed(1) + 'px');
                nota.style.setProperty('--ly', (abajo ? y + alto + 12 : y - 12).toFixed(1) + 'px');
                nota.classList.toggle('arriba', !abajo);
                if (n !== cotaN) { cotaN = n; nota.innerHTML = `<b>${pad(n + 1)} / ${pad(COTAS.length)}</b>${COTAS[n].txt}`; }
            },
            salir: () => { vivo.classList.remove('pv-anota'); cotaN = -2; }
        }
    };
    const ORDEN = Object.keys(V);

    /* --- 4. EL CUADRO COMÚN --- */
    let actual = null;
    const cuadro = () => {
        if (!actual) return;
        const H = window.innerHeight, rr = res.getBoundingClientRect();
        const L = h.offsetTop + H * 1.8 * 0.85, falta = Math.max(rr.top, 0);
        const s = { H, rr, falta, b: (window.scrollY - L) / H, sube: fijar((H - rr.top) / H), pr: fijar(-rr.top / (rr.height - H)), base: caja(vivo) };
        fijo.style.setProperty('--hund', s.sube.toFixed(4)); vivo.style.setProperty('--hund', s.sube.toFixed(4));
        res.style.setProperty('--pv-falta', falta.toFixed(1));
        res.style.setProperty('--pv-papel', s.sube.toFixed(4));
        res.classList.toggle('pv-opaco', s.sube > 0.999);
        html.classList.toggle('pv-tapado', s.sube > 0.999 && V[actual].grupo === 'hoja');
        if (V[actual].cuadro) V[actual].cuadro(s);
    };

    /* --- 5. CAMBIAR DE PROPUESTA --- */
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')], desc = document.querySelector('[data-sel-desc]');
    const limpiar = () => {
        vivo.style.transform = '';
        ['--s', '--alto', '--k', '--pv-k', '--pv-t', '--pv-c'].forEach(p => vivo.style.removeProperty(p));
        fijo.style.removeProperty('--ks');
        html.classList.remove('pv-dejo', 'pv-tapado'); res.classList.remove('pv-trazo', 'pv-opaco');
    };
    const desdeElZoom = () => window.scrollTo({ top: Math.round(h.offsetTop + window.innerHeight * 1.8 * 0.4), behavior: 'instant' });
    const activar = (nombre, volver) => {
        if (!V[nombre]) nombre = 'telon';
        if (actual && V[actual].salir) V[actual].salir();
        limpiar();
        ORDEN.forEach(k => html.classList.toggle('pv-' + k, k === nombre));
        html.classList.toggle('pv-hoja', V[nombre].grupo === 'hoja'); html.classList.toggle('pv-funde', V[nombre].grupo === 'funde');
        h.style.setProperty('--pista', V[nombre].pista);
        actual = nombre;
        if (V[nombre].entrar) V[nombre].entrar();
        desc.textContent = V[nombre].desc;
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === nombre)));
        try { localStorage.setItem('pv-propuesta', nombre); } catch (e) { /* sin almacenamiento, se parte en Telón */ }
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
    let guardada = null;
    try { guardada = localStorage.getItem('pv-propuesta'); } catch (e) { /* sin almacenamiento */ }
    activar(location.hash.slice(1) || guardada || 'telon', false);

    /* --- 6. EL BUCLE, SOLO CON EL PASO A LA VISTA --- */
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
   FIN JS · SEIS PROPUESTAS PARA EL PASO AL RESUMEN (.pv)
   ======================================================= */
