# Guía de Personalización - Otegui Obras

Este archivo contiene instrucciones para personalizar la web con los recursos oficiales de la marca.

## 📝 Pasos para Personalizar

### 1. Logo

**Ubicación del logo:**
- `src/assets/logo.png` o `logo.svg` (SVG recomendado para mejor calidad)

**Archivos a modificar:**
- `src/components/Header/Header.jsx` - Línea 7-9

```jsx
// Reemplazar:
<h1>Otegui</h1>

// Por:
<img src="/src/assets/logo.svg" alt="Otegui Obras" className="logo-image" />
```

**CSS del logo:**
`src/components/Header/Header.css` - Agregar:

```css
.logo-image {
  height: 50px;
  width: auto;
  transition: transform 0.3s ease;
}

.logo:hover .logo-image {
  transform: scale(1.05);
}
```

---

### 2. Paleta de Colores

**Archivo principal:** `src/index.css` - Líneas 6-13

```css
:root {
  /* Colores actuales (reemplazar con los oficiales) */
  --color-primary: #e74c3c;        /* Rojo principal */
  --color-primary-dark: #c0392b;   /* Rojo oscuro */
  --color-black: #000000;          /* Negro */
  --color-dark: #1a1a1a;           /* Gris oscuro */
  --color-gray: #666666;           /* Gris medio */
  --color-light-gray: #f8f8f8;     /* Gris claro */
  --color-white: #ffffff;          /* Blanco */
}
```

**Ejemplo con paleta personalizada:**

```css
:root {
  --color-primary: #TU_COLOR_PRINCIPAL;
  --color-primary-dark: #TU_COLOR_PRINCIPAL_OSCURO;
  --color-accent: #TU_COLOR_ACENTO;
  --color-black: #TU_NEGRO;
  --color-dark: #TU_GRIS_OSCURO;
  --color-gray: #TU_GRIS_MEDIO;
  --color-light-gray: #TU_GRIS_CLARO;
  --color-white: #TU_BLANCO;
}
```

---

### 3. Tipografía

**Opción A: Fuente de Google Fonts**

1. Agregar en `index.html` (dentro de `<head>`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=TU_FUENTE:wght@400;500;600;700&display=swap" rel="stylesheet">
```

2. Actualizar en `src/index.css`:

```css
:root {
  font-family: 'TU_FUENTE', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'TU_FUENTE_TITULOS', sans-serif; /* Si usan fuente diferente para títulos */
}
```

**Opción B: Fuentes locales**

1. Crear carpeta `src/assets/fonts/`
2. Copiar archivos de fuentes (.woff2, .woff, .ttf)
3. Crear `src/assets/fonts/fonts.css`:

```css
@font-face {
  font-family: 'TuFuente';
  src: url('./TuFuente-Regular.woff2') format('woff2'),
       url('./TuFuente-Regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'TuFuente';
  src: url('./TuFuente-Bold.woff2') format('woff2'),
       url('./TuFuente-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

4. Importar en `src/main.jsx`:

```jsx
import './assets/fonts/fonts.css'
```

---

### 4. Imágenes

**Estructura recomendada:**
```
src/assets/
├── images/
│   ├── hero/
│   │   └── hero-principal.jpg
│   ├── obras/
│   │   ├── proyecto-1.jpg
│   │   ├── proyecto-2.jpg
│   │   └── ...
│   ├── equipo/
│   │   ├── miembro-1.jpg
│   │   ├── miembro-2.jpg
│   │   └── ...
│   └── clientes/
│       ├── cliente-1.png
│       └── ...
```

**Archivos a actualizar:**

1. **Home (Hero):**
   - `src/components/Home/Home.jsx` - Línea 30-32
   ```jsx
   <img src="/src/assets/images/hero/hero-principal.jpg" alt="..." />
   ```

2. **Obras:**
   - `src/data/obrasData.js` - Actualizar URLs de imágenes
   ```javascript
   imagen: "/src/assets/images/obras/proyecto-1.jpg"
   ```

3. **Equipo:**
   - `src/data/equipoData.js` - Actualizar fotos
   ```javascript
   foto: "/src/assets/images/equipo/miembro-1.jpg"
   ```

4. **Clientes:**
   - `src/components/Home/Home.jsx` - Líneas 102-122
   ```jsx
   <img src="/src/assets/images/clientes/cliente-1.png" alt="Cliente 1" />
   ```

---

### 5. Favicon

1. Generar favicon en múltiples tamaños: https://realfavicongenerator.net/
2. Reemplazar archivos en `public/`
3. Actualizar `index.html`:

```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

---

### 6. Metadata y SEO

**Actualizar en `index.html`:**

```html
<title>Otegui Obras - Construcción de Calidad en Buenos Aires</title>
<meta name="description" content="Tu descripción oficial de la empresa">
<meta name="keywords" content="construcción, obras, Buenos Aires, CABA">

<!-- Open Graph / Facebook -->
<meta property="og:title" content="Otegui Obras">
<meta property="og:description" content="Tu descripción">
<meta property="og:image" content="/og-image.jpg">
<meta property="og:url" content="https://oteguiobras.com">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Otegui Obras">
<meta name="twitter:description" content="Tu descripción">
<meta name="twitter:image" content="/twitter-image.jpg">
```

---

## 🎨 Recomendaciones de Diseño

### Imágenes
- **Hero:** 1920x1080px (16:9) - JPG optimizado (< 500KB)
- **Obras:** 800x600px (4:3) - JPG optimizado (< 200KB cada una)
- **Equipo:** 400x400px (1:1) - JPG optimizado (< 150KB cada una)
- **Clientes (logos):** PNG transparente, max 300px de ancho

### Optimización
- Usar herramientas como TinyPNG o Squoosh para comprimir imágenes
- Considerar formato WebP para mejor compresión
- Agregar lazy loading para imágenes fuera del viewport

---

## 📋 Checklist Final

- [ ] Logo agregado y funcionando en Header
- [ ] Colores actualizados en `index.css`
- [ ] Tipografía configurada
- [ ] Imágenes del hero reemplazadas
- [ ] Imágenes de obras actualizadas
- [ ] Fotos del equipo actualizadas
- [ ] Logos de clientes agregados
- [ ] Favicon actualizado
- [ ] Metadata y SEO configurados
- [ ] Testeado en diferentes navegadores
- [ ] Testeado en móvil/tablet
- [ ] Performance optimizado (Google PageSpeed)

---

## 💡 Consejos

1. **Backup:** Antes de hacer cambios, crear una copia de los archivos originales
2. **Git:** Hacer commits frecuentes mientras personalizas
3. **Testing:** Probar en Chrome, Firefox, Safari y Edge
4. **Mobile First:** Verificar que todo se vea bien en móvil
5. **Performance:** Mantener imágenes optimizadas (< 500KB cada una)

---

## 🆘 Soporte

Si necesitas ayuda con la personalización:
1. Revisar este documento primero
2. Verificar que las rutas de archivos sean correctas
3. Usar las DevTools del navegador para debuggear
4. Consultar la documentación de React si es necesario
