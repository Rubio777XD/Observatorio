# Especificación de Requerimientos de Software (SRS)
## Proyecto: Observatorio de Aguas

---

## 1. Introducción
### 1.1 Propósito del documento
Este documento especifica de manera exhaustiva los requerimientos funcionales y no funcionales del proyecto **Observatorio de Aguas**, siguiendo el estándar IEEE 830/29148. Sirve como referencia única para analistas, desarrolladores, testers, stakeholders y equipo de operaciones.

### 1.2 Alcance del sistema
El sistema es una plataforma web para monitoreo y gestión de cuerpos de agua. Consta de un frontend en **React** y un backend en **FastAPI** con base de datos **SQLite**. Provee autenticación con roles, gestión de cuerpos de agua, sensores, lecturas, alertas por umbrales, favoritos por usuario, reportes, zonas protegidas y logs de acceso, incluyendo un mapa interactivo para visualización geoespacial.

### 1.3 Definiciones, acrónimos y abreviaturas
- **API**: Interfaz de Programación de Aplicaciones.
- **JWT**: JSON Web Token para autenticación y autorización.
- **CRUD**: Crear, Leer, Actualizar, Eliminar.
- **UI/UX**: Interfaz/Experiencia de usuario.
- **SRS**: Software Requirements Specification.
- **SQLite**: Motor de base de datos relacional embebido.
- **FastAPI**: Framework web para Python orientado a APIs.
- **React**: Librería JavaScript para interfaces de usuario.
- **GIS**: Sistemas de información geográfica.
- **PBKDF2-SHA256**: Algoritmo de hash para contraseñas.

### 1.4 Referencias
- Código del backend en `backend/` y esquema en `backend/models.py`.
- Resumen de esquema: `backend/db_schema_overview.md`.
- Documentación de FastAPI y React.
- Estándar IEEE 830/29148 para SRS.

### 1.5 Visión general
El documento describe el contexto del sistema, sus usuarios, restricciones, requerimientos funcionales y no funcionales, modelo de datos, casos de uso, interfaces, reglas de negocio, historias de usuario, glosario y apéndices técnicos.

## 2. Descripción general
### 2.1 Perspectiva del sistema
- **Frontend React**: SPA que consume la API REST, con vistas de autenticación, tablero, mapa interactivo, gestión de cuerpos de agua, sensores, alertas, reportes y favoritos.
- **Backend FastAPI**: Provee endpoints seguros con JWT, manejo de roles, lógica de negocio y persistencia en SQLite.
- **Base de datos SQLite**: Almacena entidades principales: usuarios, roles, cuerpos de agua, sensores, lecturas, parámetros ambientales, alertas, reportes, favoritos, logs, zonas protegidas y configuraciones por cuerpo.

### 2.2 Funciones del sistema
- Autenticación y gestión de roles.
- CRUD de cuerpos de agua con geolocalización y clasificación.
- Registro y gestión de sensores vinculados a cuerpos de agua.
- Captura y consulta de lecturas de sensores por parámetros ambientales.
- Generación y gestión de alertas basadas en umbrales.
- Marcado de cuerpos de agua favoritos por usuario.
- Gestión de zonas protegidas y configuraciones de parámetros por cuerpo.
- Generación de reportes y bitácora de accesos.
- Visualización de mapa interactivo con capas de cuerpos de agua, sensores y alertas.

### 2.3 Características de los usuarios
- **Administrador**: Mantiene catálogos, roles, usuarios, parámetros, reglas y reportes globales.
- **Analista**: Gestiona cuerpos de agua, sensores, lecturas, alertas, reportes y zonas protegidas.
- **Operador**: Registra lecturas y ejecuta consultas básicas.
- **Visitante autenticado**: Consulta información pública, visualiza mapa y marca favoritos.

### 2.4 Restricciones
- Autenticación obligatoria para operaciones críticas mediante JWT.
- Acceso restringido por rol para creación/edición/eliminación de datos sensibles.
- Base de datos SQLite (limitaciones de concurrencia) con opción de migración futura.
- Cumplimiento de formatos de coordenadas (latitud/longitud) y unidades ambientales.
- Frontend y backend deben comunicarse vía HTTPS.

