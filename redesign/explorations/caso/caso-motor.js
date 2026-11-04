/* =======================================================
   INICIO JS · MOTOR DE LOS CASOS (.cs-)
   ======================================================= */
/* La mecánica común de los casos, sacada del de Tap In. Cada [data-escena] es una pista alta con un panel fijo: su
   avance se publica como --p (0 a 1). Dentro, [data-rango="a-b"] se enciende entre a y b, y con data-pasos los
   [data-paso] marcan el paso actual (.on) y los anteriores (.ya). Cada caso suma su lógica propia antes de este
   archivo: window.CASO_ESCENAS = { nombre: (el, h) => p => { ... } }. También: la barra, el texto que se enciende,
   las apariciones con cifras que cuentan, el parallax, las tiras de fotos y la evidencia del sitio real */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const tactil = window.matchMedia('(pointer: coarse)').matches;
    const vistaMovil = window.matchMedia('(max-width: 768px), (orientation: portrait) and (max-width: 1100px)');
    /* Alto de pantalla estable: una sonda de 100lvh, el mismo alto de los paneles fijos */
    const sonda = document.createElement('div'); sonda.className = 'cs-sonda'; sonda.setAttribute('aria-hidden', 'true'); document.body.appendChild(sonda);
    const medirVh = () => sonda.offsetHeight || window.innerHeight;
    let vh = medirVh(), anchoVh = window.innerWidth;
    const h = { quieto, fijar, curva, tactil, vistaMovil, vh: () => vh };

    /* --- 0. SIGUIENTE PROYECTO (ANTES DE MEDIR: ES UN MÓDULO MÁS) --- */
    const C = window.CASO, hueco = document.querySelector('[data-siguiente]');
    if (C && hueco && window.CASO_SIGUIENTE) {
        hueco.outerHTML = window.CASO_SIGUIENTE(C);
        (window.CASO_INICIOS || []).forEach(f => f(C, { quieto }));
    }
    /* --- 1. EVIDENCIA: EL SITIO REAL DENTRO DE UN NAVEGADOR --- */
    /* El sitio se monta en reposo cuando la sección está a menos de dos pantallas. Su ancho lógico es 1440 (390 en la
       vista móvil) y se escala a la pantalla del navegador. Cada parada lleva el scroll del sitio a su elemento
       (data-sel, o data-sel-m en móvil) y el foco lo sigue cuadro a cuadro midiendo el elemento dentro del sitio */
    const evidencia = el => {
        const pant = el.querySelector('.cs-ev-pant'), caja = el.querySelector('.cs-ev-caja'), cajaTxt = caja.querySelector('span');
        const items = [...el.querySelectorAll('[data-parada]')], contador = el.querySelector('[data-ev-n]');
        const n = items.length;
        let marco = null, win = null, doc = null, W = 1440, H = 900, e = 0.5, actual = -1, y = 0, meta = 0, bucle = null, demo = null;
        const medir = () => {
            W = vistaMovil.matches ? 390 : 1440;
            e = pant.clientWidth / W; H = Math.round(pant.clientHeight / e);
            pant.style.setProperty('--e', e.toFixed(4));
            if (marco) { marco.style.width = W + 'px'; marco.style.height = H + 'px'; }
        };
        const objetivo = k => {
            const li = items[k], sel = (vistaMovil.matches && li.dataset.selM) || li.dataset.sel;
            const t = doc && doc.querySelector(sel);
            if (!t) return null;
            const r = t.getBoundingClientRect(), top = r.top + win.scrollY, max = doc.documentElement.scrollHeight - H;
            /* Centrado en la pantalla; si no cabe, arriba con aire para leerlo desde el principio */
            return { t, y: fijar(r.height > H * 0.86 ? top - 48 : top + r.height / 2 - H / 2, 0, Math.max(max, 0)) };
        };
        const pintar = () => {
            bucle = null;
            if (!win) return;
            const d = meta - y;
            y = Math.abs(d) < 0.5 || quieto ? meta : y + d * 0.14;
            win.scrollTo({ top: y, behavior: 'instant' });
            const o = actual >= 0 && objetivo(actual);
            if (o) {
                const r = o.t.getBoundingClientRect(), pad = 10;
                caja.style.setProperty('--x', ((r.left - pad) * e).toFixed(1) + 'px'); caja.style.setProperty('--y', ((r.top - pad) * e).toFixed(1) + 'px');
                caja.style.setProperty('--w', ((r.width + pad * 2) * e).toFixed(1) + 'px'); caja.style.setProperty('--h', ((r.height + pad * 2) * e).toFixed(1) + 'px');
                caja.classList.toggle('abajo', (r.top - pad) * e < 26);
            }
            if (y !== meta) bucle = requestAnimationFrame(pintar);
        };
        const pedirPintar = () => { if (!bucle) bucle = requestAnimationFrame(pintar); };
        /* Demostración: en la parada que la pide, recorre sus elementos como si pasara el cursor */
        const demostrar = k => {
            clearInterval(demo); demo = null;
            const sel = k >= 0 && items[k].dataset.demo;
            if (!sel || !doc || quieto) return;
            const pasos = [...doc.querySelectorAll(sel)]; let i = 0;
            demo = setInterval(() => { if (pasos.length) pasos[i++ % pasos.length].dispatchEvent(new MouseEvent('mouseenter')); }, 1100);
        };
        const ir = k => {
            if (k === actual) return;
            actual = k;
            items.forEach((li, i) => { li.classList.toggle('actual', i === k); li.classList.toggle('ya', i < k); });
            if (contador && k >= 0) contador.textContent = items[k].dataset.n;
            caja.classList.toggle('on', k >= 0);
            if (k >= 0) cajaTxt.textContent = items[k].dataset.nota;
            const o = k >= 0 ? objetivo(k) : null;
            meta = o ? o.y : 0;
            demostrar(k); pedirPintar();
        };
        const montar = () => {
            if (marco) return;
            marco = document.createElement('iframe');
            marco.title = el.dataset.evTitulo || 'Sitio en vivo'; marco.setAttribute('tabindex', '-1'); marco.setAttribute('aria-hidden', 'true');
            marco.onload = () => {
                try { win = marco.contentWindow; doc = marco.contentDocument; } catch (err) { return; }
                pant.classList.add('listo');
                /* El sitio anima su carga: se mide de nuevo cuando termina */
                setTimeout(() => { const k = actual; actual = -2; ir(k); }, 1500);
                const k = actual; actual = -2; ir(k);
            };
            medir();
            marco.src = el.dataset.ev;
            pant.appendChild(marco);
        };
        new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) ('requestIdleCallback' in window ? requestIdleCallback : setTimeout)(montar); }), { rootMargin: '200% 0px' }).observe(el);
        window.addEventListener('resize', () => { const m = W; medir(); if (m !== W && marco) { const k = actual; actual = -2; setTimeout(() => ir(k), 300); } else pedirPintar(); });
        /* Clic en el índice: lleva el scroll de la página a esa parada */
        items.forEach((li, k) => li.querySelector('button').addEventListener('click', () => {
            const r = el.getBoundingClientRect(), recorrido = r.height - vh;
            window.scrollTo({ top: window.scrollY + r.top + ((k + 0.5) / n) * recorrido, behavior: quieto ? 'auto' : 'smooth' });
        }));
        return p => ir(Math.min(Math.floor(p * n), n - 1));
    };
    const propias = Object.assign({ evidencia }, window.CASO_ESCENAS || {});

    /* --- 2. MOTOR DE ESCENAS Y PARALLAX --- */
    const escenas = [...document.querySelectorAll('[data-escena]')].map(el => ({
        el, p: -1,
        rangos: [...el.querySelectorAll('[data-rango]')].map(r => { const [a, b] = r.dataset.rango.split('-').map(Number); return { r, a, b }; }),
        pasos: +el.dataset.pasos || 0, hasta: +el.dataset.pasosHasta || 1,
        marcas: [...el.querySelectorAll('[data-paso]')], cont: el.querySelector('[data-paso-n]'),
        propia: propias[el.dataset.escena] ? propias[el.dataset.escena](el, h) : null
    }));
    const pars = [...document.querySelectorAll('[data-par]')];
    const modulos = [...document.querySelector('main').children];
    /* Posiciones medidas una vez (y de nuevo si cambia el tamaño): en cada cuadro de scroll no se mide el diseño */
    const medirTops = () => {
        const y = window.scrollY;
        [...escenas.map(s => s.el), ...pars, ...modulos].forEach(el => { const r = el.getBoundingClientRect(); el.top = r.top + y; el.alto = r.height; });
    };
    const pintar = y => {
        escenas.forEach(s => {
            const top = s.el.top - y, alto = s.el.alto;
            if (top + alto < -vh * 0.25 || top > vh * 1.25) return;
            const p = fijar(-top / Math.max(alto - vh, 1));
            if (Math.abs(p - s.p) < 0.0004) return;
            s.p = p;
            s.el.style.setProperty('--p', p.toFixed(4));
            s.rangos.forEach(x => x.r.classList.toggle('on', p >= x.a && p < x.b));
            if (s.pasos) {
                const k = Math.min(Math.floor(fijar(p / s.hasta) * s.pasos), s.pasos - 1);
                s.marcas.forEach(m => { m.classList.toggle('on', +m.dataset.paso === k); m.classList.toggle('ya', +m.dataset.paso < k); });
                if (s.cont) s.cont.textContent = `${String(k + 1).padStart(2, '0')} / ${String(s.pasos).padStart(2, '0')}`;
            }
            if (s.propia) s.propia(p);
        });
        /* Parallax: --v va de -1 (entra por abajo) a 1 (sale por arriba) */
        pars.forEach(el => {
            const top = el.top - y;
            if (top + el.alto < 0 || top > vh) return;
            el.style.setProperty('--v', fijar(((vh - top) / (vh + el.alto)) * 2 - 1, -1, 1).toFixed(3));
        });
    };

    /* --- 3. BARRA QUE SE ESCONDE AL BAJAR Y TOMA EL COLOR DEL MÓDULO DE ABAJO --- */
    /* Tinta sobre los módulos .cs-claro; una escena puede decidirlo en vivo con data-claro="1" o "0" */
    const nav = document.querySelector('[data-barra]');
    let ultimoY = window.scrollY, subida = 0;
    if (nav) nav.querySelectorAll('ul a').forEach(a => { const t = a.textContent.trim(); a.setAttribute('aria-label', t); a.innerHTML = [...t].map((c, i) => `<span class="c" aria-hidden="true" style="--i:${i}">${c}</span>`).join(''); });
    const barra = y => {
        if (!nav) return;
        const dy = y - ultimoY; ultimoY = y;
        const m = modulos.find(el => el.top - y <= 32 && el.top - y + el.alto > 32);
        const claro = !!m && (m.dataset.claro ? m.dataset.claro === '1' : m.classList.contains('cs-claro'));
        nav.classList.toggle('sobre-claro', claro);
        /* Se esconde al bajar; vuelve con una subida clara (90 px seguidos) o cerca del inicio */
        if (dy > 0) { subida = 0; if (y > 120) nav.classList.add('oculta'); }
        else if (dy < 0) { subida -= dy; if (subida > 90 || y < 120) nav.classList.remove('oculta'); }
        nav.classList.toggle('flota', y > 120);
    };

    /* --- 4. TEXTO QUE SE ENCIENDE PALABRA POR PALABRA --- */
    const textos = [...document.querySelectorAll('[data-luz]')].map(el => {
        const partir = nodo => [...nodo.childNodes].forEach(x => {
            if (x.nodeType === 3) {
                const f = document.createDocumentFragment();
                x.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.appendChild(document.createTextNode(w)); else { const s = document.createElement('span'); s.className = 'cs-pal'; s.textContent = w; f.appendChild(s); } });
                x.replaceWith(f);
            } else partir(x);
        });
        partir(el);
        return { el, pals: [...el.querySelectorAll('.cs-pal')], n: -1 };
    });
    const luces = rt => textos.forEach((t, k) => {
        const r = rt[k];
        if (r.bottom < 0 || r.top > vh) return;
        const n = Math.round((quieto ? 1 : fijar((vh * 0.9 - r.top) / (r.height + vh * 0.25))) * t.pals.length);
        if (n === t.n) return;
        t.n = n; t.pals.forEach((w, i) => w.classList.toggle('on', i < n));
    });

    /* --- 5. CUADRO A CUADRO: PRIMERO SE LEE, DESPUÉS SE ESCRIBE --- */
    let pendiente = false, ancla = null;
    const anclar = y => { const m = modulos.find(el => el.top <= y && el.top + el.alto > y); if (m) ancla = { m, f: (y - m.top) / m.alto }; };
    const pedir = () => { if (pendiente) return; pendiente = true; requestAnimationFrame(() => { pendiente = false; const y = window.scrollY, rt = textos.map(t => t.el.getBoundingClientRect()); anclar(y); pintar(y); luces(rt); barra(y); }); };
    window.addEventListener('scroll', pedir, { passive: true });
    /* Al redimensionar, las pistas cambian de largo: se vuelve al mismo módulo y a la misma altura de su pista */
    window.addEventListener('resize', () => {
        const nuevo = medirVh(); if (nuevo === vh && window.innerWidth === anchoVh) return;
        vh = nuevo; anchoVh = window.innerWidth; medirTops();
        if (ancla) window.scrollTo({ top: Math.round(ancla.m.top + ancla.f * ancla.m.alto), behavior: 'instant' });
        escenas.forEach(s => (s.p = -1)); pedir();
    });
    let remedir = false;
    const alCambiarAlto = () => { if (remedir) return; remedir = true; requestAnimationFrame(() => { remedir = false; medirTops(); escenas.forEach(s => (s.p = -1)); pedir(); }); };
    if ('ResizeObserver' in window) new ResizeObserver(alCambiarAlto).observe(document.body);
    window.addEventListener('load', alCambiarAlto);
    medirTops(); pedir();

    /* --- 6. APARICIONES Y CIFRAS QUE CUENTAN --- */
    const formato = x => x.toLocaleString('es-CL');
    const contar = el => {
        const fin = +el.dataset.cuenta, pre = el.dataset.pre ? `<small>${el.dataset.pre}</small>` : '', suf = el.dataset.suf ? `<small>${el.dataset.suf}</small>` : '';
        if (quieto) { el.innerHTML = pre + formato(fin) + suf; return; }
        const t0 = performance.now(), dur = fin > 100 ? 1600 : 900;
        const paso = ahora => { const t = fijar((ahora - t0) / dur); el.innerHTML = pre + formato(Math.round(fin * (1 - Math.pow(1 - t, 4)))) + suf; if (t < 1) requestAnimationFrame(paso); };
        requestAnimationFrame(paso);
    };
    const io = new IntersectionObserver(es => es.forEach(x => {
        if (!x.isIntersecting) return;
        x.target.classList.add('visto');
        x.target.querySelectorAll('[data-cuenta]').forEach(contar);
        io.unobserve(x.target);
    }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-revela]').forEach(el => io.observe(el));

    /* --- 7. TIRAS DE FOTOS --- */
    /* Flechas que avanzan una foto y contador de la foto que queda al inicio */
    document.querySelectorAll('[data-tira]').forEach(t => {
        const pista = t.querySelector('.cs-tira-pista'), figs = [...pista.children], n = t.querySelector('[data-tira-n]');
        const paso = () => figs[0].offsetWidth + parseFloat(getComputedStyle(pista).columnGap || 0);
        t.querySelector('[data-tira-ant]').addEventListener('click', () => pista.scrollBy({ left: -paso(), behavior: quieto ? 'auto' : 'smooth' }));
        t.querySelector('[data-tira-sig]').addEventListener('click', () => pista.scrollBy({ left: paso(), behavior: quieto ? 'auto' : 'smooth' }));
        pista.addEventListener('scroll', () => { if (n) n.textContent = String(Math.min(Math.round(pista.scrollLeft / paso()) + 1, figs.length)).padStart(2, '0'); }, { passive: true });
    });

})();
/* =======================================================
   FIN JS · MOTOR DE LOS CASOS (.cs-)
   ======================================================= */
