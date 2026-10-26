/* =======================================================
   INICIO JS · HOME WORKS (PORTADAS Y ARCHIVO)
   ======================================================= */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conMouse = window.matchMedia('(hover: hover)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => t * t * (3 - 2 * t);
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
    /* La pista se reparte en tramos: cada portada se destapa en el paso entre una y otra (--r) y la anterior se aleja
       (--sale). El último tramo deja la tercera quieta mientras el archivo sube encima como una hoja */
    const pista = document.querySelector('[data-portadas]');
    const covs = [...pista.querySelectorAll('.pt-cov')], regla = [...pista.querySelectorAll('.pt-regla button')];
    const TRAMOS = [[0, 0.9], [0.9, 1.9], [1.9, 2.6]], LARGO = 3.1;
    let activa = 0;
    covs.forEach((c, i) => { c.inert = i !== 0; });
    const pintar = () => {
        const r = pista.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const s = fijar(-r.top / (r.height - window.innerHeight)) * LARGO;
        const rev = [1, curva(fijar((s - 0.6) / 0.6)), curva(fijar((s - 1.6) / 0.6))];
        covs.forEach((c, i) => { c.style.setProperty('--r', rev[i].toFixed(4)); c.style.setProperty('--sale', (rev[i + 1] || 0).toFixed(4)); });
        const act = rev[2] > 0.5 ? 2 : rev[1] > 0.5 ? 1 : 0;
        regla.forEach((b, i) => b.style.setProperty('--a', fijar((s - TRAMOS[i][0]) / (TRAMOS[i][1] - TRAMOS[i][0])).toFixed(3)));
        if (act !== activa) {
            activa = act;
            regla.forEach((b, i) => { b.classList.toggle('on', i === act); b.setAttribute('aria-current', i === act ? 'true' : 'false'); });
            /* Solo la portada al frente recibe el foco y los clics */
            covs.forEach((c, i) => { c.inert = i !== act; });
        }
    };
    let pendiente = false;
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; pintar(); }); } };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    pintar();

    /* --- 3. SALTOS: ÍNDICE, REGLA Y TECLAS 1, 2 Y 3 --- */
    /* Cada portada queda quieta un poco después de terminar su destape */
    const irCov = i => { const r = pista.getBoundingClientRect(); irA(window.scrollY + r.top + ((i ? TRAMOS[i][0] + 0.25 : 0) / LARGO) * (r.height - window.innerHeight)); };
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
       marca de Mend, su logo se dibuja con las animaciones del manual */
    covs.forEach(c => {
        const tabs = [...c.querySelectorAll('[data-cap]')], vistas = [...c.querySelectorAll('.pt-vista')];
        const abrir = t => {
            tabs.forEach(x => { x.setAttribute('aria-selected', x === t); x.tabIndex = x === t ? 0 : -1; });
            vistas.forEach((v, k) => {
                const on = k === +t.dataset.cap;
                v.classList.toggle('on', on);
                if (v.querySelector('.pt-mend-logo')) { v.classList.remove('dibuja'); if (on && !quieto) { void v.offsetWidth; v.classList.add('dibuja'); } }
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
