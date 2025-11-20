#!/bin/bash
# GabApp Frontend Startup Script for RunPod

echo "🎨 Starting GabApp Frontend..."

# Ir al directorio del cliente
cd "$(dirname "$0")"

# Construir para producción si no existe
if [ ! -d "dist" ]; then
    echo "🔨 Building frontend for production..."
    npm run build
fi

# Instalar 'serve' globalmente si no está instalado
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve..."
    sudo npm install -g serve
fi

# Iniciar servidor de archivos estáticos con PM2
echo "🔄 Starting frontend with PM2..."
pm2 start "serve -s dist -l 3000 -n" --name "gabapp-frontend"

echo "✅ Frontend started successfully!"
echo "🌐 Access at: https://7lxtqv697gvl9l-3000.proxy.runpod.net/"
echo "📊 Use 'pm2 logs gabapp-frontend' to view logs"
