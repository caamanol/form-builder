# Despliegue en GitHub Pages

Este proyecto viene listo para publicarse en GitHub Pages usando GitHub Actions. Incluye rutas relativas, `base` dinámico en Vite y fallback SPA para soportar URLs profundas como `/<slug>`.

## 1) Requisitos

- Repositorio en GitHub con rama `main` (o `master`).
- Workflow en `.github/workflows/deploy.yml` (ya incluido).

## 2) Configurar Pages

1. En GitHub, abrí `Settings` → `Pages`.
2. En “Build and deployment”, elegí `Source: GitHub Actions`.

Listo, el workflow se encargará del build y publicación en cada push a `main`/`master`.

## 3) ¿Qué hace el workflow?

Archivo: `.github/workflows/deploy.yml`
- Instala dependencias y corre `npm run build`.
- Setea `BASE_PATH=/<repo>/` para Vite automáticamente (usa el nombre del repo).
- Copia `dist/index.html` a `dist/404.html` para habilitar fallback de SPA (deep links sin 404).
- Publica `dist/` en GitHub Pages.

## 4) Configuración de Vite para subcarpeta

Archivo: `vite.config.mjs`
- Usa `base: process.env.BASE_PATH || "/"`.
- El workflow define `BASE_PATH` de forma que el sitio funcione bajo `https://<usuario>.github.io/<repo>/`.
- `index.html` referencia los scripts en forma relativa (`./src/main.jsx`).

## 5) URLs importantes

- Builder (raíz): `https://<usuario>.github.io/<repo>/`
- Visor por slug: `https://<usuario>.github.io/<repo>/<slug>`
  - El slug se genera desde `meta.name` (espacios → `_`).
  - El almacenamiento local usa la clave `form:<slug>`, pero la URL es sólo `/<slug>`.

## 6) Prueba local con base simulada (opcional)

- `BASE_PATH=/formBuilder/ npm run build && npm run preview`
- Abre la URL que muestre el preview y verificá rutas.

## 7) Notas y troubleshooting

- Si ves 404 en rutas internas, confirmá que `404.html` existe en `dist/` (el workflow lo genera).
- Si el visor no encuentra un slug, revisá `localStorage` del navegador donde guardaste:
  - Claves disponibles: `localStorage` con prefijo `form:`.
- Para publicar formularios y consumir APIs externas, asegurá CORS en tu endpoint.

## 8) Deshabilitar Pages

- En `Settings` → `Pages`, cambiá `Source` a `Disabled` para detener publicaciones.

