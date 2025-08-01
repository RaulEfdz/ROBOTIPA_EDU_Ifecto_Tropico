# Tareas Prioritarias de Mejora para Robotipa Academy

Este documento detalla las tareas de mejora identificadas en el proyecto "Robotipa Academy", organizadas por objetivo, problema identificado y sub-tareas para su resolución.

---

## 1. Mejora de la Sección "Pagos" en el Menú de Profesores

**Objetivo:** Reubicar y mejorar la funcionalidad de la sección "Pagos" en el menú de profesores para que muestre datos de pagos relevantes y precisos desde la base de datos.

**Problema Identificado:**
Actualmente, la sección "Pagos" dentro del menú de "Profesores" es confusa y no cumple su propósito, ya que no muestra información de pagos real extraída de la base de datos. Esto genera una mala experiencia de usuario y falta de transparencia para los profesores.

**Sub-tareas para Solucionar:**
*   **1.1. Investigación de la Implementación Actual:**
    *   Analizar el código fuente de la sección "Pagos" en el menú de profesores para entender su propósito actual y cómo se está intentando (o no) obtener datos.
    *   Identificar los componentes y rutas API/Server Actions asociados a esta sección.
*   **1.2. Identificación de Fuentes de Datos de Pagos:**
    *   Revisar el esquema de la base de datos (`prisma/schema.prisma`) para identificar los modelos (`Invoice`, `Payment`, etc.) que contienen la información de pagos relevante para los profesores.
    *   Explorar las rutas API existentes en `/app/api/payments` y las acciones en `/actions` para determinar cómo se pueden obtener los datos de pagos de manera eficiente y segura.
*   **1.3. Diseño de UI/UX para Pagos de Profesores:**
    *   Definir una interfaz de usuario clara y funcional que muestre los pagos de los profesores (ej. historial de pagos, montos, fechas, estado).
    *   Considerar la necesidad de filtros, ordenamiento o paginación si el volumen de datos es alto.
*   **1.4. Desarrollo de Lógica Backend para Pagos de Profesores:**
    *   Crear o modificar rutas API (en `/app/api/payments` o una nueva sub-ruta) o Server Actions (en `/actions`) para consultar y devolver los datos de pagos específicos de cada profesor.
    *   Asegurar que la lógica de autorización esté correctamente implementada para que cada profesor solo pueda ver sus propios pagos.
*   **1.5. Implementación de Componentes Frontend:**
    *   Desarrollar los componentes React necesarios para renderizar la nueva interfaz de pagos, utilizando los datos obtenidos del backend.
    *   Integrar estos componentes en la estructura del menú de profesores o en una nueva ruta dedicada si es más apropiado.
*   **1.6. Actualización de Navegación y Menú:**
    *   Ajustar la navegación del panel de control para profesores para que la sección "Pagos" sea accesible y esté correctamente etiquetada.
    *   Considerar si la sección debe ser renombrada o si su ubicación actual es la más lógica una vez que muestre datos reales.

---

## 2. Revisión y Mejora de la Integración de Pagos con Yappy

**Objetivo:** Abordar y resolver cualquier problema o área de mejora en la integración de la pasarela de pagos Yappy.

**Problema Identificado:**
La integración de pagos con Yappy requiere atención, lo que sugiere posibles errores, funcionalidades incompletas o la necesidad de optimización para asegurar un flujo de pago robusto y sin interrupciones.

**Sub-tareas para Solucionar:**
*   **2.1. Auditoría del Código de Integración Yappy:**
    *   Revisar el código existente relacionado con Yappy, probablemente ubicado en `/app/api/payments` y los componentes frontend que interactúan con esta pasarela.
    *   Identificar puntos de falla, manejo de errores deficiente o lógica incompleta.
*   **2.2. Identificación de Problemas Específicos:**
    *   Determinar los problemas exactos con la integración de Yappy (ej. transacciones fallidas, falta de confirmación, problemas de conciliación, experiencia de usuario deficiente durante el pago).
    *   Consultar logs de errores o reportes de usuarios si están disponibles.
*   **2.3. Consulta de Documentación de Yappy:**
    *   Revisar la documentación oficial de la API de Yappy para asegurar que la integración cumple con las últimas especificaciones y mejores prácticas.
    *   Comparar la implementación actual con los requisitos de la pasarela.
