import React from "react";

/**
 * SchemaOutput: Muestra el esquema JSON actual con validación básica
 * @param {{ schema: object }} props
 */
export default function SchemaOutput({ schema }) {
  let error = null;
  try {
    JSON.stringify(schema);
  } catch (e) {
    error = e.message;
  }
  return (
    <div className="schema-output">
      <h3>Vista previa del esquema</h3>
      <pre>{JSON.stringify(schema, replacerHidePrivates, 2)}</pre>
      {error && <div className="error">Error: {error}</div>}
    </div>
  );
}

function replacerHidePrivates(key, value) {
  if (key && key.startsWith("_")) return undefined;
  return value;
}
