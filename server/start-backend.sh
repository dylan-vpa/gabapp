#!/bin/bash
# GabApp Backend Startup Script for RunPod

echo "🚀 Starting GabApp Backend..."

# Cargar variables de entorno de producción
export $(cat .env.production | xargs)

# Ir al directorio del servidor
cd "$(dirname "$0")"

# Generar Prisma Client si no existe
if [ ! -d "node_modules/.prisma" ]; then
    echo "📦 Generating Prisma Client..."
    npx prisma generate
fi

# Ejecutar migraciones
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Iniciar servidor con PM2
echo "🔄 Starting server with PM2..."
pm2 start src/app.js --name "gabapp-backend" --env production

echo "✅ Backend started successfully!"
echo "📊 Use 'pm2 logs gabapp-backend' to view logs"
