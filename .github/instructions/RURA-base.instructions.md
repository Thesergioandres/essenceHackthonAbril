# Contexto Global del Proyecto: RURA (Red Urbana de Rescate Alimentario)

## Propósito
Desarrollar una plataforma SaaS multi-tenant para combatir el hambre urbana mediante la redistribución logística de excedentes de alimentos en tiempo real. 

## Stack Tecnológico Principal
- **Frontend:** React, Next.js, Tailwind CSS, GSAP (animaciones fluidas).
- **Backend:** Node.js, TypeScript.
- **Base de Datos:** PostgreSQL.
- **Despliegue:** Railway.

## Arquitectura Estricta
El proyecto está rigurosamente dividido en dos paradigmas arquitectónicos. Todo el código generado debe respetar esta separación:

1. **Backend: Arquitectura Hexagonal (Ports & Adapters)**
   - `Domain`: Entidades (Donacion, Organizacion, Usuario) y reglas de negocio puras. Sin dependencias externas.
   - `Application`: Casos de uso (RegistrarDonacion, AsignarRuta). Orquestan el dominio.
   -   `Infrastructure`: Adaptadores driving (Controladores REST/GraphQL) y driven (Repositorios PostgreSQL, APIs externas).

2. **Frontend: Clean Architecture**
   - `Domain`: Modelos de datos del cliente e interfaces.
   - `Application`: Hooks de React (`useDonations`, `useTenant`) y gestión de estado.
   - `Infrastructure`: Componentes UI (Next.js/React), estilos (Tailwind) y animaciones (GSAP). Servicios de llamadas a la API.

## Reglas de Negocio (Multi-Tenant)
- **Roles:** God (Dueño del sistema), Super Admin (Dueño de la fundación/comedor), Empleado (Fuerza laboral/Voluntario).
- **Aislamiento de Datos:** Todas las consultas a PostgreSQL deben filtrar por el `tenantId` (empresa/fundación) correspondiente. Un Empleado puede pertenecer a múltiples tenants.
- **Middleware Cortacorriente:** Cada petición de un inquilino o empleado debe verificar el estado de pago/suscripción del Super Admin. Si está en mora, el acceso a la operatoria de ese tenant se bloquea.
