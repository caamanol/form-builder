import React, { useMemo, useState } from "react";
import FieldRow from "./FieldRow";
import FormPreview from "./FormPreview";
import FieldPalette from "./FieldPalette";
import FormSettings from "./FormSettings";
import { saveSchema, slugifyName } from "../utils/storage";

/**
 * FormBuilder: Editor visual para crear y editar esquemas de formularios JSON-Logic
 */
export default function FormBuilder() {
  // Estado del esquema
  const [schema, setSchema] = useState({
    meta: { name: "Nuevo Formulario", version: 1 },
    target: { uri: "", method: "POST", headers: { "Content-Type": "application/json" } },
    fields: []
  });
  const [savedSlug, setSavedSlug] = useState("");

  // Estado para nuevo campo
  const [newField, setNewField] = useState({
    id: "",
    label: "",
    type: "text",
    props: {},
    required: false,
    visibleWhen: { "==": [true, true] },
    validate: []
  });

  // Agregar campo
  function handleAddField() {
    if (!newField.id || !newField.label) return;
    setSchema(s => ({
      ...s,
      fields: [...s.fields, { _uid: genUid(), ...newField }]
    }));
    setNewField({
      id: "",
      label: "",
      type: "text",
      props: {},
      required: false,
      visibleWhen: { "==": [true, true] },
      validate: []
    });
  }

  // UID estable para claves de render
  function genUid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Editar campo
  function handleFieldChange(idx, field) {
    setSchema(s => {
      const fields = [...s.fields];
      fields[idx] = field;
      return { ...s, fields };
    });
  }

  // Eliminar campo
  function handleDeleteField(idx) {
    setSchema(s => {
      const fields = s.fields.filter((_, i) => i !== idx);
      return { ...s, fields };
    });
  }

  // Drag & Drop: crear campos desde el palette
  function genUniqueId(base) {
    const existing = new Set(schema.fields.map(f => f.id));
    let i = 1;
    let candidate = base;
    while (!candidate || existing.has(candidate)) {
      candidate = `${base}-${i++}`;
    }
    return candidate;
  }

  function addFieldOfType(type) {
    const id = genUniqueId(type);
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const field = {
      _uid: genUid(),
      id,
      label,
      type,
      props: type === "select" ? { options: [] } : {},
      required: false,
      visibleWhen: { "==": [true, true] },
      validate: [],
    };
    setSchema(s => ({ ...s, fields: [...s.fields, field] }));
  }

  function addFieldOfTypeAt(type, index) {
    const id = genUniqueId(type);
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const field = {
      _uid: genUid(),
      id,
      label,
      type,
      props: type === "select" ? { options: [] } : {},
      required: false,
      visibleWhen: { "==": [true, true] },
      validate: [],
    };
    setSchema(s => {
      const next = [...s.fields];
      const i = Math.max(0, Math.min(index, next.length));
      next.splice(i, 0, field);
      return { ...s, fields: next };
    });
  }

  const [isOver, setIsOver] = useState(false);
  const [overIndex, setOverIndex] = useState(null);
  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isOver) setIsOver(true);
  }
  function handleDragLeave() {
    setIsOver(false);
  }
  function handleDrop(e) {
    e.preventDefault();
    setIsOver(false);
    const raw = e.dataTransfer.getData("application/x-formbuilder") || e.dataTransfer.getData("text/plain");
    try {
      const data = JSON.parse(raw);
      if (data?.kind === "new-field" && data.type) {
        addFieldOfType(data.type);
      } else if (data?.kind === "move-field" && data.uid) {
        // Mover al final si se suelta en el fondo de la lista
        reorderByUid(data.uid, schema.fields.length);
      }
    } catch {}
  }

  function handleRowDragOver(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    setOverIndex(idx);
  }

  function handleRowDragLeave() {
    setOverIndex(null);
  }

  function handleRowDrop(e, idx) {
    e.preventDefault();
    e.stopPropagation();
    setOverIndex(null);
    const raw = e.dataTransfer.getData("application/x-formbuilder") || e.dataTransfer.getData("text/plain");
    try {
      const data = JSON.parse(raw);
      if (data?.kind === "move-field" && data.uid) {
        reorderByUid(data.uid, idx);
      } else if (data?.kind === "new-field" && data.type) {
        addFieldOfTypeAt(data.type, idx + 1);
      }
    } catch {}
  }

  function reorderByUid(uid, targetIndex) {
    setSchema(s => {
      const arr = [...s.fields];
      const from = arr.findIndex(f => f._uid === uid);
      if (from === -1) return s;
      let to = Math.max(0, Math.min(targetIndex, arr.length));
      const [moved] = arr.splice(from, 1);
      // Ajustar índice si se arrastra hacia adelante
      if (from < to) to = to - 1;
      arr.splice(to, 0, moved);
      return { ...s, fields: arr };
    });
  }

  return (
    <div className="form-builder">
      <div className="builder-header">
        <h2>Editor de Esquema</h2>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => {
            const slug = saveSchema(schema);
            if (slug) {
              setSavedSlug(slug);
            } else {
              alert("No se pudo guardar en este navegador.");
            }
          }}>Guardar</button>
          {savedSlug && (
            <a className="btn-ghost" href={`/${savedSlug}`} target="_blank" rel="noreferrer">
              Abrir /{savedSlug}
            </a>
          )}
        </div>
      </div>
      <div className="builder-grid">
        {/* Columna izquierda: Configuración y Palette */}
        <div className="builder-col left sticky">
          <div className="panel">
            <div className="panel-header">Configuración</div>
            <FormSettings value={schema} onChange={(next) => setSchema(next)} />
          </div>
          <div className="panel">
            <div className="panel-header">Tipos (arrastrar)</div>
            <FieldPalette />
          </div>
        </div>

        {/* Columna central: Canvas de diseño */}
        <div className="builder-col center">
          <div className="panel">
            <div className="panel-header">Diseño del formulario</div>
            <div
              className={`fields-list dropzone ${isOver ? "is-over" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {schema.fields.map((field, idx) => (
                <FieldRow
                  key={field._uid || field.id}
                  field={field}
                  onChange={updated => handleFieldChange(idx, updated)}
                  onDelete={() => handleDeleteField(idx)}
                  allFieldIds={schema.fields.map(f => f.id)}
                  dragProps={{
                    draggable: true,
                    onDragStart: (e) => {
                      e.dataTransfer.setData(
                        "application/x-formbuilder",
                        JSON.stringify({ kind: "move-field", uid: field._uid })
                      );
                      e.dataTransfer.setData("text/plain", JSON.stringify({ kind: "move-field", uid: field._uid }));
                      e.dataTransfer.effectAllowed = "move";
                    },
                    onDragOver: (e) => handleRowDragOver(e, idx),
                    onDragLeave: handleRowDragLeave,
                    onDrop: (e) => handleRowDrop(e, idx),
                  }}
                  isDragOver={overIndex === idx}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Columna derecha: Preview */}
        <div className="builder-col right sticky">
          <div className="panel">
            <div className="panel-header">Vista previa</div>
            <FormPreview schema={schema} />
          </div>
        </div>
      </div>
    </div>
  );
}
