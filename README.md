# 🎓 Robotipa Academy - Plataforma de Educación Médica en Línea

## 📋 Descripción

**Robotipa Academy** es una plataforma educativa especializada en medicina tropical e infectología, diseñada para médicos, estudiantes de medicina y profesionales de la salud que buscan actualizar y ampliar sus conocimientos en enfermedades infecciosas y medicina tropical.

Nuestra plataforma ofrece cursos especializados, certificaciones oficiales y una experiencia de aprendizaje integral con las últimas tecnologías educativas.

---

## 🌟 Características Principales

### 📚 **Sistema de Gestión de Aprendizaje (LMS)**
- **Cursos estructurados** con capítulos organizados y progresión lógica
- **Videos educativos** de alta calidad con soporte para múltiples plataformas (YouTube, Vimeo, MUX)
- **Materiales descargables** y recursos complementarios
- **Seguimiento de progreso** individual para cada estudiante
- **Evaluaciones y quizzes** integrados para verificar conocimientos

### 🎯 **Experiencia de Usuario Personalizada**
- **Dashboard personalizado** según el tipo de usuario (Estudiante, Profesor, Administrador)
- **Catálogo de cursos** con filtros por categoría y búsqueda avanzada
- **Perfil de usuario** con historial de cursos y certificaciones
- **Modo oscuro/claro** para mejor experiencia visual
- **Responsive design** optimizado para dispositivos móviles y desktop

### 🏆 **Sistema de Certificaciones**
- **Certificados digitales** generados automáticamente al completar cursos
- **Códigos de verificación únicos** para autenticidad
- **Descarga en PDF** con diseño profesional
- **Galería de certificados** en el perfil del usuario
- **Verificación pública** de certificados

### 💳 **Sistema de Pagos Integrado**
- **Págelo Fácil** - Pasarela de pagos local para tarjetas de crédito/débito
- **Yappy** - Pagos móviles con QR dinámico para Panamá
- **Pagos manuales** con seguimiento administrativo
- **Facturación automática** y confirmaciones por email
- **Múltiples métodos de pago** para mayor accesibilidad

### 👨‍🏫 **Herramientas para Educadores**
- **Editor de cursos** intuitivo con vista previa en tiempo real
- **Gestión de contenido** multimedia (videos, documentos, imágenes)
- **Sistema de evaluaciones** con preguntas de opción múltiple
- **Analytics de estudiantes** y progreso de cursos
- **Gestión de usuarios** y roles de acceso

### 📧 **Comunicación y Soporte**
- **Notificaciones por email** automáticas (inscripciones, finalizaciones, certificados)
- **WhatsApp integrado** para soporte directo al estudiante
- **Sistema de notificaciones** en tiempo real
- **Chat de soporte** flotante para asistencia inmediata

### 🔐 **Seguridad y Administración**
- **Autenticación segura** con Supabase
- **Roles y permisos** granulares (Visitante, Estudiante, Profesor, Administrador)
- **Gestión de usuarios** centralizada
- **Auditoría de actividades** y logs del sistema
- **Backup automático** de datos

---

## 🎯 **¿Para Quién es esta Plataforma?**

### 👨‍⚕️ **Profesionales de la Salud**
- Médicos generales y especialistas
- Enfermeras y técnicos en salud
- Residentes y internos
- Investigadores en medicina tropical

### 🎓 **Estudiantes**
- Estudiantes de medicina
- Estudiantes de enfermería
- Estudiantes de ciencias de la salud
- Profesionales en formación continua

### 🏥 **Instituciones**
- Hospitales y clínicas
- Universidades y escuelas de medicina
- Organizaciones de salud pública
- ONGs de salud internacional

---

## 🚀 **Funcionalidades Destacadas**

