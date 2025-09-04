# JSON‑Logic Form Builder

Editor visual para construir formularios basados en reglas JSON‑Logic, con vista previa en vivo y publicación simple vía URL.

## Características

- Constructor de campos con drag & drop (Text, Number, Textarea, Checkbox, Select, Date).
- Reordenar campos por arrastrar y soltar en el lienzo.
- Editor de visibilidad “tipo Google Forms”: Mostrar cuando [Todas/Alguna] y condiciones campo/operador/valor.
- Editor de opciones para `Select` (agregar, editar y eliminar opciones).
- Configuración del formulario: `meta.name`, `meta.version`, `target.uri`, `target.method`, `target.headers`.
- Vista previa en vivo con validaciones (requeridos, reglas custom) y botón de envío.
- Envío configurable: método, headers y payload `{ meta, data }` (JSON por defecto).
- Guardado local: persiste en `localStorage` y genera una URL por slug para ver/compartir el formulario.
- Layout responsive 3 columnas: Configuración | Diseño | Vista previa.

## Scripts

- `npm run dev`: levanta Vite en modo desarrollo.
- `npm run build`: compila a producción en `dist/`.
- `npm run preview`: sirve `dist/` localmente.

## Estructura rápida

- `src/components/FormBuilder.jsx`: layout de 3 columnas, drag & drop y acciones (Guardar).
- `src/components/FieldRow.jsx`: edición de cada campo (ID, Label, tipo, requerido, condiciones, opciones de Select).
- `src/components/ConditionBuilder.jsx`: constructor visual de condiciones AND/OR.
- `src/components/FormPreview.jsx`: render y validación; botón Enviar (usa `target.*`).
- `src/components/FormViewer.jsx`: modo visor por slug en la URL.
- `src/utils/jsonLogicEngine.js`: helpers para evaluar visibilidad y reglas.
- `src/utils/storage.js`: `saveSchema/loadSchema/listSchemas` y `slugifyName`.
- `src/styles.css`: tema y utilidades.

## Guardado y URLs por slug

- Al presionar **Guardar** se persiste el esquema con clave `form:<slug>` en `localStorage`.
- El slug se genera desde `meta.name` (minúsculas, espacios → `_`, caracteres no válidos removidos).
- Luego de guardar aparece un enlace `/<slug>` para abrir el visor.
- En producción (GitHub Pages) la URL completa será `https://<usuario>.github.io/<repo>/<slug>`.

## Modo visor vs desarrollo

- En la ruta raíz se muestra el builder y, en la vista previa, elementos de depuración (título y valores actuales).
- En ruta con slug (`/<slug>`), el visor oculta depuración y muestra sólo el formulario listo para usar.

## Consideraciones de envío (submit)

- `FormPreview` envía a `target.uri` con método `target.method` y `target.headers`.
- Por defecto agrega `Content-Type: application/json` si no se configuró.
- Envío bloqueado si hay errores de validación o faltan requeridos.
- Si el endpoint es externo, asegurá CORS en el servidor.

## Despliegue

Consulta `DEPLOY.md` para publicar en GitHub Pages (workflow incluido).

## Roadmap sugerido

- Duplicar campo y eliminación con confirmación.
- Reordenamiento de opciones del Select por drag & drop.
- Validación visual de IDs vacíos/repetidos.
- Exportar/Importar JSON de esquema.

