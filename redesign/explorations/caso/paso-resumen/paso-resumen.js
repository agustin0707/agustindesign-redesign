/* =======================================================
   INICIO JS · PASO DEL HERO AL RESUMEN (.ps)
   ======================================================= */
/* Va después de la copia de llego.js (que ya tomó sus referencias a la ventana) y antes del motor. Saca la ventana en
   vivo del hero para que quede sobre la hoja que sube, y en cada cuadro la lleva hacia el destino de la tarjeta */
(function () {
    const h = document.querySelector('.lf-h'), res = document.querySelector('.lf-res');
    if (!h || !res) return;
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const sale = t => 1 - Math.pow(1 - t, 3);
    const html = document.documentElement, fijo = h.querySelector('.lf-h-fijo'), vivo = h.querySelector('.lf-h-vivo');
    const comp = res.querySelector('[data-comp]'), hueco = res.querySelector('[data-comp-marco]'), copia = hueco.querySelector('iframe'), est = res.querySelector('[data-comp-est]');
    const SITIO = '../works/sitios/llego/index.html';
    document.body.appendChild(vivo); vivo.classList.add('ps-fuera');

    /* --- 1. LA COPIA DEL DESTINO --- */
    /* Se dibuja al mismo ancho que la ventana (--iw) y se escala al hueco: al relevarse, las dos se ven iguales */
    const medirCopia = () => {
        const iw = parseFloat(vivo.style.getPropertyValue('--iw')) || 1440, e = hueco.clientWidth / iw;
        Object.assign(copia.style, { width: iw + 'px', height: (hueco.clientHeight / e).toFixed(1) + 'px', scale: e.toFixed(4) });
    };
    let cargada = false;

    /* --- 2. EL CUADRO --- */
    /* sube: cuánto subió la hoja (0 cuando su borde entra por abajo, 1 cuando llega arriba). La ventana despega apenas
       entra la hoja (ks, sin arranque lento), vuela a donde va a quedar el hueco cuando la hoja termine de subir (kt) y
       espera ahí: es el hueco el que sube a recibirla. Así no persigue un blanco en movimiento y no tiembla */
    let entregado = false, calza = false;
    const cuadro = () => {
        const H = window.innerHeight, rr = res.getBoundingClientRect(), rh = h.getBoundingClientRect();
        const sube = fijar((H - rr.top) / H), pr = fijar(-rr.top / (rr.height - H)), falta = Math.max(rr.top, 0);
        if (!cargada && -rh.top > (rh.height - H) * 0.3) { cargada = true; medirCopia(); copia.src = SITIO; }
        fijo.style.setProperty('--hund', sube.toFixed(4));
        const ks = sale(fijar(sube / 0.6)), kt = curva(fijar((sube - 0.22) / 0.63));
        const b = { x: parseFloat(vivo.style.left), y: parseFloat(vivo.style.top), w: parseFloat(vivo.style.width), h: parseFloat(vivo.style.height) };
        const d = hueco.getBoundingClientRect(), dy = d.top - falta, s = 1 + (d.width / b.w - 1) * ks;
        const cx = b.x + b.w / 2 + (d.left + d.width / 2 - b.x - b.w / 2) * kt, cy = b.y + b.h / 2 + (dy + d.height / 2 - b.y - b.h / 2) * kt;
        vivo.style.transform = `translate3d(${(cx - b.w * s / 2 - b.x).toFixed(2)}px, ${(cy - b.h * s / 2 - b.y).toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
        /* Altura del vuelo: crece al despegar y baja a 0 en el último tramo de la hoja, cuando el hueco llega a ella.
           Va dividida por la escala para que la sombra y el borde se midan en pixeles de pantalla */
        const alto = fijar(ks * 3) * fijar(falta / (H * 0.16));
        vivo.style.setProperty('--k', ks.toFixed(3)); fijo.style.setProperty('--ks', ks.toFixed(3));
        vivo.style.setProperty('--s', s.toFixed(4));
        vivo.style.setProperty('--alto', (alto / s).toFixed(3));
        const c = falta < 0.5 && kt > 0.999;
        if (c !== calza) { calza = c; comp.classList.toggle('calza', c); }
        html.classList.toggle('ps-dejo', pr > 0.98 || rr.bottom < H * 0.98);
        /* El hito 06 del resumen (En línea) entrega el destino; el rótulo cambia con un relevo corto */
        const e = pr >= 0.79;
        if (e !== entregado) {
            entregado = e; comp.classList.toggle('entregado', e); est.textContent = e ? 'Entregado · 20 oct' : 'Destino';
            est.classList.remove('cambia'); void est.offsetWidth; est.classList.add('cambia');
        }
    };

    /* --- 3. EL BUCLE, SOLO CON EL PASO A LA VISTA --- */
    /* Corre mientras el hero o el resumen estén en pantalla; fuera de ellos no hay nada que mover */
    const vistos = new Set();
    let corre = false;
    const bucle = () => { if (!vistos.size) { corre = false; return; } cuadro(); requestAnimationFrame(bucle); };
    const io = new IntersectionObserver(entradas => {
        entradas.forEach(en => (en.isIntersecting ? vistos.add(en.target) : vistos.delete(en.target)));
        if (vistos.size && !corre) { corre = true; requestAnimationFrame(bucle); }
        if (!vistos.size) cuadro();
    });
    io.observe(h); io.observe(res);
    window.addEventListener('resize', medirCopia);
    requestAnimationFrame(cuadro);
})();
/* =======================================================
   FIN JS · PASO DEL HERO AL RESUMEN (.ps)
   ======================================================= */
