# Resumen del esquema de base de datos

Este documento refleja el estado actual del ORM en `backend/models.py`.
Hay **12 tablas** totales: 1 heredada del proyecto original y 11 agregadas en la refactorización.

## Tablas existentes
- **cuerpos_agua** (existente): id, nombre, tipo, latitud, longitud, contaminacion, biodiversidad,
  descripcion, temperatura, ph, oxigeno_disuelto, fecha_creacion, fecha_actualizacion.
  Relaciones: sensores, lecturas_sensores, alertas, reportes, user_favorites, zonas_protegidas, cuerpo_parametros.

## Tablas nuevas
1. **roles**: id, nombre (único), descripcion, created_at. 1-N con users.
2. **users**: id, email (único), password_hash (PBKDF2-SHA256), full_name, created_at, updated_at,
   last_login, role_id (FK roles). Relaciones: role, favoritos, reportes, logs_acceso.
3. **sensores**: id, nombre, tipo, cuerpo_agua_id (FK cuerpos_agua), latitud, longitud,
   descripcion, instalado_en, activo. Relaciones: lecturas.
4. **parametros_ambientales**: id, nombre (único), unidad, valor_minimo, valor_maximo, descripcion.
   Relaciones: lecturas, alertas, configuraciones.
5. **lecturas_sensores**: id, sensor_id (FK sensores), parametro_id (FK parametros_ambientales),
   cuerpo_agua_id (FK cuerpos_agua), valor, unidad, tomado_en, observaciones. Relaciones: alertas.
6. **zonas_protegidas**: id, cuerpo_agua_id (FK cuerpos_agua), nombre, categoria,
   descripcion, area_km2, estado.
7. **alertas**: id, cuerpo_agua_id (FK cuerpos_agua), lectura_id (FK lecturas_sensores opcional),
   parametro_id (FK parametros_ambientales opcional), nivel, mensaje, creada_en, resuelta.
8. **reportes**: id, cuerpo_agua_id (FK cuerpos_agua), usuario_id (FK users opcional), titulo,
   contenido, formato, generado_en.
9. **user_favorites**: id, usuario_id (FK users), cuerpo_agua_id (FK cuerpos_agua), creado_en.
   Restricción única (usuario_id, cuerpo_agua_id).
10. **logs_acceso**: id, usuario_id (FK users opcional), endpoint, metodo, codigo_respuesta,
    timestamp, ip.
11. **cuerpo_parametros**: id, cuerpo_agua_id (FK cuerpos_agua), parametro_id (FK parametros_ambientales),
    valor_objetivo, umbral_alerta.

## Relaciones clave
- Un **role** puede tener muchos **users**.
- Un **user** puede generar **reportes**, marcar **favoritos** y dejar **logs_acceso**.
- Cada **cuerpo_agua** agrupa **sensores**, **lecturas_sensores**, **alertas**, **reportes**,
  **zonas_protegidas**, **user_favorites** y configuraciones en **cuerpo_parametros**.
- Las **lecturas_sensores** vinculan sensores, parámetros y cuerpos de agua y pueden originar **alertas**.
- Las **configuraciones por cuerpo de agua** (**cuerpo_parametros**) indican valores objetivo y umbrales para parámetros ambientales.
