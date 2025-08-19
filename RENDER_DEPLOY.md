# 🚀 Deploy de Cuarta en Render con Render Disk

## 📋 **Resumen de Cambios**

Se ha configurado **Render Disk** para proporcionar almacenamiento persistente de archivos en Render, con **límites inteligentes por tipo de archivo**.

### **Archivos Modificados:**
- ✅ `render.yaml` - Agregada configuración de Render Disk
- ✅ `server/index.js` - Inicialización automática del almacenamiento
- ✅ `server/scripts/initStorage.js` - Script de inicialización
- ✅ `server/middlewares/upload.js` - **Límites inteligentes por tipo de archivo**
- ✅ `server/controllers/fileController.js` - **Monitoreo de espacio en disco**
- ✅ `server/routes/files.js` - **Endpoint de uso del disco**
- ✅ `.gitignore` - Excluye archivos de uploads
- ✅ `package.json` - Nuevo script `init:storage`
- ✅ `app.js` - **Interfaz completa de gestión de archivos**

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

## 🚨 **Límites Inteligentes por Tipo de Archivo**

### **📄 Documentos:**
- **PDF**: Máximo **10MB**
- **CSV**: Máximo **5MB**
- **Excel**: Máximo **20MB**

### **🗜️ Archivos Comprimidos:**
- **ZIP/RAR/7Z**: Máximo **50MB**

### **🖼️ Imágenes:**
- **JPEG/PNG/WebP**: Máximo **5MB**
- **GIF**: Máximo **10MB**
- **SVG**: Máximo **1MB**

### **🔧 Otros Tipos:**
- **Por defecto**: Máximo **25MB**

### **⚠️ Límite Absoluto:**
- **Cualquier archivo**: Máximo **150MB** (configurable)

## 💾 **Monitoreo de Espacio en Disco**

### **Nuevo Endpoint:**
```
GET /api/v1/files/disk-usage
```

### **Respuesta:**
```json
{
  "disk": {
    "total": 1073741824,
    "used": 52428800,
    "available": 1021313024,
    "usedPercentage": 5,
    "availablePercentage": 95
  },
  "files": {
    "count": 25,
    "totalSize": 52428800
  },
  "recommendations": {
    "warning": null,
    "critical": null
  }
}
```

### **Alertas Automáticas:**
- **⚠️ Advertencia**: Cuando se usa >80% del disco
- **🚨 Crítico**: Cuando se usa >95% del disco

## 🎯 **Interfaz de Usuario**

### **Botones Agregados al Toolbar:**
- **💾 Espacio** - Muestra uso del disco y recomendaciones
- **📁 Listar** - Lista todos los archivos con opciones de descarga/eliminación
- **📤 Subir** - Sube archivos con validación de tamaño y tipo

### **Funcionalidades:**
- ✅ **Subida inteligente** con validación de límites
- ✅ **Listado de archivos** con metadatos completos
- ✅ **Descarga directa** de archivos
- ✅ **Eliminación segura** con confirmación
- ✅ **Monitoreo en tiempo real** del espacio disponible

## 🚀 **Proceso de Deploy**

### **1. Commit y Push de Cambios**
```bash
git add .
git commit -m "feat: Configurar Render Disk con límites inteligentes y monitoreo de espacio"
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

### **Probar Límites:**
```bash
# Crear archivo de prueba de 15MB (debería fallar para PDF)
dd if=/dev/zero of=test.pdf bs=1M count=15
curl -X POST http://localhost:3000/api/v1/files \
  -F "file=@test.pdf" \
  -F "folder=pruebas"
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

### **3. Verificar Uso del Disco**
```bash
curl https://tu-app.onrender.com/api/v1/files/disk-usage
```

### **4. Subir Archivo de Prueba**
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

### **Gestión de Espacio:**
- ✅ **Límites inteligentes** previenen abusos
- ✅ **Monitoreo automático** del uso del disco
- ✅ **Alertas tempranas** cuando se llena el disco
- ✅ **Espacio recuperable** al eliminar archivos

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

### **Error: "Archivo demasiado grande"**
- Verificar límites por tipo de archivo
- Comprimir archivos grandes antes de subir
- Usar archivos ZIP para múltiples archivos

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
4. Usar endpoint `/api/v1/files/disk-usage` para diagnóstico

## 🎉 **¡Listo!**

Con Render Disk configurado, tu aplicación Cuarta ahora tiene:
- ✅ **Almacenamiento persistente** de 1GB
- ✅ **Límites inteligentes** por tipo de archivo
- ✅ **Monitoreo automático** del espacio disponible
- ✅ **Interfaz completa** de gestión de archivos
- ✅ **Archivos que sobreviven** reinicios y deploys
- ✅ **Organización automática** por fecha
- ✅ **Cero cambios** en la funcionalidad existente

Los archivos se guardarán en `/opt/render/project/src/uploads` y estarán disponibles permanentemente, con control inteligente del espacio y alertas automáticas.
