/* =======================================================
   INICIO JS · CASO TAP IN EDITORIAL (.tp-)
   ======================================================= */
/* Caso en módulos a todo el ancho, como un proyecto de Behance, con escenas que avanzan con el scroll.
   Cada [data-escena] es una pista alta con un panel fijo: su avance se publica como --p (0 a 1) y el CSS
   decide qué hacer con él. Dentro, [data-rango="a-b"] se enciende entre a y b, y con data-pasos los
   [data-paso] marcan el paso actual (.on) y los anteriores (.ya). Algunas escenas suman su lógica propia */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let vh = window.innerHeight;

    /* --- 1. LÓGICA PROPIA DE CADA ESCENA --- */
    const propias = {
        /* Hero: el zoom del sitio con una curva suave, más rápido que el recorrido de la pista */
        hero: el => p => el.style.setProperty('--h', curva(Math.min(p * 1.25, 1)).toFixed(4)),
        /* Capítulo 03: la dirección se escribe con el scroll y la página empieza a cargar */
        url: el => {
            const caja = el.querySelector('[data-url]'), txt = caja.dataset.url;
            caja.innerHTML = [...txt].map(c => `<span>${c}</span>`).join('');
            const letras = [...caja.children];
            return p => {
                const n = Math.round(fijar((p - 0.2) / 0.4) * letras.length);
                letras.forEach((l, i) => l.classList.toggle('on', i < n));
                el.classList.toggle('escrito', n === letras.length);
            };
        },
        /* El manual: el contador sigue a la lámina que está al centro */
        manual: el => {
            const n = el.querySelector('[data-manual-n]'), total = el.querySelectorAll('.tp-manual-riel figure').length;
            return p => { n.textContent = String(Math.min(Math.floor(p * total), total - 1) + 1).padStart(2, '0'); };
        },
        /* El sitio: baja por tapin.cl y se detiene en cada decisión; el foco se dibuja sobre la parte que
           explica. Las cajas están en píxeles del sitio a 1440 de ancho */
        sitio: el => {
            const ANCHO = 1440, ALTO = 4600, VIAJE = 0.4, FINAL = 0.6;
            const pant = el.querySelector('.tp-sitio-pantalla'), lienzo = el.querySelector('.tp-sitio-lienzo');
            const caja = el.querySelector('.tp-sitio-caja'), cajaTxt = caja.querySelector('span');
            const items = [...el.querySelectorAll('[data-parada]')];
            const paradas = items.map(li => { const [x, y, w, h] = li.dataset.caja.split(',').map(Number); return { li, x, y, w, h, nota: li.dataset.nota }; });
            const contador = el.querySelector('[data-sitio-n]');
            const U = paradas.length + FINAL;
            let e = 1, vis = 0, actual = -2;
            const medir = () => {
                e = pant.clientWidth / ANCHO; vis = pant.clientHeight / e;
                pant.style.setProperty('--e', e.toFixed(4));
                /* Cada parada deja su caja en el primer cuarto de la pantalla */
                paradas.forEach(d => { d.top = fijar(d.y - vis * 0.22, 0, ALTO - vis); });
            };
            medir();
            window.addEventListener('resize', medir);
            /* Clic en el índice: lleva el scroll al momento en que esa decisión está quieta */
            items.forEach((li, i) => li.querySelector('button').addEventListener('click', () => {
                const r = el.getBoundingClientRect(), u = i === 0 ? 0.5 : i + VIAJE + 0.3;
                window.scrollTo({ top: window.scrollY + r.top + (u / U) * (r.height - vh), behavior: quieto ? 'auto' : 'smooth' });
            }));
            return p => {
                const u = p * U, i = Math.floor(u), t = u - i;
                let y, act = -1;
                if (i >= paradas.length) y = paradas[paradas.length - 1].top + (ALTO - vis - paradas[paradas.length - 1].top) * curva(fijar(t / FINAL));
                else if (i === 0 || t >= VIAJE) { y = paradas[i].top; act = i; }
                else y = paradas[i - 1].top + (paradas[i].top - paradas[i - 1].top) * curva(t / VIAJE);
                lienzo.style.transform = `translate3d(0, ${(-y * e).toFixed(1)}px, 0)`;
                if (act !== actual) {
                    actual = act;
                    el.dataset.parada = act;
                    items.forEach((li, k) => { li.classList.toggle('actual', k === act); li.classList.toggle('ya', k < (act < 0 ? i : act)); });
                    caja.classList.toggle('on', act >= 0);
                    if (act >= 0) { cajaTxt.textContent = paradas[act].nota; contador.textContent = `${String(act + 6).padStart(2, '0')} / 10`; }
                }
                if (act >= 0) {
                    const d = paradas[act];
                    caja.style.setProperty('--x', (d.x * e).toFixed(1) + 'px'); caja.style.setProperty('--y', ((d.y - y) * e).toFixed(1) + 'px');
                    caja.style.setProperty('--w', (d.w * e).toFixed(1) + 'px'); caja.style.setProperty('--h', (d.h * e).toFixed(1) + 'px');
                    caja.classList.toggle('abajo', (d.y - y) * e < 30);
                }
            };
        }
    };

    /* --- 2. MOTOR DE ESCENAS Y PARALLAX --- */
    const escenas = [...document.querySelectorAll('[data-escena]')].map(el => ({
        el, p: -1,
        rangos: [...el.querySelectorAll('[data-rango]')].map(r => { const [a, b] = r.dataset.rango.split('-').map(Number); return { r, a, b }; }),
        pasos: +el.dataset.pasos || 0,
        marcas: [...el.querySelectorAll('[data-paso]')],
        propia: propias[el.dataset.escena] ? propias[el.dataset.escena](el) : null
    }));
    const pars = [...document.querySelectorAll('[data-par]')];
    const pintar = () => {
        escenas.forEach(s => {
            const r = s.el.getBoundingClientRect();
            if (r.bottom < -vh * 0.25 || r.top > vh * 1.25) return;
            const p = fijar(-r.top / (r.height - vh));
            if (Math.abs(p - s.p) < 0.0004) return;
            s.p = p;
            s.el.style.setProperty('--p', p.toFixed(4));
            s.rangos.forEach(x => x.r.classList.toggle('on', p >= x.a && p < x.b));
            if (s.pasos) {
                const k = Math.min(Math.floor(p * s.pasos), s.pasos - 1);
                s.marcas.forEach(m => { m.classList.toggle('on', +m.dataset.paso === k); m.classList.toggle('ya', +m.dataset.paso < k); });
            }
            if (s.propia) s.propia(p);
        });
        /* Parallax: --v va de -1 (entra por abajo) a 1 (sale por arriba) */
        pars.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            el.style.setProperty('--v', fijar(((vh - r.top) / (vh + r.height)) * 2 - 1, -1, 1).toFixed(3));
        });
    };
    let pendiente = false;
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; pintar(); luces(); barra(); }); } };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', () => { vh = window.innerHeight; escenas.forEach(s => (s.p = -1)); pedir(); });

    /* --- 3. BARRA QUE SE ESCONDE AL BAJAR Y TOMA EL COLOR DEL MÓDULO DE ABAJO --- */
    /* Sin mezcla por diferencia (sobre morado se volvía verde): tinta sobre lo claro, blanco sobre lo demás.
       En el hero, cuando el navegador ya llenó la pantalla, lo de abajo es el sitio claro */
    const nav = document.querySelector('[data-barra]'), modulos = [...document.querySelector('main').children];
    let ultimoY = window.scrollY;
    const barra = () => {
        const y = window.scrollY;
        const m = modulos.find(el => { const r = el.getBoundingClientRect(); return r.top <= 32 && r.bottom > 32; });
        const hero = escenas[0];
        nav.classList.toggle('sobre-claro', !!m && (m.classList.contains('tp-claro') || (m === hero.el && hero.p > 0.62)));
        if (Math.abs(y - ultimoY) < 6) return;
        nav.classList.toggle('oculta', y > ultimoY && y > 120);
        ultimoY = y;
    };
    /* El índice de capítulos lleva a cada uno con un desplazamiento suave */
    document.querySelectorAll('.tp-indice a').forEach(a => a.addEventListener('click', e => {
        const destino = document.querySelector(a.getAttribute('href'));
        if (!destino) return;
        e.preventDefault();
        window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY, behavior: quieto ? 'auto' : 'smooth' });
    }));

    /* --- 4. TEXTO QUE SE ENCIENDE PALABRA POR PALABRA --- */
    const textos = [...document.querySelectorAll('[data-luz]')].map(el => {
        const partir = nodo => [...nodo.childNodes].forEach(n => {
            if (n.nodeType === 3) {
                const f = document.createDocumentFragment();
                n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.appendChild(document.createTextNode(w)); else { const s = document.createElement('span'); s.className = 'tp-pal'; s.textContent = w; f.appendChild(s); } });
                n.replaceWith(f);
            } else partir(n);
        });
        partir(el);
        return { el, pals: [...el.querySelectorAll('.tp-pal')], n: -1 };
    });
    const luces = () => textos.forEach(t => {
        const r = t.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const l = quieto ? 1 : fijar((vh * 0.9 - r.top) / (r.height + vh * 0.4));
        const n = Math.round(l * t.pals.length);
        if (n === t.n) return;
        t.n = n; t.pals.forEach((w, i) => w.classList.toggle('on', i < n));
    });

    /* --- 5. APARICIONES Y CIFRAS QUE CUENTAN --- */
    const formato = n => n.toLocaleString('es-CL');
    const contar = el => {
        const fin = +el.dataset.cuenta, pre = el.dataset.pre ? `<small>${el.dataset.pre}</small>` : '';
        if (quieto) { el.innerHTML = pre + formato(fin); return; }
        const t0 = performance.now(), dur = fin > 100 ? 1600 : 900;
        const paso = ahora => { const t = fijar((ahora - t0) / dur); el.innerHTML = pre + formato(Math.round(fin * (1 - Math.pow(1 - t, 4)))); if (t < 1) requestAnimationFrame(paso); };
        requestAnimationFrame(paso);
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visto');
        e.target.querySelectorAll('[data-cuenta]').forEach(contar);
        if (e.target.matches('[data-cuenta]')) contar(e.target);
        io.unobserve(e.target);
    }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-revela], .tp-cifras, .tp-datos, .tp-cap-txt').forEach(el => io.observe(el));

    /* --- 6. MOCKUPS EN VIVO --- */
    /* Se montan cerca de la pantalla y solo animan mientras se ven; el PNG queda de póster hasta que cargan */
    const msj = (f, tipo) => { try { f.contentWindow.postMessage({ type: tipo }, '*'); } catch (err) { /* sin acceso */ } };
    const escalar = m => { const f = m.querySelector('iframe'); if (f) f.style.setProperty('--escala', (m.clientWidth / 900).toFixed(4)); };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(es => es.forEach(e => escalar(e.target))) : null;
    const cerca = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting || e.target.querySelector('iframe')) return;
        const m = e.target, f = document.createElement('iframe');
        f.title = 'Mockup animado de tapin.cl'; f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
        f.onload = () => {
            m.classList.add('listo'); if (m._ve && !quieto) msj(f, 'mockup-start'); };
        f.src = m.dataset.mk + '?frameless';
        m.appendChild(f); escalar(m); if (ro) ro.observe(m);
        cerca.unobserve(m);
    }), { rootMargin: '120% 0px' });
    const visible = new IntersectionObserver(es => es.forEach(e => {
        const m = e.target, f = m.querySelector('iframe');
        m._ve = e.isIntersecting;
        if (f && m.classList.contains('listo') && !quieto) msj(f, e.isIntersecting ? 'mockup-start' : 'mockup-stop');
    }), { threshold: 0.25 });
    document.querySelectorAll('[data-mk]').forEach(m => { cerca.observe(m); visible.observe(m); });

    /* --- 7. CEREBRO DE CONNECT: EL SVG OFICIAL, PIEZA POR PIEZA --- */
    /* Cada pieza sabe hacia dónde separarse (--dx, --dy) y lleva su número; el CSS la mueve con el scroll */
    const cer = document.querySelector('[data-cerebro]');
    if (cer) fetch('media/tp-cerebro.svg').then(r => r.text()).then(svg => {
        cer.innerHTML = svg.replace(/<\?xml[^>]*>/, '').replace(/<style>[\s\S]*?<\/style>/, '');
        const el = cer.querySelector('svg'), vb = el.viewBox.baseVal, cx = vb.width / 2, cy = vb.height / 2, ns = 'http://www.w3.org/2000/svg';
        el.removeAttribute('width'); el.removeAttribute('height'); el.setAttribute('aria-hidden', 'true');
        el.querySelectorAll('path').forEach((pth, k) => {
            pth.classList.add('tp-pieza', 'p' + (k + 1));
            const b = pth.getBBox(), bx = b.x + b.width / 2, by = b.y + b.height / 2, dx = bx - cx, dy = by - cy, l = Math.hypot(dx, dy) || 1;
            const vx = (dx / l * 70).toFixed(1) + 'px', vy = (dy / l * 70).toFixed(1) + 'px';
            pth.style.setProperty('--dx', vx); pth.style.setProperty('--dy', vy);
            const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'tp-num');
            g.style.setProperty('--dx', vx); g.style.setProperty('--dy', vy);
            g.innerHTML = `<circle cx="${bx}" cy="${by}" r="34"/><text x="${bx}" y="${by}" dy="12">${k + 1}</text>`;
            el.appendChild(g);
        });
    });

    /* --- 8. CITAS QUE ROTAN --- */
    document.querySelectorAll('[data-citas]').forEach(c => {
        const citas = [...c.querySelectorAll('blockquote')];
        if (citas.length < 2 || quieto) return;
        let k = 0;
        setInterval(() => { citas[k].classList.remove('on'); k = (k + 1) % citas.length; citas[k].classList.add('on'); }, 7000);
    });

    /* --- 9. HERO Y SIGUIENTE PROYECTO --- */
    requestAnimationFrame(() => document.querySelector('.tp-hero').classList.add('entra'));
    const C = window.CASO = {
        nombre: 'Tap In',
        siguiente: { id: 'mend', nombre: 'Mend', numero: '03', disciplinas: ['Investigación', 'Marca', 'Web app', '2026'], bajada: 'Salud articular para Atención Primaria, de la investigación al producto.', tinte: '#0D2024', url: '../works/w3-pila.html' }
    };
    const hueco = document.querySelector('[data-siguiente]');
    if (hueco && window.CASO_SIGUIENTE) {
        hueco.outerHTML = window.CASO_SIGUIENTE(C);
        (window.CASO_INICIOS || []).forEach(f => f(C, { quieto }));
    }
    pintar(); luces(); barra();
})();
/* =======================================================
   FIN JS · CASO TAP IN EDITORIAL (.tp-)
   ======================================================= */
