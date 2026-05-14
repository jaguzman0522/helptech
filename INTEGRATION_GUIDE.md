# 🚀 Guía de Integración API - HelpDesk IA

Esta documentación está diseñada para que desarrolladores de terceros puedan conectar sus aplicaciones (como VentaSmart, ERPs o CRMs) con la plataforma de soporte técnico HelpDesk IA de forma automática.

---

## 1. Conceptos Básicos
La API de HelpDesk IA permite la creación remota de tickets de soporte. Cada petición debe estar autenticada y enviarse en formato JSON.

**Base URL:** `http://localhost:8001/api/v1/external`

---

## 2. Autenticación
Para cada petición, el sistema requiere dos cabeceras (Headers) obligatorias que identifican su aplicación y garantizan la seguridad:

| Header | Descripción |
| :--- | :--- |
| `X-API-Key` | Su llave secreta generada en el Panel de Configuración. |
| `X-Client-ID` | El ID único de su aplicación asignado por el administrador. |

---

## 3. Crear un Ticket (POST /tickets)
Este es el endpoint principal para reportar incidencias.

### Estructura de la Petición (JSON)
```json
{
  "subject": "Fallo en Impresora Térmica",
  "description": "El usuario no puede imprimir facturas. Error de comunicación en puerto COM3.",
  "priority": "high",
  "requester_email": "soporte@ventasmart.com",
  "metadata": {
    "version_app": "2.4.1",
    "modulo": "Caja Principal"
  }
}
```

### Parámetros:
*   **subject** (String, Requerido): Título breve del problema.
*   **description** (String, Requerido): Detalle completo de lo ocurrido.
*   **priority** (String, Opcional): Valores permitidos: `low`, `normal`, `high`.
*   **requester_email** (String, Requerido): Email del contacto para seguimiento.
*   **metadata** (Object, Opcional): Información técnica adicional para el técnico.

---

## 4. Ejemplos de Código

### JavaScript (Fetch)
```javascript
const sendTicket = async () => {
  const response = await fetch('http://localhost:8001/api/v1/external/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'SU_API_KEY_AQUÍ',
      'X-Client-ID': 'SU_CLIENT_ID_AQUÍ'
    },
    body: JSON.stringify({
      subject: "Error de Sistema",
      description: "Detalle del error...",
      priority: "normal",
      requester_email: "user@example.com"
    })
  });
  return await response.json();
};
```

### Python (Requests)
```python
import requests

url = "http://localhost:8001/api/v1/external/tickets"
headers = {
    "X-API-Key": "SU_API_KEY_AQUÍ",
    "X-Client-ID": "SU_CLIENT_ID_AQUÍ",
    "Content-Type": "application/json"
}
data = {
    "subject": "Error detectado",
    "description": "Descripción...",
    "priority": "high",
    "requester_email": "user@example.com"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())
```

---

## 5. Códigos de Respuesta
*   **201 Created**: Ticket creado exitosamente. Recibirá el `ticket_id` y el `code` oficial.
*   **401 Unauthorized**: La API Key o el Client ID son incorrectos.
*   **422 Unprocessable Entity**: Faltan campos obligatorios o el formato JSON es inválido.
*   **500 Internal Error**: Problema en el servidor del HelpDesk.

---

## 6. Soporte Técnico
Si tiene dudas sobre la implementación, puede contactar al administrador del HelpDesk IA mediante el panel de mensajería interna o escribir a `soporte@tu-dominio.com`.
