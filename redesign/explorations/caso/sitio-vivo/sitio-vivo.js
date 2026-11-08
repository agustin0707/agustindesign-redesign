/* =======================================================
   INICIO JS · EXPLORACIÓN DEL SITIO EN VIVO, DECISIONES 09 A 12 (.sv)
   ======================================================= */
(function () {
    const html = document.documentElement, pista = document.querySelector('.sv-pista'), esc = document.querySelector('[data-esc]'), marco = document.querySelector('[data-marco]');
    const cajas = [...document.querySelectorAll('.sv-caja')], meds = [...document.querySelectorAll('.sv-med')], tapa = document.querySelector('.sv-tapa'), cols = [...document.querySelectorAll('.sv-col')], pares = [...document.querySelectorAll('.sv-b-par')];
    const ticks = [...document.querySelectorAll('.sv-ticks i')];
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const tramo = (v, a, b) => fijar((v - a) / (b - a));
    const $ = s => document.querySelector(s);
    const DEC = [
        { n: '09', t: 'La retícula del manual, como estructura', p: 'Las líneas del manual cruzan cada sección y se cortan 8 px antes de tocarse. Las fotos no flotan: ocupan módulos.', por: 'La precisión que promete la marca se ve en cómo está armada la página' },
        { n: '10', t: 'Navegar y actuar, separados', p: 'Un botón lleva a conversar. Al lado, tres enlaces numerados bajan a Capacidades, Calidad y Tecnología.', por: 'Quien llega desde el QR de la feria decide en segundos qué le importa' },
        { n: '11', t: 'La trazabilidad, en código', p: 'Tecnología no tiene foto: un seguimiento en SVG avanza etapa por etapa con el cursor o con el scroll.', por: 'Ver la trazabilidad funcionando explica más que la imagen de un panel' },
        { n: '12', t: 'Todo empuja a una conversación', p: 'Un formulario de seis campos que se envía sin recargar y confirma con los nodos de la marca.', por: 'La meta de la feria era levantar contactos: cada sección termina llevando aquí' }
    ];
    const CAMPOS = [['f-nombre', 'Tu nombre'], ['f-empresa', 'Tu empresa'], ['f-email', 'tu@empresa.cl']];
    /* Qué mira cada versión en cada parada. modo: real (1:1), ancho (el sitio entero al ancho) o pieza (un elemento encuadrado) */
    const CFG = {
        a: [{ sel: '.s-quees .bento', modo: 'real', cajas: [['.s-quees .bento', 'Bento medido por la retícula']] }, { sel: '.s-hero .pie', modo: 'real', arriba: true, cajas: [['.s-hero .pie', 'Acción y atajos, separados']] }, { sel: '.s-tecno .ruta', modo: 'real', pasos: true, cajas: [['.s-tecno .ruta', 'Seguimiento en SVG']] }, { sel: '#formulario', modo: 'real', cajas: [['#formulario', 'Seis campos, sin recargar']] }],
        b: [{ cruce: true, modo: 'pieza', max: 3.2 }, { sel: '.s-hero .pie', modo: 'ancho', pie: true }, { sel: '.s-tecno .ruta', modo: 'ancho', pasos: true }, { sel: '#formulario', modo: 'ancho' }],
        c: [{ sel: '.s-quees .bento', modo: 'ancho', reticula: true, celdas: true }, { sel: '.s-hero .pie', modo: 'ancho', arriba: true, cajas: [['.s-hero .cta-grande', 'Actuar', 0.1], ['.s-hero .indice', 'Navegar', 0.45]] }, { sel: '.s-tecno .ruta', modo: 'pieza', max: 1.55, pasos: true, aisla: true }, { sel: '#formulario', modo: 'pieza', max: 1.05, escribe: true, aisla: true }]
    };
    let version = 'a', win = null, doc = null, tocando = false, k = -1, kv = 0, f = 0, corteT = 0, salto = false;
    const est = { e: 0, x: 0, y: 0, sy: 0 };

    /* --- 1. EL SITIO: SE MONTA Y NO PUEDE ENVIAR NADA --- */
    /* El formulario real manda a la cuenta de Llegó: desde el portafolio ningún envío sale, ni los enlaces externos */
    const exito = fo => {
        doc.querySelector('.exito-titulo').textContent = 'Gracias.';
        doc.querySelector('.exito-texto').textContent = 'Recibimos tu mensaje. Nuestro equipo te contactará pronto para conversar sobre tu operación.';
        fo.classList.add('enviado');
    };
    const montar = () => {
        const d = marco.contentDocument;
        if (!d || d.location.href === 'about:blank' || d === doc) return;
        win = marco.contentWindow; doc = d;
        /* Las entradas del sitio se disparan una vez, al ritmo de quien baja: aquí la cámara salta, y cada sección tiene que estar ya armada */
        d.documentElement.classList.remove('m-titulos', 'm-entradas', 'm-reticula', 'm-imagenes', 'm-carga', 'cargado');
        /* En window y en captura: corren antes que cualquier oyente del propio sitio */
        win.addEventListener('submit', e => { e.preventDefault(); e.stopImmediatePropagation(); if (e.target.checkValidity()) exito(e.target); }, true);
        win.addEventListener('click', e => { const a = e.target.closest && e.target.closest('a[href]'); if (a && !a.getAttribute('href').startsWith('#')) e.preventDefault(); }, true);
    };
    /* El iframe puede terminar de cargar antes que este script: se monta al evento y también al llegar */
    marco.addEventListener('load', montar);
    if (marco.contentDocument && marco.contentDocument.readyState === 'complete') montar();

    /* --- 2. MEDIDAS --- */
    let S = { w: 1440, h: 900 }, W = 1440, H = 900;
    const medir = () => {
        const r = esc.getBoundingClientRect(); S = { w: r.width, h: r.height };
        W = version === 'a' ? Math.max(Math.round(S.w), 1280) : 1440;
        H = version === 'a' ? Math.round(S.h / (S.w / W)) : Math.max(900, Math.round(S.h / (S.w / 1440)));
        esc.style.setProperty('--sv-iw', W + 'px'); esc.style.setProperty('--sv-ih', H + 'px');
    };
    /* El cruce de la retícula entre la primera y la segunda fila, a una columna del borde: donde se ve el corte */
    const rectCruce = () => {
        const f2 = doc.querySelector('.s-quees .fila + .fila') || doc.querySelector('.s-quees .fila.con-linea');
        if (!f2) return null;
        const r = f2.getBoundingClientRect(), borde = Math.max(48, (r.width - 1440) / 2 + 48), x = r.left + borde + (r.width - 2 * borde) * 0.25;
        return { left: x - 95, top: r.top - 62, width: 190, height: 124 };
    };

    /* --- 3. ADÓNDE MIRA LA PARADA --- */
    const meta = (c, r) => {
        const max = Math.max(doc.documentElement.scrollHeight - H, 0), top = r.top + win.scrollY;
        if (tocando) return { e: S.w / W, x: 0, y: 0 };
        if (c.modo === 'pieza') {
            const e = Math.min(c.max, S.w * 0.84 / r.width, S.h * 0.8 / r.height);
            const sy = c.arriba ? 0 : fijar(top + r.height / 2 - H / 2, 0, max), cy = top + r.height / 2 - sy, cx = r.left + r.width / 2;
            const m = { e, sy, x: S.w / 2 - cx * e, y: S.h / 2 - cy * e };
            /* Sin tapa alrededor, el borde del iframe nunca entra en cuadro */
            if (!c.aisla) { m.x = fijar(m.x, Math.min(S.w - W * e, 0), 0); m.y = fijar(m.y, Math.min(S.h - H * e, 0), 0); }
            return m;
        }
        const e = S.w / W, vista = S.h / e;
        const sy = c.arriba ? 0 : fijar(c.pie ? top + r.height + 28 - vista : r.height > vista * 0.86 ? top - 72 : top + r.height / 2 - vista / 2, 0, max);
        return { e, sy, x: 0, y: 0 };
    };

    /* --- 4. LO QUE PASA EN CADA PARADA --- */
    let pasoSitio = -1, escrito = false;
    const pasos = c => {
        if (!c.pasos) return;
        const lista = doc.querySelectorAll('.s-tecno .paso'), i = Math.min(Math.floor(f * lista.length), lista.length - 1);
        if (i !== pasoSitio && lista[i]) { pasoSitio = i; lista[i].dispatchEvent(new MouseEvent('mouseenter')); }
    };
    const form = (c) => {
        const fo = doc.getElementById('formulario');
        if (!fo) return;
        if (!c || !c.escribe) { if (escrito) { fo.classList.remove('enviado'); CAMPOS.forEach(([id]) => { doc.getElementById(id).value = ''; }); doc.getElementById('f-ok').checked = false; escrito = false; } return; }
        escrito = true;
        CAMPOS.forEach(([id, v], i) => { doc.getElementById(id).value = v.slice(0, Math.round(tramo(f, 0.06 + i * 0.2, 0.24 + i * 0.2) * v.length)); });
        doc.getElementById('f-ok').checked = f > 0.68;
        if (f <= 0.8) fo.classList.remove('enviado'); else if (!fo.classList.contains('enviado')) exito(fo);
    };
    const ubicar = (el, r) => {
        const x = r.left * est.e + est.x, y = r.top * est.e + est.y;
        el.style.setProperty('--sv-cx', x.toFixed(1) + 'px'); el.style.setProperty('--sv-cy', y.toFixed(1) + 'px');
        el.style.setProperty('--sv-cw', (r.width * est.e).toFixed(1) + 'px'); el.style.setProperty('--sv-ch', (r.height * est.e).toFixed(1) + 'px');
        return y;
    };
    const pintarCaja = (el, r, txt, on) => {
        const y = ubicar(el, r);
        el.classList.toggle('abajo', y < 30);
        el.classList.toggle('on', on);
        el.firstChild.textContent = txt;
    };
    const capa = c => {
        let n = 0;
        /* La pieza sola sobre fondo oscuro, o los dos cortes de 8 px medidos en el cruce */
        const pieza = c.aisla && doc.querySelector(c.sel);
        if (pieza) ubicar(tapa, pieza.getBoundingClientRect());
        tapa.classList.toggle('on', !!pieza);
        const cruce = c.cruce && rectCruce();
        if (cruce) { const cy = cruce.top + cruce.height / 2, cx = cruce.left + cruce.width / 2 + 5; ubicar(meds[0], { left: cx, top: cy - 8, width: 8, height: 8 }); ubicar(meds[1], { left: cx, top: cy, width: 8, height: 8 }); }
        meds.forEach(m => m.classList.toggle('on', !!cruce));
        const marcar = (r, t, on) => { if (n < cajas.length) pintarCaja(cajas[n++], r, t, on); };
        (c.cajas || []).forEach(([s, t, desde]) => { const e = doc.querySelector(s); if (e) marcar(e.getBoundingClientRect(), t, f >= (desde || 0)); });
        if (c.celdas) [...doc.querySelectorAll('.s-quees .bento > *')].slice(0, 4).forEach((e, i) => { const r = e.getBoundingClientRect(); marcar(r, Math.round(r.width / 336) + (Math.round(r.width / 336) > 1 ? ' columnas' : ' columna'), f > 0.34 + i * 0.13); });
        cajas.slice(n).forEach(x => x.classList.remove('on'));
        const borde = Math.max(48, (W - 1440) / 2 + 48), ancho = W - 2 * borde;
        cols.forEach((l, i) => { l.style.setProperty('--sv-lx', ((borde + ancho * i / 4) * est.e + est.x).toFixed(1) + 'px'); l.style.setProperty('--sv-r', c.reticula ? tramo(f, 0, 0.3).toFixed(3) : '0'); });
    };

    /* --- 5. CUADRO A CUADRO --- */
    const texto = i => {
        const d = DEC[i];
        $('[data-num]').textContent = d.n; $('[data-num2]').textContent = d.n; $('[data-t]').textContent = d.t; $('[data-p]').textContent = d.p; $('[data-por]').textContent = d.por;
        $('[data-paso]').textContent = `0${i + 1} / 04`;
        ticks.forEach((t, j) => t.classList.toggle('on', j <= i));
        pares.forEach((p, j) => p.classList.toggle('on', j === i));
    };
    const cuadro = () => {
        requestAnimationFrame(cuadro);
        const r = pista.getBoundingClientRect(), p = fijar(-r.top / (r.height - window.innerHeight)), t = Math.min(p * 4, 3.999);
        const i = Math.floor(t); f = t - i;
        if (i !== k) {
            const inicio = k < 0;
            k = i; texto(i);
            /* Entre paradas el sitio no se cruza entero: la cámara funde, salta y vuelve */
            if (inicio) kv = i;
            else {
                clearTimeout(corteT);
                html.classList.add('sv-corte');
                corteT = setTimeout(() => { kv = k; pasoSitio = -1; salto = true; }, quieto ? 0 : 130);
            }
        }
        if (!doc || !doc.body) return;
        const c = CFG[version][kv];
        const obj = c.cruce ? rectCruce() : doc.querySelector(c.sel);
        const rect = obj && (obj.getBoundingClientRect ? obj.getBoundingClientRect() : obj);
        if (!rect) return;
        const m = meta(c, rect), a = quieto || est.e === 0 || salto ? 1 : 0.14;
        ['e', 'x', 'y'].forEach(q => { est[q] += (m[q] - est[q]) * a; });
        if (!tocando) { est.sy += (m.sy - est.sy) * a; win.scrollTo({ top: est.sy, behavior: 'instant' }); }
        esc.style.setProperty('--sv-e', est.e.toFixed(4)); esc.style.setProperty('--sv-x', est.x.toFixed(1) + 'px'); esc.style.setProperty('--sv-y', est.y.toFixed(1) + 'px');
        pasos(c); form(tocando ? null : c); capa(c);
        if (salto) { salto = false; html.classList.remove('sv-corte'); }
    };

    /* --- 6. RECÓRRELO TÚ: EL SITIO RECIBE EL CURSOR Y LA RUEDA --- */
    const tocar = v => {
        tocando = v;
        html.classList.toggle('sv-tocando', v);
        $('[data-tocar-t]').textContent = v ? 'Volver al caso' : 'Recórrelo tú';
        if (v) { cancelAnimationFrame(viaje); est.sy = win ? win.scrollY : 0; }
    };
    $('[data-tocar]').addEventListener('click', () => tocar(!tocando));

    /* --- 7. VER: RECORRE LAS CUATRO PARADAS SOLO --- */
    let viaje = 0;
    const ver = () => {
        tocar(false); cancelAnimationFrame(viaje);
        window.scrollTo({ top: 0, behavior: 'instant' });
        if (quieto) return;
        const fin = pista.offsetHeight - window.innerHeight, t0 = performance.now() + 500, dur = 15000;
        const avanzar = ahora => { const q = fijar((ahora - t0) / dur); window.scrollTo({ top: Math.round(fin * q), behavior: 'instant' }); if (q < 1) viaje = requestAnimationFrame(avanzar); };
        viaje = requestAnimationFrame(avanzar);
    };
    ['wheel', 'touchstart'].forEach(e => window.addEventListener(e, () => cancelAnimationFrame(viaje), { passive: true }));

    /* --- 8. SELECTOR DE VERSIONES --- */
    const botones = [...document.querySelectorAll('[data-sel] [data-v]')];
    const elegir = (v, repetir) => {
        if (!CFG[v]) v = 'a';
        version = v; est.e = 0;
        Object.keys(CFG).forEach(q => html.classList.toggle('sv-v' + q, q === v));
        botones.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.v === v)));
        try { localStorage.setItem('sv-version', v); } catch (e) { /* sin almacenamiento, se parte en la 1 */ }
        /* Con <base href> un '#x' suelto cambiaría la ruta: se arma la dirección entera */
        try { history.replaceState(null, '', location.pathname + location.search + '#' + v); } catch (e) { /* un visor que no deja cambiar la dirección no corta el cambio */ }
        medir();
        if (repetir) ver();
    };
    botones.forEach(x => x.addEventListener('click', () => elegir(x.dataset.v, true)));
    $('[data-otra]').addEventListener('click', ver);
    document.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const n = '123'.indexOf(e.key);
        if (n >= 0) elegir('abc'[n], true);
        else if (e.key === 'r' || e.key === 'R') ver();
    });
    window.addEventListener('resize', medir);

    let guardada = null;
    try { guardada = localStorage.getItem('sv-version'); } catch (e) { /* sin almacenamiento */ }
    elegir(location.hash.slice(1) || guardada || 'a', false);
    cuadro();
})();
/* =======================================================
   FIN JS · EXPLORACIÓN DEL SITIO EN VIVO, DECISIONES 09 A 12 (.sv)
   ======================================================= */
