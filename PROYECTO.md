# Otegui Obras - Sitio Web Profesional

Sitio web profesional desarrollado con React + Vite para **Otegui Obras**, empresa líder en construcción con más de 20 años de experiencia en Buenos Aires, Argentina.

## 🚀 Características

### Páginas Principales
- **Home** - Landing page con hero, estadísticas, sobre nosotros, servicios, clientes y ubicación con mapa
- **Obras** - Galería de proyectos con filtros por categoría y páginas de detalle
- **Equipo** - Presentación del equipo profesional
- **Contacto** - Formulario de contacto, información de la empresa y mapa interactivo
- **Trabajá con Nosotros** - Portal de empleo con formulario de CV y posiciones abiertas
- **Admin** (`/admin`) - Panel CMS para gestionar contenido

### Sistema CMS
Panel de administración tipo PrestaShop para gestionar:
- ✅ **Obras**: Agregar, editar y eliminar proyectos
- ✅ **Equipo**: Gestionar miembros del equipo
- ✅ Marcar elementos como destacados
- ✅ Interfaz intuitiva con formularios completos

### Diseño
- 🎨 Basado en la identidad visual de oteguiobras.com
- ⚫ Colores: Negro (#000), Rojo (#e74c3c)
- 🔤 Tipografía: Arial
- 📱 Responsive design
- 🎯 UX profesional y seria

## 🛠️ Tecnologías

- **React 19** - Framework principal
- **React Router DOM** - Navegación (HashRouter)
- **Vite** - Build tool y dev server
- **CSS3** - Estilos personalizados

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 🌐 Estructura del Proyecto

```
src/
├── components/
│   ├── Header/          # Navegación principal
│   ├── Footer/          # Footer con contacto y redes
│   ├── Home/            # Página principal
│   ├── Obras/           # Galería de proyectos
│   ├── Equipo/          # Equipo profesional
│   ├── Contacto/        # Formulario de contacto
│   ├── TrabajaConNosotros/  # Portal de empleo
│   └── Admin/           # Panel CMS
├── data/
│   ├── obrasData.js     # Base de datos de obras
│   └── equipoData.js    # Base de datos del equipo
├── App.jsx              # Componente principal con rutas
├── App.css              # Estilos globales de la app
├── index.css            # Reset CSS y variables
└── main.jsx             # Entry point
```

## 🎯 Rutas

- `/` - Home
- `/obras` - Listado de obras
- `/obras/:id` - Detalle de obra individual
- `/equipo` - Equipo profesional
- `/contacto` - Formulario de contacto
- `/trabaja-con-nosotros` - Portal de empleo
- `/admin` - Panel de administración CMS

## 💾 Datos

Los datos actualmente se almacenan en memoria en los archivos:
- `src/data/obrasData.js`
- `src/data/equipoData.js`

Para persistencia real, se necesitaría implementar un backend con base de datos (MongoDB, PostgreSQL, etc.) y API REST.

## 🎨 Personalización

### Colores
Variables CSS en `src/index.css`:
```css
--color-primary: #e74c3c;
--color-primary-dark: #c0392b;
--color-black: #000000;
--color-dark: #1a1a1a;
--color-gray: #666666;
--color-light-gray: #f8f8f8;
--color-white: #ffffff;
```

### Agregar Obras
1. Ir a `/admin`
2. Click en "Gestionar Obras"
3. Click en "+ Nueva Obra"
4. Completar el formulario

### Agregar Miembros del Equipo
1. Ir a `/admin`
2. Click en "Gestionar Equipo"
3. Click en "+ Nuevo Miembro"
4. Completar el formulario

## 📞 Información de Contacto

- **Dirección**: Cochabamba 1355, CABA, Argentina
- **Teléfono**: 2080-1145
- **Email**: oficina@oteguiobras.com
- **Web**: https://oteguiobras.com/

## 🔗 Redes Sociales

- [Facebook](https://www.facebook.com/oteguiobrass/)
- [Instagram](https://www.instagram.com/oteguiobras/)
- [LinkedIn](https://www.linkedin.com/company/otegui-obras/)

## 📝 Licencia

Proyecto privado para Otegui Obras © 2025

---

Desarrollado con ❤️ para **Otegui Obras**
