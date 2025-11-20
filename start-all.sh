#!/bin/bash
# GabApp - Script de Setup y Despliegue Completo para RunPod
# Este script hace TODO: instala dependencias, configura el proyecto e inicia los servicios

set -e  # Salir si hay errores

echo "🚀 GabApp - Setup y Despliegue Completo en RunPod"
echo "=================================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Directorio base del proyecto
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# ==============================================================================
# PASO 1: VERIFICAR E INSTALAR NODE.JS
# ==============================================================================
echo -e "${BLUE}📋 Paso 1/8: Verificando Node.js...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚙️ Node.js no encontrado. Instalando Node.js 20.x LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}✅ Node.js instalado correctamente${NC}"
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js ya instalado: $NODE_VERSION${NC}"
fi

echo ""

# ==============================================================================
# PASO 2: VERIFICAR E INSTALAR PM2
# ==============================================================================
echo -e "${BLUE}📋 Paso 2/8: Verificando PM2...${NC}"

if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚙️ PM2 no encontrado. Instalando PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 instalado correctamente${NC}"
else
    echo -e "${GREEN}✅ PM2 ya instalado${NC}"
fi

echo ""

# ==============================================================================
# PASO 3: VERIFICAR E INSTALAR OLLAMA
# ==============================================================================
echo -e "${BLUE}📋 Paso 3/8: Verificando Ollama...${NC}"

if ! command -v ollama &> /dev/null; then
    echo -e "${YELLOW}⚙️ Ollama no encontrado. Instalando Ollama...${NC}"
    curl -fsSL https://ollama.com/install.sh | sh
    echo -e "${GREEN}✅ Ollama instalado correctamente${NC}"
else
    echo -e "${GREEN}✅ Ollama ya instalado${NC}"
fi

# Iniciar Ollama si no está corriendo
if ! pgrep -x "ollama" > /dev/null; then
    echo -e "${YELLOW}⚙️ Iniciando servidor Ollama...${NC}"
    nohup ollama serve > /tmp/ollama.log 2>&1 &
    sleep 3
    echo -e "${GREEN}✅ Ollama iniciado${NC}"
else
    echo -e "${GREEN}✅ Ollama ya está corriendo${NC}"
fi

# Descargar modelo si no existe
if ! ollama list | grep -q "llama3.2"; then
    echo -e "${YELLOW}⚙️ Descargando modelo llama3.2 (esto puede tomar varios minutos)...${NC}"
    ollama pull llama3.2
    echo -e "${GREEN}✅ Modelo llama3.2 descargado${NC}"
else
    echo -e "${GREEN}✅ Modelo llama3.2 ya descargado${NC}"
fi

echo ""

# ==============================================================================
# PASO 4: INSTALAR DEPENDENCIAS DEL BACKEND
# ==============================================================================
echo -e "${BLUE}� Paso 4/8: Configurando Backend...${NC}"

cd "$PROJECT_DIR/server"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️ Instalando dependencias del backend...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias del backend ya instaladas${NC}"
fi

# Generar Prisma Client
echo -e "${YELLOW}⚙️ Generando Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generado${NC}"

# Ejecutar migraciones
echo -e "${YELLOW}⚙️ Ejecutando migraciones de base de datos...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Migraciones ejecutadas${NC}"

echo ""

# ==============================================================================
# PASO 5: INSTALAR DEPENDENCIAS DEL FRONTEND
# ==============================================================================
echo -e "${BLUE}📋 Paso 5/8: Configurando Frontend...${NC}"

cd "$PROJECT_DIR/client"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚙️ Instalando dependencias del frontend...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"
else
    echo -e "${GREEN}✅ Dependencias del frontend ya instaladas${NC}"
fi

echo ""

# ==============================================================================
# PASO 6: CONSTRUIR FRONTEND
# ==============================================================================
echo -e "${BLUE}📋 Paso 6/8: Construyendo Frontend para Producción...${NC}"

if [ ! -d "dist" ] || [ "$1" == "--rebuild" ]; then
    echo -e "${YELLOW}⚙️ Construyendo frontend (esto puede tomar un momento)...${NC}"
    npm run build
    echo -e "${GREEN}✅ Frontend construido exitosamente${NC}"
else
    echo -e "${GREEN}✅ Frontend ya construido (usa --rebuild para reconstruir)${NC}"
fi

# Instalar 'serve' si no está instalado
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}⚙️ Instalando 'serve'...${NC}"
    sudo npm install -g serve
    echo -e "${GREEN}✅ 'serve' instalado${NC}"
fi

echo ""

# ==============================================================================
# PASO 7: INICIAR BACKEND
# ==============================================================================
echo -e "${BLUE}📋 Paso 7/8: Iniciando Backend...${NC}"

cd "$PROJECT_DIR/server"

# Detener proceso anterior si existe
if pm2 list | grep -q "gabapp-backend"; then
    echo -e "${YELLOW}⚙️ Reiniciando backend existente...${NC}"
    pm2 restart gabapp-backend
else
    echo -e "${YELLOW}⚙️ Iniciando backend con PM2...${NC}"
    pm2 start src/app.js --name "gabapp-backend" --env production
fi

echo -e "${GREEN}✅ Backend iniciado en puerto 4000${NC}"

echo ""

# ==============================================================================
# PASO 8: INICIAR FRONTEND
# ==============================================================================
echo -e "${BLUE}📋 Paso 8/8: Iniciando Frontend...${NC}"

cd "$PROJECT_DIR/client"

# Detener proceso anterior si existe
if pm2 list | grep -q "gabapp-frontend"; then
    echo -e "${YELLOW}⚙️ Reiniciando frontend existente...${NC}"
    pm2 restart gabapp-frontend
else
    echo -e "${YELLOW}⚙️ Iniciando frontend con PM2...${NC}"
    pm2 start "serve -s dist -l 3000 -n" --name "gabapp-frontend"
fi

echo -e "${GREEN}✅ Frontend iniciado en puerto 3000${NC}"

# Guardar configuración de PM2
pm2 save

echo ""
echo ""

# ==============================================================================
# RESUMEN FINAL
# ==============================================================================
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║  ✅ ¡GABAPP DESPLEGADA EXITOSAMENTE EN RUNPOD! �         ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}�📊 Estado de los servicios:${NC}"
pm2 status

echo ""
echo -e "${BLUE}🌐 URLs de acceso:${NC}"
echo -e "   ${GREEN}Frontend:${NC} https://7lxtqv697gvl9l-3000.proxy.runpod.net/"
echo -e "   ${GREEN}Backend:${NC}  https://7lxtqv697gvl9l-4000.proxy.runpod.net/"

echo ""
echo -e "${BLUE}📋 Comandos útiles:${NC}"
echo "   pm2 logs              - Ver logs en tiempo real"
echo "   pm2 logs gabapp-backend   - Ver solo logs del backend"
echo "   pm2 logs gabapp-frontend  - Ver solo logs del frontend"
echo "   pm2 restart all       - Reiniciar todo"
echo "   pm2 stop all          - Detener todo"
echo "   pm2 status            - Ver estado"
echo "   pm2 monit             - Monitor de recursos"

echo ""
echo -e "${BLUE}🔄 Para reiniciar después:${NC}"
echo "   ./start-all.sh        - Inicia servicios (sin reinstalar)"
echo "   ./start-all.sh --rebuild  - Reconstruir frontend y reiniciar"

echo ""
echo -e "${GREEN}🎉 ¡Todo listo! Abre tu navegador en la URL del frontend.${NC}"
echo ""
