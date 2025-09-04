// utils/jsonLogicEngine.js
import jsonLogic from "json-logic-js";

/**
 * Evalúa la visibilidad de un campo usando JSON-Logic
 * @param {object} field
 * @param {object} formValues
 * @returns {boolean}
 */
export function evalVisible(field, formValues) {
  if (!field.visibleWhen) return true;
  try {
    return !!jsonLogic.apply(field.visibleWhen, formValues);
  } catch {
    return true;
  }
}

/**
 * Evalúa las reglas de validación de un campo
 * @param {object} field
 * @param {object} formValues
 * @returns {string[]} array de mensajes de error
 */
export function evalRules(field, formValues) {
  const errors = [];
  if (field.validate) {
    field.validate.forEach(rule => {
      if (rule.regex) {
        const re = new RegExp(rule.regex);
        if (!re.test(formValues[field.id] || "")) {
          errors.push(rule.message);
        }
      }
      if (rule.logic) {
        try {
          if (!jsonLogic.apply(rule.logic, formValues)) {
            errors.push(rule.message);
          }
        } catch {}
      }
    });
  }
  return errors;
}
