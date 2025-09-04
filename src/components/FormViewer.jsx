import React from "react";
import { loadSchema, listSchemas } from "../utils/storage";
import FormPreview from "./FormPreview";

export default function FormViewer() {
  const base = (import.meta?.env?.BASE_URL || "/").replace(/\/*$/, "/");
  let path = window.location.pathname || "/";
  // Primero, intentar quitar BASE_URL
  if (base !== "/" && path.startsWith(base)) path = path.slice(base.length);
  // Fallback para GitHub Pages (host *.github.io): ignorar primer segmento (nombre del repo)
  if ((base === "/" || !path) && /github\.io$/.test(window.location.hostname)) {
    const parts = path.replace(/^\/+/, "").split("/").filter(Boolean);
    path = parts.slice(1).join("/");
  }
  const raw = (path || "").split(/[?#]/)[0];
  let slug = decodeURIComponent(raw).replace(/^\/+|\/+$/g, "");
  if (slug.startsWith("form:")) slug = slug.slice(5);
  const schema = slug ? loadSchema(slug) : null;

  if (!slug) {
    return (
      <div className="app-container">
        <h2>Falta slug</h2>
        <p>Usá una URL con el nombre guardado, por ejemplo: /mi_formulario</p>
      </div>
    );
  }

  if (!schema) {
    return (
      <div className="app-container">
        <h2>No encontrado</h2>
        <p>No existe un formulario guardado con el slug: <code>{slug}</code></p>
        <p>Guardados disponibles: {listSchemas().map(s => `/${s}`).join(", ") || "(ninguno)"}</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>{schema?.meta?.name || slug}</h1>
      <div className="panel">
        <FormPreview schema={schema} debug={false} />
      </div>
    </div>
  );
}
