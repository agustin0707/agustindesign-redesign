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
    /* sube: cuánto subió la hoja (0 cuando su borde entra por abajo, 1 cuando llega arriba). La ventana se achica en
       su lugar y entra al hueco en la segunda mitad, ya con el hueco a la vista; con la hoja arriba queda calzada.
       Cuando el resumen se suelta, la copia toma su lugar */
    let entregado = false;
    const cuadro = () => {
        const H = window.innerHeight, rr = res.getBoundingClientRect(), rh = h.getBoundingClientRect();
        const sube = fijar((H - rr.top) / H), pr = fijar(-rr.top / (rr.height - H));
        if (!cargada && -rh.top > (rh.height - H) * 0.3) { cargada = true; medirCopia(); copia.src = SITIO; }
        fijo.style.setProperty('--hund', sube.toFixed(4));
        /* Dos fases: primero se achica sobre su centro (ks), después viaja al hueco (kt), así no tapa el resumen que
           entra. El centro viaja en línea recta y el tamaño se calcula sobre ese centro */
        const ks = curva(fijar((sube - 0.04) / 0.56)), kt = curva(fijar((sube - 0.3) / 0.7)), k = Math.min(ks, kt);
        const b = { x: parseFloat(vivo.style.left), y: parseFloat(vivo.style.top), w: parseFloat(vivo.style.width), h: parseFloat(vivo.style.height) };
        const d = hueco.getBoundingClientRect(), s = 1 + (d.width / b.w - 1) * ks;
        const cx = b.x + b.w / 2 + (d.left + d.width / 2 - b.x - b.w / 2) * kt, cy = b.y + b.h / 2 + (d.top + d.height / 2 - b.y - b.h / 2) * kt;
        vivo.style.transform = `translate3d(${(cx - b.w * s / 2 - b.x).toFixed(2)}px, ${(cy - b.h * s / 2 - b.y).toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
        vivo.style.setProperty('--k', k.toFixed(3));
        html.classList.toggle('ps-dejo', pr > 0.98 || rr.bottom < H * 0.98);
        /* El hito 06 del resumen (En línea) entrega el destino */
        const e = pr >= 0.79;
        if (e !== entregado) { entregado = e; comp.classList.toggle('entregado', e); est.textContent = e ? 'Entregado · 20 oct' : 'Destino'; }
        requestAnimationFrame(cuadro);
    };
    window.addEventListener('resize', medirCopia);
    requestAnimationFrame(cuadro);
})();
/* =======================================================
   FIN JS · PASO DEL HERO AL RESUMEN (.ps)
   ======================================================= */
