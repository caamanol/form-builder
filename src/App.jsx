import React from "react";
import FormBuilder from "./components/FormBuilder";
import FormViewer from "./components/FormViewer";
import "./styles.css";

export default function App() {
  const slug = getSlugFromLocation();
  if (slug && !slug.includes("form-builder")) return <FormViewer />;
  return (
    <div className="app-container">
      <h1>JSON-Logic Form Builder</h1>
      <FormBuilder />
    </div>
  );
}

function getSlugFromLocation() {
  if (typeof window === "undefined") return "";
  const base = (import.meta?.env?.BASE_URL || "/").replace(/\/*$/, "/");
  let pathname = window.location.pathname || "/";
  // Quitar prefijo base (e.g., /form-builder/ en GitHub Pages)
  if (pathname.startsWith(base)) pathname = pathname.slice(base.length);
  // Fallback robusto para GitHub Pages: si host termina con github.io, ignorar primer segmento (nombre del repo)
  if (/github\.io$/.test(window.location.hostname)) {
    const parts = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
    if (parts.length <= 1) {
      pathname = parts[0] || ""; // raíz → ""
    } else {
      pathname = parts.slice(1).join("/");
    }
  }
  // Normalizar
  let slug = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "");
  if (slug === "index.html") slug = "";
  return slug;
}
