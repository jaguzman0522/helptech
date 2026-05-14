# 🛠️ Guía de Comandos - HelpDesk Tech

Este documento contiene los comandos esenciales para la administración, mantenimiento y despliegue del sistema, organizados por categorías.

---

## 🐳 Docker & Contenedores
Comandos para gestionar la infraestructura containerizada.

| Comando | Descripción |
| :--- | :--- |
| `docker-compose up -d --build` | Levanta todos los servicios en segundo plano reconstruyendo imágenes. |
| `docker-compose down` | Detiene y elimina todos los contenedores de la red actual. |
| `docker-compose logs -f api` | Visualiza los logs en tiempo real del backend (API). |
| `docker-compose restart api` | Reinicia únicamente el contenedor del backend (útil para aplicar migraciones). |
| `docker exec -it helpdesk-tech-db-1 psql -U helpdesk` | Entra a la consola de PostgreSQL dentro del contenedor de base de datos. |
| `docker system prune -a` | **(Cuidado)** Elimina todos los contenedores, imágenes y redes que no se estén usando. |

---

## 🐍 Python & Backend (FastAPI)
Comandos para depuración y tareas administrativas del servidor.

| Comando | Descripción |
| :--- | :--- |
| `docker exec -it helpdesk-tech-api-1 python migrate_db.py` | Ejecuta el script de migración manual para reparar la base de datos. |
| `pip install -r requirements.txt` | Instala las dependencias de Python (ejecutar dentro del entorno virtual). |
| `pytest` | Ejecuta la suite de pruebas unitarias y de integración. |
| `python -m py_compile archivo.py` | Verifica si un archivo de Python tiene errores de sintaxis sin ejecutarlo. |
| `celery -A app.tasks worker --loglevel=info` | Inicia el trabajador de tareas en segundo plano (Worker). |

---

## 🌐 Frontend (React + Vite)
Comandos para el desarrollo y construcción de la interfaz de usuario.

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local de React. |
| `npm run build` | Genera los archivos estáticos optimizados para producción (carpeta /dist). |
| `npm install` | Instala todas las librerías necesarias del proyecto (node_modules). |
| `npm run lint` | Ejecuta el analizador de código para encontrar errores de estilo o bugs. |

---

## 🐧 Ubuntu / Sistema Operativo
Comandos útiles para la gestión de archivos y permisos en Linux.

| Comando | Descripción |
| :--- | :--- |
| `sudo chown -R $USER:$USER .` | Cambia la propiedad de todos los archivos del proyecto al usuario actual. |
| `ls -la` | Lista todos los archivos, incluyendo los ocultos (.env, .git). |
| `df -h` | Muestra el espacio disponible en el disco duro. |
| `top` o `htop` | Visualiza el uso de CPU y Memoria RAM en tiempo real. |
| `netstat -tulpn` | Muestra los puertos que están siendo utilizados por el sistema. |

---

## 📊 Base de Datos (PostgreSQL)
Consultas rápidas para verificar el estado de los datos.

| Comando | Descripción |
| :--- | :--- |
| `\dt` | Lista todas las tablas de la base de datos (dentro de psql). |
| `SELECT * FROM support_rounds;` | Muestra todos los registros de la tabla de rondas técnicas. |
| `DELETE FROM products WHERE id = X;` | Elimina un producto específico por su ID. |
| `\q` | Sale de la consola de PostgreSQL. |

---

> [!TIP]
> Si acabas de aplicar cambios en `main.py` o `models`, siempre ejecuta `docker-compose restart api` para que el sistema procese las nuevas instrucciones de inicio.
