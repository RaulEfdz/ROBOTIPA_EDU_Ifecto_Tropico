# ROBOTIPA_EDU_Ifecto_Tropico

## Integración con Págelo Fácil (Producción)

### 1. Variables de Entorno
- **PAGUELOFACIL_CCLW**: Tu código web en producción.
- **PAGUELOFACIL_API_URL**: `https://secure.paguelofacil.com/LinkDeamon.cfm`
- **NEXT_PUBLIC_RETURN_URL**: URL HTTPS pública registrada en Págelo Fácil para retorno tras pago.
- **Opcional**:
  - **PAGUELOFACIL_CARD_TYPES**: CSV de métodos de pago permitidos.
  - **PAGUELOFACIL_EXPIRES_IN**: Tiempo de expiración del enlace en segundos.

### 2. Endpoint API: POST `/api/payments/paguelo-facil`
- **Archivo**: `app/api/payments/paguelo-facil/route.ts`
- **Request Body (JSON)**:
  ```ts
  {
    amount: number;           // > 0, 2 decimales
    description: string;      // no vacío, max 150 chars
    customParam1: string;     // PARM_1 (userId u otro)
    returnUrl?: string;       // NEXT_PUBLIC_RETURN_URL
    pfCf?: Record<string, any>;
    cardTypes?: string[];     // e.g. ["VISA","NEQUI"]
    expiresIn?: number;       // en segundos
  }
  ```
- **Validaciones**:
  - `amount > 0`
  - `description` no vacío
- **Construcción de body** (application/x-www-form-urlencoded):
  - `CCLW` = PAGUELOFACIL_CCLW
  - `CMTN` = amount.toFixed(2)
  - `CDSC` = description substring(0,150)
  - `PARM_1` = customParam1
  - `RETURN_URL` = Buffer.from(returnUrl, 'utf8').toString('hex')
  - `PF_CF` = Buffer.from(JSON.stringify(pfCf), 'utf8').toString('hex')
  - `CARD_TYPE` = cardTypes.join(',')
  - `EXPIRES_IN` = expiresIn
- **Ejemplo de envío**:
  ```ts
  await fetch(process.env.PAGUELOFACIL_API_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: urlEncodedBody,
  });
  ```
- **Respuesta**: JSON con `{ success: boolean; url?: string; error?: string }`

### 3. Frontend: Redirección al Checkout
- **Componente**: `app/payments/PaymentButton.tsx`
- **Flujo**:
  1. POST a `/api/payments/paguelo-facil` con payload.
  2. Recibe `{ url }`.
  3. Mostrar modal “Redirigiendo al checkout…”.
  4. `window.location.href = url`.

### 4. Página de Resultado
- **Ruta**: `app/payments/resultado/page.tsx`
- **Qué hacer**:
  - Leer query params (`Oper`, `TotalPagado`, `Estado`, etc.).
  - Mostrar al usuario el estado y detalles de la transacción.
  - (Opcional) Validar estado con server-to-server si la API lo permite.

### 5. Seguridad y CORS
- Sanitizar todos los inputs y outputs.
- Configurar CORS para permitir solo tus orígenes.
- Definir políticas CSP que permitan únicamente dominios de Págelo Fácil y tu dominio.
- Manejar errores en el frontend con mensajes claros.

### 6. Webhook de Confirmación
- **Archivo**: `app/api/payments/paguelo-facil/webhook/route.ts`
- **Flujo**:
  1. Págelo Fácil envía POST con `{ status, parm_1, pfCf }`.
  2. Verificar: `status === "APPROVED"` y `parm_1` válido.
  3. Registrar transacción con Prisma (`purchase.create`).
  4. Enviar correos de confirmación (`sendEnrollmentConfirmationEmails`).

### 7. Pruebas End-to-End
- **Sandbox**:
  - Generar enlace en modo sandbox (`PAGUELOFACIL_API_URL` de pruebas).
  - Simular pago y redirección.
  - Verificar flujo completo: generación de enlace, checkout, webhook.
- **Unit Tests**:
  - Test de `createPagueloFacilLink()` con mocks de fetch.
  - Validar hex-encoding de RETURN_URL y PF_CF.

### 8. Monitoreo y Logs
- Registrar peticiones y respuestas con estado de éxito/fallo.
- Integrar alertas en Sentry o Logtail para errores críticos.
- Loguear código de respuesta y mensajes de error de Págelo Fácil.

### 9. Documentación Interna y CI/CD
- Documentar en README pasos de configuración de credenciales, entornos (sandbox/producción).
- Incluir ejemplos de payloads y respuestas.
- Configurar CI:
  - Smoke tests contra `/api/payments/paguelo-facil` tras cada deploy.
  - Verificar variables de entorno en el entorno de producción.

### 10. Revisión de Seguridad
- Ejecutar `npm audit` y parchear vulnerabilidades.
- Auditoría de dependencias y políticas de seguridad.
- Control de versiones de la API de Págelo Fácil para evitar cambios inesperados.
