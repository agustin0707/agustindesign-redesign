/* =======================================================
   INICIO JS · EVIDENCIA (SITIO REAL AL LADO DEL RELATO)
   ======================================================= */
/* Mecánica común a todos los casos. Cada tramo de decisiones (todo el caso o un capítulo) es una sección
   [data-evidencia] con su relato y su escenario. Una decisión con "ancla" lleva el sitio en vivo a esa parte:
   scroll (fijo) o sel (sección a la que bajar), marco (qué señalar), nota, abrir (agrega .is-open) y demo
   (activa elementos en secuencia). Sin ancla, el escenario muestra la pieza de esa decisión */
(function () {
    const C = window.CASO;
    const n2 = i => String(i + 1).padStart(2, '0');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const escritorio = () => window.matchMedia('(min-width: 901px)').matches;
    const avance = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const tramo = sec => {
        const bloques = [...sec.querySelectorAll('.bloque')];
        const capas = [...sec.querySelectorAll('[data-capa]')];
        const botones = [...sec.querySelectorAll('.riel-ev [data-ir]')];
        const vitrina = sec.querySelector('[data-vitrina]');
        const nota = sec.querySelector('[data-nota]'), estado = sec.querySelector('[data-estado]');
        const pantalla = vitrina && vitrina.querySelector('.pantalla');
        const resalte = vitrina && vitrina.querySelector('[data-resalte]'), resalteTxt = resalte && resalte.querySelector('.r-txt');
        let iframe = null, win = null, doc = null, listo = false, actual = -1, abierto = null, demo = null, raf = null, remedir = null;

        /* --- 1. SITIO EN VIVO (SOLO SI EL TRAMO LO USA) --- */
        /* Se monta en reposo cuando el tramo está a menos de dos pantallas: no compite con lo que se ve arriba */
        const escalar = () => {
            if (!iframe) return 1;
            const e = pantalla.clientWidth / 1440;
            iframe.style.setProperty('--escala', e.toFixed(4));
            iframe.style.height = Math.ceil(pantalla.clientHeight / e) + 'px';
            return e;
        };
        const montar = () => {
            if (!vitrina || iframe || !escritorio()) return;
            iframe = document.createElement('iframe');
            iframe.title = `Sitio de ${C.nombre}`; iframe.setAttribute('tabindex', '-1');
            pantalla.insertBefore(iframe, resalte);
            escalar();
            iframe.onload = () => {
                try { win = iframe.contentWindow; doc = iframe.contentDocument; } catch (err) { return; }
                const estilo = doc.createElement('style');
                estilo.textContent = 'html{scrollbar-width:none;scroll-behavior:auto!important}html::-webkit-scrollbar{display:none}';
                doc.head.appendChild(estilo);
                setTimeout(() => { listo = true; vitrina.classList.add('cargado'); estado.textContent = 'Sitio en vivo'; const a = actual; actual = -1; activar(Math.max(a, 0)); }, +C.introSitio || 2400);
            };
            iframe.src = C.sitio;
        };
        if (vitrina) {
            estado.textContent = 'Cargando el sitio…';
            let quietud;
            const enReposo = () => { clearTimeout(quietud); quietud = setTimeout(() => { if (sec.getBoundingClientRect().top < window.innerHeight * 2.2) montar(); }, 400); };
            window.addEventListener('scroll', enReposo, { passive: true });
            if (document.readyState === 'complete') enReposo(); else window.addEventListener('load', enReposo);
        }

        /* --- 2. LLEVAR EL SITIO A LA PARTE DE CADA DECISIÓN --- */
        const desplazar = (hasta, alTerminar) => {
            cancelAnimationFrame(raf);
            const desde = win.scrollY, dur = quieto ? 1 : Math.min(500 + Math.abs(hasta - desde) * 0.18, 1200), t0 = performance.now();
            const paso = ahora => {
                const t = Math.min((ahora - t0) / dur, 1);
                win.scrollTo({ top: desde + (hasta - desde) * avance(t), behavior: 'instant' });
                if (t < 1) raf = requestAnimationFrame(paso); else alTerminar();
            };
            raf = requestAnimationFrame(paso);
        };
        /* El foco envuelve la unión de las cajas indicadas; afuera, el sitio se desenfoca y se apaga */
        const marcar = (d, i) => {
            if (actual !== i) return;
            const e = escalar(), sel = d.ancla.marco || d.ancla.sel;
            const cajas = [...doc.querySelectorAll(sel)].map(el => el.getBoundingClientRect()).filter(r => r.width && r.height && r.bottom > 0 && r.top < win.innerHeight);
            if (!cajas.length) { resalte.classList.remove('on'); return; }
            const pad = 10 / e;
            const x0 = Math.max(Math.min(...cajas.map(r => r.left)) - pad, 0), y0 = Math.max(Math.min(...cajas.map(r => r.top)) - pad, 0);
            const x1 = Math.min(Math.max(...cajas.map(r => r.right)) + pad, 1440), y1 = Math.min(Math.max(...cajas.map(r => r.bottom)) + pad, win.innerHeight);
            [['--x', x0], ['--y', y0], ['--w', x1 - x0], ['--h', y1 - y0]].forEach(([k, v]) => resalte.style.setProperty(k, (v * e).toFixed(1) + 'px'));
            /* La etiqueta va arriba del foco; si no hay espacio, abajo */
            resalte.classList.toggle('etq-abajo', y0 * e < 34);
            resalteTxt.textContent = d.ancla.nota || `Decisión ${n2(i)}`;
            resalte.classList.add('on');
        };
        const demostrar = (d, i) => {
            clearInterval(demo);
            if (!d.ancla.demo || quieto) return;
            const els = [...doc.querySelectorAll(d.ancla.demo.sel)];
            if (!els.length) return;
            let k = 0;
            demo = setInterval(() => {
                if (actual !== i) { clearInterval(demo); return; }
                k = (k + 1) % els.length;
                els[k].dispatchEvent(new MouseEvent(d.ancla.demo.evento || 'mouseenter', { bubbles: true }));
                setTimeout(() => marcar(d, i), 450);
            }, d.ancla.demo.cada || 1400);
        };
        const activar = i => {
            if (i === actual || i < 0) return;
            actual = i;
            const d = C.decisiones[i];
            bloques.forEach(b => b.classList.toggle('actual', +b.dataset.i === i));
            botones.forEach(b => { b.classList.toggle('actual', +b.dataset.ir === i); b.classList.toggle('ya', +b.dataset.ir < i); });
            /* Avisa a la capa que entra o sale, para que sus piezas vivas arranquen o se detengan */
            capas.forEach(c => {
                const on = +c.dataset.capa === i;
                if (on !== c.classList.contains('on')) c.dispatchEvent(new CustomEvent(on ? 'capa-on' : 'capa-off', { bubbles: true }));
                c.classList.toggle('on', on);
            });
            if (vitrina) vitrina.classList.toggle('on', !!d.ancla);
            nota.textContent = d.ancla ? (d.ancla.nota ? `Marcado: ${d.ancla.nota}` : '') : (d.pieza.nota || '');
            clearInterval(demo); clearTimeout(remedir);
            if (abierto) { abierto.classList.remove('is-open'); abierto = null; }
            if (resalte) resalte.classList.remove('on');
            if (!d.ancla || !listo) return;
            const el = d.ancla.sel && doc.querySelector(d.ancla.sel);
            const max = doc.documentElement.scrollHeight - win.innerHeight;
            const hasta = d.ancla.scroll !== undefined ? d.ancla.scroll : el ? Math.min(el.getBoundingClientRect().top + win.scrollY, max) : 0;
            desplazar(hasta, () => {
                if (actual !== i) return;
                if (d.ancla.abrir) { abierto = doc.querySelector(d.ancla.abrir); if (abierto) abierto.classList.add('is-open'); }
                setTimeout(() => marcar(d, i), d.ancla.abrir ? 380 : 140);
                /* Segunda medida: el sitio anima lo que entra en pantalla y las cajas pueden moverse */
                remedir = setTimeout(() => marcar(d, i), 1100);
                demostrar(d, i);
            });
        };

        /* --- 3. DECISIÓN ACTUAL SEGÚN EL SCROLL --- */
        const pintar = () => {
            if (!escritorio()) return;
            const r = sec.getBoundingClientRect();
            if (r.bottom < 0 || r.top > window.innerHeight) return;
            const mitad = window.innerHeight * 0.5;
            let i = +bloques[0].dataset.i;
            bloques.forEach(b => { if (b.getBoundingClientRect().top < mitad) i = +b.dataset.i; });
            activar(i);
        };
        const ir = i => {
            const b = bloques.find(x => +x.dataset.i === i);
            if (!b) return false;
            window.scrollTo({ top: b.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3, behavior: quieto ? 'auto' : 'smooth' });
            return true;
        };
        botones.forEach(b => b.addEventListener('click', () => ir(+b.dataset.ir)));
        /* Si el marco cambia de tamaño (la barra se esconde y el escenario crece), el sitio se reescala y se vuelve a marcar */
        if (pantalla && 'ResizeObserver' in window) {
            let espera;
            new ResizeObserver(() => { clearTimeout(espera); espera = setTimeout(() => { if (!iframe) return; escalar(); const a = actual; if (a >= 0 && C.decisiones[a].ancla && listo) { actual = -1; activar(a); } }, 480); }).observe(pantalla);
        }
        return { sec, pintar, ir, actual: () => actual, escalar: () => { escalar(); const a = actual; actual = -1; activar(a); } };
    };

    const tramos = [...document.querySelectorAll('[data-evidencia]')].map(tramo);
    let pendiente = false;
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; tramos.forEach(t => t.pintar()); }); } }, { passive: true });
    window.addEventListener('resize', () => tramos.forEach(t => t.escalar()));
    tramos.forEach(t => t.pintar());

    /* --- 4. ATAJOS J / K --- */
    /* Funcionan en el tramo que ocupa la pantalla y saltan entre decisiones de todo el caso */
    document.addEventListener('keydown', e => {
        const paso = { j: 1, k: -1 }[e.key.toLowerCase()];
        if (!paso || e.metaKey || e.ctrlKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
        const t = tramos.find(x => { const r = x.sec.getBoundingClientRect(); return r.top < window.innerHeight * 0.6 && r.bottom > window.innerHeight * 0.4; });
        if (!t) return;
        const destino = Math.max(t.actual(), 0) + paso;
        if (!tramos.some(x => x.ir(destino))) return;
        const kbd = t.sec.querySelector(`.riel-ev kbd[data-k="${e.key.toLowerCase()}"]`);
        if (kbd) { kbd.classList.add('on'); setTimeout(() => kbd.classList.remove('on'), 160); }
    });
})();
/* =======================================================
   FIN JS · EVIDENCIA (SITIO REAL AL LADO DEL RELATO)
   ======================================================= */
