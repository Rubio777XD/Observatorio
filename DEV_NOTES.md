# Notas de Desarrollo

## 2024-05-05
- Ampliado el esquema de base de datos a 11 tablas con relaciones para usuarios, roles, sensores, parámetros, lecturas, alertas, reportes, favoritos, zonas protegidas y configuraciones por cuerpo de agua.
- Implementado sistema de autenticación JWT con registro/login y protección de rutas de escritura.
- Añadidos endpoints CRUD básicos para nuevas entidades (sensores, parámetros, lecturas, alertas, reportes, zonas protegidas, favoritos y configuraciones de parámetros).
- Actualizados README y `backend/db_schema_overview.md` para reflejar arquitectura, endpoints y flujo de ejecución.
