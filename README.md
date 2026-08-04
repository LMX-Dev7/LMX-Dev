# LMX — Landing

Landing de LMX (Logic Modern Experience), agencia de automatización.
Sitio estático: HTML + CSS + JavaScript sin dependencias, sin build y sin `node_modules`.

## Por qué estático

Es una sola página, sin rutas, sin datos de servidor y sin autenticación.
El formulario se envía a Web3Forms desde el cliente. Next.js, React o un
bundler añadirían un paso de compilación y mantenimiento permanente sin
resolver ningún problema real.

Migrar a Next.js tendría sentido el día que aparezca alguna de estas
necesidades: blog o casos de estudio con publicación frecuente, varios
idiomas, área privada de cliente o un CMS.

## Estructura

```text
lmx-web/
├── index.html                  # única página
├── assets/
│   ├── css/                    # cargar SIEMPRE en este orden
│   │   ├── tokens.css          # 1. color, tipografía, espacio, ritmo
│   │   ├── base.css            # 2. reset, tipografía, botones, vidrio
│   │   ├── sections.css        # 3. cada sección del documento
│   │   ├── motion.css          # 4. revelado + animaciones de scroll
│   │   └── responsive.css      # 5. puntos de corte (última palabra)
│   ├── js/
│   │   ├── net.js              # malla de constelación del fondo (canvas)
│   │   ├── motion.js           # revelado, nav, contadores, riel
│   │   └── cta-form.js         # envío del formulario (Web3Forms)
│   └── img/
├── robots.txt
└── sitemap.xml
```

Regla: los valores literales de diseño viven en `tokens.css`.
No escribir colores ni tamaños a mano en el resto de archivos.

## Movimiento

Dos capas independientes:

1. **Revelado** (one-shot). `IntersectionObserver` añade `.in`.
   Funciona en cualquier navegador. Es la línea base.
2. **Scroll-driven** (continuo). CSS `animation-timeline`.
   Sin listeners de scroll: lo resuelve el compositor del navegador,
   así que no hay jank ni coste en el hilo principal.

La capa 2 es *progressive enhancement*. Sin soporte o sin JavaScript la
página se lee completa. Con `prefers-reduced-motion` se apaga todo.

La sección **Proceso** usa un riel horizontal anclado en escritorio
(`.rail--pinned`, que activa `motion.js` tras medir). Su estado base —
y el único en táctil — es un carrusel deslizable.

## Formulario

Envía a `https://api.web3forms.com/submit`. El `access_key` va en un
campo oculto de `index.html`.

Contrato que `cta-form.js` da por hecho y **no se debe romper**:

- ids: `cta-form`, `cta-form-wrap`, `cta-form-status`, `cta-submit-btn`, `cta-success`
- campos: `access_key`, `subject`, `from_name`, `name`, `whatsapp`, `process`
- clase `.is-hidden` definida en `base.css`

## Local

Sin dependencias. Desde la raíz del proyecto:

```bash
python -m http.server 8080
```

Y abrir `http://localhost:8080`.

Abrir `index.html` con doble clic también funciona, pero conviene usar el
servidor: algunas comprobaciones del navegador se comportan distinto bajo
el protocolo `file://`.

## Publicación

Desplegado en Vercel como sitio estático. `git push` a la rama principal
publica. No hay paso de build.

## Autor

Luis Muñoz — LMX.
