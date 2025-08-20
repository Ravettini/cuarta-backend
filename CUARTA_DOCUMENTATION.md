# 📚 CUARTA - Documentación Completa

## 🎯 ¿Qué es Cuarta?

**Cuarta** es un sistema de almacenamiento y gestión de desarrollos que funciona como un Google Drive casero. Permite a los usuarios organizar, subir, descargar y gestionar archivos de manera estructurada a través de una interfaz web moderna y responsiva.

## 🏗️ Arquitectura del Sistema

### Frontend
- **Tecnología**: HTML5, CSS3, JavaScript ES6+
- **Framework**: Vanilla JavaScript (sin dependencias externas)
- **UI/UX**: Diseño responsivo con CSS Grid y Flexbox
- **Estilo**: Paleta de colores GCBA (Gobierno de la Ciudad de Buenos Aires)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo)
- **ORM**: Sequelize
- **Middleware**: Multer para manejo de archivos
- **Validación**: Validaciones nativas de Sequelize

### Infraestructura
- **Hosting**: Render (plataforma en la nube)
- **Almacenamiento**: Render Disk (1GB persistente)
- **Base de Datos**: PostgreSQL gestionado por Render

## 🚀 Funcionalidades Principales

### 1. Sistema de Usuarios y Autenticación
- **Roles**: Admin y User
- **Autenticación**: Sistema de login/logout
- **Permisos**: Control de acceso por mundos/sub-mundos
- **Gestión**: Crear, editar, eliminar usuarios

### 2. Estructura Jerárquica
- **Mundos**: Categorías principales (ej: "Estaciones Saludables", "San Fernando")
- **Sub-Mundos**: Subcategorías dentro de cada mundo
- **Desarrollos**: Elementos finales que pueden ser archivos o enlaces

### 3. Gestión de Archivos
- **Subida**: Drag & drop y botón "+ Desarrollo"
- **Tipos Soportados**: HTML, PDF, imágenes, documentos, etc.
- **Límites Inteligentes**: Diferentes tamaños máximos según tipo de archivo
- **Almacenamiento**: Persistente en Render Disk
- **Descarga**: Enlaces directos a archivos

### 4. Interfaz de Usuario
- **Responsiva**: Adaptable a móviles, tablets y desktop
- **Navegación**: Breadcrumbs y navegación intuitiva
- **Modales**: Formularios para crear/editar elementos
- **Drag & Drop**: Interfaz moderna para subir archivos

## 📦 Dependencias y Librerías

### Backend (package.json)
```json
{
  "express": "^4.18.2",           // Framework web
  "sequelize": "^6.32.1",         // ORM para base de datos
  "multer": "^1.4.5-lts.1",      // Middleware para archivos
  "cors": "^2.8.5",              // Cross-Origin Resource Sharing
  "pg": "^8.11.3",               // Driver PostgreSQL
  "sqlite3": "^5.1.6",           // Driver SQLite
  "nodemon": "^3.0.1"            // Auto-restart en desarrollo
}
```

### Frontend
- **Sin dependencias externas** - JavaScript vanilla puro
- **CSS Variables** para sistema de diseño
- **Grid y Flexbox** para layouts
- **Media Queries** para responsividad

## 🗄️ Estructura de Base de Datos

### Tabla: `users`
- `id`: Identificador único (UUID)
- `username`: Nombre de usuario único
- `password`: Contraseña (texto plano - mejorar en producción)
- `role`: Rol del usuario ('admin' o 'user')
- `permittedWorldIds`: IDs de mundos permitidos (JSON string)
- `activo`: Estado del usuario (boolean)
- `created_at`, `updated_at`: Timestamps

### Tabla: `mundos`
- `id`: Identificador único
- `nombre`: Nombre del mundo
- `descripcion`: Descripción del mundo
- `activo`: Estado activo/inactivo
- `orden`: Orden de visualización

### Tabla: `sub_mundos`
- `id`: Identificador único
- `mundoId`: Referencia al mundo padre
- `nombre`: Nombre del sub-mundo
- `descripcion`: Descripción del sub-mundo
- `activo`: Estado activo/inactivo
- `orden`: Orden de visualización

### Tabla: `desarrollos`
- `id`: Identificador único
- `subMundoId`: Referencia al sub-mundo padre
- `titulo`: Título del desarrollo
- `descripcion`: Descripción del desarrollo
- `url`: URL o enlace del desarrollo
- `tags`: Tags asociados (array)
- `activo`: Estado activo/inactivo
- `orden`: Orden de visualización

### Tabla: `files`
- `id`: Identificador único
- `name`: Nombre del archivo
- `file_name`: Nombre original del archivo
- `path`: Ruta en el sistema de archivos
- `content_type`: Tipo MIME del archivo
- `size`: Tamaño en bytes
- `tags`: Tags asociados
- `folder`: Carpeta de organización
- `created_at`, `updated_at`: Timestamps

## 🔧 Configuración del Sistema

