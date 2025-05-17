# STYLE_GUIDE.md

Guía de Estilos – RobotiPA EDU

---

## Paleta de Colores Oficial

| Nombre semántico      | Token Tailwind         | HEX         | Uso principal                |
|-----------------------|-----------------------|-------------|------------------------------|
| brand-primary         | brand-primary         | #1E3A2B     | Color principal, botones     |
| brand-accent          | brand-accent          | #8CC63F     | Acentos, highlights          |
| bg-base               | bg-base               | #FCFCF8     | Fondo general                |
| bg-card               | bg-card               | #FCFCF8     | Fondo de tarjetas            |
| text-heading          | text-heading          | #212529     | Títulos                      |
| text-body             | text-body             | #343A40     | Texto principal              |
| text-link             | text-link             | #1E3A2B     | Enlaces                      |
| border-default        | border-default        | #DEE2E6     | Bordes                       |
| primary               | primary               | (CSS var)   | Color principal (Shadcn/UI)  |
| secondary             | secondary             | (CSS var)   | Color secundario             |
| destructive           | destructive           | (CSS var)   | Errores, advertencias        |
| muted                 | muted                 | (CSS var)   | Texto deshabilitado/mutado   |
| card                  | card                  | (CSS var)   | Fondo de tarjetas            |

*Los tokens con (CSS var) usan variables CSS de Shadcn/UI y pueden cambiar según el tema.*

---

## Tipografía

- **Familia principal:** `"Renogare Soft", "ChaletBook", sans-serif`
- **Tamaños y pesos recomendados:**
  - **H1:** `.title-h1` → `text-4xl md:text-5xl font-bold`
  - **H2:** `.title-h2` → `text-3xl md:text-4xl font-semibold`
  - **H3:** `.title-h3` → `text-2xl md:text-3xl font-semibold`
  - **Cuerpo:** `.text-body-default` → `text-base`
  - **Botón:** `.btn-primary`, `.btn-secondary` → `text-base font-semibold`
  - **Caption:** `.text-caption` → `text-sm text-muted-foreground`

---

## Uso de Clases Temáticas

El archivo `app/theme.css` centraliza clases semánticas de alto nivel para mantener consistencia visual y facilitar el mantenimiento. **Siempre que sea posible, usa estas clases en lugar de múltiples utilidades Tailwind.**

- Ejemplo:  
  ```jsx
  <button className="btn-primary">Acción</button>
  <div className="card-base">...</div>
  <input className="input-default" />
  ```

**¿Cuándo usar Tailwind directamente?**
- Para utilidades muy específicas, espaciados puntuales, o cuando no exista una clase semántica adecuada en `theme.css`.

---

## Componentes Clave

### Botón Primario
```jsx
// ANTES
<button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-3 text-base font-semibold">
  Guardar
</button>

// DESPUÉS
<button className="btn-primary">
  Guardar
</button>
```

### Tarjeta
```jsx
// ANTES
<div className="rounded-md bg-card text-card-foreground p-6">
  <h2 className="text-3xl md:text-4xl font-semibold text-heading mb-3">Título</h2>
  <p className="text-base text-body">Contenido de la tarjeta.</p>
</div>

// DESPUÉS
<div className="card-base">
  <h2 className="title-h2">Título</h2>
  <p className="text-body-default">Contenido de la tarjeta.</p>
</div>
```

### Input
```jsx
// ANTES
<input
  className="bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground"
/>

// DESPUÉS
<input className="input-default" />
```

### Footer (ejemplo)
```jsx
// ANTES
<div className="flex items-center p-6 pt-0">
  <span className="text-sm text-muted-foreground">© 2025 Nombre</span>
</div>

// DESPUÉS
<div className="card-footer">
  <span className="text-caption">© 2025 Nombre</span>
</div>
```

---

## Espaciado y Otros Patrones

- Usa `.section-padding` para el espaciado vertical estándar de secciones.
- Las tarjetas y contenedores usan padding interno definido en `.card-base`.
- Los títulos y textos tienen márgenes inferiores para separación visual.
- Para divisores, usa la clase `.divider`.

---

**Recuerda:**  
Siempre revisa `app/theme.css` antes de crear nuevas combinaciones de utilidades. Si un patrón se repite, considera agregar una clase semántica nueva.
