# 🔥 Configuración de Firebase para Otegui Obras

## 📋 Pasos para configurar Firebase

### 1. Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto"
3. Nombre del proyecto: `otegui-obras`
4. Sigue los pasos del asistente

### 2. Configurar Firestore Database

1. En el menú lateral, ve a **Build > Firestore Database**
2. Click en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (luego cambiaremos las reglas)
4. Elige la ubicación: `southamerica-east1` (São Paulo)

### 3. Obtener credenciales

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. En la sección "Tus apps", click en el ícono `</>`  (Web)
3. Registra la app con el nombre: `Otegui Obras Web`
4. Copia las credenciales que aparecen

### 4. Configurar variables de entorno

1. Crea un archivo `.env` en la raíz del proyecto:
```bash
cp .env.example .env
```

2. Edita el archivo `.env` y pega tus credenciales:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=otegui-obras.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=otegui-obras
VITE_FIREBASE_STORAGE_BUCKET=otegui-obras.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Configurar Storage (para imágenes)

1. En Firebase Console, ve a **Build > Storage**
2. Click en "Comenzar"
3. Acepta las reglas predeterminadas

### 6. Configurar reglas de seguridad

#### Firestore Rules

Ve a **Firestore Database > Reglas** y pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública para obras y equipo
    match /otegui_obras/{document=**} {
      allow read: if true;
      allow write: if false; // Cambiar cuando tengas autenticación
    }
    
    match /otegui_equipo/{document=**} {
      allow read: if true;
      allow write: if false;
    }
    
    // Mensajes de contacto y postulaciones solo escritura
    match /otegui_contacto/{document=**} {
      allow read: if false;
      allow create: if true;
    }
    
    match /otegui_postulaciones/{document=**} {
      allow read: if false;
      allow create: if true;
    }
  }
}
```

#### Storage Rules

Ve a **Storage > Reglas** y pega esto:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /otegui/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Cambiar cuando tengas autenticación
    }
  }
}
```

### 7. Ejecutar el proyecto

```bash
npm install
npm run dev
```

## 🗂️ Estructura de Colecciones Firebase

### `otegui_obras`
```javascript
{
  nombre: string,
  categoria: string, // 'Residencial', 'Comercial', etc.
  ubicacion: string,
  año: number,
  descripcion: string,
  imagen: string, // URL de la imagen
  metrosCuadrados: number,
  cliente: string,
  destacada: boolean,
  visible: boolean,
  orden: number,
  fechaCreacion: timestamp,
  fechaModificacion: timestamp
}
```

### `otegui_equipo`
```javascript
{
  nombre: string,
  cargo: string,
  especialidad: string,
  email: string,
  telefono: string,
  foto: string, // URL de la foto
  linkedin: string,
  descripcion: string,
  destacado: boolean,
  visible: boolean,
  orden: number,
  fechaCreacion: timestamp,
  fechaModificacion: timestamp
}
```

### `otegui_contacto`
```javascript
{
  nombre: string,
  email: string,
  telefono: string,
  asunto: string,
  mensaje: string,
  fecha: timestamp,
  leido: boolean
}
```

### `otegui_postulaciones`
```javascript
{
  nombre: string,
  email: string,
  telefono: string,
  puesto: string,
  experiencia: string,
  cv: string, // URL del CV
  fecha: timestamp,
  revisado: boolean
}
```

## 🔒 Seguridad (Próximos pasos)

Por ahora, las reglas están configuradas para:
- ✅ **Lectura pública** de obras y equipo
- ❌ **Escritura bloqueada** desde el cliente (usar admin panel con autenticación)
- ✅ **Solo crear** mensajes de contacto y postulaciones

**IMPORTANTE**: Para permitir escritura desde el admin panel, implementa autenticación:

1. Activa **Authentication > Email/Password** en Firebase
2. Crea usuarios admin
3. Actualiza las reglas para permitir escritura solo a usuarios autenticados

## 📱 Panel de Administración

Una vez configurado Firebase, accede al admin en:

```
http://localhost:5174/#/admin
```

Desde ahí podrás:
- ✏️ Crear, editar y eliminar obras
- 👥 Gestionar equipo
- 👁️ Mostrar/ocultar elementos
- ⭐ Marcar obras destacadas
- 🔢 Ordenar elementos

## 🚀 Deployment

Cuando despliegues a producción, no olvides:

1. Actualizar las reglas de Firestore para producción
2. Configurar las variables de entorno en tu hosting
3. Agregar tu dominio a la lista de dominios autorizados en Firebase

---

**¿Necesitas ayuda?** Revisa la [documentación de Firebase](https://firebase.google.com/docs)
