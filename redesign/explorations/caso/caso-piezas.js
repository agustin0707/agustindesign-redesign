/* =======================================================
   INICIO JS · PIEZAS DE CADA DECISIÓN
   ======================================================= */
/* Devuelve el HTML de la pieza que acompaña a una decisión, según su tipo. Común a todos los casos */
(function () {
    const img = (src, extra = '') => `<img src="${src}" alt="" loading="lazy" decoding="async"${extra}>`;
    /* Los temas pueden sumar tipos propios en window.CASO_PIEZAS (tipo → función) */
    window.CASO_PIEZAS = window.CASO_PIEZAS || {};
    window.CASO_PIEZA = d => {
        const p = d.pieza;
        if (window.CASO_PIEZAS[p.tipo]) return window.CASO_PIEZAS[p.tipo](p, d);
        if (p.tipo === 'isos') return `
            <figure class="pz pz-isos">
                <div class="isos">${p.lista.map((src, i) => img(src, ` style="--i:${i}"${i === p.lista.length - 1 ? ' class="final"' : ''}`)).join('')}</div>
                <figcaption class="etiqueta">${p.pie}</figcaption>
            </figure>`;
        if (p.tipo === 'img') return `
            <figure class="pz pz-img${p.extra ? ' con-extra' : ''}">${img(p.src)}${p.extra ? img(p.extra, ' class="extra"') : ''}${p.pie ? `<figcaption class="etiqueta">${p.pie}</figcaption>` : ''}</figure>`;
        if (p.tipo === 'par') return `
            <figure class="pz pz-par">
                <div>${img(p.a)}<span class="etiqueta">${p.pieA}</span></div>
                <div>${img(p.b)}<span class="etiqueta">${p.pieB}</span></div>
            </figure>`;
        if (p.tipo === 'movil') return `
            <figure class="pz pz-movil">
                <div class="telefono-caso">${img(p.src)}</div>
                <ul class="chequeo etiqueta">${p.lista.map(x => `<li>${x}</li>`).join('')}</ul>
            </figure>`;
        if (p.tipo === 'caminos') return `
            <figure class="pz pz-caminos">
                <div class="caminos">${p.lista.map(([nombre, src, rasgo], i) => `
                    <div class="camino${i === p.elegido ? ' elegido' : ''}" style="--i:${i}"><div class="cuadro">${img(src)}</div><span class="etiqueta"><b>${nombre}</b> · ${rasgo}</span></div>`).join('')}
                </div>
                ${p.tabla ? `<div class="tabla">${img(p.tabla)}</div>` : ''}
                ${p.pie ? `<figcaption class="etiqueta">${p.pie}</figcaption>` : ''}
            </figure>`;
        /* Una secuencia de imágenes: la actual en grande y las demás como miniaturas que avanzan solas */
        if (p.tipo === 'evolucion') return `
            <figure class="pz pz-evolucion" data-evolucion>
                <div class="evo-escena">${p.lista.map(([src, txt], i) => `<div class="evo-cuadro${i === 0 ? ' on' : ''}">${img(src)}<span class="etiqueta">${String(i + 1).padStart(2, '0')} · ${txt}</span></div>`).join('')}</div>
                <div class="evo-tira" style="--n:${p.lista.length}">${p.lista.map(([src], i) => `<button type="button" tabindex="-1" class="${i === 0 ? 'on' : ''}" data-i="${i}" aria-label="Paso ${i + 1}">${img(src)}<i></i></button>`).join('')}</div>
            </figure>`;
        if (p.tipo === 'grilla') return `
            <figure class="pz pz-grilla">${p.lista.map(([src, txt], i) => `<div class="g-cuadro g${i + 1}" style="--i:${i}">${img(src)}${txt ? `<span class="etiqueta">${txt}</span>` : ''}</div>`).join('')}${p.pie ? `<figcaption class="etiqueta">${p.pie}</figcaption>` : ''}</figure>`;
        /* Un mockup animado real del sitio, embebido: arranca y se detiene con su capa o al verse */
        if (p.tipo === 'mockup') return `
            <figure class="pz pz-mockup">
                <div class="mk-marco" data-mockup="${p.src}"></div>
                ${p.pasos ? `<ol class="mk-pasos">${p.pasos.map(x => `<li class="etiqueta">${x}</li>`).join('')}</ol>` : ''}
                ${p.pie ? `<figcaption class="etiqueta">${p.pie}</figcaption>` : ''}
            </figure>`;
        return '';
    };

    /* --- PIEZAS VIVAS --- */
    /* Una pieza está "a la vista" si su capa del escenario está encendida (escritorio) o si se ve en pantalla
       (móvil, debajo del texto). Solo entonces avanza o anima: nada corre fuera de vista */
    const alVerse = (el, on, off) => {
        const capa = el.closest('[data-capa]');
        if (capa) { capa.addEventListener('capa-on', on); capa.addEventListener('capa-off', off); return; }
        new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? on() : off())), { threshold: 0.35 }).observe(el);
    };
    (window.CASO_INICIOS = window.CASO_INICIOS || []).push((C, { quieto }) => {
        /* Evolución: avanza cada 1,8 s; un clic elige el paso y detiene el avance */
        document.querySelectorAll('[data-evolucion]').forEach(fig => {
            const cuadros = [...fig.querySelectorAll('.evo-cuadro')], botones = [...fig.querySelectorAll('.evo-tira button')];
            let i = 0, t = null, manual = false;
            const ir = k => { i = k; cuadros.forEach((c, j) => c.classList.toggle('on', j === k)); botones.forEach((b, j) => { b.classList.toggle('on', j === k); b.classList.toggle('ya', j < k); }); };
            const parar = () => { clearInterval(t); t = null; };
            const andar = () => { if (manual || quieto || t) return; ir(0); t = setInterval(() => { if (i >= cuadros.length - 1) { parar(); return; } ir(i + 1); }, 1800); };
            botones.forEach((b, k) => b.addEventListener('click', () => { manual = true; parar(); ir(k); }));
            alVerse(fig, andar, () => { parar(); manual = false; });
        });
        /* Mockups del sitio: se montan la primera vez que se necesitan y se escalan al ancho del marco */
        document.querySelectorAll('[data-mockup]').forEach(marco => {
            let f = null;
            const escalar = () => { if (f) f.style.setProperty('--escala', (marco.clientWidth / 900).toFixed(4)); };
            const mensaje = tipo => { try { f && f.contentWindow && f.contentWindow.postMessage({ type: tipo }, '*'); } catch (err) { /* nada */ } };
            const on = () => {
                if (!f) {
                    f = document.createElement('iframe');
                    f.title = 'Mockup animado de Tap In'; f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
                    f.src = marco.dataset.mockup + '?frameless';
                    f.onload = () => { marco.classList.add('listo'); if (marco._on) mensaje('mockup-start'); };
                    marco.appendChild(f); escalar();
                }
                marco._on = true; mensaje('mockup-start');
            };
            const off = () => { marco._on = false; mensaje('mockup-stop'); };
            window.addEventListener('resize', escalar);
            alVerse(marco, on, off);
        });

        /* Resultado en vivo: los mockups se montan al llegar a la sección; solo el elegido anima.
           Avanza solo cada 9 s (la barra marca el tiempo) y se pausa con el mouse encima */
        document.querySelectorAll('[data-en-vivo]').forEach(ev => {
            const botones = [...ev.querySelectorAll('.ev-lista button')], cuadros = [...ev.querySelectorAll('.ev-cuadro')];
            const DUR = 9000;
            let k = 0, t = null, visto = false, encima = false;
            const iframes = [];
            const msj = (f, tipo) => { try { f && f.contentWindow && f.contentWindow.postMessage({ type: tipo }, '*'); } catch (err) { /* nada */ } };
            const escalar = () => cuadros.forEach((c, j) => { const f = iframes[j]; if (f) f.style.setProperty('--escala', (c.clientWidth / 900).toFixed(4)); });
            const montar = () => cuadros.forEach((c, j) => {
                const marco = c.querySelector('.mk-marco');
                const f = document.createElement('iframe');
                f.title = 'Mockup animado'; f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
                f.src = marco.dataset.mockupManual + '?frameless';
                f.onload = () => { marco.classList.add('listo'); if (j === k && visto) msj(f, 'mockup-start'); };
                marco.appendChild(f); iframes[j] = f;
            });
            const ir = j => {
                msj(iframes[k], 'mockup-stop');
                k = j;
                botones.forEach((b, i) => b.classList.toggle('on', i === k));
                cuadros.forEach((c, i) => c.classList.toggle('on', i === k));
                msj(iframes[k], 'mockup-start');
                programar();
            };
            const programar = () => { clearTimeout(t); if (quieto || encima || !visto) return; t = setTimeout(() => ir((k + 1) % cuadros.length), DUR); };
            ev.style.setProperty('--ev-dur', DUR / 1000 + 's');
            botones.forEach((b, i) => b.addEventListener('click', () => ir(i)));
            ev.addEventListener('mouseenter', () => { encima = true; ev.classList.add('pausa'); clearTimeout(t); });
            ev.addEventListener('mouseleave', () => { encima = false; ev.classList.remove('pausa'); programar(); });
            window.addEventListener('resize', escalar);
            new IntersectionObserver(es => es.forEach(e => {
                if (e.isIntersecting) { if (!iframes.length) { montar(); escalar(); } visto = true; msj(iframes[k], 'mockup-start'); programar(); }
                else { visto = false; clearTimeout(t); msj(iframes[k], 'mockup-stop'); }
            }), { threshold: 0.3 }).observe(ev);
        });
    });
})();
/* =======================================================
   FIN JS · PIEZAS DE CADA DECISIÓN
   ======================================================= */