*   **2.4. Implementación de Correcciones y Mejoras:**
    *   Aplicar las correcciones necesarias para resolver los problemas identificados.
    *   Mejorar el manejo de errores, la retroalimentación al usuario y la robustez general del flujo de pago.
    *   Considerar la implementación de webhooks o mecanismos de notificación si Yappy los ofrece para una mejor conciliación de pagos.
*   **2.5. Pruebas Exhaustivas de la Integración Yappy:**
    *   Realizar pruebas completas del flujo de pago con Yappy, incluyendo escenarios de éxito, cancelación, fallos de red y cualquier caso límite.
    *   Verificar que las transacciones se registran correctamente en la base de datos y que el estado del usuario/curso se actualiza adecuadamente.

---

## 3. Optimización del Rendimiento y la Experiencia de Usuario

**Objetivo:** Mejorar la velocidad de carga, la fluidez de la interfaz y la percepción general del rendimiento de la aplicación.

**Problema Identificado:**
Aunque el proyecto utiliza Next.js y tecnologías modernas, siempre hay oportunidades para optimizar el rendimiento, especialmente en aplicaciones con contenido multimedia y flujos de datos complejos. Posibles cuellos de botella en la carga de datos, renderizado de componentes o gestión de recursos.

**Sub-tareas para Solucionar:**
*   **3.1. Auditoría de Rendimiento (Lighthouse/Web Vitals):**
    *   Realizar auditorías de rendimiento utilizando herramientas como Google Lighthouse o PageSpeed Insights para identificar métricas clave (FCP, LCP, CLS) y áreas de mejora.
    *   Analizar el impacto de los recursos multimedia (imágenes, videos) en el tiempo de carga.
*   **3.2. Optimización de Carga de Datos:**
    *   Revisar las llamadas a la API y Server Actions (`/actions`, `/app/api`) para implementar estrategias de caché (SWR, Next.js Data Cache), paginación o carga diferida (lazy loading) de datos.
    *   Optimizar consultas a la base de datos a través de Prisma para reducir el tiempo de respuesta.
*   **3.3. Optimización de Activos Multimedia:**
    *   Asegurar que las imágenes y videos se sirvan en formatos optimizados (WebP, AVIF para imágenes; HLS para videos con Mux) y tamaños adecuados.
    *   Implementar carga perezosa (lazy loading) para imágenes y videos fuera de la vista inicial.
    *   Revisar la configuración de `Next-Cloudinary` para asegurar la máxima optimización.
*   **3.4. Refactorización de Componentes Críticos:**
    *   Identificar componentes con renderizados excesivos o lógica compleja que puedan estar afectando el rendimiento.
    *   Aplicar técnicas como `React.memo`, `useCallback`, `useMemo` para evitar renderizados innecesarios.
*   **3.5. Revisión de Bundling y Code Splitting:**
    *   Analizar el tamaño del bundle de JavaScript y CSS para identificar librerías grandes o código no utilizado.
    *   Asegurar que Next.js esté realizando un code splitting efectivo para cargar solo el JavaScript necesario por ruta.

---

## 4. Fortalecimiento de la Seguridad y Gestión de Roles

**Objetivo:** Mejorar la robustez de la seguridad de la aplicación, especialmente en la gestión de roles y el acceso a recursos.

**Problema Identificado:**
La gestión de roles es fundamental para la seguridad. Es crucial asegurar que la lógica de autorización sea infalible y que no existan vulnerabilidades que permitan a usuarios con roles inferiores acceder a funcionalidades o datos restringidos.

**Sub-tareas para Solucionar:**
*   **4.1. Auditoría de Lógica de Autorización:**
    *   Revisar `middleware.ts` y todas las rutas API (`/app/api`) y Server Actions (`/actions`) para asegurar que la verificación de roles y permisos sea estricta y consistente.
    *   Prestar especial atención a las rutas de `admin` y `teacher`.
*   **4.2. Implementación de Políticas de Seguridad Adicionales:**
    *   Considerar la implementación de Rate Limiting en rutas críticas para prevenir ataques de fuerza bruta o abuso de API.
    *   Revisar la configuración de CORS y Content Security Policy (CSP) en `next.config.js` para mitigar ataques XSS y otras vulnerabilidades web.
*   **4.3. Gestión Segura de Variables de Entorno:**
    *   Asegurar que las variables de entorno sensibles (claves API, secretos de Supabase, etc.) no se expongan accidentalmente en el frontend.
    *   Revisar el uso de `NEXT_PUBLIC_` para asegurar que solo las variables intencionalmente públicas lo sean.
