# Notas de Desarrollo

## 2024-05-05
- Ampliado el esquema de base de datos a 11 tablas con relaciones para usuarios, roles, sensores, parámetros, lecturas, alertas, reportes, favoritos, zonas protegidas y configuraciones por cuerpo de agua.
- Implementado sistema de autenticación JWT con registro/login y protección de rutas de escritura.
- Añadidos endpoints CRUD básicos para nuevas entidades (sensores, parámetros, lecturas, alertas, reportes, zonas protegidas, favoritos y configuraciones de parámetros).
- Actualizados README y `backend/db_schema_overview.md` para reflejar arquitectura, endpoints y flujo de ejecución.

## 2025-12-05
- Ajustado hashing de contraseñas a PBKDF2-SHA256 nativo (sin dependencias externas) y JWT HS256 manual para evitar fallos de instalación.
- Corregido `database.py` (imports) y endpoint `/health` (usa `text("SELECT 1")`) para asegurar arranque del backend.
- Confirmado autenticación: registro, login y `/auth/me`; comprobado acceso 401/200 en rutas protegidas.
- Añadidos tests de humo con `pytest` (health y favoritos sin token) y documentado ejecución de pruebas.
- Actualizados README (raíz y backend) y `backend/db_schema_overview.md` con 12 tablas totales y ejemplos de uso.
- `docker compose up` no se pudo ejecutar en este entorno porque el binario `docker` no está disponible.

## 2025-12-06
- Integrado flujo completo de autenticación en frontend (login/registro, guardado de token y estado global) mostrando rol y cierre de sesión.
- Nueva UI React con mapa Leaflet y vista de datos que consumen `GET /cuerpos-agua` en vivo; eliminada la dependencia de HTML estático.
- Botón “Registrar cuerpo de agua” visible solo para roles admin/analista; formulario protegido envía `POST /cuerpos-agua` y recarga mapa/tabla.
- Modelo `cuerpos_agua` ahora guarda `creado_por_id`; `POST/PUT/DELETE /cuerpos-agua` requieren rol y registran eventos en `logs_acceso`, generando reporte inicial.
- Actualizadas documentaciones (README, backend/README, db_schema_overview) para reflejar autenticación web y CRUD protegido.
