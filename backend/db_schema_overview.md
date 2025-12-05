# Resumen del esquema de base de datos

Este documento describe las tablas definidas actualmente con SQLAlchemy en el backend.

## Tablas existentes
- **cuerpos_agua**: id, nombre, tipo, latitud, longitud, contaminacion, biodiversidad, descripcion, temperatura, ph, oxigeno_disuelto, fecha_creacion, fecha_actualizacion. Relaciones: sensores, lecturas_sensores, alertas, reportes, user_favorites, zonas_protegidas, cuerpo_parametros.

## Nuevas tablas
1. **roles**: id, nombre (único), descripcion, created_at. Relación 1-N con users.
2. **users**: id, email (único), password_hash, full_name, created_at, updated_at, last_login, role_id (FK roles).
3. **sensores**: id, nombre, tipo, cuerpo_agua_id (FK cuerpos_agua), latitud, longitud, descripcion, instalado_en, activo.
4. **parametros_ambientales**: id, nombre (único), unidad, valor_minimo, valor_maximo, descripcion.
5. **lecturas_sensores**: id, sensor_id (FK sensores), parametro_id (FK parametros_ambientales), cuerpo_agua_id (FK cuerpos_agua), valor, unidad, tomado_en, observaciones.
6. **alertas**: id, cuerpo_agua_id (FK cuerpos_agua), lectura_id (FK lecturas_sensores opcional), parametro_id (FK parametros_ambientales opcional), nivel, mensaje, creada_en, resuelta.
7. **reportes**: id, cuerpo_agua_id (FK cuerpos_agua), usuario_id (FK users opcional), titulo, contenido, formato, generado_en.
8. **user_favorites**: id, usuario_id (FK users), cuerpo_agua_id (FK cuerpos_agua), creado_en. Restricción única por usuario y cuerpo de agua.
9. **logs_acceso**: id, usuario_id (FK users opcional), endpoint, metodo, codigo_respuesta, timestamp, ip.
10. **zonas_protegidas**: id, cuerpo_agua_id (FK cuerpos_agua), nombre, categoria, descripcion, area_km2, estado.
11. **cuerpo_parametros**: id, cuerpo_agua_id (FK cuerpos_agua), parametro_id (FK parametros_ambientales), valor_objetivo, umbral_alerta.

## Relaciones clave
- Un **role** puede tener muchos **users**.
- Un **user** puede generar **reportes**, marcar **favoritos** y producir **logs_acceso**.
- Un **cuerpo_agua** puede tener muchos **sensores**, **lecturas_sensores**, **alertas**, **reportes**, **zonas_protegidas** y configuraciones en **cuerpo_parametros**.
- Un **sensor** pertenece a un **cuerpo_agua** y tiene muchas **lecturas_sensores**.
- Las **lecturas_sensores** relacionan sensores, parámetros y cuerpos de agua; pueden originar **alertas**.
- Las **alertas** pueden estar asociadas a lecturas y parámetros específicos.
