/* =======================================================
   INICIO JS · PIEZAS DE CADA DECISIÓN
   ======================================================= */
/* Devuelve el HTML de la pieza que acompaña a una decisión. Lo usan las tres direcciones */
(function () {
    const isos = Array.from({ length: 15 }, (_, i) => `../media/iso-${String(i + 1).padStart(2, '0')}.jpg`);
    window.CASO_PIEZA = d => {
        const p = d.pieza;
        if (p.tipo === 'isos') return `
            <figure class="pz pz-isos">
                <div class="isos">${isos.map((src, i) => `<img src="${src}" alt="" loading="lazy" decoding="async"${i === isos.length - 1 ? ' class="final"' : ''}>`).join('')}</div>
                <figcaption class="etiqueta">Exploración del símbolo, de tenedor a sistema · <span>el elegido para Connect</span></figcaption>
            </figure>`;
        if (p.tipo === 'img') return `
            <figure class="pz pz-img${p.extra ? ' con-extra' : ''}">
                <img src="${p.src}" alt="" loading="lazy" decoding="async">
                ${p.extra ? `<img class="extra" src="${p.extra}" alt="" loading="lazy" decoding="async">` : ''}
            </figure>`;
        if (p.tipo === 'par') return `
            <figure class="pz pz-par">
                <div><img src="${p.a}" alt="" loading="lazy" decoding="async"><span class="etiqueta">Producto · claro</span></div>
                <div><img src="${p.b}" alt="" loading="lazy" decoding="async"><span class="etiqueta">Empresa · oscuro</span></div>
            </figure>`;
        if (p.tipo === 'movil') return `
            <figure class="pz pz-movil">
                <div class="telefono-caso"><img src="${p.src}" alt="" loading="lazy" decoding="async"></div>
                <ul class="chequeo etiqueta">
                    <li>9 páginas · HTML, CSS y JS</li><li>0 errores de consola</li><li>0 enlaces rotos</li>
                    <li>Sin desbordes en 375 · 768 · 1265 px</li><li>Imágenes con texto alternativo</li><li>Movimiento reducido respetado</li>
                </ul>
            </figure>`;
        return '';
    };
})();
/* =======================================================
   FIN JS · PIEZAS DE CADA DECISIÓN
   ======================================================= */
