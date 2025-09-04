import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Para GitHub Pages (proyectos en subcarpeta)
  // Se puede sobreescribir con BASE_PATH en el build (e.g. "/formBuilder/")
  base: process.env.BASE_PATH || "/",
});
