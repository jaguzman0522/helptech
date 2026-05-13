# HelpDesk TI IA 🚀

Sistema integral de gestión de tickets y mantenimiento preventivo potenciado por Inteligencia Artificial (Google Gemini).

## 📋 Características principales
- **Gestión de Tickets:** Flujo completo desde la creación hasta la resolución.
- **IA integrada:** Clasificación automática de tickets y sugerencias de resolución.
- **Inventario & Kardex:** Control de activos con trazabilidad completa.
- **Firma Digital:** Digitalización de firmas para reportes de servicio.
- **RBAC (Role Based Access Control):** Control granular de accesos por roles (Admin, Técnico, Usuario).
- **Multi-tenant:** Aislamiento de datos por empresa.

## 🛠️ Tecnologías
- **Backend:** FastAPI (Python 3.12), SQLAlchemy, PostgreSQL, Redis, Celery.
- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite.
- **Infraestructura:** Docker & Docker Compose.

## 🚀 Instalación y Despliegue

### Requisitos previos
- Docker y Docker Desktop instalados.
- Python 3.12+ (opcional para scripts locales).

### Pasos para iniciar el sistema
1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repo>
   cd helpdesk-tech
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz (puedes basarte en los archivos `.env` de las subcarpetas). Asegúrate de incluir tu `GEMINI_API_KEY`.

3. **Iniciar con Docker Compose:**
   ```bash
   docker compose up -d --build
   ```

### Puertos configurados
- **Frontend:** `http://localhost:5173`
- **API Backend:** `http://localhost:8001`
- **PostgreSQL:** `localhost:5433` (externo)
- **Redis:** `localhost:6379`

## 🔑 Acceso por defecto
- **URL:** `http://localhost:5173`
- **Usuario:** `aguzman0522@gmail.com`
- **Password:** `admin1234` (Si acabas de resetearla)

## 📁 Estructura del Proyecto
- `/helpdesk-backend`: Lógica de servidor y API.
- `/helpdesk-frontend`: Interfaz de usuario web.
- `/helpdesk-desktop`: Componentes para la versión de escritorio.
- `docker-compose.yml`: Orquestación de contenedores.

## 📄 Licencia
Privado - Todos los derechos reservados.
