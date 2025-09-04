import React, { useEffect, useMemo, useState } from "react";

/**
 * ConditionBuilder: constructor simple tipo Google Forms
 * value: regla JSON-Logic
 * onChange: (regla) => void
 * fields: string[]
 */
export default function ConditionBuilder({ value, onChange, fields = [] }) {
  const visual = useMemo(() => toVisualModel(value) || { combinator: "and", conditions: [] }, [value]);
  const [comb, setComb] = useState(visual.combinator);
  const [conds, setConds] = useState(visual.conditions);

  useEffect(() => {
    const v = toVisualModel(value);
    if (v) {
      setComb(v.combinator);
      setConds(v.conditions);
    }
  }, [value]);

  function apply(nextComb, nextConds) {
    const logic = fromVisualModel({ combinator: nextComb, conditions: nextConds });
    onChange(logic);
  }

  const addCond = () => {
    const next = [...conds, { field: fields[0] || "", op: "==", value: "" }];
    setConds(next);
    apply(comb, next);
  };
  const updateCond = (idx, patch) => {
    const next = conds.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setConds(next);
    apply(comb, next);
  };
  const removeCond = (idx) => {
    const next = conds.filter((_, i) => i !== idx);
    setConds(next);
    apply(comb, next);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--muted)", fontWeight: 600 }}>Mostrar cuando</span>
        <div style={{ display: "inline-flex", border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
          <button
            type="button"
            onClick={() => { setComb("and"); apply("and", conds); }}
            style={segStyle(comb === "and")}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => { setComb("or"); apply("or", conds); }}
            style={segStyle(comb === "or")}
          >
            Alguna
          </button>
        </div>
        <button type="button" onClick={addCond}>Agregar</button>
      </div>

      {conds.length === 0 && (
        <div style={{ fontSize: 12, color: "#6b7c93" }}>Sin condiciones: el campo será visible siempre.</div>
      )}

      {conds.map((c, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 140px 1fr auto", gap: 8, alignItems: "center" }}>
          <select value={c.field} onChange={(e) => updateCond(idx, { field: e.target.value })}>
            <option value="">Campo…</option>
            {fields.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select value={c.op} onChange={(e) => updateCond(idx, { op: e.target.value })}>
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
          />
          <button type="button" onClick={() => removeCond(idx)} style={{ justifySelf: "end" }}>Eliminar</button>
        </div>
      ))}
    </div>
  );
}

function segStyle(active) {
  return {
    background: active ? "var(--primary)" : "transparent",
    color: active ? "#fff" : "var(--text)",
    border: "none",
    padding: "6px 10px",
    fontWeight: 600,
  };
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
    case "==": return { "==": [left, right] };
    case "!=": return { "!=": [left, right] };
    case ">": return { ">": [left, right] };
    case ">=": return { ">=": [left, right] };
    case "<": return { "<": [left, right] };
    case "<=": return { "<=": [left, right] };
    case "in": return { in: [right, left] };
    default: return null;
  }
}

function toVisualModel(json) {
  if (!json || typeof json !== "object") return null;
  const [comb, items] = detectComb(json);
  if (!comb || !Array.isArray(items)) return null;
  const conditions = [];
  for (const it of items) {
    const parsed = parseClause(it);
    if (!parsed) return null; // si no es soportada, abortar
    conditions.push(parsed);
  }
  return { combinator: comb, conditions };
}

function detectComb(obj) {
  if (obj.and && Array.isArray(obj.and)) return ["and", obj.and];
  if (obj.or && Array.isArray(obj.or)) return ["or", obj.or];
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

