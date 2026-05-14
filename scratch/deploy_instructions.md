# Guía de Despliegue y Restauración en Servidor Ubuntu

Sigue estos pasos para montar el proyecto y la base de datos en el servidor `10.0.0.24`.

## 1. Generar la Copia de Seguridad
Ejecuta el script de backup en tu máquina local (Windows):
```powershell
.\scratch\backup_db.ps1
```
Esto creará un archivo llamado `helpdesk_backup.sql`.

## 2. Transferir el Proyecto y el Backup
Si ya pasaste el proyecto, asegúrate de actualizar el archivo `docker-compose.yml` en el servidor con los nuevos cambios. Luego transfiere el backup:
```powershell
scp helpdesk_backup.sql jguzman@10.0.0.24:~/helpdesk-tech/
```

## 3. Levantar los Servicios en el Servidor
Accede al servidor por SSH y levanta los contenedores:
```bash
ssh jguzman@10.0.0.24
cd ~/helpdesk-tech
docker compose up -d --build
```

## 4. Restaurar la Base de Datos
Una vez que los contenedores estén corriendo, restaura el backup:
```bash
# Copiar el archivo al contenedor
docker cp helpdesk_backup.sql helpdesk-tech-db-1:/tmp/

# Ejecutar la restauración (esto borrará datos existentes en el servidor y pondrá los del backup)
docker exec -t helpdesk-tech-db-1 psql -U helpdesk -d helpdesk -f /tmp/helpdesk_backup.sql
```

## 5. Verificar Acceso
Ahora deberías poder acceder a la aplicación a través de la red:
- **Frontend**: http://10.0.0.24:3010
- **API**: http://10.0.0.24:8010

---
### Notas sobre Puertos:
- **Frontend**: 3010
- **API**: 8010
- **DB**: 5410
- **Redis**: 6310
