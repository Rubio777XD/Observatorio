# 🌊 Observatorio de Aguas

**Sistema integral de monitoreo y análisis de cuerpos de agua**

Una plataforma web moderna para el seguimiento, análisis y visualización de datos ambientales de cuerpos de agua, desarrollada con tecnologías de vanguardia.

## 🎯 Descripción del Proyecto

El Observatorio de Aguas es una aplicación web completa que permite:

- 🗺️ **Visualización interactiva** de cuerpos de agua en mapas satelitales
- 📊 **Monitoreo en tiempo real** de parámetros ambientales
- 🔍 **Búsqueda y filtrado** avanzado de información
- 📱 **Interfaz responsiva** adaptable a cualquier dispositivo
- 🌐 **API REST** robusta para integración con otros sistemas

## 🏗️ Arquitectura del Sistema

### Frontend
- **React 18** con Vite para desarrollo rápido
- **Tailwind CSS** para diseño moderno y responsivo
- **React Leaflet** para mapas interactivos
- **Heroicons** para iconografía consistente

### Backend
- **FastAPI** framework Python de alto rendimiento
- **SQLAlchemy** ORM para manejo de base de datos
- **SQLite** base de datos ligera y eficiente
- **Uvicorn** servidor ASGI de producción

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ y npm
- Python 3.8+
- Git

### Configuración del Frontend

```bash
# Clonar el repositorio
git clone <repository-url>
cd observatorio-aguas

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```


### Configuración del Backend

```bash
# Navegar al directorio backend
cd backend

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor API
python run.py
```


## 📋 Funcionalidades Principales

### 🗺️ Visualización de Mapas
- Mapas interactivos con marcadores personalizados usando React Leaflet
- Información detallada en popups con botones para ver más información
- Navegación fluida y zoom dinámico con TileLayer de OpenStreetMap
- Leyenda interactiva para diferentes tipos de cuerpos de agua

### 📊 Datos Ambientales
- **Calidad del agua**: pH, oxígeno disuelto, temperatura
- **Contaminación**: Niveles (Alto, Medio, Bajo) con indicadores visuales
- **Biodiversidad**: Indicadores ecológicos (Alta, Media, Baja) con visualización gráfica
- Descripción detallada de cada cuerpo de agua

### 🔍 Sistema de Búsqueda
- Búsqueda por nombre de cuerpo de agua con filtrado en tiempo real
- Filtrado por tipo (río, lago, océano) mediante leyenda interactiva
- Visualización de resultados en el mapa y en panel lateral

### 📱 Interfaz de Usuario
- Diseño moderno y profesional con Tailwind CSS
- Navegación intuitiva entre vista de mapa y detalles
- Panel lateral para información detallada
- Responsive design para móviles con adaptación de componentes
- Sección "Acerca de" con información sobre misión, visión y valores

## 🛠️ API Endpoints

### Cuerpos de Agua

| Método | Endpoint | Descripción | Parámetros |
|--------|----------|-------------|------------|
| GET | `/cuerpos-agua` | Obtener todos los cuerpos de agua | - |
| GET | `/cuerpos-agua/{id}` | Obtener cuerpo específico | `id`: ID del cuerpo de agua |
| GET | `/cuerpos-agua/tipo/{tipo}` | Filtrar por tipo | `tipo`: río, lago, océano |
| GET | `/cuerpos-agua/buscar/{termino}` | Buscar por nombre | `termino`: Texto a buscar |
| POST | `/cuerpos-agua` | Crear nuevo registro | Objeto JSON con datos del cuerpo de agua |
| PUT | `/cuerpos-agua/{id}` | Actualizar registro existente | `id`: ID del cuerpo de agua + Objeto JSON |
| DELETE | `/cuerpos-agua/{id}` | Eliminar registro | `id`: ID del cuerpo de agua |



## 📁 Estructura del Proyecto

```
Proyecto Pagina web/
├── 📁 observatorio-aguas/      # Frontend React
│   ├── 📁 src/
│   │   ├── App.jsx             # Componente principal con mapa interactivo
│   │   ├── main.jsx            # Punto de entrada
│   │   └── 📁 assets/          # Recursos estáticos
│   ├── package.json            # Dependencias Node.js
│   └── vite.config.js          # Configuración Vite
├── 📁 backend/                  # API FastAPI
│   ├── main.py                 # Definición de endpoints y modelos
│   ├── database.py             # Configuración BD y modelos ORM
│   ├── run.py                  # Script de inicio
│   ├── requirements.txt        # Dependencias Python
│   └── venv/                   # Entorno virtual Python
└── README.md                   # Este archivo
```

## 🌟 Características Técnicas

