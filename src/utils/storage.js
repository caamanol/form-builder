export function slugifyName(name = "") {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_\-]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const PREFIX = "form:";

export function saveSchema(schema) {
  const name = schema?.meta?.name || "formulario";
  const slug = slugifyName(name) || "formulario";
  try {
    localStorage.setItem(PREFIX + slug, JSON.stringify(schema));
    return slug;
  } catch {
    return null;
  }
}

export function loadSchema(slug) {
  try {
    const raw = localStorage.getItem(PREFIX + slug);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function listSchemas() {
  const result = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) {
        result.push(k.slice(PREFIX.length));
      }
    }
  } catch {}
  return result.sort();
}

