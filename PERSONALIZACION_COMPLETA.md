# 🎨 Guía de Personalización - Otegui Obras

## 📝 Contenidos a Personalizar

### 1. LOGO
**Ubicación**: `/public/logo-fondo-blanco.jpg`

Reemplazar con el logo de Otegui Obras:
- Formato recomendado: PNG con fondo transparente o JPG
- Dimensiones: Alto 40-50px, ancho proporcional
- Asegurarse que tenga buena visibilidad sobre fondo blanco y oscuro

### 2. IMÁGENES DEL HERO
**Ubicación**: `/public/`

Actualmente usando:
- `IMG-20251226-WA0067.jpg`
- `IMG-20251226-WA0073.jpg`
- `IMG-20251226-WA0076.jpg`

**Para agregar video de fondo**:
Editar en `src/components/Home/Home.jsx` línea ~32:
```jsx
// Reemplazar:
<div className="video-placeholder" style={{ backgroundImage: 'url(/IMG-20251226-WA0067.jpg)' }}>

// Por:
<video autoPlay muted loop playsInline className="hero-video-element">
  <source src="/video-hero.mp4" type="video/mp4" />
</video>
```

### 3. MÉTRICAS (Años, m², Proyectos)
**Ubicación**: `src/components/Home/Home.jsx` líneas ~18-20

```javascript
// CAMBIAR ESTOS VALORES:
const [yearsRef, years] = useCountUp(22, 2000);        // 22 años de experiencia
const [projectsRef, projects] = useCountUp(200, 2000); // 200 proyectos
const [m2Ref, m2] = useCountUp(150000, 2500);         // 150,000 m² construidos
```

### 4. OBRAS
**Ubicación**: `src/data/obrasData.js`

Agregar/editar obras reales:
```javascript
{
  id: 9, // Incrementar ID
  nombre: "NOMBRE DEL PROYECTO",
  categoria: "Industrial", // o Institucional, Gastronómico, Educativo, Hospitalario, Inmobiliario
  ubicacion: "Zona, Ciudad",
  año: 2024,
  descripcion: "Descripción detallada del proyecto...",
  imagen: "/ruta-imagen-principal.jpg", // o URL externa
  imagenes: [
    "/imagen1.jpg",
    "/imagen2.jpg",
    "/imagen3.jpg"
  ],
  destacada: true, // true para aparecer en home
  metrosCuadrados: 1500,
  cliente: "Nombre del Cliente" // Opcional
}
```

### 5. PREGUNTAS FRECUENTES (FAQ)
**Ubicación**: `src/components/FAQ/FAQ.jsx` línea ~7

Editar array de preguntas:
```javascript
const faqs = [
  {
    pregunta: "¿Tu pregunta?",
    respuesta: "Tu respuesta..."
  },
  // Agregar más...
];
```

### 6. EMPRESAS/CLIENTES
**Ubicación**: `src/components/Home/Home.jsx` líneas ~150-170

Reemplazar logos de empresas:
```jsx
<div className="empresa-logo">
  <img src="/logos/empresa1.png" alt="Nombre Empresa" />
</div>
```

**Recomendación**: Guardar logos en `/public/logos/` con nombres descriptivos.

### 7. INFORMACIÓN DE CONTACTO
**Ubicación**: `src/components/Contacto/Contacto.jsx`

Actualizar:
- Dirección
- Teléfonos
- Email
- Horarios de atención

**También en**: `src/components/Footer/Footer.jsx`

### 8. REDES SOCIALES
**Ubicación**: `src/components/Footer/Footer.jsx`

Actualizar links:
```jsx
<a href="https://instagram.com/oteguiobras" target="_blank">
<a href="https://facebook.com/oteguiobras" target="_blank">
<a href="https://linkedin.com/company/oteguiobras" target="_blank">
```

## 🎨 Colores

### Paleta Actual
**Ubicación**: `src/index.css` o archivos CSS individuales

