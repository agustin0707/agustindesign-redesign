/* =======================================================
   INICIO JS · LA MARCA DE LLEGÓ FARMA (.ml)
   ======================================================= */
/* Las cuatro escenas propias del capítulo 02 para caso-motor.js (que se carga después). Cada una recibe --p (0 a 1) y
   lo reparte en fases con tramo(): una fase va de 0 a 1 entre dos puntos del scroll, con curva firme y sin rebote */
(function () {
    const fijar = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
    const curva = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const tramo = (p, a, b) => curva(fijar((p - a) / (b - a)));
    const pad = n => String(n).padStart(2, '0');
    const fase = (el, nombre, v) => el.style.setProperty(nombre, v.toFixed(4));

    window.CASO_ESCENAS = {
        /* --- 1. COLOR: DIEZ VALORES --- */
        /* Paso 1: caen las bandas, una tras otra. Paso 2: el degradado las funde y el mouse abre cada banda, con su HEX.
           Paso 3: la capa se recoge en un filete y de él suben los tres tonos */
        valores: el => {
            const pieza = el.querySelector('.mv'), bandas = el.querySelector('.mv-bandas'), liso = el.querySelector('.mv-liso');
            const tonos = ['104E56', '178181', '1B9C9C', '21B6B6', '49C2BF', '70CAC7', '80E2DF', 'B7E5E2', 'E8E8E8', 'F4F4F4'];
            bandas.innerHTML = tonos.map((c, k) => `<i style="--c:#${c}"><span class="mono"><b>${pad(k + 1)}</b>#${c}</span></i>`).join('');
            const tiras = [...bandas.children], bloques = [...el.querySelectorAll('.mv-tono')];
            const escala = () => pieza.style.setProperty('--fil-e', (10 / (pieza.clientHeight || 900)).toFixed(4));
            escala(); window.addEventListener('resize', escala);
            let mide = false, actual = -1;
            const abrir = k => {
                if (k === actual) return;
                if (k < 0) { const c = (actual + 0.5) * 10 + '%'; liso.style.setProperty('--a', c); liso.style.setProperty('--b', c); pieza.classList.remove('mide'); actual = -1; return; }
                if (actual < 0) { const c = (k + 0.5) * 10 + '%'; liso.style.transition = 'none'; liso.style.setProperty('--a', c); liso.style.setProperty('--b', c); void liso.offsetWidth; liso.style.transition = ''; }
                actual = k; pieza.classList.add('mide');
                liso.style.setProperty('--a', k * 10 + '%'); liso.style.setProperty('--b', (k + 1) * 10 + '%');
            };
            pieza.addEventListener('pointermove', e => { if (!mide || e.pointerType === 'touch') return; const r = pieza.getBoundingClientRect(); abrir(Math.min(Math.floor(((e.clientX - r.left) / r.width) * 10), 9)); });
            pieza.addEventListener('pointerleave', () => abrir(-1));
            return p => {
                tiras.forEach((t, k) => fase(t, '--f', tramo(p, 0.02 + k * 0.024, 0.12 + k * 0.024)));
                const l = tramo(p, 0.38, 0.5), f = tramo(p, 0.68, 0.78);
                fase(pieza, '--liso', l); fase(pieza, '--filete', f);
                bloques.forEach((b, k) => fase(b, '--f', tramo(p, 0.74 + k * 0.04, 0.84 + k * 0.04)));
                mide = l > 0.98 && f < 0.02;
                if (!mide) abrir(-1);
            };
        },

        /* --- 2. LOGO: COMPOSICIÓN, CONSTRUCCIÓN, PROTECCIÓN Y MÍNIMOS --- */
        lockup: el => {
            const pieza = el.querySelector('.ml-pieza'), pie = el.querySelector('[data-ml-pie]');
            const nombres = ['Principal', 'Construcción', 'Área de protección', 'Mínimos'];
            let paso = -1;
            return p => {
                const c1 = tramo(p, 0.02, 0.16);
                fase(pieza, '--c1', c1); fase(pieza, '--c1o', c1 * (1 - tramo(p, 0.24, 0.29)));
                fase(pieza, '--c2', tramo(p, 0.27, 0.45)); fase(pieza, '--cx', tramo(p, 0.42, 0.48));
                fase(pieza, '--c3', tramo(p, 0.52, 0.68)); fase(pieza, '--c4', tramo(p, 0.76, 0.86));
                const k = Math.min(Math.floor(p * 4), 3);
                if (k !== paso) { paso = k; pie.textContent = nombres[k]; }
            };
        },

        /* --- 3. CAMINOS: ISOTIPOS, APLICACIONES, CRITERIOS Y ELECCIÓN --- */
        caminos: el => {
            const pieza = el.querySelector('.mc'), cols = [...el.querySelectorAll('.mc-col')];
            return p => {
                cols.forEach((c, k) => { fase(c, '--ci', tramo(p, 0.02 + k * 0.05, 0.12 + k * 0.05)); fase(c, '--fo', tramo(p, 0.27 + k * 0.05, 0.37 + k * 0.05)); });
                fase(pieza, '--cr', tramo(p, 0.52, 0.68)); fase(pieza, '--el', tramo(p, 0.77, 0.87));
            };
        },

        /* --- 4. MANUAL: LAS PÁGINAS PASAN Y SE DETIENEN --- */
        /* La posición avanza página a página: el 40 % de cada tramo queda quieto y el resto es el paso a la siguiente. La
           primera y la última tienen su pausa completa */
        manual: el => {
            const pags = [...el.querySelectorAll('.mm-pag')], n = pags.length, sec = el.querySelector('[data-mm-sec]'), num = el.querySelector('[data-mm-pag]');
            let actual = -1;
            return p => {
                const t = fijar(p * (n - 0.4) - 0.3, 0, n - 1), k = Math.min(Math.floor(t), n - 2), pos = k + curva(fijar((t - k - 0.2) / 0.6));
                pags.forEach((g, i) => { const d = i - pos; fase(g, '--d', d); fase(g, '--o', fijar(1 - Math.abs(d) * 0.72, 0.16, 1)); });
                const c = Math.round(pos);
                if (c === actual) return;
                actual = c;
                const g = pags[c].dataset;
                sec.textContent = g.sec; num.textContent = g.pag === 'Portada' ? 'Portada' : `Pág. ${g.pag} / 36`;
            };
        }
    };
})();
/* =======================================================
   FIN JS · LA MARCA DE LLEGÓ FARMA (.ml)
   ======================================================= */
