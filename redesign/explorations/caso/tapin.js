/* =======================================================
   INICIO JS · CASO TAP IN EDITORIAL (.tp-)
   ======================================================= */
/* Caso en módulos a todo el ancho, como un proyecto de Behance, con escenas que avanzan con el scroll.
   Cada [data-escena] es una pista alta con un panel fijo: su avance se publica como --p (0 a 1) y el CSS
   decide qué hacer con él. Dentro, [data-rango="a-b"] se enciende entre a y b, y con data-pasos los
   [data-paso] marcan el paso actual (.on) y los anteriores (.ya). Algunas escenas suman su lógica propia */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let vh = window.innerHeight;

    /* --- 1. LÓGICA PROPIA DE CADA ESCENA --- */
    const propias = {
        /* Hero: el zoom del sitio con una curva suave, más rápido que el recorrido de la pista */
        hero: el => p => el.style.setProperty('--h', curva(Math.min(p * 1.25, 1)).toFixed(4)),
        /* Resumen: el cursor recorre el proyecto mes a mes; la credencial cambia al capítulo en curso y los
           hitos se encienden. El cursor llega a "Hoy" un poco antes del final, para que se lea quieto */
        resumen: el => {
            const cred = el.querySelector('[data-cred]'), tiempo = el.querySelector('[data-tiempo]');
            const hitos = [...el.querySelectorAll('.tp-hito')], signos = [...el.querySelectorAll('[data-signo]')];
            const pies = [...el.querySelectorAll('.tp-pie-t')];
            const CAPS = [
                { tono: '#4A3CAE', per: '2025', nom: 'El origen', txt: 'Pedir comida sin filas en la universidad, con unos cubiertos que corren' },
                { tono: '#6B5CE7', per: 'Feb a abr 2026', nom: 'El Rebirth', txt: 'De la comida a los colegios: arquitectura, paleta y el cerebro de Connect' },
                { tono: '#2D2560', per: 'Abr a sep 2026', nom: 'La web', txt: 'tapin.cl, diseñada y programada para que un director entienda en segundos' }
            ];
            let capActual = -1, ultimo = -1, mostrado = 0, encima = null, visible = 0;
            /* El texto del hito se ancla a su punto: dos capas que se alternan para fundir el cambio */
            const mostrar = i => {
                if (i === mostrado) return;
                mostrado = i;
                const h = hitos[i], m = parseFloat(h.style.getPropertyValue('--m'));
                const sale = pies[visible], entra = pies[1 - visible];
                entra.querySelector('b').textContent = h.dataset.f; entra.querySelector('span').textContent = h.dataset.t;
                entra.style.setProperty('--x', (m + 0.5).toFixed(2)); entra.style.setProperty('--ancla', (m / 21).toFixed(3));
                sale.style.setProperty('--x', (m + 0.5).toFixed(2)); sale.style.setProperty('--ancla', (m / 21).toFixed(3));
                sale.classList.remove('on'); entra.classList.add('on'); visible = 1 - visible;
            };
            hitos.forEach((h, i) => {
                const ver = () => { encima = i; mostrar(i); };
                const soltar = () => { encima = null; mostrar(Math.max(ultimo, 0)); };
                h.addEventListener('pointerenter', ver); h.addEventListener('focus', ver);
                h.addEventListener('pointerleave', soltar); h.addEventListener('blur', soltar);
            });
            /* Inclinación leve con el mouse, desde el gancho, con el brillo del plástico */
            if (!quieto && window.matchMedia('(hover: hover)').matches) {
                el.addEventListener('pointermove', e => {
                    const r = cred.getBoundingClientRect(), x = fijar((e.clientX - r.left) / r.width - 0.5, -1, 1), y = fijar((e.clientY - r.top) / r.height - 0.5, -1, 1);
                    cred.style.setProperty('--ry', (x * 7).toFixed(2) + 'deg'); cred.style.setProperty('--rx', (-y * 5).toFixed(2) + 'deg');
                    cred.style.setProperty('--lx', (x * 36).toFixed(1) + '%'); cred.style.setProperty('--ly', (y * 36).toFixed(1) + '%');
                });
                el.addEventListener('pointerleave', () => ['--rx', '--ry', '--lx', '--ly'].forEach(v => cred.style.removeProperty(v)));
            }
            const fijo = el.querySelector('.tp-fijo'), tap = el.querySelector('.tp-tap');
            return p => {
                /* El recorrido del tiempo ocupa el 70 % de la pista; el resto es la onda de tap */
                const mes = fijar(p / 0.7) * 21.68;
                tiempo.style.setProperty('--mes', mes.toFixed(3));
                const t = fijar((p - 0.7) / 0.24);
                el.style.setProperty('--t', t.toFixed(4));
                if (t > 0) {
                    const f = fijo.getBoundingClientRect(), c = cred.getBoundingClientRect();
                    tap.style.setProperty('--ox', ((c.left + c.width / 2 - f.left) / f.width * 100).toFixed(2) + '%');
                    tap.style.setProperty('--oy', ((c.top + c.height / 2 - f.top) / f.height * 100).toFixed(2) + '%');
                }
                let u = -1;
                hitos.forEach((h, i) => { const on = parseFloat(h.style.getPropertyValue('--m')) <= mes; h.classList.toggle('on', on); if (on) u = i; });
                hitos.forEach((h, i) => h.classList.toggle('ultimo', i === u));
                const cap = mes < 13 ? 0 : mes < 15.5 ? 1 : 2;
                if (u !== ultimo) { ultimo = u; if (encima === null) mostrar(Math.max(u, 0)); }
                if (cap === capActual) return;
                capActual = cap;
                const c = CAPS[cap];
                cred.style.setProperty('--tono', c.tono);
                cred.querySelector('[data-c-num]').textContent = `0${cap + 1} / 03`;
                cred.querySelector('[data-c-per]').textContent = c.per;
                cred.querySelector('[data-c-nom]').textContent = c.nom;
                cred.querySelector('[data-c-txt]').textContent = c.txt;
                signos.forEach((sg, i) => sg.classList.toggle('on', i === cap));
            };
        },
        /* Decisión 01: el contador de formas sigue al paso en curso */
        forky: el => {
            const n = el.querySelector('[data-fk-n]'), qr = document.querySelector('.tp-qr');
            return p => {
                n.textContent = `${String(Math.min(Math.floor(fijar(p / 0.7) * 7), 6) + 1).padStart(2, '0')} / 07`;
                /* El paso a la 02 se mide desde la escena del QR, que se fija encima en las últimas 100svh */
                el.style.setProperty('--tr', fijar(-qr.getBoundingClientRect().top / (qr.offsetHeight - vh) * 4).toFixed(3));
            };
        },
        /* El Rebirth: las tiras viajan de la portada a las columnas 8 a 12 */
        rebirth: el => {
            /* En la pieza, un toque abre o cierra el detalle de cada tira (con mouse lo hace el hover) */
            const tiras = [...el.querySelectorAll('.tp-tira')];
            tiras.forEach(t => t.addEventListener('click', () => { if (window.matchMedia('(hover: hover)').matches) return; const abre = !t.classList.contains('abierta'); tiras.forEach(x => x.classList.remove('abierta')); t.classList.toggle('abierta', abre); }));
            /* Cuarto tiempo: las cuatro tiras viajan a la placa de la anatomía; después la placa cambia de producto */
            const cont = el.querySelector('.tp-tiras'), placa = el.querySelector('.tp-ar-placa'), ar = el.querySelector('[data-ar]');
            const PROD = [['Campus', '#4A3CAE', 'Comida sin filas'], ['Connect', '#6B5CE7', 'El sistema del colegio'], ['Health', '#9B8EF0', 'En camino'], ['+1', '#1C1A2E', 'El próximo, cuando llegue']];
            const partes = [...ar.querySelectorAll('[data-i]')], nAr = ar.querySelector('[data-ar-n]'), hexAr = ar.querySelector('[data-ar-hex]');
            let elegido = null, mostrado = -1, p4Actual = 0;
            const porScroll = () => Math.min(Math.floor(fijar((p4Actual - 0.5) / 0.48) * 4), 3);
            const mostrar = i => {
                if (i === mostrado) return; mostrado = i;
                partes.forEach(x => x.classList.toggle('on', +x.dataset.i === i));
                placa.style.setProperty('--tono-sel', PROD[i][1]);
                nAr.textContent = `0${i + 1} / 04 · ${PROD[i][2]}`; hexAr.textContent = i === 3 ? 'Tono por definir' : PROD[i][1];
            };
            ar.querySelectorAll('.tp-ar-serie button').forEach(btn => {
                const i = +btn.dataset.i;
                btn.addEventListener('mouseenter', () => { elegido = i; mostrar(i); });
                btn.addEventListener('focus', () => { elegido = i; mostrar(i); });
                btn.addEventListener('click', () => { elegido = i; mostrar(i); });
                btn.addEventListener('mouseleave', () => { elegido = null; mostrar(porScroll()); });
                btn.addEventListener('blur', () => { elegido = null; mostrar(porScroll()); });
            });
            const relativo = (x, base) => { const a = x.getBoundingClientRect(), b = base.getBoundingClientRect(); return { l: a.left - b.left, t: a.top - b.top, w: a.width, h: a.height }; };
            return p => {
                /* Los tres primeros tiempos corren en los primeros 380svh de la pista; el cuarto, en el resto */
                const pista = el.offsetHeight - vh, s = p * pista, base = 3.8 * vh;
                const pr = fijar(s / base), p4 = fijar((s - base) / (pista - base));
                el.style.setProperty('--pr', pr.toFixed(4)); el.style.setProperty('--p4', p4.toFixed(4));
                el.style.setProperty('--b', curva(fijar((pr - 0.56) / 0.16)).toFixed(4));
                const pieza = pr > 0.64 && p4 < 0.12;
                el.classList.toggle('tp-rb-pieza', pieza);
                if (!pieza) tiras.forEach(x => x.classList.remove('abierta'));
                el.classList.toggle('tp-rb-fin', p4 > 0.46);
                p4Actual = p4;
                if (elegido === null) mostrar(porScroll());
                const viaja = p4 > 0.12;
                el.classList.toggle('tp-rb-morph', viaja);
                if (!viaja) { tiras.forEach(t => { t.style.left = t.style.top = t.style.width = t.style.height = ''; }); return; }
                const ancho = cont.clientWidth, alto = cont.clientHeight, pesos = [1, 1, 1.5, 1], util = ancho - 24, k = curva(fijar((p4 - 0.14) / 0.26)), d = relativo(placa, cont);
                let x = 0;
                tiras.forEach((t, i) => {
                    const w = util * pesos[i] / 4.5, a = { l: x, t: 0, w, h: alto }; x += w + 8;
                    t.style.left = (a.l + (d.l - a.l) * k) + 'px'; t.style.top = (a.t + (d.t - a.t) * k) + 'px';
                    t.style.width = (a.w + (d.w - a.w) * k) + 'px'; t.style.height = (a.h + (d.h - a.h) * k) + 'px';
                });
            };
        },
        /* Decisión 05: en el paso 3 el cerebro vuela hasta la pestaña del navegador y se vuelve su favicon. Los pasos
           son botones que llevan a su tramo de la escena */
        cerebro: el => {
            const svg = el.querySelector('.tp-cer-svg'), lienzo = el.querySelector('.tp-cer-lienzo'), fav = el.querySelector('[data-fav]');
            el.querySelectorAll('[data-ir-paso]').forEach(b => b.addEventListener('click', () => {
                const top = el.getBoundingClientRect().top + window.scrollY, alto = el.offsetHeight - vh;
                window.scrollTo({ top: top + [0.2, 0.48, 0.9][+b.dataset.irPaso] * alto, behavior: quieto ? 'auto' : 'smooth' });
            }));
            return p => {
                const t = curva(fijar((p - 0.66) / 0.14)), L = lienzo.getBoundingClientRect(), F = fav.getBoundingClientRect(), w = svg.offsetWidth || 1;
                const dx = F.left + F.width / 2 - (L.left + L.width / 2), dy = F.top + F.height / 2 - (L.top + L.height / 2);
                svg.style.transform = t > 0 ? `translate(${(dx * t).toFixed(1)}px, ${(dy * t).toFixed(1)}px) scale(${(1 + (F.width * 0.7 / w - 1) * t).toFixed(4)})` : '';
                el.style.setProperty('--fv', fijar((p - 0.79) / 0.03).toFixed(3));
            };
        },
        /* Decisión 02: el contador de pasos del escaneo */
        qr: el => {
            const n = el.querySelector('[data-qr-n]');
            return p => {
                el.style.setProperty('--tr', fijar(p * 4).toFixed(3));
                n.textContent = `${String(Math.max(Math.min(Math.floor(p * 4), 3), 1)).padStart(2, '0')} / 03`;
            };
        },
        /* Capítulo 01: Forky corre mientras se scrollea y se inclina según la velocidad; quieto, se detiene */
        cap: el => {
            let antes = 0, espera = null;
            return p => {
                const v = p - antes; antes = p;
                if (quieto) return;
                el.style.setProperty('--lean', fijar(v * 120, -1, 1).toFixed(3));
                el.classList.add('corriendo');
                clearTimeout(espera);
                espera = setTimeout(() => { el.classList.remove('corriendo'); el.style.setProperty('--lean', 0); }, 180);
            };
        },
        /* Capítulo 03: la portada entra sobre el final del manual (que sube y se apaga), la dirección se escribe con el
           scroll, la pestaña toma el nombre del sitio y la página se dibuja adentro de la ventana */
        url: el => {
            const caja = el.querySelector('[data-url]'), txt = caja.dataset.url, man = document.querySelector('.tp-man'), tab = el.querySelector('[data-c3-tab]');
            caja.innerHTML = [...txt].map(c => `<span>${c}</span>`).join('');
            const letras = [...caja.children];
            /* Termina una pantalla antes del final de su pista: ese tramo lo cubre el sitio, que toma su ventana */
            return pista => {
                const p = fijar(pista * (el.offsetHeight - vh) / (el.offsetHeight - 2 * vh));
                const e = curva(fijar(p / 0.3)), f = fijar((p - 0.68) / 0.06);
                el.style.setProperty('--e', e.toFixed(3)); if (man) man.style.setProperty('--sale', e.toFixed(3));
                el.style.setProperty('--a', fijar((p - 0.22) / 0.12).toFixed(3));
                const n = Math.round(fijar((p - 0.34) / 0.22) * letras.length);
                letras.forEach((l, i) => l.classList.toggle('on', i < n));
                el.classList.toggle('escrito', n === letras.length);
                el.style.setProperty('--c', n === letras.length ? fijar((p - 0.6) / 0.14).toFixed(3) : 0);
                el.style.setProperty('--f', f.toFixed(3)); tab.textContent = f > 0.5 ? 'Tap In · Gestión escolar' : 'Nueva pestaña';
                el.style.setProperty('--pi', curva(fijar((p - 0.72) / 0.2)).toFixed(3));
            };
        },
        /* El manual en código: el bloque del paso se escribe con el scroll y la vista previa lo vuelve gráfica. Cada
           variable que compila enciende su etiqueta con un pulso; pasar el cursor por una línea o por una pieza enciende
           el par. En el paso 4 una perilla recorre el rango morado: con el scroll se frena en cada producto, y también
           se arrastra, se ajusta sola cerca de un producto y resiste fuera del rango */
        manual: el => {
            const N = 4, codigo = el.querySelector('[data-man-codigo]'), lineas = [...codigo.children];
            const nombres = ['Color', 'Tipografía', 'ADN', 'Interfaz'], rutas = ['color', 'tipografia', 'adn', 'interfaz'];
            const placa = el.querySelector('[data-man-placa]');
            const ajena = el.querySelector('[data-man-ajena]'), pest = el.querySelector('[data-man-pest]'), kbd = el.querySelector('[data-man-kbd]');
            const runner = el.querySelector('[data-man-runner]'), vivo = el.querySelector('[data-man-vivo]'), pieza = el.querySelector('.tp-man-pieza');
            const mapa = el.querySelector('[data-man-mapa]');
            mapa.innerHTML = lineas.map(l => `<i style="--w:${Math.min(Math.max(l.textContent.length * 0.55, 3), 26)}px"></i>`).join('');
            const barritas = [...mapa.children], compiladas = new Set();
            let elegido = false, pasoAntes = -1;
            /* --- Dial del tono: el color se interpola entre los cuatro tonos del manual --- */
            const dial = el.querySelector('[data-man-dial]'), rango = el.querySelector('[data-man-rango]'), pista = el.querySelector('[data-man-pista]');
            const perilla = el.querySelector('[data-man-perilla]'), fantasma = el.querySelector('[data-man-fantasma]'), globo = el.querySelector('[data-man-globo]');
            const paradas = ['#2D2560', '#4A3CAE', '#6B5CE7', '#9B8EF0'].map(h => [1, 3, 5].map(n => parseInt(h.slice(n, n + 2), 16)));
            const marcas = ['empresa', 'campus', 'connect', 'health'], botonesP = [...el.querySelectorAll('.tp-man-paradas button')];
            const colorEn = x => { const v = fijar(x) * 3, n = Math.min(Math.floor(v), 2), f = v - n; return '#' + paradas[n].map((c, j) => Math.round(c + (paradas[n + 1][j] - c) * f).toString(16).padStart(2, '0')).join('').toUpperCase(); };
            let xActual = 1 / 3, paradaAntes = 1;
            const ponerX = (x, modo = 'anima') => {
                const xv = x < 0 ? x * 0.15 : x > 1 ? 1 + (x - 1) * 0.15 : x, xc = fijar(x), hex = colorEn(xc), cerca = Math.round(xc * 3), justo = Math.abs(xc * 3 - cerca) < 0.04;
                xActual = xc; perilla.classList.toggle('arrastra', modo === 'arrastra'); perilla.classList.toggle('sigue', modo === 'sigue'); rango.style.setProperty('--xv', xv.toFixed(4));
                dial.style.setProperty('--tono', hex); dial.style.setProperty('--sobre', xc > 0.82 ? '#1C1A2E' : '#FFFFFF');
                el.querySelector('[data-man-hex]').textContent = hex; el.querySelector('[data-man-chip]').style.setProperty('--c', hex);
                el.querySelector('[data-man-cerca]').textContent = justo ? `/* ${marcas[cerca]} */` : '/* entre tonos */';
                botonesP.forEach((b, n) => b.classList.toggle('on', justo && n === cerca));
                perilla.setAttribute('aria-valuenow', Math.round(xc * 100)); perilla.setAttribute('aria-valuetext', justo ? marcas[cerca] : hex);
                /* La etiqueta dice el producto al llegar (con un rebote) y el hex entre productos */
                const nombresP = ['Empresa', 'Campus', 'Connect', 'Health'];
                globo.querySelector('[data-man-gtxt]').innerHTML = justo ? nombresP[cerca] : `<span class="tp-man-ghex">${hex}</span>`;
                globo.querySelectorAll('.tp-man-giso > *').forEach(g => g.classList.toggle('on', justo && +g.dataset.i === cerca));
                globo.querySelector('.tp-man-giso').style.display = justo && cerca > 0 ? '' : 'none';
                if (justo && cerca !== paradaAntes) { globo.classList.remove('salto'); void globo.offsetWidth; globo.classList.add('salto'); }
                paradaAntes = justo ? cerca : -1;
            };
            const xDesde = e => { const R = pista.getBoundingClientRect(); return (e.clientX - R.left) / R.width; };
            const imantar = x => { const c = Math.round(fijar(x) * 3) / 3; return Math.abs(fijar(x) - c) < 0.05 ? c : fijar(x); };
            let arrastrando = false;
            perilla.addEventListener('pointerdown', e => { arrastrando = true; elegido = true; perilla.setPointerCapture(e.pointerId); ponerX(xActual, 'arrastra'); });
            perilla.addEventListener('pointermove', e => { if (arrastrando) ponerX(xDesde(e), 'arrastra'); });
            const soltar = e => { if (!arrastrando) return; arrastrando = false; ponerX(imantar(xDesde(e))); };
            perilla.addEventListener('pointerup', soltar); perilla.addEventListener('pointercancel', soltar);
            pista.addEventListener('click', e => { elegido = true; ponerX(imantar(xDesde(e))); });
            pista.addEventListener('pointermove', e => { const x = fijar(xDesde(e)), hex = colorEn(x); fantasma.style.setProperty('--gx', x); fantasma.style.setProperty('--gc', hex); fantasma.textContent = hex; fantasma.classList.add('ver'); });
            pista.addEventListener('pointerleave', () => fantasma.classList.remove('ver'));
            botonesP.forEach(b => b.addEventListener('click', () => { elegido = true; ponerX(+b.dataset.x); }));
            perilla.addEventListener('keydown', e => {
                const pasos = { ArrowRight: 0.02, ArrowUp: 0.02, ArrowLeft: -0.02, ArrowDown: -0.02 };
                let x = null;
                if (e.key in pasos) x = xActual + pasos[e.key] * (e.shiftKey ? 5 : 1);
                else if (e.key === 'Home') x = 0; else if (e.key === 'End') x = 1;
                else if (e.key === 'PageUp') x = Math.min(Math.floor(xActual * 3 + 1.0001), 3) / 3; else if (e.key === 'PageDown') x = Math.max(Math.ceil(xActual * 3 - 1.0001), 0) / 3;
                if (x === null) return; e.preventDefault(); elegido = true; ponerX(fijar(x));
            });
            /* Con el scroll: avanza de Campus a Health y se frena en cada producto. La perilla persigue esa meta
               con un suavizado por cuadro, así el recorrido y el color se sienten continuos aunque el scroll salte */
            let xMeta = 1 / 3, bucle = null;
            const seguir = () => {
                const d = xMeta - xActual;
                if (Math.abs(d) < 0.0006 || elegido || arrastrando) { if (!elegido && !arrastrando) ponerX(xMeta, 'sigue'); bucle = null; return; }
                ponerX(xActual + d * (quieto ? 1 : 0.12), 'sigue'); bucle = requestAnimationFrame(seguir);
            };
            const xPorScroll = t => { const u = fijar((t - 0.56) / 0.4) * 2, n = Math.min(Math.floor(u), 1), f = u - n, s = fijar((f - 0.25) / 0.5); return (1 + n + s * s * (3 - 2 * s)) / 3; };
            pieza.querySelectorAll('[data-k]').forEach(x => {
                x.addEventListener('pointerenter', () => pieza.querySelectorAll(`[data-k="${x.dataset.k}"]`).forEach(y => y.classList.add('foco')));
                x.addEventListener('pointerleave', () => pieza.querySelectorAll('.foco').forEach(y => y.classList.remove('foco')));
            });
            el.querySelectorAll('[data-man-ir]').forEach(b => b.addEventListener('click', () => {
                const top = el.getBoundingClientRect().top + window.scrollY, alto = el.offsetHeight - 2.5 * vh;
                window.scrollTo({ top: top + ((+b.dataset.manIr + 0.8) / N) * alto, behavior: quieto ? 'auto' : 'smooth' });
            }));
            /* El manual termina 1,5 pantallas antes del final de su pista: ese tramo lo cubre la portada del capítulo 03 */
            return pista => {
                const p = fijar(pista * (el.offsetHeight - vh) / (el.offsetHeight - 2.5 * vh));
                const i = Math.min(Math.floor(p * N), N - 1), t = fijar(p * N - i);
                el.querySelectorAll('[data-man-paso], [data-man-ir]').forEach(x => x.classList.toggle('on', +(x.dataset.manPaso ?? x.dataset.manIr) === i));
                el.querySelector('[data-man-nombre]').textContent = nombres[i]; el.querySelector('[data-man-ruta]').textContent = rutas[i];
                el.querySelectorAll('.tp-man-prev').forEach(x => x.style.setProperty('--t', +x.dataset.manPaso === i ? t : (+x.dataset.manPaso < i ? 1 : 0)));
                /* Tipeo en el primer 55 % del tramo; las líneas de bloques anteriores quedan escritas y atenuadas */
                const bloque = lineas.filter(l => +l.dataset.s === i), d = 0.55 / bloque.length;
                let actual = null;
                lineas.forEach((l, n) => {
                    const s = +l.dataset.s, k = bloque.indexOf(l), v = s < i ? 1 : s > i ? 0 : fijar((t - k * d) / d);
                    l.style.setProperty('--l', v.toFixed(3)); l.classList.toggle('activo', s === i);
                    const escribiendo = s === i && v > 0 && v < 1; l.classList.toggle('cursor', escribiendo); if (escribiendo) actual = l;
                    barritas[n].classList.toggle('on', s === i); barritas[n].classList.toggle('ya', s < i);
                    if (!l.dataset.k) return;
                    const dest = pieza.querySelector(`.tp-man-prev [data-k="${l.dataset.k}"]`), lista = v >= 1 && s <= i;
                    if (dest) { dest.classList.toggle('ya', lista); if (lista && !compiladas.has(l.dataset.k) && s === i) { dest.classList.remove('pulso'); void dest.offsetWidth; dest.classList.add('pulso'); } }
                    if (lista) compiladas.add(l.dataset.k); else compiladas.delete(l.dataset.k);
                });
                lineas.forEach(l => l.classList.toggle('actual', l === actual));
                /* Al compilar: la vista pasa a "en vivo", la pestaña pierde el punto de cambios y el atajo se presiona */
                const listo = t > 0.56;
                vivo.classList.toggle('ok', listo); vivo.textContent = listo ? 'en vivo' : 'escribiendo';
                if (pest.classList.contains('sucio') && listo) { kbd.classList.remove('pulsa'); void kbd.offsetWidth; kbd.classList.add('pulsa'); }
                pest.classList.toggle('sucio', !listo);
                const tachar = i > 0 || listo; codigo.querySelector('[data-man-mal]').classList.toggle('tachado', tachar); ajena.classList.toggle('fuera', tachar);
                if (i !== pasoAntes) { codigo.style.translate = `0 ${-Math.max(bloque[0].offsetTop - 10, 0)}px`; pasoAntes = i; if (i !== 3) elegido = false; }
                /* ADN: los cinco tests pasan en orden; la placa muestra su prueba y el isotipo corre */
                const ok = i > 2 ? 5 : i < 2 ? 0 : Math.min(Math.floor(fijar((t - 0.56) / 0.36) * 5.99), 5);
                runner.querySelectorAll('li').forEach((li, k) => li.classList.toggle('ok', k < ok));
                runner.style.setProperty('--pasa', ok);
                el.querySelector('[data-man-ok]').textContent = `${ok} / 5`; el.querySelector('[data-man-ms]').textContent = `${[0, 12, 20, 34, 43, 54][ok]} ms`;
                placa.querySelectorAll('[data-pr]').forEach(x => x.classList.toggle('on', +x.dataset.pr < ok));
                placa.classList.toggle('corre', ok >= 3 && !quieto);
                if (!elegido && !arrastrando) { xMeta = i < 3 ? 1 / 3 : xPorScroll(t); if (!bucle && Math.abs(xMeta - xActual) > 0.0006) bucle = requestAnimationFrame(seguir); }
            };
        },
        /* El sitio: baja por tapin.cl y se detiene en cada decisión; el foco se dibuja sobre la parte que
           explica. Las cajas están en píxeles del sitio a 1440 de ancho */
        sitio: el => {
            const ANCHO = 1440, ALTO = 5140, VIAJE = 0.4, FINAL = 1.2;
            const pant = el.querySelector('.tp-sitio-pantalla'), lienzo = el.querySelector('.tp-sitio-lienzo');
            const caja = el.querySelector('.tp-sitio-caja'), cajaTxt = caja.querySelector('span');
            const items = [...el.querySelectorAll('[data-parada]')];
            const paradas = items.map(li => { const [x, y, w, h, rad] = li.dataset.caja.split(',').map(Number); return { li, x, y, w, h, rad, nota: li.dataset.nota }; });
            const pins = [...el.querySelectorAll('[data-pin]')], segs = [...el.querySelectorAll('.tp-sn-avance i')];
            const contador = el.querySelector('[data-sitio-n]');
            const U = paradas.length + FINAL;
            let e = 1, vis = 0, actual = -2;
            const medir = () => {
                e = pant.clientWidth / ANCHO; vis = pant.clientHeight / e;
                pant.style.setProperty('--e', e.toFixed(4));
                /* Cada parada deja su marco centrado en la pantalla del navegador */
                paradas.forEach(d => { d.top = fijar(d.y + d.h / 2 - vis / 2, 0, ALTO - vis); });
            };
            medir();
            window.addEventListener('resize', medir);
            /* Clic en el índice: lleva el scroll al momento en que esa decisión está quieta */
            /* El primer tramo de la pista (una pantalla) es el vuelo desde la portada; el recorrido usa el resto */
            const vuelo = () => vh / (el.offsetHeight - vh);
            const irA = u => { const r = el.getBoundingClientRect(), M = vuelo(); window.scrollTo({ top: window.scrollY + r.top + (M + (u / U) * (1 - M)) * (r.height - vh), behavior: quieto ? 'auto' : 'smooth' }); };
            const quieta = k => (k === 0 ? 0.5 : k + VIAJE + 0.3);
            items.forEach((li, i) => li.querySelector('button').addEventListener('click', () => irA(quieta(i))));
            /* Los marcadores que quedan en el sitio también llevan a su decisión */
            pins.forEach((pn, k) => pn.addEventListener('click', () => irA(quieta(k))));
            /* --- Recorrido suavizado: el sitio y el marco persiguen su posición con un amortiguado por cuadro, así el
               movimiento es continuo aunque la rueda del mouse avance a saltos --- */
            let meta = null, ahora = null, bucle = null;
            const pintarSitio = () => {
                let llego = true;
                for (const c in meta) { const dd = meta[c] - ahora[c]; if (Math.abs(dd) > 0.4) llego = false; ahora[c] += dd * (quieto ? 1 : 0.16); }
                if (llego) Object.assign(ahora, meta);
                lienzo.style.transform = `translate3d(0, ${(-ahora.y * e).toFixed(1)}px, 0)`;
                caja.style.setProperty('--x', (ahora.x * e).toFixed(1) + 'px'); caja.style.setProperty('--y', ((ahora.cy - ahora.y) * e).toFixed(1) + 'px');
                caja.style.setProperty('--w', (ahora.w * e).toFixed(1) + 'px'); caja.style.setProperty('--h', (ahora.h * e).toFixed(1) + 'px');
                caja.style.setProperty('--r', (ahora.rad * e).toFixed(1) + 'px');
                caja.classList.toggle('abajo', (ahora.cy - ahora.y) * e < 18);
                bucle = llego ? null : requestAnimationFrame(pintarSitio);
            };
            const llevar = (obj, directo) => { meta = obj; if (!ahora || directo) ahora = { ...obj }; if (!bucle) bucle = requestAnimationFrame(pintarSitio); };
            /* --- Imán: si el scroll se detiene a mitad de un viaje, termina de llegar a la parada en la dirección en que
               se venía bajando o subiendo. En las paradas no hace nada --- */
            let espera = null, antesPista = 0, dir = 1;
            const imantar = pista => {
                const M = vuelo(); if (pista <= M || pista >= 1) return;
                const u = ((pista - M) / (1 - M)) * U, i = Math.floor(u), t = u - i;
                if (i < 1 || i >= paradas.length || t >= VIAJE) return;
                irA(dir > 0 ? i + VIAJE + 0.05 : quieta(i - 1));
            };
            /* --- Vuelo: el navegador parte donde está la ventana de la portada y viaja a su lugar --- */
            const nav = el.querySelector('.tp-sitio-nav'), fijo = el.querySelector('.tp-fijo'), cap3 = document.getElementById('cap-3');
            const ventana3 = cap3 && cap3.querySelector('.tp-c3-ventana');
            let destino = null, volaba = false;
            const medirDestino = () => {
                nav.classList.remove('volando'); el.classList.remove('volando');
                const F = fijo.getBoundingClientRect(), N = nav.getBoundingClientRect();
                destino = { x: N.left - F.left, y: N.top - F.top, w: N.width, h: N.height };
                el.style.setProperty('--bh', N.height + 'px');
            };
            window.addEventListener('resize', () => { destino = null; });
            const volar = q => {
                if (!destino) medirDestino();
                const A = ventana3.getBoundingClientRect(), F = fijo.getBoundingClientRect(), m = curva(q);
                const x = A.left - F.left + (destino.x - (A.left - F.left)) * m, y = A.top - F.top + (destino.y - (A.top - F.top)) * m;
                const w = A.width + (destino.w - A.width) * m, h = A.height + (destino.h - A.height) * m;
                nav.classList.add('volando'); el.classList.add('volando');
                nav.style.setProperty('--nx', x.toFixed(1) + 'px'); nav.style.setProperty('--ny', y.toFixed(1) + 'px');
                nav.style.setProperty('--nw', w.toFixed(1) + 'px'); nav.style.setProperty('--nh', h.toFixed(1) + 'px');
                nav.style.setProperty('--lz', fijar((q - 0.18) / 0.5).toFixed(3));
                /* La luz se abre desde el centro del navegador; el índice entra en cascada al final */
                const k = curva(fijar((q - 0.08) / 0.7));
                el.style.setProperty('--lx', ((x + w / 2) / F.width * 100).toFixed(2) + '%'); el.style.setProperty('--ly', ((y + h / 2) / F.height * 100).toFixed(2) + '%');
                el.style.setProperty('--lr', (k * 150).toFixed(1) + '%'); el.style.setProperty('--iv', fijar((q - 0.5) / 0.45).toFixed(3));
                cap3.style.setProperty('--cede', curva(fijar(q / 0.4)).toFixed(3));
            };
            const aterrizar = () => {
                nav.classList.remove('volando'); el.classList.remove('volando');
                ['--nx', '--ny', '--nw', '--nh', '--lz'].forEach(k => nav.style.removeProperty(k));
                ['--lr', '--iv'].forEach(k => el.style.removeProperty(k));
                cap3.style.setProperty('--cede', 1);
            };
            /* --- Hoja: en la última pantalla la sección sube y deja ver la decisión 11, que espera quieta debajo --- */
            const vivo = el.nextElementSibling && el.nextElementSibling.classList.contains('tp-vivo') ? el.nextElementSibling : null;
            const vivoIn = vivo && vivo.querySelector(':scope > .tp-grilla');
            const hoja = () => {
                if (!vivo) return;
                const T = vivo.getBoundingClientRect().top, m = fijar(-T / vh);
                el.style.setProperty('--hoja', m.toFixed(4));
                /* La 11 ya está quieta por sticky; aquí solo se acerca y se aclara */
                if (m < 1) { vivoIn.style.transform = quieto ? '' : `scale(${(0.94 + 0.06 * curva(m)).toFixed(4)})`; vivo.style.setProperty('--velo', ((1 - m) * 0.32).toFixed(3)); }
                else { vivoIn.style.transform = ''; vivo.style.setProperty('--velo', 0); }
            };
            return pista => {
                hoja();
                /* Mientras entra por abajo no se ve; al fijarse, la portada le cede su ventana */
                el.classList.toggle('antes', pista <= 0);
                if (cap3) cap3.classList.toggle('cedida', pista > 0);
                const M = vuelo();
                if (pista < M && ventana3) {
                    volar(fijar(pista / M)); volaba = true;
                    if (actual !== -2) { actual = -2; el.dataset.parada = -1; caja.classList.remove('on'); items.forEach(li => li.classList.remove('actual', 'ya')); pins.forEach(x => x.classList.remove('ya')); segs.forEach(x => x.classList.remove('ya', 'on')); lienzo.style.transform = 'translate3d(0, 0, 0)'; ahora = null; }
                    return;
                }
                const recien = volaba;
                if (volaba) { aterrizar(); medir(); volaba = false; }
                dir = pista >= antesPista ? 1 : -1; antesPista = pista;
                clearTimeout(espera); if (!quieto) espera = setTimeout(() => imantar(pista), 220);
                const p = fijar((pista - M) / (1 - M));
                const u = p * U, i = Math.floor(u), t = u - i;
                let y, act = -1;
                /* Después de la última decisión el sitio queda quieto: no hay más que recorrer */
                if (i >= paradas.length) y = paradas[paradas.length - 1].top;
                else if (i === 0 || t >= VIAJE) { y = paradas[i].top; act = i; }
                else y = paradas[i - 1].top + (paradas[i].top - paradas[i - 1].top) * curva(t / VIAJE);
                el.dataset.parada = act;
                /* El marco nunca desaparece: en el viaje pasa de un elemento al siguiente; la nota cambia a mitad de camino */
                const ult = paradas.length - 1, m = i >= 1 && i <= ult && t < VIAJE ? curva(t / VIAJE) : 1;
                const n = act >= 0 ? act : i > ult ? ult : (m > 0.5 ? i : i - 1);
                const A = act >= 0 ? paradas[act] : i > ult ? paradas[ult] : paradas[i - 1], B = act >= 0 || i > ult ? A : paradas[i];
                const d = ['x', 'y', 'w', 'h', 'rad'].reduce((o, k) => (o[k] = A[k] + (B[k] - A[k]) * (act >= 0 || i > ult ? 1 : m), o), {});
                if (n !== actual) {
                    actual = n;
                    items.forEach((li, k) => { li.classList.toggle('actual', k === n); li.classList.toggle('ya', k < n); });
                    pins.forEach((pn, k) => pn.classList.toggle('ya', k < n));
                    segs.forEach((sg, k) => { sg.classList.toggle('ya', k < n); sg.classList.toggle('on', k === n); });
                    cajaTxt.textContent = String(n + 6).padStart(2, '0'); contador.textContent = `${String(n + 6).padStart(2, '0')} / 10`;
                }
                caja.classList.add('on');
                llevar({ y, x: d.x, cy: d.y, w: d.w, h: d.h, rad: d.rad }, recien);
            };
        }
    };

    /* Los títulos de paso se arman palabra por palabra para que suban en cascada */
    document.querySelectorAll('.tp-rotulo-t > span').forEach(t => { t.innerHTML = t.textContent.split(' ').map((w, i) => `<i style="--w:${i}">${w}</i>`).join(' '); });

    /* --- 2. MOTOR DE ESCENAS Y PARALLAX --- */
    const escenas = [...document.querySelectorAll('[data-escena]')].map(el => ({
        el, p: -1,
        rangos: [...el.querySelectorAll('[data-rango]')].map(r => { const [a, b] = r.dataset.rango.split('-').map(Number); return { r, a, b }; }),
        pasos: +el.dataset.pasos || 0, hasta: +el.dataset.pasosHasta || 1,
        marcas: [...el.querySelectorAll('[data-paso]')],
        propia: propias[el.dataset.escena] ? propias[el.dataset.escena](el) : null
    }));
    const pars = [...document.querySelectorAll('[data-par]')];
    const pintar = () => {
        escenas.forEach(s => {
            const r = s.el.getBoundingClientRect();
            if (r.bottom < -vh * 0.25 || r.top > vh * 1.25) return;
            const p = fijar(-r.top / (r.height - vh));
            if (Math.abs(p - s.p) < 0.0004) return;
            s.p = p;
            s.el.style.setProperty('--p', p.toFixed(4));
            s.rangos.forEach(x => x.r.classList.toggle('on', p >= x.a && p < x.b));
            if (s.pasos) {
                const k = Math.min(Math.floor(fijar(p / s.hasta) * s.pasos), s.pasos - 1);
                s.marcas.forEach(m => { m.classList.toggle('on', +m.dataset.paso === k); m.classList.toggle('ya', +m.dataset.paso < k); });
            }
            if (s.propia) s.propia(p);
        });
        /* Parallax: --v va de -1 (entra por abajo) a 1 (sale por arriba) */
        pars.forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.bottom < 0 || r.top > vh) return;
            el.style.setProperty('--v', fijar(((vh - r.top) / (vh + r.height)) * 2 - 1, -1, 1).toFixed(3));
        });
    };
    let pendiente = false;
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; pintar(); luces(); barra(); }); } };
    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', () => { vh = window.innerHeight; escenas.forEach(s => (s.p = -1)); pedir(); });

    /* --- 3. BARRA QUE SE ESCONDE AL BAJAR Y TOMA EL COLOR DEL MÓDULO DE ABAJO --- */
    /* Sin mezcla por diferencia (sobre morado se volvía verde): tinta sobre lo claro, blanco sobre lo demás.
       En el hero, cuando el navegador ya llenó la pantalla, lo de abajo es el sitio claro */
    /* La caja de luz es fija y cubre la pantalla: no cuenta como módulo */
    const nav = document.querySelector('[data-barra]'), modulos = [...document.querySelector('main').children].filter(el => !el.matches('.tp-caja'));
    let ultimoY = window.scrollY, subida = 0;
    /* Letras de los links separadas, para que rueden con el hover */
    nav.querySelectorAll('ul a').forEach(a => { const t = a.textContent.trim(); a.setAttribute('aria-label', t); a.innerHTML = [...t].map((c, i) => `<span class="c" aria-hidden="true" style="--i:${i}">${c}</span>`).join(''); });
    const barra = () => {
        const y = window.scrollY, dy = y - ultimoY;
        ultimoY = y;
        const m = modulos.find(el => { const r = el.getBoundingClientRect(); return r.top <= 32 && r.bottom > 32; });
        const hero = escenas[0];
        const resumen = escenas.find(x => x.el.dataset.escena === 'resumen');
        nav.classList.toggle('sobre-claro', !!m && ((m.classList.contains('tp-claro') && !(m === resumen.el && resumen.p > 0.86)) || (m === hero.el && hero.p > 0.62) || (m.id === 'cap-2' && parseFloat(m.style.getPropertyValue('--p4')) > 0.3)));
        /* Se esconde al bajar; vuelve solo con una subida clara (90 px seguidos) o cerca del inicio */
        if (dy > 0) { subida = 0; if (y > 120) nav.classList.add('oculta'); }
        else if (dy < 0) { subida -= dy; if (subida > 90 || y < 120) nav.classList.remove('oculta'); }
        nav.classList.toggle('flota', y > 120);
    };
    /* La línea de tiempo del resumen lleva a cada capítulo con un desplazamiento suave */
    document.querySelectorAll('.tp-etapa').forEach(a => a.addEventListener('click', e => {
        const destino = document.querySelector(a.getAttribute('href'));
        if (!destino) return;
        e.preventDefault();
        const extra = destino.matches('.tp-cap-1') ? window.innerHeight : 0;
        window.scrollTo({ top: destino.getBoundingClientRect().top + window.scrollY + extra, behavior: quieto ? 'auto' : 'smooth' });
    }));

    /* --- 4. TEXTO QUE SE ENCIENDE PALABRA POR PALABRA --- */
    const textos = [...document.querySelectorAll('[data-luz]')].map(el => {
        const partir = nodo => [...nodo.childNodes].forEach(n => {
            if (n.nodeType === 3) {
                const f = document.createDocumentFragment();
                n.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.appendChild(document.createTextNode(w)); else { const s = document.createElement('span'); s.className = 'tp-pal'; s.textContent = w; f.appendChild(s); } });
                n.replaceWith(f);
            } else partir(n);
        });
        partir(el);
        return { el, pals: [...el.querySelectorAll('.tp-pal')], n: -1 };
    });
    const luces = () => textos.forEach(t => {
        const r = t.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const l = quieto ? 1 : fijar((vh * 0.9 - r.top) / (r.height + vh * 0.25));
        const n = Math.round(l * t.pals.length);
        if (n === t.n) return;
        t.n = n; t.pals.forEach((w, i) => w.classList.toggle('on', i < n));
    });

    /* --- 5. APARICIONES Y CIFRAS QUE CUENTAN --- */
    const formato = n => n.toLocaleString('es-CL');
    const contar = el => {
        const fin = +el.dataset.cuenta, pre = el.dataset.pre ? `<small>${el.dataset.pre}</small>` : '';
        if (quieto) { el.innerHTML = pre + formato(fin); return; }
        const t0 = performance.now(), dur = fin > 100 ? 1600 : 900;
        const paso = ahora => { const t = fijar((ahora - t0) / dur); el.innerHTML = pre + formato(Math.round(fin * (1 - Math.pow(1 - t, 4)))); if (t < 1) requestAnimationFrame(paso); };
        requestAnimationFrame(paso);
    };
    const io = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('visto');
        e.target.querySelectorAll('[data-cuenta]').forEach(contar);
        if (e.target.matches('[data-cuenta]')) contar(e.target);
        io.unobserve(e.target);
    }), { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-revela], .tp-cifras, .tp-datos, .tp-cap-txt').forEach(el => io.observe(el));
    /* Las cifras de la decisión 02 vuelven a contar al pasar el mouse */
    if (window.matchMedia('(hover: hover)').matches) document.querySelectorAll('.tp-datos li').forEach(li => li.addEventListener('mouseenter', () => {
        const b = li.querySelector('[data-cuenta]'), ahora = performance.now();
        if (b && ahora - (b.ultimo || 0) > 1000) { b.ultimo = ahora; contar(b); }
    }));

    /* --- 6. MOCKUPS EN VIVO --- */
    /* Se montan cerca de la pantalla y solo animan mientras se ven; el PNG queda de póster hasta que cargan */
    /* Además avisa al contenedor (mockup-start reinicia el loop desde cero), para que la página pueda seguir su reloj */
    const msj = (f, tipo) => { try { f.contentWindow.postMessage({ type: tipo }, '*'); } catch (err) { /* sin acceso */ } f.parentElement.dispatchEvent(new Event(tipo)); };
    const escalar = m => { const f = m.querySelector('iframe'); if (f) f.style.setProperty('--escala', (m.clientWidth / 900).toFixed(4)); };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(es => es.forEach(e => escalar(e.target))) : null;
    const cerca = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting || e.target.querySelector('iframe')) return;
        const m = e.target, f = document.createElement('iframe');
        f.title = 'Mockup animado de tapin.cl'; f.setAttribute('tabindex', '-1'); f.setAttribute('aria-hidden', 'true');
        f.onload = () => {
            m.classList.add('listo'); if (m._ve && !quieto) msj(f, 'mockup-start'); };
        f.src = m.dataset.mk + '?frameless';
        m.appendChild(f); escalar(m); if (ro) ro.observe(m);
        cerca.unobserve(m);
    }), { rootMargin: '120% 0px' });
    const visible = new IntersectionObserver(es => es.forEach(e => {
        const m = e.target, f = m.querySelector('iframe');
        m._ve = e.isIntersecting;
        if (f && m.classList.contains('listo') && !quieto) msj(f, e.isIntersecting ? 'mockup-start' : 'mockup-stop');
    }), { threshold: 0.25 });
    document.querySelectorAll('[data-mk]').forEach(m => { cerca.observe(m); visible.observe(m); });

    /* --- 7. CEREBRO DE CONNECT: EL SVG OFICIAL, PARA DIBUJARLO --- */
    /* Cada trazado guarda su largo (--len) para que el contorno se dibuje con el scroll */
    const cer = document.querySelector('[data-cerebro]');
    if (cer) fetch('media/tp-cerebro.svg').then(r => r.text()).then(svg => {
        cer.innerHTML = svg.replace(/<\?xml[^>]*>/, '').replace(/<style>[\s\S]*?<\/style>/, '');
        const el = cer.querySelector('svg');
        el.removeAttribute('width'); el.removeAttribute('height'); el.setAttribute('aria-hidden', 'true');
        el.querySelectorAll('path').forEach(pth => { pth.removeAttribute('class'); pth.style.setProperty('--len', Math.ceil(pth.getTotalLength())); });
    });

    /* --- 8. CITAS QUE ROTAN --- */
    document.querySelectorAll('[data-citas]').forEach(c => {
        const citas = [...c.querySelectorAll('blockquote')];
        if (citas.length < 2 || quieto) return;
        let k = 0;
        setInterval(() => { citas[k].classList.remove('on'); k = (k + 1) % citas.length; citas[k].classList.add('on'); }, 7000);
    });

    /* --- 9. HERO VIVO CON EL MOUSE --- */
    /* Como el home, pero en clave Tap In: el sitio recostado se inclina hacia el cursor con inercia, la luz del
       fondo lo sigue, las letras del wordmark cercanas suben y el punto de la i hace "tap" al pasar sobre él */
    const heroEl = document.querySelector('.tp-hero');
    requestAnimationFrame(() => heroEl.classList.add('entra'));
    /* El navegador del hero carga tapin.cl de verdad, sin scroll; deja de pintarse cuando el hero sale */
    const pantalla = heroEl.querySelector('[data-sitio]');
    if (pantalla) {
        const sitio = document.createElement('iframe');
        sitio.title = 'tapin.cl'; sitio.setAttribute('tabindex', '-1'); sitio.setAttribute('aria-hidden', 'true'); sitio.setAttribute('scrolling', 'no');
        sitio.onload = () => {
            try {
                const d = sitio.contentDocument, st = d.createElement('style');
                st.textContent = 'html,body{overflow:hidden!important;scrollbar-width:none}html::-webkit-scrollbar{display:none}';
                d.head.appendChild(st);
                /* El sitio pausa las animaciones de las secciones que cree fuera de pantalla; dentro del navegador
                   inclinado su detector se equivoca con el hero, así que el hero queda siempre activo */
                const hero = d.querySelector('section'), soltar = () => { if (hero.classList.contains('is-offscreen')) hero.classList.remove('is-offscreen'); };
                if (hero) { soltar(); new sitio.contentWindow.MutationObserver(soltar).observe(hero, { attributes: true, attributeFilter: ['class'] }); }
            } catch (err) { /* sin acceso */ }
            pantalla.classList.add('listo');
        };
        sitio.src = pantalla.dataset.sitio;
        pantalla.appendChild(sitio);
        new IntersectionObserver(es => es.forEach(e => { sitio.style.visibility = e.isIntersecting ? '' : 'hidden'; })).observe(heroEl);
    }
    const wm = heroEl.querySelector('.tp-wm-vivo');
    wm.querySelectorAll('[data-letra]').forEach((l, i) => l.style.setProperty('--l', i));
    if (!quieto && window.matchMedia('(hover: hover)').matches) {
        const letras = [...wm.querySelectorAll('[data-letra]')];
        let tx = 0, ty = 0, x = 0, y = 0, cx = -9999, cy = -9999, corre = false, centros = [];
        const medir = () => { centros = letras.map(l => { const r = l.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); };
        const ola = () => {
            if (!centros.length) medir();
            letras.forEach((l, i) => { const c = centros[i], d = Math.hypot(cx - c.x, (cy - c.y) * 0.6); l.style.translate = `0 ${(-Math.exp(-(d * d) / (2 * 110 * 110)) * 16).toFixed(2)}px`; });
        };
        const paso = () => {
            x += (tx - x) * 0.07; y += (ty - y) * 0.07;
            heroEl.style.setProperty('--mx', x.toFixed(4)); heroEl.style.setProperty('--my', y.toFixed(4));
            if (Math.abs(tx - x) + Math.abs(ty - y) > 0.0008) requestAnimationFrame(paso); else corre = false;
        };
        const ir = (a, b) => { tx = a; ty = b; if (!corre) { corre = true; requestAnimationFrame(paso); } };
        heroEl.addEventListener('pointermove', e => { const r = heroEl.querySelector('.tp-fijo').getBoundingClientRect(); cx = e.clientX; cy = e.clientY; ir((e.clientX - r.left) / r.width - 0.5, (e.clientY - r.top) / r.height - 0.5); ola(); });
        heroEl.addEventListener('pointerleave', () => { cx = cy = -9999; ir(0, 0); ola(); });
        window.addEventListener('scroll', () => { centros = []; }, { passive: true });
        window.addEventListener('resize', () => { centros = []; });
        wm.addEventListener('pointerenter', () => { if (!wm.classList.contains('tap')) wm.classList.add('tap'); });
        wm.addEventListener('animationend', e => { if (e.target.classList.contains('tp-wm-onda')) wm.classList.remove('tap'); });
    }

    /* --- 10. SIGUIENTE PROYECTO --- */
    const C = window.CASO = {
        nombre: 'Tap In',
        siguiente: { id: 'mend', nombre: 'Mend', numero: '03', disciplinas: ['Investigación', 'Marca', 'Web app', '2026'], bajada: 'Salud articular para Atención Primaria, de la investigación al producto.', tinte: '#0D2024', url: '../works/inicio.html#works' }
    };
    const hueco = document.querySelector('[data-siguiente]');
    if (hueco && window.CASO_SIGUIENTE) {
        hueco.outerHTML = window.CASO_SIGUIENTE(C);
        (window.CASO_INICIOS || []).forEach(f => f(C, { quieto }));
    }

    /* --- 11. GALERÍAS DE LAS ACTIVACIONES --- */
    /* Riel con snap: flechas, contador, un segmento por foto y el pie de la foto en pantalla. Con el mouse se
       arrastra y un clic abre la caja de luz; con el teclado, las flechas */
    const caja = document.querySelector('[data-caja]'), cajaImg = caja.querySelector('[data-caja-img]');
    let fotosCaja = [], marcaCaja = '', enCaja = 0, focoAntes = null, scrollCaja = 0;
    const verEnCaja = i => {
        enCaja = (i + fotosCaja.length) % fotosCaja.length;
        const img = fotosCaja[enCaja].querySelector('img');
        cajaImg.src = img.src; cajaImg.alt = img.alt;
        caja.querySelector('[data-caja-t]').textContent = `${String(enCaja + 1).padStart(2, '0')} / ${String(fotosCaja.length).padStart(2, '0')} · ${fotosCaja[enCaja].dataset.pie}`;
        caja.querySelector('[data-caja-marca]').textContent = `Tap In × ${marcaCaja}`;
    };
    const abrirCaja = (figs, marca, i) => {
        fotosCaja = figs; marcaCaja = marca; focoAntes = document.activeElement; verEnCaja(i);
        scrollCaja = window.scrollY; document.body.style.top = `-${scrollCaja}px`; document.body.style.position = 'fixed'; document.body.style.width = '100%';
        caja.classList.add('on'); caja.querySelector('[data-caja-cerrar]').focus({ preventScroll: true });
    };
    const cerrarCaja = () => {
        if (!caja.classList.contains('on')) return;
        caja.classList.remove('on'); document.body.style.position = ''; document.body.style.top = ''; document.body.style.width = ''; window.scrollTo(0, scrollCaja);
        if (focoAntes) focoAntes.focus({ preventScroll: true });
    };
    caja.querySelector('[data-caja-cerrar]').addEventListener('click', cerrarCaja);
    caja.querySelector('[data-caja-ant]').addEventListener('click', () => verEnCaja(enCaja - 1));
    caja.querySelector('[data-caja-sig]').addEventListener('click', () => verEnCaja(enCaja + 1));
    caja.addEventListener('click', e => { if (e.target === caja) cerrarCaja(); });
    document.addEventListener('keydown', e => {
        if (!caja.classList.contains('on')) return;
        if (e.key === 'Escape') cerrarCaja(); if (e.key === 'ArrowLeft') verEnCaja(enCaja - 1); if (e.key === 'ArrowRight') verEnCaja(enCaja + 1);
    });
    document.querySelectorAll('[data-carrusel]').forEach(car => {
        const pista = car.querySelector('[data-car-pista]'), figs = [...pista.children], n = car.querySelector('[data-car-n]');
        const ant = car.querySelector('[data-car-ant]'), sig = car.querySelector('[data-car-sig]'), segs = [...car.querySelectorAll('.tp-galeria-segs i')], pie = car.querySelector('[data-car-pie]');
        const lugar = f => f.offsetLeft - figs[0].offsetLeft, fin = () => pista.scrollWidth - pista.clientWidth;
        const cerca = () => figs.reduce((m, f, i) => Math.abs(lugar(f) - pista.scrollLeft) < Math.abs(lugar(figs[m]) - pista.scrollLeft) ? i : m, 0);
        let mostrada = 0;
        const marcar = () => {
            const alFinal = pista.scrollLeft >= fin() - 4, i = alFinal ? figs.length - 1 : cerca();
            n.textContent = String(i + 1).padStart(2, '0');
            segs.forEach((s, k) => s.classList.toggle('ya', k <= i));
            if (i !== mostrada) { pie.innerHTML = `<span>${figs[i].dataset.pie}</span>`; mostrada = i; }
            ant.disabled = pista.scrollLeft <= 4; sig.disabled = alFinal;
        };
        const ir = d => { const i = fijar(cerca() + d, 0, figs.length - 1); pista.scrollTo({ left: Math.min(lugar(figs[i]), fin()), behavior: quieto ? 'auto' : 'smooth' }); };
        ant.addEventListener('click', () => ir(-1));
        sig.addEventListener('click', () => ir(1));
        pista.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); ir(e.key === 'ArrowLeft' ? -1 : 1); } });
        let pendiente = false;
        pista.addEventListener('scroll', () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; marcar(); }); } }, { passive: true });
        let x0 = null, s0 = 0, movido = 0;
        pista.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; x0 = e.clientX; s0 = pista.scrollLeft; movido = 0; pista.classList.add('arrastrando'); pista.setPointerCapture(e.pointerId); });
        pista.addEventListener('pointermove', e => { if (x0 !== null) { movido = Math.max(movido, Math.abs(e.clientX - x0)); pista.scrollLeft = s0 - (e.clientX - x0); } });
        const soltar = e => {
            if (x0 === null) return; x0 = null;
            /* Sin arrastre es un clic: abre la foto que estaba bajo el cursor */
            if (movido < 6) { const f = figs.find(x => { const r = x.getBoundingClientRect(); return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }); if (f) abrirCaja(figs, car.dataset.marca, figs.indexOf(f)); }
            ir(0); setTimeout(() => pista.classList.remove('arrastrando'), quieto ? 0 : 450);
        };
        pista.addEventListener('pointerup', soltar);
        pista.addEventListener('pointercancel', () => { x0 = null; pista.classList.remove('arrastrando'); });
        pista.addEventListener('click', e => { if (e.pointerType === 'mouse') return; const f = e.target.closest('figure'); if (f) abrirCaja(figs, car.dataset.marca, figs.indexOf(f)); });
        window.addEventListener('resize', marcar);
        marcar();
    });

    /* --- 12. DECISIÓN 11: EL COMEDOR, EN VIVO --- */
    /* Los pasos del flujo siguen el reloj real del mockup del comedor (18,3 s por vuelta): pago hasta los 4 s,
       validación hasta los 10,9 y aviso de saldo hasta los 17,6; después el mockup se reinicia */
    const v11 = document.querySelector('[data-v11-mk]');
    if (v11) {
        const pasos = [...document.querySelectorAll('[data-v11-flujo] .tp-v11-paso')];
        const TRAMOS = [[0, 4000], [4000, 10900], [10900, 17600]], VUELTA = 18300;
        let t0 = 0, reloj = null;
        const marcar = ahora => {
            const t = (ahora - t0) % VUELTA, vuelve = t >= TRAMOS[2][1];
            pasos.forEach((p, k) => {
                const [a, b] = TRAMOS[k];
                p.classList.toggle('on', t >= a && t < b); p.classList.toggle('ya', t >= b && !vuelve);
                p.style.setProperty('--av', vuelve ? 0 : fijar((t - a) / (b - a)).toFixed(3));
            });
            reloj = requestAnimationFrame(marcar);
        };
        const apagar = () => { cancelAnimationFrame(reloj); reloj = null; pasos.forEach(p => { p.classList.remove('on', 'ya'); p.style.setProperty('--av', 0); }); };
        v11.addEventListener('mockup-start', () => { t0 = performance.now(); if (!reloj) reloj = requestAnimationFrame(marcar); });
        v11.addEventListener('mockup-stop', apagar);
        /* Al volver a la pestaña el mockup arranca de cero: el reloj también */
        document.addEventListener('visibilitychange', () => { if (!document.hidden) t0 = performance.now(); });
        if (quieto) pasos.forEach(p => { p.classList.add('ya'); p.style.setProperty('--av', 1); });

        /* El escenario se inclina hasta 3° hacia el cursor, con inercia, y un brillo sigue al puntero */
        const esc = document.querySelector('[data-v11-tilt]');
        if (esc && !quieto && window.matchMedia('(hover: hover)').matches) {
            let meta = { x: 0, y: 0 }, act = { x: 0, y: 0 }, giro = null;
            const inclinar = () => {
                act.x += (meta.x - act.x) * 0.12; act.y += (meta.y - act.y) * 0.12;
                esc.style.setProperty('--ry', `${(act.x * 3).toFixed(3)}deg`); esc.style.setProperty('--rx', `${(-act.y * 3).toFixed(3)}deg`);
                giro = Math.abs(meta.x - act.x) + Math.abs(meta.y - act.y) > 0.001 ? requestAnimationFrame(inclinar) : null;
            };
            esc.addEventListener('pointermove', e => {
                const r = esc.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
                meta = { x: x * 2 - 1, y: y * 2 - 1 };
                esc.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`); esc.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
                esc.classList.add('cerca'); if (!giro) giro = requestAnimationFrame(inclinar);
            });
            esc.addEventListener('pointerleave', () => { meta = { x: 0, y: 0 }; esc.classList.remove('cerca'); if (!giro) giro = requestAnimationFrame(inclinar); });
        }
    }

    /* --- 13. MURO DE TELÉFONOS --- */
    /* Columnas de teléfonos con distintas partes del sitio en móvil (captura de 390 × 6636). Las columnas se mueven
       solo con CSS (--v del parallax, entre --a y --b); el JS arma el muro, encuadra cada pantalla y, al pasar el
       cursor o tocar un teléfono, lo adelanta y hace que su pantalla recorra el sitio, de ida y vuelta */
    const muro = document.querySelector('[data-muro]');
    if (muro) {
        const M_ANCHO = 390, M_ALTO = 6636, POR_COL = 7;
        const tramos = [[4, -40], [-38, 0], [0, -42], [-36, -2]].slice(0, window.innerWidth >= 1100 ? 4 : 3);
        muro.innerHTML = `<div class="tp-muro-giro">${tramos.map(([a, b], k) => `<div class="tp-muro-col" style="--a:${a}%;--b:${b}%">${Array.from({ length: POR_COL }, (_, i) =>
            `<div class="tp-tel" data-f="${((i * 0.23 + k * 0.41) % 0.97).toFixed(3)}"><div class="tp-tel-pant"><img src="media/tp-movil.jpg" alt="" decoding="async"></div></div>`).join('')}</div>`).join('')}</div>`;
        const tels = [...muro.querySelectorAll('.tp-tel')];
        const encuadrar = tel => {
            const img = tel.querySelector('img'), pant = img.parentElement, e = pant.clientWidth / M_ANCHO, vis = pant.clientHeight / e;
            img.style.transform = `translate3d(0, ${(-tel.f * (M_ALTO - vis) * e).toFixed(1)}px, 0)`;
        };
        tels.forEach(t => { t.f = +t.dataset.f; t.dir = 1; encuadrar(t); });
        window.addEventListener('resize', () => tels.forEach(encuadrar));
        let activo = null, ultimo = 0, recorre = null;
        const recorrer = ahora => {
            if (!activo) { recorre = null; return; }
            const t = activo, dt = Math.min(ahora - ultimo, 50);
            ultimo = ahora;
            t.f += t.dir * dt / 16000;
            if (t.f >= 1 || t.f <= 0) { t.f = fijar(t.f); t.dir *= -1; }
            encuadrar(t);
            recorre = requestAnimationFrame(recorrer);
        };
        const enfocar = tel => {
            if (activo === tel) return;
            if (activo) activo.classList.remove('on');
            activo = tel;
            muro.classList.toggle('foco', !!tel);
            if (!tel) return;
            tel.classList.add('on');
            if (!recorre && !quieto) { ultimo = performance.now(); recorre = requestAnimationFrame(recorrer); }
        };
        if (window.matchMedia('(hover: hover)').matches) tels.forEach(t => { t.addEventListener('pointerenter', () => enfocar(t)); t.addEventListener('pointerleave', () => enfocar(null)); });
        else {
            const pista = document.querySelector('[data-muro-pista]');
            if (pista) pista.textContent = 'Toca una pantalla para recorrerla';
            muro.closest('section').addEventListener('click', e => { const t = e.target.closest('.tp-tel'); enfocar(t && t !== activo ? t : null); });
        }
        /* Fuera de la pantalla se suelta el foco */
        new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) enfocar(null); })).observe(muro);
    }

    pintar(); luces(); barra();
})();
/* =======================================================
   FIN JS · CASO TAP IN EDITORIAL (.tp-)
   ======================================================= */
