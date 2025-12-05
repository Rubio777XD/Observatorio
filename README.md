# 🌊 Observatorio de Aguas

Plataforma web para monitoreo y análisis de cuerpos de agua. Incluye un backend en FastAPI con autenticación JWT y un frontend en React.

## 🏗️ Arquitectura
- **Frontend:** React 18 + Vite + Tailwind + React Leaflet (`observatorio-aguas`).
- **Backend:** FastAPI + SQLAlchemy + SQLite (`backend`), hashing PBKDF2 para contraseñas y JWT HS256.
- **Orquestación:** Docker/Docker Compose para levantar frontend y backend juntos.

## 🚀 Puesta en marcha en desarrollo
### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python run.py
```
- API en `http://localhost:8000` con Swagger en `/docs` y Redoc en `/redoc`.
- Variables opcionales en `.env`: `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`, `API_HOST`, `API_PORT`.

### Frontend
```bash
cd observatorio-aguas
npm install
npm run dev -- --host --port 5173
```
- Interfaz disponible en `http://localhost:5173`.
- Configura `VITE_API_URL` para apuntar al backend.
- El frontend ya no usa datos quemados: carga cuerpos de agua, sensores, parámetros, lecturas, alertas, zonas protegidas,
  reportes y favoritos directamente desde la API.

### Docker Compose
```bash
docker compose up --build
```
- Backend publicado en `http://localhost:8000` (base de datos persistida en `backend/observatorio_aguas.db`).
- Frontend publicado en `http://localhost:3000` y apunta al backend.

## 🔐 Autenticación
Flujo básico:
1. Registro `POST /auth/register` (JSON):
   ```bash
   curl -X POST http://localhost:8000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"demo@example.com","password":"password123","full_name":"Demo"}'
   ```
2. Login `POST /auth/login` (form-data):
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:8000/auth/login \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=demo@example.com&password=password123" | jq -r .access_token)
   ```
3. Perfil protegido `GET /auth/me`:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/auth/me
   ```
- Contraseñas guardadas con PBKDF2-SHA256 + salt.
- Rutas de escritura (cuerpos de agua, sensores, etc.) requieren token Bearer y rol adecuado.

### Flujo web
- Login y registro se realizan desde la interfaz React y almacenan el JWT en `localStorage` (`observatorio_token`).
- El usuario autenticado y su rol se obtienen con `GET /auth/me` y se muestran en la navegación.
- Solo roles **admin** y **analista** pueden ver el botón “Añadir nuevo cuerpo de agua” y usarlo para abrir el formulario protegido.

## 🗄️ Esquema de base de datos
- **Total de tablas:** 12 (1 existente + 11 nuevas).
- Categorías principales:
  - Usuarios y roles: `users`, `roles`, `logs_acceso`, `user_favorites`.
  - Monitoreo: `cuerpos_agua` (existente), `sensores`, `parametros_ambientales`, `lecturas_sensores`.
  - Gestión ambiental: `alertas`, `zonas_protegidas`, `cuerpo_parametros`, `reportes`.
- Detalle completo en `backend/db_schema_overview.md`.

## 📚 Endpoints destacados
- Salud: `GET /health`, raíz `GET /`.
- Autenticación: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- Cuerpos de agua: `GET /cuerpos-agua`, `GET /cuerpos-agua/{id}`, `POST /cuerpos-agua` (admin/analista),
  `PUT /cuerpos-agua/{id}` (admin/analista), `DELETE /cuerpos-agua/{id}` (solo admin).
- Datos relacionados: `GET/POST /sensores`, `GET/POST /parametros`, `GET/POST /lecturas`, `GET/POST /alertas`,
  `GET/POST /zonas-protegidas`, `GET/POST /reportes`, `GET/POST /favoritos`, `GET/POST /cuerpo-parametros`.
- Auditoría y métricas: `GET /estadisticas` usa las tablas `cuerpos_agua`, `sensores`, `alertas` y `parametros_ambientales`;
  `logs_acceso` registra la creación/actualización/eliminación de cuerpos de agua.
- Utilidades: `GET /estadisticas`, `GET /roles`.

## 🧪 Tests rápidos
Desde la raíz del repo:
```bash
python -m compileall backend
pytest backend/tests
```

## 📝 Notas
- Los datos iniciales de cuerpos de agua y roles se cargan al iniciar la app.
- Mantén `DEV_NOTES.md` actualizado con hallazgos y decisiones de desarrollo.