### Variables de Entorno
```bash
# Base de datos
DATABASE_URL=postgresql://user:pass@host:port/db

# Configuración del servidor
PORT=3000
NODE_ENV=production

# CORS
ALLOWED_ORIGIN=*

# Almacenamiento
UPLOAD_DIR=/opt/render/project/src/uploads
```

### Render Disk
- **Tamaño**: 1GB
- **Montaje**: `/opt/render/project/src/uploads`
- **Persistencia**: Sobrevive a reinicios y deploys

## ⚠️ Problemas Comunes y Soluciones

### 1. Archivos Perdidos Después de Reinicio
**Síntoma**: Error "Archivo físico no encontrado" al intentar descargar archivos después de un reinicio del entorno.

**Causa**: Durante el reinicio de Render, el directorio de uploads puede perderse temporalmente hasta que se ejecute el script de inicialización.

**Soluciones**:
- **Automática**: El servidor verifica automáticamente la integridad al iniciar
- **Recuperación Automática**: Sistema de reintentos automáticos cada 2 minutos
- **Manual**: Usar endpoints de recuperación:
  - `GET /api/v1/files/recover` - Verificar archivos perdidos
  - `GET /api/v1/files/cleanup` - Limpiar archivos huérfanos
  - `POST /api/v1/files/auto-recover` - Recuperación automática manual
- **Script**: Ejecutar `npm run maintenance` para diagnóstico local

**Prevención**: 
- Sistema de monitoreo continuo en segundo plano
- Verificación automática de integridad cada 2 minutos
- Recuperación automática con reintentos exponenciales

### 2. Render Disk "Dormido"
**Síntoma**: Archivos que aparecen y desaparecen intermitentemente.

**Causa**: Render Disk puede "dormirse" después de períodos de inactividad.

**Solución**: Monitoreo en segundo plano que "despierta" automáticamente el almacenamiento.

### 3. Archivos Huérfanos
**Síntoma**: Registros en la base de datos sin archivos físicos correspondientes.

**Solución**: Endpoint de limpieza automática:
```bash
# Ver archivos huérfanos
GET /api/v1/files/cleanup

# Eliminar archivos huérfanos
GET /api/v1/files/cleanup?clean=true
```

### 4. Problemas de Permisos
**Síntoma**: Errores de escritura en el directorio de uploads.

**Solución**: El script de inicialización verifica automáticamente los permisos y los corrige si es posible.

## 🛠️ Scripts de Mantenimiento

### Script de Mantenimiento
```bash
npm run maintenance
```

**Funcionalidades**:
- Verificar integridad del almacenamiento
- Mostrar estadísticas detalladas
- Identificar archivos perdidos
- Calcular uso de espacio

### Scripts de Inicialización
```bash
npm run init:storage    # Inicializar directorio de uploads
npm run init:database   # Crear tablas en base de datos
```

## 📁 Estructura de Archivos del Proyecto

```
Cuarta/
├── app.js                          # Frontend principal
├── styles.css                      # Estilos CSS
├── index.html                      # Página principal
├── package.json                    # Dependencias y scripts
├── render.yaml                     # Configuración de Render
├── .gitignore                      # Archivos a ignorar
├── README.md                       # Documentación básica
├── CUARTA_DOCUMENTATION.md         # Este archivo
└── server/                         # Backend
    ├── index.js                    # Servidor principal
    ├── config/                     # Configuración
    │   ├── database.js            # Config SQLite
    │   └── db.js                  # Config dinámica DB
    ├── controllers/                # Lógica de negocio
    │   ├── fileController.js      # Controlador de archivos
    │   └── userController.js      # Controlador de usuarios
    ├── middlewares/                # Middlewares
    │   ├── upload.js              # Manejo de archivos
    │   └── error.js               # Manejo de errores
    ├── models/                     # Modelos de datos
    │   ├── user.js                # Modelo de usuario
    │   ├── mundo.js               # Modelo de mundo
    │   ├── subMundo.js            # Modelo de sub-mundo
    │   ├── desarrollo.js          # Modelo de desarrollo
    │   └── file.js                # Modelo de archivo
    ├── routes/                     # Rutas de la API
    │   ├── files.js               # Rutas de archivos
    │   ├── users.js               # Rutas de usuarios
    │   ├── mundos.js              # Rutas de mundos
    │   ├── subMundos.js           # Rutas de sub-mundos
    │   └── desarrollos.js         # Rutas de desarrollos
    ├── scripts/                    # Scripts de inicialización
    │   ├── initStorage.js         # Inicializar almacenamiento
    │   └── initDatabase.js        # Inicializar base de datos
    └── migrations/                 # Migraciones de base de datos
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor con nodemon

# Producción
npm start            # Iniciar servidor de producción

# Inicialización
npm run init:storage # Crear directorio de uploads
npm run init:database # Crear tablas en base de datos
```

## 🔒 Seguridad y Consideraciones

### Implementado
- **CORS configurado** para permitir acceso desde frontend
- **Validación de tipos** en base de datos
- **Control de acceso** basado en roles
- **Límites de archivo** por tipo MIME

