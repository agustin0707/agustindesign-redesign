/* =======================================================
   INICIO JS · WORKS 3 PILA
   ======================================================= */
(function () {
    const pila = document.getElementById('pila');
    const paneles = [...pila.querySelectorAll('.panel')];
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conMouse = window.matchMedia('(hover: hover)').matches;

    /* --- 1. CUÁNTO CUBRE EL SIGUIENTE --- */
    /* Para cada panel, el progreso del siguiente subiendo sobre él define --q. Solo se escribe si cambió */
    let pendiente = false;
    const ultimo = new Map();
    const pintar = () => {
        pendiente = false;
        const h = window.innerHeight;
        paneles.forEach((p, i) => {
            const sig = paneles[i + 1] || document.querySelector('.hoja');
            const q = quieto ? 0 : Math.min(Math.max(1 - sig.getBoundingClientRect().top / h, 0), 1);
            const v = q.toFixed(3);
            if (ultimo.get(p) !== v) { p.style.setProperty('--q', v); ultimo.set(p, v); }
        });
    };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } }, { passive: true });
    window.addEventListener('resize', pintar);
    pintar();

    /* --- 2. SALTOS A CADA PROYECTO Y AL ARCHIVO --- */
    /* Los paneles son sticky: su lugar real es el inicio de la pila más n pantallas y n huecos */
    const irA = y => window.scrollTo({ top: y, behavior: quieto ? 'auto' : 'smooth' });
    document.querySelectorAll('[data-salto]').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        const i = paneles.findIndex(p => '#' + p.id === a.getAttribute('href'));
        const hueco = parseFloat(getComputedStyle(pila).getPropertyValue('--hueco')) || 0;
        irA(pila.getBoundingClientRect().top + window.scrollY + i * (window.innerHeight + hueco));
    }));
    document.querySelectorAll('a[href="#archivo"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); irA(document.getElementById('archivo').getBoundingClientRect().top + window.scrollY); }));

    /* --- 3. TÍTULOS QUE ENTRAN LETRA A LETRA --- */
    /* Mismo gesto del nombre del hero, disparado cuando el título entra en pantalla (sin la ola del cursor) */
    document.querySelectorAll('[data-letras]').forEach(el => {
        const texto = el.textContent.trim();
        el.setAttribute('aria-label', texto);
        let i = 0;
        el.innerHTML = texto.split(/(\s+)/).map(p => /^\s+$/.test(p) ? ' ' : '<span class="palabra" aria-hidden="true">' + [...p].map(c => `<span class="l" style="animation-delay:${(i++) * 32}ms">${c}</span>`).join('') + '</span>').join('');
    });
    const ioLetras = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('entra'); ioLetras.unobserve(e.target); } }), { threshold: 0.4 });
    document.querySelectorAll('[data-letras]').forEach(el => ioLetras.observe(el));

    /* --- 4. SITIOS EN VIVO DENTRO DEL NAVEGADOR --- */
    /* Solo con mouse o teclado. El sitio se carga en segundo plano cuando el panel queda quieto en pantalla y
       espera a que termine su animación de entrada: al pasar el mouse ya está idéntico a la portada, el cambio
       no se nota (sin parpadeo) y baja solo de inmediato, con las animaciones de cada sección a su ritmo.
       Se desmonta cuando el panel sale o queda cubierto, para no consumir recursos en segundo plano */
    const laminasSitio = [...pila.querySelectorAll('.lamina[data-sitio]')];
    const escalar = l => {
        const pantalla = l.querySelector('.navegador .pantalla'), iframe = pantalla.querySelector('iframe');
        if (!iframe) return;
        const escala = pantalla.clientWidth / 1440;
        iframe.style.setProperty('--escala', escala.toFixed(4));
        iframe.style.height = Math.ceil(pantalla.clientHeight / escala) + 'px';
    };
    /* Velocidad casi constante: acelera y frena en los extremos (8% del tiempo cada uno) y es pareja al medio,
       para que ninguna sección pase demasiado rápido */
    const A = 0.08;
    const avance = t => (t < A ? t * t / (2 * A * (1 - A)) : t > 1 - A ? 1 - (1 - t) * (1 - t) / (2 * A * (1 - A)) : (t - A / 2) / (1 - A));
    const recorrer = l => {
        const iframe = l.querySelector('iframe');
        let win, doc;
        try { win = iframe.contentWindow; doc = iframe.contentDocument; } catch (err) { return; }
        if (!win || !doc) return;
        /* Baja hasta el final del sitio a la velocidad de data-velocidad (px de sitio por segundo) */
        const desde = win.scrollY, hasta = Math.max(doc.documentElement.scrollHeight - win.innerHeight, 0);
        const duracion = Math.max((hasta - desde) / (+l.dataset.velocidad || 320), 0.5) * 1000;
        const inicio = performance.now();
        const paso = ahora => {
            const t = Math.min((ahora - inicio) / duracion, 1);
            /* "instant" evita que el scroll suave propio del sitio reinicie el movimiento en cada cuadro */
            win.scrollTo({ top: desde + (hasta - desde) * avance(t), behavior: 'instant' });
            if (t < 1 && l.classList.contains('vivo')) l._raf = requestAnimationFrame(paso);
        };
        l._raf = requestAnimationFrame(paso);
    };
    const mostrar = l => {
        l.classList.remove('cargando');
        l.classList.add('vivo', 'listo');
        clearTimeout(l._espera);
        l._espera = setTimeout(() => { if (l.classList.contains('vivo')) recorrer(l); }, 450);
    };
    const montar = l => {
        if (l._montado) return;
        l._montado = true; l._preparado = false;
        const iframe = document.createElement('iframe');
        iframe.title = 'Vista previa del sitio';
        iframe.setAttribute('tabindex', '-1');
        iframe.setAttribute('aria-hidden', 'true');
        l.querySelector('.navegador .pantalla').appendChild(iframe);
        escalar(l);
        const larga = l.querySelector('.larga'); if (larga) larga.loading = 'eager';
        iframe.onload = () => {
            if (!l._montado) return;
            /* Sin barra de scroll dentro del mockup (con mouse conectado, macOS la muestra siempre) */
            try {
                const estilo = iframe.contentDocument.createElement('style');
                estilo.textContent = 'html{scrollbar-width:none}html::-webkit-scrollbar{display:none}';
                iframe.contentDocument.head.appendChild(estilo);
            } catch (err) { /* sitio de otro dominio: se deja como está */ }
            /* Espera a que la entrada del sitio termine antes de darlo por listo */
            l._intro = setTimeout(() => { l._preparado = true; if (l._quiere) mostrar(l); }, +l.dataset.intro || 2400);
        };
        iframe.src = l.dataset.sitio;
    };
    const desmontar = l => {
        if (!l._montado) return;
        l._montado = l._preparado = false;
        clearTimeout(l._intro); clearTimeout(l._espera); cancelAnimationFrame(l._raf);
        l.classList.remove('vivo', 'listo', 'cargando');
        const f = l.querySelector('iframe'); if (f) f.remove();
    };
    const encender = l => {
        l._quiere = true;
        if (l._preparado) { mostrar(l); return; }
        l.classList.add('cargando');
        montar(l);
    };
    const apagar = l => {
        l._quiere = false;
        clearTimeout(l._espera); cancelAnimationFrame(l._raf);
        l.classList.remove('vivo', 'listo', 'cargando');
        /* Detrás de la portada, el sitio vuelve arriba para la próxima pasada */
        clearTimeout(l._volver);
        l._volver = setTimeout(() => {
            const f = l.querySelector('iframe');
            try { if (f && !l._quiere) f.contentWindow.scrollTo({ top: 0, behavior: 'instant' }); } catch (err) { /* nada */ }
        }, 500);
    };
    if (!quieto && conMouse) {
        /* Se monta solo con el panel completo en pantalla y el scroll detenido: cargar un sitio durante el
           scroll comparte el hilo principal y haría saltar el movimiento de la pila */
        const enVista = new Set();
        let quietud;
        const revisar = () => laminasSitio.forEach(l => { if (enVista.has(l)) montar(l); });
        const io = new IntersectionObserver(es => es.forEach(e => {
            if (e.intersectionRatio >= 0.9) enVista.add(e.target);
            else { enVista.delete(e.target); if (!e.isIntersecting) desmontar(e.target); }
        }), { threshold: [0, 0.9] });
        laminasSitio.forEach(l => io.observe(l));
        window.addEventListener('scroll', () => { clearTimeout(quietud); quietud = setTimeout(revisar, 350); }, { passive: true });
        setTimeout(revisar, 350);
        /* Un panel cubierto por el siguiente sigue "en pantalla" para el observador: se desmonta por --q */
        window.addEventListener('scroll', () => laminasSitio.forEach(l => {
            const q = parseFloat(l.closest('.panel').style.getPropertyValue('--q')) || 0;
            if (q > 0.6) { enVista.delete(l); desmontar(l); }
        }), { passive: true });
        laminasSitio.forEach(l => {
            l.addEventListener('mouseenter', () => encender(l)); l.addEventListener('mouseleave', () => apagar(l));
            l.addEventListener('focus', () => encender(l)); l.addEventListener('blur', () => apagar(l));
        });
        window.addEventListener('resize', () => laminasSitio.forEach(escalar));
    }

    /* --- 5. ARRANQUE DE LA APP (MEND) --- */
    const laminaApp = pila.querySelector('.lamina[data-app]');
    if (laminaApp && !quieto) {
        const on = () => laminaApp.classList.add('arranca'), off = () => laminaApp.classList.remove('arranca');
        if (conMouse) { laminaApp.addEventListener('mouseenter', on); laminaApp.addEventListener('mouseleave', off); }
        laminaApp.addEventListener('focus', on); laminaApp.addEventListener('blur', off);

        /* El logo se dibuja cuando la lámina entra en pantalla y se rearma al salir, para la próxima pasada */
        const escenaMend = laminaApp.querySelector('.escena-mend');
        new IntersectionObserver(es => es.forEach(e => {
            if (e.intersectionRatio >= 0.6) escenaMend.classList.add('logo');
            else if (!e.isIntersecting) escenaMend.classList.remove('logo');
        }), { threshold: [0, 0.6] }).observe(laminaApp);
    }

    /* --- 6. VISTA PREVIA EN MÓVIL --- */
    /* Sin mouse: la captura larga baja sola y la app de Mend arranca cuando la lámina está casi completa */
    if (!conMouse && !quieto) {
        const io = new IntersectionObserver(es => es.forEach(e => {
            const ver = e.intersectionRatio > 0.75;
            e.target.classList.toggle('viendo', ver);
            if (e.target.hasAttribute('data-app')) e.target.classList.toggle('arranca', ver);
        }), { threshold: [0, 0.75, 1] });
        pila.querySelectorAll('.lamina').forEach(l => io.observe(l));
    }

    /* --- 7. ARCHIVO: HOJA DE CONTACTOS --- */
    /* Cada fila con su línea de contexto y su tira de piezas. Con mouse, la tira se recorre siguiendo la posición
       horizontal del cursor sobre la fila, con inercia: borde izquierdo es la primera pieza, borde derecho la última */
    const hoja = document.querySelector('[data-hoja]');
    if (hoja) {
        hoja.innerHTML = window.WORKS.archivo.map(([nombre, disc, anio, , piezas, contexto], i) => `
            <li class="ficha" style="--retraso:${i * 90}ms"><a href="#">
                <span class="f-num mono gris">${String(i + 1).padStart(2, '0')}</span>
                <span class="f-texto">
                    <span class="f-nombre">${nombre}<span class="f-flecha" aria-hidden="true">↗</span></span>
                    <span class="f-contexto">${contexto}</span>
                    <span class="f-disc mono gris">${disc}</span>
                </span>
                <span class="f-tira" aria-hidden="true"><span class="f-tira-in">${piezas.map(([archivo, ancho]) => `<img src="media/archivo/${archivo}.webp" width="${ancho}" height="440" alt="" loading="lazy" decoding="async">`).join('')}</span></span>
                <span class="f-anio mono"><span>${anio}</span><span class="gris">${String(piezas.length).padStart(2, '0')} piezas</span></span>
            </a></li>`).join('');
        const fichas = [...hoja.querySelectorAll('.ficha')];
        const medir = () => fichas.forEach(f => {
            const tira = f.querySelector('.f-tira'), interior = f.querySelector('.f-tira-in');
            f._corre = Math.max(interior.scrollWidth - tira.clientWidth + 24, 0);
        });
        medir();
        window.addEventListener('resize', medir);

        if (!quieto) fichas.forEach(f => {
            const a = f.querySelector('a'), tira = f.querySelector('.f-tira'), interior = f.querySelector('.f-tira-in');
            let x = 0, destino = 0, corre = false;
            const paso = () => {
                x += (destino - x) * 0.085;
                interior.style.transform = `translate3d(${(-x).toFixed(1)}px, 0, 0)`;
                if (Math.abs(destino - x) > 0.3) requestAnimationFrame(paso); else corre = false;
            };
            const ir = v => { destino = v; if (!corre) { corre = true; requestAnimationFrame(paso); } };
            if (conMouse) {
                a.addEventListener('mousemove', e => {
                    const r = tira.getBoundingClientRect();
                    ir(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1) * f._corre);
                });
                a.addEventListener('mouseleave', () => ir(0));
            }
            /* Con teclado, al enfocar la fila la tira se recorre completa */
            a.addEventListener('focus', () => { if (a.matches(':focus-visible')) ir(f._corre); });
            a.addEventListener('blur', () => ir(0));
        });

        /* Al entrar, la tira se revela y carga todas sus piezas (las ocultas a la derecha no se cargarían solas antes de recorrerse) */
        const ioFichas = new IntersectionObserver(es => es.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
            e.target.classList.add('entra'); ioFichas.unobserve(e.target);
        }), { threshold: 0.3 });
        fichas.forEach(f => ioFichas.observe(f));
    }

    /* --- 8. ENTRAR AL CASO --- */
    /* La escena completa viaja y se abre a sangre como portada del caso. Si el proyecto ya tiene su página
       (data-url), al terminar el viaje se entra a ella; al volver con el navegador, el caso se cierra solo */
    paneles.forEach(p => {
        const lamina = p.querySelector('.lamina');
        const abrir = () => {
            cancelAnimationFrame(lamina._raf);
            window.abrirCaso(p.dataset.id, lamina, p.querySelector('.nombre'), { clonar: true });
            if (p.dataset.url) setTimeout(() => { window.location.href = p.dataset.url; }, quieto ? 0 : 950);
        };
        lamina.addEventListener('click', abrir);
        lamina.addEventListener('keydown', e => { if (e.key === 'Enter') abrir(); });
    });
    window.addEventListener('pageshow', e => { if (e.persisted && document.querySelector('.caso.abierto')) document.querySelector('.caso-volver').click(); });
})();
/* =======================================================
   FIN JS · WORKS 3 PILA
   ======================================================= */
