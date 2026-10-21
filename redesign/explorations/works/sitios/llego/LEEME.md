# Llegó Farma · Onepage (llegofarma.cl)

Sitio estático en HTML, CSS y JavaScript. No necesita base de datos, PHP ni compilación: se sube tal cual a cualquier hosting que sirva archivos.

## Qué hay en esta carpeta
- `index.html`: la página principal.
- `privacidad.html`: Política de Privacidad y Datos de Llegó (el texto de llego.cl/politicas-de-privacidad, con su alcance ampliado a llegofarma.cl).
- `css/`, `js/`, `fonts/`, `img/`: estilos, programación, tipografías (Manrope y LF Mono, licencia en `fonts/LICENCIA-FUENTES.txt`) e imágenes. Las fotos van en AVIF con respaldo JPG.
- `img/og/compartir.jpg`: la imagen que aparece al compartir el link en LinkedIn, WhatsApp y otras redes (1200 × 630).

## Publicar en 4 pasos
1. **Subir los archivos.** Copiar todo el contenido de esta carpeta (no la carpeta en sí) a la raíz del hosting, de modo que `index.html` quede en `https://llegofarma.cl/index.html`. Sirve el hosting de Llegó o uno estático (Netlify, Cloudflare Pages, Vercel, GitHub Pages).
2. **Apuntar el dominio.** llegofarma.cl ya está inscrito en NIC Chile a nombre de Servicios Logísticos DGA SpA (octubre 2026). En NIC Chile (llegofarma.cl > Administrar > Servidores DNS), poner los DNS del hosting o, si se administra la zona, crear los registros que indique el hosting (normalmente un registro A para `llegofarma.cl` y un CNAME para `www`). El cambio puede tardar de minutos a unas horas.
3. **Activar HTTPS.** Pedir el certificado SSL en el hosting (casi todos lo dan gratis con Let's Encrypt) y forzar `https://`. Que `www.llegofarma.cl` redirija a `https://llegofarma.cl`.
4. **Redirigir llego.cl/farma.** En el administrador de llego.cl (HubSpot: Configuración > Contenido > Dominios y URL > Redirecciones de URL), crear una redirección permanente (301) de `/farma` a `https://llegofarma.cl`.

## Después de publicar, revisar
- [ ] Abrir https://llegofarma.cl en un celular y en un computador.
- [ ] Enviar el formulario con datos de prueba y confirmar que llega a contacto@llego.cl con el asunto "Nuevo contacto desde llegofarma.cl".
- [ ] Abrir la Política de Privacidad desde el formulario y desde el pie de página.
- [ ] Pegar https://llegofarma.cl en el Post Inspector de LinkedIn (https://www.linkedin.com/post-inspector/) para que tome la imagen y el título antes del lanzamiento.
- [ ] Escanear el QR de la feria y confirmar que abre https://llegofarma.cl.

## Formulario de contacto
- Funciona con **Formspree** (formspree.io). La dirección del formulario está en `index.html`, en el atributo `action` del formulario: `https://formspree.io/f/mgaorkeo`.
- Los mensajes llegan a **contacto@llego.cl**. El correo de destino se cambia en la cuenta de Formspree (Workflow > Email), no en el código.
- El límite de mensajes al mes depende del plan contratado en Formspree. El plan se cambia en Formspree sin tocar el sitio.
- Protección contra spam: filtro de Formspree y un campo oculto para robots. No usa CAPTCHA.
- La cuenta y el formulario de Formspree son de Llegó (octubre 2026). Si alguna vez se crea otro formulario, basta con cambiar la dirección en `index.html`.

## Medición (Google Analytics o LinkedIn)
El sitio no mide visitas por ahora. Cuando Llegó tenga los códigos, se pegan donde lo indica el comentario "Medición" dentro del `<head>` de `index.html`, y lo mismo en `privacidad.html`. Si se usan cookies de medición, conviene revisar que la Política de Privacidad lo cubra.

## Cambios frecuentes
- **Textos:** están en `index.html`. Se editan con cualquier editor de texto; no tocar las etiquetas `<...>`.
- **Política de Privacidad:** si Llegó actualiza la de llego.cl, copiar el nuevo texto en `privacidad.html`.
- **Imagen para compartir:** reemplazar `img/og/compartir.jpg` por otra de 1200 × 630 con el mismo nombre y volver a pasar el link por el Post Inspector de LinkedIn.

Sitio diseñado y desarrollado por Agustín Avendaño (octubre 2026).
