# Andreu Virgil — Portfolio

Sitio estático (HTML/CSS/JS, sin backend) para Andreu Virgil — DP, fotógrafo y colorista.

## Estructura

```
home.html             Home — vídeo de fondo en loop + menú superpuesto
index.html             Index — ficha con listado de trabajos seleccionados (enlazada
                        desde la palabra "Index" en todos los menús del sitio)
photography.html       Fotografía — dos tiras horizontales animadas (Analog / Digital)
photo-collection.html   Ficha de una colección de fotos (?id=slug), grid de imágenes
film.html               Grid de proyectos audiovisuales
film-project.html       Ficha de proyecto individual (?id=slug), vídeo Vimeo + créditos
info.html                Bio, contacto y CV (como la versión actual de andreuuv.xyz)

css/                    Estilos (style.css = base + nav compartido; uno por sección)
js/                     Lógica de cada página + menú/overlay compartido
data/
  projects.json         Proyectos de vídeo (título, rol, cliente, Vimeo ID, créditos...)
  photos.json            Colecciones de fotos (analog / digital)
assets/
  video/home-reel.mp4    Vídeo de fondo de la home (mudo, loop)
  images/...              Fotografías, miniaturas de proyectos, retrato de Info
  fonts/...                Tipografías propias (Courier Prime, Geist Mono)
```

Mientras no exista un archivo real en la ruta esperada, la página muestra un
**placeholder** visible (bloque gris con el nombre de archivo que espera) en vez de
un icono roto — así se puede repasar el diseño y saber exactamente qué falta subir.

## Cómo añadir contenido

### Vídeo de la home
Sube tu vídeo (mudo, sin audio necesario) como:
- `assets/video/home-reel.mp4`
- `assets/video/home-reel.webm` (opcional, más compatibilidad)
- `assets/images/home-poster.jpg` (fotograma de portada mientras carga)

### Fotografía
La página `photography.html` muestra dos tiras horizontales que se deslizan
solas sin parar (Analog arriba, Digital abajo, cada una en un sentido) — cada
tarjeta es una **colección** (una carpeta de fotos), no una foto suelta.

Edita `data/photos.json`. Cada colección:

```json
{
  "id": "slug-unico",
  "title": "Nombre de la colección",
  "cover": "assets/images/photography/analog/slug-unico/cover.jpg",
  "year": "2025",
  "photos": [
    "assets/images/photography/analog/slug-unico/01.jpg",
    "assets/images/photography/analog/slug-unico/02.jpg"
  ]
}
```

Añade o quita colecciones en `analog` / `digital` libremente — la tira y la
ficha de cada colección (`photo-collection.html?id=slug-unico`) se generan
solas. `cover` es la miniatura que aparece en la tira; `photos` es el listado
completo que se ve al entrar en la colección.

### Proyectos de vídeo (Film)
La página `film.html` es una lista que se desplaza a la izquierda — cada
proyecto muestra un **clip corto en loop** (como un GIF, pero en vídeo) que
también se reproduce en grande en el panel de la derecha, detrás del menú,
al pasar el ratón por encima. Al hacer clic entras a la ficha del proyecto
(`film-project.html`), que es la que usa el vídeo completo de Vimeo.

Edita `data/projects.json`. Cada proyecto:

```json
{
  "id": "slug-unico",
  "title": "Título",
  "category": "Commercial | Music Video | Editorial | ...",
  "role": "DP",
  "client": "Marca/cliente (opcional)",
  "year": "2025",
  "vimeoId": "123456789",
  "vimeoHash": "opcional, solo si el vídeo de Vimeo es privado (unlisted con hash)",
  "thumbnail": "assets/images/film/slug-thumb.jpg",
  "preview": "assets/video/film/slug-preview.mp4",
  "description": "Texto breve del proyecto.",
  "credits": [
    { "role": "Director of Photography", "name": "Andreu Virgil" },
    { "role": "Director", "name": "" }
  ]
}
```

`preview` es el clip corto y ligero (sin audio, unos pocos segundos, poco
peso) que se ve en la lista y en el panel grande — **este sí va en el
servidor** (`assets/video/film/`). `vimeoId`/`vimeoHash` son para el vídeo
completo, que sigue viviendo en Vimeo y solo se carga en la ficha individual
del proyecto — así la lista carga rápido y el vídeo pesado solo se pide
cuando alguien entra a ver el proyecto entero.

