# 🚀 Guía de Integración: HelpDesk Control Center

**Bienvenido al Futuro del Soporte Técnico.**  
Si eres desarrollador o proveedor de servicios, esta guía te enseñará cómo convertir nuestra plataforma en tu centro de mando, ahorrándote meses de desarrollo en sistemas de soporte.

---

## 1. ¿Por qué integrarte con nosotros?
No construyas una mesa de ayuda desde cero. Únete a nuestra red y obtén:
*   **Omnicanalidad inmediata:** Recibe tickets desde tu propia app vía API.
*   **Motor de IA Gemini:** Diagnósticos automáticos para tus técnicos.
*   **Gestión Multi-Tenant:** Controla a todos tus clientes de forma independiente desde un solo panel.
*   **Escalabilidad:** Soporta desde 10 hasta 10,000 tickets mensuales sin latencia.

---

## 2. Modalidades de Integración

### A. Integración por API (Control Total)
Ideal si ya tienes una interfaz y solo necesitas el motor de tickets.
*   **Flujo:** Tu sistema envía un JSON a nuestra API y nosotros nos encargamos del flujo de trabajo, notificaciones y analítica.
*   **Esfuerzo:** Medio (requiere backend).

### B. Widget Embebido (Plug & Play) - *Próximamente*
Ideal para añadir soporte en 5 minutos.
*   **Flujo:** Copias un `<script>` en tu web y aparece un botón flotante con chat y formularios.
*   **Esfuerzo:** Mínimo (No-Code).

---

## 3. Paso a Paso para Desarrolladores

### Paso 1: Generación de Identidad
Accede a tu panel en **Configuración > APIs p/ Terceros** y genera tus credenciales:
*   **Client ID:** Identificador público de tu aplicación.
*   **API Key:** Tu llave maestra de acceso (Guárdala bien, no se vuelve a mostrar).

### Paso 2: Configuración de Cabeceras
Toda petición debe incluir estas dos cabeceras obligatorias:
```http
X-Client-ID: CLI-XXXX-XXXX
X-API-Key: sk_live_xxxxxxxxxxxx
Content-Type: application/json
```

### Paso 3: Envío del Primer Ticket
Endpoint: `POST https://api.tu-helpdesk.com/api/v1/external/tickets`

**Estructura del JSON:**
```json
{
  "subject": "Fallo en servidor de base de datos",
  "description": "El cliente reporta lentitud extrema en el POS.",
  "priority": "high",
  "requester_email": "soporte@cliente-final.com",
  "metadata": {
    "app_version": "2.4.1",
    "device_id": "WS-902"
  }
}
```

---

## 4. Requisitos de Seguridad Obligatorios
Para mantener la integridad de la red, tu app debe cumplir con:
1.  **HTTPS:** Solo aceptamos tráfico cifrado TLS 1.2+.
2.  **Secret Management:** Nunca hardcodees la API Key en el frontend (JS del navegador). Haz las peticiones desde tu servidor.
3.  **Límites de Tasa:** El límite estándar es de 100 peticiones por minuto por Client ID.

---

## 5. Próximos Pasos
¿Listo para empezar? Solicita tu cuenta de **Partner Tecnológico** y comienza a recibir tickets de tus clientes hoy mismo.

*Documentación v1.8.0 - HelpDesk Tech Center*
