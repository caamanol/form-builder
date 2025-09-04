import React from "react";
import FormBuilder from "./components/FormBuilder";
import FormViewer from "./components/FormViewer";
import "./styles.css";

export default function App() {
  const slug = getSlugFromLocation();
  if (slug) return <FormViewer />;
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
  // Quitar prefijo base (por ejemplo, /form-builder/ en GitHub Pages)
  if (base !== "/" && pathname.startsWith(base)) {
    pathname = pathname.slice(base.length);
  } else if (/github\.io$/.test(window.location.hostname)) {
    // Fallback: host *.github.io → ignorar primer segmento (nombre del repo)
    const parts = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
    pathname = parts.slice(1).join("/");
  }
  // Normalizar y decidir
  const slug = decodeURIComponent(pathname).replace(/^\/+|\/+$/g, "");
  return slug === "" || slug === "index.html" ? "" : slug;
}
