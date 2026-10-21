/* =======================================================
   INICIO JS · DATOS DEL CASO LLEGÓ FARMA
   ======================================================= */
/* Copy en borrador (Fase 4). Fuentes: diálogo de la presentación del 7 sep 2026, brief y decisiones del
   one page (9 oct 2026), base gráfica del sitio, layout aprobado y el manual de marca terminado.
   El sitio aún no está publicado: no hay enlaces a llegofarma.cl */
(function () {
    const M = 'media/';
    window.CASO = {
        id: 'llego', nombre: 'Llegó Farma', numero: '01',
        titulo: [{ t: 'Llegó' }, { t: 'Farma', clave: true }],
        disciplinas: 'Marca · Manual · One page', anio: '2026',
        vivo: { texto: 'llegofarma.cl', url: 'https://llegofarma.cl', publicado: false, estado: 'pronto' },
        sitio: '../works/sitios/llego/index.html', introSitio: 2600,
        poster: '../works/media/llego-poster.jpg',
        escena: { fondo: '../works/media/llego-foto.jpg' },
        ritmo: { portada: 'oscuro', resumen: 'claro', decisiones: 'oscuro', proceso: 'marca', resultados: 'claro', aprendizaje: 'oscuro' },
        ficha: [['Cliente', 'Llegó, logística de última milla'], ['Rol', 'Identidad, manual, diseño y desarrollo web'], ['Período', 'Ago a oct 2026'], ['Equipo', 'Con el equipo de marketing de Llegó'], ['En vivo', 'llegofarma.cl · pronto']],
        bajada: 'La vertical farmacéutica de Llegó, de la cruz al sitio.',
        intro: 'Llegó abría una vertical para la industria farmacéutica y necesitaba una marca que conviviera con la suya. Gané el pitch frente al diseñador de la marca madre, diseñé la identidad y el manual, y después diseñé y programé el sitio para su lanzamiento en una feria del sector.',
        resumen: [
            ['El encargo', 'Una submarca para logística farmacéutica que se reconociera como Llegó sin tocar su logo.'],
            ['Lo que hice', 'Identidad, manual de 36 páginas y un one page de 8 secciones, diseñado y programado por mí.'],
            ['El resultado', 'llegofarma.cl listo para la feria del 3 y 4 de noviembre, con su formulario conectado a ventas.']
        ],
        titulos: { decisiones: 'Siete decisiones, *una marca que convive*', proceso: 'De la propuesta al sitio, *en menos de dos meses*', resultados: 'Lo que *quedó listo*' },
        decisiones: [
            { id: 'madre', titulo: 'Una submarca que no toca a la madre',
                texto: 'El logotipo de Llegó no se intervino: retícula, área de resguardo y proporciones quedaron intactas, y todo Farma se construyó alrededor. La palabra Farma va bajo el logotipo, nunca integrada al isotipo.',
                porque: 'La lectura siempre parte por Llegó como marca madre y después por Farma como vertical.',
                pieza: { tipo: 'img', src: M + 'lf-construccion.jpg', extra: M + 'lf-convivencia.jpg', nota: 'Manual · construcción y convivencia' }, ancla: null },
            { id: 'paleta', titulo: 'Ampliar la paleta, no inventar colores',
                texto: 'Mantuve la familia cromática de Llegó, turquesa 178181 y turquesa claro 70CAC7, y sumé un tono oscuro, 104E56, para dar contraste donde el turquesa no funciona: señalética de vehículos y fondos claros.',
                porque: 'No es un color nuevo para la marca: es el rango tonal que ya existía, ampliado.',
                pieza: { tipo: 'img', src: M + 'lf-paleta.jpg', extra: M + 'lf-fondos.jpg', nota: 'Manual · paleta y fondos' }, ancla: null },
            { id: 'tipografia', titulo: 'Un wordmark dibujado para Farma',
                texto: 'Farma no usa una familia existente ni la de Llegó: es un vectorizado que dibujé para que converse con Llegó, con terminales redondeadas y geometría abierta, pero con carácter propio.',
                porque: 'Comparte rasgos para sentirse de la familia; no los copia para no competir con la madre.',
                pieza: { tipo: 'img', src: M + 'lf-tipografia.jpg', nota: 'Manual · tipografía Farma' }, ancla: null },
            { id: 'cruz', titulo: 'Una cruz que no fuera genérica',
                texto: 'La gerencia pidió una cruz que no interfiriera con la marca madre ni con la tipografía. Desarrollé tres caminos con el mismo rigor, todos desde el lenguaje gráfico de Llegó, y los presenté aplicados en furgón, reparto y empaque.',
                porque: 'Los comparé con cuatro criterios y con adjetivos en vez de aprobado o reprobado: los tres cumplían, de formas distintas. La elección fue del cliente.',
                pieza: { tipo: 'caminos', lista: [['Puntos', M + 'lf-iso-puntos.svg', 'la más orgánica'], ['Líneas', M + 'lf-iso-lineas.svg', 'la más directa'], ['Nodos', M + 'lf-iso-nodos.svg', 'el sistema más consistente']], elegido: 2, tabla: M + 'lf-tabla.jpg', nota: 'Reajuste del 7 sep · tres caminos, uno elegido' }, ancla: null },
            { id: 'reticula', titulo: 'La retícula del manual, como estructura del sitio',
                texto: 'La retícula de precisión del manual se ve en la web: líneas finas que cruzan cada sección y se cortan antes de tocarse. Las fotos no flotan: ocupan módulos y sus bordes coinciden con las líneas.',
                porque: 'La precisión que promete la marca se nota en cómo está armada la página.',
                pieza: { tipo: 'img', src: M + 'lf-s-capacidades.jpg' },
                ancla: { sel: '#lista-capacidades', marco: '.bento', nota: 'Bento medido por la retícula' } },
            { id: 'atajos', titulo: 'Tres atajos en vez de un botón',
                texto: 'El hero reemplaza el clásico "Conoce nuestras capacidades" por tres botones cortos, Capacidades, Calidad y Tecnología, que bajan a su sección y encienden su nodo al llegar.',
                porque: 'Quien llega desde el QR de la feria decide en segundos qué le importa: tres puertas lo llevan directo.',
                pieza: { tipo: 'img', src: M + 'lf-hero.jpg' },
                ancla: { scroll: 0, marco: '.indice', nota: 'Tres atajos del hero' } },
            { id: 'ruta', titulo: 'Una ruta hecha en código',
                texto: 'Tecnología no tiene foto: las seis etapas del seguimiento son una lista y, al lado, una ruta con nodos dibujada en SVG avanza con cada etapa, al pasar el cursor o al bajar.',
                porque: 'Ver la trazabilidad funcionando explica más que la imagen de un panel.',
                pieza: { tipo: 'img', src: M + 'lf-s-tecnologia.jpg' },
                ancla: { sel: '#tecnologia', marco: '.ruta', nota: 'Ruta de seguimiento en SVG', demo: { sel: '.s-tecno .paso', evento: 'mouseenter', cada: 1100 } } }
        ],
        proceso: [
            ['28 ago 2026', 'Primera propuesta', 'Identidad para la vertical, presentada a marketing y gerencia'],
            ['7 sep 2026', 'Reajuste: tres caminos', 'Puntos, Líneas y Nodos, aplicados y comparados con cuatro criterios'],
            ['Sep 2026', 'Manual de marca', '36 páginas: construcción, color, tipografía, fondos y aplicaciones'],
            ['9 oct 2026', 'Brief del sitio', 'Una página para la feria, con formulario conectado a ventas'],
            ['10 a 13 oct 2026', 'Diseño y código', 'Escritorio primero, después celular y tablet'],
            ['20 oct 2026', 'Sitio entregado', 'Listo para publicar en llegofarma.cl']
        ],
        contar: true,
        resultados: [
            ['36', 'páginas de manual de marca'],
            ['3', 'caminos para la cruz, con el mismo rigor'],
            ['4', 'criterios para elegirla'],
            ['8', 'secciones, en celular, tablet y escritorio']
        ],
        galeria: { imgs: [M + 'lf-furgon.jpg', M + 'lf-repartidor.jpg', M + 'lf-empaque.jpg', M + 'lf-uniforme.jpg'], nota: 'Aplicaciones del sistema: furgón, reparto, empaque y uniforme' },
        aprendizaje: 'Presentar tres caminos igual de trabajados, con criterios y no con gustos, convirtió la elección en una decisión del cliente, tomada con argumentos.',
        creditos: 'Identidad, manual, diseño y desarrollo: Agustín Avendaño. Con el equipo de marketing de Llegó.',
        siguiente: { id: 'tapin', url: 'tapin.html', nombre: 'Tap In', numero: '02', bajada: 'De la cafetería del campus a la plataforma del colegio.', tinte: '#110E22' }
    };
})();
/* =======================================================
   FIN JS · DATOS DEL CASO LLEGÓ FARMA
   ======================================================= */
