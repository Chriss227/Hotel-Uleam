# Hotel Uleam

Aplicacion web para gestionar reservas de un hotel universitario. Incluye flujo de usuario para buscar habitaciones, crear reservas y pagar, ademas de panel administrativo para habitaciones, check-in, check-out y reportes.

## Tecnologias

- Vue 3
- Vue Router
- Pinia
- Vite
- Chart.js

## Accesos de prueba

Usuario:

```text
usuario@uleam.edu.ec
123456
```

Administrador:

```text
admin@uleam.edu.ec
admin123
```

## Instalacion

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Build de produccion

```bash
npm run build
```

El resultado se genera en la carpeta `dist/`.

## Deploy

Configuracion sugerida para Vercel, Netlify u otro hosting estatico:

- Build command: `npm run build`
- Output directory: `dist`
- Node.js: `20.19.0` o superior

La app usa rutas tipo SPA, por eso el repositorio incluye reglas de rewrite para que las rutas internas funcionen al recargar la pagina.
