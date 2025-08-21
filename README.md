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

## 🔧 Troubleshooting

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

4. **Verificar variables de entorno en Render:**
   - Ir a tu servicio web `cuarta-backend`
   - En la pestaña "Environment", verificar que `DATABASE_URL` esté presente
   - Si no está, hacer redeploy del servicio

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

### 1. Configurar variables de producción
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
ALLOWED_ORIGIN=https://tudominio.com
```

### 2. Build y deploy
```bash
npm install --production
npm start
```

### 3. Usar PM2 para producción
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
