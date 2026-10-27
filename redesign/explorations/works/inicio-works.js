/* =======================================================
   INICIO JS · HOME WORKS (PORTADAS Y ARCHIVO)
   ======================================================= */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conMouse = window.matchMedia('(hover: hover)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const irA = y => window.scrollTo({ top: y, behavior: quieto ? 'auto' : 'smooth' });

    /* --- 1. TÍTULOS QUE ENTRAN LETRA A LETRA --- */
    /* Mismo gesto del nombre del hero, disparado cuando el título entra en pantalla. Las del hero las arma hero-base.js */
    const titulos = [...document.querySelectorAll('[data-letras]')].filter(el => !el.closest('.hero'));
    titulos.forEach(el => {
        const texto = el.textContent.trim();
        el.setAttribute('aria-label', texto);
        let i = 0;
        el.innerHTML = texto.split(/(\s+)/).map(p => /^\s+$/.test(p) ? ' ' : '<span class="palabra" aria-hidden="true">' + [...p].map(c => `<span class="l" style="animation-delay:${(i++) * 32}ms">${c}</span>`).join('') + '</span>').join('');
    });
    const ioLetras = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('entra'); ioLetras.unobserve(e.target); } }), { threshold: 0.4 });
    titulos.forEach(el => ioLetras.observe(el));

    /* --- 2. PORTADAS: DESTAPE Y REGLA DE AVANCE --- */
    /* La pista se reparte en tramos de 100svh: cada portada sube como hoja en el paso entre una y otra (--r), lineal con
       el scroll para que se sienta física, y la anterior se oscurece (--sale). Cada portada queda quieta 60svh después de
       llegar. El último tramo (de 3,8 a 4,8) deja Mend quieta mientras el archivo sube encima como una hoja: el archivo
       tiene margen de -100svh, así que la pista debe medir LARGO + 1 pantallas (580svh) para que no llegue antes.
       Una portada está .en-vista cuando la pista ocupa la pantalla, ya subió más de la mitad y no la tapan del todo */
    const pista = document.querySelector('[data-portadas]');
    const covs = [...pista.querySelectorAll('.pt-cov')], regla = [...pista.querySelectorAll('.pt-regla button')];
    const TRAMOS = [[0, 1.1], [1.1, 2.7], [2.7, 3.3]], LARGO = 4.8, FIN = [0, 1.7, 3.3];
    const alCambiarVista = [];
    let activa = 0;
    covs.forEach((c, i) => { c.inert = i !== 0; });
    const pintar = () => {
        const r = pista.getBoundingClientRect(), alto = window.innerHeight;
        const visible = r.top < alto * 0.5 && r.bottom > alto * 0.5;
        if (r.bottom < 0 || r.top > alto) { marcarVista(() => false); return; }
        const s = fijar(-r.top / (r.height - alto)) * LARGO;
        const rev = [1, fijar(s - 0.6), fijar(s - 2.2), fijar(s - 3.8)];
        covs.forEach((c, i) => { c.style.setProperty('--r', rev[i].toFixed(4)); c.style.setProperty('--sale', (i < 2 ? rev[i + 1] : 0).toFixed(4)); });
        marcarVista(i => visible && rev[i] > 0.5 && rev[i + 1] < 0.95);
        const act = rev[2] > 0.5 ? 2 : rev[1] > 0.5 ? 1 : 0;
        regla.forEach((b, i) => b.style.setProperty('--a', fijar((s - TRAMOS[i][0]) / (TRAMOS[i][1] - TRAMOS[i][0])).toFixed(3)));
        if (act !== activa) {
            activa = act;
            regla.forEach((b, i) => { b.classList.toggle('on', i === act); b.setAttribute('aria-current', i === act ? 'true' : 'false'); });
            /* Solo la portada al frente recibe el foco y los clics */
            covs.forEach((c, i) => { c.inert = i !== act; });
        }
    };
    function marcarVista(ver) {
        covs.forEach((c, i) => { const v = ver(i); if (v !== c.classList.contains('en-vista')) { c.classList.toggle('en-vista', v); alCambiarVista.forEach(f => f(c, v)); } });
    }
    let pendiente = false;
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; pintar(); }); } };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    pintar();

    /* --- 2.1 RETÍCULA DE PRECISIÓN (LLEGÓ FARMA) --- */
    /* La dosis esencial de la retícula del sitio, construida desde los elementos de la portada: la línea de los rótulos
       y la celda de la ventana del sitio, a 16 px de ella. Líneas de 1 px que se cortan 8 px antes de cada cruce y que
       esquivan los capítulos. En escritorio, un bloque de puntos del manual en la celda libre sobre el nombre */
    const reticula = covs[0] && covs[0].querySelector('[data-reticula]');
    const armarReticula = () => {
        if (!reticula) return;
        const cov = covs[0], C = cov.getBoundingClientRect(), W = C.width, H = C.height;
        const rel = el => { const b = el.getBoundingClientRect(); return { l: b.left - C.left, t: b.top - C.top, r: b.right - C.left, b: b.bottom - C.top }; };
        const T = rel(cov.querySelector('.pt-tope')), N = rel(cov.querySelector('.pt-vista .pt-nav')), K = rel(cov.querySelector('.pt-caps')), X = rel(cov.querySelector('.pt-txt'));
        const celda = 16, corte = 8, px = v => Math.round(v) + 0.5;
        const y0 = T.b, x1 = N.l - celda, x2 = Math.min(N.r + celda, W - corte), y1 = N.t - celda, y2 = N.b + celda;
        const H_ = [[y0, 0, W, 'fuerte'], [y1, Math.max(x1 - celda * 2, 0), W], [y2, Math.max(x1 - celda * 2, 0), W]];
        const V_ = [[x1, y0, y2], [x2, y0, y2]];
        /* Corta un segmento [a, b] en los puntos dados (gap de 8 px a cada lado) y alrededor de los capítulos */
        const partir = (a, b, puntos, huecos) => {
            const tramos = []; let ini = a;
            [...puntos.map(p => [p - corte, p + corte]), ...huecos].sort((p, q) => p[0] - q[0]).forEach(([c, d]) => { if (c > ini) tramos.push([ini, c]); ini = Math.max(ini, d); });
            if (b > ini) tramos.push([ini, b]);
            return tramos.filter(([c, d]) => d - c > 4);
        };
        let lineas = '', k = 0;
        H_.forEach(([y, a, b, cls]) => {
            const cruces = V_.filter(([x, ya, yb]) => x > a && x < b && y >= ya - 1 && y <= yb + 1).map(v => v[0]);
            const huecos = K.t - 4 <= y && K.b + 4 >= y ? [[K.l - corte, K.r + corte]] : [];
            partir(a, b, cruces, huecos).forEach(([c, d]) => { lineas += `<line class="ln ${cls || ''}" pathLength="1" style="--k:${k}" x1="${c}" y1="${px(y)}" x2="${d}" y2="${px(y)}"/>`; if (d - c > 160) lineas += `<line class="luz" pathLength="1" style="--k:${k}" x1="${c}" y1="${px(y)}" x2="${d}" y2="${px(y)}"/>`; k++; });
        });
        V_.forEach(([x, a, b]) => {
            const cruces = H_.filter(([y, xa, xb]) => y > a - 1 && y < b + 1 && x >= xa && x <= xb).map(h => h[0]);
            const huecos = K.l - 4 <= x && K.r + 4 >= x ? [[K.t - corte, K.b + corte]] : [];
            partir(a, b, cruces, huecos).forEach(([c, d]) => { lineas += `<line class="ln" pathLength="1" style="--k:${k}" x1="${px(x)}" y1="${c}" x2="${px(x)}" y2="${d}"/>`; if (d - c > 160) lineas += `<line class="luz" pathLength="1" style="--k:${k}" x1="${px(x)}" y1="${c}" x2="${px(x)}" y2="${d}"/>`; k++; });
        });
        /* Bloque de puntos: 12 × 6 cada 12 px, solo si cabe entre la celda de la pieza y el nombre */
        let puntos = '';
        if (W > 768) {
            const izq = T.l, arr = N.t, filas = Math.min(6, Math.floor((X.t - celda * 2 - arr) / 12));
            for (let f = 0; f < filas; f++) for (let c = 0; c < 12; c++) puntos += `<circle class="pto" style="--k:${f + c}" cx="${izq + c * 12 + 1.5}" cy="${arr + f * 12 + 1.5}" r="1.25"/>`;
        }
        reticula.innerHTML = `<svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${lineas}${puntos}</svg>`;
    };
    /* Con movimiento reducido, la cinta de Tap In queda quieta (sus animaciones son SMIL) */
    if (quieto) document.querySelectorAll('.pt-cinta').forEach(s => s.pauseAnimations && s.pauseAnimations());
    if (reticula) {
        armarReticula();
        let espera;
        window.addEventListener('resize', () => { clearTimeout(espera); espera = setTimeout(armarReticula, 120); });
        window.addEventListener('load', armarReticula);
        if (document.fonts) document.fonts.ready.then(armarReticula);
        /* Se dibuja la primera vez que la portada queda a la vista */
        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { requestAnimationFrame(() => reticula.classList.add('dibujada')); io.disconnect(); } }), { threshold: 0.35 });
        io.observe(covs[0].querySelector('.pt-lado'));
        if (quieto) reticula.classList.add('dibujada');
    }

    /* --- 3. SALTOS: ÍNDICE, REGLA Y TECLAS 1, 2 Y 3 --- */
    /* Cada portada queda quieta un poco después de terminar su destape */
    const irCov = i => { const r = pista.getBoundingClientRect(); irA(window.scrollY + r.top + (FIN[i] / LARGO) * (r.height - window.innerHeight)); };
    document.querySelectorAll('[data-ir-cov]').forEach(b => b.addEventListener('click', e => { e.preventDefault(); irCov(+b.dataset.irCov); }));
    window.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey || !['1', '2', '3'].includes(e.key) || /input|textarea|select/i.test(e.target.tagName)) return;
        if (document.querySelector('.caso.abierto')) return;
        const r = pista.getBoundingClientRect(), ap = document.getElementById('works').getBoundingClientRect();
        if ((r.bottom < 0 || r.top > window.innerHeight) && (ap.bottom < 0 || ap.top > window.innerHeight)) return;
        irCov(+e.key - 1);
    });
    const archivo = document.getElementById('archivo');
    document.querySelectorAll('a[href="#archivo"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); irA(archivo.getBoundingClientRect().top + window.scrollY); }));

    /* --- 4. CAPÍTULOS DE CADA PORTADA --- */
    /* Marca, Web y En uso sobre la misma pieza. Las flechas recorren las pestañas, como en un tablist. Al abrir la
       marca de Mend, su logo se dibuja con las animaciones del manual; la de Llegó se arma una vez y las tarjetas de
       Tap In hacen tap mientras su capítulo está abierto */
    let relojTj = [];
    const tarjetas = (v, on) => {
        relojTj.forEach(id => { clearTimeout(id); clearInterval(id); }); relojTj = [];
        const ts = [...v.querySelectorAll('.pt-tj')];
        ts.forEach((t, i) => { t.classList.remove('tap', 'va', 'sin'); t.dataset.slot = i; t.querySelector('.ondas').classList.remove('van'); });
        if (!on || quieto) return;
        const reiniciar = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
        /* Tap en la del frente; al segundo pasa hacia adelante y las otras avanzan. Ya invisible, salta sin transición
           al puesto 3 y desde ahí entra al fondo */
        const paso = () => {
            const f = ts.find(t => t.dataset.slot === '0');
            reiniciar(f, 'tap'); reiniciar(f.querySelector('.ondas'), 'van');
            relojTj.push(setTimeout(() => { f.classList.add('va'); ts.forEach(t => { if (t !== f) t.dataset.slot = +t.dataset.slot - 1; }); }, 1000));
            relojTj.push(setTimeout(() => {
                f.classList.add('sin'); f.classList.remove('va', 'tap'); f.querySelector('.ondas').classList.remove('van'); f.dataset.slot = 3;
                void f.offsetWidth; f.classList.remove('sin'); f.dataset.slot = 2;
            }, 1750));
        };
        relojTj.push(setTimeout(() => { paso(); relojTj.push(setInterval(paso, 3200)); }, 1100));
    };
    /* Los sitios grabados (Web): el video se carga recién la primera vez que se ve y parte siempre desde el inicio, para
       que se vean las animaciones de entrada del primer scroll. Con movimiento reducido queda en su primer cuadro */
    /* En uso de Mend: el teléfono es un video de 28 s y el panel es CSS con el mismo ciclo. Cada vez que el video empieza
       una vuelta, las animaciones del panel se reinician con él, para que lleguen juntos aunque el video tarde en cargar */
    const sincronizar = vid => {
        const uso = vid.closest('.pt-uso');
        vid.onplaying = () => { uso.classList.add('reinicia'); void uso.offsetWidth; uso.classList.remove('reinicia'); };
        vid.onended = () => { vid.currentTime = 0; vid.play().catch(() => {}); };
    };
    const videos = (v, on) => v.querySelectorAll('video[data-src]').forEach(vid => {
        if (!on || quieto) { vid.pause(); return; }
        if (!vid.getAttribute('src')) { vid.src = vid.dataset.src; if (vid.hasAttribute('data-sync')) sincronizar(vid); }
        vid.currentTime = 0; vid.play().catch(() => {});
    });
    /* Al entrar o salir de pantalla, las tarjetas y los videos arrancan o se detienen si su capítulo está abierto */
    alCambiarVista.push((c, ver) => { const v = c.querySelector('.pt-vista.on'); if (!v) return; if (v.querySelector('.pt-tjs')) tarjetas(v, ver); videos(v, ver); });
    /* Si la página abrió con una portada ya en pantalla, su capítulo arranca de inmediato */
    covs.forEach(c => { if (c.classList.contains('en-vista')) alCambiarVista.forEach(f => f(c, true)); });
    covs.forEach(c => {
        const tabs = [...c.querySelectorAll('[data-cap]')], vistas = [...c.querySelectorAll('.pt-vista')];
        const abrir = t => {
            tabs.forEach(x => { x.setAttribute('aria-selected', x === t); x.tabIndex = x === t ? 0 : -1; });
            vistas.forEach((v, k) => {
                const on = k === +t.dataset.cap;
                v.classList.toggle('on', on);
                if (v.querySelector('.pt-mend-logo')) { v.classList.remove('dibuja'); if (on && !quieto) { void v.offsetWidth; v.classList.add('dibuja'); } }
                if (v.querySelector('.pt-lf-logo, .pt-tjs')) { v.classList.remove('dibuja'); if (on) { void v.offsetWidth; v.classList.add('dibuja'); } }
                if (v.querySelector('.pt-tjs')) tarjetas(v, on && c.classList.contains('en-vista'));
                videos(v, on && c.classList.contains('en-vista'));
            });
        };
        tabs.forEach((t, k) => {
            t.tabIndex = t.getAttribute('aria-selected') === 'true' ? 0 : -1;
            t.addEventListener('click', () => abrir(t));
            t.addEventListener('keydown', e => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                const sig = tabs[(k + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
                abrir(sig); sig.focus();
            });
        });
    });

    /* --- 5. VER CASO --- */
    /* La pieza viaja y se abre como portada del caso. Tap In ya tiene su página: al terminar el viaje se entra a ella */
    covs.forEach(c => {
        const ver = c.querySelector('.pt-ver'), vistas = c.querySelector('.pt-vistas'), nombre = c.querySelector('h3');
        ver.addEventListener('click', e => {
            if (!window.abrirCaso) return;
            e.preventDefault();
            window.abrirCaso(c.dataset.id, vistas, nombre);
            if (ver.href) setTimeout(() => { window.location.href = ver.href; }, quieto ? 0 : 950);
        });
    });
    window.addEventListener('pageshow', e => { if (e.persisted && document.querySelector('.caso.abierto')) document.querySelector('.caso-volver').click(); });

    /* --- 6. ARCHIVO: HOJA DE CONTACTOS O LISTA --- */
    /* Cada fila con su línea de contexto y su tira de piezas. Con mouse, la tira se recorre siguiendo la posición
       horizontal del cursor sobre la fila, con inercia. La vista Lista deja solo la tipografía */
    const hoja = document.querySelector('[data-hoja]');
    if (hoja) {
        hoja.innerHTML = window.WORKS.archivo.map(([nombre, disc, anio, , piezas, contexto], i) => `
            <li class="ficha" style="--retraso:${i * 90}ms"><a href="#archivo">
                <span class="f-num mono gris">${String(i + 1).padStart(2, '0')}</span>
                <span class="f-texto">
                    <span class="f-nombre">${nombre}<span class="f-flecha" aria-hidden="true">↗</span></span>
                    <span class="f-contexto">${contexto}</span>
                    <span class="f-disc mono gris">${disc}</span>
                </span>
                <span class="f-disc-l mono gris">${disc}</span>
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
        window.addEventListener('load', medir);

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
                    ir(fijar((e.clientX - r.left) / r.width) * f._corre);
                });
                a.addEventListener('mouseleave', () => ir(0));
            }
            /* Con teclado, al enfocar la fila la tira se recorre completa */
            a.addEventListener('focus', () => { if (a.matches(':focus-visible')) ir(f._corre); });
            a.addEventListener('blur', () => ir(0));
        });

        /* Al entrar, la tira se revela y carga todas sus piezas (las ocultas a la derecha no se cargarían solas) */
        const ioFichas = new IntersectionObserver(es => es.forEach(e => {
            if (!e.isIntersecting) return;
            e.target.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
            e.target.classList.add('entra'); ioFichas.unobserve(e.target);
        }), { threshold: 0.3 });
        fichas.forEach(f => ioFichas.observe(f));

        /* Cambio de vista; la elección se recuerda en este navegador */
        const botones = [...document.querySelectorAll('[data-vista]')];
        const vista = v => {
            hoja.classList.toggle('lista', v === 'lista');
            botones.forEach(b => b.setAttribute('aria-pressed', b.dataset.vista === v));
            if (v === 'hoja') medir();
            try { localStorage.setItem('archivo-vista', v); } catch (err) { /* sin almacenamiento */ }
        };
        botones.forEach(b => b.addEventListener('click', () => vista(b.dataset.vista)));
        let guardada = null;
        try { guardada = localStorage.getItem('archivo-vista'); } catch (err) { /* sin almacenamiento */ }
        if (guardada === 'lista') vista('lista');
    }
})();
/* =======================================================
   FIN JS · HOME WORKS (PORTADAS Y ARCHIVO)
   ======================================================= */
