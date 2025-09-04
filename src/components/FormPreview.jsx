import React, { useMemo, useState } from "react";
import { evalVisible, evalRules } from "../utils/jsonLogicEngine";

/**
 * FormPreview: Renderiza un formulario live basado en el esquema y aplica JSON-Logic
 * @param {{ schema: {fields: any[] }, debug?: boolean }} props
 */
export default function FormPreview({ schema, debug = true }) {
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitErr, setSubmitErr] = useState("");

  const visibleFields = useMemo(() => {
    return (schema?.fields || []).filter((f) => evalVisible(f, values));
  }, [schema, values]);

  const errorsByField = useMemo(() => {
    const map = {};
    (schema?.fields || []).forEach((f) => {
      if (!evalVisible(f, values)) return;
      const errs = [...evalRules(f, values)];
      if (f.required) {
        const v = values[f.id];
        const empty = v === undefined || v === null || v === "";
        if (empty) errs.push("Requerido");
      }
      if (errs.length) map[f.id] = errs;
    });
    return map;
  }, [schema, values]);

  const onChange = (id, raw) => {
    setValues((v) => ({ ...v, [id]: raw }));
  };

  const canSubmit = useMemo(() => {
    const hasErrors = Object.keys(errorsByField).length > 0;
    const uri = schema?.target?.uri;
    return !!uri && !hasErrors && !submitting;
  }, [errorsByField, schema, submitting]);

  async function handleSubmit(e) {
    e?.preventDefault?.();
    setSubmitMsg("");
    setSubmitErr("");
    const uri = schema?.target?.uri;
    const method = (schema?.target?.method || "POST").toUpperCase();
    const headers = { ...(schema?.target?.headers || {}) };
    if (!headers["Content-Type"]) headers["Content-Type"] = "application/json";

    // Evitar envío si hay errores de validación
    if (Object.keys(errorsByField).length > 0) {
      setSubmitErr("Corre los errores antes de enviar.");
      return;
    }
    if (!uri) {
      setSubmitErr("No hay destino configurado (target.uri)");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch(uri, {
        method,
        headers,
        body: method === "GET" ? undefined : JSON.stringify({ meta: schema?.meta, data: values }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
      setSubmitMsg("Enviado con éxito");
      if (debug) {
        console.info("Respuesta del servidor:", text);
      }
    } catch (err) {
      setSubmitErr(String(err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-preview" style={{ marginTop: "1rem" }}>
      {debug && <h3>Vista previa (JSON-Logic en vivo)</h3>}
      {visibleFields.length === 0 && <div>No hay campos visibles con las reglas actuales.</div>}
      <form onSubmit={handleSubmit}>
        {visibleFields.map((f) => (
          <div key={f.id} style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              {f.label} {f.required && <span style={{ color: "#c00" }}>*</span>}
            </label>
            <FieldInput field={f} value={values[f.id]} onChange={(val) => onChange(f.id, val)} />
            {errorsByField[f.id]?.map((e, i) => (
              <div key={i} className="error" style={{ fontSize: 12 }}>
                {e}
              </div>
            ))}
          </div>
        ))}
        <div>
          <button type="submit" disabled={!canSubmit} style={{ opacity: canSubmit ? 1 : 0.6 }}>
            {submitting ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </form>
      {submitMsg && <div className="alert-success" style={{ marginTop: 8 }}>{submitMsg}</div>}
      {submitErr && <div className="error" style={{ marginTop: 8 }}>{submitErr}</div>}
      {debug && (
        <div className="schema-output" style={{ marginTop: "1rem" }}>
          <strong>Valores actuales:</strong>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }) {
  const common = { value: value ?? "", onChange: (e) => onChange(e.target.value) };
  switch (field.type) {
    case "number":
      return (
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );
    case "textarea":
      return <textarea {...common} rows={3} style={{ width: "100%" }} />;
    case "checkbox":
      return (
        <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          {field.props?.hint || ""}
        </label>
      );
    case "select":
      return (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">Seleccionar...</option>
          {(field.props?.options || []).map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "date":
      return <input type="date" value={value ?? ""} onChange={(e) => onChange(e.target.value)} />;
    default:
      return <input type="text" {...common} />;
  }
}
