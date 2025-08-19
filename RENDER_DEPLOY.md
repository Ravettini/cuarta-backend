# 🚀 Deploy de Cuarta en Render con Render Disk

## 📋 **Resumen de Cambios**

Se ha configurado **Render Disk** para proporcionar almacenamiento persistente de archivos en Render.

### **Archivos Modificados:**
- ✅ `render.yaml` - Agregada configuración de Render Disk
- ✅ `server/index.js` - Inicialización automática del almacenamiento
- ✅ `server/scripts/initStorage.js` - Script de inicialización
- ✅ `server/middlewares/upload.js` - Optimizado para Render Disk
- ✅ `.gitignore` - Excluye archivos de uploads
- ✅ `package.json` - Nuevo script `init:storage`

## 🔧 **Configuración de Render Disk**

### **En render.yaml:**
```yaml
disk:
  name: cuarta-storage
  mountPath: /opt/render/project/src/uploads
  sizeGB: 1
```

### **Variables de Entorno:**
```env
UPLOAD_DIR=/opt/render/project/src/uploads
```

## 📁 **Estructura de Almacenamiento**

```
/opt/render/project/src/uploads/
├── .gitkeep
├── 2024/
│   ├── 01/  # Enero
│   ├── 02/  # Febrero
│   └── ...
└── 2025/
    ├── 01/  # Enero
    └── ...
```

## 🚀 **Proceso de Deploy**

### **1. Commit y Push de Cambios**
```bash
git add .
git commit -m "feat: Configurar Render Disk para almacenamiento persistente"
git push origin main
```

### **2. Render Automático**
- Render detectará los cambios en `render.yaml`
- Creará automáticamente el disco persistente de 1GB
- Montará el disco en `/opt/render/project/src/uploads`

### **3. Verificación**
- El servidor se reiniciará automáticamente
- Los logs mostrarán: "✅ Almacenamiento inicializado"
- Los archivos subidos se guardarán en el disco persistente

## 🧪 **Testing Local**

### **Probar Inicialización:**
```bash
npm run init:storage
```

### **Probar Servidor:**
```bash
npm run dev
```

**Logs esperados:**
```
📁 Inicializando almacenamiento...
✅ Almacenamiento inicializado
🚀 Servidor corriendo en http://localhost:3000
💾 Almacenamiento: ./uploads
```

## 🔍 **Verificación en Render**

### **1. Logs del Servidor**
Buscar en los logs de Render:
```
📁 Inicializando almacenamiento...
✅ Almacenamiento inicializado
💾 Almacenamiento: /opt/render/project/src/uploads
```

### **2. Health Check**
```bash
curl https://tu-app.onrender.com/api/v1/health
```

### **3. Subir Archivo de Prueba**
```bash
curl -X POST https://tu-app.onrender.com/api/v1/files \
  -F "file=@test.txt" \
  -F "folder=pruebas"
```

## ⚠️ **Consideraciones Importantes**

### **Límites del Plan Gratuito:**
- **Espacio**: 1GB máximo en Render Disk
- **Tiempo**: 750 horas/mes (se suspende después de 15 min de inactividad)
- **Transferencia**: Sin límites específicos

### **Persistencia:**
- ✅ Los archivos **SOBREVIVEN** reinicios del servidor
- ✅ Los archivos **SOBREVIVEN** deploys de código
- ❌ Los archivos se **PIERDEN** si cambias de plan o eliminas el servicio

## 🔄 **Migración de Datos Existentes**

Si ya tienes archivos en tu servidor local:

### **1. Backup Local:**
```bash
# Crear backup de archivos existentes
tar -czf uploads-backup.tar.gz uploads/
```

### **2. Restaurar en Render:**
```bash
# Después del deploy, restaurar archivos
# Los archivos se moverán automáticamente al disco persistente
```

## 🚨 **Solución de Problemas**

### **Error: "ENOENT: no such file or directory"**
- Verificar que `UPLOAD_DIR` esté configurado correctamente
- Verificar logs de inicialización del almacenamiento

### **Error: "EACCES: permission denied"**
- Render Disk se monta automáticamente con permisos correctos
- Verificar que el script `initStorage.js` se ejecute

### **Archivos no persisten**
- Verificar configuración de Render Disk en `render.yaml`
- Verificar logs de inicialización del servidor

## 📞 **Soporte**

Para problemas específicos de Render Disk:
1. Verificar logs del servidor en Render
2. Verificar configuración en `render.yaml`
3. Verificar variables de entorno en Render Dashboard

## 🎉 **¡Listo!**

Con Render Disk configurado, tu aplicación Cuarta ahora tiene:
- ✅ **Almacenamiento persistente** de 1GB
- ✅ **Archivos que sobreviven** reinicios y deploys
- ✅ **Organización automática** por fecha
- ✅ **Cero cambios** en la funcionalidad existente

Los archivos se guardarán en `/opt/render/project/src/uploads` y estarán disponibles permanentemente.
