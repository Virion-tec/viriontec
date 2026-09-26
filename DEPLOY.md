# Guardado persistente con PostgreSQL

El sitio ahora lee y guarda el contenido del administrador desde PostgreSQL mediante `server.js`. Despliega el proyecto como servicio Node.js (no como sitio estático de GitHub Pages) y añade estas variables en el proveedor:

- `DATABASE_URL`: cadena de conexión privada de PostgreSQL.
- `DATABASE_SSL=true` si el proveedor de base de datos exige TLS.
- `ADMIN_USER` y `ADMIN_PASSWORD`: credenciales iniciales seguras para el panel. Solo se usan al crear la cuenta inicial; después el usuario y contraseña se editan desde Admin.
- `NODE_ENV=production`.
- `PORT`: lo asigna normalmente el proveedor.

Comando de inicio: `npm start`. En el primer arranque se crean `site_content` y `admin_credentials`. El primer guardado del panel crea el registro del contenido en `site_content`; si aún no existe, las páginas muestran `js/data.js` como contenido inicial. El cambio de usuario y contraseña se guarda con hash scrypt en PostgreSQL. La sesión de administrador usa una cookie `HttpOnly` y vence a las 8 horas.

GitHub Pages solo publica archivos estáticos y no ejecuta Node.js: para persistencia real, publica este mismo proyecto en un servicio Node que pueda conectarse a PostgreSQL. Sin la API conectada, el admin no permite iniciar sesión; los borradores anteriores de un navegador permanecen en su `localStorage` y no se sincronizan por sí solos. El backend y el frontend deben servirse desde el mismo dominio para que la cookie de administrador funcione sin configurar CORS.

En Railway, vincula el servicio Node con PostgreSQL y verifica que `DATABASE_URL`, `ADMIN_USER` y `ADMIN_PASSWORD` estén configuradas en el servicio web. Abre `/api/status`: debe mostrar `database: true` y `adminConfigured: true`. Si necesitas recuperar el acceso, configura temporalmente `ADMIN_RESET_ON_START=true` junto con el usuario y contraseña que quieres usar y vuelve a desplegar; después elimina `ADMIN_RESET_ON_START` para que los siguientes despliegues no vuelvan a cambiar la clave.

Para transferir cambios que quedaron solo en la PC 1, vuelve a abrir el admin desde ese equipo después de conectar el backend. Si `/api/status` muestra `contentConfigured: false`, el sitio conserva en ese navegador la copia local. Inicia sesión y guarda una sección, por ejemplo **Guardar cambios de combos**: el admin envía el objeto completo, incluidas las URLs de imágenes, a PostgreSQL. Luego revisa `/api/status` (`contentConfigured: true`) y abre el sitio desde la PC 2. No borres los datos del navegador de la PC 1 antes de esta migración.

No agregues contraseñas al repositorio. `ADMIN_PASSWORD` debe configurarse en Railway como variable secreta; el servidor solo almacena un hash scrypt en PostgreSQL.
