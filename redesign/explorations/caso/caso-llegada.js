/* =======================================================
   JS · LLEGADA AL CASO DESDE EL HOME
   ======================================================= */
/* Va en el <head>, antes del primer cuadro. Si se llega desde una portada del home, la nota que dejó inicio-works.js
   dice dónde quedó la pieza (y trae la captura del cuadro exacto): el primer cuadro del caso la muestra quieta en ese
   lugar, sobre el mundo de la portada, y el script del hero la toma y sigue el movimiento (window.CASO_LLEGADA) */
(() => {
    /* --- 1. LA NOTA DEL HOME --- */
    /* Sin nota (recarga, otro origen), con otra pantalla o con movimiento reducido, la página entra como siempre */
    const html = document.documentElement, caso = document.currentScript.dataset.caso;
    let d = null;
    try { d = JSON.parse(sessionStorage.getItem('caso-llegada')); sessionStorage.removeItem('caso-llegada'); } catch (err) { /* sin almacenamiento, sin viaje */ }
    if (!d || d.caso !== caso || !d.ventana || Math.abs(d.w - window.innerWidth) > 2 || Math.abs(d.h - window.innerHeight) > 160) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* --- 2. EL PRIMER CUADRO --- */
    /* La copia quieta de la pieza (works-base.css) se dibuja con estas medidas; en Tap In también el título */
    const v = d.ventana, t = d.titulo, px = n => n.toFixed(1) + 'px';
    html.classList.add('llega-caso', 'llega-espera', 'llega-' + caso);
    [['--ll-x', px(v.x)], ['--ll-y', px(v.y)], ['--ll-w', px(v.w)], ['--ll-h', px(v.h)], ['--ll-img', `url("${d.img}")`]].forEach(([k, x]) => html.style.setProperty(k, x));
    if (t) [['--ll-tx', px(t.caja.x)], ['--ll-ty', px(t.caja.y)], ['--ll-tfs', px(t.fs)], ['--ll-tls', t.ls], ['--ll-tlh', px(t.lh)], ['--ll-tpeso', t.peso]].forEach(([k, x]) => html.style.setProperty(k, x));

    /* --- 3. EL RELEVO --- */
    /* El hero llama a tomar() en el mismo cuadro en que arma su pieza: sale la copia y la barra del sitio entra cuando el
       caso ya se armó. terminar() devuelve la página a su estado normal */
    window.CASO_LLEGADA = {
        ...d,
        tomar(barra = 900) {
            html.classList.remove('llega-espera');
            const b = document.querySelector('.barra');
            if (b) b.animate([{ opacity: 0, translate: '0 -10px' }, { opacity: 1, translate: '0 0' }], { duration: 600, delay: barra, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' });
        },
        terminar() {
            html.classList.remove('llega-caso', 'llega-' + caso);
            ['--ll-x', '--ll-y', '--ll-w', '--ll-h', '--ll-img', '--ll-tx', '--ll-ty', '--ll-tfs', '--ll-tls', '--ll-tlh', '--ll-tpeso'].forEach(k => html.style.removeProperty(k));
        }
    };
})();
/* =======================================================
   FIN JS · LLEGADA AL CASO DESDE EL HOME
   ======================================================= */