*   **4.4. Revisión de la Sincronización de Usuarios:**
    *   Auditar el flujo de `registerOrSyncUser` y la API `/api/auth/insertUser` para asegurar que la sincronización de roles y datos de usuario entre Supabase y Prisma sea segura y no introduzca brechas de seguridad.
*   **4.5. Actualización de Dependencias de Seguridad:**
    *   Revisar `package.json` y `yarn.lock` para identificar dependencias con vulnerabilidades conocidas.
    *   Actualizar las librerías a sus últimas versiones estables para incorporar parches de seguridad.

---

## 5. Mejora de la Generación y Gestión de Certificados

**Objetivo:** Optimizar el proceso de generación de certificados y mejorar la experiencia de usuario en su gestión y verificación.

**Problema Identificado:**
La generación de certificados es una característica clave. Es importante asegurar que el proceso sea eficiente, escalable y que los certificados sean fácilmente verificables y accesibles.

**Sub-tareas para Solucionar:**
*   **5.1. Optimización del Rendimiento de Generación:**
    *   Revisar `lib/certificate-image-generator.ts` y `services/certificateGeneratorService.ts` para identificar posibles cuellos de botella en la generación de imágenes y PDFs.
    *   Considerar el uso de servicios de procesamiento en segundo plano o funciones serverless para la generación de certificados si la carga es alta.
*   **5.2. Mejora de la Plantilla y Diseño:**
    *   Evaluar la flexibilidad de las plantillas de certificados (`templateId`, `data` en `Certificate` model).
    *   Ofrecer más opciones de personalización o plantillas predefinidas si es necesario.
*   **5.3. Robustez de la Verificación de QR Codes:**
    *   Asegurar que el proceso de verificación de QR codes sea robusto y que la URL de verificación sea persistente y fácil de usar.
    *   Probar la verificación en diferentes dispositivos y lectores de QR.
*   **5.4. Gestión de Errores en la Generación:**
    *   Implementar un manejo de errores más detallado para los casos en que la generación de un certificado falle.
    *   Notificar a los administradores o usuarios sobre fallos y proporcionar mecanismos de reintento.
*   **5.5. Interfaz de Usuario para Gestión de Certificados:**
    *   Mejorar la interfaz donde los usuarios pueden ver y descargar sus certificados.
    *   Asegurar que la navegación a `/certificates/view` sea intuitiva.

---

## 6. Estandarización y Mejora del Estilizado (Tailwind CSS & Shadcn/UI)

**Objetivo:** Asegurar la consistencia visual y la mantenibilidad del código CSS a través de una mejor aplicación de Tailwind CSS y Shadcn/UI.

**Problema Identificado:**
Aunque se utilizan Tailwind CSS y Shadcn/UI, la consistencia y la eficiencia del estilizado pueden mejorarse. El uso de `app/theme.css` para clases semánticas es una buena práctica, pero su aplicación podría no ser uniforme.

**Sub-tareas para Solucionar:**
*   **6.1. Auditoría de Clases CSS:**
    *   Revisar los componentes existentes para identificar el uso inconsistente de clases de Tailwind o la duplicación de estilos.
    *   Asegurar que las clases semánticas de `app/theme.css` se utilicen siempre que sea posible para estilos recurrentes.
*   **6.2. Creación de Componentes Reutilizables de UI:**
    *   Identificar patrones de UI que se repiten y encapsularlos en componentes de Shadcn/UI o componentes personalizados en `/components/ui` o `/components`.
    *   Promover la reutilización para reducir la duplicación de código y mejorar la mantenibilidad.
*   **6.3. Documentación de Convenciones de Estilizado:**
    *   Expandir `STYLE_GUIDE.md` con directrices claras sobre cómo usar Tailwind CSS, Shadcn/UI y las clases semánticas de `app/theme.css`.
    *   Incluir ejemplos de buenas prácticas y patrones a seguir.
*   **6.4. Revisión de la Configuración de Tailwind:**
    *   Asegurar que `tailwind.config.js` esté optimizado y que las personalizaciones (colores, fuentes, espaciado) estén bien definidas y sean consistentes con la marca.
    *   Verificar que el purgado de CSS esté funcionando correctamente para reducir el tamaño final del CSS.

---

## ✅ 7. Mejora de la Gestión de Errores y Logging

**Objetivo:** Implementar un sistema de gestión de errores más robusto y un logging más informativo para facilitar la depuración y el monitoreo.

