import React, { useEffect, useState } from "react";

export default function FormSettings({ value, onChange }) {
  const schema = value || {};
  const meta = schema.meta || {};
  const target = schema.target || {};

  const [rows, setRows] = useState(() => entriesToRows(target.headers || {}));

  useEffect(() => {
    setRows(entriesToRows((schema.target && schema.target.headers) || {}));
  }, [schema.target?.headers]);

  function updateMeta(patch) {
    onChange({ ...schema, meta: { ...meta, ...patch } });
  }

  function updateTarget(patch) {
    onChange({ ...schema, target: { ...target, ...patch } });
  }

  function applyRows(nextRows) {
    setRows(nextRows);
    const headers = {};
    nextRows.forEach((r) => {
      const k = String(r.k || "").trim();
      if (k) headers[k] = r.v ?? "";
    });
    updateTarget({ headers });
  }

  function addRow() {
    applyRows([...rows, { id: genId(), k: "", v: "" }]);
  }
  function removeRow(id) {
    applyRows(rows.filter((r) => r.id !== id));
  }
  function updateRow(id, patch) {
    applyRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  return (
    <div className="form-settings" style={{ marginBottom: "1rem" }}>
      <h3 style={{ marginBottom: 8 }}>Configuración</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--muted)", fontWeight: 600 }}>Nombre del formulario</label>
          <input
            placeholder="Nuevo Formulario"
            value={meta.name ?? ""}
            onChange={(e) => updateMeta({ name: e.target.value })}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--muted)", fontWeight: 600 }}>Versión</label>
          <input
            type="number"
            min={1}
            value={meta.version ?? 1}
            onChange={(e) => updateMeta({ version: Number(e.target.value) || 1 })}
          />
        </div>
        <div style={{ gridColumn: "1 / span 2" }}>
          <label style={{ display: "block", marginBottom: 6, color: "var(--muted)", fontWeight: 600 }}>Destino (URI)</label>
          <input
            placeholder="https://api.ejemplo.com/endpoint"
            value={target.uri ?? ""}
            onChange={(e) => updateTarget({ uri: e.target.value })}
          />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, color: "var(--muted)", fontWeight: 600 }}>Método</label>
          <select value={target.method ?? "POST"} onChange={(e) => updateTarget({ method: e.target.value })}>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
            <option>DELETE</option>
          </select>
        </div>
      </div>

      <div className="headers-editor" style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <strong>Headers</strong>
          <button type="button" onClick={addRow}>Agregar header</button>
        </div>
        {rows.length === 0 && (
          <div style={{ fontSize: 12, color: "#6b7c93" }}>No hay headers</div>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) auto",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              overflow: "hidden",
            }}
          >
            <input placeholder="Nombre (p.ej., Content-Type)" value={r.k} onChange={(e) => updateRow(r.id, { k: e.target.value })} />
            <input placeholder="Valor (p.ej., application/json)" value={r.v} onChange={(e) => updateRow(r.id, { v: e.target.value })} />
            <button type="button" onClick={() => removeRow(r.id)}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function genId() {
  return Math.random().toString(36).slice(2);
}

function entriesToRows(obj) {
  const rows = [];
  for (const [k, v] of Object.entries(obj || {})) {
    rows.push({ id: k || genId(), k, v });
  }
  return rows;
}
