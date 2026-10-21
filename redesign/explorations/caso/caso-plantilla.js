/* =======================================================
   INICIO JS · PLANTILLA DE CASO
   ======================================================= */
/* Arma la página completa desde window.CASO. El orden de las secciones lo define el caso (C.orden); los
   capítulos abren con su propia portada y tienen su propio escenario de evidencia. Un tema puede traer su
   hero (CASO_HERO), su invitación al siguiente proyecto (CASO_SIGUIENTE), visuales de capítulo
   (CASO_CAP_VISUAL) y piezas propias (CASO_PIEZAS). Después deja listos los movimientos comunes */
(function () {
    const C = window.CASO;
    const main = document.querySelector('[data-caso]');
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const n2 = i => String(i + 1).padStart(2, '0');
    const ritmo = k => (C.ritmo && C.ritmo[k]) || 'oscuro';
    const vivo = C.vivo.publicado ? `<a href="${C.vivo.url}" target="_blank" rel="noopener">${C.vivo.texto} ↗</a>` : `${C.vivo.texto} · ${C.vivo.estado}`;
    const franja = (num, nombre, der = '') => `<div class="franja etiqueta"><span class="f-num">${num}</span><span class="f-nom"><i class="nodo" aria-hidden="true"></i>${nombre}</span><span class="f-der">${der}</span></div>`;
    /* Un título puede marcar su palabra clave con *asteriscos* (el tema decide cómo se destaca) */
    const clave = t => t.replace(/\*([^*]+)\*/g, '<span class="clave">$1</span>');
    const totalDec = n2(C.decisiones.length - 1);

    /* --- 1. PIEZAS DE CADA SECCIÓN --- */
    const portada = () => `
        <section class="seccion grilla portada ${ritmo('portada')}">
            ${franja(`${C.numero} · ${C.nombre}`, C.disciplinas, `${C.anio} · ${vivo}`)}
            <h1 class="portada-titulo" aria-label="${C.nombre}">${C.titulo.map(l => `<span class="linea${l.clave ? ' clave' : ''}" data-letras>${l.t}</span>`).join('')}</h1>
            <p class="portada-bajada">${C.bajada}</p>
            <div class="portada-escena" aria-hidden="true">${C.escena.fondo ? `<img class="fondo" src="${C.escena.fondo}" alt="">` : ''}<div class="navegador"><div class="barra-nav"><i></i><i></i><i></i><span class="url">${C.vivo.texto}</span></div><img src="${C.poster}" alt=""></div></div>
            <div class="ficha">${C.ficha.map(([k, v]) => `<div><span class="etiqueta">${k}</span><span>${v}</span></div>`).join('')}</div>
        </section>`;

    const resumen = () => `
        <section class="seccion grilla resumen ${ritmo('resumen')}">
            ${franja('01', 'Resumen', C.anio)}
            <p class="resumen-intro" data-aparece>${clave(C.intro)}</p>
            <div class="resumen-cols">${C.resumen.map(([k, v], i) => `<div data-aparece style="--retraso:${i * 90}ms"><span class="etiqueta">${k}</span><p>${v}</p></div>`).join('')}</div>
            ${C.fichaEnResumen ? `<aside class="resumen-ficha" data-aparece style="--retraso:200ms"><span class="etiqueta">Ficha</span><dl>${C.ficha.map(([k, v]) => `<div><dt class="etiqueta">${k}</dt><dd>${k === 'En vivo' && C.vivo.publicado ? vivo : v}</dd></div>`).join('')}</dl></aside>` : ''}
        </section>`;

    /* Un bloque del relato y el escenario de un tramo de decisiones (todas o las de un capítulo) */
    const bloque = (d, i) => `
                <article class="bloque" id="d-${d.id}" data-i="${i}">
                    <span class="num etiqueta">Decisión ${n2(i)} <span class="de">/ ${totalDec}</span></span>
                    <h3>${d.titulo}</h3>
                    <p>${d.texto}</p>
                    <p class="porque"><span class="etiqueta">Por qué</span>${d.porque}</p>
                    ${C.vivo.publicado && d.ancla && d.ancla.enlace !== undefined ? `<a class="ver-vivo" href="${C.vivo.url}/${d.ancla.enlace}" target="_blank" rel="noopener">Verlo en ${C.vivo.texto} ↗</a>` : ''}
                    <div class="pz-solo">${window.CASO_PIEZA(d)}</div>
                </article>`;
    const evidencia = (lista, extra = '') => {
        const conSitio = lista.some(([d]) => d.ancla);
        return `
        <section class="seccion grilla evidencia ${ritmo('decisiones')}" data-evidencia>
            ${extra}
            <div class="relato">${lista.map(([d, i]) => bloque(d, i)).join('')}</div>
            <div class="escenario" aria-hidden="true">
                <div class="riel-ev"><ol>${lista.map(([, i]) => `<li><button type="button" tabindex="-1" data-ir="${i}">${n2(i)}</button></li>`).join('')}</ol><span class="atajos etiqueta"><kbd data-k="j">J</kbd><kbd data-k="k">K</kbd></span></div>
                <div class="tablero">
                    ${conSitio ? `<div class="vitrina" data-vitrina><div class="marco-nav"><div class="barra-nav"><i></i><i></i><i></i><span class="url">${C.vivo.texto}</span></div><div class="pantalla"><img src="${C.poster}" alt=""><div class="resalte" data-resalte><i class="rv rv-t"></i><i class="rv rv-b"></i><i class="rv rv-l"></i><i class="rv rv-r"></i><div class="r-caja"><i class="esq e1"></i><i class="esq e2"></i><i class="esq e3"></i><i class="esq e4"></i><span class="r-txt"></span></div></div></div></div></div>` : ''}
                    ${lista.map(([d, i]) => (d.ancla ? '' : `<div class="capa" data-capa="${i}">${window.CASO_PIEZA(d)}</div>`)).join('')}
                </div>
                <div class="pie-ev etiqueta"><span class="nota" data-nota></span><span data-estado></span></div>
            </div>
        </section>`;
    };
    const decisiones = () => {
        const todas = C.decisiones.map((d, i) => [d, i]);
        if (!C.capitulos) return evidencia(todas, `${franja('02', 'Decisiones', `${totalDec} decisiones`)}<h2 class="titulo-bloque" data-letras>${C.titulos.decisiones}</h2>`);
        /* Con capítulos: cada uno abre con su portada a todo el ancho y sigue con su propio escenario */
        /* Con C.flujoCapitulos, la portada y las decisiones de cada capítulo van en un bloque cuyo fondo fluye */
        const flujo = C.flujoCapitulos && document.body.classList.contains('fondo-2');
        return C.capitulos.map((cap, k) => `${flujo ? `<div class="flujo ${cap.ritmo || ritmo('decisiones')}" data-flujo>` : ''}
        <section class="seccion grilla cap-portada ${cap.ritmo || ritmo('decisiones')}" id="cap-${k}"${cap.tono ? ` style="--cap-tono:${cap.tono}"` : ''}>
            <div class="cap-texto">
                <span class="cap-pill etiqueta">Capítulo ${n2(k)} · ${cap.periodo}</span>
                <h2 data-letras>${cap.nombre}</h2>
                <p data-aparece>${cap.bajada}</p>
            </div>
            <div class="cap-visual" data-aparece>${window.CASO_CAP_VISUAL ? window.CASO_CAP_VISUAL(cap, k) : ''}</div>
            <span class="cap-num" aria-hidden="true">${n2(k)}</span>
        </section>
        ${evidencia(todas.filter(([d]) => d.cap === k))}${flujo ? '</div>' : ''}`).join('');
    };

    /* Mapa del proyecto: las etapas como tramos proporcionales al tiempo y los hitos en su fecha */
    const mes = s => { const [a, m] = s.split('-').map(Number); return a * 12 + m - 1; };
    const mapa = () => {
        const M = C.mapa, ini = mes(M.desde), fin = mes(M.hasta), pos = s => ((mes(s) - ini) / (fin - ini) * 100).toFixed(2);
        return `
        <section class="seccion grilla mapa ${ritmo('proceso')}" id="mapa">
            ${franja('02', 'Mapa del proyecto', M.der)}
            <h2 class="titulo-bloque" data-letras>${C.titulos.proceso}</h2>
            <ol class="mapa-leyenda">${M.fases.map((f, k) => `<li><a href="#cap-${f.cap}" style="--fase:${f.color};--k:${k}"><i></i><b>${f.nombre}</b><span class="etiqueta">${f.periodo}</span></a></li>`).join('')}</ol>
            <div class="mapa-pista" data-mapa>
                <div class="mapa-fases">${M.fases.map((f, k) => `<a class="mapa-fase" href="#cap-${f.cap}" aria-label="${f.nombre}" style="--a:${pos(f.desde)}%;--b:${pos(f.hasta)}%;--fase:${f.color};--k:${k}"></a>`).join('')}</div>
                <ol class="mapa-hitos">${M.hitos.map(([f, t, d], k) => `<li class="mapa-hito${k % 2 ? ' abajo' : ''}" style="--x:${pos(f)}%;--k:${k}" tabindex="0"><i></i><span class="mh-txt"><span class="mh-fecha etiqueta">${M.etiquetas[k]}</span><b>${t}</b><span class="mh-detalle">${d}</span></span></li>`).join('')}</ol>
                <div class="mapa-anios">${(M.anios || []).map(a => `<span style="--x:${pos(a + '-01')}%"><i></i>${a}</span>`).join('')}</div>
                <span class="mapa-hoy etiqueta">Hoy</span>
            </div>
        </section>`;
    };

    const proceso = () => `
        <section class="seccion grilla proceso ${ritmo('proceso')}">
            ${franja('03', 'Proceso', C.proceso[0][0] + ' a ' + C.proceso[C.proceso.length - 1][0])}
            <h2 class="titulo-bloque" data-letras>${C.titulos.proceso}</h2>
            <ol class="linea-tiempo" data-linea style="--hitos:${C.proceso.length > 6 ? 4 : C.proceso.length}">${C.proceso.map(([f, t, d], i) => `<li data-aparece style="--retraso:${200 + i * 110}ms"><span class="etiqueta">${f}</span><strong>${t}</strong><p>${d}</p></li>`).join('')}</ol>
        </section>`;

    /* Resultado: el producto en vivo (si lo hay), las cifras, el contexto y las citas */
    const enVivo = () => !C.enVivo ? '' : `
            <div class="en-vivo" data-en-vivo>
                <ol class="ev-lista">${C.enVivo.modulos.map(([n, q], k) => `<li><button type="button" class="${k === 0 ? 'on' : ''}" data-k="${k}"><span class="ev-n etiqueta">${n2(k)}</span><span class="ev-t"><b>${n}</b><span class="ev-q">${q}</span></span><i class="ev-barra"></i></button></li>`).join('')}</ol>
                <div class="ev-pantalla">${C.enVivo.modulos.map(([, , src], k) => `<div class="ev-cuadro${k === 0 ? ' on' : ''}" data-k="${k}"><div class="mk-marco" data-mockup-manual="${src}"></div></div>`).join('')}</div>
            </div>`;
    const resultado = () => `
        <section class="seccion grilla resultado ${ritmo('resultados')}">
            ${franja('04', 'Resultado', vivo)}
            <h2 class="titulo-bloque" data-letras>${C.titulos.resultados}</h2>
            ${enVivo()}
            <div class="cifras">${C.resultados.map(([c, t, v], i) => `<div data-aparece style="--retraso:${i * 90}ms"><b${C.contar ? ` data-contar="${c}"` : ''}>${c}</b><p>${t}</p>${v ? `<span class="verificar">${v}</span>` : ''}</div>`).join('')}</div>
            ${C.contexto ? `<p class="contexto-cifras" data-aparece><span class="etiqueta">Contexto del producto</span>${C.contexto.texto}${C.contexto.verificar ? ` <span class="verificar">${C.contexto.verificar}</span>` : ''}</p>` : ''}
            ${C.citas ? `<div class="citas" data-citas data-aparece><div class="citas-pista">${C.citas.map(([t, quien], i) => `<figure class="cita${i === 0 ? ' on' : ''}"><blockquote>${t}</blockquote><figcaption class="etiqueta">${quien}</figcaption></figure>`).join('')}</div>${C.citas.length > 1 ? `<div class="citas-puntos">${C.citas.map((_, i) => `<button type="button" class="${i === 0 ? 'on' : ''}" data-k="${i}" aria-label="Cita ${i + 1}"></button>`).join('')}</div>` : ''}${C.citasNota ? `<span class="verificar">${C.citasNota}</span>` : ''}</div>` : ''}
            ${C.galeria ? `<div class="galeria">${C.galeria.imgs.map((src, i) => `<figure data-aparece style="--retraso:${i * 90}ms"><img src="${src}" alt="" loading="lazy" decoding="async"></figure>`).join('')}<span class="etiqueta">${C.galeria.nota}</span></div>` : ''}
        </section>`;

    /* Aprendizaje: las palabras se encienden a medida que se lee (al bajar) */
    const aprendizaje = () => `
        <section class="seccion grilla aprendizaje ${ritmo('aprendizaje')}">
            ${franja('05', 'Aprendizaje')}
            <blockquote data-luz>${C.aprendizaje}</blockquote>
            ${window.CASO_AP_VISUAL ? `<div class="ap-visual" data-aparece>${window.CASO_AP_VISUAL(C)}</div>` : ''}
            ${C.creditosLista ? `<dl class="creditos-lista" data-aparece>${C.creditosLista.map(([k, v]) => `<div><dt class="etiqueta">${k}</dt><dd>${v}</dd></div>`).join('')}</dl>` : `<p class="creditos" data-aparece>${C.creditos}</p>`}
        </section>`;

    const siguiente = () => (window.CASO_SIGUIENTE ? window.CASO_SIGUIENTE(C) : `<a class="siguiente" href="#" style="--sig:${C.siguiente.tinte}">
            <div class="fila"><span>Siguiente proyecto</span><span>${C.siguiente.numero} / 03</span></div>
            <div class="nombre-sig"><b data-letras>${C.siguiente.nombre}</b><span>${C.siguiente.bajada} <span class="flecha">↗</span></span></div>
        </a>`);

    /* --- 2. ARMADO EN EL ORDEN DEL CASO --- */
    const secciones = { resumen, decisiones, mapa, proceso, resultado, aprendizaje };
    const orden = C.orden || ['resumen', 'decisiones', 'proceso', 'resultado', 'aprendizaje'];
    main.innerHTML = (window.CASO_HERO ? window.CASO_HERO(C, { franja, vivo, ritmo }) : portada()) + orden.map(k => secciones[k]()).join('') + siguiente();
    main.querySelectorAll('.titulo-bloque, .cap-portada h2').forEach(t => { t.innerHTML = clave(t.innerHTML); });

    /* --- 3. LETRAS QUE SUBEN --- */
    const partir = el => {
        let i = 0;
        const letras = txt => txt.split(/(\s+)/).map(p => /^\s+$/.test(p) ? ' ' : '<span class="palabra" aria-hidden="true">' + [...p].map(c => `<span class="l" style="animation-delay:${(i++) * 24}ms">${c}</span>`).join('') + '</span>').join('');
        if (!el.hasAttribute('aria-label') && !el.closest('[aria-label]')) el.setAttribute('aria-label', el.textContent.trim());
        el.innerHTML = [...el.childNodes].map(n => (n.nodeType === 3 ? letras(n.textContent) : `<span class="${n.className}">${letras(n.textContent)}</span>`)).join('');
    };

    /* --- 4. APARICIONES Y CONTEO --- */
    const contar = el => {
        const meta = el.dataset.contar, num = parseFloat(meta.replace(/[^\d]/g, ''));
        const prefijo = (meta.match(/^[^\d]*/) || [''])[0], sufijo = (meta.match(/[^\d.]*$/) || [''])[0];
        if (isNaN(num) || quieto) return;
        const t0 = performance.now(), dur = 1400;
        const paso = ahora => {
            const t = Math.min((ahora - t0) / dur, 1), v = Math.round(num * (1 - Math.pow(1 - t, 3)));
            el.textContent = prefijo + v.toLocaleString('es-CL') + sufijo;
            if (t < 1) requestAnimationFrame(paso);
        };
        requestAnimationFrame(paso);
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add(el.hasAttribute('data-letras') ? 'entra' : 'visto');
        el.querySelectorAll('[data-contar]').forEach(contar);
        io.unobserve(el);
    }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    main.querySelectorAll('[data-letras]').forEach(el => { partir(el); io.observe(el); });
    main.querySelectorAll('[data-aparece], [data-linea], [data-mapa]').forEach(el => (quieto ? el.classList.add('visto') : io.observe(el)));

    /* --- 5. APRENDIZAJE QUE SE ENCIENDE --- */
    /* Cada palabra se enciende según cuánto del bloque ya cruzó la pantalla */
    main.querySelectorAll('[data-luz]').forEach(q => {
        q.innerHTML = q.textContent.split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
        const ws = [...q.querySelectorAll('.w')];
        if (quieto) { ws.forEach(w => w.classList.add('on')); return; }
        let pend = false;
        const pintar = () => {
            pend = false;
            const r = q.getBoundingClientRect(), h = window.innerHeight;
            const p = Math.min(Math.max((h * 0.85 - r.top) / (r.height + h * 0.35), 0), 1);
            const n = Math.round(p * ws.length);
            ws.forEach((w, k) => w.classList.toggle('on', k < n));
        };
        window.addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(pintar); } }, { passive: true });
        pintar();
    });

    /* --- 6. CITAS QUE SE ALTERNAN --- */
    /* Una cita grande a la vez; cambian solas cada 7 s y con los puntos */
    main.querySelectorAll('[data-citas]').forEach(box => {
        const citas = [...box.querySelectorAll('.cita')], puntos = [...box.querySelectorAll('.citas-puntos button')];
        if (citas.length < 2) return;
        let k = 0, t = null;
        const ir = j => { k = j; citas.forEach((c, i) => c.classList.toggle('on', i === k)); puntos.forEach((b, i) => b.classList.toggle('on', i === k)); };
        const andar = () => { clearInterval(t); if (!quieto) t = setInterval(() => ir((k + 1) % citas.length), 7000); };
        puntos.forEach((b, i) => b.addEventListener('click', () => { ir(i); andar(); }));
        andar();
    });

    /* --- 6B. BARRA SEGÚN LA SECCIÓN --- */
    /* La sección que cruza la franja de la barra (los primeros 60 px) decide si la barra va clara u oscura */
    const ioBarra = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) document.body.dataset.barra = e.target.classList.contains('claro') ? 'claro' : 'oscuro'; }), { rootMargin: '0px 0px -94% 0px' });
    main.querySelectorAll('.seccion, .sig').forEach(s => ioBarra.observe(s));

    /* --- 7. BARRA QUE SE ESCONDE AL BAJAR --- */
    /* Visible arriba; se esconde al bajar más de 8 px y vuelve al subir. El escenario fijo sube con ella */
    const barra = document.querySelector('.barra');
    if (barra) {
        let ultimoY = window.scrollY, pend = false;
        const revisar = () => {
            pend = false;
            const y = window.scrollY, d = y - ultimoY;
            if (Math.abs(d) < 8 && y > 80) return;
            const oculta = y > 120 && d > 0;
            barra.classList.toggle('oculta', oculta);
            barra.classList.toggle('flota', y > 120 && !oculta);
            document.body.classList.toggle('sin-barra', oculta);
            ultimoY = y;
        };
        window.addEventListener('scroll', () => { if (!pend) { pend = true; requestAnimationFrame(revisar); } }, { passive: true });
    }

    /* --- 8. ARRANQUE DE LOS TEMAS --- */
    (window.CASO_INICIOS || []).forEach(f => f(C, { quieto, main }));
})();
/* =======================================================
   FIN JS · PLANTILLA DE CASO
   ======================================================= */
