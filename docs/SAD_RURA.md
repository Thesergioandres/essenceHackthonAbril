# Software Architecture Document (SAD) - RURA

## 1. Resumen Ejecutivo (Pitch-Ready)

En Neiva coexisten dos realidades que no deberían tocarse: excedentes diarios de alimentos en comercios y restaurantes, y familias en inseguridad alimentaria dentro de zonas urbanas. La fricción logística, la falta de trazabilidad y la ausencia de coordinación digital en tiempo real convierten un problema resoluble en una pérdida estructural de valor social. RURA responde a esta brecha como un ecosistema tecnológico de rescate alimentario orientado a impacto, diseñado para conectar donantes, fundaciones y voluntarios bajo una operación auditable, multi-actor y multitenant.

La solución combina orquestación de donaciones, priorización de necesidades urgentes y seguimiento de entregas con reglas de negocio de responsabilidad operativa. Cada organización opera de forma aislada por tenant, preservando la confidencialidad y la gobernanza de datos, mientras comparte una misma plataforma SaaS escalable. El sistema reduce tiempos de coordinación mediante rutas de operación claras, notificaciones y visibilidad de estado de punta a punta.

El valor diferencial de RURA se concentra en tres capacidades críticas: continuidad operacional offline para escenarios con conectividad inestable; garantía logística de entrega con recuperación automática de asignaciones vencidas y penalización de incumplimientos; y medición de impacto social-ambiental basada en supuestos FAO, traduciendo kilos rescatados en raciones equivalentes y CO2 evitado. Este enfoque transforma la redistribución alimentaria en una cadena confiable, medible y replicable, con resultados directos para la seguridad alimentaria urbana y la sostenibilidad local, con gobernanza verificable continua.

## 2. Arquitectura Tecnica (SAD)

### 2.1 Estilo Arquitectonico

#### Backend: Arquitectura Hexagonal (Ports & Adapters)

El backend en Node.js + TypeScript separa de manera estricta el nucleo de dominio de los mecanismos de entrada/salida:

- Domain:
  Entidades, errores y contratos de repositorio sin dependencias de framework.
- Application:
  Casos de uso y servicios de dominio/aplicacion que orquestan reglas de negocio.
- Infrastructure:
  Adaptadores HTTP (Express), persistencia (Mongoose/MongoDB), configuracion y wiring.

La persistencia se implementa como adaptador driven. El dominio no depende de MongoDB; conoce solo interfaces de repositorio (puertos). Esto habilita testabilidad, sustitucion de infraestructura y evolucion de almacenamiento con bajo impacto en reglas de negocio.

#### Frontend: Clean Architecture con Next.js 14 (App Router)

El frontend aplica capas orientadas a responsabilidad:

- domain:
  Modelos de negocio del cliente y tipos de valor.
- application:
  Hooks/casos de uso de UI que encapsulan estado, coordinan acciones y consumen servicios.
- infrastructure:
  Red (http client), componentes visuales, layouts y adaptadores de plataforma en Next.js App Router.

Este enfoque evita acoplar logica de negocio a vistas, facilita mantenibilidad y acelera iteraciones de UX sin degradar consistencia funcional.

### 2.2 Atributos de Calidad

#### Escalabilidad

- Aislamiento multitenant por encabezado `x-tenant-id` en la comunicacion cliente-servidor.
- Repositorios y casos de uso filtran operaciones por tenant para evitar fuga de datos.
- Diseno SaaS con crecimiento horizontal por numero de organizaciones.

#### Resiliencia

- Cola de sincronizacion offline en cliente para sostener la operacion ante perdida de red.
- Reintento de operaciones y sincronizacion diferida al recuperar conectividad.
- Experiencia continua para voluntarios en campo y zonas de cobertura intermitente.

#### Confiabilidad

- Modulo de Garantia Logistica que recupera asignaciones vencidas automaticamente.
- Reasignacion de donaciones no atendidas dentro de ventanas temporales operativas.
- Penalizacion de incumplimientos para reforzar disciplina de servicio y trazabilidad.

## 3. Componente Tecnologico (Stack)

### Frontend

- Next.js 14 (App Router)
- Tailwind CSS
- GSAP para animaciones de alto rendimiento

### Backend

- Node.js
- Express
- TypeScript

### Base de Datos

- MongoDB (Mongoose)
- Indexacion para consultas geograficas por coordenadas (`location.lat`, `location.lng`) y consultas operativas por tenant/estado

### APIs Externas

- Google Maps Geocoding API
- Google Places API
- Google Static Maps API

### Metodologia de Impacto Social

- Conversion de alimento rescatado a raciones equivalentes
- Estimacion de CO2 evitado por rescate de alimento
- Parametrizacion alineada con estandares de referencia FAO para trazabilidad de impacto

## 4. Diagrama de Paquetes (Estructura Monorepo)

```text
rura-monorepo/
|- apps/
|  |- backend/
|  |  |- src/
|  |  |  |- domain/
|  |  |  |  |- entities/
|  |  |  |  |- errors/
|  |  |  |  \- repositories/
|  |  |  |- application/
|  |  |  |  |- contracts/
|  |  |  |  |- policies/
|  |  |  |  |- services/
|  |  |  |  \- use-cases/
|  |  |  \- infrastructure/
|  |  |     |- config/
|  |  |     |- database/
|  |  |     \- http/
|  |  \- package.json
|  \- frontend/
|     |- src/
|     |  |- domain/
|     |  |- application/
|     |  \- infrastructure/
|     \- package.json
|- docs/
|- package.json
\- README.md
```

### Evidencia de cumplimiento de arquitectura

- `/domain`:
  Contiene el modelo de negocio puro y contratos; no debe conocer frameworks ni tecnologia de persistencia.
- `/application`:
  Implementa casos de uso, orquesta reglas y define puertos/contratos de servicio.
- `/infrastructure`:
  Implementa adaptadores concretos (HTTP, base de datos, UI, red) y resuelve integraciones externas.

Esta separacion permite evolucionar cada capa con bajo acoplamiento, alta cohesion y trazabilidad tecnica para auditoria arquitectonica.