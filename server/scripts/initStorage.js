const fs = require('fs');
const path = require('path');

/**
 * Script para inicializar el directorio de almacenamiento
 * Asegura que el directorio de uploads exista y tenga los permisos correctos
 */
async function initStorage() {
  const uploadDir = process.env.UPLOAD_DIR || './uploads';
  
  try {
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      console.log(`📁 Creando directorio de uploads: ${uploadDir}`);
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Crear subdirectorios por fecha (año/mes)
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
    
    console.log(`✅ Almacenamiento inicializado correctamente en: ${uploadDir}`);
    console.log(`📊 Espacio disponible: ${uploadDir}`);
    
  } catch (error) {
    console.error('❌ Error inicializando almacenamiento:', error);
    throw error;
  }
}

module.exports = { initStorage };

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
