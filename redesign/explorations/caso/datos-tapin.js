/* =======================================================
   INICIO JS · DATOS DEL CASO TAP IN
   ======================================================= */
/* Copy en borrador para la Fase 4 (4.4). Fuente: ~/Documents/Illustrator/Tap In/Portafolio/
   tapin-caso-de-estudio.md. Relato en cuatro tiempos: el origen (Campus), el giro (el Rebirth de la marca),
   la web y el resultado. Frases cortas: la pieza cuenta el resto. No se publica nada [SENSIBLE] ni se
   presentan como resultados las cifras [ILUSTRATIVO]. Un *asterisco* marca la palabra clave */
(function () {
    const M = 'media/', MK = '../works/sitios/tapin/mockups/';
    window.CASO = {
        id: 'tapin', nombre: 'Tap In', numero: '02',
        heroMockup: '../works/sitios/tapin/mockups/mockup-comedor-modulo.html',
        disciplinas: 'Marca · Producto · Web', anio: '2025–26',
        vivo: { texto: 'tapin.cl', url: 'https://tapin.cl', publicado: true },
        sitio: '../works/sitios/tapin/index.html', introSitio: 2400,
        poster: '../works/media/tapin-poster.jpg',
        orden: ['resumen', 'mapa', 'decisiones', 'resultado', 'aprendizaje'],
        fichaEnResumen: true,
        fondo: '2', flujoCapitulos: true,
        ficha: [['Cliente', 'Tap In · Chile y Perú'], ['Rol', 'Diseñador fundador'], ['Período', 'Ene 2025 a hoy'], ['Equipo', 'Cofundadores y su equipo de desarrollo'], ['Stack', 'HTML, CSS y JS vanilla'], ['En vivo', 'tapin.cl']],
        ritmo: { resumen: 'claro', proceso: 'claro', decisiones: 'claro', resultados: 'marca', aprendizaje: 'oscuro' },
        bajada: 'De la cafetería del campus a la plataforma del colegio.',
        heroMeta: [['Rol', 'Diseñador fundador'], ['Período', 'Ene 2025 a hoy'], ['Alcance', 'Marca, UX/UI y código']],

        intro: 'Diseñé la marca de Tap In desde el día uno. Cuando la empresa se reinventó, *rehice la marca y programé su web.*',
        resumen: [
            ['El encargo', 'Una marca que sobreviviera al pivote, de la comida a los colegios.'],
            ['Lo que hice', 'Marca, sistema de productos y la web, de punta a punta.'],
            ['El resultado', 'tapin.cl en producción y una sola marca para todo el ecosistema.']
        ],
        titulos: { proceso: 'Dieciocho meses, *tres etapas*', resultados: 'Lo que *quedó andando*' },

        mapa: {
            desde: '2025-01', hasta: '2026-10', der: '18 meses · 3 etapas', anios: ['2025', '2026'],
            fases: [
                { nombre: 'El origen', periodo: '2025 · Campus', desde: '2025-01', hasta: '2025-12', color: '#4A3CAE', cap: 0 },
                { nombre: 'El Rebirth', periodo: 'Feb a abr 2026 · Marca', desde: '2026-02', hasta: '2026-04', color: '#6B5CE7', cap: 1 },
                { nombre: 'La web', periodo: 'Abr a sep 2026 · tapin.cl', desde: '2026-04', hasta: '2026-10', color: '#9B8EF0', cap: 2 }
            ],
            hitos: [
                ['2025-01', 'Nace Tap In', 'Identidad, Forky y la web app de Campus'],
                ['2025-06', 'La marca sale al campus', '60 QR en los locales de la UC'],
                ['2026-02', 'Diagnóstico', 'Un cuestionario a los socios antes de diseñar'],
                ['2026-03', 'Marca aprobada', 'Paleta y cerebro de Connect, el 24 de marzo'],
                ['2026-05', 'Web morada en tapin.cl', 'Después del choque con el producto real'],
                ['2026-09', 'Cierre', 'El sitio completo, en producción']
            ],
            etiquetas: ['Ene 2025', 'Jun 2025', 'Feb 2026', 'Mar 2026', 'May 2026', 'Sep 2026']
        },

        capitulos: [
            { nombre: 'El origen', periodo: '2025', bajada: 'Una app para pedir comida sin filas en la universidad.', visual: 'campus', ritmo: 'oscuro' },
            { nombre: 'El Rebirth', periodo: 'Feb a abr 2026', bajada: 'De app de comida a sistema para colegios. Primero, la marca.', visual: 'rebirth', ritmo: 'marca' },
            { nombre: 'La web', periodo: 'Abr a sep 2026', bajada: 'tapin.cl, diseñado y programado por mí, para que un director entienda en segundos.', visual: 'web', ritmo: 'oscuro' }
        ],
        decisiones: [
            { cap: 0, id: 'forky', titulo: 'Unos cubiertos que corren',
                texto: 'Un tenedor y un cuchillo que, con patas, se vuelven un personaje en movimiento.',
                porque: 'Una doble lectura se recuerda. Forky quedó como el ADN del ecosistema.',
                pieza: { tipo: 'tp-forky', nota: 'De cubiertos a personaje', final: 'El isotipo de Campus', pasos: [['tp-forky-paso1.png', 'Cubiertos'], ['tp-forky-paso2.png', 'En movimiento'], ['tp-forky-paso3.png', 'El cuerpo'], ['tp-forky-paso4.png', 'Casi']] }, ancla: null },
            { cap: 0, id: 'campus', titulo: 'La marca salió al campus',
                texto: '60 QR en los locales de la UC y promociones con Red Bull y Banco de Chile dentro de la app.',
                porque: 'La entrada era un QR: tenía que entenderse de pie, con hambre y frente al mesón.',
                pieza: { tipo: 'tp-campus', nota: 'Campus UC, 2025', fotos: [[M + 'tapin_contenido8.webp', ''], [M + 'tapin_contenido6.webp', 'Stand en la UC']], promos: [[M + 'tp-redbull-v.jpg', 'Red Bull'], [M + 'tp-bancochile.jpg', 'Banco de Chile']], datos: [['60', 'QR en locales de la UC'], ['2', 'alianzas: Red Bull y Banco de Chile']] }, ancla: null },

            { cap: 1, id: 'madre', titulo: 'Una madre que lidera',
                texto: 'tap in arriba; Campus, Connect y Health cuelgan de ella con su nombre y su tono.',
                porque: 'Si mañana hay un cuarto producto, entra solo.',
                pieza: { tipo: 'tp-arquitectura', nota: 'Arquitectura de marca del ecosistema', nuevo: 'El próximo producto, cuando llegue' }, ancla: null },
            { cap: 1, id: 'paleta', titulo: 'Un tono por producto',
                texto: 'Una sola familia morada. Connect, el principal, no lleva el más oscuro: su público es escolar.',
                porque: 'Unida, madura y con tonos de sobra para crecer.',
                pieza: { tipo: 'tp-paleta', nota: 'Paleta del sistema · pasa el mouse por cada tono', pie: 'De lo más establecido a lo más nuevo, de oscuro a claro' }, ancla: null },
            { cap: 1, id: 'cerebro', titulo: 'Un cerebro hecho de piezas',
                texto: 'A la rápida, un cerebro. Si te fijas, cuatro piezas de puzzle camufladas en los surcos.',
                porque: 'Connect une los servicios del colegio: la silueta habla de inteligencia; el interior, de conexión.',
                pieza: { tipo: 'tp-cerebro', nota: 'Isotipo de Connect · aprobado el 24 de marzo' }, ancla: null },

            { cap: 2, id: 'menu', titulo: 'Un menú, cuatro preguntas',
                texto: 'Qué hace, si funciona en mi colegio, quiénes son y cómo los contacto.',
                porque: '"Soluciones" y no "Productos": nadie quiere comprar un catálogo.',
                pieza: { tipo: 'img', src: M + 'tp-nav-dd.jpg' },
                ancla: { scroll: 0, marco: '#navbar .nav-inner, .nav-li--has-dd .nav-dropdown', abrir: '.nav-li--has-dd', nota: 'Menú · Soluciones', enlace: '' } },
            { cap: 2, id: 'hero', titulo: 'Primero, confianza',
                texto: 'El producto funcionando en el hero y, justo debajo, los colegios que ya lo usan.',
                porque: 'El director ve a sus pares antes de dudar.',
                pieza: { tipo: 'img', src: M + 'tp-hero.jpg' },
                ancla: { scroll: 0, marco: '.hero-mock', nota: 'Cuatro módulos en vivo', enlace: '' } },
            { cap: 2, id: 'claro', titulo: 'De oscuro a claro',
                texto: 'Cuando llegó el producto real, la web se reestructuró y pasó a fondo claro.',
                porque: 'Institucional antes que tecnológico.',
                pieza: { tipo: 'par', a: M + 'tp-ecosistema.jpg', b: M + 'tp-empresa.jpg', pieA: 'Producto · claro', pieB: 'Empresa · oscuro' },
                ancla: { sel: '.prodv6-closing-wrap', nota: 'Todo conectado, en claro', enlace: '' } },
            { cap: 2, id: 'modulos', titulo: 'Módulos, no pasos',
                texto: 'Sin números: pestañas para elegir qué resolver primero.',
                porque: 'Cada módulo se contrata por separado.',
                pieza: { tipo: 'img', src: M + 'tp-productos.jpg' },
                ancla: { sel: '#productos', marco: '.prodv7-tabs', nota: 'Pestañas de módulos', enlace: '#productos', demo: { sel: '.prodv7-tab', evento: 'click', cada: 2200 } } },
            { cap: 2, id: 'empatia', titulo: 'Un mockup con empatía',
                texto: 'Cambié un "acceso denegado" por pago, validación y aviso de saldo.',
                porque: 'Que un niño no almuerce es duro para una familia.',
                pieza: { tipo: 'mockup', nota: 'Mockup del comedor, en vivo', src: MK + 'mockup-comedor-modulo.html', pasos: ['Pago', 'Validación', 'Aviso de saldo'] }, ancla: null }
        ],

        enVivo: {
            modulos: [
                ['Comedor Escolar', 'Pago, conciliación y aviso al apoderado', MK + 'mockup-comedor-modulo.html'],
                ['Centro de Padres', 'La cartola bancaria se clasifica sola', MK + 'mockup-cpa-cartola.html'],
                ['Gestión Interna', 'Una tarea que llega por WhatsApp', MK + 'mockup-gestion-tarea.html'],
                ['Talleres y Ligas', 'Los cupos se llenan y se cierran solos', MK + 'mockup-talleres-modulo.html']
            ]
        },
        contar: true,
        resultados: [
            ['9', 'páginas en producción, diseñadas y programadas'],
            ['≈40.000', 'líneas de código propio, sin frameworks'],
            ['8', 'mockups animados con datos verosímiles'],
            ['3', 'productos en una sola familia de marca']
        ],
        contexto: { texto: 'Según la empresa, Campus llegó a más de 27.000 estudiantes en dos campus de la UC, y Connect a más de 15.000 familias en Chile y Perú.', verificar: 'Cifras de la empresa, por confirmar (4.5)' },
        citas: [
            ['En una sola imagen se entiende cómo funciona. Eso es lo que teníamos que lograr.', 'Cofundador de Tap In'],
            ['Está súper profesional, parece una empresa real. Es lo más clave para generar confianza.', 'Cofundador de Tap In']
        ],
        citasNota: 'Citas suavizadas de reuniones internas: publicar solo con tu aprobación y la de ellos',
        aprendizaje: 'Diseñar con información que cambia. A mitad del camino llegó la realidad del producto: cambiaron la estructura y el contenido, el lenguaje visual se sostuvo.',
        creditos: 'Marca, UX/UI y desarrollo front end: Agustín Avendaño. Con los cofundadores de Tap In y su equipo de desarrollo, a cargo del producto y del deploy.',
        creditosLista: [['Marca, UX/UI y front end', 'Agustín Avendaño'], ['Producto y deploy', 'Equipo de desarrollo de Tap In'], ['Con', 'Los cofundadores de Tap In']],
        siguiente: { id: 'mend', nombre: 'Mend', numero: '03', disciplinas: ['Investigación', 'Marca', 'Web app', '2026'], bajada: 'Salud articular para Atención Primaria, de la investigación al producto.', tinte: '#0D2024', url: '../works/w3-pila.html' }
    };
})();
/* =======================================================
   FIN JS · DATOS DEL CASO TAP IN
   ======================================================= */
