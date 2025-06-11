# Estado de Issues y Clasificación por Prioridad

A continuación se listan los issues reportados, clasificados según si requieren cambios en la base de datos (DB) y ordenados por prioridad:

## Prioridad Alta



2. **Verificar token al restablecer contraseña ya que da acceso a la sesión sin restablecer la contraseña.**
   - **DB:** No (lógica de autenticación y seguridad)
   - **Notas:** Riesgo de seguridad, requiere revisión del flujo de autenticación.

3. **No manda el correo de restablecer contraseña a info@infectotropico.com**
   - **DB:** No (problema de envío de correo)
   - **Notas:** Revisar configuración SMTP o lógica de envío.

4. **Credenciales base de datos para acceso a Luis directo**
   - **DB:** Sí (acceso y permisos)
   - **Notas:** Requiere gestión de usuarios y permisos en la base de datos.

## Prioridad Media

5. **Funcionalidad de descargar información de usuarios**
   - **DB:** Sí (extracción de datos)
   - **Notas:** Implementar exportación de datos de usuarios.

6. **Página de todos los usuarios**
   - **DB:** Sí (listado de usuarios)
   - **Notas:** Crear vista para visualizar todos los usuarios registrados.

7. **En la página de estudiantes poner el progreso de módulos que lleva cda estudiante para ver en genral como van avanzando**
   - **DB:** Sí (progreso almacenado en DB)
   - **Notas:** Mostrar avance de cada estudiante en los módulos.

## Prioridad Baja

8. **Infectotrópico mal escrito en el catálogo. Quitar la palabra y dejar solo el logo redirigiendo a nuestro landing (infectotropico.com)**
   - **DB:** No (frontend/catálogo)
   - **Notas:** Cambiar texto y enlace en el catálogo.

9. **Cambiar número de WhatsApp de pagar por Yappi al número de Infectotrópico**
   - **DB:** No (frontend/configuración de contacto)
   - **Notas:** Actualizar número en la sección de pagos.

10. **Quitar "Mi Panel" del dropdown menu del usuario**
    - **DB:** No (frontend/UI)
    - **Notas:** Eliminar opción del menú desplegable.

11. **En Explorar cursos, dentro de la plataforma, la carta del curso mejorar el styling del tamaño de letra del título, podemos usar la misma carta del catálogo**
    - **DB:** No (frontend/UI)
    - **Notas:** Unificar estilos de cartas de cursos.

---

**Leyenda:**
- **DB:** Indica si el issue requiere cambios o acceso a la base de datos.
- **Prioridad:** Alta (bloqueante/seguridad), Media (funcionalidad), Baja (estética/UI).