### 2.5 Suposiciones y dependencias
- React y FastAPI son las tecnologías base acordadas.
- Conectividad estable entre frontend y API.
- Sensores externos enviarán lecturas mediante integraciones REST o importaciones programadas.
- Disponibilidad de librerías de mapas (Leaflet/Mapbox) en el frontend.

## 3. Requerimientos funcionales
A continuación se describen los requerimientos por módulo.

### Autenticación y roles
**RF-01: Registro de usuario**
- Descripción: Permitir crear cuentas con email único, contraseña hash PBKDF2-SHA256 y asignación de rol.
- Actores: Administrador, Analista.
- Precondición: Rol solicitante con permiso de creación.
- Postcondición: Usuario persistido en `users` y vinculado a `roles`.
- Flujo principal:
  1. Administrador/Analista abre formulario de registro.
  2. Ingresa email, nombre completo, contraseña y rol.
  3. Sistema valida unicidad y formatea hash.
  4. Se guarda el usuario y se registra log de acceso.
- Flujo alterno: Email duplicado → se rechaza y se notifica.
- Excepciones: Falla de base de datos, contraseña débil según política.
- Prioridad: Alta.

**RF-02: Inicio de sesión**
- Descripción: Autenticación mediante email y contraseña para obtener JWT con rol.
- Actores: Todos los usuarios.
- Precondición: Usuario existente y activo.
- Postcondición: JWT emitido, `last_login` actualizado y log registrado en `logs_acceso`.
- Flujo principal: Ingresar credenciales → Validar hash → Emitir JWT → Registrar log.
- Flujo alterno: Credenciales inválidas → Error de autenticación.
- Excepciones: Servicio de autenticación caído.
- Prioridad: Alta.

**RF-03: Gestión de roles**
- Descripción: CRUD de roles con permisos asociados.
- Actores: Administrador.
- Precondición: Sesión con rol administrador.
- Postcondición: Rol creado/actualizado en `roles`; usuarios vinculados conservan integridad.
- Flujo principal: Crear/editar/eliminar rol → Validar nombre único → Persistir.
- Flujo alterno: Intento de eliminar rol con usuarios asociados → Bloquear y notificar.
- Excepciones: Restricciones de integridad referencial.
- Prioridad: Media.

### Cuerpos de agua y geografía
**RF-04: Crear cuerpo de agua**
- Descripción: Registrar cuerpo de agua con ubicación, tipo, atributos ambientales y creador.
- Actores: Administrador, Analista.
- Precondición: Autenticación con rol permitido.
- Postcondición: Registro en `cuerpos_agua` con referencia a `users.creado_por_id`.
- Flujo principal: Completar formulario → Validar coordenadas → Guardar → Generar reporte automático.
- Flujo alterno: Coordenadas fuera de rango → Solicitar corrección.
- Excepciones: Duplicidad de nombre en misma zona (regla configurable).
- Prioridad: Alta.

**RF-05: Actualizar cuerpo de agua**
- Descripción: Modificar atributos, estado y relaciones.
- Actores: Administrador, Analista.
- Precondición: Cuerpo existente.
- Postcondición: `cuerpos_agua` actualizado y fecha de actualización registrada.
- Flujo principal: Editar → Validar → Guardar cambios → Registrar log.
- Flujo alterno: Conflicto de edición concurrente → Reintentar.
- Excepciones: Referencias a sensores/zonas inconsistentes.
- Prioridad: Alta.

**RF-06: Eliminar cuerpo de agua**
- Descripción: Borrado lógico con preservación de relaciones críticas.
- Actores: Administrador.
- Precondición: Rol admin y cuerpo de agua existente.
- Postcondición: Estado marcado como inactivo; relaciones conservadas.
- Flujo principal: Solicitar eliminación → Confirmar → Marcar inactivo → Registrar log.
- Flujo alterno: Dependencias críticas (zonas protegidas/alertas activas) → bloquear.
- Excepciones: Restricciones de integridad.
- Prioridad: Media.

