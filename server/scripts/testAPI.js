const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/v1';

// Función para hacer requests a la API
async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    if (data.success !== undefined) {
      console.log(`   Success: ${data.success}`);
      if (data.total !== undefined) {
        console.log(`   Total: ${data.total}`);
      }
    }
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.error(`❌ ${method} ${endpoint} - Error:`, error.message);
    return { success: false, error: error.message };
  }
}

// Función principal de testing
async function runTests() {
  console.log('🧪 Iniciando tests de la API...\n');
  
  // Test 1: Health check
  console.log('1️⃣ Probando health check...');
  await testAPI('/health');
  
  // Test 2: Listar mundos
  console.log('\n2️⃣ Probando listar mundos...');
  const mundosResult = await testAPI('/mundos');
  
  if (mundosResult.success && mundosResult.data.success) {
    console.log(`   Mundos encontrados: ${mundosResult.data.data.length}`);
    
    // Test 3: Obtener mundo específico
    if (mundosResult.data.data.length > 0) {
      const primerMundo = mundosResult.data.data[0];
      console.log(`\n3️⃣ Probando obtener mundo: ${primerMundo.nombre}`);
      await testAPI(`/mundos/${primerMundo.id}`);
      
      // Test 4: Listar sub-mundos del mundo
      if (primerMundo.subMundos && primerMundo.subMundos.length > 0) {
        const primerSubMundo = primerMundo.subMundos[0];
        console.log(`\n4️⃣ Probando listar sub-mundos de: ${primerMundo.nombre}`);
        await testAPI(`/mundos/${primerMundo.id}/sub-mundos`);
        
        // Test 5: Listar desarrollos del sub-mundo
        if (primerSubMundo.desarrollos && primerSubMundo.desarrollos.length > 0) {
          console.log(`\n5️⃣ Probando listar desarrollos de: ${primerSubMundo.nombre}`);
          await testAPI(`/sub-mundos/${primerSubMundo.id}/desarrollos`);
        }
      }
    }
  }
  
  // Test 6: Listar estaciones
  console.log('\n6️⃣ Probando listar estaciones...');
  await testAPI('/estaciones');
  
  // Test 7: Listar archivos
  console.log('\n7️⃣ Probando listar archivos...');
  await testAPI('/files');
  
  // Test 8: Crear nuevo mundo (test de POST)
  console.log('\n8️⃣ Probando crear nuevo mundo...');
  const nuevoMundo = {
    nombre: "Mundo de Test",
    descripcion: "Mundo creado para testing",
    orden: 99
  };
  await testAPI('/mundos', 'POST', nuevoMundo);
  
  console.log('\n🎉 Tests completados!');
}

// Ejecutar tests si se llama directamente
if (require.main === module) {
  runTests()
    .then(() => {
      console.log('\n✨ Todos los tests finalizados');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error en los tests:', error);
      process.exit(1);
    });
}

module.exports = { runTests };
