# Módulo de Seguimiento con Firebase Firestore

Este módulo permite registrar la actividad del usuario en tu aplicación Next.js utilizando Firebase Firestore, sin requerir autenticación de Firebase. Está diseñado para integrarse con la autenticación existente de Supabase y realizar un seguimiento anónimo y autenticado de clics y vistas de página.

## Funciones Principales

### 1. `initializeAnonymousTrackingId()`

- Asegura que cada usuario tenga un ID anónimo único almacenado en `localStorage`.
- Si no existe un ID, genera uno nuevo (UUID) y lo guarda.
- Este ID se usa para rastrear la actividad del usuario de forma anónima.

### 2. `linkSupabaseUser(user)`

- Vincula el ID anónimo con el ID de usuario autenticado de Supabase cuando el usuario inicia sesión.
- Guarda esta vinculación en la colección `user_anonymous_supabase_links` en Firestore con una marca de tiempo.
- Permite correlacionar la actividad anónima con el usuario autenticado.

### 3. `trackClick(elementName, additionalData)`

- Registra un evento de clic con detalles como:
  - ID anónimo
  - ID de usuario Supabase (si está autenticado)
  - Nombre del elemento clicado
  - Timestamp
  - URL actual
  - User agent del navegador
  - Datos adicionales opcionales
- Guarda el evento en la colección `user_clicks` de Firestore.

### 4. `trackPageView(path, title)`

- Registra un evento de vista de página con detalles como:
  - ID anónimo
  - ID de usuario Supabase (si está autenticado)
  - Ruta y título de la página
  - Timestamp
  - Referente (referrer)
  - User agent del navegador
- Guarda el evento en la colección `user_pageviews` de Firestore.

## Uso

- Llama a `initializeAnonymousTrackingId()` al inicio de la aplicación en el cliente para asegurar que el usuario tenga un ID anónimo.
- Usa `linkSupabaseUser()` cuando el estado de autenticación de Supabase cambie para vincular el ID anónimo con el usuario autenticado.
- Llama a `trackPageView()` en cada cambio de ruta para registrar vistas de página.
- Llama a `trackClick()` en eventos de clic para registrar interacciones específicas.

## Beneficios

- Seguimiento anónimo y autenticado sin interferir con la autenticación de Supabase.
- Persistencia del ID anónimo en el navegador.
- Almacenamiento seguro y escalable en Firestore.
- Reglas de seguridad configuradas para permitir escritura pública en las colecciones de seguimiento.

Este módulo facilita la obtención de datos valiosos sobre el comportamiento del usuario para análisis y mejora continua de la aplicación.
