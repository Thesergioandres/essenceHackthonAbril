# RURA - Red Urbana de Rescate Alimentario

Plataforma SaaS multitenant para rescate de excedentes alimentarios, coordinacion logistica y medicion de impacto social-ambiental.

## Arquitectura

- Backend: Arquitectura Hexagonal (Ports & Adapters)
- Frontend: Clean Architecture con Next.js 14 (App Router)
- Persistencia: MongoDB con Mongoose
- Operacion multitenant: aislamiento por `x-tenant-id`

## Requisitos

- Node.js 18+
- npm 9+
- MongoDB local o remoto (Atlas)
- Clave de Google Maps (para vistas de mapas)

## Estructura del monorepo

- `apps/backend`: API Express + TypeScript
- `apps/frontend`: Web App Next.js 14
- `docs`: documentos funcionales y tecnicos

## Configuracion de entorno (.env)

### 1) Backend

Crear archivo `apps/backend/.env` a partir de `apps/backend/.env.example`:

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/rura
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRES_IN=12h
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 2) Frontend

Crear archivo `apps/frontend/.env.local` a partir de `apps/frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=your_google_maps_map_id_here
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID_DARK=your_google_maps_dark_map_id_here
```

## Instalacion

Desde la raiz del repositorio:

```bash
npm install
```

## Arranque en desarrollo

Abrir 2 terminales desde la raiz del proyecto.

Terminal 1 (Backend):

```bash
npm run dev --workspace @rura/backend
```

Terminal 2 (Frontend):

```bash
npm run dev --workspace @rura/frontend
```

URLs locales:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Healthcheck: http://localhost:4000/api/health

## Comandos utiles

```bash
npm run build
npm run typecheck
npm run start:backend
npm run start:frontend
```

## Reset de base de datos (pruebas limpias)

RURA incluye un script oficial para resetear completamente la base de datos conectada por `MONGODB_URI`.

Comando:

```bash
npm run db:reset --workspace @rura/backend
```

Que hace:

- Conecta a MongoDB usando `MONGODB_URI` (o `mongodb://localhost:27017/rura` por defecto)
- Ejecuta `dropDatabase()`
- Cierra la conexion

Importante:

- Este comando elimina toda la informacion de la base de datos objetivo.
- Verifica `MONGODB_URI` antes de ejecutarlo, especialmente en entornos remotos.

## Evidencia tecnica

- Documento SAD final: `docs/SAD_RURA.md`
- Setup Railway: `RAILWAY_SETUP.md`