Para que un vídeo de Vimeo quede oculto de buscadores/no listado: en Vimeo,
márcalo como **Privado** con opción "solo con este enlace" o **No listado**, y
copia el `vimeoHash` que aparece en la URL para privacidad (ej.
`vimeo.com/123456789/abcdef1234` → `vimeoId: "123456789"`,
`vimeoHash: "abcdef1234"`).

Ya están precargados 5 proyectos como ejemplo (Flores Navarro, Promise Me,
Reflections of Memory, Tikitaka x Input — AlemanBeatz Aftermovie, Night
Exterior Lighting and Camera Tests) — solo falta poner su `vimeoId` real y
las imágenes.

### Info
Edita directamente `info.html` (bio, disponibilidad, retrato en
`assets/images/info/portrait.jpg`).

### Index
Página separada de Home (`index.html`), a la que se llega pulsando la
palabra "Index" en cualquier menú del sitio. Es una ficha con cabecera de
datos + un listado tipo "tracklist" + dos fotos grandes abajo. **De
momento el listado se rellena automáticamente con los 5 proyectos de
`data/projects.json`** (mismo archivo que usa Film) a modo de contenido
provisional — solo cambia ese JSON si también quieres que cambie la lista
de Film. Las dos fotos de abajo son `assets/images/home/still-01.jpg` y
`still-02.jpg`. Esta página está en construcción: el diseño base ya está,
pero las animaciones/comportamiento todavía no se han definido.

## Previsualizar en local

No hace falta instalar nada si tienes Python:

```bash
cd /Users/andreuuv/Desktop/PaginaWEB
python3 -m http.server 8811
```

Y abre `http://localhost:8811` en el navegador. (Abrir los `.html` directamente
con doble clic **no funciona bien** porque el `fetch()` de los JSON de datos
necesita servirse por HTTP.)

## Desplegar (Netlify / Vercel / Cloudflare Pages)

Es un sitio 100% estático — no necesita build ni configuración especial.

1. Sube esta carpeta a un repositorio Git (GitHub/GitLab/Bitbucket).
2. En Netlify/Vercel/Cloudflare Pages: "Import project" → conecta el repo.
3. Build command: (vacío) — Publish/Output directory: `/` (raíz).
4. Cada `git push` vuelve a desplegar automáticamente.

```bash
cd /Users/andreuuv/Desktop/PaginaWEB
git init
git add .
git commit -m "Portfolio inicial"
```

(Luego conecta el remoto de GitHub y haz push cuando lo tengas listo.)

## Pendiente / próximos pasos

- [x] Vídeo de fondo de la home + ~~poster~~ (el poster `home-poster.jpg` sigue pendiente)
- [x] Fotografías reales (analog/digital) en `data/photos.json`
- [ ] Vimeo ID real de cada proyecto + miniaturas en `assets/images/film/`
- [ ] Clips cortos en loop (`assets/video/film/*-preview.mp4`) para la lista de Film
- [ ] Retrato en la página Info
- [ ] Dos fotos grandes de la página Index (`assets/images/home/still-01.jpg`, `still-02.jpg`)
- [ ] Definir animaciones/comportamiento de la página Index (diseño base ya está)
- [ ] Revisar/ajustar textos de bio y créditos
- [ ] (Fase posterior) Decap CMS para gestionar altas/bajas de proyectos sin tocar código
- [ ] Dominio/hosting definitivo

## Menú / navegación

El mismo menú aparece igual en **todas** las páginas del sitio (barra
superior, menú grande de Home y el overlay de móvil):

```
ANDREU VIRGIL · CINEMATOGRAPHY · PHOTOGRAPHY · ABOUT ME · INDEX
```

Tipografía monoespaciada en mayúsculas, superpuesta en claro sobre la home
(`css/home.css` + `.site-nav--overlay`) y en negro sobre blanco en el resto
de páginas (`.site-nav--light`). "ANDREU VIRGIL" lleva a `home.html`;
"INDEX" lleva a `index.html` (la ficha de trabajos seleccionados) — ya no
abre ningún overlay, es un enlace normal. En móvil la barra colapsa a
`ANDREU VIRGIL / MENU`; ese botón "Menu" sigue abriendo el overlay a
pantalla completa con el índice del sitio (Work/Studio), solo que ahora es
la única forma de abrirlo — en escritorio ya no hay overlay, todo son
enlaces directos.