### Mejoras Recomendadas para Producción
- **Hash de contraseñas** (bcrypt)
- **Autenticación JWT** en lugar de sesiones
- **Rate limiting** para prevenir abuso
- **Validación de entrada** más estricta
- **Logs de auditoría** para acciones críticas
- **Backup automático** de base de datos

## 🌐 API Endpoints

### Archivos
- `GET /api/v1/files` - Listar archivos
- `POST /api/v1/files` - Subir archivo
- `GET /api/v1/files/:id` - Obtener archivo
- `GET /api/v1/files/:id/download` - Descargar archivo
- `DELETE /api/v1/files/:id` - Eliminar archivo
- `GET /api/v1/files/disk-usage` - Uso del disco
- `GET /api/v1/files/recover` - Verificar archivos perdidos
- `GET /api/v1/files/cleanup` - Limpiar archivos huérfanos
- `POST /api/v1/files/auto-recover` - Recuperación automática manual
- `GET /api/v1/files/health` - Estado del servicio
- `GET /api/v1/files/diagnose` - Diagnóstico completo
- `GET /api/v1/files/test` - Prueba simple
- `POST /api/v1/files/test-upload` - Prueba de upload

### Usuarios
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario
- `POST /api/v1/users/auth` - Autenticar usuario

### Mundos y Sub-Mundos
- `GET /api/v1/mundos` - Listar mundos
- `POST /api/v1/mundos` - Crear mundo
- `PUT /api/v1/mundos/:id` - Actualizar mundo
- `DELETE /api/v1/mundos/:id` - Eliminar mundo

## 📱 Características Responsivas

### Breakpoints
- **Desktop**: > 1024px
- **Tablet**: 768px - 1024px
- **Mobile**: 520px - 768px
- **Small Mobile**: < 520px

### Adaptaciones
- **Header**: Se adapta a pantallas pequeñas
- **Toolbar**: Botones se reorganizan en móvil
- **Grid**: Cambia de 4 columnas a 1 en móvil
- **Modales**: Se ajustan al tamaño de pantalla

## 🎨 Sistema de Diseño

### Colores (Variables CSS)
```css
:root {
  --ba-amarillo: #FFCC00;    /* Amarillo GCBA */
  --ba-cyan: #8DE2D6;        /* Cian GCBA */
  --ba-azul: #153244;        /* Azul GCBA */
  --ba-gris: #3C3C3B;        /* Gris GCBA */
  --ba-off: #FCFCFC;         /* Blanco off */
}
```

### Tipografías
- **Familia**: "Archivo" (GCBA) + fallbacks del sistema
- **Escalas**: Título (24-34px), Bajada (12-17px), Cuerpo (14-16px)
- **Pesos**: Regular (400), Medium (500), Bold (700)

### Espaciado
- **Base**: 8px
- **Gaps**: 8px, 16px, 24px
- **Padding**: 12px, 16px, 20px, 24px
- **Margins**: 8px, 14px, 16px, 24px

## 🔍 Debugging y Logs

### Frontend
- **Console logs** detallados para cada operación
- **Estado de la aplicación** visible en consola
- **Errores** capturados y mostrados al usuario

### Backend
- **Logs estructurados** con timestamps
- **Información de requests** (método, URL, tiempo)
- **Errores detallados** con stack traces
- **Endpoints de diagnóstico** para troubleshooting

## 📊 Monitoreo y Métricas

### Uso de Disco
- **Total disponible**: 1GB
- **Uso actual**: Monitoreado en tiempo real
- **Archivos**: Cantidad y tamaño total
- **Recomendaciones**: Alertas cuando se acerca al límite

### Límites de Archivo por Tipo
- **Imágenes**: 10MB (JPEG, PNG, GIF)
- **Documentos**: 5-20MB (PDF, Excel, Word)
- **HTML/Texto**: 5MB
- **Archivos comprimidos**: 50MB
- **Otros**: 150MB máximo

## 🚀 Despliegue y Mantenimiento

### Render
- **Auto-deploy** desde GitHub
- **Health checks** automáticos
- **Logs en tiempo real** disponibles
- **Escalado** automático según demanda

### Mantenimiento
- **Backups** automáticos de base de datos
- **Monitoreo** de uso de recursos
- **Actualizaciones** de dependencias
- **Logs** para troubleshooting

## 🔮 Roadmap y Mejoras Futuras

### Corto Plazo
- [ ] Hash de contraseñas
- [ ] Sistema de notificaciones
- [ ] Búsqueda de archivos
- [ ] Filtros avanzados

### Mediano Plazo
- [ ] API de terceros (Google Drive, Dropbox)
- [ ] Sistema de versiones de archivos
- [ ] Compartir archivos entre usuarios
- [ ] Auditoría de acciones

### Largo Plazo
- [ ] Machine learning para organización automática
- [ ] Colaboración en tiempo real

---

## 📞 Soporte y Contacto

**Equipo**: GO INNOVACION CULTURAL 
**Desarrollador**: Ignacio Ravettini  
**Proyecto**: Cuarta - Sistema de Almacenamiento  
**Versión**: 1.0.0  
**Última actualización**: Agosto 2025  

---

*Esta documentación se actualiza automáticamente con cada versión del proyecto.*