### Mapa interactivo
**RF-07: Visualizar mapa**
- Descripción: Mostrar mapa con capas de cuerpos de agua, sensores y alertas.
- Actores: Todos los roles autenticados.
- Precondición: Datos de geolocalización disponibles.
- Postcondición: Mapa renderizado con filtros por tipo, estado y nivel de alerta.
- Flujo principal: Cargar vista → Solicitar datos → Renderizar capas → Interacción (zoom, filtros).
- Flujo alterno: Falta de conectividad a mapas → Mostrar vista simplificada.
- Excepciones: API de mapas no disponible.
- Prioridad: Alta.

### Sensores, lecturas y parámetros
**RF-08: Registrar sensor**
- Descripción: Asociar sensores a un cuerpo de agua con ubicación y tipo.
- Actores: Administrador, Analista.
- Precondición: Cuerpo de agua existente.
- Postcondición: Sensor almacenado en `sensores` vinculado a `cuerpos_agua`.
- Flujo principal: Capturar datos → Validar → Guardar → Registrar log.
- Flujo alterno: Sensor duplicado en misma ubicación → Notificar.
- Excepciones: Error de integridad referencial.
- Prioridad: Alta.

**RF-09: Registrar lectura de sensor**
- Descripción: Ingresar lecturas con referencia a sensor, parámetro y cuerpo de agua.
- Actores: Operador, Analista, Administrador.
- Precondición: Sensor y parámetro existentes.
- Postcondición: Lectura en `lecturas_sensores` con unidad y timestamp; posible alerta generada.
- Flujo principal: Seleccionar sensor y parámetro → Capturar valor/unidad → Guardar → Evaluar umbrales → Crear alerta si aplica.
- Flujo alterno: Valor fuera de rango permitido → Registrar y marcar observación.
- Excepciones: Sensor inactivo.
- Prioridad: Alta.

**RF-10: Gestionar parámetros ambientales**
- Descripción: CRUD de parámetros ambientales (nombre, unidad, rangos).
- Actores: Administrador, Analista.
- Precondición: Rol autorizado.
- Postcondición: Registro en `parametros_ambientales`; impacto en validaciones y alertas.
- Flujo principal: Crear/editar/eliminar → Validar unicidad → Guardar.
- Flujo alterno: Intento de eliminar parámetro con lecturas asociadas → bloquear.
- Excepciones: Conflicto de dependencias.
- Prioridad: Alta.

**RF-11: Configuración por cuerpo de agua**
- Descripción: Definir valores objetivo y umbrales por parámetro y cuerpo de agua.
- Actores: Administrador, Analista.
- Precondición: Cuerpo y parámetro existentes.
- Postcondición: Registro en `cuerpo_parametros` con umbral_alerta configurado.
- Flujo principal: Seleccionar cuerpo y parámetro → Definir valores → Guardar.
- Flujo alterno: Umbral inválido → solicitar corrección.
- Excepciones: Falta de permisos.
- Prioridad: Media.

### Alertas y monitoreo
**RF-12: Generar alerta automática**
- Descripción: Crear alertas cuando una lectura supere umbrales configurados.
- Actores: Sistema.
- Precondición: Lectura registrada con parámetro configurado.
- Postcondición: Alerta en `alertas` con referencia a `lecturas_sensores` y nivel.
- Flujo principal: Evaluar lectura → Comparar con umbral → Crear alerta → Notificar.
- Flujo alterno: Alerta existente sin resolver → Escalar nivel.
- Excepciones: Falta de configuración de umbral → registrar incidente.
- Prioridad: Alta.

**RF-13: Gestionar alertas**
- Descripción: Consultar, filtrar, resolver y comentar alertas.
- Actores: Administrador, Analista.
- Precondición: Alertas existentes.
- Postcondición: Estado `resuelta` actualizado; registro de acciones.
- Flujo principal: Listar → Filtrar por nivel/estado → Marcar resuelta → Registrar log.
- Flujo alterno: Reapertura por nueva lectura.
- Excepciones: Concurrencia en resolución.
- Prioridad: Media.

### Favoritos y reportes
**RF-14: Marcar cuerpo de agua como favorito**
- Descripción: Permitir a un usuario marcar/desmarcar un cuerpo de agua como favorito.
- Actores: Todos los roles autenticados.
- Precondición: Cuerpo de agua existente.
- Postcondición: Registro en `user_favorites` con unicidad (usuario, cuerpo_agua).
- Flujo principal: Click en favorito → Validar unicidad → Guardar/Eliminar.
- Flujo alterno: Favorito ya existente → Ignorar o confirmar eliminación.
- Excepciones: Usuario no autenticado.
- Prioridad: Media.

