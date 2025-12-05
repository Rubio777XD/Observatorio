# 🌊 Observatorio de Aguas

Plataforma web para el monitoreo y análisis de cuerpos de agua con frontend en React y backend en FastAPI.

## 🏗️ Arquitectura
- **Frontend:** React 18 + Vite + Tailwind + React Leaflet (directorio `observatorio-aguas`).
- **Backend:** FastAPI + SQLAlchemy + SQLite con arranque mediante `run.py` (directorio `backend`).
- **Orquestación:** Docker/Docker Compose para levantar frontend y backend.

## 🚀 Puesta en marcha en desarrollo
### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt
python run.py
```
- API en `http://localhost:8000` con Swagger en `/docs`.
- Variables opcionales en `.env`: `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`.

### Frontend
```bash
cd observatorio-aguas
npm install
npm run dev -- --host --port 5173
```
- Interfaz disponible en `http://localhost:5173` (redirige al mapa estático `mapa-simple.html`).
- Configura `VITE_API_URL` si consumes endpoints desde el frontend.

### Docker Compose
```bash
docker-compose up --build
```
- Frontend publicado en `http://localhost:3000` (variable `VITE_API_URL` apunta al backend en `http://localhost:8000`).
- Backend publicado en `http://localhost:8000` con base de datos montada en `backend/observatorio_aguas.db`.

## 🗂️ Estructura del repositorio
```
Observatorio/
├── backend/                # API FastAPI, modelos y autenticación JWT
│   ├── database.py
│   ├── db_schema_overview.md
│   ├── main.py
│   ├── models.py
│   ├── requirements.txt
│   └── run.py
├── observatorio-aguas/     # Frontend React + Vite
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── README.md               # Este archivo
└── DEV_NOTES.md            # Cambios y notas de desarrollo
```

## 🔐 Autenticación y usuarios
- Endpoints de registro y login con JWT: `POST /auth/register` y `POST /auth/login` (form-data). Usa el token Bearer en rutas protegidas.
- Roles base (`admin`, `analista`, `visualizador`) se crean al iniciar si no existen.
- Operaciones de escritura (creación de cuerpos de agua, sensores, lecturas, etc.) requieren un token válido.

## 📚 Principales endpoints
- Cuerpos de agua: `GET/POST /cuerpos-agua`, `GET /cuerpos-agua/{id}`.
- Sensores: `GET/POST /sensores`.
- Parámetros ambientales: `GET/POST /parametros`.
- Lecturas de sensores: `GET/POST /lecturas`.
- Alertas: `GET/POST /alertas`.
- Reportes: `GET/POST /reportes`.
- Zonas protegidas: `GET/POST /zonas-protegidas`.
- Favoritos de usuario: `GET/POST /favoritos`.
- Configuración de parámetros por cuerpo de agua: `GET/POST /cuerpo-parametros`.
- Utilidades: `GET /estadisticas`, `GET /health`, `GET /auth/me`, `GET /roles`.

## 🗄️ Esquema de base de datos
El backend define 11 tablas: cuerpos_agua, roles, users, sensores, parametros_ambientales, lecturas_sensores, alertas, reportes, user_favorites, logs_acceso, zonas_protegidas y cuerpo_parametros. Consulta `backend/db_schema_overview.md` para campos y relaciones.

## 📝 Notas adicionales
- Los datos de ejemplo de cuerpos de agua y roles se generan automáticamente al iniciar.
- Mantén `DEV_NOTES.md` actualizado con cambios relevantes en el flujo de desarrollo.
