/* =======================================================
   INICIO JS · BASE COMÚN DEL ÍNDICE DE TRABAJOS
   ======================================================= */
(function () {
    /* --- 1. DATOS DE LOS PROYECTOS --- */
    /* Textos de prueba basados en las notas de los casos; el copy final se escribe en la Fase 4.
       "tinte" es el color más oscuro de cada marca: tiñe el panel y el fondo del caso */
    const proyectos = {
        llego: { nombre: 'Llegó Farma', anio: '2026', disciplinas: 'Marca · One page', cliente: 'Submarca de logística de salud', rol: 'Identidad, manual y sitio web', vivo: 'Lanzamiento esta semana', img: 'media/llego-web.jpg', img2: 'media/llego-foto2.jpg', tinte: '#0A1415', intro: 'Gané el pitch contra el diseñador que ya tenía la marca madre, y diseñé y construí la identidad y el sitio de la nueva submarca de logística farmacéutica.' },
        tapin: { nombre: 'Tap In', anio: '2025–26', disciplinas: 'Marca · Producto · Web', cliente: 'Startup edtech', rol: 'Rebranding, UX/UI y desarrollo web', vivo: 'tapin.cl', img: 'media/tapin-web.jpg', img2: 'media/tapin-app.jpg', tinte: '#110E22', intro: 'De la cafetería del campus a la plataforma del colegio. Una marca, una app y un sitio que acompañaron el pivote completo de una startup.' },
        mend: { nombre: 'Mend', anio: '2026', disciplinas: 'Investigación · Marca · Web app', cliente: 'Proyecto de título · salud articular', rol: 'Investigación, identidad, UX/UI y desarrollo', vivo: 'Prototipo con acceso', img: 'media/mend-web.jpg', img2: 'media/mend-app.jpg', tinte: '#0D2024', intro: 'Una app de salud articular para Atención Primaria, diseñada y construida de punta a punta. En Mend, la accesibilidad manda sobre el manual de marca.' }
    };
    /* Quinto campo: piezas de la hoja de contactos (w3), archivo y ancho a 440 px de alto. Sexto: una línea de contexto */
    const archivo = [
        ['La Columna', 'Dirección de arte editorial', '2022–24', '../../../img/lacolumna_portada2.webp', [['lacolumna-1', 440], ['lacolumna-2', 248], ['lacolumna-3', 440], ['lacolumna-4', 248], ['lacolumna-5', 440], ['lacolumna-6', 248], ['lacolumna-7', 440], ['lacolumna-8', 248], ['lacolumna-9', 440], ['lacolumna-10', 248], ['lacolumna-11', 440]], 'Sistema editorial para una columna de fútbol inglés: portadas, afiches y piezas semanales.'],
        ['HAI Group', 'Identidad corporativa', '2024', '../../../img/hai_portada.webp', [['hai-1', 782], ['hai-2', 782], ['hai-3', 782], ['hai-4', 698], ['hai-5', 782], ['hai-6', 782]], 'Identidad para una empresa de gestión de personas, flexible para sus cuatro líneas de servicio.'],
        ['Mido', 'Marca y UI', '2024–25', '../../../img/mido_portada.webp', [['mido-1', 782], ['mido-2', 352], ['mido-3', 782], ['mido-4', 352], ['mido-5', 782], ['mido-6', 352], ['mido-7', 782]], 'Marca y app de domótica: un hogar que responde a quienes lo habitan.'],
        ['Entrena Po', 'Identidad y redes', '2023–24', '../../../img/entrenapo_portada.webp', [['entrenapo-1', 352], ['entrenapo-2', 782], ['entrenapo-3', 352], ['entrenapo-4', 782], ['entrenapo-5', 352], ['entrenapo-6', 352], ['entrenapo-7', 782], ['entrenapo-8', 352]], 'Identidad y sistema de contenido en Instagram para entrenamiento personalizado.'],
        ['Posters y afiches', 'Gráfica personal', '2022–25', '../../../img/poster_portada.webp', [['posters-1', 311], ['posters-2', 285], ['posters-3', 285], ['posters-4', 285], ['posters-5', 311], ['posters-6', 285], ['posters-7', 277], ['posters-8', 311], ['posters-9', 285], ['posters-10', 782]], 'Afiches de cine, música y fútbol. Exploración gráfica propia.']
    ];
    window.WORKS = { proyectos, archivo };

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const conMouse = window.matchMedia('(hover: hover)').matches;
    const dur = ms => (quieto ? 1 : ms);
    const EASE_MORPH = 'cubic-bezier(0.76, 0, 0.24, 1)';

    /* --- 2. ARCHIVO --- */
    const listaArchivo = document.querySelector('[data-archivo]');
    if (listaArchivo) {
        listaArchivo.innerHTML = archivo.map(([n, d, a, img]) => `<li><a href="#" data-img="${img}"><span class="a-nombre">${n}</span><span class="a-disc mono gris">${d}</span><span class="a-anio mono gris">${a}</span></a></li>`).join('');
        /* Sin miniatura al pasar el mouse: el archivo se mantiene tipográfico (pedido de Agustín) */
        if (false) {
            document.body.insertAdjacentHTML('beforeend', '<div class="miniatura" aria-hidden="true"><img alt=""></div>');
            const mini = document.querySelector('.miniatura'), miniImg = mini.querySelector('img');
            let tx = 0, ty = 0, x = 0, y = 0, corre = false;
            const paso = () => { x += (tx - x) * 0.14; y += (ty - y) * 0.14; mini.style.transform = `translate(${x}px, ${y}px) translate(-50%, -110%)`; if (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) requestAnimationFrame(paso); else corre = false; };
            listaArchivo.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; if (!corre) { corre = true; requestAnimationFrame(paso); } });
            listaArchivo.querySelectorAll('a').forEach(a => a.addEventListener('mouseenter', e => { if (!mini.classList.contains('on')) { x = e.clientX; y = e.clientY; } miniImg.src = a.dataset.img; mini.classList.add('on'); }));
            listaArchivo.addEventListener('mouseleave', () => mini.classList.remove('on'));
        }
    }

    /* --- 3. PÁGINA DE CASO DE PRUEBA --- */
    document.body.insertAdjacentHTML('beforeend', `
        <div class="caso" role="dialog" aria-modal="true" aria-label="Caso">
            <button class="caso-volver mono" type="button">← Volver al índice</button>
            <div class="caso-media"><img alt=""><h2 class="caso-titulo"></h2></div>
            <div class="caso-cuerpo">
                <div class="caso-ficha mono aparece"></div>
                <p class="caso-intro aparece"></p>
                <p class="caso-nota aparece">Página de caso de prueba para ver la transición. El diseño real del caso es la sección 3.</p>
                <div class="caso-segunda aparece"><img alt=""></div>
            </div>
        </div>`);
    const caso = document.querySelector('.caso');
    const media = caso.querySelector('.caso-media');
    const imgCaso = media.querySelector('img');
    const titulo = caso.querySelector('.caso-titulo');
    const volver = caso.querySelector('.caso-volver');
    let origen = null, tituloOrigen = null, scrollGuardado = 0, tinte = '#0B0B0B', clonar = false;

    /* --- 4. BLOQUEO DE SCROLL SEGURO PARA IOS --- */
    const bloquear = () => { scrollGuardado = window.scrollY; document.body.style.top = `-${scrollGuardado}px`; document.body.classList.add('bloqueado'); };
    const desbloquear = () => { document.body.classList.remove('bloqueado'); document.body.style.top = ''; window.scrollTo(0, scrollGuardado); };

    const rectDe = el => { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, width: r.width, height: r.height }; };
    const marco = (r, radio) => ({ top: r.top + 'px', left: r.left + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: radio });
    const aRgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`; };

    /* El clon puede ser una imagen o una escena completa (fondo de marca + navegador o teléfono) */
    const viajero = (contenido, r, radio) => {
        const v = document.createElement('div');
        v.className = 'viajero';
        Object.assign(v.style, marco(r, radio || '0px'));
        if (typeof contenido === 'string') v.innerHTML = `<img src="${contenido}" alt="">`;
        else v.appendChild(contenido);
        return v;
    };
    /* El clon conserva hasta dónde había bajado la web dentro del navegador, para que no salte al viajar */
    const escenaDe = el => {
        const e = el.querySelector('.escena'); if (!e) return null;
        const c = e.cloneNode(true); c.classList.add('quieta');
        /* El sitio en vivo no viaja (sería otra carga completa): se recuerda hasta dónde había bajado */
        let bajado = 0;
        const vivo = e.querySelector('iframe');
        try { bajado = vivo && vivo.contentWindow ? vivo.contentWindow.scrollY : 0; } catch (err) { bajado = 0; }
        c.querySelectorAll('iframe').forEach(f => f.remove());
        const orig = e.querySelectorAll('img'), copias = c.querySelectorAll('img');
        copias.forEach((img, i) => { const cs = getComputedStyle(orig[i]); img.style.translate = cs.translate; img.style.scale = cs.scale; if (!img.classList.contains('poster')) img.style.opacity = cs.opacity; });
        /* La pantalla de carga de la app no viaja: si se presiona apenas al pasar el mouse, la portada quedaría congelada en ella */
        c.querySelectorAll('.splash').forEach(s => { s.style.opacity = '0'; });
        /* Continuidad: si el sitio había bajado, el clon muestra la captura larga en ese mismo punto en vez de la portada */
        const largaOrig = e.querySelector('.larga'), larga = c.querySelector('.larga');
        if (bajado > 0 && larga && largaOrig && largaOrig.complete && largaOrig.naturalHeight) {
            const altoSitio = largaOrig.naturalHeight * 1440 / largaOrig.naturalWidth;
            larga.style.display = 'block';
            larga.style.translate = `0 ${-(bajado / altoSitio) * 100}%`;
            const poster = c.querySelector('.poster'); if (poster) poster.style.opacity = '0';
        }
        return c;
    };

    /* --- 5. ABRIR CASO --- */
    /* Lo presionado viaja hasta la portada (sin deformarse); el título viaja desde su lugar en el índice */
    window.abrirCaso = (id, desde, desdeTitulo, opciones = {}) => {
        const p = proyectos[id];
        origen = desde; tituloOrigen = desdeTitulo || null; tinte = p.tinte; clonar = !!opciones.clonar;
        media.querySelectorAll('.escena').forEach(e => e.remove());
        imgCaso.src = p.img;
        if (clonar) { const e = escenaDe(desde); if (e) media.insertBefore(e, titulo); imgCaso.style.display = 'none'; } else imgCaso.style.display = '';
        titulo.textContent = p.nombre;
        caso.querySelector('.caso-ficha').innerHTML = `<div><span class="gris">Cliente</span><span>${p.cliente}</span></div><div><span class="gris">Rol</span><span>${p.rol}</span></div><div><span class="gris">Año</span><span>${p.anio}</span></div><div><span class="gris">En vivo</span><span>${p.vivo}</span></div>`;
        caso.querySelector('.caso-intro').textContent = p.intro;
        caso.querySelector('.caso-segunda img').src = p.img2;

        const rInicio = rectDe(desde);
        const radio = getComputedStyle(desde).borderRadius;
        bloquear();
        caso.scrollTop = 0;
        caso.classList.add('abierto');
        const portada = clonar ? media.querySelector('.escena') : imgCaso;
        if (portada) portada.style.opacity = 0;
        titulo.style.opacity = 0;
        caso.animate([{ backgroundColor: aRgba(tinte, 0) }, { backgroundColor: aRgba(tinte, 1) }], { duration: dur(700), easing: 'ease', fill: 'both' });
        const rFin = rectDe(media);
        const v = viajero(clonar ? escenaDe(desde) : p.img, rInicio, radio);
        media.insertBefore(v, titulo);
        const viaje = v.animate([marco(rInicio, radio), marco(rFin, '0px')], { duration: dur(1100), easing: EASE_MORPH, fill: 'forwards' });

        /* Título: FLIP desde el nombre del índice, o subida simple si no hay origen */
        const rTit = titulo.getBoundingClientRect();
        if (tituloOrigen) {
            const rO = tituloOrigen.getBoundingClientRect();
            const s = parseFloat(getComputedStyle(tituloOrigen).fontSize) / parseFloat(getComputedStyle(titulo).fontSize);
            tituloOrigen.style.opacity = 0;
            titulo.style.opacity = 1;
            titulo.animate([{ transform: `translate(${rO.left - rTit.left}px, ${rO.bottom - rTit.bottom}px) scale(${s})` }, { transform: 'none' }], { duration: dur(1100), easing: EASE_MORPH, fill: 'both' });
        } else {
            titulo.style.opacity = 1;
            titulo.animate([{ opacity: 0, transform: 'translateY(40px)' }, { opacity: 1, transform: 'none' }], { duration: dur(900), delay: dur(650), easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' });
        }

        viaje.onfinish = () => {
            if (portada) portada.style.opacity = 1;
            v.remove();
            caso.querySelectorAll('.aparece').forEach((el, i) => el.animate([{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: dur(900), delay: dur(i * 90), easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' }));
            volver.animate([{ opacity: 0 }, { opacity: 1 }], { duration: dur(500), fill: 'forwards' });
            volver.focus({ preventScroll: true });
        };
    };

    /* --- 6. CERRAR CASO --- */
    /* El camino inverso: la portada vuelve a su lugar en el índice */
    const cerrar = () => {
        if (!caso.classList.contains('abierto')) return;
        caso.scrollTo({ top: 0 });
        const rInicio = rectDe(media);
        desbloquear();
        const rFin = origen ? rectDe(origen) : rInicio;
        const radio = origen ? getComputedStyle(origen).borderRadius : '0px';
        const v = viajero(clonar ? escenaDe(media) : imgCaso.src, rInicio, '0px');
        v.style.zIndex = 120;
        document.body.appendChild(v);
        caso.querySelectorAll('.aparece').forEach(el => el.getAnimations().forEach(a => a.cancel()));
        volver.getAnimations().forEach(a => a.cancel());
        const portada = clonar ? media.querySelector('.escena') : imgCaso;
        if (portada) portada.style.opacity = 0;
        titulo.style.opacity = 0;
        caso.animate([{ backgroundColor: aRgba(tinte, 1) }, { backgroundColor: aRgba(tinte, 0) }], { duration: dur(700), easing: 'ease', fill: 'both' });
        const vuelta = v.animate([marco(rInicio, '0px'), marco(rFin, radio)], { duration: dur(950), easing: EASE_MORPH, fill: 'forwards' });
        vuelta.onfinish = () => {
            v.remove(); caso.classList.remove('abierto'); caso.getAnimations().forEach(a => a.cancel());
            if (tituloOrigen) tituloOrigen.style.opacity = '';
            /* El foco vuelve al proyecto desde el que se entró */
            const foco = (tituloOrigen && tituloOrigen.closest('[tabindex]')) || origen;
            if (foco) foco.focus?.({ preventScroll: true });
            document.dispatchEvent(new CustomEvent('caso:cerrado'));
        };
    };
    volver.addEventListener('click', cerrar);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrar(); });
})();
/* =======================================================
   FIN JS · BASE COMÚN DEL ÍNDICE DE TRABAJOS
   ======================================================= */