**Problema Identificado:**
El manejo de errores y el logging son cruciales para la estabilidad y el mantenimiento de la aplicación. Aunque se usa `sonner` y `utils/debug/log.ts`, podría haber oportunidades para una gestión más centralizada y detallada de errores.

**Sub-tareas para Solucionar:**
*   **7.1. Centralización del Manejo de Errores:**
    *   Establecer un patrón consistente para el manejo de errores en el frontend y el backend.
    *   Considerar el uso de un servicio de monitoreo de errores (ej. Sentry, Bugsnag) para capturar y reportar errores en producción.
*   **7.2. Mejora del Logging:**
    *   Expandir el uso de `utils/debug/log.ts` para incluir más contexto en los logs (ej. ID de usuario, ruta, parámetros de la solicitud, stack traces completos).
    *   Implementar diferentes niveles de logging (info, warn, error, debug).
*   **7.3. Retroalimentación al Usuario sobre Errores:**
    *   Asegurar que los mensajes de error mostrados al usuario a través de `sonner` sean claros, útiles y no expongan información sensible del sistema.
    *   Proporcionar opciones para que los usuarios reporten errores directamente.
*   **7.4. Pruebas de Resiliencia:**
    *   Realizar pruebas de estrés y escenarios de fallo para verificar cómo la aplicación maneja los errores y si se recupera de manera elegante.

---

## 8. Optimización de la Base de Datos y Migraciones

**Objetivo:** Asegurar que el esquema de la base de datos sea eficiente y que las migraciones se gestionen de manera óptima.

**Problema Identificado:**
Un esquema de base de datos no optimizado o migraciones mal gestionadas pueden llevar a problemas de rendimiento y dificultades en el despliegue.

**Sub-tareas para Solucionar:**
*   **8.1. Revisión del Esquema de Prisma:**
    *   Auditar `prisma/schema.prisma` para identificar posibles optimizaciones en los modelos, relaciones e índices.
    *   Asegurar que los índices estén definidos en columnas frecuentemente consultadas para mejorar el rendimiento de las consultas.
*   **8.2. Optimización de Consultas Prisma:**
    *   Revisar las consultas de Prisma en las rutas API y Server Actions para asegurar que se utilicen `select`, `include` y `where` de manera eficiente para obtener solo los datos necesarios.
*   **8.3. Estrategia de Migraciones:**
    *   Documentar una estrategia clara para la gestión de migraciones de Prisma, incluyendo cómo manejar cambios en producción y rollbacks.
    *   Asegurar que los scripts de `seed.ts` sean robustos y se puedan ejecutar de forma segura.
*   **8.4. Monitoreo del Rendimiento de la Base de Datos:**
    *   Implementar herramientas de monitoreo para la base de datos PostgreSQL para identificar consultas lentas o cuellos de botella a nivel de base de datos.

---

## ✅ 9. Mejora de la Documentación Interna y Externa

**Objetivo:** Ampliar y mejorar la documentación del proyecto para facilitar el onboarding de nuevos desarrolladores y el mantenimiento a largo plazo.

**Problema Identificado:**
Aunque existen archivos Markdown (`/md`, `README.md`, `STYLE_GUIDE.md`), la documentación puede ser más exhaustiva y centralizada para cubrir todos los aspectos del proyecto.

**Sub-tareas para Solucionar:**
*   **✅ 9.1. Expansión del `README.md`:**
    *   Añadir secciones detalladas sobre la configuración del entorno de desarrollo, scripts de ejecución, estructura de directorios clave y directrices para contribuir.
*   **✅ 9.2. Documentación de Rutas API y Server Actions:**
    *   Crear o actualizar la documentación para cada ruta API y Server Action, describiendo su propósito, parámetros de entrada, formato de respuesta y requisitos de autenticación/autorización.
*   **✅ 9.3. Documentación de Componentes Reutilizables:**
    *   Documentar los componentes clave en `/components` y `/app/components`, incluyendo sus props, ejemplos de uso y cualquier consideración especial.
*   **✅ 9.4. Guía de Estilo de Código:**
    *   Ampliar `STYLE_GUIDE.md` con ejemplos de código, convenciones de nomenclatura y directrices para TypeScript, React y Next.js.
*   **✅ 9.5. Diagramas de Arquitectura y Flujos de Datos:**
    *   Considerar la creación de diagramas de alto nivel para ilustrar la arquitectura del sistema, los flujos de autenticación, pagos y generación de certificados.
