# 🚀 GabApp - RunPod Deployment Setup Guide

## 📋 Información de la Instancia

- **Frontend URL**: https://7lxtqv697gvl9l-3000.proxy.runpod.net/
- **Backend URL**: https://7lxtqv697gvl9l-4000.proxy.runpod.net/
- **Frontend Port**: 3000
- **Backend Port**: 4000

---

## 🔧 Paso 1: Actualizar Sistema e Instalar Dependencias

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version
npm --version

# Instalar PM2 para manejar procesos en segundo plano
sudo npm install -g pm2

# Instalar Git (si no está instalado)
sudo apt install -y git
```

---

## 📦 Paso 2: Clonar o Subir el Proyecto

**Opción A: Si tienes Git configurado**
```bash
cd ~
git clone <tu-repositorio-url> gabapp
cd gabapp
```

**Opción B: Subir manualmente**
```bash
# Crear directorio
mkdir -p ~/gabapp
cd ~/gabapp

# Usar SCP o SFTP para subir los archivos desde tu máquina local
# O comprimir y subir vía interfaz web de RunPod
```

---

## ⚙️ Paso 3: Configurar Variables de Entorno

### Backend (.env)
```bash
cd ~/gabapp/server

# Crear archivo .env
cat > .env << 'EOF'
PORT=4000
NODE_ENV=production
DATABASE_URL="file:./dev.db"
JWT_SECRET="tu_secret_key_super_segura_cambiala_123456789"
OLLAMA_HOST="http://localhost:11434"
FRONTEND_URL="https://7lxtqv697gvl9l-3000.proxy.runpod.net"
EOF
```

### Frontend (.env)
```bash
cd ~/gabapp/client

# Crear archivo .env
cat > .env << 'EOF'
VITE_API_URL=https://7lxtqv697gvl9l-4000.proxy.runpod.net/api
EOF
```

---

## 📥 Paso 4: Instalar Dependencias del Proyecto

### Backend
```bash
cd ~/gabapp/server
npm install

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones de base de datos
npx prisma migrate deploy
```

### Frontend
```bash
cd ~/gabapp/client
npm install

# Construir para producción
npm run build
```

---

## 🔄 Paso 5: Configurar Ollama (IA Local)

```bash
# Descargar e instalar Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Iniciar Ollama en segundo plano
ollama serve &

# Descargar el modelo (espera unos minutos)
ollama pull llama3.2

# Verificar que funciona
ollama list
```

---

## 🚀 Paso 6: Iniciar Aplicación en Segundo Plano con PM2

### Iniciar Backend
```bash
cd ~/gabapp/server

# Iniciar servidor con PM2
pm2 start src/app.js --name "gabapp-backend" --env production

# Verificar que está corriendo
pm2 status
```

### Iniciar Frontend (servidor de archivos estáticos)
```bash
cd ~/gabapp/client

# Instalar servidor estático
npm install -g serve

# Servir archivos build en puerto 3000
pm2 start "serve -s dist -l 3000 -n" --name "gabapp-frontend"
```

---

## 🔍 Paso 7: Verificar que Todo Funciona

```bash
# Ver logs del backend
pm2 logs gabapp-backend

# Ver logs del frontend
pm2 logs gabapp-frontend

# Ver estado de todos los procesos
pm2 status

# Probar el backend
curl http://localhost:4000/

# Probar el frontend
curl http://localhost:3000/
```

### Probar URLs externas
- Abre en tu navegador: https://7lxtqv697gvl9l-3000.proxy.runpod.net/
- Verifica que el backend responda: https://7lxtqv697gvl9l-4000.proxy.runpod.net/

---

## 🔄 Comandos Útiles de PM2

```bash
# Ver todos los procesos
pm2 list

# Reiniciar backend
pm2 restart gabapp-backend

# Reiniciar frontend
pm2 restart gabapp-frontend

# Detener backend
pm2 stop gabapp-backend

# Detener todo
pm2 stop all

# Ver logs en tiempo real
pm2 logs

# Guardar configuración para auto-inicio
pm2 save
pm2 startup
```

---

## 🛠️ Solución de Problemas

### Si el backend no inicia:
```bash
# Ver logs detallados
pm2 logs gabapp-backend --lines 100

# Verificar puerto
sudo netstat -tulpn | grep :4000

# Reiniciar
pm2 restart gabapp-backend
```

### Si hay errores de base de datos:
```bash
cd ~/gabapp/server

# Resetear base de datos (¡CUIDADO: borra datos!)
rm -f prisma/dev.db
npx prisma migrate deploy
npx prisma db seed
```

### Si Ollama no responde:
```bash
# Verificar si está corriendo
ps aux | grep ollama

# Reiniciar Ollama
pkill ollama
ollama serve &
```

---

## 🔐 Seguridad Importante

**⚠️ CAMBIA ESTOS VALORES ANTES DE PRODUCCIÓN:**

1. **JWT_SECRET**: Genera uno aleatorio
```bash
openssl rand -base64 32
```

2. **Base de datos**: Para producción, usa PostgreSQL en vez de SQLite
```bash
# Instalar PostgreSQL (opcional)
sudo apt install -y postgresql postgresql-contrib
```

---

## 📊 Monitoreo

```bash
# Dashboard web de PM2 (opcional)
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M

# Ver uso de recursos
pm2 monit
```

---

## 🎯 Resumen de Comandos Rápidos

```bash
# Iniciar todo
cd ~/gabapp/server && pm2 start src/app.js --name gabapp-backend
cd ~/gabapp/client && pm2 start "serve -s dist -l 3000 -n" --name gabapp-frontend

# Ver estado
pm2 status

# Ver logs
pm2 logs

# Reiniciar todo
pm2 restart all

# Detener todo
pm2 stop all
```

---

## ✅ Checklist Final

- [ ] Node.js y npm instalados
- [ ] PM2 instalado globalmente
- [ ] Proyecto clonado/subido
- [ ] Variables de entorno configuradas (.env)
- [ ] Dependencias instaladas (backend y frontend)
- [ ] Base de datos migrada
- [ ] Frontend construido (`npm run build`)
- [ ] Ollama instalado y modelo descargado
- [ ] Backend corriendo en puerto 4000
- [ ] Frontend corriendo en puerto 3000
- [ ] URLs externas funcionando
- [ ] PM2 guardado para auto-inicio

---

¡Listo! Tu aplicación debería estar corriendo en segundo plano 🚀
