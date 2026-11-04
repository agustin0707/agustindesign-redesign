/* =======================================================
   JS · LLEGADA AL CASO DESDE EL HOME
   ======================================================= */
/* Va en el <head> para escuchar pagereveal antes del primer cuadro. Si se llega desde una portada del home con View
   Transitions, el hero del caso ([data-vt-pieza]) recibe la ventana que viaja y sus entradas esperan a que aterrice */
(() => {
    /* --- 1. LLEGADA --- */
    /* El home deja anotado de qué portada se sale; sin esa nota (recarga, otro origen) la página entra como siempre.
       Las entradas parten a los 620 ms del viaje de 1 s, cuando la pieza ya está frenando */
    const html = document.documentElement, ATERRIZA = 620;
    window.addEventListener('pagereveal', e => {
        let desde = null;
        try { desde = sessionStorage.getItem('caso-desde'); sessionStorage.removeItem('caso-desde'); } catch (err) { /* sin almacenamiento, sin viaje */ }
        const pieza = document.querySelector('[data-vt-pieza]');
        if (!e.viewTransition || !desde || !pieza) return;
        pieza.classList.add('vt-pieza');
        html.classList.add('vt-llega', 'vt-espera');
        const soltar = () => html.classList.remove('vt-espera');
        e.viewTransition.ready.then(() => setTimeout(soltar, ATERRIZA), soltar);
        e.viewTransition.finished.finally(() => pieza.classList.remove('vt-pieza'));
    });
})();
/* =======================================================
   FIN JS · LLEGADA AL CASO DESDE EL HOME
   ======================================================= */
