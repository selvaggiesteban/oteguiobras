# Otegui Obras - Web Corporativa

Sitio web corporativo premium para constructora, basado en las mejores prácticas de diseño web moderno.

## 🚀 Características Implementadas

### 🏠 HOME
- ✅ Hero principal con video de fondo y overlay
- ✅ Barra de métricas animadas (años de experiencia, m² construidos, proyectos)
- ✅ Sistema de categorías de obras (6 categorías)
- ✅ Obras destacadas con filtro por año (2023/2024)
- ✅ Sección certificación ISO 9001 con features
- ✅ Grid de empresas que confían
- ✅ FAQ (Preguntas Frecuentes) con accordion
- ✅ CTAs estratégicos en toda la página

### 🏗️ OBRAS
- ✅ Listado completo de proyectos
- ✅ Filtros por categoría
- ✅ Vista detalle individual por obra
- ✅ Galería de imágenes con navegación
- ✅ Información técnica completa
- ✅ Breadcrumb navigation

### 👥 EQUIPO
- ✅ Presentación del equipo

### 📞 CONTACTO
- ✅ Formulario de contacto
- ✅ Información de contacto

### 🔐 ADMIN
- Panel administrativo para gestión de contenido
- Gestión de obras
- Gestión de equipo

## 🎨 Diseño

Basado en la referencia: [OCRE Construcciones](https://ocreconstrucciones.com/)

### Características de diseño:
- Header transparente que se solidifica al hacer scroll
- Animaciones suaves y profesionales
- Diseño responsive mobile-first
- Paleta de colores premium (#d4a574 dorado, #1a1a1a negro)
- Tipografía moderna y legible
- Efectos hover y transiciones fluidas

## 🛠️ Tecnologías

- **React** 18.3
- **React Router** 6.x
- **Vite** 7.x
- **Firebase** (configurado para Firestore, Storage, Auth)
- CSS3 con variables custom
- Hooks personalizados (useCountUp, useAnimations, useInView)

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Admin/           # Panel administrativo
│   ├── Contacto/        # Formulario de contacto
│   ├── Equipo/          # Página del equipo
│   ├── FAQ/             # Preguntas frecuentes ✨ NUEVO
│   ├── Footer/          # Footer del sitio
│   ├── Header/          # Header con scroll effect ✨ ACTUALIZADO
│   ├── Home/            # Página principal ✨ REDISEÑADO COMPLETO
│   ├── Obras/           # Listado de obras
│   ├── ObraDetalle/     # Vista individual de obra ✨ NUEVO
│   ├── ScrollToTop/     # Scroll automático
│   └── TrabajaConNosotros/ # Carreras
├── data/
│   ├── equipoData.js    # Datos del equipo
│   └── obrasData.js     # Datos de obras ✨ EXPANDIDO
├── firebase/
│   └── config.js        # Configuración Firebase
├── hooks/
│   ├── useAnimations.js # Hook para animaciones IntersectionObserver
│   └── useCountUp.js    # Hook para números animados
└── main.jsx

```

## 🎯 Próximas Mejoras

### Admin Panel
- [ ] Gestión de FAQ desde admin
- [ ] Gestión de métricas desde admin
- [ ] Gestión de contenidos del home
- [ ] Gestión de empresas/clientes
- [ ] Upload de videos para hero
- [ ] Editor de textos institucionales

### Frontend
- [ ] Video real en hero (actualmente placeholder con imagen)
- [ ] Integración real con Firebase para contenidos dinámicos
- [ ] Sistema de búsqueda de obras
- [ ] Filtros avanzados por ubicación, año, cliente
- [ ] Blog/Novedades section
- [ ] Testimonios de clientes
- [ ] Certificados ISO descargables
- [ ] Mapa interactivo de obras

## 🚀 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

## 🌐 Deploy

El proyecto está configurado para HashRouter, ideal para deploy en:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## 📝 Notas de Desarrollo

### Cambios Principales vs Demo:
1. **Hero rediseñado**: Video background en lugar de carousel
2. **Métricas animadas**: Integración con useCountUp
3. **Sistema de categorías**: 6 categorías profesionales
4. **FAQ**: Componente accordion completo
5. **Detalle de obra**: Vista individual con galería
6. **Header transparente**: Efecto scroll profesional
7. **Datos expandidos**: 8 obras de ejemplo vs 3 originales

### Hooks Utilizados:
- `useCountUp`: Animación de números
- `useInView`: Detección de elementos en viewport
- `useState`, `useEffect`: React hooks estándar

## 🎨 Paleta de Colores

```css
--color-primary: #d4a574  /* Dorado/Beige */
--color-dark: #1a1a1a     /* Negro */
--color-white: #ffffff    /* Blanco */
--color-gray: #666666     /* Gris */
--color-light: #f9f9f9    /* Gris claro */
```

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 👨‍💻 Autor

Desarrollado para Otegui Obras

## 📄 Licencia

Proyecto privado - Todos los derechos reservados
