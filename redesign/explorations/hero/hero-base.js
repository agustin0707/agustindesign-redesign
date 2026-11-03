/* =======================================================
   INICIO JS · BASE COMÚN DE LOS HEROS
   ======================================================= */
(function () {
    /* --- 1. HORA DE SANTIAGO EN VIVO --- */
    const relojes = document.querySelectorAll('[data-reloj]');
    const formato = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: false });
    const tick = () => relojes.forEach(r => { const [h, m] = formato.format(new Date()).split(':'); r.innerHTML = (r.dataset.reloj || 'Santiago') + ' ' + h + '<span class="dos">:</span>' + m; });
    /* Se actualiza justo al cambiar el minuto, así el parpadeo de los dos puntos no se reinicia */
    const programar = () => setTimeout(() => { tick(); programar(); }, 60000 - (Date.now() % 60000) + 50);
    tick(); programar();

    /* --- 2. LETRAS QUE SUBEN --- */
    /* Envuelve palabras y letras para animarlas en cascada sin perder accesibilidad */
    document.querySelectorAll('.hero [data-letras]').forEach(el => {
        const texto = el.textContent.trim();
        const inicio = parseInt(el.dataset.letras, 10) || 120;
        el.setAttribute('aria-label', texto);
        let i = 0;
        el.innerHTML = texto.split(/(\s+|<br>)/).map(p => {
            if (/^\s+$/.test(p)) return ' ';
            return '<span class="palabra" aria-hidden="true">' + [...p].map(c => `<span class="l" style="animation-delay:${inicio + (i++) * 28}ms">${c}</span>`).join('') + '</span>';
        }).join('');
    });

    /* --- 3. PARALLAX CON EL MOUSE Y EL SCROLL --- */
    /* Cada capa se mueve según su factor: el nombre y el retrato a distinta velocidad. El mouse no mueve las capas de
       golpe: una posición suavizada lo persigue con inercia (constante de 420 ms, medida en tiempo para que sea igual a
       60 y a 120 Hz), así entrar y salir del hero se siente como un deslizamiento. El scroll se aplica directo */
    const hero = document.querySelector('[data-parallax]');
    const capas = hero ? hero.querySelectorAll('[data-capa]') : [];
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hero || !capas.length || quieto) return;
    const INERCIA = 420;
    let mx = 0, my = 0, ax = 0, ay = 0, sy = 0, cuadro = 0, antes = 0;
    const pintar = t => {
        cuadro = 0;
        const k = 1 - Math.exp(-(antes ? Math.min(t - antes, 64) : 16) / INERCIA);
        antes = t;
        ax += (mx - ax) * k; ay += (my - ay) * k;
        const quieta = Math.abs(mx - ax) + Math.abs(my - ay) < 0.0004;
        if (quieta) { ax = mx; ay = my; antes = 0; }
        capas.forEach(c => {
            const f = parseFloat(c.dataset.capa);
            const base = c.dataset.base || '';
            c.style.translate = `${(ax * f * 10).toFixed(2)}px ${(ay * f * 6 + sy * (f - 1) * 0.12).toFixed(2)}px`;
            if (base) c.style.transform = base;
        });
        if (!quieta) pedir();
    };
    const pedir = () => { if (!cuadro) cuadro = requestAnimationFrame(pintar); };
    if (window.matchMedia('(hover: hover)').matches) {
        hero.addEventListener('mousemove', e => { const r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; pedir(); });
        hero.addEventListener('mouseleave', () => { mx = 0; my = 0; pedir(); });
    }
    window.addEventListener('scroll', () => { sy = Math.min(window.scrollY, window.innerHeight); pedir(); }, { passive: true });
})();
/* =======================================================
   FIN JS · BASE COMÚN DE LOS HEROS
   ======================================================= */