**RF-15: Generar reporte**
- Descripción: Generar reportes sobre cuerpos de agua, lecturas y alertas en diversos formatos.
- Actores: Administrador, Analista.
- Precondición: Datos disponibles y permisos.
- Postcondición: Registro en `reportes` vinculado a usuario y cuerpo de agua.
- Flujo principal: Seleccionar cuerpo y rango de fechas → Generar → Guardar → Descargar/Enviar.
- Flujo alterno: Formato no soportado → Mostrar opciones válidas.
- Excepciones: Tiempo de generación excedido.
- Prioridad: Media.

### Zonas protegidas y trazabilidad
**RF-16: Gestionar zonas protegidas**
- Descripción: CRUD de zonas protegidas asociadas a cuerpos de agua.
- Actores: Administrador, Analista.
- Precondición: Cuerpo de agua existente.
- Postcondición: Registro en `zonas_protegidas`.
- Flujo principal: Crear/editar/eliminar → Validar → Guardar.
- Flujo alterno: Zona con alertas activas → bloquear eliminación.
- Excepciones: Restricciones por normativa.
- Prioridad: Media.

**RF-17: Registrar log de acceso**
- Descripción: Registrar cada acceso o acción crítica con usuario, endpoint, método, resultado e IP.
- Actores: Sistema.
- Precondición: Acción ejecutada en API.
- Postcondición: Entrada en `logs_acceso`.
- Flujo principal: Interceptor de solicitudes → Captura datos → Persistir.
- Flujo alterno: Log asíncrono en cola si DB no disponible.
- Excepciones: Saturación de almacenamiento.
- Prioridad: Alta.

## 4. Requerimientos no funcionales
**RNF-01: Autenticación y autorización**
- Descripción: Uso de JWT con expiración configurable; validación de roles y permisos por endpoint.
- Categoría: Seguridad.
- Criterio de aceptación: Todas las rutas protegidas rechazan accesos sin token o con rol insuficiente.

**RNF-02: Protección de datos**
- Descripción: Contraseñas con PBKDF2-SHA256, cifrado TLS en tránsito.
- Categoría: Seguridad.
- Criterio de aceptación: No se almacenan contraseñas en texto plano; conexión HTTPS obligatoria.

**RNF-03: Rendimiento de API**
- Descripción: Respuesta promedio < 500 ms para operaciones CRUD; generación de reportes < 5 s para 10k registros.
- Categoría: Rendimiento.
- Criterio de aceptación: Pruebas de carga cumplen los tiempos definidos.

**RNF-04: Disponibilidad**
- Descripción: Disponibilidad objetivo 99% mensual; manejo de errores con mensajes claros.
- Categoría: Fiabilidad.
- Criterio de aceptación: Monitoreo muestra uptime ≥ 99% y sin caídas prolongadas.

**RNF-05: Usabilidad**
- Descripción: UI responsiva, accesible (WCAG AA), con mapa interactivo fluido y filtros claros.
- Categoría: Usabilidad.
- Criterio de aceptación: Pruebas de usabilidad ≥ 80% de tareas completadas sin asistencia.

**RNF-06: Portabilidad**
- Descripción: Despliegue en contenedores Docker; compatible con SQLite local y migrable a Postgres.
- Categoría: Portabilidad.
- Criterio de aceptación: Docker Compose levanta frontend y backend sin pasos manuales.

**RNF-07: Mantenibilidad**
- Descripción: Código con pruebas unitarias, linters y documentación; separación clara de capas.
- Categoría: Mantenibilidad.
- Criterio de aceptación: Cobertura mínima 70% y CI verde.

**RNF-08: Observabilidad**
- Descripción: Logs estructurados y trazas básicas; métricas de rendimiento y alertas de infraestructura.
- Categoría: Fiabilidad.
- Criterio de aceptación: Logs consultables por fecha/usuario y métricas accesibles.

## 5. Modelo de datos
### 5.1 Descripción general
Base SQLite con 12 tablas principales alineadas con `backend/db_schema_overview.md`.

