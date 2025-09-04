import React, { useEffect, useMemo, useState } from "react";

/**
 * LogicEditor: Editor visual y JSON para reglas JSON-Logic
 * @param {{ value: object, onChange: function, fields?: string[] }} props
 */
export default function LogicEditor({ value, onChange, fields = [] }) {
  const parsedVisual = useMemo(() => toVisualModel(value), [value]);
  const [mode, setMode] = useState(parsedVisual ? "visual" : "json");
  const [vComb, setVComb] = useState(parsedVisual?.combinator || "and");
  const [vConds, setVConds] = useState(parsedVisual?.conditions || []);

  useEffect(() => {
    // Si cambia el value externo y es parseable, sincronizar el visual
    const v = toVisualModel(value);
    if (v) {
      setVComb(v.combinator);
      setVConds(v.conditions);
    }
  }, [value]);

  const jsonText = useMemo(() => JSON.stringify(value, null, 2), [value]);

  const applyVisual = (nextComb, nextConds) => {
    const logic = fromVisualModel({ combinator: nextComb, conditions: nextConds });
    onChange(logic);
  };

  const addCond = () => {
    const next = [...vConds, { field: fields[0] || "", op: "==", value: "" }];
    setVConds(next);
    applyVisual(vComb, next);
  };
  const updateCond = (idx, patch) => {
    const next = vConds.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setVConds(next);
    applyVisual(vComb, next);
  };
  const removeCond = (idx) => {
    const next = vConds.filter((_, i) => i !== idx);
    setVConds(next);
    applyVisual(vComb, next);
  };

  const switchTo = (m) => setMode(m);

  return (
    <div className="logic-editor">
      <div className="tabs" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button
          type="button"
          className={`tab ${mode === "visual" ? "active" : ""}`}
          onClick={() => switchTo("visual")}
          style={tabStyle(mode === "visual")}
        >
          Visual
        </button>
        <button
          type="button"
          className={`tab ${mode === "json" ? "active" : ""}`}
          onClick={() => switchTo("json")}
          style={tabStyle(mode === "json")}
        >
          JSON
        </button>
      </div>

      {mode === "visual" ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ color: "var(--muted)" }}>Combinador</span>
            <select
              value={vComb}
              onChange={(e) => {
                setVComb(e.target.value);
                applyVisual(e.target.value, vConds);
              }}
              style={{ width: 140 }}
            >
              <option value="and">AND (todas)</option>
              <option value="or">OR (alguna)</option>
            </select>
            <button type="button" onClick={addCond}>Agregar condición</button>
          </div>

          {vConds.length === 0 && (
            <div style={{ fontSize: 12, color: "#6b7c93", marginBottom: 8 }}>
              No hay condiciones. Usaremos “siempre visible”.
            </div>
          )}

          {vConds.map((c, idx) => (
            <div key={idx} className="condition-row" style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <select value={c.field} onChange={(e) => updateCond(idx, { field: e.target.value })} style={{ minWidth: 140 }}>
                <option value="">Campo…</option>
                {fields.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <select value={c.op} onChange={(e) => updateCond(idx, { op: e.target.value })} style={{ minWidth: 130 }}>
                <option value="==">=</option>
                <option value="!=">≠</option>
                <option value=">">&gt;</option>
                <option value=">=">≥</option>
                <option value="<">&lt;</option>
                <option value="<=">≤</option>
                <option value="in">contiene</option>
              </select>
              <input
                placeholder="Valor"
                value={String(c.value ?? "")}
                onChange={(e) => updateCond(idx, { value: e.target.value })}
                style={{ flex: 1 }}
              />
              <button type="button" onClick={() => removeCond(idx)}>Eliminar</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <label style={{ display: "block", marginBottom: 6 }}>Regla JSON-Logic</label>
          <textarea
            value={jsonText}
            onChange={(e) => {
              try {
                onChange(JSON.parse(e.target.value));
              } catch {
                // ignorar error
              }
            }}
            rows={6}
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}

function tryParsePrimitive(str) {
  const s = String(str);
  if (s === "true") return true;
  if (s === "false") return false;
  if (s === "null") return null;
  if (s === "") return "";
  const n = Number(s);
  return Number.isNaN(n) ? s : n;
}

function fromVisualModel(model) {
  const { combinator, conditions } = model || {};
  if (!conditions || conditions.length === 0) return { "==": [true, true] };
  const arr = conditions
    .filter((c) => c.field)
    .map((c) => toClause(c))
    .filter(Boolean);
  if (arr.length === 0) return { "==": [true, true] };
  return combinator === "or" ? { or: arr } : { and: arr };
}

function toClause(c) {
  const left = { var: c.field };
  const right = tryParsePrimitive(c.value);
  switch (c.op) {
    case "==":
      return { "==": [left, right] };
    case "!=":
      return { "!=": [left, right] };
    case ">":
      return { ">": [left, right] };
    case ">=":
      return { ">=": [left, right] };
    case "<":
      return { "<": [left, right] };
    case "<=":
      return { "<=": [left, right] };
    case "in":
      // right in leftValue?  Queremos value in var(array or string)
      return { in: [right, left] };
    default:
      return null;
  }
}

function toVisualModel(json) {
  if (!json || typeof json !== "object") return null;
  const [comb, items] = detectComb(json);
  if (!comb || !Array.isArray(items)) return null;
  const conditions = [];
  for (const it of items) {
    const parsed = parseClause(it);
    if (!parsed) return null; // si alguna no es soportada, abortar parseo
    conditions.push(parsed);
  }
  return { combinator: comb, conditions };
}

function detectComb(obj) {
  if (obj.and && Array.isArray(obj.and)) return ["and", obj.and];
  if (obj.or && Array.isArray(obj.or)) return ["or", obj.or];
  // también aceptar una sola cláusula como AND de 1
  const single = parseClause(obj);
  if (single) return ["and", [obj]];
  return [null, null];
}

function parseClause(obj) {
  if (!obj || typeof obj !== "object") return null;
  const op = Object.keys(obj)[0];
  const args = obj[op];
  if (!Array.isArray(args)) return null;

  if (["==", "!=", ">", ">=", "<", "<="].includes(op)) {
    const [a, b] = args;
    const v = extractVar(a);
    if (!v) return null;
    return { field: v, op, value: toInputString(b) };
  }
  if (op === "in") {
    const [needle, hay] = args;
    const v = extractVar(hay);
    if (!v) return null;
    return { field: v, op: "in", value: toInputString(needle) };
  }
  return null;
}

function extractVar(x) {
  if (x && typeof x === "object" && Object.prototype.hasOwnProperty.call(x, "var")) {
    return x.var;
  }
  return null;
}

function toInputString(v) {
  if (typeof v === "string") return v;
  if (v === null) return "null";
  if (typeof v === "boolean") return v ? "true" : "false";
  if (typeof v === "number") return String(v);
  try { return JSON.stringify(v); } catch { return String(v); }
}

function tabStyle(active) {
  return {
    background: active ? "var(--primary)" : "#eef4ff",
    color: active ? "#fff" : "var(--text)",
    border: active ? "1px solid var(--primary-600)" : "1px solid var(--border)",
    borderRadius: 10,
    padding: "6px 10px",
    fontWeight: 600,
  };
}