### Performance
- ⚡ **Vite** para builds ultra-rápidos
- 🔄 **Hot Module Replacement** en desarrollo
- 📦 **Code splitting** automático

### Seguridad
- 🛡️ **CORS** configurado correctamente
- 🔒 **Validación de datos** con Pydantic
- 🚫 **Sanitización** de inputs

### Escalabilidad
- 🏗️ **Arquitectura modular**
- 🔌 **API REST** estándar
- 📊 **Base de datos** optimizada

## 💻 Funcionamiento del Código

### Componente Principal (App.jsx)

#### Estados y Gestión de Datos
- **Estados React**: Manejo de navegación, selección de cuerpos de agua y carga de datos
- **Datos de ejemplo**: Información estructurada de cuerpos de agua con coordenadas, tipos y métricas ambientales
- **Efectos**: Simulación de carga de datos y actualización de la interfaz

#### Mapa Interactivo
- **React Leaflet**: Implementación de mapa interactivo con OpenStreetMap como capa base
- **Marcadores**: Representación visual de cuerpos de agua con popups informativos
- **Eventos**: Interacción con marcadores para mostrar información detallada

#### Interfaz de Usuario
- **Navegación**: Sistema de pestañas para alternar entre vistas
- **Panel de Detalles**: Visualización detallada de información ambiental
- **Indicadores Visuales**: Representación gráfica de niveles de contaminación y biodiversidad
- **Sección Informativa**: Contenido sobre misión, visión y valores del observatorio

### Backend (main.py)

#### API FastAPI
- **Endpoints RESTful**: Rutas para obtener, crear, actualizar y eliminar cuerpos de agua
- **Validación de Datos**: Uso de modelos Pydantic para validar entradas
- **Manejo de Errores**: Respuestas HTTP apropiadas para diferentes situaciones

#### Base de Datos
- **ORM SQLAlchemy**: Mapeo objeto-relacional para interactuar con la base de datos
- **Modelos de Datos**: Definición de la estructura de cuerpos de agua
- **Consultas Optimizadas**: Filtrado y búsqueda eficiente de datos

## 🎨 Diseño y UX

- **Paleta de colores** profesional y accesible
- **Tipografía** clara y legible
- **Iconografía** consistente con Heroicons
- **Animaciones** suaves y naturales
- **Feedback visual** inmediato

## 🔧 Scripts Disponibles

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting del código
```

### Backend
```bash
python run.py        # Servidor de desarrollo
```


### Producción
1. **Frontend**: Build estático deployable en cualquier CDN
2. **Backend**: Compatible con Docker, Heroku, AWS, etc.

## 👥 Equipo de Desarrollo

- **Frontend**: React + Vite 
- **Backend**: FastAPI + SQLAlchemy
- **Mapas**: Leaflet + OpenStreetMap
- **UI/UX**: Diseño moderno y responsivo
- 
- ## Frontend (React)
- El proyecto utiliza Vite como herramienta de construcción, que es moderna y eficiente para aplicaciones React.
- Tiene correctamente configuradas las dependencias en package.json , incluyendo React 18, Leaflet (para mapas), Tailwind CSS, y otras bibliotecas necesarias.
- La aplicación React está configurada para redirigir al archivo mapa-simple.html que se encuentra en la carpeta public , lo cual es una decisión de diseño específica para este proyecto.
- El archivo main.jsx inicializa correctamente la aplicación React con StrictMode.
## Configuración de Docker
- El Dockerfile del frontend está correctamente configurado con un enfoque de múltiples etapas (multi-stage build):
  - Primera etapa para construir la aplicación con Node.js
  - Segunda etapa para servir la aplicación con Nginx
- La configuración de Nginx ( nginx.conf ) está bien estructurada para una aplicación SPA (Single Page Application) con configuraciones de seguridad y rendimiento.
## Backend (FastAPI)
- Utiliza FastAPI como framework para la API, que es moderno y de alto rendimiento.
- Tiene configurado CORS para permitir conexiones desde el frontend.
- Implementa modelos de datos con Pydantic para validación.
## Integración
- El docker-compose.yml configura correctamente ambos servicios (frontend y backend) y establece las conexiones entre ellos.
- Las variables de entorno están configuradas para que los servicios puedan comunicarse entre sí.
## Conclusión
El proyecto está bien estructurado y utiliza tecnologías modernas y adecuadas para una aplicación web con frontend en React y backend en FastAPI. La decisión de redirigir desde la aplicación React a un archivo HTML estático ( mapa-simple.html ) es un enfoque válido, aunque poco común, pero puede ser apropiado para este caso de uso específico donde se necesita una integración directa con Leaflet para la visualización de mapas.
