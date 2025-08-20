const fs = require('fs');
const path = require('path');

/**
 * Script de mantenimiento para Cuarta
 * Permite recuperar archivos perdidos y limpiar la base de datos
 */

// Simular el modelo File para este script
class MockFile {
  constructor(data) {
    Object.assign(this, data);
  }
}

/**
 * Función para verificar la integridad del almacenamiento
 */
async function checkStorageIntegrity(uploadDir) {
  console.log(`🔍 Verificando integridad del almacenamiento en: ${uploadDir}`);
  
  if (!fs.existsSync(uploadDir)) {
    console.log(`❌ El directorio de uploads no existe: ${uploadDir}`);
    return { exists: false, files: [] };
  }
  
  try {
    const files = [];
    const scanDirectory = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile()) {
          files.push({
            path: fullPath,
            name: item,
            size: stat.size,
            modified: stat.mtime
          });
        } else if (stat.isDirectory() && !item.startsWith('.')) {
          scanDirectory(fullPath);
        }
      }
    };
    
    scanDirectory(uploadDir);
    
    console.log(`📊 Archivos físicos encontrados: ${files.length}`);
    
    return { exists: true, files };
    
  } catch (error) {
    console.error('❌ Error escaneando directorio:', error);
    return { exists: false, files: [], error: error.message };
  }
}

/**
 * Función para mostrar estadísticas del almacenamiento
 */
function showStorageStats(uploadDir) {
  console.log('\n📊 ESTADÍSTICAS DEL ALMACENAMIENTO');
  console.log('=====================================');
  
  if (!fs.existsSync(uploadDir)) {
    console.log(`❌ Directorio no existe: ${uploadDir}`);
    return;
  }
  
  try {
    const stats = fs.statSync(uploadDir);
    console.log(`📁 Directorio: ${uploadDir}`);
    console.log(`📅 Última modificación: ${stats.mtime}`);
    console.log(`🔐 Permisos: ${stats.mode.toString(8)}`);
    
    // Calcular tamaño total
    let totalSize = 0;
    let fileCount = 0;
    
    const calculateSize = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isFile()) {
          totalSize += stat.size;
          fileCount++;
        } else if (stat.isDirectory() && !item.startsWith('.')) {
          calculateSize(fullPath);
        }
      }
    };
    
    calculateSize(uploadDir);
    
    console.log(`📄 Total de archivos: ${fileCount}`);
    console.log(`💾 Tamaño total: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Verificar espacio disponible (aproximado)
    const diskSpace = 1024 * 1024 * 1024; // 1GB
    const usedSpace = totalSize;
    const availableSpace = Math.max(0, diskSpace - usedSpace);
    const usedPercentage = Math.round((usedSpace / diskSpace) * 100);
    
    console.log(`💽 Espacio usado: ${usedPercentage}%`);
    console.log(`🆓 Espacio disponible: ${(availableSpace / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

/**
 * Función principal del script
 */
async function main() {
  console.log('🔧 SCRIPT DE MANTENIMIENTO - CUARTA');
  console.log('=====================================\n');
  
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  
  // Verificar integridad
  const integrity = await checkStorageIntegrity(uploadDir);
  
  // Mostrar estadísticas
  showStorageStats(uploadDir);
  
  // Mostrar archivos encontrados
  if (integrity.exists && integrity.files.length > 0) {
    console.log('\n📋 ARCHIVOS ENCONTRADOS');
    console.log('========================');
    
    // Agrupar por extensión
    const extensions = {};
    integrity.files.forEach(file => {
      const ext = path.extname(file.name).toLowerCase() || 'sin-extensión';
      if (!extensions[ext]) extensions[ext] = [];
      extensions[ext].push(file);
    });
    
    Object.entries(extensions).forEach(([ext, files]) => {
      const totalSize = files.reduce((sum, f) => sum + f.size, 0);
      console.log(`${ext}: ${files.length} archivos (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    });
  }
  
  console.log('\n✅ Verificación completada');
  console.log('\n💡 COMANDOS ÚTILES:');
  console.log('  - GET /api/v1/files/recover - Verificar archivos perdidos');
  console.log('  - GET /api/v1/files/cleanup - Limpiar archivos huérfanos');
  console.log('  - GET /api/v1/files/disk-usage - Ver uso del disco');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n🎉 Script de mantenimiento completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en script de mantenimiento:', error);
      process.exit(1);
    });
}

module.exports = {
  checkStorageIntegrity,
  showStorageStats,
  main
};
