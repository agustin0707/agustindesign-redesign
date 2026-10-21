/* =======================================================
   INICIO JS · BASE COMÚN DE LA PÁGINA DE CASO
   ======================================================= */
/* Arma las partes que comparten las tres direcciones (portada, resumen, proceso, resultados y cierre) desde
   window.CASO, y deja listas las letras que suben y las apariciones. Cada dirección dibuja sus decisiones
   antes de que corra este archivo, para que todo quede observado de una vez */
(function () {
    const C = window.CASO;
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n2 = i => String(i + 1).padStart(2, '0');
    const pon = (sel, html) => { const el = document.querySelector(sel); if (el) el.innerHTML = html; return el; };
    document.documentElement.style.setProperty('--tinte', C.tinte);

    /* --- 1. PORTADA --- */
    pon('[data-portada]', `
        <div class="fila-top etiqueta"><span>${C.numero} · ${C.nombre}</span><span>${C.disciplinas}</span><span>${C.anio} · <a href="${C.vivo.url}" target="_blank" rel="noopener">${C.vivo.texto} ↗</a></span></div>
        <h1 class="portada-titulo" data-letras>${C.nombre}</h1>
        <p class="portada-bajada">${C.bajada}</p>
        <div class="portada-escena" aria-hidden="true"><div class="navegador"><div class="barra-nav"><i></i><i></i><i></i><span class="url etiqueta">${C.vivo.texto}</span></div><img src="${C.poster}" alt=""></div></div>
        <div class="ficha">${C.ficha.map(([k, v]) => `<div><span class="etiqueta">${k}</span>${k === 'En vivo' ? `<a href="${C.vivo.url}" target="_blank" rel="noopener">${v}</a>` : `<span>${v}</span>`}</div>`).join('')}</div>`);

    /* --- 2. RESUMEN --- */
    pon('[data-resumen]', `
        <span class="lado etiqueta">Resumen</span>
        <p class="resumen-intro" data-aparece>${C.intro}</p>
        <div class="resumen-cols">${C.resumen.map(([k, v], i) => `<div data-aparece style="--retraso:${i * 90}ms"><span class="etiqueta">${k}</span><p>${v}</p></div>`).join('')}</div>`);

    /* --- 3. PROCESO --- */
    pon('[data-proceso]', `
        <div class="cab"><span class="etiqueta">Proceso</span><h2 data-letras>18 meses, un mismo cliente</h2></div>
        <ol class="linea-tiempo" data-linea>${C.proceso.map(([f, t, d], i) => `<li data-aparece style="--retraso:${200 + i * 110}ms"><span class="etiqueta">${f}</span><strong>${t}</strong><p>${d}</p></li>`).join('')}</ol>`);

    /* --- 4. RESULTADOS Y GALERÍA --- */
    pon('[data-resultados]', `
        <div class="cab"><span class="etiqueta">Resultado</span><h2 data-letras>Lo que quedó andando</h2></div>
        <div class="cifras">${C.resultados.map(([c, t, v], i) => `<div data-aparece style="--retraso:${i * 90}ms"><b>${c}</b><p>${t}</p>${v ? `<span class="verificar">${v}</span>` : ''}</div>`).join('')}</div>
        <div class="galeria">${C.galeria.map((src, i) => `<figure data-aparece style="--retraso:${i * 90}ms"><img src="${src}" alt="" loading="lazy" decoding="async"></figure>`).join('')}<span class="etiqueta figcaption">Lanzamiento en el campus UC, 2025</span></div>`);

    /* --- 5. APRENDIZAJE Y SIGUIENTE --- */
    pon('[data-cierre]', `
        <div class="grilla aprendizaje">
            <span class="etiqueta">Aprendizaje</span>
            <blockquote data-aparece>${C.aprendizaje}</blockquote>
            <p class="creditos" data-aparece>Diseño y desarrollo: Agustín Avendaño. Con los fundadores de Tap In. La app de pedidos de 2025 la programó el equipo de Tap In a partir de mi diseño.</p>
        </div>
        <a class="siguiente" href="#" style="--sig:${C.siguiente.tinte}">
            <div class="fila etiqueta"><span>Siguiente proyecto</span><span>03 / 03</span></div>
            <div class="nombre-sig"><b data-letras>${C.siguiente.nombre}</b><span>${C.siguiente.bajada} <span class="flecha">↗</span></span></div>
        </a>`);

    /* --- 6. LETRAS QUE SUBEN --- */
    const partir = el => {
        if (el.dataset.partido) return;
        el.dataset.partido = '1';
        const texto = el.textContent.trim();
        el.setAttribute('aria-label', texto);
        let i = 0;
        el.innerHTML = texto.split(/(\s+)/).map(p => /^\s+$/.test(p) ? ' ' : '<span class="palabra" aria-hidden="true">' + [...p].map(c => `<span class="l" style="animation-delay:${(i++) * 28}ms">${c}</span>`).join('') + '</span>').join('');
    };

    /* --- 7. APARICIONES --- */
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add(e.target.hasAttribute('data-letras') ? 'entra' : 'visto');
        io.unobserve(e.target);
    }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    const observar = (raiz = document) => {
        raiz.querySelectorAll('[data-letras]').forEach(el => { partir(el); io.observe(el); });
        raiz.querySelectorAll('[data-aparece], [data-linea]').forEach(el => (quieto ? el.classList.add('visto') : io.observe(el)));
    };
    observar();
    window.CASO_UI = { observar, n2, quieto };
})();
/* =======================================================
   FIN JS · BASE COMÚN DE LA PÁGINA DE CASO
   ======================================================= */
