import React from "react";

const TYPES = [
  { type: "text", label: "Text" },
  { type: "number", label: "Number" },
  { type: "textarea", label: "Textarea" },
  { type: "checkbox", label: "Checkbox" },
  { type: "select", label: "Select" },
  { type: "date", label: "Date" },
];

export default function FieldPalette() {
  const onDragStart = (e, type) => {
    const payload = { kind: "new-field", type };
    e.dataTransfer.setData("application/x-formbuilder", JSON.stringify(payload));
    e.dataTransfer.setData("text/plain", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
      {TYPES.map((t) => (
        <div
          key={t.type}
          draggable
          onDragStart={(e) => onDragStart(e, t.type)}
          title={`Arrastrar para crear ${t.label}`}
          style={{
            padding: "0.5rem 0.75rem",
            border: "1px solid #ddd",
            borderRadius: 6,
            background: "#fafafa",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          {t.label}
        </div>
      ))}
    </div>
  );
}

