# Changelog - HelpDesk TI IA

## [1.8.1] - 2026-05-12

### Fixed
- **Pantalla en Blanco:** Corregido error de React "Objects are not valid as a React child" en `Sidebar`, `TopBar` y `Profile` al intentar renderizar el objeto de rol.
- **Backend Crash (api.py):** Agregada importación faltante de `APIRouter` que impedía el inicio del servidor.
- **Backend Crash (tickets.py):** Corregido error de sintaxis en el decorador de rutas de evidencia.
- **Broken Imports:** Corregidos archivos `external.py` y `assignments.py` que intentaban importar `get_next_code` (inexistente) en lugar de `get_next_sequence`.
- **RBAC Logic:** Corregidas validaciones de seguridad en `deps.py` y `superadmin.py` que comparaban erróneamente objetos de relación con strings.
- **Database Connectivity:** Corregida carga de relaciones (Lazy Loading) en `/users/me` usando `selectinload` para evitar errores 500.

### Changed
- Actualizada la visualización del rol en el frontend para soportar la nueva estructura de objetos de permisos.
- Mejorada la robustez del cargado de usuario inicial.

## [1.8.0] - 2026-04-30
- Implementación inicial de RBAC avanzado.
- Integración con Google Gemini para clasificación de tickets.
- Soporte para multi-tenant y auditoría de acciones.
