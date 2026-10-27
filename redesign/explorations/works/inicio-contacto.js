/* =======================================================
   INICIO JS · CONTACTO Y FOOTER
   ======================================================= */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
    /* Correo de contacto: el mensaje se arma en el correo de quien escribe y llega aquí */
    const CORREO = 'agus.avendano@gmail.com';
    const brief = $('[data-brief]');
    if (!brief) return;

    /* --- 1. AVISO BREVE Y RELOJ --- */
    let espera;
    const avisar = texto => { const a = $('[data-ct-aviso]'); a.textContent = texto; a.classList.add('on'); clearTimeout(espera); espera = setTimeout(() => a.classList.remove('on'), 1800); };
    const hora = d => new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
    const pintarReloj = () => $$('[data-reloj-ct]').forEach(el => { el.textContent = hora(new Date()); });
    pintarReloj(); setInterval(pintarReloj, 15000);
    $('[data-fecha]').textContent = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

    /* --- 2. CANALES DIRECTOS --- */
    /* Copiar el correo responde en la misma fila. La agenda (Cal.com, conectada al calendario de iCloud) llega con lo que
       se escribió en la frase ya puesto: nombre, correo, empresa y, en las notas, qué busca, para cuándo y con qué
       inversión. Todo eso queda en el evento del calendario, junto con el correo y el WhatsApp que pida la agenda */
    const valor = n => { const c = $(`[data-nombre="${n}"]`, brief); return c && c.dataset.valor; };
    const campo = n => $(`[name="${n}"]`, brief).value.trim();
    let vuelta;
    $$('[data-copiar]', brief).forEach(b => b.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(CORREO); } catch (e) { avisar(CORREO); }
        const t = $('[data-copiar-texto]', b); b.classList.add('copiado'); t.textContent = 'Copiado ✓';
        clearTimeout(vuelta); vuelta = setTimeout(() => { b.classList.remove('copiado'); t.textContent = 'Copiar correo'; }, 1600);
    }));
    $$('[data-agenda]', brief).forEach(a => a.addEventListener('click', () => {
        const url = new URL('https://cal.com/agustindesign/20min');
        const nombre = campo('nombre'), correo = campo('correo'), empresa = campo('empresa');
        if (nombre) url.searchParams.set('name', nombre);
        if (correo.includes('@')) url.searchParams.set('email', correo);
        if (empresa) url.searchParams.set('empresa', empresa);
        const que = valor('que'), cuando = valor('cuando'), inversion = valor('inversion');
        if (que || cuando || inversion) url.searchParams.set('notes', `Desde el portafolio: busca ${que || 'conversar un proyecto'}${cuando ? ' para ' + cuando : ''}${inversion ? ', con una inversión de ' + inversion : ''}.`);
        a.href = url.toString();
    }));

    /* --- 3. LA FRASE --- */
    /* El texto se parte en palabras para entrar una tras otra, con máscara, la primera vez que la sección se ve. Cada campo
       mide su texto real para quedar del ancho justo; las listas se abren en su lugar, en cascada, y se recorren con teclado */
    const frase = $('.ct-frase', brief);
    let k = 0;
    const partir = nodo => [...nodo.childNodes].forEach(n => {
        if (n.nodeType === 3) {
            const trozos = n.textContent.split(/(\s+)/).filter(Boolean);
            const f = document.createDocumentFragment();
            trozos.forEach(t => {
                if (/^\s+$/.test(t)) { f.appendChild(document.createTextNode(' ')); return; }
                const w = document.createElement('span'); w.className = 'ct-w'; w.innerHTML = `<span style="--k:${k++}">${t}</span>`; f.appendChild(w);
            });
            n.replaceWith(f);
        } else if (n.classList && n.classList.contains('ct-campo')) { n.style.setProperty('--k', k++); }
        else if (n.nodeType === 1) partir(n);
    });
    partir(frase);
    if (quieto) brief.classList.add('entra');
    else new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { brief.classList.add('entra'); o.disconnect(); } }), { threshold: 0.25 }).observe(frase);

    const lienzo = document.createElement('canvas').getContext('2d');
    const crecer = i => {
        const cs = getComputedStyle(i), t = i.value || i.placeholder, px = parseFloat(cs.fontSize);
        lienzo.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        i.style.width = Math.ceil(lienzo.measureText(t).width + t.length * (parseFloat(cs.letterSpacing) || 0) + px * 0.2) + 'px';
    };
    const crecerTodos = () => $$('[data-crece]', brief).forEach(crecer);
    crecerTodos(); if (document.fonts) document.fonts.ready.then(crecerTodos); window.addEventListener('resize', crecerTodos);
    const cerrarListas = excepto => $$('.ct-lista', brief).forEach(c => { if (c !== excepto) { c.removeAttribute('data-abierta'); c.firstElementChild.setAttribute('aria-expanded', 'false'); } });
    $$('.ct-lista', brief).forEach(c => {
        const boton = c.firstElementChild, opciones = $$('[role="option"]', c), menu = $('.ct-menu', c);
        /* Si la lista no cabe a la derecha (en el teléfono), se corre hacia adentro lo justo */
        const encajar = () => { menu.style.left = '0px'; const r = menu.getBoundingClientRect(); menu.style.left = Math.min(0, window.innerWidth - 12 - r.right) + 'px'; };
        const abrir = () => { cerrarListas(c); c.setAttribute('data-abierta', ''); boton.setAttribute('aria-expanded', 'true'); encajar(); (opciones.find(o => o.getAttribute('aria-selected') === 'true') || opciones[0]).focus({ preventScroll: true }); };
        boton.addEventListener('click', () => c.hasAttribute('data-abierta') ? cerrarListas() : abrir());
        opciones.forEach((o, i) => {
            o.addEventListener('click', () => {
                opciones.forEach(x => x.setAttribute('aria-selected', x === o));
                boton.firstElementChild.textContent = o.dataset.valor; c.removeAttribute('data-vacia'); c.dataset.valor = o.dataset.valor;
                c.classList.remove('cambia'); void c.offsetWidth; c.classList.add('cambia');
                cerrarListas(); boton.focus(); revisar();
            });
            o.addEventListener('keydown', e => {
                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); opciones[(i + (e.key === 'ArrowDown' ? 1 : opciones.length - 1)) % opciones.length].focus(); }
                if (e.key === 'Escape') { cerrarListas(); boton.focus(); }
                /* Escribir una letra salta a la opción que empieza con ella */
                if (e.key.length === 1) { const s = opciones.find(x => x.textContent.trim().toLowerCase().startsWith(e.key.toLowerCase())); if (s) s.focus(); }
            });
        });
    });
    document.addEventListener('click', e => { if (!e.target.closest('.ct-lista')) cerrarListas(); });

    /* --- 4. AVANCE Y VALIDACIÓN --- */
    /* Seis tramos: nombre, empresa, qué, cuándo, inversión y un correo válido. El correo confirma con un visto al quedar bien
       escrito; el botón queda tenue hasta que lo esté */
    const correoOk = () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(campo('correo'));
    const barras = $$('.ct-avance .barras i', brief), textoAvance = $('[data-avance-texto]', brief), boton = $('[data-enviar]', brief);
    const revisar = () => {
        const hechos = [!!campo('nombre'), !!campo('empresa'), !!valor('que'), !!valor('cuando'), !!valor('inversion'), correoOk()];
        const n = hechos.filter(Boolean).length;
        barras.forEach((b, i) => b.classList.toggle('on', i < n));
        textoAvance.textContent = n === 6 ? 'Todo listo' : correoOk() ? `${n} de 6 · ya puedes enviar` : n ? `${n} de 6` : 'Completa la frase';
        $('[name="correo"]', brief).parentElement.classList.toggle('ok', correoOk());
        boton.toggleAttribute('data-falta', !correoOk());
    };
    $$('[data-crece]', brief).forEach(i => i.addEventListener('input', () => { crecer(i); i.parentElement.classList.remove('error'); revisar(); }));
    revisar();

    /* --- 5. ENVIAR Y EL COMPROBANTE --- */
    /* El mensaje se arma con la frase completa y se abre en el correo de quien escribe. La frase se vuelve un comprobante con
       lo escrito y cuándo respondo: 24 h hábiles, con la hora de Santiago (si cae en fin de semana, pasa al lunes) */
    const plazo = () => {
        const d = new Date(Date.now() + 864e5), dia = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', weekday: 'long' }).format(d);
        const salto = dia === 'sábado' ? 2 : dia === 'domingo' ? 1 : 0, f = new Date(d.getTime() + salto * 864e5);
        return new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', weekday: 'long' }).format(f) + ' a las ' + hora(f);
    };
    const enviar = () => {
        if (!correoOk()) {
            const c = $('[name="correo"]', brief); c.parentElement.classList.remove('error'); void c.offsetWidth; c.parentElement.classList.add('error'); c.focus();
            textoAvance.textContent = 'Falta tu correo para responderte'; return;
        }
        const nombre = campo('nombre'), empresa = campo('empresa'), correo = campo('correo');
        const texto = `Hola Agustín, soy ${nombre || '(nombre)'}${empresa ? ', de ' + empresa : ''}. Busco ${valor('que') || 'conversar un proyecto'} para ${valor('cuando') || 'cuando se pueda'}, con una inversión de ${valor('inversion') || 'por definir'}. Respóndeme a ${correo}.`;
        boton.classList.add('enviando'); $('[data-enviar-texto]', boton).textContent = 'Preparando';
        setTimeout(() => {
            window.location.href = `mailto:${CORREO}?subject=${encodeURIComponent('Proyecto' + (empresa ? ' · ' + empresa : ''))}&body=${encodeURIComponent(texto)}`;
            const filas = [['De', nombre + (empresa ? ' · ' + empresa : '')], ['Busca', valor('que')], ['Para', valor('cuando')], ['Inversión', valor('inversion')], ['Responder a', correo]].filter(f => f[1]);
            $('[data-datos]', brief).innerHTML = filas.map(([t, v], i) => `<dt>${t}</dt><dd style="--i:${i}"></dd>`).join('');
            $$('[data-datos] dd', brief).forEach((dd, i) => { dd.textContent = filas[i][1]; });
            $('[data-ticket-hora]', brief).textContent = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', day: 'numeric', month: 'short' }).format(new Date()) + ' · ' + hora(new Date());
            $('[data-listo-titulo]', brief).textContent = `Listo${nombre ? ', ' + nombre.split(' ')[0] : ''}.`;
            $('[data-listo-plazo]', brief).textContent = `Te escribo antes del ${plazo()}`;
            boton.classList.remove('enviando'); $('[data-enviar-texto]', boton).textContent = 'Enviar mensaje';
            brief.classList.add('enviado');
            brief.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
        }, quieto ? 0 : 650);
    };
    boton.addEventListener('click', enviar);
    brief.addEventListener('keydown', e => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); enviar(); }
        else if (e.key === 'Enter' && e.target.name === 'correo') { e.preventDefault(); enviar(); }
        else if (e.key === 'Enter' && e.target.matches('[data-crece]')) { e.preventDefault(); }
    });
    $('[data-otra-vez]', brief).addEventListener('click', () => { brief.classList.remove('enviado'); crecerTodos(); });

    /* --- 6. ENLACES Y ATAJOS --- */
    /* Contact (en el hero, la barra y el footer) baja a la frase. H vuelve arriba, W baja a works y C al contacto */
    const ir = y => window.scrollTo({ top: y, behavior: quieto ? 'auto' : 'smooth' });
    const aContacto = () => { ir(brief.getBoundingClientRect().top + window.scrollY); history.replaceState(null, '', '#contacto'); };
    $$('a[href="#contacto"]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); aContacto(); }));
    window.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea|select/i.test(e.target.tagName) || e.target.closest('[role="listbox"]')) return;
        const k = e.key.toLowerCase();
        if (k === 'c') aContacto();
        if (k === 'h') ir(0);
        if (k === 'w') { const w = document.getElementById('works'); if (w) ir(w.getBoundingClientRect().top + window.scrollY); }
    });

    /* --- 7. COLOFÓN VIVO --- */
    /* Lo que cargó y pesó esta página, medido en el navegador de quien la ve */
    const medir = () => {
        const nav = performance.getEntriesByType('navigation')[0];
        if (!nav || !nav.loadEventEnd) { setTimeout(medir, 300); return; }
        const bytes = [nav, ...performance.getEntriesByType('resource')].reduce((s, r) => s + (r.transferSize || r.encodedBodySize || 0), 0);
        const num = (v, d) => v.toLocaleString('es-CL', { minimumFractionDigits: d, maximumFractionDigits: d });
        $('[data-carga]').textContent = num(nav.loadEventEnd / 1000, 2) + ' s';
        $('[data-peso]').textContent = bytes > 1e6 ? num(bytes / 1e6, 1) + ' MB' : Math.round(bytes / 1e3) + ' kB';
    };
    if (document.readyState === 'complete') medir(); else window.addEventListener('load', medir);

    /* --- 8. VOLVER ARRIBA Y EL NOMBRE --- */
    /* El anillo marca cuánto llevas leído. El nombre calza de margen a margen y sube letra por letra al entrar en pantalla */
    const arriba = $('.pie-arriba-btn');
    let pendiente = false;
    const avance = () => { pendiente = false; arriba.style.setProperty('--avance', (window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)).toFixed(3)); };
    window.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(avance); } }, { passive: true });
    avance();
    const marca = $('[data-marca]'), caja = marca.parentElement;
    const ajustarMarca = () => {
        caja.style.fontSize = '100px';
        const l = marca.children, ancho = l[l.length - 1].getBoundingClientRect().right - l[0].getBoundingClientRect().left;
        caja.style.fontSize = (100 * (caja.clientWidth - 2 * parseFloat(getComputedStyle(caja).paddingLeft)) / ancho) + 'px';
    };
    ajustarMarca(); window.addEventListener('resize', ajustarMarca); if (document.fonts) document.fonts.ready.then(ajustarMarca);
    if (quieto) marca.classList.add('entra');
    else new IntersectionObserver(es => es.forEach(e => marca.classList.toggle('entra', e.isIntersecting)), { threshold: 0.3 }).observe(caja);
})();
/* =======================================================
   FIN JS · CONTACTO Y FOOTER
   ======================================================= */
