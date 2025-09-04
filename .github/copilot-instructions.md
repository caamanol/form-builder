🧭 Copilot Instructions – JSON‑Logic Form Builder & Renderer (React)

Objetivo: construir una app (Vite + React) que permita diseñar esquemas basados en JSON‑Logic y renderizar formularios desde esos esquemas. Los formularios renderizados deben enviar un POST a target.uri con los datos del usuario.

📦 Alcance mínimo (MVP)
	1.	FormBuilder (editor visual de esquema)
	•	Agregar/editar/eliminar campos.
	•	Editar reglas de visibilidad/validación con JSON‑Logic.
	•	Definir target.uri, method (POST por defecto) y headers opcionales.
	•	Vista previa JSON del esquema con validación básica.
	2.	FormRenderer (runtime)
	•	Renderizar campos según type y props.
	•	Evaluar visibilidad y validaciones vía JSON‑Logic (lib json-logic-js).
	•	Enviar POST a target.uri con el payload construido desde los valores actuales del formulario.
	•	Manejo de estados: idle → submitting → success/error.
	3.	Persistencia temporal
	•	Guardar/leer el esquema actual desde localStorage.

🧱 Modelo de Esquema (contrato)

{
  "meta": {
    "name": "string",
    "version": 1
  },
  "target": {
    "uri": "https://api.example.com/endpoint",
    "method": "POST",
    "headers": { "Content-Type": "application/json" }
  },
  "fields": [
    {
      "id": "email",
      "label": "Email",
      "type": "text",
      "props": { "placeholder": "tu@correo.com" },
      "required": true,
      "visibleWhen": { "==": [true, true] },
      "validate": [
        { "regex": "^.+@.+\\..+$", "message": "Email inválido" }
      ]
    },
    {
      "id": "edad",
      "label": "Edad",
      "type": "number",
      "props": { "min": 0 },
      "visibleWhen": { ">=": [ { "var": "edad" }, 0 ] }
    },
    {
      "id": "provincia",
      "label": "Provincia",
      "type": "select",
      "options": [
        { "value": "BA", "label": "Buenos Aires" },
        { "value": "CB", "label": "Córdoba" }
      ]
    },
    {
      "id": "cuit",
      "label": "CUIT",
      "type": "text",
      "visibleWhen": { "==": [ { "var": "provincia" }, "BA" ] },
      "validate": [
        { "regex": "^[0-9]{11}$", "message": "CUIT debe tener 11 dígitos" }
      ]
    }
  ]
}

Tipos soportados (MVP)
	•	text, number, textarea, checkbox, select (con options: [{value,label}]), date.

Reglas JSON‑Logic
	•	visibleWhen: expresión JSON‑Logic; si es falsy → ocultar campo.
	•	validate: lista de reglas {regex,message} (mínimo) y, opcionalmente, reglas lógicas como {">": [{"var":"edad"}, 17]} con message.

🧩 Detalles de implementación
	•	Paquetes: react, react-dom, json-logic-js.
	•	Estado: usar useState/useReducer. Evitar dependencias globales.
	•	Evaluación: crear utils/jsonLogicEngine.js con helpers:
	•	evalVisible(field, formValues) → boolean.
	•	evalRules(field, formValues) → array de errores.
	•	Accesibilidad: asociar label a id, aria-invalid cuando corresponda.
	•	Errores: mostrar mensajes bajo cada campo; bloquear submit si hay errores.
	•	POST: fetch(target.uri, { method, headers, body: JSON.stringify(values) }).
	•	UX: spinner en submitting, toasts simples (alert) en success/error.
	•	Guardado: localStorage.setItem('schema', JSON.stringify(schema)).

🧪 Criterios de aceptación
	•	Puedo crear un campo, verlo en la vista previa del esquema y renderizarlo.
	•	Las reglas visibleWhen afectan el DOM en tiempo real al cambiar valores.
	•	Las validaciones bloquean el submit y muestran mensajes.
	•	El submit hace POST a target.uri y refleja success/error.
	•	El esquema persiste entre recargas vía localStorage.

🗂️ Estructura esperada

src/
  App.jsx
  components/
    FormBuilder.jsx
    FieldRow.jsx
    LogicEditor.jsx
    SchemaOutput.jsx
    FormRenderer.jsx
  utils/
    jsonLogicEngine.js
  styles.css

🔧 Estándares de código
	•	Funcionales con hooks; componentes chicos y puros.
	•	Props tipadas con JSDoc; comments breves en funciones públicas.
	•	Sin librerías UI externas; usar CSS simple.

⸻
