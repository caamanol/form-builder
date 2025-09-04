import React from "react";
import ConditionBuilder from "./ConditionBuilder";

/**
 * FieldRow: Fila para editar un campo individual del formulario
 * @param {{ field: object, onChange: function, onDelete: function }} props
 */
export default function FieldRow({ field, onChange, onDelete, allFieldIds = [], dragProps = {}, isDragOver = false }) {
  const handleChange = (patch) => onChange({ ...field, ...patch });

  return (
    <div
      className={`field-row${isDragOver ? " drag-over" : ""}`}
      style={{ alignItems: "flex-start", flexDirection: "column" }}
      {...dragProps}
    >
      <div className="field-row-head">
        <input
          className="id-input"
          placeholder="ID"
          value={field.id}
          onChange={(e) => handleChange({ id: e.target.value })}
        />
        <input
          className="label-input"
          placeholder="Label"
          value={field.label}
          onChange={(e) => handleChange({ label: e.target.value })}
        />
        <span className="badge type-badge" title="Tipo de campo">
          {field.type}
        </span>
        <label className="req-toggle">
          <input
            type="checkbox"
            checked={!!field.required}
            onChange={(e) => handleChange({ required: e.target.checked })}
          />
          Requerido
        </label>
        <button onClick={onDelete} className="btn-danger delete-btn">Eliminar</button>
      </div>
      <div style={{ width: "100%", marginTop: "0.5rem" }}>
        <ConditionBuilder
          value={field.visibleWhen || { "==": [true, true] }}
          onChange={(val) => handleChange({ visibleWhen: val })}
          fields={allFieldIds}
        />
      </div>
      {field.type === "select" && (
        <SelectOptionsEditor field={field} onChange={onChange} />
      )}

      {/* Avanzado: edición JSON directa, escondida */}
      <details style={{ width: "100%", marginTop: 6 }}>
        <summary style={{ cursor: "pointer", color: "var(--muted)" }}>Avanzado: regla JSON</summary>
        <textarea
          rows={4}
          style={{ width: "100%", marginTop: 6 }}
          value={JSON.stringify(field.visibleWhen || { "==": [true, true] }, null, 2)}
          onChange={(e) => {
            try { handleChange({ visibleWhen: JSON.parse(e.target.value) }); } catch {}
          }}
        />
      </details>
    </div>
  );
}

function SelectOptionsEditor({ field, onChange }) {
  const options = Array.isArray(field.props?.options) ? field.props.options : [];

  const updateOptions = (next) => {
    const nextProps = { ...(field.props || {}), options: next };
    onChange({ ...field, props: nextProps });
  };

  const addOption = () => {
    updateOptions([...
      options,
      { label: `Opción ${options.length + 1}`, value: `opt_${options.length + 1}` },
    ]);
  };

  const updateOptionAt = (idx, patch) => {
    const next = options.map((opt, i) => (i === idx ? { ...opt, ...patch } : opt));
    updateOptions(next);
  };

  const removeOptionAt = (idx) => {
    const next = options.filter((_, i) => i !== idx);
    updateOptions(next);
  };

  return (
    <div style={{ width: "100%", marginTop: "0.5rem", padding: "0.5rem", background: "#fafafa", border: "1px solid #eee", borderRadius: 6 }}>
      <div style={{ marginBottom: 6 }}>
        <strong>Opciones del Select</strong>
      </div>
      {options.length === 0 && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>No hay opciones. Agregá al menos una.</div>
      )}
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <input
            placeholder="Label"
            value={opt.label ?? ""}
            onChange={(e) => updateOptionAt(idx, { label: e.target.value })}
            style={{ flex: 2 }}
          />
          <input
            placeholder="Value"
            value={opt.value ?? ""}
            onChange={(e) => updateOptionAt(idx, { value: e.target.value })}
            style={{ flex: 2 }}
          />
          <button onClick={() => removeOptionAt(idx)}>Eliminar</button>
        </div>
      ))}
      <button onClick={addOption}>Agregar opción</button>
    </div>
  );
}