### 5.2 Entidades y campos
| Tabla | Campos principales |
| --- | --- |
| roles | id, nombre (único), descripcion, created_at |
| users | id, email (único), password_hash, full_name, created_at, updated_at, last_login, role_id (FK) |
| cuerpos_agua | id, nombre, tipo, latitud, longitud, contaminacion, biodiversidad, descripcion, temperatura, ph, oxigeno_disuelto, fecha_creacion, fecha_actualizacion, creado_por_id (FK) |
| sensores | id, nombre, tipo, cuerpo_agua_id (FK), latitud, longitud, descripcion, instalado_en, activo |
| parametros_ambientales | id, nombre (único), unidad, valor_minimo, valor_maximo, descripcion |
| lecturas_sensores | id, sensor_id (FK), parametro_id (FK), cuerpo_agua_id (FK), valor, unidad, tomado_en, observaciones |
| alertas | id, cuerpo_agua_id (FK), lectura_id (FK opcional), parametro_id (FK opcional), nivel, mensaje, creada_en, resuelta |
| reportes | id, cuerpo_agua_id (FK), usuario_id (FK opcional), titulo, contenido, formato, generado_en |
| user_favorites | id, usuario_id (FK), cuerpo_agua_id (FK), creado_en |
| logs_acceso | id, usuario_id (FK opcional), cuerpo_agua_id (FK opcional), endpoint, metodo, codigo_respuesta, timestamp, ip |
| zonas_protegidas | id, cuerpo_agua_id (FK), nombre, categoria, descripcion, area_km2, estado |
| cuerpo_parametros | id, cuerpo_agua_id (FK), parametro_id (FK), valor_objetivo, umbral_alerta |

### 5.3 Explicación de tablas y relaciones
- **roles** ←1-N→ **users**: cada usuario pertenece a un rol.
- **users** ←1-N→ **reportes**, **logs_acceso**, **user_favorites**.
- **cuerpos_agua** ←1-N→ **sensores**, **lecturas_sensores**, **alertas**, **reportes**, **user_favorites**, **zonas_protegidas**, **cuerpo_parametros**.
- **sensores** ←1-N→ **lecturas_sensores**.
- **parametros_ambientales** ←1-N→ **lecturas_sensores**, **alertas**, **cuerpo_parametros**.
- **lecturas_sensores** pueden originar **alertas** mediante relación opcional.
- **cuerpo_parametros** define objetivos y umbrales por cuerpo y parámetro.

### 5.4 Diagrama ER (ASCII)
```
roles 1---N users 1---N reportes
                   |\
                   | N logs_acceso
                   | N user_favorites N---1 cuerpos_agua ---1---N sensores ---1---N lecturas_sensores ---1---N alertas
                   |                                         |                               \
                   |                                         |                                N
                   |                                         N zonas_protegidas                parametros_ambientales 1---N cuerpo_parametros
                   \
                    cuerpos_agua 1---N reportes
```

## 6. Casos de uso del sistema
| Código | Nombre | Actor principal | Objetivo |
| --- | --- | --- | --- |
| UC01 | Registrar usuario | Administrador/Analista | Crear un usuario con rol asignado |
| UC02 | Iniciar sesión | Cualquier usuario | Obtener JWT para acceder al sistema |
| UC03 | Crear cuerpo de agua | Administrador/Analista | Registrar nuevo cuerpo |
| UC04 | Editar cuerpo de agua | Administrador/Analista | Actualizar atributos |
| UC05 | Eliminar cuerpo de agua | Administrador | Inactivar cuerpo |
| UC06 | Visualizar mapa interactivo | Todos los roles autenticados | Ver capas y detalles |
| UC07 | Consultar datos de monitoreo | Analista/Operador | Revisar lecturas y tendencias |
| UC08 | Generar alerta | Sistema/Analista | Crear alerta por umbral |
| UC09 | Marcar favorito | Usuario autenticado | Guardar cuerpo de agua favorito |
| UC10 | Registrar lectura de sensor | Operador/Analista | Almacenar lectura y evaluar umbral |

A continuación se detallan.

