const fs = require('fs');
const path = require('path');

/**
 * Script para inicializar el directorio de almacenamiento
 * Asegura que el directorio de uploads exista y tenga los permisos correctos
 * También verifica la integridad de archivos existentes
 */
async function initStorage() {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  
  try {
    console.log(`📁 Inicializando almacenamiento en: ${uploadDir}`);
    
    // Crear directorio principal si no existe
    if (!fs.existsSync(uploadDir)) {
      console.log(`📁 Creando directorio de uploads: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    } else {
      console.log(`📁 Directorio de uploads ya existe: ${uploadDir}`);
    }
    
    // Verificar permisos de escritura
    try {
      const testFile = path.join(uploadDir, '.test-write');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log(`✅ Permisos de escritura verificados en: ${uploadDir}`);
    } catch (error) {
      console.warn(`⚠️ Advertencia: Problemas de permisos en ${uploadDir}:`, error.message);
    }
    
    // Crear subdirectorios por fecha (año/mes) para organización futura
    const currentDate = new Date();
    const yearDir = path.join(uploadDir, currentDate.getFullYear().toString());
    const monthDir = path.join(yearDir, (currentDate.getMonth() + 1).toString().padStart(2, '0'));
    
    if (!fs.existsSync(yearDir)) {
      fs.mkdirSync(yearDir, { recursive: true });
      console.log(`📁 Directorio de año creado: ${yearDir}`);
    }
    
    if (!fs.existsSync(monthDir)) {
      fs.mkdirSync(monthDir, { recursive: true });
      console.log(`📁 Directorio de mes creado: ${monthDir}`);
    }
    
    // Crear archivo .gitkeep para mantener la estructura en git
    const gitkeepPath = path.join(uploadDir, '.gitkeep');
    if (!fs.existsSync(gitkeepPath)) {
      fs.writeFileSync(gitkeepPath, '# Este archivo mantiene la carpeta uploads en git\n');
    }
    
    // Verificar espacio disponible
    try {
      const stats = fs.statSync(uploadDir);
      console.log(`📊 Información del directorio:`, {
        path: uploadDir,
        exists: true,
        isDirectory: stats.isDirectory(),
        permissions: stats.mode.toString(8)
      });
    } catch (error) {
      console.warn(`⚠️ No se pudo obtener estadísticas del directorio:`, error.message);
    }
    
    console.log(`✅ Almacenamiento inicializado correctamente en: ${uploadDir}`);
    
  } catch (error) {
    console.error('❌ Error inicializando almacenamiento:', error);
    throw error;
  }
}

/**
 * Función para verificar la integridad de archivos existentes
 * Compara los archivos físicos con los registros de la base de datos
 */
async function verifyStorageIntegrity(File) {
  if (!File) {
    console.log('⚠️ Modelo File no disponible, saltando verificación de integridad');
    return;
  }
  
  try {
    console.log('🔍 Verificando integridad del almacenamiento...');
    
    // Obtener todos los archivos de la base de datos
    const files = await File.findAll();
    console.log(`📊 Total de archivos en BD: ${files.length}`);
    
    let existingFiles = 0;
    let missingFiles = 0;
    let totalSize = 0;
    
    for (const file of files) {
      try {
        // Verificar si el archivo físico existe
        await fs.promises.access(file.path);
        existingFiles++;
        totalSize += file.size || 0;
      } catch (error) {
        missingFiles++;
        console.warn(`⚠️ Archivo físico no encontrado: ${file.path} (ID: ${file.id})`);
      }
    }
    
    console.log(`📊 Resumen de integridad:`, {
      total: files.length,
      existentes: existingFiles,
      faltantes: missingFiles,
      tamañoTotal: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
    });
    
    if (missingFiles > 0) {
      console.warn(`⚠️ ${missingFiles} archivos físicos no encontrados`);
    } else {
      console.log(`✅ Todos los archivos físicos están presentes`);
    }
    
  } catch (error) {
    console.error('❌ Error verificando integridad:', error);
  }
}

module.exports = { initStorage, verifyStorageIntegrity };

// Si se ejecuta directamente
if (require.main === module) {
  initStorage()
    .then(() => {
      console.log('🎉 Script de inicialización completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en script de inicialización:', error);
      process.exit(1);
    });
}
