# Observatorio de Aguas - Backend API

API REST desarrollada con FastAPI para el sistema de monitoreo de cuerpos de agua.

## Características

- 🚀 **FastAPI**: Framework moderno y rápido para APIs
- 🗄️ **SQLAlchemy**: ORM para manejo de base de datos
- 📊 **SQLite**: Base de datos ligera (configurable para PostgreSQL)
- 🔄 **CORS**: Configurado para el frontend
- 📝 **Documentación automática**: Swagger UI y ReDoc
- 🔍 **Búsqueda y filtrado**: Endpoints para buscar cuerpos de agua

## Instalación

### Prerrequisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

### Pasos de instalación

1. **Navegar al directorio del backend:**
   ```bash
   cd backend
   ```

2. **Crear un entorno virtual (recomendado):**
   ```bash
   python -m venv venv
   
   # En macOS/Linux:
   source venv/bin/activate
   
   # En Windows:
   venv\Scripts\activate
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno:**
   - El archivo `.env` ya está configurado con valores por defecto
   - Modifica las variables según tus necesidades

## Uso

### Iniciar el servidor

```bash
# Opción 1: Usando el script de inicio
python run.py

# Opción 2: Directamente con uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El servidor estará disponible en:
- **API**: http://localhost:8000
- **Documentación Swagger**: http://localhost:8000/docs
- **Documentación ReDoc**: http://localhost:8000/redoc

## Endpoints de la API

### Cuerpos de Agua

- `GET /` - Mensaje de bienvenida
- `GET /cuerpos-agua` - Obtener todos los cuerpos de agua
- `GET /cuerpos-agua/{id}` - Obtener un cuerpo de agua específico
- `GET /cuerpos-agua/tipo/{tipo}` - Filtrar por tipo (río, lago, océano)
- `GET /cuerpos-agua/buscar/{termino}` - Buscar por nombre
- `POST /cuerpos-agua` - Crear un nuevo cuerpo de agua

### Ejemplos de uso

```bash
# Obtener todos los cuerpos de agua
curl http://localhost:8000/cuerpos-agua

# Buscar por nombre
curl http://localhost:8000/cuerpos-agua/buscar/amazonas

# Filtrar por tipo
curl http://localhost:8000/cuerpos-agua/tipo/río
```

## Estructura del proyecto

```
backend/
├── main.py              # Aplicación principal FastAPI
├── database.py          # Configuración de base de datos
├── run.py              # Script de inicio
├── requirements.txt     # Dependencias Python
├── .env                # Variables de entorno
├── README.md           # Este archivo
└── observatorio_aguas.db # Base de datos SQLite (se crea automáticamente)
```

## Configuración de la base de datos

Por defecto, la aplicación usa SQLite. Para usar PostgreSQL:

1. Instalar psycopg2: `pip install psycopg2-binary`
2. Modificar `DATABASE_URL` en `.env`:
   ```
   DATABASE_URL=postgresql://usuario:contraseña@localhost/observatorio_aguas
   ```

## Desarrollo

### Agregar nuevos endpoints

1. Definir el modelo Pydantic en `main.py`
2. Crear la función del endpoint
3. Agregar la ruta con el decorador apropiado

### Modificar la base de datos

1. Actualizar el modelo en `database.py`
2. Las tablas se recrean automáticamente en desarrollo

## Próximas características

- [ ] Autenticación JWT
- [ ] Paginación de resultados
- [ ] Validación avanzada de datos
- [ ] Logging estructurado
- [ ] Tests unitarios
- [ ] Migraciones de base de datos con Alembic