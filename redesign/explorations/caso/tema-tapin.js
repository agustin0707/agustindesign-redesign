/* =======================================================
   INICIO JS · TEMA TAP IN (.tp-)
   ======================================================= */
/* Lo propio del caso Tap In: el hero con el resultado final, los visuales de cada capítulo
   y las piezas de marca construidas en código: la exploración de Forky, la marca en el campus, la
   arquitectura, la paleta y el cerebro de cuatro piezas */
(function () {
    const M = 'media/';
    const TONOS = [
        { nombre: 'Empresa', hex: '2D2560', rgb: '45 · 37 · 96', iso: null, uso: 'Corporativo y fondos oscuros' },
        { nombre: 'Campus', hex: '4A3CAE', rgb: '74 · 60 · 174', iso: 'tp-forky.svg', uso: 'Pedir comida sin filas en la universidad' },
        { nombre: 'Connect', hex: '6B5CE7', rgb: '107 · 92 · 231', iso: 'tp-cerebro.svg', uso: 'El sistema del colegio · producto principal' },
        { nombre: 'Health', hex: '9B8EF0', rgb: '155 · 142 · 240', iso: null, uso: 'Servicios internos de salud · en camino' }
    ];
    /* Una marca coloreable: el SVG (o PNG con transparencia) se usa como máscara y toma el color del texto */
    const marca = (src, clase = '') => `<span class="tp-marca ${clase}" style="--svg:url('${M}${src}')" aria-hidden="true"></span>`;
    const pendiente = '<i class="tp-pendiente"></i>';

    /* --- 1. HERO: EL RESULTADO FINAL EN LA PRIMERA PANTALLA --- */
    /* Sobre el degradado de la marca, tapin.cl en un navegador (bajando solo) y el mockup del comedor
       funcionando encima. El wordmark y la bajada a la izquierda */
    window.CASO_HERO = (C, { franja, vivo }) => `
        <section class="seccion portada oscuro tp-hero" data-tp-hero>
            <div class="tp-h-fondo" aria-hidden="true"></div>
            <div class="grilla tp-hero-arriba">${franja(`${C.numero} · ${C.nombre}`, C.disciplinas, `${C.anio} · ${vivo}`)}</div>
            <div class="tp-h-escena" aria-hidden="true">
                <div class="tp-h-nav"><div class="barra-nav"><i></i><i></i><i></i><span class="url">tapin.cl</span></div><div class="tp-h-pantalla"><img src="${M}tp-larga.jpg" alt="" decoding="async"></div></div>
                <div class="tp-h-mk"><div class="mk-marco" data-mockup="${C.heroMockup}"></div></div>
                <span class="tp-h-pill"><i></i>En producción · tapin.cl</span>
            </div>
            <div class="grilla tp-hero-cuerpo">
                <h1 class="tp-titulo" aria-label="${C.nombre}">${marca('tp-wordmark.svg', 'tp-wm')}</h1>
                <p class="tp-hero-bajada">${C.bajada}</p>
                <dl class="tp-hero-meta">${C.heroMeta.map(([k, v]) => `<div><dt class="etiqueta">${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
            </div>
        </section>`;

    /* --- 2. VISUALES DE CAPÍTULO --- */
    window.CASO_CAP_VISUAL = cap => ({
        campus: `<div class="tp-cv tp-cv-campus"><img class="v1" src="${M}tapin_contenido8.webp" alt="" loading="lazy"><img class="v2" src="${M}tapin_contenido3.webp" alt="" loading="lazy"><img class="v3" src="${M}tap_in_mockup_hero.webp" alt="" loading="lazy"><span class="tp-cv-sello">${marca('tp-forky.svg')}</span></div>`,
        rebirth: `<div class="tp-cv tp-cv-rebirth">${TONOS.map((t, i) => `<span class="tp-cv-tira" style="--tono:#${t.hex};--i:${i}">${t.iso ? marca(t.iso) : i === 0 ? marca('tp-wordmark.svg', 'tp-wm-chico') : pendiente}<b>${t.nombre}</b></span>`).join('')}</div>`,
        web: `<div class="tp-cv tp-cv-web"><div class="tp-cv-nav"><div class="barra-nav"><i></i><i></i><i></i><span class="url">tapin.cl</span></div><img src="${M}tp-hero.jpg" alt="" loading="lazy"></div><img class="tp-cv-mk" src="${M}tp-mk-comedor.png" alt="" loading="lazy"></div>`
    })[cap.visual] || '';

    /* Aprendizaje: el giro del proyecto en dos isotipos, de Forky (2025) al cerebro (2026) */
    window.CASO_AP_VISUAL = () => `
        <div class="tp-ap"><span class="tp-ap-iso a"><span class="tp-ap-c">${marca('tp-forky.svg')}</span><b>2025 · Campus</b></span><span class="tp-ap-flecha">→</span><span class="tp-ap-iso b"><span class="tp-ap-c">${marca('tp-cerebro.svg')}</span><b>2026 · Connect</b></span></div>`;

    /* --- 3. PIEZAS PROPIAS --- */
    window.CASO_PIEZAS = window.CASO_PIEZAS || {};
    /* Forky: una exploración breve y coherente con el resultado (de cubiertos a personaje) */
    window.CASO_PIEZAS['tp-forky'] = p => `
        <figure class="pz tp-fk" data-fk>
            <ol class="tp-fk-pasos">${p.pasos.map(([src, t], i) => `<li style="--i:${i}">${marca(src)}<span class="etiqueta">${String(i + 1).padStart(2, '0')} · ${t}</span></li>`).join('')}</ol>
            <div class="tp-fk-final">${marca('tp-forky.svg', 'tp-fk-forky')}<span class="tp-fk-nombre">Forky</span><span class="etiqueta">${p.final}</span></div>
        </figure>`;
    /* Campus: la marca funcionando en la calle (fotos y piezas de las alianzas), no los imprimibles */
    /* Las promos de las marcas van dentro de teléfonos con la barra de la app: así se vieron, dentro de Tap In */
    window.CASO_PIEZAS['tp-campus'] = p => `
        <figure class="pz tp-cp">
            ${p.fotos.map(([src, t], i) => `<div class="tp-cp-c c${i + 1}" style="--i:${i}"><img src="${src}" alt="" loading="lazy" decoding="async">${t ? `<span class="etiqueta">${t}</span>` : ''}</div>`).join('')}
            ${p.promos.map(([src, t], i) => `<div class="tp-cp-tel t${i + 1}" style="--i:${i + 2}"><div class="tp-cp-app">${marca('tp-wordmark.svg', 'tp-wm-mini')}<span>Promos</span></div><img src="${src}" alt="" loading="lazy" decoding="async"><span class="etiqueta">${t}</span></div>`).join('')}
            <ul class="tp-cp-datos">${p.datos.map(([n, t]) => `<li><b>${n}</b><span>${t}</span></li>`).join('')}</ul>
        </figure>`;
    /* Arquitectura: la madre arriba y los productos que cuelgan de ella; un lugar libre para el cuarto */
    window.CASO_PIEZAS['tp-arquitectura'] = p => `
        <figure class="pz tp-arq">
            <div class="tp-arq-madre">${marca('tp-wordmark.svg', 'tp-wm-arq')}<span class="etiqueta">Marca madre · lidera siempre</span></div>
            <svg class="tp-arq-lineas" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">${[50, 150, 250, 350].map((x, i) => `<path d="M200 0 C200 22 ${x} 18 ${x} 40" style="--i:${i}" pathLength="1"/>`).join('')}</svg>
            <ul class="tp-arq-hijos">${TONOS.slice(1).map((t, i) => `
                <li style="--tono:#${t.hex};--i:${i}"><span class="tp-arq-iso">${t.iso ? marca(t.iso) : pendiente}</span><span class="tp-lockup">${marca('tp-wordmark.svg', 'tp-wm-mini')}<b>${t.nombre}</b></span><span class="tp-arq-uso">${t.uso}</span></li>`).join('')}
                <li class="tp-arq-nuevo" style="--i:3"><span class="tp-arq-iso">${pendiente}</span><span class="tp-lockup">${marca('tp-wordmark.svg', 'tp-wm-mini')}<b>+1</b></span><span class="tp-arq-uso">${p.nuevo}</span></li>
            </ul>
        </figure>`;
    /* Paleta: una sola familia; al pasar el mouse, cada tono se abre con sus datos y su uso */
    window.CASO_PIEZAS['tp-paleta'] = p => `
        <figure class="pz tp-paleta">
            <div class="tp-sws">${TONOS.map((t, i) => `
                <div class="tp-sw${t.nombre === 'Connect' ? ' destacado' : ''}" style="--tono:#${t.hex};--i:${i}" tabindex="-1">
                    <span class="tp-sw-n">${t.nombre}</span>
                    <span class="tp-sw-datos"><span>#${t.hex}</span><span>RGB ${t.rgb}</span><span class="tp-sw-uso">${t.uso}</span></span>
                </div>`).join('')}
            </div>
            <div class="tp-sws-sup">${[['Soft', 'C8C0F8'], ['Tint', 'EEEDFE'], ['Superficie', 'F2F1F8'], ['Texto', '2C2B3A']].map(([n, h]) => `<span style="--tono:#${h}"><i></i>${n} · #${h}</span>`).join('')}</div>
            <figcaption class="etiqueta">${p.pie}</figcaption>
        </figure>`;
    /* Cerebro: como la lámina del manual. Alterna entre el cerebro entero y sus cuatro piezas numeradas,
       y prueba la escala (60, 32 y 24 px) */
    window.CASO_PIEZAS['tp-cerebro'] = p => `
        <figure class="pz tp-cer" data-cerebro>
            <div class="tp-cer-panel">
                <div class="tp-cer-svg" aria-label="Isotipo de Tap In Connect" role="img"></div>
                <div class="tp-cer-lema"><span class="a">A la rápida: <b>un cerebro.</b></span><span class="b">Si te fijas: <b>cuatro piezas.</b></span></div>
                <div class="tp-cer-modos"><button type="button" tabindex="-1" data-modo="rapido" class="on">Cerebro</button><button type="button" tabindex="-1" data-modo="fijo">Piezas</button></div>
            </div>
            <div class="tp-cer-escala">${[[60, 'Pasa'], [32, 'Mínimo'], [24, 'Riesgo']].map(([px, t]) => `<div class="${px === 24 ? 'riesgo' : ''}"><span class="tp-cer-mini" style="--px:${px}px">${marca('tp-cerebro.svg')}</span><span class="etiqueta">${px} px · ${t}</span></div>`).join('')}<span class="etiqueta tp-cer-escala-t">Prueba de escala</span></div>
        </figure>`;

    /* --- 4. COMPORTAMIENTO --- */
    (window.CASO_INICIOS = window.CASO_INICIOS || []).push((C, { quieto }) => {
        const hero = document.querySelector('[data-tp-hero]');
        requestAnimationFrame(() => hero.classList.add('entra'));
        const conMouse = window.matchMedia('(hover: hover)').matches;
        /* Parallax suave con inercia: el navegador y el mockup siguen al cursor a distinta profundidad */
        if (!quieto && conMouse) {
            let tx = 0, ty = 0, x = 0, y = 0, corre = false;
            const paso = () => {
                x += (tx - x) * 0.06; y += (ty - y) * 0.06;
                hero.style.setProperty('--mx', x.toFixed(3)); hero.style.setProperty('--my', y.toFixed(3));
                if (Math.abs(tx - x) + Math.abs(ty - y) > 0.002) requestAnimationFrame(paso); else corre = false;
            };
            const ir = (a, b) => { tx = a; ty = b; if (!corre) { corre = true; requestAnimationFrame(paso); } };
            hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); ir((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5); });
            hero.addEventListener('pointerleave', () => ir(0, 0));
        }

        /* Forky: los pasos se encienden en orden y al final aparece Forky corriendo */
        document.querySelectorAll('[data-fk]').forEach(fig => {
            const pasos = [...fig.querySelectorAll('.tp-fk-pasos li')];
            let t = null;
            const andar = () => {
                clearInterval(t); fig.classList.remove('listo'); pasos.forEach(li => li.classList.remove('on'));
                if (quieto) { pasos.forEach(li => li.classList.add('on')); fig.classList.add('listo'); return; }
                let k = 0;
                t = setInterval(() => { if (k < pasos.length) pasos[k++].classList.add('on'); else { fig.classList.add('listo'); clearInterval(t); } }, 520);
            };
            const capa = fig.closest('[data-capa]');
            if (capa) { capa.addEventListener('capa-on', andar); capa.addEventListener('capa-off', () => clearInterval(t)); }
            else new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) andar(); }), { threshold: 0.4 }).observe(fig);
        });

        /* Cerebro: se inserta el SVG oficial; cada pieza sabe hacia dónde separarse y lleva su número */
        fetch(M + 'tp-cerebro.svg').then(r => r.text()).then(svg => {
            document.querySelectorAll('[data-cerebro]').forEach(fig => {
                const caja = fig.querySelector('.tp-cer-svg');
                caja.innerHTML = svg.replace(/<\?xml[^>]*>/, '').replace(/<style>[\s\S]*?<\/style>/, '');
                const el = caja.querySelector('svg'), vb = el.viewBox.baseVal, cx = vb.width / 2, cy = vb.height / 2, ns = 'http://www.w3.org/2000/svg';
                el.removeAttribute('width'); el.removeAttribute('height');
                el.querySelectorAll('path').forEach((pth, k) => {
                    pth.classList.add('tp-pieza', 'p' + (k + 1));
                    const b = pth.getBBox(), bx = b.x + b.width / 2, by = b.y + b.height / 2, dx = bx - cx, dy = by - cy, l = Math.hypot(dx, dy) || 1;
                    pth.style.setProperty('--dx', (dx / l * 54).toFixed(1) + 'px'); pth.style.setProperty('--dy', (dy / l * 54).toFixed(1) + 'px');
                    /* Número de la pieza, en su centro desplazado */
                    const g = document.createElementNS(ns, 'g'); g.setAttribute('class', 'tp-num');
                    g.style.setProperty('--dx', (dx / l * 54).toFixed(1) + 'px'); g.style.setProperty('--dy', (dy / l * 54).toFixed(1) + 'px');
                    g.innerHTML = `<circle cx="${bx}" cy="${by}" r="34"/><text x="${bx}" y="${by}" dy="12">${k + 1}</text>`;
                    el.appendChild(g);
                });
                const botones = [...fig.querySelectorAll('[data-modo]')];
                const modo = m => { fig.classList.toggle('fijo', m === 'fijo'); botones.forEach(b => b.classList.toggle('on', b.dataset.modo === m)); };
                let t = null, manual = false;
                const andar = () => { if (manual || quieto || t) return; modo('rapido'); t = setInterval(() => modo(fig.classList.contains('fijo') ? 'rapido' : 'fijo'), 2600); };
                const parar = () => { clearInterval(t); t = null; };
                botones.forEach(b => b.addEventListener('click', () => { manual = true; parar(); modo(b.dataset.modo); }));
                const capa = fig.closest('[data-capa]');
                if (capa) { capa.addEventListener('capa-on', andar); capa.addEventListener('capa-off', () => { parar(); manual = false; modo('rapido'); }); }
                else new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? andar() : (parar(), (manual = false)))), { threshold: 0.4 }).observe(fig);
            });
        });
    });
})();
/* =======================================================
   FIN JS · TEMA TAP IN (.tp-)
   ======================================================= */
