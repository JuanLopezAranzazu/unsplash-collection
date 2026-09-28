# Unsplash Collection

Aplicación web para compartir imágenes y organizarlas en colecciones. Los usuarios inician sesión con Google o GitHub, suben sus imágenes, crean colecciones y cualquier visitante puede explorar las imágenes y ver su detalle.

## Características

- Inicio de sesión con **Google** y **GitHub** (OAuth 2.0).
- Subida de imágenes (hasta 10 MB) con título, descripción y etiquetas, almacenadas en **Cloudinary**.
- Galería en cuadrícula responsive con búsqueda y paginación ("cargar más").
- Página de detalle: autor, dimensiones, vistas, fecha y etiquetas.
- Colecciones: crear, añadir o quitar imágenes y eliminar. Son públicas.
- Solo el dueño puede eliminar sus imágenes y colecciones.
- Tema de color personalizable, modo claro/oscuro, menú de usuario en el avatar y notificaciones (toasts).

## Stack

| Capa | Tecnologías |
| --- | --- |
| Frontend | React, Vite, TypeScript, Chakra UI v3 (`@chakra-ui/react`), React Router, react-icons, next-themes |
| Backend | Node.js, Express, TypeScript, Passport (Google y GitHub), JWT en cookie httpOnly, Multer |
| Base de datos | MongoDB con Mongoose |
| Imágenes | Cloudinary |

## Requisitos

- Node.js 18 o superior
- MongoDB local o una cuenta en MongoDB Atlas
- Cuenta de Cloudinary
- Credenciales OAuth de Google y de GitHub

## Instalación

### Servidor

```bash
cd server
cp .env.example .env     # completa los valores
pnpm install
pnpm dev              # http://localhost:4000
```

Variables de `.env`:

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto del servidor (4000) |
| `CLIENT_URL` | URL del frontend (`http://localhost:5173`) |
| `SERVER_URL` | URL pública del servidor (`http://localhost:4000`) |
| `MONGO_URI` | Cadena de conexión de MongoDB |
| `JWT_SECRET` | Texto secreto largo para firmar las sesiones |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Credenciales de Google |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Credenciales de GitHub |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Credenciales de Cloudinary |

### Cliente

```bash
cd client
pnpm install
pnpm dev              # http://localhost:5173
```

Abre `http://localhost:5173` e inicia sesión con Google o GitHub.

## API

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| GET | `/auth/google`, `/auth/github` | No | Inicia el login OAuth |
| GET | `/auth/me` | Sí | Usuario actual |
| POST | `/auth/logout` | No | Cierra la sesión |
| GET | `/api/images?q=&user=&page=` | No | Lista y busca imágenes |
| GET | `/api/images/:id` | No | Detalle (suma una vista) |
| POST | `/api/images` | Sí | Sube una imagen (`multipart/form-data`: `file`, `title`, `description`, `tags`) |
| DELETE | `/api/images/:id` | Sí (dueño) | Elimina la imagen |
| GET | `/api/collections?user=` | No | Lista colecciones |
| GET | `/api/collections/:id` | No | Detalle con sus imágenes |
| POST | `/api/collections` | Sí | Crea una colección |
| POST | `/api/collections/:id/images` | Sí (dueño) | Añade una imagen (`{ imageId }`) |
| DELETE | `/api/collections/:id/images/:imageId` | Sí (dueño) | Quita una imagen |
| DELETE | `/api/collections/:id` | Sí (dueño) | Elimina la colección |