**UC01: Registrar usuario**
- Actor: Administrador/Analista.
- Objetivo: Alta de usuario con rol.
- Descripción: Captura datos y los guarda en `users` vinculado a `roles`.
- Flujo normal: Abrir formulario → Ingresar datos → Validar unicidad → Guardar → Confirmar.
- Flujo alternativo: Email duplicado → Mostrar error.
- Excepciones: Fallo de DB.

**UC02: Iniciar sesión**
- Actor: Usuario.
- Objetivo: Obtener token JWT.
- Descripción: Autenticación contra `users` y registro en `logs_acceso`.
- Flujo normal: Ingresar credenciales → Validar → Emitir token → Redirigir al dashboard.
- Flujo alternativo: Credenciales inválidas → Error.
- Excepciones: Servicio de auth caído.

**UC03: Crear cuerpo de agua**
- Actor: Administrador/Analista.
- Objetivo: Registrar nuevo cuerpo.
- Descripción: Guarda en `cuerpos_agua` y crea reporte inicial.
- Flujo normal: Abrir formulario → Completar datos → Validar geo → Guardar → Generar reporte.
- Flujo alternativo: Coordenadas inválidas → Solicitar corrección.
- Excepciones: Conflicto de integridad.

**UC04: Editar cuerpo de agua**
- Actor: Administrador/Analista.
- Objetivo: Actualizar atributos.
- Descripción: Edita registro y actualiza `fecha_actualizacion`.
- Flujo normal: Seleccionar cuerpo → Editar → Validar → Guardar.
- Flujo alternativo: Falta de permisos → Bloquear.
- Excepciones: Error de DB.

**UC05: Eliminar cuerpo de agua**
- Actor: Administrador.
- Objetivo: Inactivar cuerpo.
- Descripción: Marca registro como inactivo preservando relaciones.
- Flujo normal: Seleccionar → Confirmar → Inactivar → Registrar log.
- Flujo alternativo: Dependencias activas → Bloquear.
- Excepciones: Restricciones de integridad.

**UC06: Visualizar mapa interactivo**
- Actor: Todos los roles autenticados.
- Objetivo: Ver mapa con capas y filtros.
- Descripción: Carga datos geográficos y de alertas para renderizar.
- Flujo normal: Abrir mapa → Cargar datos → Aplicar filtros → Explorar.
- Flujo alternativo: API de mapas no disponible → Mapa simplificado.
- Excepciones: Timeout de datos.

**UC07: Consultar datos de monitoreo**
- Actor: Analista/Operador.
- Objetivo: Ver lecturas y tendencias.
- Descripción: Consulta `lecturas_sensores` y parámetros asociados.
- Flujo normal: Seleccionar cuerpo/fecha → Mostrar lecturas → Graficar.
- Flujo alternativo: Sin datos → Mostrar mensaje.
- Excepciones: Error de DB.

**UC08: Generar alerta**
- Actor: Sistema/Analista.
- Objetivo: Crear alerta por umbral.
- Descripción: Evalúa lectura y crea registro en `alertas`.
- Flujo normal: Recibir lectura → Comparar umbral → Crear alerta → Notificar.
- Flujo alternativo: Alerta existente → Escalar.
- Excepciones: Configuración ausente.

**UC09: Marcar favorito**
- Actor: Usuario autenticado.
- Objetivo: Guardar cuerpo como favorito.
- Descripción: Inserta o elimina en `user_favorites`.
- Flujo normal: Click en favorito → Validar → Guardar → Actualizar UI.
- Flujo alternativo: Ya favorito → Desmarcar.
- Excepciones: Usuario sin sesión.

**UC10: Registrar lectura de sensor**
- Actor: Operador/Analista.
- Objetivo: Almacenar lectura.
- Descripción: Guarda en `lecturas_sensores`, vincula a sensor y parámetro, y evalúa alerta.
- Flujo normal: Seleccionar sensor → Ingresar valor → Guardar → Evaluar umbral → Notificar.
- Flujo alternativo: Sensor inactivo → Bloquear.
- Excepciones: Parámetro inexistente.

## 7. Requerimientos de interfaz
### 7.1 Interfaz web (React)
- SPA con rutas protegidas, autenticación con JWT almacenado de forma segura.
- Componentes clave: Login, Registro, Dashboard, Mapa, Gestión de cuerpos, Sensores, Lecturas, Alertas, Reportes, Favoritos, Zonas protegidas.
- Uso de librería de mapas (Leaflet/Mapbox) con capas y pop-ups.
- Tablas con paginación y filtros; formularios con validación en cliente.

