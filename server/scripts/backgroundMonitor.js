const fs = require('fs');
const path = require('path');

/**
 * Monitoreo en segundo plano para Render Disk
 * Verifica la integridad del almacenamiento cada cierto tiempo
 */
class BackgroundMonitor {
  constructor(File, uploadDir, options = {}) {
    this.File = File;
    this.uploadDir = uploadDir;
    this.intervalMs = options.intervalMs || 5 * 60 * 1000; // 5 minutos por defecto
    this.maxRetries = options.maxRetries || 3;
    this.isRunning = false;
    this.intervalId = null;
    this.lastCheck = null;
    this.issuesCount = 0;
  }

  /**
   * Iniciar monitoreo en segundo plano
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ Monitoreo ya está ejecutándose');
      return;
    }

    console.log(`🔍 Iniciando monitoreo en segundo plano (cada ${this.intervalMs / 1000} segundos)`);
    this.isRunning = true;

    // Primera verificación inmediata
    this.checkIntegrity();

    // Configurar verificación periódica
    this.intervalId = setInterval(() => {
      this.checkIntegrity();
    }, this.intervalMs);
  }

  /**
   * Detener monitoreo
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Deteniendo monitoreo en segundo plano');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Verificar integridad del almacenamiento
   */
  async checkIntegrity() {
    try {
      console.log('🔍 Verificación periódica de integridad...');
      
      if (!this.File) {
        console.log('⚠️ Modelo File no disponible, saltando verificación');
        return;
      }

      const files = await this.File.findAll();
      let missingFiles = 0;
      let totalSize = 0;

      for (const file of files) {
        try {
          await fs.promises.access(file.path);
          totalSize += file.size || 0;
        } catch (error) {
          missingFiles++;
          console.warn(`⚠️ Archivo perdido detectado: ${file.path} (ID: ${file.id})`);
        }
      }

      this.lastCheck = new Date();
      
      if (missingFiles > 0) {
        this.issuesCount++;
        console.warn(`⚠️ Verificación periódica: ${missingFiles} archivos perdidos`);
        
        // Intentar recuperación automática si hay muchos archivos perdidos
        if (missingFiles > files.length * 0.1) { // Más del 10% de archivos perdidos
          console.log('🚨 Muchos archivos perdidos, iniciando recuperación automática...');
          await this.attemptRecovery();
        }
      } else {
        if (this.issuesCount > 0) {
          console.log(`✅ Problemas resueltos: todos los archivos están disponibles`);
          this.issuesCount = 0;
        }
      }

      // Log de estadísticas
      console.log(`📊 Monitoreo: ${files.length} archivos, ${missingFiles} perdidos, ${(totalSize / 1024 / 1024).toFixed(2)} MB total`);

    } catch (error) {
      console.error('❌ Error en verificación periódica:', error);
    }
  }

  /**
   * Intentar recuperación automática
   */
  async attemptRecovery() {
    try {
      console.log('🔧 Intentando recuperación automática...');
      
      // Esperar un poco más para que Render Disk "despierte"
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      // Verificar nuevamente
      const files = await this.File.findAll();
      let recoveredCount = 0;

      for (const file of files) {
        try {
          await fs.promises.access(file.path);
          recoveredCount++;
        } catch (error) {
          // Archivo aún perdido
        }
      }

      if (recoveredCount === files.length) {
        console.log('✅ Recuperación automática exitosa');
        this.issuesCount = 0;
      } else {
        console.warn(`⚠️ Recuperación parcial: ${recoveredCount}/${files.length} archivos disponibles`);
      }

    } catch (error) {
      console.error('❌ Error en recuperación automática:', error);
    }
  }

  /**
   * Obtener estado del monitoreo
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheck: this.lastCheck,
      issuesCount: this.issuesCount,
      intervalMs: this.intervalMs
    };
  }
}

module.exports = BackgroundMonitor;
