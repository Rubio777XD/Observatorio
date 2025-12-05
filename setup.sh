#!/bin/bash

# Script de inicialización del Observatorio de Aguas
# Este script configura automáticamente el entorno de desarrollo

echo "🌊 Configurando Observatorio de Aguas..."
echo "======================================"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Por favor instala Python 3 primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado desde .env.example"
else
    echo "ℹ️  Archivo .env ya existe"
fi

# Configurar Frontend
echo "🎨 Configurando Frontend..."
cd observatorio-aguas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
    echo "✅ Dependencias del frontend instaladas"
else
    echo "ℹ️  Dependencias del frontend ya instaladas"
fi
cd ..

# Configurar Backend
echo "🔧 Configurando Backend..."
cd backend

# Crear entorno virtual si no existe
if [ ! -d "venv" ]; then
    echo "🐍 Creando entorno virtual de Python..."
    python3 -m venv venv
    echo "✅ Entorno virtual creado"
else
    echo "ℹ️  Entorno virtual ya existe"
fi

# Activar entorno virtual e instalar dependencias
echo "📦 Instalando dependencias del backend..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Dependencias del backend instaladas"

# Crear directorio de datos si no existe
if [ ! -d "data" ]; then
    mkdir data
    echo "✅ Directorio de datos creado"
fi

cd ..

echo ""
echo "🎉 ¡Configuración completada!"
echo "======================================"
echo "Para iniciar el proyecto:"
echo ""
echo "Frontend (Terminal 1):"
echo "  cd observatorio-aguas"
echo "  npm run dev"
echo ""
echo "Backend (Terminal 2):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python run.py"
echo ""
echo "O usar Docker:"
echo "  docker-compose up --build"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 Documentación API: http://localhost:8000/docs"