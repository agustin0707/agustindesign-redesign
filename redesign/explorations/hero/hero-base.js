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
    document.querySelectorAll('[data-letras]').forEach(el => {
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
    /* Cada capa se mueve según su factor: el nombre y el retrato a distinta velocidad */
    const hero = document.querySelector('[data-parallax]');
    const capas = hero ? hero.querySelectorAll('[data-capa]') : [];
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!hero || !capas.length || quieto) return;
    let mx = 0, my = 0, sy = 0, pendiente = false;
    const pintar = () => {
        pendiente = false;
        capas.forEach(c => {
            const f = parseFloat(c.dataset.capa);
            const base = c.dataset.base || '';
            c.style.translate = `${mx * f * 10}px ${my * f * 6 + sy * (f - 1) * 0.12}px`;
            if (base) c.style.transform = base;
        });
    };
    const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); } };
    if (window.matchMedia('(hover: hover)').matches) {
        hero.addEventListener('mousemove', e => { const r = hero.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; pedir(); });
        hero.addEventListener('mouseleave', () => { mx = 0; my = 0; pedir(); });
    }
    window.addEventListener('scroll', () => { sy = Math.min(window.scrollY, window.innerHeight); pedir(); }, { passive: true });
})();
/* =======================================================
   FIN JS · BASE COMÚN DE LOS HEROS
   ======================================================= */
