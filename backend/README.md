# Observatorio de Aguas - Backend API

API REST con FastAPI y SQLAlchemy para el monitoreo de cuerpos de agua.

## Características
- 🚀 FastAPI con documentación automática en `/docs` y `/redoc`.
- 🗄️ SQLAlchemy 2.x con **12 tablas** (cuerpos de agua + 11 tablas nuevas de usuarios, sensores, alertas, etc.).
- 🔐 Autenticación JWT (HS256) y contraseñas con PBKDF2-SHA256 + salt.
- 🧭 Rutas CRUD para sensores, parámetros, lecturas, alertas, reportes, zonas protegidas, favoritos y configuración por cuerpo de agua.
- 🔄 CORS preconfigurado para el frontend en Vite.
- 📝 `logs_acceso` registra altas/bajas/ediciones de cuerpos de agua y vincula la operación con el usuario.

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
- Roles (`roles.nombre`) controlan permisos: admin/analista pueden crear/editar cuerpos; solo admin puede eliminar.

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
- Las tablas se crean automáticamente en el evento de startup. Si `cuerpos_agua` no tiene la columna `creado_por_id`, se agrega
  automáticamente (SQLite `ALTER TABLE`).
- Roles base (`admin`, `analista`, `visualizador`) y 3 cuerpos de agua de ejemplo se insertan si la BD está vacía.

## Cuerpos de agua y auditoría
- `POST /cuerpos-agua` crea el registro con `creado_por_id` y genera un reporte inicial asociado.
- `PUT /cuerpos-agua/{id}` permite actualizar campos claves.
- `DELETE /cuerpos-agua/{id}` elimina el registro.
- Cada operación escribe en `logs_acceso` (usuario, endpoint, método, código de respuesta, IP) y está protegida por JWT.

## Tests
```bash
python -m compileall backend
pytest tests
```
Los tests verifican que `/health` responda 200 y que las rutas protegidas exijan JWT.
Si `httpx` no está disponible en el entorno, el test de humo levanta un servidor Uvicorn temporal para realizar las peticiones.

## Docker
La imagen se construye con `backend/Dockerfile`. En `docker-compose.yml` se expone en el puerto 8000 y monta la base de datos en un volumen local.