```css
/* Primario: Dorado */
#d4a574

/* Secundario: Negro */
#1a1a1a

/* Blanco */
#ffffff

/* Grises */
#666666
#f9f9f9
#e5e5e5
```

### Cambiar Colores Globales

**Opción 1**: Búsqueda y reemplazo
- Buscar: `#d4a574`
- Reemplazar por: `#TU_COLOR_PRINCIPAL`

**Opción 2**: Variables CSS (recomendado)
Editar `src/index.css`:
```css
:root {
  --color-primary: #d4a574;  /* Cambiar aquí */
  --color-dark: #1a1a1a;
  --color-white: #ffffff;
}
```

Luego usar en CSS:
```css
background: var(--color-primary);
```

## 📄 Textos Institucionales

### Hero Principal
**Ubicación**: `src/components/Home/Home.jsx` líneas ~30-40

```jsx
<h1 className="hero-main-title">
  CONSTRUIMOS<br />
  <span className="hero-highlight">ESPACIOS</span>
</h1>
<p className="hero-subtitle">
  Líderes en construcción y desarrollo arquitectónico en Argentina
</p>
```

### Sección Certificación ISO
**Ubicación**: `src/components/Home/Home.jsx` líneas ~120-145

Editar texto institucional y características.

### Meta Tags (SEO)
**Ubicación**: `index.html`

```html
<title>Otegui Obras | Construcción Premium en Buenos Aires</title>
<meta name="description" content="Tu descripción SEO aquí" />
<meta property="og:title" content="Otegui Obras" />
<meta property="og:description" content="..." />
<meta property="og:image" content="/og-image.jpg" />
```

## 📁 Estructura de Carpetas Recomendada

```
public/
├── logos/                 # Logos de empresas
│   ├── empresa1.png
│   └── empresa2.png
├── obras/                 # Fotos de obras
│   ├── proyecto1/
│   │   ├── principal.jpg
│   │   ├── galeria1.jpg
│   │   └── galeria2.jpg
│   └── proyecto2/
├── equipo/                # Fotos del equipo
├── video-hero.mp4         # Video del hero (opcional)
├── logo-fondo-blanco.jpg  # Logo principal
└── favicon.ico            # Icono del sitio
```

## 🔄 Proceso de Actualización

1. **Preparar contenido**: Reunir todas las imágenes, textos y datos
2. **Subir imágenes**: Colocar en carpeta `/public/`
3. **Actualizar datos**: Modificar archivos `.js` con nueva información
4. **Actualizar textos**: Editar componentes con textos institucionales
5. **Probar localmente**: `npm run dev` y revisar cambios
6. **Build final**: `npm run build`
7. **Deploy**: Subir a servidor/hosting

## ⚠️ Importante

### No modificar:
- Estructura de carpetas `src/`
- Nombres de componentes
- Configuración de Vite
- Dependencias en `package.json` (sin consultar)

### Sí modificar:
- Contenido de archivos `.jsx` (textos, datos)
- Archivos CSS (estilos, colores)
- Archivos en `/public/` (imágenes, assets)
- `obrasData.js` y `equipoData.js`

## 📞 Soporte

Para dudas técnicas sobre personalización, referirse a:
- `DESARROLLO.md` - Documentación técnica
- `README.md` - Información general del proyecto

## ✅ Checklist de Personalización

- [ ] Logo actualizado
- [ ] Imágenes de hero/obras reemplazadas
- [ ] Métricas con valores reales
- [ ] Obras cargadas (mínimo 6-8)
- [ ] FAQ actualizado
- [ ] Logos de empresas reales
- [ ] Información de contacto actualizada
- [ ] Redes sociales vinculadas
- [ ] Colores corporativos aplicados
- [ ] Meta tags SEO configurados
- [ ] Favicon actualizado
- [ ] Equipo cargado con fotos y bios
- [ ] Probado en mobile y desktop
