# Railway Setup Guide (RURA Monorepo)

This guide lists the exact variables and service settings to deploy RURA in Railway.

## 1) Create 2 Railway Services

- Service A (Backend): root directory `apps/backend`
- Service B (Frontend): root directory `apps/frontend`

Both folders already include their own `railway.json`.

## 2) Backend Service Variables

Set these in Railway -> Backend service -> Variables:

```bash
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=12h
NODE_ENV=production
```

Notes:
- Do not set `PORT` manually in Railway. Railway injects it automatically.
- Backend health endpoint: `/api/health`

## 3) Frontend Service Variables

Set these in Railway -> Frontend service -> Variables:

```bash
NEXT_PUBLIC_API_URL=https://<your-backend-service>.up.railway.app/api
NEXT_PUBLIC_API_BASE_URL=https://<your-backend-service>.up.railway.app/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google-maps-api-key>
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=<google-map-id>
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID_DARK=<google-map-id-dark>
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

Notes:
- `NEXT_PUBLIC_API_URL` is the preferred variable.
- `NEXT_PUBLIC_API_BASE_URL` is kept for backward compatibility.
- All client-exposed variables use the `NEXT_PUBLIC_` prefix.

## 4) Root Scripts for Monorepo Operations

From repository root:

```bash
npm run build
npm run start:backend
npm run start:frontend
```

## 5) Optional Docker Deploy

Optimized Dockerfiles are available:

- `apps/backend/Dockerfile` (Node 18 Alpine)
- `apps/frontend/Dockerfile` (Node 18 Alpine + Next standalone)
