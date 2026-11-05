/* =======================================================
   INICIO JS · EL PITCH DE LLEGÓ FARMA (.pl)
   ======================================================= */
/* Las dos escenas del capítulo 01 en Lámina para caso-motor.js (que se carga después). Cada una reparte --p (0 a 1) en
   fases con tramo(), con la misma curva firme de las escenas del capítulo 02 */
(function () {
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const tramo = (p, a, b) => curva(fijar((p - a) / (b - a)));
    const fase = (el, nombre, v) => el.style.setProperty(nombre, v.toFixed(4));
    const svg = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); return n; };

    window.CASO_ESCENAS = {
        /* --- 1. DIAGNÓSTICO --- */
        /* Paso 1: entran las filas de lo intocable. Paso 2: las de lo libre, cada una con su decisión. Paso 3: el hallazgo */
        diagnostico: el => {
            const pieza = el.querySelector('.lf-dg');
            return p => {
                fase(pieza, '--a1', tramo(p, 0.02, 0.22));
                fase(pieza, '--a2', tramo(p, 0.36, 0.56));
                fase(pieza, '--a3', tramo(p, 0.7, 0.84));
            };
        },

        /* --- 2. SISTEMA --- */
        /* Una red y no una línea: un centro con ramas, como la molécula y como el reparto desde una bodega. La trama es
           de 20 × 17 puntos; --w ordena la ola diagonal y --k el dibujo de los conectores */
        sistema: el => {
            const pieza = el.querySelector('.lf-red'), lienzo = el.querySelector('[data-red]'), pie = el.querySelector('[data-red-pie]');
            const C = 20, F = 17, S = 52, xy = ([c, f]) => [c * S + S / 2, f * S + S / 2];
            const ruta = [[10, 8], [7, 6], [7, 10], [13, 6], [14, 10], [5, 8], [10, 11]];
            const tramos = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [0, 6]];
            tramos.forEach(([i, j], k) => {
                const [x1, y1] = xy(ruta[i]), [x2, y2] = xy(ruta[j]);
                const l = svg('line', { x1, y1, x2, y2, pathLength: 1 });
                l.style.setProperty('--k', k); lienzo.appendChild(l);
            });
            for (let f = 0; f < F; f++) for (let c = 0; c < C; c++) {
                const [cx, cy] = xy([c, f]), pt = svg('circle', { cx, cy, r: 3 });
                if (ruta.some(q => q[0] === c && q[1] === f)) pt.classList.add('nodo');
                pt.style.setProperty('--w', ((c + f) / (C + F - 2)).toFixed(3)); lienzo.appendChild(pt);
            }
            const nombres = ['Trama', 'Nodo', 'Verticales'];
            let paso = -1;
            return p => {
                fase(pieza, '--r1', tramo(p, 0.02, 0.22));
                fase(pieza, '--r2', tramo(p, 0.36, 0.48));
                fase(pieza, '--r3', tramo(p, 0.42, 0.58));
                fase(pieza, '--r4', tramo(p, 0.54, 0.62));
                fase(pieza, '--r5', tramo(p, 0.72, 0.86));
                const k = Math.min(Math.floor(p * 3), 2);
                if (k !== paso) { paso = k; pie.textContent = nombres[k]; }
            };
        }
    };
})();
/* =======================================================
   FIN JS · EL PITCH DE LLEGÓ FARMA (.pl)
   ======================================================= */
