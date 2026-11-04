/* =======================================================
   INICIO JS · HEROS LLEGÓ FARMA (.hl-)
   ======================================================= */
/* Seis heros en una página. Solo uno está activo: se muestra, repite su entrada y recibe el scroll (--p de 0 a 1), el
   mouse y un cuadro por frame. Cada hero es un módulo { iniciar, medir, p, puntero, cuadro } */
(function () {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const suave = t => 1 - Math.pow(1 - t, 3);
    const svgNodo = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };
    const pad = (n, l = 2) => String(Math.max(0, Math.round(n))).padStart(l, '0');
    const $ = (sel, raiz = document) => raiz.querySelector(sel);

    /* --- 1. LA RED: TRAMA, RUTAS Y PAQUETES EN CANVAS --- */
    const red = (() => {
        const el = $('[data-hero="red"]'), cv = $('canvas', el), ctx = cv.getContext('2d'), iso = $('.hl-red-iso', el);
        let W, H, dpr, cx, cy, S, pts = [], hubs = [], ars = [], adj = [], paq = [], pul = [], t0 = 0, ult = 0, p = 0, sem = 7;
        const m = { x: -1e4, y: -1e4, on: false };
        const azar = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
        const medir = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight;
            cv.width = W * dpr; cv.height = H * dpr;
            const s = Math.round(fijar(W / 52, 22, 32)), ox = (W % s) / 2, oy = (H % s) / 2;
            S = Math.min(H * 0.42, W * 0.27);
            cx = ox + Math.round((W * 0.74 - ox) / s) * s; cy = oy + Math.round((H * 0.47 - oy) / s) * s;
            pts = [];
            for (let y = oy; y <= H; y += s) for (let x = ox; x <= W; x += s) pts.push({ x, y, d: Math.hypot(x - cx, y - cy) });
            /* Los cuatro nodos del isotipo, con las medidas del SVG oficial (centros a 0,375 S y radio 0,125 S) */
            const k = 0.3747 * S, r = 0.1253 * S;
            hubs = [[cx - k, cy], [cx, cy - k], [cx + k, cy], [cx, cy + k]].map(([x, y]) => ({ x, y, r, iso: true }));
            sem = 7; let n = 0;
            while (hubs.length < 38 && n++ < 4000) {
                const q = pts[Math.floor(azar() * pts.length)];
                if (Math.hypot(q.x - cx, q.y - cy) < S * 0.85 || q.y < 130 || q.y > H - 40 || (q.x < W * 0.56 && q.y > H * 0.46)) continue;
                if (hubs.some(h => Math.hypot(h.x - q.x, h.y - q.y) < s * 3.6)) continue;
                hubs.push({ x: q.x, y: q.y, r: 2.6, lleno: azar() > 0.35 });
            }
            /* Cada nodo se une con sus dos vecinos más cercanos; las rutas crecen desde el isotipo hacia afuera */
            const vistos = new Set(); ars = []; adj = hubs.map(() => []);
            hubs.forEach((h, i) => hubs.map((o, j) => ({ j, d: Math.hypot(o.x - h.x, o.y - h.y) }))
                .filter(o => o.j !== i && !(h.iso && hubs[o.j].iso)).sort((a, b) => a.d - b.d).slice(0, 2)
                .forEach(o => {
                    const c = Math.min(i, o.j) + '-' + Math.max(i, o.j); if (vistos.has(c)) return; vistos.add(c);
                    const A = hubs[i], B = hubs[o.j], dA = Math.hypot(A.x - cx, A.y - cy), dB = Math.hypot(B.x - cx, B.y - cy);
                    const [a, b] = dA <= dB ? [i, o.j] : [o.j, i];
                    const e = { a, b, len: o.d, ret: 700 + Math.min(dA, dB) * 0.85 };
                    adj[a].push(ars.length); adj[b].push(ars.length); ars.push(e);
                }));
            hubs.forEach((h, i) => { h.ret = Math.min(...adj[i].map(k => ars[k].ret), 9e9); });
            paq = !ars.length ? [] : Array.from({ length: 16 }, () => { const e = Math.floor(azar() * ars.length); return { e, de: ars[e].a, t: azar(), v: 0.07 + azar() * 0.08 }; });
            pul = [];
            el.style.setProperty('--ix', (cx - S / 2) + 'px'); el.style.setProperty('--iy', (cy - S / 2) + 'px'); el.style.setProperty('--is', S + 'px');
        };
        let reloj;
        return {
            el, medir,
            iniciar() { medir(); t0 = performance.now(); el.classList.remove('forma'); clearTimeout(reloj); reloj = setTimeout(() => el.classList.add('forma'), quieto ? 0 : 2500); },
            p(v) { p = v; },
            puntero(x, y) { if (x == null) { m.on = false; return; } m.x = x; m.y = y; m.on = true; },
            cuadro(ahora) {
                const t = quieto ? 1e6 : ahora - t0, dt = Math.min(ahora - (ult || ahora), 50); ult = ahora;
                const z = 1 + curva(p) * 2.6;
                el.style.setProperty('--z', z.toFixed(4));
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
                ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * cx * (1 - z), dpr * cy * (1 - z));
                const wx = cx + (m.x - cx) / z, wy = cy + (m.y - cy) / z;
                /* Trama: se enciende desde el isotipo; cerca del mouse brilla y se acerca */
                ctx.fillStyle = '#FFFFFF';
                for (const q of pts) {
                    const a = fijar((t - 150 - q.d * 0.55) / 700); if (a <= 0) continue;
                    let al = 0.13 * a, x = q.x, y = q.y;
                    if (m.on) { const dx = wx - x, dy = wy - y, d = Math.hypot(dx, dy); if (d < 170) { const f = 1 - d / 170; al += 0.5 * f * f * a; x += dx * 0.1 * f; y += dy * 0.1 * f; } }
                    ctx.globalAlpha = al; ctx.beginPath(); ctx.arc(x, y, 1.25, 0, 6.29); ctx.fill();
                }
                /* Rutas */
                ctx.strokeStyle = '#70CAC7'; ctx.lineWidth = 1;
                for (const e of ars) {
                    const k = fijar((t - e.ret) / 800); if (k <= 0) continue;
                    const A = hubs[e.a], B = hubs[e.b], c = curva(k);
                    ctx.globalAlpha = 0.32; ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(A.x + (B.x - A.x) * c, A.y + (B.y - A.y) * c); ctx.stroke();
                }
                /* Paquetes que recorren la red; al llegar a un nodo, un pulso */
                if (t > 2300) for (const k of paq) {
                    const e = ars[k.e]; k.t += (dt * k.v) / e.len;
                    if (k.t >= 1) {
                        const hasta = e.a === k.de ? e.b : e.a, h = hubs[hasta];
                        pul.push({ x: h.x, y: h.y, t: ahora, g: h.iso });
                        const op = adj[hasta].filter(i => i !== k.e);
                        k.e = op.length ? op[Math.floor(Math.random() * op.length)] : k.e; k.de = hasta; k.t = 0;
                    }
                    const E = ars[k.e], A = hubs[k.de], B = hubs[E.a === k.de ? E.b : E.a];
                    const x = A.x + (B.x - A.x) * k.t, y = A.y + (B.y - A.y) * k.t, ux = (B.x - A.x) / E.len, uy = (B.y - A.y) / E.len, cola = Math.min(26, E.len * k.t);
                    const g = ctx.createLinearGradient(x - ux * cola, y - uy * cola, x, y); g.addColorStop(0, 'rgba(183,229,226,0)'); g.addColorStop(1, 'rgba(183,229,226,0.9)');
                    ctx.globalAlpha = 1; ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - ux * cola, y - uy * cola); ctx.lineTo(x, y); ctx.stroke();
                    ctx.fillStyle = '#B7E5E2'; ctx.beginPath(); ctx.arc(x, y, 2.3, 0, 6.29); ctx.fill();
                }
                ctx.lineWidth = 1; ctx.strokeStyle = '#70CAC7';
                pul = pul.filter(u => {
                    const k = (ahora - u.t) / 900; if (k >= 1) return false;
                    ctx.globalAlpha = (1 - k) * 0.55; ctx.beginPath(); ctx.arc(u.x, u.y, (u.g ? S * 0.13 : 3) + suave(k) * (u.g ? 22 : 14), 0, 6.29); ctx.stroke(); return true;
                });
                /* Nodos: relleno es hecho, contorno es pendiente; los del isotipo crecen hasta su tamaño real */
                for (const h of hubs) {
                    if (h.iso) {
                        const k = curva(fijar((t - 1300) / 1000)); if (k <= 0) continue;
                        ctx.globalAlpha = 1; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * k, 0, 6.29); ctx.fill(); continue;
                    }
                    const a = fijar((t - h.ret) / 500); if (a <= 0) continue;
                    ctx.globalAlpha = a * (h.lleno ? 0.92 : 0.7);
                    ctx.beginPath(); ctx.arc(h.x, h.y, h.lleno ? 2.8 : 3.2, 0, 6.29);
                    if (h.lleno) { ctx.fillStyle = '#FFFFFF'; ctx.fill(); } else { ctx.strokeStyle = '#FFFFFF'; ctx.stroke(); }
                }
                /* El mouse es un nodo más: se conecta al más cercano */
                if (m.on && t > 2300) {
                    let mejor = null, dm = 260 / z;
                    hubs.forEach(h => { if (h.iso) return; const d = Math.hypot(h.x - wx, h.y - wy); if (d < dm) { dm = d; mejor = h; } });
                    ctx.globalAlpha = 0.8; ctx.strokeStyle = '#70CAC7';
                    if (mejor) { ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(mejor.x, mejor.y); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(mejor.x, mejor.y, 8, 0, 6.29); ctx.stroke(); }
                    ctx.beginPath(); ctx.arc(wx, wy, 9, 0, 6.29); ctx.stroke();
                    ctx.fillStyle = '#70CAC7'; ctx.beginPath(); ctx.arc(wx, wy, 2.5, 0, 6.29); ctx.fill();
                }
                ctx.globalAlpha = 1;
            }
        };
    })();

    /* --- 2. PORTADA: RETÍCULA, MIRA Y EL DEGRADADO QUE CRECE --- */
    const portada = (() => {
        const el = $('[data-hero="portada"]'), fijo = $('.hl-fijo', el), lienzo = $('.hl-port-reticula', el), deg = $('.hl-port-deg', el), tira = $('.hl-port-tira', el);
        const mira = $('.hl-mira', el), tag = $('.hl-mira-tag', el), celda = $('.hl-celda', el);
        let W, H, mg, xs = [], ys = [], r = null, ultCelda = '';
        const relativo = n => { let x = 0, y = 0; for (let e = n; e && e !== fijo; e = e.offsetParent) { x += e.offsetLeft; y += e.offsetTop; } return { x, y, w: n.offsetWidth, h: n.offsetHeight }; };
        const medir = () => {
            W = fijo.clientWidth; H = fijo.clientHeight; mg = $('.hl-port-cab', el).offsetLeft;
            const cw = (W - mg * 2) / 4, c = 8;
            xs = [0, 1, 2, 3, 4].map(i => mg + cw * i); ys = [0.15, 0.64, 0.88].map(f => H * f);
            lienzo.setAttribute('viewBox', `0 0 ${W} ${H}`); lienzo.innerHTML = '';
            const linea = (x1, y1, x2, y2, ret) => { if (Math.abs(x2 - x1) + Math.abs(y2 - y1) < 2) return; const l = svgNodo('line', { x1, y1, x2, y2, pathLength: 1 }); l.style.setProperty('--r', ret); lienzo.appendChild(l); };
            const cortesY = [0, ...ys, H];
            xs.forEach((x, i) => { for (let k = 0; k < cortesY.length - 1; k++) linea(x, cortesY[k] + (k ? c : 0), x, cortesY[k + 1] - (k < cortesY.length - 2 ? c : 0), i * 90 + k * 60); });
            const cortesX = [0, ...xs, W];
            ys.forEach((y, j) => { for (let k = 0; k < cortesX.length - 1; k++) linea(cortesX[k] + (k ? c : 0), y, cortesX[k + 1] - (k < cortesX.length - 2 ? c : 0), y, 380 + j * 120 + k * 50); });
            r = relativo(tira);
        };
        return {
            el, medir,
            iniciar() { medir(); el.classList.remove('mide'); this.p(0); },
            p(v) {
                if (!r) return;
                const e = curva(fijar(v / 0.78));
                deg.style.setProperty('--ct', (r.y * (1 - e)).toFixed(1) + 'px'); deg.style.setProperty('--cb', ((H - r.y - r.h) * (1 - e)).toFixed(1) + 'px');
                deg.style.setProperty('--cl', (r.x * (1 - e)).toFixed(1) + 'px'); deg.style.setProperty('--cr', ((W - r.x - r.w) * (1 - e)).toFixed(1) + 'px');
                deg.style.setProperty('--ex', (e * 0.55).toFixed(3)); deg.style.setProperty('--iso', fijar((v - 0.72) / 0.22).toFixed(3));
            },
            puntero(x, y) {
                if (x == null) { el.classList.remove('mide'); return; }
                el.classList.add('mide');
                mira.style.setProperty('--x', x + 'px'); mira.style.setProperty('--y', y + 'px');
                tag.textContent = `X ${pad(x - mg, 4)} · Y ${pad(y, 4)}`;
                const col = Math.floor((x - xs[0]) / (xs[1] - xs[0])), bordes = [0, ...ys, H], fila = bordes.findIndex((b, i) => i < bordes.length - 1 && y >= b && y < bordes[i + 1]);
                if (col < 0 || col > 3 || fila < 0) { celda.style.opacity = 0; ultCelda = ''; return; }
                celda.style.opacity = '';
                const clave = col + '-' + fila; if (clave === ultCelda) return; ultCelda = clave;
                const top = bordes[fila] + (fila ? 8 : 64), bot = bordes[fila + 1] - 8;
                Object.assign(celda.style, { left: xs[col] + 8 + 'px', top: top + 'px', width: xs[col + 1] - xs[col] - 16 + 'px', height: Math.max(bot - top, 0) + 'px' });
            }
        };
    })();

    /* --- 3. CENITAL: LA FOTO COMO COVER, CON PARALLAX Y ZOOM AL FURGÓN --- */
    const cenital = (() => {
        const el = $('[data-hero="cenital"]'), fijo = $('.hl-fijo', el), foto = $('.hl-cen-foto', el), hora = $('[data-hora]', el), etapa = $('[data-etapa]', el);
        let W, H, bx = 0, by = 0, p = 0, mx = 0, my = 0, ox = 0, oy = 0, reloj, tic;
        const medir = () => {
            W = fijo.clientWidth; H = fijo.clientHeight;
            const rz = 2880 / 1606; let fw = W * 1.04, fh = fw / rz;
            if (fh < H * 1.04) { fh = H * 1.04; fw = fh * rz; }
            /* Encuadre corrido a la izquierda: el furgón (82 % de la foto) nunca queda en el borde */
            bx = Math.max(W - fw, Math.min(0, W * 0.5 - fw * 0.6)); by = (H - fh) / 2;
            foto.style.setProperty('--fw', fw + 'px'); foto.style.setProperty('--fh', fh + 'px');
        };
        const ponerHora = () => { hora.textContent = new Date().toLocaleTimeString('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: false }); };
        return {
            el, medir,
            iniciar() {
                medir(); ponerHora(); clearInterval(tic); tic = setInterval(ponerHora, 15000);
                etapa.classList.remove('actual'); clearTimeout(reloj); reloj = setTimeout(() => etapa.classList.add('actual'), quieto ? 0 : 2900);
            },
            p(v) { p = v; },
            puntero(x, y) { if (x == null) { mx = my = 0; return; } mx = x / W - 0.5; my = y / H - 0.5; },
            cuadro() {
                ox += (mx - ox) * 0.08; oy += (my - oy) * 0.08;
                const z = 1 + curva(fijar(p / 0.9)) * 2.4;
                foto.style.setProperty('--fx', (bx - ox * 18).toFixed(2) + 'px'); foto.style.setProperty('--fy2', (by - oy * 12).toFixed(2) + 'px'); foto.style.setProperty('--fz', z.toFixed(4));
            }
        };
    })();

    /* --- 4. LA ELECCIÓN: LA DECISIÓN Y NODOS QUE QUEDA SOLA AL CENTRO --- */
    const eleccion = (() => {
        const el = $('[data-hero="eleccion"]'), cruces = [...el.querySelectorAll('.hl-ele-cruz')], nodos = $('.hl-ele-nodos', el), anillo = $('.hl-ele-anillo', el);
        let W, dx = 0, reloj;
        const medir = () => {
            W = el.querySelector('.hl-fijo').clientWidth;
            dx = W / 2 - (nodos.offsetLeft + nodos.parentElement.offsetLeft + nodos.offsetWidth / 2);
            const marca = $('.cs-marca', nodos); anillo.style.setProperty('--ay', (marca.offsetTop + marca.offsetHeight / 2) + 'px');
        };
        return {
            el, medir,
            iniciar() { medir(); el.classList.remove('decide'); clearTimeout(reloj); reloj = setTimeout(() => el.classList.add('decide'), quieto ? 0 : 2500); this.p(0); },
            p(v) {
                const e = curva(fijar(v / 0.8));
                cruces.forEach((c, i) => {
                    if (c === nodos) { c.style.setProperty('--tx', (dx * e).toFixed(1) + 'px'); c.style.setProperty('--s', (1 + e * 1.4).toFixed(3)); c.style.setProperty('--e2', e.toFixed(3)); return; }
                    c.style.setProperty('--tx', ((i === 0 ? -1 : 1) * e * W * 0.3).toFixed(1) + 'px');
                    c.style.opacity = v > 0.002 ? (0.24 * (1 - e)).toFixed(3) : '';
                    c.style.setProperty('--e2', e.toFixed(3));
                });
            }
        };
    })();

    /* --- 5. LA CINTA: TRES COLUMNAS DEL SITIO EN UN PLANO QUE SE ENDEREZA --- */
    const cinta = (() => {
        const el = $('[data-hero="cinta"]'), fijo = $('.hl-fijo', el), plano = $('.hl-cin-plano', el), cols = [...el.querySelectorAll('.hl-cin-col')];
        const tomas = ['hero', 's-tecnologia', 's-capacidades', 's-calidad', 's-categorias', 's-contacto', 's-propuesta', 's-experiencia'];
        const orden = [[6, 3, 7, 1, 5, 2], [0, 1, 2, 3, 4, 5], [4, 7, 0, 5, 6, 3]], vel = [0.78, 1, 1.22];
        let W, H, cw, ch, g = 28, ciclo, colH, off = 0, p = 0, mx = 0, my = 0, ox = 0, oy = 0, ult = 0, armado = false;
        const armar = () => {
            if (armado) return; armado = true;
            cols.forEach((c, i) => { for (let k = 0; k < 18; k++) { const im = new Image(); im.src = `../media/lf-cinta-${tomas[orden[i][k % 6]]}.jpg`; im.alt = ''; im.decoding = 'async'; c.appendChild(im); } });
        };
        const medir = () => {
            armar();
            W = fijo.clientWidth; H = fijo.clientHeight; cw = Math.round(W * 0.3); ch = cw * 10 / 16; ciclo = 6 * (ch + g); colH = H * 3;
            plano.style.setProperty('--cw2', cw + 'px'); plano.style.setProperty('--g', g + 'px');
            cols.forEach(c => [...c.children].forEach((im, k) => { im.style.top = k * (ch + g) + 'px'; }));
        };
        return {
            el, medir,
            iniciar() { medir(); },
            p(v) { p = v; },
            puntero(x, y) { if (x == null) { mx = my = 0; return; } mx = x / W - 0.5; my = y / H - 0.5; },
            cuadro(ahora) {
                const dt = Math.min(ahora - (ult || ahora), 50); ult = ahora;
                ox += (mx - ox) * 0.06; oy += (my - oy) * 0.06;
                const e = curva(fijar(p / 0.85));
                el.style.setProperty('--q', e.toFixed(3));
                /* La altura del mouse acelera o frena la cinta; al bajar se detiene */
                if (!quieto) off += dt * 0.045 * (1 + oy * 1.6) * (1 - e);
                cols.forEach((c, i) => {
                    let y = -((off * vel[i]) % ciclo);
                    if (i === 1) { const base = colH / 2 - ch / 2, k = Math.round((base - y) / ciclo) * 6, meta = base - k * (ch + g); y = y + (meta - y) * e; }
                    c.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
                });
                const ancho = cw * 3 + g * 2, esc = 1 + (Math.max(W / cw, H / ch) * 1.02 - 1) * e;
                const tx = W * 0.17 * (1 - e) + ox * 30 * (1 - e), rx = (50 - oy * 6) * (1 - e), rz = (-26 + ox * 6) * (1 - e);
                plano.style.width = ancho + 'px'; plano.style.height = colH + 'px';
                plano.style.transform = `translate(-50%, -50%) translate3d(${tx.toFixed(1)}px, 0, 0) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${esc.toFixed(4)})`;
            }
        };
    })();

    /* --- 6. DIEZ VALORES: BANDAS, DEGRADADO LISO Y LA VENTANA DEL MOUSE --- */
    const valores = (() => {
        const el = $('[data-hero="valores"]'), fijo = $('.hl-fijo', el), bandas = $('.hl-val-bandas', el), liso = $('.hl-val-liso', el), lineas = $('.hl-val-lineas', el), regla = $('.hl-val-regla', el), hex = $('.hl-val-hex', el);
        const tonos = ['104E56', '178181', '1B9C9C', '21B6B6', '49C2BF', '70CAC7', '80E2DF', 'B7E5E2', 'E8E8E8', 'F4F4F4'];
        let W, H, actual = -1;
        bandas.innerHTML = tonos.map((c, k) => `<i style="--c:#${c};--k:${k}"></i>`).join('');
        regla.innerHTML = tonos.map((c, k) => `<span class="${k >= 5 ? 'osc' : ''}" style="--k:${k}">${pad(k + 1)}</span>`).join('');
        const medir = () => {
            W = fijo.clientWidth; H = fijo.clientHeight;
            lineas.setAttribute('viewBox', `0 0 ${W} ${H}`); lineas.innerHTML = '';
            const y = H * 0.72, c = 8, bw = W / 10;
            for (let k = 1; k < 10; k++) {
                const x = k * bw;
                [[0, y - c], [y + c, H]].forEach(([a, b], j) => { const l = svgNodo('line', { x1: x, y1: a, x2: x, y2: b, pathLength: 1, class: k >= 6 ? 'osc' : '' }); l.style.setProperty('--r', k * 50 + j * 120); lineas.appendChild(l); });
            }
            for (let k = 0; k < 10; k++) { const l = svgNodo('line', { x1: k * bw + (k ? c : 0), y1: y, x2: (k + 1) * bw - (k < 9 ? c : 0), y2: y, pathLength: 1, class: k >= 6 ? 'osc' : '' }); l.style.setProperty('--r', 300 + k * 40); lineas.appendChild(l); }
        };
        const abrir = k => {
            if (k === actual) return;
            if (k < 0) { const c = (actual + 0.5) * 10; liso.style.setProperty('--a', c + '%'); liso.style.setProperty('--b', c + '%'); el.classList.remove('mide'); actual = -1; return; }
            actual = k; el.classList.add('mide');
            liso.style.setProperty('--a', k * 10 + '%'); liso.style.setProperty('--b', (k + 1) * 10 + '%');
            hex.textContent = `${pad(k + 1)} · #${tonos[k]}`; hex.style.left = k * 10 + 'vw'; hex.style.color = k >= 5 ? '#104E56' : '#FFFFFF';
        };
        return {
            el, medir,
            iniciar() { medir(); actual = -1; liso.style.setProperty('--a', '0%'); liso.style.setProperty('--b', '0%'); el.classList.remove('mide'); },
            p(v) { el.style.setProperty('--q', curva(fijar(v / 0.78)).toFixed(4)); if (v > 0.05) abrir(-1); },
            puntero(x, y) { if (x == null || !el.classList.contains('entra')) { abrir(-1); return; } abrir(Math.min(Math.floor((x / W) * 10), 9)); }
        };
    })();

    /* --- 7. EL SELECTOR, EL SCROLL Y EL MOUSE --- */
    const modulos = [red, portada, cenital, eleccion, cinta, valores];
    const barra = $('[data-barra]'), dock = $('.hl-dock'), idea = $('[data-idea]', dock), botones = $('.hl-dock-botones', dock), sigue = $('.hl-sigue');
    let activo = null, p = 0, listoEntrada = 0, callar;
    botones.innerHTML = modulos.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="false"><span>${pad(i + 1)}</span>${m.el.dataset.nombre}</button>`).join('');
    const activar = i => {
        const m = modulos[i]; if (!m) return;
        modulos.forEach(o => o.el.classList.remove('activo', 'entra'));
        activo = m; m.el.classList.add('activo');
        window.scrollTo({ top: 0, behavior: 'instant' }); p = 0; m.el.style.setProperty('--p', 0);
        void m.el.offsetWidth; m.el.classList.add('entra'); listoEntrada = performance.now();
        m.iniciar(); if (m.p) m.p(0);
        botones.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
        idea.textContent = m.el.dataset.idea; dock.classList.remove('calla'); clearTimeout(callar); callar = setTimeout(() => dock.classList.add('calla'), 7000);
        barra.classList.toggle('sobre-claro', m.el.dataset.claro === '1');
        barra.classList.toggle('flota', m === valores);
        history.replaceState(null, '', '#' + m.el.dataset.hero);
    };
    botones.addEventListener('click', e => { const b = e.target.closest('button'); if (b) activar(+b.dataset.i); });
    window.addEventListener('keydown', e => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const i = modulos.indexOf(activo);
        if (/^[1-6]$/.test(e.key)) activar(+e.key - 1);
        else if (e.key === 'ArrowRight') activar((i + 1) % 6);
        else if (e.key === 'ArrowLeft') activar((i + 5) % 6);
        else if (e.key === 'r' || e.key === 'R') activar(i);
    });
    const alScroll = () => {
        if (!activo) return;
        const r = activo.el.getBoundingClientRect(), vh = window.innerHeight;
        p = fijar(-r.top / Math.max(r.height - vh, 1));
        activo.el.style.setProperty('--p', p.toFixed(4)); if (activo.p) activo.p(p);
        if (p > 0.04) dock.classList.add('calla');
        const claro = sigue.getBoundingClientRect().top <= 32 || activo.el.dataset.claro === '1' && p < 0.6;
        barra.classList.toggle('sobre-claro', claro);
    };
    window.addEventListener('scroll', alScroll, { passive: true });
    window.addEventListener('pointermove', e => { if (activo && activo.puntero && !e.target.closest('.hl-dock')) activo.puntero(e.clientX, e.clientY); else if (activo && activo.puntero) activo.puntero(null); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { if (activo && activo.puntero) activo.puntero(null); });
    window.addEventListener('resize', () => { if (activo) { activo.medir(); alScroll(); } });
    const bucle = ahora => { if (activo && activo.cuadro) activo.cuadro(ahora); requestAnimationFrame(bucle); };
    requestAnimationFrame(bucle);
    const inicial = Math.max(modulos.findIndex(m => '#' + m.el.dataset.hero === location.hash), 0);
    history.scrollRestoration = 'manual';
    window.addEventListener('hashchange', () => { const i = modulos.findIndex(m => '#' + m.el.dataset.hero === location.hash); if (i >= 0 && modulos[i] !== activo) activar(i); });
    (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 900))]) : Promise.resolve()).then(() => activar(inicial));
})();
/* =======================================================
   FIN JS · HEROS LLEGÓ FARMA (.hl-)
   ======================================================= */
