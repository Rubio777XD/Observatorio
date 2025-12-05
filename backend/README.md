# Observatorio de Aguas - Backend API

API REST con FastAPI y SQLAlchemy para el monitoreo de cuerpos de agua.

## Características
- 🚀 FastAPI con documentación automática en `/docs` y `/redoc`.
- 🗄️ SQLAlchemy 2.x con **12 tablas** (cuerpos de agua + 11 tablas nuevas de usuarios, sensores, alertas, etc.).
- 🔐 Autenticación JWT (HS256) y contraseñas con PBKDF2-SHA256 + salt.
- 🧭 Rutas CRUD para sensores, parámetros, lecturas, alertas, reportes, zonas protegidas, favoritos y configuración por cuerpo de agua.
- 🗺️ Gestión de cuerpos de agua con trazabilidad: campo `creado_por_id` y logs automáticos en `logs_acceso`.
- 🔄 CORS preconfigurado para el frontend en Vite.

## Instalación y uso
1. Entrar al directorio:
   ```bash
   cd backend
   ```
2. (Opcional) Crear entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\\Scripts\\activate
   ```
3. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Variables opcionales en `.env`:
   - `DATABASE_URL` (por defecto `sqlite:///./observatorio_aguas.db`).
   - `SECRET_KEY` (clave para firmar JWT).
   - `FRONTEND_URL`, `API_HOST`, `API_PORT`.
5. Arrancar el servidor (con recarga en desarrollo):
   ```bash
   python run.py
   ```
   API en `http://localhost:8000`.

## Modelos y relaciones
- **Existente:** `cuerpos_agua`.
- **Nuevos:** `roles`, `users`, `sensores`, `parametros_ambientales`, `lecturas_sensores`, `zonas_protegidas`, `alertas`, `reportes`, `user_favorites`, `logs_acceso`, `cuerpo_parametros`.
- `users` incluye `email` único, `password_hash`, `full_name`, `created_at`/`updated_at`, `last_login`, `role_id`.
- Resumen detallado en `db_schema_overview.md`.

## Autenticación
- Registro: `POST /auth/register` (JSON).
- Login: `POST /auth/login` (form `username`/`password`), devuelve `access_token`.
- Perfil: `GET /auth/me` con `Authorization: Bearer <token>`.
- El token es JWT HS256 generado con expiración (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- Roles iniciales: `admin`, `analista`, `visualizador`.
- Las operaciones de escritura requieren token; la creación, edición y borrado de cuerpos de agua están restringidas a roles `admin` y `analista`.

## Cuerpos de agua
- Listado: `GET /cuerpos-agua` (público).
- Detalle: `GET /cuerpos-agua/{id}` (público).
- Crear: `POST /cuerpos-agua` (JWT + rol `admin`/`analista`). Campos: nombre, tipo (Río/Lago/Océano), latitud, longitud, contaminacion, biodiversidad, descripcion opcional, temperatura, ph, oxigeno_disuelto. Se guarda `creado_por_id`, se genera un reporte inicial y se registra un log en `logs_acceso`.
- Actualizar: `PUT /cuerpos-agua/{id}` (JWT + rol `admin`/`analista`). Campos opcionales según el modelo.
- Eliminar: `DELETE /cuerpos-agua/{id}` (JWT + rol `admin`/`analista`).
- Cada escritura registra `endpoint`, `metodo`, `codigo_respuesta`, `cuerpo_agua_id`, `usuario_id` e IP en `logs_acceso`.

## Estructura
```
backend/
├── database.py              # Conexión y creación de tablas + datos de ejemplo
├── db_schema_overview.md    # Resumen del esquema
├── main.py                  # Aplicación FastAPI y rutas
├── models.py                # Modelos SQLAlchemy
├── requirements.txt         # Dependencias (incluye pytest para tests de humo)
├── run.py                   # Arranque con Uvicorn
├── tests/                   # Tests rápidos con TestClient
└── observatorio_aguas.db    # BD SQLite (auto generada)
```

## Migraciones y datos
- Las tablas se crean automáticamente en el evento de startup.
- Roles base (`admin`, `analista`, `visualizador`) y 3 cuerpos de agua de ejemplo se insertan si la BD está vacía.

## Tests
```bash
python -m compileall backend
pytest tests
```
Los tests verifican que `/health` responda 200 y que las rutas protegidas exijan JWT.
Si `httpx` no está disponible en el entorno, el test de humo levanta un servidor Uvicorn temporal para realizar las peticiones.

## Docker
La imagen se construye con `backend/Dockerfile`. En `docker-compose.yml` se expone en el puerto 8000 y monta la base de datos en un volumen local.