### 📱 **Acceso Multiplataforma**
- ✅ Navegadores web (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivos móviles (iOS, Android)
- ✅ Tablets y computadoras
- ✅ Acceso offline para contenido descargado

### 🔧 **Panel de Administración**
- ✅ Gestión completa de cursos y contenido
- ✅ Análisis de rendimiento y estadísticas
- ✅ Gestión de usuarios y roles
- ✅ Configuración de certificados personalizados
- ✅ Reportes detallados de actividad

### 💰 **Modelos de Negocio Flexibles**
- ✅ Cursos gratuitos y de pago
- ✅ Suscripciones y paquetes de cursos
- ✅ Certificaciones premium
- ✅ Acceso institucional
- ✅ Descuentos y promociones

### 🌐 **Integración con Herramientas Externas**
- ✅ Google Analytics para seguimiento
- ✅ Cloudinary para gestión de medios
- ✅ Resend para emails transaccionales
- ✅ Firebase para analytics avanzado
- ✅ APIs de terceros para contenido especializado

---

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

---

## 📊 **Métricas y Analytics**

### 📈 **Para Administradores**
- Número total de estudiantes registrados
- Cursos más populares y mejor valorados
- Tasas de finalización por curso
- Ingresos por período y método de pago
- Análisis de comportamiento de usuarios

### 📚 **Para Educadores**
- Progreso individual de estudiantes
- Tiempo promedio de finalización
- Secciones con mayor dificultad
- Resultados de evaluaciones
- Feedback y comentarios

### 🎯 **Para Estudiantes**
- Progreso personal en cada curso
- Tiempo invertido en aprendizaje
- Certificados obtenidos
- Historial de actividades
- Recomendaciones personalizadas

---

## 🛡️ **Seguridad y Confiabilidad**

### 🔒 **Protección de Datos**
- Encriptación SSL/TLS para todas las comunicaciones
- Cumplimiento con regulaciones de privacidad
- Backup automático diario
- Autenticación de dos factores opcional
- Políticas de acceso granulares

### ⚡ **Rendimiento**
- CDN global para carga rápida de contenido
- Optimización automática de imágenes y videos
- Caching inteligente
- Monitoreo 24/7 de uptime
- Escalabilidad automática según demanda

---

## 🎨 **Diseño y Experiencia**

### 🖼️ **Interfaz Moderna**
- Diseño limpio y profesional
- Navegación intuitiva
- Colores institucionales personalizables
- Tipografía optimizada para lectura
- Iconografía médica especializada

### 📱 **Responsive Design**
- Adaptación automática a cualquier dispositivo
- Gestos táctiles optimizados
- Carga rápida en conexiones lentas
- Modo offline para contenido crítico

---

## 🌍 **Alcance y Localización**

### 🗣️ **Idiomas Soportados**
- Español (principal)
- Inglés (contenido internacional)
- Portugués (mercado brasileño)

### 🌎 **Métodos de Pago Regionales**
- **Panamá**: Yappy, tarjetas locales
- **Latinoamérica**: Págelo Fácil
- **Internacional**: PayPal, Stripe (próximamente)

---

## 📞 **Soporte y Asistencia**

### 🆘 **Canales de Soporte**
- **WhatsApp**: Atención directa e inmediata
- **Email**: Soporte técnico especializado
- **Chat en vivo**: Asistencia durante horarios laborales
- **Base de conocimientos**: Tutoriales y FAQ
- **Videos explicativos**: Guías paso a paso

### ⏰ **Horarios de Atención**
- **WhatsApp**: Lun-Vie 8:00 AM - 6:00 PM (GMT-5)
- **Email**: 24/7 con respuesta en menos de 24 horas
- **Chat**: Lun-Vie 9:00 AM - 5:00 PM (GMT-5)

---

## 🚀 **Próximas Funcionalidades**

### 🔄 **En Desarrollo**
- [ ] App móvil nativa (iOS/Android)
- [ ] Realidad virtual para procedimientos médicos
- [ ] Inteligencia artificial para recomendaciones
- [ ] Gamificación con badges y rankings
- [ ] Foros de discusión comunitarios
- [ ] Webinars en vivo integrados
- [ ] Biblioteca de casos clínicos interactivos

### 💡 **Roadmap 2024-2025**
- Expansión a 5 países adicionales
- 50+ cursos especializados
- Certificaciones oficiales internacionales
- Alianzas con universidades de medicina
- Plataforma de investigación colaborativa

---

## 📈 **Estadísticas de Uso**

### 📊 **Datos Actuales**
- **+1,000** estudiantes registrados
- **15+** cursos especializados disponibles
- **95%** tasa de satisfacción estudiantil
- **24/7** disponibilidad de la plataforma
- **<2s** tiempo promedio de carga

---

## 🤝 **Contacto y Más Información**

### 📧 **Información Comercial**
- **Email**: info@infectotropico.com
- **WhatsApp**: +507 6637-7061
- **Web**: https://infectotropico.com
- **LinkedIn**: /company/infectotropico

### 🏢 **Oficinas**
- **Panamá**: Ciudad de Panamá, Panamá
- **Cobertura**: Toda Latinoamérica
- **Tiempo de zona**: GMT-5 (EST)

---

*Robotipa Academy - Educación médica especializada para profesionales de la salud en el siglo XXI.*

**© 2024 Robotipa Academy. Todos los derechos reservados.**

---

## 🛠️ Configuración del Entorno de Desarrollo

Para poner en marcha el proyecto de Robotipa Academy en tu entorno local, sigue los siguientes pasos:

### 1. Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu sistema:

*   **Node.js**: Versión 18.x o superior. Puedes descargarlo desde [nodejs.org](https://nodejs.org/).
*   **npm** o **Yarn**: Gestor de paquetes. npm viene incluido con Node.js. Si prefieres Yarn, puedes instalarlo globalmente:
    ```bash
    npm install -g yarn
    ```
*   **Git**: Para clonar el repositorio.

### 2. Clonar el Repositorio

Clona el repositorio de Robotipa Academy a tu máquina local:

```bash
git clone https://github.com/RaulEfdz/ROBOTIPA_EDU_Ifecto_Tropico.git
cd ROBOTIPA_EDU_Ifecto_Tropico
```

### 3. Instalación de Dependencias

Instala todas las dependencias del proyecto utilizando npm o Yarn:

```bash
# Usando npm
npm install

# O usando Yarn
yarn install
```

### 4. Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto. Este archivo contendrá las variables de entorno necesarias para la aplicación. Puedes usar el archivo `.env.example` (si existe) como plantilla.

Ejemplo de `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Uploadthing
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Resend (Email Service)
RESEND_API_KEY=your_resend_api_key

# Firebase (Optional, for Analytics)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Database (Prisma)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth.js (if used for authentication)
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

**Importante**: No subas tu archivo `.env.local` al control de versiones (Git). Ya está incluido en `.gitignore`.

### 5. Configuración de la Base de Datos (Prisma)

Si estás utilizando Prisma, necesitas configurar tu base de datos y generar el cliente:

```bash
# Configura tu DATABASE_URL en .env.local
# Ejecuta las migraciones de Prisma
npx prisma migrate dev --name init

# Genera el cliente de Prisma
npx prisma generate
```

### 6. Ejecutar la Aplicación en Modo Desarrollo

Una vez que las dependencias estén instaladas y las variables de entorno configuradas, puedes iniciar la aplicación en modo desarrollo:

```bash
# Usando npm
npm run dev

# O usando Yarn
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## 🤝 Directrices para Contribuir

Agradecemos tu interés en contribuir al proyecto Robotipa Academy. Para asegurar un flujo de trabajo eficiente y mantener la calidad del código, por favor, sigue estas directrices:

### 1. Ramas y Flujo de Trabajo

*   **`main`**: Rama principal y estable. Solo se fusionan aquí las características completas y probadas.
*   **`develop`**: Rama de desarrollo. Todas las nuevas características y correcciones de errores se fusionan primero aquí.
*   **Ramas de características**: Para cada nueva característica o corrección de error, crea una rama a partir de `develop` con un nombre descriptivo (ej. `feature/nombre-de-la-caracteristica`, `bugfix/descripcion-del-bug`).

### 2. Proceso de Contribución

1.  **Clona el repositorio** y configura tu entorno de desarrollo como se describe en la sección "Configuración del Entorno de Desarrollo".
2.  **Crea una nueva rama** para tu característica o corrección de error:
    ```bash
    git checkout develop
    git pull origin develop
    git checkout -b feature/tu-nueva-caracteristica
    ```
3.  **Realiza tus cambios**. Asegúrate de seguir la [Guía de Estilo de Código](#-guía-de-estilo-de-código) y de escribir pruebas si es necesario.
4.  **Prueba tus cambios** localmente para asegurarte de que todo funciona como se espera y no introduce regresiones.
5.  **Haz commit de tus cambios** con mensajes claros y descriptivos. Utiliza el formato de commit convencional (ej. `feat: Añadir nueva funcionalidad de pagos`, `fix: Corregir error en el login`).
6.  **Sube tu rama** al repositorio remoto:
    ```bash
    git push origin feature/tu-nueva-caracteristica
    ```
7.  **Abre un Pull Request (PR)** desde tu rama hacia la rama `develop`.
    *   Asegúrate de que el PR tenga una descripción clara de los cambios, el problema que resuelve y cualquier consideración adicional.
    *   Adjunta capturas de pantalla o videos si los cambios son visuales.
8.  **Espera la revisión del código**. Aborda cualquier comentario o solicitud de cambio de los revisores.
9.  Una vez aprobado, tu PR será fusionado en `develop`.

### 3. Estilo de Código y Linting

*   Utilizamos ESLint y Prettier para mantener un estilo de código consistente. Asegúrate de que tu código pase las comprobaciones de linting antes de enviar un PR.
*   Puedes ejecutar los linters localmente:
    ```bash
    npm run lint
    # O
    yarn lint
    ```
*   Muchos editores de código (como VS Code) pueden configurarse para formatear el código automáticamente al guardar.

### 4. Pruebas

*   Si añades nuevas funcionalidades, por favor, incluye pruebas unitarias o de integración relevantes.
*   Puedes ejecutar las pruebas con:
    ```bash
    npm test
    # O
    yarn test
    ```

### 5. Documentación

*   Si tus cambios afectan la funcionalidad existente o añaden nuevas características, por favor, actualiza la documentación relevante (README, documentación de API, etc.).
