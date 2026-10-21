/* =======================================================
   INICIO JS · CASO 3 EVIDENCIA
   ======================================================= */
(function () {
    const C = window.CASO;
    const n2 = i => String(i + 1).padStart(2, '0');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const escritorio = () => window.matchMedia('(min-width: 901px)').matches;

    /* --- 1. RELATO Y CAPAS DE MARCA --- */
    const relato = document.querySelector('[data-relato]'), escenario = document.querySelector('[data-escenario]');
    relato.innerHTML = C.decisiones.map((d, i) => `
        <article class="bloque" id="d-${d.id}">
            <span class="num etiqueta">Decisión ${n2(i)}</span>
            <h3 data-letras>${d.titulo}</h3>
            <p>${d.texto}</p>
            <p class="porque"><span class="etiqueta">Por qué</span>${d.porque}</p>
            <div class="pz-solo">${window.CASO_PIEZA(d)}</div>
        </article>`).join('');
    /* Las decisiones sin parte del sitio que mostrar (marca) tienen su propia capa en el escenario */
    C.decisiones.forEach((d, i) => { if (!d.ancla) escenario.insertAdjacentHTML('beforeend', `<div class="capa" data-capa="${i}">${window.CASO_PIEZA(d)}</div>`); });
    const bloques = [...relato.querySelectorAll('.bloque')];
    const capas = [...escenario.querySelectorAll('.capa')];
    const vitrina = document.querySelector('[data-vitrina]'), pantalla = vitrina.querySelector('.pantalla');
    const resalte = document.querySelector('[data-resalte]'), resalteTxt = resalte.querySelector('span');

    /* --- 2. SITIO EN VIVO --- */
    /* Se monta cerca de la sección y con el scroll detenido (cargarlo durante el scroll lo haría saltar).
       Espera a que termine la entrada del sitio antes de mostrarse */
    let iframe = null, win = null, doc = null, listo = false, actual = -1, abierto = null;
    const escalar = () => {
        if (!iframe) return;
        const e = pantalla.clientWidth / 1440;
        iframe.style.setProperty('--escala', e.toFixed(4));
        iframe.style.height = Math.ceil(pantalla.clientHeight / e) + 'px';
        return e;
    };
    const montar = () => {
        if (iframe || !escritorio()) return;
        iframe = document.createElement('iframe');
        iframe.title = 'Sitio de Tap In'; iframe.setAttribute('tabindex', '-1');
        pantalla.insertBefore(iframe, resalte);
        escalar();
        iframe.onload = () => {
            try { win = iframe.contentWindow; doc = iframe.contentDocument; } catch (err) { return; }
            const estilo = doc.createElement('style');
            estilo.textContent = 'html{scrollbar-width:none;scroll-behavior:auto!important}html::-webkit-scrollbar{display:none}';
            doc.head.appendChild(estilo);
            setTimeout(() => { listo = true; vitrina.classList.add('cargado'); const a = actual; actual = -1; activar(Math.max(a, 0)); }, 2400);
        };
        iframe.src = C.sitio;
    };
    const seccion = document.getElementById('decisiones');
    let quietud;
    const revisar = () => { const r = seccion.getBoundingClientRect(); if (r.top < window.innerHeight * 1.5 && r.bottom > 0) montar(); };
    window.addEventListener('scroll', () => { clearTimeout(quietud); quietud = setTimeout(revisar, 300); }, { passive: true });
    revisar();

    /* --- 3. LLEVAR EL SITIO A LA PARTE DE CADA DECISIÓN --- */
    const avance = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let raf;
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
    /* El marco envuelve todas las piezas indicadas (unión de sus cajas), en coordenadas de la vitrina */
    const marcar = (d, i) => {
        const e = escalar(), sel = d.ancla.marco || d.ancla.sel;
        const cajas = [...doc.querySelectorAll(sel)].map(el => el.getBoundingClientRect()).filter(r => r.width && r.height && r.bottom > 0 && r.top < win.innerHeight);
        if (!cajas.length) { resalte.classList.remove('on'); return; }
        const pad = 10 / e;
        const x0 = Math.max(Math.min(...cajas.map(r => r.left)) - pad, 0), y0 = Math.max(Math.min(...cajas.map(r => r.top)) - pad, 0);
        const x1 = Math.min(Math.max(...cajas.map(r => r.right)) + pad, 1440), y1 = Math.min(Math.max(...cajas.map(r => r.bottom)) + pad, win.innerHeight);
        [['--x', x0], ['--y', y0], ['--w', x1 - x0], ['--h', y1 - y0]].forEach(([k, v]) => resalte.style.setProperty(k, (v * e).toFixed(1) + 'px'));
        resalteTxt.textContent = `Decisión ${n2(i)}`;
        resalte.classList.add('on');
    };
    const activar = i => {
        if (i === actual || i < 0) return;
        actual = i;
        bloques.forEach((b, k) => b.classList.toggle('actual', k === i));
        const d = C.decisiones[i];
        capas.forEach(c => c.classList.toggle('on', +c.dataset.capa === i));
        vitrina.classList.toggle('on', !!d.ancla);
        if (!d.ancla || !listo) { resalte.classList.remove('on'); return; }
        /* Cierra lo que abrió la decisión anterior (el menú desplegable) y abre lo de esta */
        if (abierto) { abierto.classList.remove('is-open'); abierto = null; }
        resalte.classList.remove('on');
        const el = d.ancla.sel && doc.querySelector(d.ancla.sel);
        const max = doc.documentElement.scrollHeight - win.innerHeight;
        const hasta = d.ancla.scroll !== undefined ? d.ancla.scroll : el ? Math.min(el.getBoundingClientRect().top + win.scrollY, max) : 0;
        desplazar(hasta, () => {
            if (actual !== i) return;
            if (d.ancla.abrir) { abierto = doc.querySelector(d.ancla.abrir); if (abierto) abierto.classList.add('is-open'); }
            setTimeout(() => { if (actual === i) marcar(d, i); }, d.ancla.abrir ? 380 : 120);
        });
    };

    /* --- 4. DECISIÓN ACTUAL SEGÚN EL SCROLL --- */
    /* La actual es el bloque que cruza la mitad de la pantalla */
    let pendiente = false;
    const pintar = () => {
        pendiente = false;
        if (!escritorio()) return;
        const mitad = window.innerHeight * 0.5;
        let i = 0;
        bloques.forEach((b, k) => { if (b.getBoundingClientRect().top < mitad) i = k; });
        activar(i);
    };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }, { passive: true });
    window.addEventListener('resize', () => { escalar(); const a = actual; actual = -1; activar(a); });
    pintar();
})();
/* =======================================================
   FIN JS · CASO 3 EVIDENCIA
   ======================================================= */