### 7.2 Interfaz API REST (FastAPI)
- Endpoints versionados `/api/v1/` con documentación OpenAPI.
- Esquemas Pydantic para request/response.
- Autenticación por header `Authorization: Bearer <token>`.
- Manejo de errores con códigos HTTP y mensajes JSON estructurados.

### 7.3 Diagramas de navegación del frontend (texto)
- Login → Dashboard → (Mapa | Cuerpos de agua | Sensores | Lecturas | Alertas | Reportes | Favoritos | Zonas protegidas).
- Desde **Mapa**: acceder a detalle de cuerpo → ver sensores → registrar lectura → ver alertas → marcar favorito.
- Desde **Cuerpos de agua**: crear/editar/eliminar → configurar parámetros → generar reporte automático.

## 8. Reglas de negocio
**RN-01: Roles permitidos para cuerpos de agua**
- Descripción: Solo Admin y Analista pueden crear/editar/eliminar cuerpos de agua.
- Impacto: Control de permisos y auditoría.
- Origen: Política de operación.

**RN-02: Favoritos por usuario**
- Descripción: Un cuerpo de agua solo puede ser favorito una vez por usuario (unicidad en `user_favorites`).
- Impacto: Evita duplicados y facilita consultas.
- Origen: Requerimiento funcional.

**RN-03: Logs obligatorios**
- Descripción: Toda acción crítica debe registrarse en `logs_acceso` con endpoint, método, código e IP.
- Impacto: Trazabilidad y auditoría.
- Origen: Seguridad y cumplimiento.

**RN-04: Reporte automático al crear cuerpo**
- Descripción: Al crear un cuerpo de agua se genera un reporte inicial en `reportes`.
- Impacto: Documentación inmediata del recurso.
- Origen: Mejores prácticas del dominio.

**RN-05: Validación de parámetros ambientales**
- Descripción: Valores de parámetros deben respetar `valor_minimo` y `valor_maximo` y umbrales por cuerpo.
- Impacto: Calidad de datos y alertas correctas.
- Origen: Normativa ambiental.

**RN-06: Manejo de alertas por umbrales**
- Descripción: Al superar `umbral_alerta` en `cuerpo_parametros`, se genera o escala una alerta.
- Impacto: Respuesta temprana a incidentes.
- Origen: Requerimiento operativo.

## 9. Historias de usuario (opcional)
- Como analista quiero registrar un cuerpo de agua para que quede en el sistema y genere un reporte inicial.
- Como operador quiero ingresar lecturas de sensores rápidamente desde el mapa para mantener los datos al día.
- Como usuario autenticado quiero marcar cuerpos de agua como favoritos para consultarlos después.

## 10. Glosario
- **Cuerpo de agua**: Río, lago, embalse u otra masa hídrica monitoreada.
- **Sensor**: Dispositivo que captura parámetros ambientales.
- **Parámetro ambiental**: Variable medida (pH, temperatura, oxígeno disuelto, etc.).
- **Biodiversidad**: Indicador de diversidad biológica asociada al cuerpo de agua.
- **Lectura**: Registro de medición de un sensor.
- **Alerta**: Notificación generada cuando una lectura supera umbral.
- **Reporte**: Documento generado con datos y análisis de un cuerpo de agua.
- **Favorito**: Relación usuario–cuerpo de agua marcada para acceso rápido.
- **JWT**: Token firmado para autenticación.
- **Token**: Cadena que representa sesión autenticada.

## 11. Apéndices
- **Dependencias técnicas**: React, FastAPI, SQLite, Docker, librería de mapas, Pydantic, PBKDF2-SHA256.
- **Variables de entorno sugeridas**: `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_EXPIRE_MINUTES`, `MAP_PROVIDER_KEY`.
- **Consideraciones de despliegue**: Uso de Docker Compose; HTTPS obligatorio; backups periódicos de SQLite; posibilidad de migrar a Postgres.
- **Pruebas recomendadas**: Unitarias para servicios, integración para API, e2e para flujo de mapa y creación de alertas.
