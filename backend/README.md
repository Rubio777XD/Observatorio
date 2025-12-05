# Observatorio de Aguas - Backend API

API REST desarrollada con FastAPI y SQLAlchemy para el monitoreo de cuerpos de agua.

## Características
- 🚀 **FastAPI** 1.0+ con documentación automática.
- 🗄️ **SQLAlchemy 2.x** con esquema ampliado a 11 tablas (usuarios, sensores, lecturas, alertas, etc.).
- 🔐 **Autenticación JWT** con registro y login de usuarios.
- 🧭 **Rutas CRUD** para sensores, parámetros, lecturas, alertas, reportes, zonas protegidas y favoritos.
- 🔄 **CORS** preconfigurado para el frontend en Vite.

## Instalación
1. Navega al directorio del backend:
   ```bash
   cd backend
   ```
2. (Opcional) Crea y activa un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\\Scripts\\activate
   ```
3. Instala dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Copia o ajusta variables en `.env` (opcional). Por defecto se usa SQLite `observatorio_aguas.db` y `SECRET_KEY` de desarrollo.

## Uso
Inicia el servidor con reload:
```bash
python run.py
```
API disponible en `http://localhost:8000` con documentación en `/docs`.

## Endpoints principales
- `POST /auth/register` – Registro de usuario.
- `POST /auth/login` – Login con OAuth2 (form-data) y obtención de JWT.
- `GET /auth/me` – Datos del usuario autenticado.
- `GET/POST /cuerpos-agua` – Listado y creación de cuerpos de agua (creación requiere JWT).
- `GET/POST /sensores`
- `GET/POST /parametros`
- `GET/POST /lecturas`
- `GET/POST /alertas`
- `GET/POST /zonas-protegidas`
- `GET/POST /reportes`
- `GET/POST /favoritos`
- `GET/POST /cuerpo-parametros`
- `GET /estadisticas`, `GET /health`

Consulta `db_schema_overview.md` para detalles de las tablas.

## Estructura
```
backend/
├── database.py              # Conexión y creación de tablas
├── db_schema_overview.md    # Resumen del esquema
├── main.py                  # Aplicación FastAPI y rutas
├── models.py                # Modelos SQLAlchemy
├── requirements.txt         # Dependencias
├── run.py                   # Arranque con Uvicorn
└── observatorio_aguas.db    # BD SQLite (auto generada)
```

## Notas
- Los datos de ejemplo y roles base se generan automáticamente en el evento de startup.
- Las operaciones de escritura (creación de cuerpos de agua, sensores, etc.) requieren un JWT válido.
