# Guía de Deploy — Otegui Obras → LatinCloud

## Archivos generados

| Archivo | Tamaño | Contenido |
|---------|--------|-----------|
| `deploy-oteguiobras-no-video.zip` | 3.3 MB | App + API + imágenes estáticas (sin videos) |
| `deploy-oteguiobras.zip` | 67 MB | Todo incluyendo videos (subir por FTP) |
| `migration/schema-and-seed.sql` | — | Schema + datos iniciales MySQL |

## PASO 1: Ejecutar SQL en phpMyAdmin

1. Ingresar a **DirectAdmin** → `https://ar141.xvserver.com:2222`
2. Ir a **phpMyAdmin** (sección MySQL Databases)
3. Seleccionar base de datos `oteguiobra_web`
4. Click en tab **SQL**
5. Copiar y pegar el contenido de `migration/schema-and-seed.sql`
6. Click **Go** / **Continuar**

Esto crea las tablas `obras`, `equipo`, `contacto`, `postulaciones`, `config`, `admins` e inserta:
- Admin: `admin@oteguiobras.com` / `Otegui2026!`
- Config: hero, métricas, clientes, FAQ, obras destacadas

## PASO 2: Subir archivos via File Manager

### Opción A: ZIP (recomendado, sin videos)

1. En DirectAdmin → **File Manager**
2. Navegar a `public_html/`
3. **BORRAR** archivos existentes (si hay sitio viejo): seleccionar todo → Delete
4. Click **Upload**
5. Subir `deploy-oteguiobras-no-video.zip`
6. Click derecho sobre el ZIP → **Extract** (descomprimir)
7. Verificar que quedó la estructura:
   ```
   public_html/
   ├── .htaccess
   ├── index.html
   ├── assets/
   ├── api/
   │   ├── .htaccess
   │   ├── config.php
   │   ├── auth/
   │   ├── config/
   │   ├── contacto/
   │   ├── equipo/
   │   ├── middleware/
   │   ├── obras/
   │   └── postulaciones/
   ├── images/
   │   ├── obras/
   │   ├── equipo/
   │   ├── hero/
   │   └── obras-destacadas/
   ├── cvs/
   ├── logos/
   └── *.jpg, *.avif, *.svg
   ```
8. **BORRAR** el archivo ZIP después de extraer

### Subir videos por separado

Los videos pesan 32MB c/u. Subir por FTP (FileZilla) o upload directo:

9. Subir `hero-video.mp4` → `public_html/hero-video.mp4`
10. Subir `WhatsApp Video 2026-03-20 at 14.45.05.mp4` → `public_html/WhatsApp Video 2026-03-20 at 14.45.05.mp4`

### Opción B: FTP completo

Si tenés FileZilla u otro cliente FTP:
- Host: `ar141.xvserver.com`
- Usuario: `oteguiobra`
- Contraseña: (tu contraseña de DirectAdmin)
- Puerto: 21 (FTP) o 22 (SFTP)
- Subir todo el contenido de `dist/` a `public_html/`

## PASO 3: Verificar permisos

En File Manager, verificar permisos:
- Directorios: `755`
- Archivos PHP: `644`
- `.htaccess`: `644`
- Directorios de upload (`images/obras`, `images/equipo`, `cvs/`): `755`

Si algún directorio de upload da error 403, cambiar a `777` temporalmente.

## PASO 4: Verificar deploy

1. **Sitio público**: Abrir `https://oteguiobras.com`
   - Debe cargar React app
   - Hero con video/métricas
   - Sección clientes con logos
   - FAQ funcional
   - Obras destacadas con imágenes

2. **API**: Abrir `https://oteguiobras.com/api/config/home`
   - Debe devolver JSON con config del hero

3. **Admin**: Abrir `https://oteguiobras.com/#/admin`
   - Debe mostrar login
   - Ingresar: `admin@oteguiobras.com` / `Otegui2026!`
   - Debe acceder al panel completo

4. **CRUD**: En admin, probar:
   - Crear obra → subir imagen → guardar
   - Editar equipo
   - Modificar config home
   - Ver mensajes de contacto

## PASO 5: Checklist final

- [ ] SQL ejecutado en phpMyAdmin
- [ ] Archivos subidos a `public_html/`
- [ ] `.htaccess` raíz presente
- [ ] `api/.htaccess` presente
- [ ] Directorios `images/obras/`, `images/equipo/`, `cvs/` creados
- [ ] Videos subidos
- [ ] `oteguiobras.com` carga OK
- [ ] `/api/config/home` devuelve JSON
- [ ] `/#/admin` login funciona
- [ ] CRUD funciona (crear obra, subir imagen)
- [ ] Formulario contacto funciona sin login
- [ ] SSL/HTTPS activo (si corresponde)

## Notas

- HashRouter: no necesita rewrite rules para SPA routes
- PHP sessions: `credentials: 'include'` en fetch del frontend
- CORS: `.htaccess` acepta `http(s)://*.oteguiobras.com`
- Upload límite: 5MB imágenes, 10MB video/CV (configurado en PHP)
