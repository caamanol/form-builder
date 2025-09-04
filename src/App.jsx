import React from "react";
import FormBuilder from "./components/FormBuilder";
import FormViewer from "./components/FormViewer";
import "./styles.css";

export default function App() {
  const slug = typeof window !== "undefined" ? window.location.pathname.replace(/^\//, "") : "";
  if (slug && !slug.includes("form-builder")) {
    return <FormViewer />;
  }
  return (
    <div className="app-container">
      <h1>JSON-Logic Form Builder</h1>
      <FormBuilder />
    </div>
  );
}
