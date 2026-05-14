# Script para realizar copia de seguridad de la base de datos HelpDesk
# Genera un archivo .sql usando el contenedor de Docker local

$BackupFile = "helpdesk_backup.sql"
$ContainerName = "helpdesk-tech-db-1" # Nombre común por defecto de compose

Write-Host "Iniciando copia de seguridad de la base de datos (UTF-8)..." -ForegroundColor Cyan

# Usamos cmd /c para que el redireccionamiento > sea binario/UTF-8 y no UTF-16 de PowerShell
cmd /c "docker exec $ContainerName pg_dump -U helpdesk helpdesk > $BackupFile"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Copia de seguridad completada con éxito: $BackupFile" -ForegroundColor Green
} else {
    Write-Host "Error al realizar la copia de seguridad. Asegúrate de que el contenedor '$ContainerName' esté en ejecución." -ForegroundColor Red
}
