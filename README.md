# Otegui Obras - Frontend & API

Este repositorio contiene el código fuente y los artefactos de despliegue para el sitio web de Otegui Obras.

## 🚀 Guía de Despliegue (Deploy)

Para actualizar el sitio web en el servidor de hosting, se debe utilizar el contenido de la rama **`deploy`**.

### Documentos a subir al Hosting
Después de realizar el último compilado disponible en la rama `deploy`, los siguientes archivos y carpetas deben estar presentes en la raíz del servidor (`public_html`):

1.  **`dist/`**: Contiene los archivos estáticos compilados (HTML, CSS, JS).
2.  **`api/`**: Contiene toda la lógica del servidor en PHP.
3.  **`index.html`**: El archivo de entrada principal (ubicado en la raíz, copiado desde `dist/index.html`).
4.  **`.htaccess`**: Archivo de configuración del servidor para manejar las rutas de React.

### Proceso de Actualización
La forma más segura de actualizar el sitio es mediante el uso del script `deploy.php`:
1. Subir `deploy.php` a la raíz del servidor.
2. Ejecutar la URL: `https://oteguiobras.com/deploy.php?key=TU_CLAVE_SECRETA`

**⚠️ IMPORTANTE:**
- **NO** sobrescribir la carpeta `images/` ni la base de datos, ya que contienen datos cargados manualmente desde el panel de administración.
- **NO** utilizar `install.php` en servidores de producción, ya que reseteará todo el sitio.
