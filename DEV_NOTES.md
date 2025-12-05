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

## 2025-07-01
- Flujo web completo de autenticación en React (registro/login con token en `localStorage` y contexto global de usuario).
- Nuevo modal de creación de cuerpos de agua (solo visible para roles admin/analista) que dispara `POST /cuerpos-agua` sin alterar el fondo y refresca mapa y tabla en caliente.
- Backend: campo `creado_por_id` en `cuerpos_agua`, logs enriquecidos con `cuerpo_agua_id`, y endpoints protegidos para crear/editar/eliminar cuerpos de agua con registro automático en `logs_acceso` y reporte inicial.
- Vistas de datos y mapa consumen `/cuerpos-agua` real (sin mocks) y calculan totales/biodiversidad/contaminación desde la base de datos.
