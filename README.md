# Cuarta Backend - Express + Sequelize + PostgreSQL

Backend completo para el frontend estático existente, construido con Express.js, Sequelize ORM y PostgreSQL.

## 🏗️ Arquitectura

- **Frontend**: Mantiene la estructura existente (`index.html`, `app.js`, `styles.css`, carpetas de mapas)
- **Backend**: API REST en Express.js con Sequelize ORM
- **Base de datos**: PostgreSQL con Sequelize
- **Storage**: Sistema de archivos local con subcarpetas por fecha
- **Subidas**: Multer para manejo de archivos multipart

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar base de datos PostgreSQL

#### Opción A: PostgreSQL local
```bash
# Instalar PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib

# Crear base de datos
createdb cuarta_db
```

#### Opción B: PostgreSQL en la nube
- [Supabase](https://supabase.com/) (gratis hasta 500MB)
- [Neon](https://neon.tech/) (gratis hasta 3GB)
- [Railway](https://railway.app/) (gratis hasta 500MB)

### 3. Configurar variables de entorno

Copiar `env.example` a `.env` y configurar:

```bash
cp env.example .env
```

Editar `.env`:
```env
# Base de datos PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/cuarta_db

# Configuración del servidor
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGIN=http://localhost:3000

# Subida de archivos
UPLOAD_DIR=./uploads
MAX_UPLOAD_BYTES=157286400
ALLOWED_MIME_TYPES=application/pdf,application/zip,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*

# Seguridad
API_KEY=your-secret-api-key-here
```

### 4. Aplicar migraciones

```bash
npm run migrate
```

### 5. Iniciar servidor

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

## 📁 Estructura del Proyecto

```
cuarta/
├── server/                    # Código del backend
│   ├── config/               # Configuración
│   │   ├── database.js       # Configuración Sequelize CLI
│   │   ├── db.js             # Inicialización Sequelize
│   │   └── cors.js           # Configuración CORS
│   ├── controllers/          # Controladores
│   │   └── fileController.js # Lógica de archivos
│   ├── middlewares/          # Middlewares
│   │   ├── upload.js         # Multer para archivos
│   │   └── error.js          # Manejo de errores
│   ├── migrations/           # Migraciones de base de datos
│   │   └── 20241218000000-create-file.js
│   ├── models/               # Modelos Sequelize
│   │   ├── file.js           # Modelo File
│   │   └── index.js          # Registro de modelos
│   ├── routes/               # Rutas de la API
│   │   └── files.js          # Rutas de archivos
│   └── index.js              # Servidor principal
├── uploads/                  # Archivos subidos (se crea automáticamente)
├── app.js                    # Frontend (modificado)
├── index.html                # Frontend (sin cambios)
├── styles.css                # Frontend (sin cambios)
├── package.json              # Dependencias
├── .sequelizerc              # Configuración Sequelize
└── env.example               # Variables de entorno de ejemplo
```

## 🔌 Endpoints de la API

### Health Check
- `GET /api/v1/health` - Estado del servicio

### Archivos
- `GET /api/v1/files` - Listar archivos (con filtros: `folder`, `q`, `limit`, `offset`)
- `GET /api/v1/files/:id` - Obtener archivo por ID
- `POST /api/v1/files` - Subir archivo (multipart con campo `file`)
- `GET /api/v1/files/:id/download` - Descargar archivo
- `DELETE /api/v1/files/:id` - Eliminar archivo
- `GET /api/v1/files/disk-usage` - Monitorear uso del almacenamiento
- `GET /api/v1/files/recover` - Recuperar archivos perdidos
- `GET /api/v1/files/cleanup?clean=true` - Limpiar archivos huérfanos

## 📊 Base de Datos

### Tabla `files`
- `id` - UUID único (clave primaria)
- `name` - Nombre mostrado del archivo
- `file_name` - Nombre original del archivo
- `path` - Ruta del archivo en el sistema
- `content_type` - Tipo MIME
- `size` - Tamaño en bytes
- `tags` - Tags separados por coma o JSON
- `folder` - Carpeta opcional
- `created_at` - Timestamp de creación
- `updated_at` - Timestamp de actualización

### Índices
- `idx_files_folder` - Por carpeta
- `idx_files_created_at` - Por fecha de creación
- `idx_files_name` - Por nombre

## 🔒 Seguridad

- **CORS**: Solo permite el origen configurado en `ALLOWED_ORIGIN`
- **Validación de archivos**: Whitelist de tipos MIME y límite de tamaño
- **Subidas**: Límite configurable por archivo (150 MB por defecto)
- **Rutas protegidas**: Solo endpoint de descarga es público

## 📝 Tipos de Archivo Permitidos

- **Documentos**: PDF, ZIP, CSV, Excel
- **Imágenes**: JPEG, PNG, GIF, WebP, SVG
- **Límite**: 150 MB por archivo (configurable)

## 🎯 Funcionalidades del Frontend

### Nuevas funciones agregadas a `app.js`:

- `listFiles({folder, q, limit, offset})` - Listar archivos
- `uploadFile(file, folder, tags)` - Subir archivo
- `deleteFile(id)` - Eliminar archivo
- `downloadFile(id)` - Descargar archivo
- `showFileList(folder)` - Mostrar lista de archivos
- `showFileUpload(folder)` - Selector de archivo y subida

### Botones agregados automáticamente:
- 📁 **Listar Archivos** - Muestra archivos existentes
- 📤 **Subir Archivo** - Permite seleccionar y subir archivos

## 🛠️ Desarrollo

### Scripts disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo con nodemon
npm start            # Ejecutar en modo producción
npm run migrate      # Aplicar migraciones
npm run seed         # Ejecutar seeders (si existen)
npm run migrate:undo # Revertir última migración
```

### Variables de entorno

- `DATABASE_URL` - URL de conexión a PostgreSQL
- `PORT` - Puerto del servidor (default: 3000)
- `NODE_ENV` - Entorno (development/production)
- `ALLOWED_ORIGIN` - Origen permitido para CORS
- `UPLOAD_DIR` - Directorio de uploads
- `MAX_UPLOAD_BYTES` - Límite de tamaño de archivo
- `ALLOWED_MIME_TYPES` - Tipos MIME permitidos

## 🧪 Testing de la API

### 1. Health Check
```bash
curl http://localhost:3000/api/v1/health
```

### 2. Subir archivo
```bash
curl -X POST http://localhost:3000/api/v1/files \
  -F "file=@test.pdf" \
  -F "folder=documentos" \
  -F "tags=pdf,test"
```

### 3. Listar archivos
```bash
curl "http://localhost:3000/api/v1/files?folder=documentos&limit=10"
```

### 4. Descargar archivo
```bash
curl -O http://localhost:3000/api/v1/files/{id}/download
```

### 5. Eliminar archivo
```bash
curl -X DELETE http://localhost:3000/api/v1/files/{id}
```

### 6. Monitorear uso del almacenamiento
```bash
curl http://localhost:3000/api/v1/files/disk-usage
```

### 7. Recuperar archivos perdidos
```bash
curl http://localhost:3000/api/v1/files/recover
```

### 8. Limpiar archivos huérfanos
```bash
# Solo verificar
curl http://localhost:3000/api/v1/files/cleanup

# Limpiar realmente
curl "http://localhost:3000/api/v1/files/cleanup?clean=true"
```

## 🔧 Troubleshooting

### ⚠️ **Problema: Archivos se pierden al reiniciar (Plan Free)**

**Síntoma**: Los archivos subidos desaparecen cuando el servicio entra en reposo o se reinicia.

**Causa**: El plan gratuito de Render no incluye almacenamiento persistente. Los archivos se almacenan en el sistema de archivos temporal que se borra al reiniciar.

**Solución**: 
1. **Recomendado**: Actualizar a Plan Starter + 5GB Disk ($8.25/mes)
2. **Alternativa**: Plan Free + 5GB Disk ($1.25/mes) - archivos persisten pero servicio entra en reposo
3. **Mínimo**: Plan Free + 1GB Disk ($0.25/mes) - archivos persisten pero poco espacio

**Pasos para solucionar**:
```bash
# 1. Actualizar render.yaml (ya configurado)
# 2. Hacer commit y push
git add .
git commit -m "Configurar almacenamiento persistente"
git push origin main

# 3. En Render Dashboard:
# - Cambiar plan a "Starter" 
# - Verificar que Disk de 5GB esté montado
# - Hacer Manual Deploy
```

### Error de conexión a PostgreSQL
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `DATABASE_URL`
- Verificar que la base de datos exista

### Problema de conexión en Render
Si la base de datos muestra "Desconectado" en el modal de estado:

1. **Verificar configuración en `render.yaml`:**
   ```yaml
   envVars:
     - key: DATABASE_URL
       fromDatabase:
         name: cuarta-postgres
         property: connectionString
   ```

2. **Verificar que la base de datos esté creada en Render:**
   - Ir a Dashboard de Render
   - Verificar que existe un servicio de base de datos llamado `cuarta-postgres`
   - Verificar que esté en estado "Active"

3. **Probar conexión localmente:**
   ```bash
   npm run test:connection
   ```

4. **Verificar configuración específica de Render:**
   ```bash
   npm run check:render
   ```

5. **Verificar variables de entorno en Render:**
   - Ir a tu servicio web `cuarta-backend`
   - En la pestaña "Environment", verificar que `DATABASE_URL` esté presente
   - Si no está, hacer redeploy del servicio

6. **Pasos de solución paso a paso:**
   - Hacer commit y push de los cambios en `render.yaml`
   - En Render, ir al servicio `cuarta-backend`
   - Hacer "Manual Deploy" desde la pestaña "Manual Deploy"
   - Verificar en "Environment" que `DATABASE_URL` aparezca
   - Si no aparece, verificar que el servicio de BD `cuarta-postgres` esté activo
   - Hacer redeploy completo del servicio

7. **Verificar logs del servidor:**
   - En Render, ir a la pestaña "Logs" del servicio `cuarta-backend`
   - Buscar errores relacionados con "DATABASE_URL" o "sequelize"
   - Verificar que aparezca "✅ Conexión a la base de datos establecida" al iniciar

### Error de permisos en uploads
- Verificar que el directorio `uploads` tenga permisos de escritura
- Crear manualmente: `mkdir uploads`

### Error de CORS
- Verificar `ALLOWED_ORIGIN` en `.env`
- Verificar que coincida con la URL del frontend

### Error de migración
- Verificar que la base de datos esté creada
- Verificar permisos de usuario en PostgreSQL

## 🚀 Deploy a Producción

### 🎯 **Opción Recomendada: Render.com con Plan Starter + 5GB Disk**

Esta es la **opción más recomendada** para producción, ya que proporciona:
- ✅ **Sin tiempo de reposo** (servicio siempre activo)
- ✅ **5GB de almacenamiento persistente** (archivos no se pierden)
- ✅ **Mejor rendimiento** (512MB RAM, 0.5 CPU)
- ✅ **Costo razonable** ($8.25/mes)

#### **Presupuesto:**
- **Plan Starter**: $7/mes
- **5GB Disk**: $1.25/mes
- **Total**: **$8.25/mes** (~$99/año)

#### **Pasos para implementar:**

1. **Configurar `render.yaml`** (ya configurado):
```yaml
services:
  - type: web
    name: cuarta-backend
    env: node
    plan: starter  # ← Plan Starter
    buildCommand: npm install
    startCommand: npm start
    disk:
      name: cuarta-storage
      mountPath: /opt/render/project/src/uploads
      sizeGB: 5  # ← 5GB de almacenamiento persistente
```

2. **Hacer commit y push:**
```bash
git add .
git commit -m "Configurar Plan Starter + 5GB Disk para almacenamiento persistente"
git push origin main
```

3. **En Render Dashboard:**
   - Ir a tu servicio `cuarta-backend`
   - Cambiar el plan a **"Starter"** ($7/mes)
   - Verificar que el **Disk de 5GB** esté montado
   - Hacer **"Manual Deploy"** si es necesario

4. **Verificar funcionamiento:**
   - Los archivos subidos **NO se perderán** al reiniciar
   - El servicio **NO entrará en reposo**
   - Mejor rendimiento general

#### **Ventajas de esta configuración:**
- 🚀 **Sin tiempo de reposo**: Servicio siempre disponible
- 💾 **Almacenamiento persistente**: Archivos seguros permanentemente
- ⚡ **Mejor rendimiento**: Más recursos (RAM/CPU)
- 🔧 **Fácil mantenimiento**: Configuración automática
- 💰 **Costo-beneficio**: Excelente relación precio/calidad

### 🔄 **Alternativas más económicas:**

#### **Opción 2: Plan Free + 5GB Disk**
- **Costo**: $1.25/mes
- **Ventaja**: Muy barato
- **Desventaja**: Servicio entra en reposo cada 15 min

#### **Opción 3: Plan Free + 1GB Disk**
- **Costo**: $0.25/mes
- **Ventaja**: Mínimo costo
- **Desventaja**: Reposo + poco espacio

### 📊 **Comparación de opciones:**

| Opción | Costo/mes | Tiempo de reposo | Almacenamiento | Rendimiento |
|--------|-----------|------------------|----------------|-------------|
| **Starter + 5GB** | **$8.25** | **❌ Ninguno** | **5GB** | **Alto** |
| Free + 5GB | $1.25 | ⚠️ 15 min | 5GB | Básico |
| Free + 1GB | $0.25 | ⚠️ 15 min | 1GB | Básico |

### 🛠️ **Configuración manual (si no usas Render):**

#### 1. Configurar variables de producción
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
ALLOWED_ORIGIN=https://tudominio.com
UPLOAD_DIR=/opt/render/project/src/uploads
```

#### 2. Build y deploy
```bash
npm install --production
npm start
```

#### 3. Usar PM2 para producción
```bash
npm install -g pm2
pm2 start server/index.js --name "cuarta-backend"
pm2 startup
pm2 save
```

## 📞 Soporte

Para problemas o consultas:
1. Verificar logs del servidor
2. Verificar configuración en `.env`
3. Verificar conexión a PostgreSQL
4. Verificar permisos de archivos

## 🎉 ¡Listo!

Tu backend está funcionando y el frontend puede:
- ✅ Listar archivos existentes
- ✅ Subir nuevos archivos
- ✅ Descargar archivos
- ✅ Eliminar archivos
- ✅ Mantener toda la funcionalidad existente

Los archivos se almacenan localmente y los metadatos en PostgreSQL, todo gestionado por Express.js y Sequelize.
