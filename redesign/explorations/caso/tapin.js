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
        /* Resumen: el cursor recorre el proyecto mes a mes; la credencial cambia al capítulo en curso y los
           hitos se encienden. El cursor llega a "Hoy" un poco antes del final, para que se lea quieto */
        resumen: el => {
            const cred = el.querySelector('[data-cred]'), tiempo = el.querySelector('[data-tiempo]');
            const hitos = [...el.querySelectorAll('.tp-hito')], signos = [...el.querySelectorAll('[data-signo]')];
            const pies = [...el.querySelectorAll('.tp-pie-t')];
            const CAPS = [
                { tono: '#4A3CAE', per: '2025', nom: 'El origen', txt: 'Pedir comida sin filas en la universidad, con unos cubiertos que corren' },
                { tono: '#6B5CE7', per: 'Feb a abr 2026', nom: 'El Rebirth', txt: 'De la comida a los colegios: arquitectura, paleta y el cerebro de Connect' },
                { tono: '#2D2560', per: 'Abr a sep 2026', nom: 'La web', txt: 'tapin.cl, diseñada y programada para que un director entienda en segundos' }
            ];
            let capActual = -1, ultimo = -1, mostrado = 0, encima = null, visible = 0;
            /* El texto del hito se ancla a su punto: dos capas que se alternan para fundir el cambio */
            const mostrar = i => {
                if (i === mostrado) return;
                mostrado = i;
                const h = hitos[i], m = parseFloat(h.style.getPropertyValue('--m'));
                const sale = pies[visible], entra = pies[1 - visible];
                entra.querySelector('b').textContent = h.dataset.f; entra.querySelector('span').textContent = h.dataset.t;
                entra.style.setProperty('--x', (m + 0.5).toFixed(2)); entra.style.setProperty('--ancla', (m / 21).toFixed(3));
                sale.style.setProperty('--x', (m + 0.5).toFixed(2)); sale.style.setProperty('--ancla', (m / 21).toFixed(3));
                sale.classList.remove('on'); entra.classList.add('on'); visible = 1 - visible;
            };
            hitos.forEach((h, i) => {
                const ver = () => { encima = i; mostrar(i); };
                const soltar = () => { encima = null; mostrar(Math.max(ultimo, 0)); };
                h.addEventListener('pointerenter', ver); h.addEventListener('focus', ver);
                h.addEventListener('pointerleave', soltar); h.addEventListener('blur', soltar);
            });
            /* Inclinación leve con el mouse, desde el gancho, con el brillo del plástico */
            if (!quieto && window.matchMedia('(hover: hover)').matches) {
                el.addEventListener('pointermove', e => {
                    const r = cred.getBoundingClientRect(), x = fijar((e.clientX - r.left) / r.width - 0.5, -1, 1), y = fijar((e.clientY - r.top) / r.height - 0.5, -1, 1);
                    cred.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); cred.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
                    cred.style.setProperty('--lx', (x * 36).toFixed(1) + '%'); cred.style.setProperty('--ly', (y * 36).toFixed(1) + '%');
                });
                el.addEventListener('pointerleave', () => ['--rx', '--ry', '--lx', '--ly'].forEach(v => cred.style.removeProperty(v)));
            }
            const fijo = el.querySelector('.tp-fijo'), tap = el.querySelector('.tp-tap');
            return p => {
                /* El recorrido del tiempo ocupa el 70 % de la pista; el resto es la onda de tap */
                const mes = fijar(p / 0.7) * 21.68;
                tiempo.style.setProperty('--mes', mes.toFixed(3));
                const t = fijar((p - 0.7) / 0.24);
                el.style.setProperty('--t', t.toFixed(4));
                if (t > 0) {
                    const f = fijo.getBoundingClientRect(), c = cred.getBoundingClientRect();
                    tap.style.setProperty('--ox', ((c.left + c.width / 2 - f.left) / f.width * 100).toFixed(2) + '%');
                    tap.style.setProperty('--oy', ((c.top + c.height / 2 - f.top) / f.height * 100).toFixed(2) + '%');
                }
                let u = -1;
                hitos.forEach((h, i) => { const on = parseFloat(h.style.getPropertyValue('--m')) <= mes; h.classList.toggle('on', on); if (on) u = i; });
                hitos.forEach((h, i) => h.classList.toggle('ultimo', i === u));
                const cap = mes < 13 ? 0 : mes < 15.5 ? 1 : 2;
                if (u !== ultimo) { ultimo = u; if (encima === null) mostrar(Math.max(u, 0)); }
                if (cap === capActual) return;
                capActual = cap;
                const c = CAPS[cap];
                cred.style.setProperty('--tono', c.tono);
                cred.querySelector('[data-c-num]').textContent = `0${cap + 1} / 03`;
                cred.querySelector('[data-c-per]').textContent = c.per;
                cred.querySelector('[data-c-nom]').textContent = c.nom;
                cred.querySelector('[data-c-txt]').textContent = c.txt;
                signos.forEach((sg, i) => sg.classList.toggle('on', i === cap));
            };
        },
        /* Decisión 01: el contador de formas sigue al paso en curso */
        forky: el => {
            const n = el.querySelector('[data-fk-n]');

            return p => { n.textContent = `${String(Math.min(Math.floor(p * 7), 6) + 1).padStart(2, '0')} / 07`; };
        },
        /* Decisión 02: el contador de pasos del escaneo */
        qr: el => {
            const n = el.querySelector('[data-qr-n]');
            return p => { n.textContent = `${String(Math.min(Math.floor(p * 3), 2) + 1).padStart(2, '0')} / 03`; };
        },
        /* Capítulo 01: Forky corre mientras se scrollea y se inclina según la velocidad; quieto, se detiene */
        cap: el => {
            let antes = 0, espera = null;
            return p => {
                const v = p - antes; antes = p;
                if (quieto) return;
                el.style.setProperty('--lean', fijar(v * 120, -1, 1).toFixed(3));
                el.classList.add('corriendo');
                clearTimeout(espera);
                espera = setTimeout(() => { el.classList.remove('corriendo'); el.style.setProperty('--lean', 0); }, 180);
            };
        },
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

    /* Los títulos de paso se arman palabra por palabra para que suban en cascada */
    document.querySelectorAll('.tp-rotulo-t > span').forEach(t => { t.innerHTML = t.textContent.split(' ').map((w, i) => `<i style="--w:${i}">${w}</i>`).join(' '); });

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
    let ultimoY = window.scrollY, subida = 0;
    /* Letras de los links separadas, para que rueden con el hover */
    nav.querySelectorAll('ul a').forEach(a => { const t = a.textContent.trim(); a.setAttribute('aria-label', t); a.innerHTML = [...t].map((c, i) => `<span class="c" aria-hidden="true" style="--i:${i}">${c}</span>`).join(''); });
    const barra = () => {
        const y = window.scrollY, dy = y - ultimoY;
        ultimoY = y;
        const m = modulos.find(el => { const r = el.getBoundingClientRect(); return r.top <= 32 && r.bottom > 32; });
        const hero = escenas[0];
        const resumen = escenas.find(x => x.el.dataset.escena === 'resumen');
        nav.classList.toggle('sobre-claro', !!m && ((m.classList.contains('tp-claro') && !(m === resumen.el && resumen.p > 0.86)) || (m === hero.el && hero.p > 0.62)));
        /* Se esconde al bajar; vuelve solo con una subida clara (90 px seguidos) o cerca del inicio */
        if (dy > 0) { subida = 0; if (y > 120) nav.classList.add('oculta'); }
        else if (dy < 0) { subida -= dy; if (subida > 90 || y < 120) nav.classList.remove('oculta'); }
        nav.classList.toggle('flota', y > 120);
    };
    /* La línea de tiempo del resumen lleva a cada capítulo con un desplazamiento suave */
    document.querySelectorAll('.tp-etapa').forEach(a => a.addEventListener('click', e => {
        const destino = document.querySelector(a.getAttribute('href'));
        if (!destino) return;
        e.preventDefault();
        const extra = destino.matches('.tp-cap-1') ? window.innerHeight : 0;
        window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY + extra, behavior: quieto ? 'auto' : 'smooth' });
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
        const l = quieto ? 1 : fijar((vh * 0.9 - r.top) / (r.height + vh * 0.25));
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
    /* Las cifras de la decisión 02 vuelven a contar al pasar el mouse */
    if (window.matchMedia('(hover: hover)').matches) document.querySelectorAll('.tp-datos li').forEach(li => li.addEventListener('mouseenter', () => {
        const b = li.querySelector('[data-cuenta]'), ahora = performance.now();
        if (b && ahora - (b.ultimo || 0) > 1000) { b.ultimo = ahora; contar(b); }
    }));

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

    /* --- 9. HERO VIVO CON EL MOUSE --- */
    /* Como el home, pero en clave Tap In: el sitio recostado se inclina hacia el cursor con inercia, la luz del
       fondo lo sigue, las letras del wordmark cercanas suben y el punto de la i hace "tap" al pasar sobre él */
    const heroEl = document.querySelector('.tp-hero');
    requestAnimationFrame(() => heroEl.classList.add('entra'));
    /* El navegador del hero carga tapin.cl de verdad, sin scroll; deja de pintarse cuando el hero sale */
    const pantalla = heroEl.querySelector('[data-sitio]');
    if (pantalla) {
        const sitio = document.createElement('iframe');
        sitio.title = 'tapin.cl'; sitio.setAttribute('tabindex', '-1'); sitio.setAttribute('aria-hidden', 'true'); sitio.setAttribute('scrolling', 'no');
        sitio.onload = () => {
            try {
                const d = sitio.contentDocument, st = d.createElement('style');
                st.textContent = 'html,body{overflow:hidden!important;scrollbar-width:none}html::-webkit-scrollbar{display:none}';
                d.head.appendChild(st);
                /* El sitio pausa las animaciones de las secciones que cree fuera de pantalla; dentro del navegador
                   inclinado su detector se equivoca con el hero, así que el hero queda siempre activo */
                const hero = d.querySelector('section'), soltar = () => { if (hero.classList.contains('is-offscreen')) hero.classList.remove('is-offscreen'); };
                if (hero) { soltar(); new sitio.contentWindow.MutationObserver(soltar).observe(hero, { attributes: true, attributeFilter: ['class'] }); }
            } catch (err) { /* sin acceso */ }
            pantalla.classList.add('listo');
        };
        sitio.src = pantalla.dataset.sitio;
        pantalla.appendChild(sitio);
        new IntersectionObserver(es => es.forEach(e => { sitio.style.visibility = e.isIntersecting ? '' : 'hidden'; })).observe(heroEl);
    }
    const wm = heroEl.querySelector('.tp-wm-vivo');
    wm.querySelectorAll('[data-letra]').forEach((l, i) => l.style.setProperty('--l', i));
    if (!quieto && window.matchMedia('(hover: hover)').matches) {
        const letras = [...wm.querySelectorAll('[data-letra]')];
        let tx = 0, ty = 0, x = 0, y = 0, cx = -9999, cy = -9999, corre = false, centros = [];
        const medir = () => { centros = letras.map(l => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); };
        const ola = () => {
            if (!centros.length) medir();
            letras.forEach((l, i) => { const c = centros[i], d = Math.hypot(cx - c.x, (cy - c.y) * 0.6); l.style.translate = `0 ${(-Math.exp(-(d * d) / (2 * 110 * 110)) * 16).toFixed(2)}px`; });
        };
        const paso = () => {
            x += (tx - x) * 0.07; y += (ty - y) * 0.07;
            heroEl.style.setProperty('--mx', x.toFixed(4)); heroEl.style.setProperty('--my', y.toFixed(4));
            if (Math.abs(tx - x) + Math.abs(ty - y) > 0.0008) requestAnimationFrame(paso); else corre = false;
        };
        const ir = (a, b) => { tx = a; ty = b; if (!corre) { corre = true; requestAnimationFrame(paso); } };
        heroEl.addEventListener('pointermove', e => { const r = heroEl.querySelector('.tp-fijo').getBoundingClientRect(); cx = e.clientX; cy = e.clientY; ir((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5); ola(); });
        heroEl.addEventListener('pointerleave', () => { cx = cy = -9999; ir(0, 0); ola(); });
        window.addEventListener('scroll', () => { centros = []; }, { passive: true });
        window.addEventListener('resize', () => { centros = []; });
        wm.addEventListener('pointerenter', () => { if (!wm.classList.contains('tap')) wm.classList.add('tap'); });
        wm.addEventListener('animationend', e => { if (e.target.classList.contains('tp-wm-onda')) wm.classList.remove('tap'); });
    }

    /* --- 10. SIGUIENTE PROYECTO --- */
    const C = window.CASO = {
        nombre: 'Tap In',
        siguiente: { id: 'mend', nombre: 'Mend', numero: '03', disciplinas: ['Investigación', 'Marca', 'Web app', '2026'], bajada: 'Salud articular para Atención Primaria, de la investigación al producto.', tinte: '#0D2024', url: '../works/w3-pila.html' }
    };
    const hueco = document.querySelector('[data-siguiente]');
    if (hueco && window.CASO_SIGUIENTE) {
        hueco.outerHTML = window.CASO_SIGUIENTE(C);
        (window.CASO_INICIOS || []).forEach(f => f(C, { quieto }));
    }

    /* --- 11. GALERÍAS DE LAS ACTIVACIONES --- */
    /* Riel con snap: flechas, contador y barra de avance; con el mouse se arrastra y con el teclado se recorre */
    document.querySelectorAll('[data-carrusel]').forEach(car => {
        const pista = car.querySelector('[data-car-pista]'), figs = [...pista.children], n = car.querySelector('[data-car-n]');
        const ant = car.querySelector('[data-car-ant]'), sig = car.querySelector('[data-car-sig]');
        const lugar = f => f.offsetLeft - figs[0].offsetLeft, fin = () => pista.scrollWidth - pista.clientWidth;
        const cerca = () => figs.reduce((m, f, i) => Math.abs(lugar(f) - pista.scrollLeft) < Math.abs(lugar(figs[m]) - pista.scrollLeft) ? i : m, 0);
        const marcar = () => {
            const alFinal = pista.scrollLeft >= fin() - 4;
            n.textContent = String((alFinal ? figs.length - 1 : cerca()) + 1).padStart(2, '0');
            car.style.setProperty('--avance', fin() > 0 ? (pista.scrollLeft / fin()).toFixed(3) : 1);
            ant.disabled = pista.scrollLeft <= 4; sig.disabled = alFinal;
        };
        const ir = d => { const i = fijar(cerca() + d, 0, figs.length - 1); pista.scrollTo({ left: Math.min(lugar(figs[i]), fin()), behavior: quieto ? 'auto' : 'smooth' }); };
        ant.addEventListener('click', () => ir(-1));
        sig.addEventListener('click', () => ir(1));
        pista.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); ir(e.key === 'ArrowLeft' ? -1 : 1); } });
        let pendiente = false;
        pista.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; marcar(); }); } }, { passive: true });
        let x0 = null, s0 = 0;
        pista.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; x0 = e.clientX; s0 = pista.scrollLeft; pista.classList.add('arrastrando'); pista.setPointerCapture(e.pointerId); });
        pista.addEventListener('pointermove', e => { if (x0 !== null) pista.scrollLeft = s0 - (e.clientX - x0); });
        const soltar = () => { if (x0 === null) return; x0 = null; ir(0); setTimeout(() => pista.classList.remove('arrastrando'), quieto ? 0 : 450); };
        pista.addEventListener('pointerup', soltar);
        pista.addEventListener('pointercancel', soltar);
        window.addEventListener('resize', marcar);
        marcar();
    });

    pintar(); luces(); barra();
})();
/* =======================================================
   FIN JS · CASO TAP IN EDITORIAL (.tp-)
   ======================================================= */
