# 🚀 GabApp - Guía Rápida de Despliegue en RunPod

## URLs Configuradas
- **Frontend**: https://7lxtqv697gvl9l-3000.proxy.runpod.net/
- **Backend**: https://7lxtqv697gvl9l-4000.proxy.runpod.net/

## ⚡ Inicio Rápido (Una Sola Vez)

```bash
# 1. Instalar dependencias del sistema
sudo apt update && sudo apt install -y nodejs npm git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# 2. Instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama serve &
ollama pull llama3.2

# 3. Instalar dependencias del proyecto
cd ~/gabapp/server && npm install && npx prisma generate && npx prisma migrate deploy
cd ~/gabapp/client && npm install && npm run build

# 4. Dar permisos y ejecutar
cd ~/gabapp
chmod +x start-all.sh
./start-all.sh
```

## 🎯 Comandos Diarios

```bash
# Iniciar todo
cd ~/gabapp && ./start-all.sh

# Ver estado
pm2 status

# Ver logs
pm2 logs

# Reiniciar
pm2 restart all

# Detener
pm2 stop all
```

## 📝 Archivos Importantes

- `RUNPOD_SETUP.md` - Guía completa paso a paso
- `start-all.sh` - Inicia frontend + backend
- `server/start-backend.sh` - Solo backend
- `client/start-frontend.sh` - Solo frontend
- `.env.production` - Variables de entorno

## ✅ Verificación

- Frontend: https://7lxtqv697gvl9l-3000.proxy.runpod.net/
- Backend: https://7lxtqv697gvl9l-4000.proxy.runpod.net/
