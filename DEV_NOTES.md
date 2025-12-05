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
- Frontend React reorientado a consumir datos reales: mapa Leaflet, tabla y tarjetas de monitoreo leen `cuerpos_agua` vía API.
- Flujo de autenticación integrado (login/registro) con almacenamiento de token y visualización de rol; botón “Añadir nuevo cuerpo de agua” solo para roles admin/analista.
- Formulario protegido crea registros en `cuerpos_agua` y refresca mapa/tabla; se soportan favoritos (`user_favorites`).
- Backend: `cuerpos_agua` ahora guarda `creado_por_id`, expone PUT/DELETE protegidos por rol, crea reporte inicial y registra logs en `logs_acceso`.
- Documentación actualizada (README y backend/README) para reflejar endpoints de autenticación y gestión de cuerpos de agua.
