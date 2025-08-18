// ===== Utilidades DOM =====
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

// ===== Modal reusable =====
const modal = {
  el: null, titleEl: null, bodyEl: null, submitEl: null, cancelEl: null, closeEl: null, onSubmit: null,
  init(){
    this.el = $("#modal"); this.titleEl=$("#modalTitle"); this.bodyEl=$("#modalBody");
    this.submitEl=$("#modalSubmit"); this.cancelEl=$("#modalCancel"); this.closeEl=$("#modalClose");
    this.submitEl.onclick=()=>{ if(typeof this.onSubmit==="function") this.onSubmit(); };
    this.cancelEl.onclick=this.hide.bind(this);
    this.closeEl.onclick=this.hide.bind(this);
    document.addEventListener("keydown", (e)=>{ if(e.key==="Escape" && this.el.classList.contains("open")) this.hide(); });
  },
  show({title, bodyHTML, onSubmit, initialFocus="#modalSubmit", submitLabel="Guardar"}){
    // Limpiar modal antes de mostrar uno nuevo
    if (this.el.classList.contains("open")) {
      this.hide();
    }
    
    this.titleEl.textContent = title||"";
    this.bodyEl.innerHTML = bodyHTML||"";
    this.onSubmit = onSubmit;
    this.submitEl.textContent = submitLabel;
    this.el.classList.add("open");
    setTimeout(()=>{ const f = this.el.querySelector(initialFocus); if(f) f.focus(); }, 0);
  },
  hide(){ 
    this.el.classList.remove("open"); 
    this.bodyEl.innerHTML=""; 
    this.onSubmit=null; 
  }
};

// ===== Configuración API =====
const BASE_API = '/api/v1';

// Función helper para llamadas a la API
async function api(url, opts = {}) {
  const response = await fetch(BASE_API + url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers
    }
  });
  
  return response;
}

// ===== Estado & Storage =====
const state = { user:null, data:null, currentWorldId:null, currentSubId:null };
const LS_SESSION="gcba_session";

// Sistema de caché para mejorar rendimiento
const cache = {
  data: null,
  lastUpdate: 0,
  cacheDuration: 5 * 60 * 1000, // 5 minutos
  
  isValid() {
    return this.data && (Date.now() - this.lastUpdate) < this.cacheDuration;
  },
  
  set(data) {
    this.data = data;
    this.lastUpdate = Date.now();
    console.log('💾 Datos guardados en caché');
  },
  
  get() {
    return this.data;
  },
  
  clear() {
    this.data = null;
    this.lastUpdate = 0;
    console.log('🗑️ Caché limpiado');
  }
};

// Función para restaurar sesión (mantenida para compatibilidad)
function restoreSession(){
  try {
    const sessionData = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
    if (sessionData && sessionData.user) {
      state.user = sessionData.user;
      state.currentWorldId = sessionData.currentWorldId || null;
      state.currentSubId = sessionData.currentSubId || null;
      console.log('✅ Sesión restaurada:', {
        user: state.user.username,
        currentWorldId: state.currentWorldId,
        currentSubId: state.currentSubId
      });
      return true;
    }
  } catch (error) {
    console.error('Error restaurando sesión:', error);
    localStorage.removeItem(LS_SESSION);
  }
  return false;
}

// Función para persistir sesión
function persistSession(){
  if(state.user) {
    const sessionData = {
      user: state.user,
      currentWorldId: state.currentWorldId,
      currentSubId: state.currentSubId
    };
    localStorage.setItem(LS_SESSION, JSON.stringify(sessionData));
  } else localStorage.removeItem(LS_SESSION);
}

// ===== Funciones de Usuarios =====

// Función para cargar usuarios desde la API
async function loadUserListFromAPI() {
  try {
    console.log('👥 Cargando usuarios desde la API...');
    const response = await api('/users');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Usuarios cargados desde API:', data);
      return data.data || [];
    } else {
      console.log('⚠️ API de usuarios no disponible, usando usuarios por defecto');
      // Fallback a usuarios por defecto
      return [
        { username:"admin", password:"1234", role:"admin", permittedWorldIds:"*" },
        { username:"estaciones", password:"est2025",role:"user", permittedWorldIds:[] },
        { username:"sanfer", password:"sf2025", role:"user", permittedWorldIds:[] },
        { username:"ambos", password:"fullaccess", role:"user", permittedWorldIds:"[]" }
      ];
    }
  } catch (error) {
    console.error('Error cargando usuarios desde API:', error);
    console.log('🔄 Usando usuarios por defecto como fallback');
    // Fallback a usuarios por defecto
    return [
      { username:"admin", password:"1234", role:"admin", permittedWorldIds:"*" },
      { username:"estaciones", password:"est2025",role:"user", permittedWorldIds:[] },
      { username:"sanfer", password:"sf2025", role:"user", permittedWorldIds:[] },
      { username:"ambos", password:"fullaccess", role:"user", permittedWorldIds:[] }
    ];
  }
}

// Función para guardar usuarios (mantenida para compatibilidad)
function saveUserList(users) {
  // Los usuarios ahora se guardan en la base de datos, pero mantenemos esta función
  // para operaciones que aún la necesiten
  console.log('Usuarios guardados localmente (también se guardaron en la base de datos)');
}

// Función para autenticar usuario
async function login(username, password) {
  try {
    console.log('🔐 Intentando login con:', { username, password });
    
    // Primero intentar con la API
    try {
      const response = await api('/users/auth', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          state.user = data.data;
          persistSession();
          console.log('✅ Login exitoso via API, usuario:', state.user);
          return true;
        }
      }
    } catch (apiError) {
      console.log('⚠️ API no disponible, usando autenticación local');
    }
    
    // Fallback a autenticación local
    const users = await loadUserListFromAPI();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      state.user = user;
      persistSession();
      console.log('✅ Login exitoso local, usuario:', state.user);
      return true;
    }
    
    console.log('❌ Login fallido, credenciales inválidas');
    return false;
  } catch (error) {
    console.error('💥 Error en login:', error);
    return false;
  }
}

// Función para verificar si es admin
function isAdmin() {
  return state.user && state.user.role === 'admin';
}

// Función para verificar si puede ver un mundo
function canSeeWorld(worldId) {
  if (!state.user) return false;
  if (state.user.role === 'admin') return true;
  if (state.user.permittedWorldIds === '*') return true;
  return state.user.permittedWorldIds && state.user.permittedWorldIds.includes(worldId);
}

// Función para guardar admin (mantenida para compatibilidad)
function guardAdmin() {
  if (!isAdmin()) {
    alert("Solo administradores pueden acceder a esta función");
    return false;
  }
  return true;
}

// ===== Funciones de Datos =====

// Función para obtener datos por defecto
function getDefaultDataStructure() {
  return {
  worlds:[
    {
      id: crypto.randomUUID(), name:"Estaciones Saludables",
      subWorlds:[
        {
          id: crypto.randomUUID(), name:"Mapas",
          devs:[
  {id:crypto.randomUUID(), title:"Mapa de Rangos de Visitas", desc:"Visualización por rangos", url:"Mapas Estaciones/mapa_rangos.html", tags:["mapa","CABA"]},
  {id:crypto.randomUUID(), title:"Mapa Analítico de Asistentes", desc:"Análisis de asistentes", url:"Mapas Estaciones/Mapa_Asistentes_CABA_Analitico.html", tags:["mapa","analítico"]},
  {id:crypto.randomUUID(), title:"Mapa de Dispersión de Distancias", desc:"Dispersión de distancias", url:"Mapas Estaciones/mapa_distancias.html", tags:["mapa","distancias"]},
  {id:crypto.randomUUID(), title:"Mapa Cobertura Barrial", desc:"Mapa genérico de cobertura por barrio", url:"Mapas Estaciones/mapa_cobertura_barrial.html", tags:["mapa","genérico"]},
  {id:crypto.randomUUID(), title:"Mapa Calor de Asistencia", desc:"Mapa de calor genérico", url:"Mapas Estaciones/mapa_calor_asistencia.html", tags:["mapa","calor"]},
  {id:crypto.randomUUID(), title:"Mapa Puntos de Atención", desc:"Marcadores de puntos de atención", url:"Mapas Estaciones/mapa_puntos_atencion.html", tags:["mapa","puntos"]},
  {id:crypto.randomUUID(), title:"Mapa Tendencias Temporales", desc:"Tendencias por periodo", url:"Mapas Estaciones/mapa_tendencias_temporales.html", tags:["mapa","tendencias"]}
]
        },
        {
          id: crypto.randomUUID(), name:"BI",
          devs:[
            {id:crypto.randomUUID(), title:"Dashboard Power BI", desc:"Dashboard interactivo", url:"https://app.powerbi.com/view?r=eyJrIjoiOGRmY2FlYTYtNjllNS00OWE5LWJjMzEtODhiNjBkMmMyOTgwIiwidCI6IjIzNzc0NzJlLTgwMDQtNDY0OC04NDU2LWJkOTY4N2FmYTE1MCIsImMiOjR9&pageName=ReportSectiona3847c630a8d7da06b55", tags:["bi","dashboard"]}
          ]
        },
        {
          id: crypto.randomUUID(), name:"Reportes",
          devs:[
            {id:crypto.randomUUID(), title:"Reporte General", desc:"Notion", url:"https://www.notion.so/An-lisis-de-Cobertura-y-Participaci-n-Estaciones-Saludables-CABA-2025-2470723826b580fa8654c9aa5b6a1a51?source=copy_link", tags:["reporte"]}
          ]
        }
      ]
    },
    {
      id: crypto.randomUUID(), name:"San Fernando",
      subWorlds:[
        {
          id: crypto.randomUUID(), name:"Mapas",
          devs:[
            {id:crypto.randomUUID(), title:"Ganador por tipo de piso", url:"Mapas Sanfer/mapa_ganador_x_tipo_piso.html", tags:["mapa"]},
            {id:crypto.randomUUID(), title:"Ganador por nivel educativo", url:"Mapas Sanfer/mapa_nivel_educativo (1).html", tags:["mapa"]},
            {id:crypto.randomUUID(), title:"Ganador por nivel educativo y obra social", url:"Mapas Sanfer/mapa_partido_ganador (1).html", tags:["mapa"]},
            {id:crypto.randomUUID(), title:"Uso de garrafa", url:"Mapas Sanfer/mapa_uso_garrafa (1).html", tags:["mapa"]},
            {id:crypto.randomUUID(), title:"Mesas con Potencial 2023", url:"Mapas Sanfer/mapa_san_fernando_circuitos (1).html", tags:["mapa"]},
            {id:crypto.randomUUID(), title:"Mesas Competitivas 2023", url:"Mapas Sanfer/mapa_san_fernando_circuitos (4).html", tags:["mapa"]}
          ]
        },
        {
          id: crypto.randomUUID(), name:"Documentos",
          devs:[
            {id:crypto.randomUUID(), title:"TABLON", url:"https://docs.google.com/spreadsheets/d/1Mu0lNlZRNEa91xgV37TvwMnltyAA9-wH/edit?usp=drive_link&ouid=105283006911507845368&rtpof=true&sd=true", tags:["doc"]},
            {id:crypto.randomUUID(), title:"Último Reporte", url:"https://docs.google.com/document/d/1UzqBDIozeX_vEP_F20vcHD_IBDyT373RW7R_r2JkYao/edit?usp=drive_link", tags:["doc"]},
            {id:crypto.randomUUID(), title:"Reporte Eze", url:"https://www.notion.so/Datos-226e1238ed6c807f94f6e8d66a143fa0?source=copy_link", tags:["doc"]}
          ]
        }
      ]
    }
  ]
};
}

// Función para cargar datos desde la API
async function loadDataFromAPI(forceRefresh = false) {
  try {
    // Verificar caché primero (a menos que se fuerce refrescar)
    if (!forceRefresh && cache.isValid()) {
      console.log('🚀 Usando datos del caché para mayor velocidad');
      return cache.get();
    }
    
    console.log('🔄 Cargando datos desde la API...');
    const mundos = await loadMundosFromAPI();
    
    console.log('📊 Mundos cargados:', mundos);
    
    // Si no hay mundos, crear los por defecto
    if (!mundos || mundos.length === 0) {
      console.log('No hay mundos en la base de datos, creando por defecto...');
      await createDefaultMundos();
      const mundosCreados = await loadMundosFromAPI();
      return {
        worlds: mundosCreados.map(mundo => ({
          id: mundo.id,
          name: mundo.nombre,
          subWorlds: [] // Los sub-mundos se cargarán cuando se necesiten
        }))
      };
    }
    
    // Cargar sub-mundos y desarrollos para cada mundo en paralelo
    console.log('🚀 Cargando datos en paralelo para optimizar velocidad...');
    
    const mundosCompletos = await Promise.all(mundos.map(async (mundo) => {
      console.log(`🔄 Cargando sub-mundos para mundo: ${mundo.nombre}`);
      
      // Cargar sub-mundos del mundo
      const subMundos = await loadSubMundosForMundo(mundo.id);
      console.log(`📂 Sub-mundos encontrados para ${mundo.nombre}:`, subMundos.length);
      
      // Cargar desarrollos para cada sub-mundo en paralelo
      const subMundosConDesarrollos = await Promise.all(subMundos.map(async (subMundo) => {
        console.log(`🔄 Cargando desarrollos para sub-mundo: ${subMundo.nombre}`);
        
        const desarrollos = await loadDesarrollosForSubMundo(subMundo.id);
        console.log(`📄 Desarrollos encontrados para ${subMundo.nombre}:`, desarrollos.length);
        
        // Convertir formato del sub-mundo
        const subMundoFormateado = {
          id: subMundo.id,
          nombre: subMundo.nombre,
          name: subMundo.nombre,
          descripcion: subMundo.descripcion,
          desarrollos: desarrollos.map(dev => ({
            id: dev.id,
            titulo: dev.titulo,
            title: dev.titulo,
            url: dev.url,
            descripcion: dev.descripcion,
            desc: dev.descripcion,
            tags: dev.tags ? dev.tags.split(', ').filter(tag => tag.trim()) : []
          }))
        };
        
        // Sincronizar subWorlds para compatibilidad
        subMundoFormateado.subWorlds = subMundoFormateado.desarrollos;
        
        return subMundoFormateado;
      }));
      
      // Convertir formato del mundo
      const mundoFormateado = {
        id: mundo.id,
        name: mundo.nombre,
        nombre: mundo.nombre,
        subMundos: subMundosConDesarrollos,
        subWorlds: subMundosConDesarrollos // Sincronizar para compatibilidad
      };
      
      return mundoFormateado;
    }));
    
    // Convertir el formato de la API al formato esperado por el frontend
    const formattedData = {
      worlds: mundosCompletos
    };
    
    console.log('✅ Datos completos cargados desde API:', formattedData);
    
    // Guardar en caché para futuras cargas rápidas
    cache.set(formattedData);
    
    return formattedData;
  } catch (error) {
    console.error('Error cargando datos desde API:', error);
    console.log('🔄 Usando datos por defecto como fallback...');
    // Fallback a datos por defecto
    return getDefaultDataStructure();
  }
}

// Función para limpiar caché cuando se modifiquen datos
function invalidateCache() {
  cache.clear();
  console.log('🔄 Caché invalidado para forzar recarga de datos');
}

// Función para guardar datos (mantenida para compatibilidad)
function saveData(d){ 
  // Los datos ahora se guardan en la base de datos, pero mantenemos esta función
  // para operaciones que aún la necesiten
  console.log('Datos guardados localmente (también se guardaron en la base de datos)');
  invalidateCache(); // Limpiar caché cuando se modifiquen datos
}

// ===== Funciones de API para Mundos =====

async function loadMundosFromAPI() {
  try {
    const response = await api('/mundos');
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    } else {
      console.error('Error cargando mundos desde API:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error cargando mundos desde API:', error);
    return [];
  }
}

async function loadSubMundosForMundo(mundoId) {
  try {
    const response = await api(`/sub-mundos`);
    if (response.ok) {
      const data = await response.json();
      // Filtrar sub-mundos por mundoId
      return (data.data || []).filter(sub => sub.mundoId === mundoId);
    } else {
      console.error('Error cargando sub-mundos desde API:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error cargando sub-mundos desde API:', error);
    return [];
  }
}

async function loadDesarrollosForSubMundo(subMundoId) {
  try {
    const response = await api(`/desarrollos`);
    if (response.ok) {
      const data = await response.json();
      // Filtrar desarrollos por subMundoId
      return (data.data || []).filter(dev => dev.subMundoId === subMundoId);
    } else {
      console.error('Error cargando desarrollos desde API:', response.status);
      return [];
    }
  } catch (error) {
    console.error('Error cargando desarrollos desde API:', error);
    return [];
  }
}

async function createMundoAPI(mundoData) {
  try {
    const response = await api('/mundos', {
      method: 'POST',
      body: JSON.stringify(mundoData)
    });
    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      throw new Error(`Error creando mundo: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creando mundo:', error);
    throw error;
  }
}

async function createSubMundoAPI(subMundoData) {
  try {
    const response = await api('/sub-mundos', {
      method: 'POST',
      body: JSON.stringify(subMundoData)
    });
    if (response.ok) {
      const data = await response.json();
      return data.data;
    } else {
      throw new Error(`Error creando sub-mundo: ${response.status}`);
    }
  } catch (error) {
    console.error('Error creando sub-mundo:', error);
    throw error;
  }
}

async function createDesarrolloAPI(desarrolloData) {
  try {
    const response = await api('/desarrollos', {
      method: 'POST',
      body: JSON.stringify(desarrolloData)
    });
    return response.data;
  } catch (error) {
    console.error('Error creando desarrollo:', error);
    throw error;
  }
}

// Función para crear mundos por defecto
async function createDefaultMundos() {
  try {
    const defaultMundos = [
      { nombre: "Estaciones Saludables", descripcion: "Mundo de estaciones saludables", activo: true, orden: 1 },
      { nombre: "San Fernando", descripcion: "Mundo de San Fernando", activo: true, orden: 2 }
    ];
    
    for (const mundo of defaultMundos) {
      await createMundoAPI(mundo);
    }
    
    console.log('Mundos por defecto creados exitosamente');
  } catch (error) {
    console.error('Error creando mundos por defecto:', error);
  }
}

// Función para crear usuarios por defecto en la base de datos
async function createDefaultUsers() {
  try {
    console.log('👥 Creando usuarios por defecto en la base de datos...');
    
    const defaultUsers = [
      { username: "admin", password: "1234", role: "admin", permittedWorldIds: "*" },
      { username: "estaciones", password: "est2025", role: "user", permittedWorldIds: [] },
      { username: "sanfer", password: "sf2025", role: "user", permittedWorldIds: [] },
      { username: "ambos", password: "fullaccess", role: "user", permittedWorldIds: [] }
    ];
    
    // Intentar crear usuarios via API
    for (const user of defaultUsers) {
      try {
        await api('/users', {
          method: 'POST',
          body: JSON.stringify(user)
        });
        console.log(`✅ Usuario ${user.username} creado en la base de datos`);
      } catch (error) {
        console.log(`⚠️ No se pudo crear usuario ${user.username} en la base de datos:`, error.message);
      }
    }
    
    console.log('Usuarios por defecto procesados');
  } catch (error) {
    console.error('Error creando usuarios por defecto:', error);
  }
}

// Función para configurar permisos por defecto
async function ensureDefaultPermissions(users, data) {
  try {
    console.log('🔐 Configurando permisos por defecto...');
    
    if (!users || !Array.isArray(users)) {
      console.log('⚠️ Usuarios no válidos, usando usuarios por defecto');
      users = [
        { username:"admin", password:"1234", role:"admin", permittedWorldIds:"*" },
        { username:"estaciones", password:"est2025",role:"user", permittedWorldIds:[] },
        { username:"sanfer", password:"sf2025", role:"user", permittedWorldIds:[] },
        { username:"ambos", password:"fullaccess", role:"user", permittedWorldIds:[] }
      ];
    }
    
    const mundos = await loadMundosFromAPI();
    console.log('🌍 Mundos disponibles para permisos:', mundos);
    
    if (!mundos || !Array.isArray(mundos)) {
      console.log('⚠️ No se pudieron cargar mundos, usando permisos por defecto');
      return users;
    }
    
    const mapByName = Object.fromEntries(mundos.map(w => [w.nombre, w.id]));
    console.log('🗺️ Mapa de nombres a IDs:', mapByName);
    
    // Actualizar permisos de usuarios
    for (const user of users) {
      if (user.role === "admin") {
        user.permittedWorldIds = "*";
      } else if (user.username === "estaciones") {
        user.permittedWorldIds = [mapByName["Estaciones Saludables"]].filter(Boolean);
      } else if (user.username === "sanfer") {
        user.permittedWorldIds = [mapByName["San Fernando"]].filter(Boolean);
      } else if (user.username === "ambos") {
        user.permittedWorldIds = [
          mapByName["Estaciones Saludables"],
          mapByName["San Fernando"]
        ].filter(Boolean);
      }
      
      console.log(`👤 Usuario ${user.username} tiene permisos:`, user.permittedWorldIds);
      
      // Actualizar usuario en la base de datos
      try {
        if (user.id) {
          await updateUserAPI(user.id, { permittedWorldIds: user.permittedWorldIds });
        }
      } catch (error) {
        console.error(`Error actualizando permisos para ${user.username}:`, error);
      }
    }
    
    console.log('✅ Permisos configurados exitosamente');
    return users;
  } catch (error) {
    console.error('Error configurando permisos por defecto:', error);
    return users || [];
  }
}

// Función para actualizar permisos de usuarios cuando se crea un nuevo mundo
async function updateUserPermissionsForNewWorld(mundoId) {
  try {
    const users = await loadUserListFromAPI();
    const updatedUsers = users.map(user => {
      if (user.role === "admin") return user;
      if (user.username === "estaciones" || user.username === "ambos") {
        if (!user.permittedWorldIds.includes(mundoId)) {
          user.permittedWorldIds.push(mundoId);
        }
      }
      return user;
    });
    
    // Actualizar usuarios en la base de datos
    await Promise.all(updatedUsers.map(user => 
      updateUserAPI(user.id, { permittedWorldIds: user.permittedWorldIds })
    ));
  } catch (error) {
    console.error('Error actualizando permisos de usuarios:', error);
  }
}

// ===== Funciones de API para Usuarios =====

async function updateUserAPI(userId, userData) {
  try {
    const response = await api(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    return response.data;
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    throw error;
  }
}

async function createUserAPI(userData) {
  try {
    console.log('🚀 Creando usuario via API:', userData);
    
    const response = await api('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Usuario creado exitosamente:', result);
      return result.data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error creando usuario: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    throw error;
  }
}

async function updateUserAPI(userId, userData) {
  try {
    console.log('✏️ Actualizando usuario via API:', userId, userData);
    
    const response = await api(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Usuario actualizado exitosamente:', result);
      return result.data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error actualizando usuario: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    throw error;
  }
}

async function deleteUserAPI(userId) {
  try {
    console.log('🗑️ Eliminando usuario:', userId);
    
    const response = await api(`/users/${userId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Usuario eliminado exitosamente:', result);
      return result.success;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error eliminando usuario: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    throw error;
  }
}

// ===== Funciones de UI =====

// Función para ir a autenticación
function goAuth() {
  // Mostrar header pero ocultar botones cuando estemos en login
  const header = document.querySelector('header.appbar');
  const toolbar = header?.querySelector('.toolbar');
  if (header) {
    header.style.display = 'flex';
    if (toolbar) toolbar.style.display = 'none';
  }
  
  // Mostrar solo la sección de auth
  $("#authSection").classList.add("active");
  $("#worldsSection").classList.remove("active");
  $("#adminSection").classList.remove("active");
  $("#subWorldsSection").classList.remove("active");
  $("#devsSection").classList.remove("active");
}

// Función para ir a mundos
async function goWorlds() {
  // Mostrar header y botones cuando estemos en mundos
  const header = document.querySelector('header.appbar');
  const toolbar = header?.querySelector('.toolbar');
  if (header) {
    header.style.display = 'flex';
    if (toolbar) toolbar.style.display = 'flex';
  }
  
  $("#authSection").classList.remove("active");
  $("#worldsSection").classList.add("active");
  $("#adminSection").classList.remove("active");
  $("#subWorldsSection").classList.remove("active");
  $("#devsSection").classList.remove("active");
  
  await renderWorlds();
}

// Función para hacer logout
function logout() {
  state.user = null;
  localStorage.removeItem(LS_SESSION);
  goAuth();
}

// Función para mostrar mensajes en el formulario de auth
function showAuthMessage(message, type = 'info') {
  const authMsg = document.getElementById('authMsg');
  if (!authMsg) return;
  
  authMsg.textContent = message;
  authMsg.className = `t-body ${type}`;
  
  // Limpiar mensaje después de 5 segundos
  setTimeout(() => {
    authMsg.textContent = '';
    authMsg.className = 't-body muted';
  }, 5000);
}

// Función para ir a admin
async function goAdmin() {
  if (!guardAdmin()) return;
  
  $("#authSection").classList.remove("active");
  $("#worldsSection").classList.remove("active");
  $("#adminSection").classList.add("active");
  
  await renderAdmin();
}

// Función para renderizar mundos
async function renderWorlds() {
  const grid = $("#worldsGrid");
  if (!grid) return;
  
  try {
    // Usar estado local en lugar de cargar desde API
    const mundos = state.data?.worlds || [];
    const visible = mundos.filter(w => canSeeWorld(w.id));
    
    console.log('🎯 Renderizando mundos desde estado local:', mundos);
    console.log('👁️ Mundos visibles para el usuario:', visible);
    
    // Debug: mostrar estructura de cada mundo
    mundos.forEach((mundo, index) => {
      console.log(`🌍 Mundo ${index}:`, {
        id: mundo.id,
        nombre: mundo.nombre,
        name: mundo.name,
        subMundos: mundo.subMundos,
        subWorlds: mundo.subWorlds
      });
    });
    
    grid.innerHTML = "";
    $("#worldsEmpty").style.display = visible.length ? "none" : "block";
    
    visible.forEach(w => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${w.name || w.nombre || 'Sin nombre'}</h3>
        <p class="muted t-body">Sub-mundos: ${w.subWorlds ? w.subWorlds.length : (w.subMundos ? w.subMundos.length : 0)}</p>
        <div class="tags"><span class="tag cyan">mundo</span></div>
        <div class="actions">
          <button class="btn btn-secondary">Abrir</button>
          ${isAdmin() ? '<button class="btn btn-rename">Renombrar</button>' : ''}
          ${isAdmin() ? '<button class="btn btn-danger">Eliminar</button>' : ''}
        </div>`;
      
      card.querySelector(".btn.btn-secondary").onclick = () => { 
        state.currentWorldId = w.id; 
        goSubWorlds(); 
      };
      
      if (isAdmin()) {
        card.querySelector(".btn.btn-rename").onclick = () => renameWorld(w.id);
        card.querySelector(".btn.btn-danger").onclick = () => confirmDelete("world", w.id, w.name || w.nombre || 'Sin nombre');
      }
      
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error renderizando mundos:', error);
    grid.innerHTML = '<p>Error cargando mundos</p>';
  }
}

// Función para renderizar sub-mundos
async function renderSubWorlds(mundoId) {
  const w = getCurrentWorld();
  const grid = $("#subWorldsGrid");
  if (!grid) return;
  
  console.log('🔍 renderSubWorlds - mundoId:', mundoId);
  console.log('🔍 getCurrentWorld():', w);
  
  try {
    grid.innerHTML = "";
    if (!w) { 
      console.log('❌ No se encontró el mundo actual');
      $("#subWorldsEmpty").style.display = "block"; 
      return; 
    }
    
    // Usar estado local en lugar de cargar desde API
    const subMundos = w.subMundos || [];
    console.log('🔍 Sub-mundos desde estado local:', subMundos);
    $("#subWorldsEmpty").style.display = subMundos.length ? "none" : "block";
    
    subMundos.forEach(sw => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${sw.name || sw.nombre || 'Sin nombre'}</h3>
        <p class="muted t-body">Desarrollos: ${sw.desarrollos ? sw.desarrollos.length : 0}</p>
        <div class="tags"><span class="tag cyan">sub-mundo</span></div>
        <div class="actions">
          <button class="btn btn-secondary">Abrir</button>
          ${isAdmin() ? '<button class="btn btn-rename">Renombrar</button>' : ''}
          ${isAdmin() ? '<button class="btn btn-danger">Eliminar</button>' : ''}
        </div>`;
      
      card.querySelector(".btn.btn-secondary").onclick = () => { 
        state.currentSubId = sw.id; 
        goDevs(); 
      };
      
      if (isAdmin()) {
        card.querySelector(".btn.btn-rename").onclick = () => renameSub(sw.id);
        card.querySelector(".btn.btn-danger").onclick = () => confirmDelete("sub", sw.id, sw.name || sw.nombre || 'Sin nombre');
      }
      
      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Error renderizando sub-mundos:', error);
    grid.innerHTML = '<p>Error cargando sub-mundos</p>';
  }
}

// Función para renderizar desarrollos
async function renderDesarrollos(subMundoId) {
  console.log('🔍 renderDesarrollos llamado con subMundoId:', subMundoId);
  console.log('🔍 state.currentSubId:', state.currentSubId);
  
  const sw = getCurrentSub();
  console.log('🔍 getCurrentSub() retornó:', sw);
  
  const grid = $("#devsGrid");
  if (!grid) {
    console.log('❌ No se encontró el grid de desarrollos');
    return;
  }
  
  try {
    grid.innerHTML = "";
    
    if (!sw) {
      console.log('❌ No se encontró el sub-mundo actual');
      $("#devsEmpty").style.display = "block";
      return;
    }
    
    // Usar estado local en lugar de cargar desde API
    const desarrollos = sw.desarrollos || [];
    console.log('🔍 Desarrollos desde estado local:', desarrollos);
    console.log('🔍 Cantidad de desarrollos:', desarrollos.length);
    
    // Mostrar mensaje si no hay desarrollos
    $("#devsEmpty").style.display = desarrollos.length ? "none" : "block";
    
    // Renderizar desarrollos de forma eficiente
    desarrollos.forEach(d => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${d.titulo || d.title || 'Sin título'}</h3>
        <p class="muted t-body">${d.descripcion || d.desc || ""}</p>
        <div class="tags">${(d.tags || []).map(t => `<span class="tag cyan">${t}</span>`).join("")}</div>
        <div class="actions">
          ${d.url ? `<a class="button-link full-width" href="${d.url}" target="_blank" rel="noopener">Abrir</a>` : ""}
          <div class="secondary-actions">
            <button class="btn btn-edit">Editar</button>
            <button class="btn btn-danger">Eliminar</button>
          </div>
        </div>`;
      
      card.querySelector(".btn.btn-edit").onclick = () => showDevForm({mode: "edit", devId: d.id});
      card.querySelector(".btn.btn-danger").onclick = () => confirmDelete("dev", d.id, d.titulo || d.title || 'Sin título');
      
      grid.appendChild(card);
    });
    
    console.log('✅ Desarrollos renderizados exitosamente');
  } catch (error) {
    console.error('Error renderizando desarrollos:', error);
    grid.innerHTML = '<p>Error cargando desarrollos</p>';
  }
}

// ===== Funciones auxiliares =====
function getCurrentWorld() { 
  if (!state.data?.worlds) return null;
  const mundo = state.data.worlds.find(w => w.id === state.currentWorldId);
  if (!mundo) return null;
  
  // Asegurar que tenga la estructura correcta
  if (!mundo.subMundos && mundo.subWorlds) {
    mundo.subMundos = mundo.subWorlds;
  }
  
  return mundo;
}

function getCurrentSub() { 
  console.log('🔍 getCurrentSub - state.currentWorldId:', state.currentWorldId);
  console.log('🔍 getCurrentSub - state.currentSubId:', state.currentSubId);
  
  const w = getCurrentWorld(); 
  console.log('🔍 getCurrentSub - mundo encontrado:', w);
  
  if (!w) {
    console.log('❌ getCurrentSub - No se encontró el mundo');
    return null;
  }
  
  // Buscar en subMundos o subWorlds
  const subMundos = w.subMundos || w.subWorlds || [];
  console.log('🔍 getCurrentSub - subMundos disponibles:', subMundos);
  
  const subMundo = subMundos.find(s => s.id === state.currentSubId);
  console.log('🔍 getCurrentSub - sub-mundo encontrado:', subMundo);
  
  if (subMundo) {
    // Asegurar que desarrollos esté siempre disponible
    if (!subMundo.desarrollos) {
      subMundo.desarrollos = [];
      console.log('🔍 getCurrentSub - Array desarrollos inicializado');
    }
    
    // Sincronizar subWorlds con desarrollos para compatibilidad
    if (subMundo.subWorlds !== subMundo.desarrollos) {
      subMundo.subWorlds = subMundo.desarrollos;
      console.log('🔍 getCurrentSub - subWorlds sincronizado con desarrollos');
    }
    
    console.log('🔍 getCurrentSub - Desarrollos del sub-mundo:', subMundo.desarrollos);
    console.log('🔍 getCurrentSub - Cantidad de desarrollos:', subMundo.desarrollos.length);
  }
  
  return subMundo;
}

function setSection(id) { 
  $$("main section").forEach(s => s.classList.remove("active")); 
  $(id).classList.add("active"); 
}

function toggleToolbar(show, scope = {}) {
  $("#btnNewWorld").style.display = (show && isAdmin()) ? "inline-block" : "none";
  $("#btnNewSubWorld").style.display = (show && scope.world && isAdmin()) ? "inline-block" : "none";
  $("#btnAddDev").style.display = (show && scope.sub) ? "inline-block" : "none";
  $("#btnBack").style.display = show ? "inline-block" : "none";
  $("#btnLogout").style.display = state.user ? "inline-block" : "none";
  $("#btnAdmin").style.display = (state.user && isAdmin()) ? "inline-block" : "none";
}

function updateHero() {
  // Función para actualizar el hero según la vista actual
  const heroTitle = $("#heroTitle");
  const heroDesc = $("#heroDesc");
  
  if (state.currentSubId) {
    const sw = getCurrentSub();
    if (heroTitle) heroTitle.textContent = sw ? sw.nombre : "";
    if (heroDesc) heroDesc.textContent = "Desarrollos disponibles en este sub-mundo.";
  } else if (state.currentWorldId) {
    const w = getCurrentWorld();
    if (heroTitle) heroTitle.textContent = w ? w.nombre : "";
    if (heroDesc) heroDesc.textContent = "Sub-mundos disponibles en este mundo.";
  } else {
    if (heroTitle) heroTitle.textContent = "Hola, " + (state.user?.username || "");
    if (heroDesc) heroDesc.textContent = "Elegí un mundo para empezar.";
  }
}

// ===== Navegación =====
function goAuth() { 
  setSection("#authSection"); 
  updateHero(); 
  toggleToolbar(false); 
}

function goWorlds() { 
  state.currentSubId = null; 
  setSection("#worldsSection"); 
  renderWorlds(); 
  updateHero(); 
  toggleToolbar(true, {world: true}); 
}

function goSubWorlds() { 
  setSection("#subWorldsSection"); 
  renderSubWorlds(state.currentWorldId); 
  updateHero(); 
  toggleToolbar(true, {world: true, sub: true}); 
  persistSession(); // Persistir el estado de navegación
}

function goDevs() { 
  setSection("#devsSection");
  renderDesarrollos(state.currentSubId); 
  updateHero(); 
  toggleToolbar(true, {world: true, sub: true, dev: true}); 
  persistSession(); // Persistir el estado de navegación
}

function goAdmin() { 
  if (!guardAdmin()) return; 
  setSection("#adminSection"); 
  renderAdmin(); 
  updateHero(); 
  toggleToolbar(true, {world: true}); 
}

// ===== Formularios en modal =====
// ===== MODAL PARA CREAR MUNDO =====
function showCreateWorldModal() {
  if (!isAdmin()) return;
  
  modal.show({
    title: "Nuevo Mundo",
    bodyHTML: `
      <div class="field">
        <label for="worldName">Nombre del mundo</label>
        <input id="worldName" placeholder="Ingrese el nombre del mundo" />
      </div>
      <div class="field">
        <label for="worldDesc">Descripción</label>
        <textarea id="worldDesc" placeholder="Ingrese la descripción"></textarea>
      </div>`,
    onSubmit: async () => {
      const name = $("#worldName").value.trim();
      const desc = $("#worldDesc").value.trim();
      if (!name) return;
      
      try {
        await createMundo({ nombre: name, descripcion: desc });
        modal.hide();
        await renderWorlds();
        renderAdmin?.();
        updateHero();
      } catch (error) {
        console.error('Error creando mundo:', error);
        alert(`Error: ${error.message}`);
      }
    },
    initialFocus: "#worldName",
    submitLabel: "Crear"
  });
}

// ===== MODAL PARA RENOMBRAR MUNDO =====
function showRenameWorldModal(worldId) {
  if (!isAdmin()) return;
  
  const existing = state.data.worlds?.find(w => w.id === worldId);
  if (!existing) return;
  
  modal.show({
    title: "Renombrar Mundo",
    bodyHTML: `
      <div class="field">
        <label for="worldName">Nombre del mundo</label>
        <input id="worldName" placeholder="Ingrese el nuevo nombre" value="${existing.nombre}" />
      </div>
      <div class="field">
        <label for="worldDesc">Descripción</label>
        <textarea id="worldDesc" placeholder="Ingrese la descripción">${existing.descripcion || ""}</textarea>
      </div>`,
    onSubmit: async () => {
      const name = $("#worldName").value.trim();
      const desc = $("#worldDesc").value.trim();
      if (!name) return;
      
      try {
        await updateMundo(worldId, { nombre: name, descripcion: desc });
        modal.hide();
        await renderWorlds();
        renderAdmin?.();
        updateHero();
      } catch (error) {
        console.error('Error actualizando mundo:', error);
        alert(`Error: ${error.message}`);
      }
    },
    initialFocus: "#worldName",
    submitLabel: "Guardar"
  });
}

// ===== MODAL PARA CREAR SUB-MUNDO =====
function showCreateSubWorldModal() {
  if (!isAdmin()) return;
  
  const w = getCurrentWorld();
  if (!w) return;
  
  modal.show({
    title: "Nuevo Sub-Mundo",
    bodyHTML: `
      <div class="field">
        <label for="subName">Nombre del sub-mundo</label>
        <input id="subName" placeholder="Ingrese el nombre del sub-mundo" />
      </div>
      <div class="field">
        <label for="subDesc">Descripción</label>
        <textarea id="subDesc" placeholder="Ingrese la descripción"></textarea>
      </div>`,
    onSubmit: async () => {
      const name = $("#subName").value.trim();
      const desc = $("#subDesc").value.trim();
      if (!name) return;
      
      try {
        await createSubMundo({ nombre: name, descripcion: desc, mundoId: w.id });
        modal.hide();
        await renderSubWorlds();
        updateHero();
      } catch (error) {
        console.error('Error creando sub-mundo:', error);
        alert(`Error: ${error.message}`);
      }
    },
    initialFocus: "#subName",
    submitLabel: "Crear"
  });
}

// ===== MODAL PARA RENOMBRAR SUB-MUNDO =====
function showRenameSubWorldModal(subId) {
  if (!isAdmin()) return;
  
  const w = getCurrentWorld();
  if (!w) return;
  
  const existing = w.subMundos?.find(s => s.id === subId);
  if (!existing) return;
  
  modal.show({
    title: "Renombrar Sub-Mundo",
    bodyHTML: `
      <div class="field">
        <label for="subName">Nombre del sub-mundo</label>
        <input id="subName" placeholder="Ingrese el nuevo nombre" value="${existing.nombre}" />
      </div>
      <div class="field">
        <label for="subDesc">Descripción</label>
        <textarea id="subDesc" placeholder="Ingrese la descripción">${existing.descripcion || ""}</textarea>
      </div>`,
    onSubmit: async () => {
      const name = $("#subName").value.trim();
      const desc = $("#subDesc").value.trim();
      if (!name) return;
      
      try {
        await updateSubMundo(subId, { nombre: name, descripcion: desc });
        modal.hide();
        await renderSubWorlds();
        updateHero();
      } catch (error) {
        console.error('Error actualizando sub-mundo:', error);
        alert(`Error: ${error.message}`);
      }
    },
    initialFocus: "#subName",
    submitLabel: "Guardar"
  });
}

function showDevForm({mode = "create", devId = null} = {}) {
  const sw = getCurrentSub();
  if (!sw) return;
  
  const existing = devId ? sw.desarrollos?.find(d => d.id === devId) : null;
  
  modal.show({
    title: mode === "create" ? "Nuevo desarrollo" : "Editar desarrollo",
    bodyHTML: `
      <div class="field">
        <label for="devTitle">Título</label>
        <input id="devTitle" placeholder="Ej. Dashboard Ventas" value="${existing ? existing.titulo : ""}" />
      </div>
      <div class="field">
        <label for="devURL">URL (opcional)</label>
        <input id="devURL" placeholder="https://..." value="${existing ? (existing.url || "") : ""}" />
      </div>
      <div class="field">
        <label for="devDesc">Descripción (opcional)</label>
        <textarea id="devDesc" placeholder="Breve descripción...">${existing ? (existing.descripcion || "") : ""}</textarea>
      </div>
      <div class="field">
        <label for="devTags">Tags (separadas por coma)</label>
        <input id="devTags" placeholder="mapa, bi, informe" value="${existing ? (existing.tags || []).join(", ") : ""}" />
      </div>`,
    onSubmit: async () => {
      const titulo = $("#devTitle").value.trim();
      if (!titulo) return;
      
      const url = $("#devURL").value.trim();
      const descripcion = $("#devDesc").value.trim();
      const tags = $("#devTags").value.split(",").map(t => t.trim()).filter(Boolean);
      
      try {
        if (mode === "create") {
          await createDesarrollo({ titulo, url, descripcion, tags, subMundoId: sw.id });
        } else {
          await updateDesarrollo(devId, { titulo, url, descripcion, tags });
        }
        modal.hide();
        await renderDesarrollos();
      } catch (error) {
        console.error('Error en formulario desarrollo:', error);
        alert(`Error: ${error.message}`);
      }
    },
    initialFocus: "#devTitle",
    submitLabel: mode === "create" ? "Crear" : "Guardar"
  });
}

// ===== MODAL PARA ELIMINAR =====
function showDeleteModal(scope, id, name) {
  const labels = {world: "mundo", sub: "sub-mundo", dev: "desarrollo"};
  
  modal.show({
    title: `Eliminar ${labels[scope]}`,
    bodyHTML: `<p class="t-body">¿Seguro querés eliminar <strong>${name}</strong>? Esta acción no se puede deshacer.</p>`,
    onSubmit: async () => {
      try {
        if (scope === "world") {
          // Eliminar del estado local primero
          state.data.worlds = state.data.worlds.filter(w => w.id !== id);
          // Recargar datos desde la API
          state.data = await loadDataFromAPI();
          state.currentWorldId = null;
          state.currentSubId = null;
          await goWorlds();
        } else if (scope === "sub") {
          // Eliminar del estado local primero
          const w = getCurrentWorld();
          if (w && w.subMundos) {
            w.subMundos = w.subMundos.filter(s => s.id !== id);
          }
          // Recargar datos desde la API
          state.data = await loadDataFromAPI();
          state.currentSubId = null;
          await goSubWorlds();
        } else if (scope === "dev") {
          // Eliminar del estado local primero
          const sw = getCurrentSub();
          if (sw && sw.desarrollos) {
            sw.desarrollos = sw.desarrollos.filter(d => d.id !== id);
          }
          // Recargar datos desde la API
          state.data = await loadDataFromAPI();
          await renderDesarrollos();
        }
        modal.hide();
      } catch (error) {
        console.error('Error eliminando:', error);
        alert(`Error al eliminar: ${error.message}`);
      }
    },
    submitLabel: "Eliminar"
  });
}

// ===== CRUD (usando modales) =====
function createWorld() { showCreateWorldModal(); }
function renameWorld(id) { showRenameWorldModal(id); }
function deleteWorld(id) {
  const w = state.data.worlds?.find(x => x.id === id);
  if (!w) return;
  showDeleteModal("world", id, w.nombre);
}

function createSubWorld() { showCreateSubWorldModal(); }
function renameSub(id) { showRenameSubWorldModal(id); }
function deleteSub(id) {
  const w = getCurrentWorld();
  if (!w) return;
  const sw = w.subMundos?.find(x => x.id === id);
  if (!sw) return;
  showDeleteModal("sub", id, sw.nombre);
}

function addDevManually() { showDevForm({mode: "create"}); }
function editDev(id) { showDevForm({mode: "edit", devId: id}); }
function deleteDev(id) {
  const sw = getCurrentSub();
  if (!sw) return;
  const d = sw.desarrollos?.find(x => x.id === id);
  if (!d) return;
  showDeleteModal("dev", id, d.titulo);
}

// ===== Drag & Drop =====
function setupDropzone() {
  const dz = $("#dropzone");
  if (!dz) return;
  
  ["dragenter", "dragover"].forEach(evt => {
    dz.addEventListener(evt, e => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      dz.classList.add("dragover"); 
    });
  });
  
  ["dragleave", "drop"].forEach(evt => {
    dz.addEventListener(evt, e => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      dz.classList.remove("dragover"); 
    });
  });
  
  dz.addEventListener("drop", async e => {
    const sw = getCurrentSub();
    if (!sw) return alert("Elegí un sub-mundo.");
    
    const items = e.dataTransfer.items;
    if (items && items.length) {
      for (const it of items) {
        if (it.kind === "string") {
          it.getAsString(async str => {
            try {
              const maybeURL = (str || "").trim();
              if (maybeURL.startsWith("http")) {
                await createDesarrollo({
                  titulo: new URL(maybeURL).hostname,
                  url: maybeURL,
                  descripcion: "Agregado por drag & drop",
                  tags: ["link"],
                  subMundoId: sw.id
                });
                await renderDesarrollos();
              }
            } catch (error) {
              console.error('Error procesando URL:', error);
            }
          });
        } else if (it.kind === "file") {
          const file = it.getAsFile();
          const url = URL.createObjectURL(file);
          try {
            await createDesarrollo({
              titulo: file.name,
              url: url,
              descripcion: `Archivo local (${Math.round(file.size / 1024)} KB)`,
              tags: ["archivo"],
              subMundoId: sw.id
            });
            await renderDesarrollos();
          } catch (error) {
            console.error('Error procesando archivo:', error);
          }
        }
      }
    }
  });
  
  dz.addEventListener("paste", async e => {
    const sw = getCurrentSub();
    if (!sw) return;
    
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if (text && text.startsWith("http")) {
      try {
        await createDesarrollo({
          titulo: new URL(text).hostname,
          url: text,
          descripcion: "Agregado por pegar enlace",
          tags: ["link"],
          subMundoId: sw.id
        });
        await renderDesarrollos();
      } catch (error) {
        console.error('Error procesando enlace pegado:', error);
      }
    }
  });
}

// ===== Eventos UI =====
function showAuthMessage(message, type = 'info') {
  const authMsg = document.getElementById('authMsg');
  if (!authMsg) return;
  authMsg.textContent = message;
  authMsg.className = `t-body ${type}`;
  setTimeout(() => { 
    authMsg.textContent = ''; 
    authMsg.className = 't-body muted'; 
  }, 5000);
}

// ===== Drag & Drop =====
function setupDropzone() {
  const dz = $("#dropzone");
  if (!dz) return;
  
  ["dragenter", "dragover"].forEach(evt => {
    dz.addEventListener(evt, e => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      dz.classList.add("dragover"); 
    });
  });
  
  ["dragleave", "drop"].forEach(evt => {
    dz.addEventListener(evt, e => { 
      e.preventDefault(); 
      e.stopPropagation(); 
      dz.classList.remove("dragover"); 
    });
  });
  
  dz.addEventListener("drop", e => {
    const sw = getCurrentSub(); 
    if (!sw) return alert("Elegí un sub-mundo.");
    
    const items = e.dataTransfer.items;
    if (items && items.length) {
      for (const it of items) {
        if (it.kind === "string") {
          it.getAsString(str => {
            try {
              const maybeURL = (str || "").trim();
              if (maybeURL.startsWith("http")) {
                // Mostrar modal para configurar el desarrollo
                showDragDropModal({
                  titulo: new URL(maybeURL).hostname,
                  url: maybeURL,
                  descripcion: "Agregado por drag & drop",
                  tags: ["link"]
                });
              }
            } catch {}
          });
        } else if (it.kind === "file") {
          const file = it.getAsFile();
          const url = URL.createObjectURL(file);
          // Mostrar modal para configurar el desarrollo
          showDragDropModal({
            titulo: file.name,
            url: url,
            descripcion: `Archivo local (${Math.round(file.size/1024)} KB)`,
            tags: ["archivo"]
          });
        }
      }
    }
  });
  
  dz.addEventListener("paste", e => {
    const sw = getCurrentSub(); 
    if (!sw) return;
    
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if (text && text.startsWith("http")) {
      // Mostrar modal para configurar el desarrollo
      showDragDropModal({
        titulo: new URL(text).hostname,
        url: text,
        descripcion: "Agregado por pegar enlace",
        tags: ["link"]
      });
    }
  });
}

// Modal para drag & drop
function showDragDropModal(data) {
  modal.show({
    title: "Nuevo desarrollo desde archivo/enlace",
    bodyHTML: `
      <div class="field">
        <label for="dragTitle">Título</label>
        <input id="dragTitle" placeholder="Título del desarrollo" value="${data.titulo}" />
      </div>
      <div class="field">
        <label for="dragURL">URL</label>
        <input id="dragURL" placeholder="URL del desarrollo" value="${data.url}" readonly />
      </div>
      <div class="field">
        <label for="dragDesc">Descripción</label>
        <textarea id="dragDesc" placeholder="Descripción del desarrollo">${data.descripcion}</textarea>
      </div>
      <div class="field">
        <label for="dragTags">Tags</label>
        <input id="dragTags" placeholder="mapa, bi, informe" value="${data.tags.join(', ')}" />
      </div>`,
    onSubmit: async () => {
      const titulo = $("#dragTitle").value.trim();
      const url = $("#dragURL").value.trim();
      const descripcion = $("#dragDesc").value.trim();
      const tags = $("#dragTags").value.split(",").map(t => t.trim()).filter(Boolean);
      
      if (!titulo) return;
      
      try {
        await createDesarrollo({ titulo, url, descripcion, tags, subMundoId: getCurrentSub().id });
        modal.hide();
      } catch (error) {
        console.error('Error creando desarrollo desde drag & drop:', error);
        alert(`Error: ${error.message}`);
      }
    },
    initialFocus: "#dragTitle",
    submitLabel: "Crear"
  });
}

function setupUIEvents() {
  $("#btnNewWorld").onclick = () => { 
    if (isAdmin()) createWorld(); 
    else alert("Solo ADMIN."); 
  };
  
  $("#btnNewSubWorld").onclick = () => { 
    if (isAdmin()) createSubWorld(); 
    else alert("Solo ADMIN."); 
  };
  
  $("#btnAddDev").onclick = addDevManually;
  
  $("#btnBack").onclick = () => { 
    if (state.currentSubId) { 
      state.currentSubId = null; 
      goSubWorlds(); 
    } else if (state.currentWorldId) { 
      state.currentWorldId = null; 
      goWorlds(); 
    } else { 
      goWorlds(); 
    } 
  };
  
  $("#btnLogout").onclick = logout;
  $("#btnAdmin").onclick = goAdmin;
  
  // Botón de refrescar datos
  const btnRefresh = $("#btnRefresh");
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      try {
        console.log('🔄 Refrescando datos...');
        invalidateCache();
        state.data = await loadDataFromAPI(true); // Forzar refrescar
        
        // Re-renderizar la vista actual
        if (state.currentSubId) {
          await renderDesarrollos();
        } else if (state.currentWorldId) {
          await renderSubWorlds();
        } else {
          await renderWorlds();
        }
        
        console.log('✅ Datos refrescados exitosamente');
      } catch (error) {
        console.error('Error refrescando datos:', error);
        alert('Error refrescando datos: ' + error.message);
      }
    };
  }
  
  $("#doLogin").onclick = async () => {
    const u = $("#loginUser").value.trim();
    const p = $("#loginPass").value.trim();
    
    if (await login(u, p)) {
      $("#authSection").classList.remove("active");
      $("#heroTitle").textContent = `Hola, ${u}`;
      $("#heroDesc").textContent = "Elegí un mundo para empezar.";
      await goWorlds();
    } else {
      $("#authMsg").textContent = "Credenciales incorrectas. Probá nuevamente.";
    }
  };
  
  const btnAddUser = $("#btnAddUser");
  if (btnAddUser) {
    btnAddUser.addEventListener("click", () => openUserForm(null));
  }
}

// ===== Funciones de usuario =====
function openUserForm(user = null) {
  // Por ahora, función básica - se puede expandir después
  alert("Función de gestión de usuarios en desarrollo");
}

// ===== Funciones de eliminación =====
async function deleteMundo(id) {
  try {
    console.log(`🗑️ Eliminando mundo con ID: ${id}`);
    
    // ELIMINACIÓN INSTANTÁNEA: Primero del frontend
    state.data.worlds = state.data.worlds.filter(w => w.id !== id);
    
    // Limpiar selección si se eliminó el mundo actual
    if (state.currentWorldId === id) {
      state.currentWorldId = null;
      state.currentSubId = null;
    }
    
    // Luego eliminar del backend
    const response = await api(`/mundos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      console.log('✅ Mundo eliminado correctamente del servidor');
      // Re-renderizar inmediatamente
      await renderWorlds();
      return true;
    } else {
      // Si falla el backend, revertir el cambio en el frontend
      console.log('⚠️ Error del backend, revirtiendo cambios del frontend');
      state.data = await loadDataFromAPI();
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error eliminando mundo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error eliminando mundo:', error);
    // Revertir cambios en caso de error
    console.log('🔄 Revirtiendo cambios por error');
    state.data = await loadDataFromAPI();
    throw error;
  }
}

async function deleteSubMundo(id) {
  try {
    console.log(`🗑️ Eliminando sub-mundo con ID: ${id}`);
    
    // ELIMINACIÓN INSTANTÁNEA: Primero del frontend
    const mundo = getCurrentWorld();
    if (mundo && mundo.subMundos) {
      mundo.subMundos = mundo.subMundos.filter(s => s.id !== id);
    }
    
    // Limpiar selección si se eliminó el sub-mundo actual
    if (state.currentSubId === id) {
      state.currentSubId = null;
    }
    
    // Luego eliminar del backend
    const response = await api(`/sub-mundos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      console.log('✅ Sub-mundo eliminado correctamente del servidor');
      // Re-renderizar inmediatamente
      await renderSubWorlds();
      return true;
    } else {
      // Si falla el backend, revertir el cambio en el frontend
      console.log('⚠️ Error del backend, revirtiendo cambios del frontend');
      state.data = await loadDataFromAPI();
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error eliminando sub-mundo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error eliminando sub-mundo:', error);
    // Revertir cambios en caso de error
    console.log('🔄 Revirtiendo cambios por error');
    state.data = await loadDataFromAPI();
    throw error;
  }
}

async function deleteDesarrollo(id) {
  try {
    console.log(`🗑️ Eliminando desarrollo con ID: ${id}`);
    
    // ELIMINACIÓN INSTANTÁNEA: Primero del frontend
    const subMundo = getCurrentSub();
    if (subMundo && subMundo.desarrollos) {
      subMundo.desarrollos = subMundo.desarrollos.filter(d => d.id !== id);
    }
    
    // Luego eliminar del backend
    const response = await api(`/desarrollos/${id}`, { method: 'DELETE' });
    if (response.ok) {
      console.log('✅ Desarrollo eliminado correctamente del servidor');
      // Re-renderizar inmediatamente
      await renderDesarrollos();
      return true;
    } else {
      // Si falla el backend, revertir el cambio en el frontend
      console.log('⚠️ Error del backend, revirtiendo cambios del frontend');
      state.data = await loadDataFromAPI();
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error eliminando desarrollo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error eliminando desarrollo:', error);
    // Revertir cambios en caso de error
    console.log('🔄 Revirtiendo cambios por error');
    state.data = await loadDataFromAPI();
    throw error;
  }
}

// ===== Funciones de creación =====
async function createMundo(data) {
  try {
    console.log(`🆕 Creando mundo con datos:`, data);
    
    const response = await api('/mundos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const newMundo = await response.json();
      console.log('✅ Mundo creado en el servidor');
      // Recargar datos desde la API
      state.data = await loadDataFromAPI();
      return newMundo.data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error creando mundo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error creando mundo:', error);
    throw error;
  }
}

async function updateMundo(id, data) {
  try {
    console.log(`🔄 Actualizando mundo ${id} con datos:`, data);
    
    // ACTUALIZACIÓN INSTANTÁNEA: Primero en el frontend
    const mundo = state.data.worlds?.find(w => w.id === id);
    if (mundo) {
      // Actualizar ambas propiedades para compatibilidad
      mundo.nombre = data.nombre;
      mundo.name = data.nombre;
      if (data.descripcion !== undefined) {
        mundo.descripcion = data.descripcion;
      }
      console.log('✅ Mundo actualizado en frontend:', mundo);
    }
    
    // Luego actualizar en el backend
    const response = await api(`/mundos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('✅ Mundo actualizado en el servidor');
      // Re-renderizar inmediatamente
      await renderWorlds();
      return true;
    } else {
      // Si falla el backend, revertir el cambio en el frontend
      state.data = await loadDataFromAPI();
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error actualizando mundo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error actualizando mundo:', error);
    // Revertir cambios en caso de error
    state.data = await loadDataFromAPI();
    throw error;
  }
}

async function createSubMundo(data) {
  try {
    console.log(`🆕 Creando sub-mundo con datos:`, data);
    
    const response = await api('/sub-mundos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const newSubMundo = await response.json();
      console.log('✅ Sub-mundo creado en el servidor:', newSubMundo.data);
      
      // Invalidar caché para forzar recarga
      invalidateCache();
      
      // ACTUALIZACIÓN INSTANTÁNEA: Agregar al estado local inmediatamente
      const mundo = getCurrentWorld();
      if (mundo) {
        if (!mundo.subMundos) mundo.subMundos = [];
        
        // Agregar el nuevo sub-mundo al estado local
        const nuevoSubMundo = {
          id: newSubMundo.data.id,
          nombre: newSubMundo.data.nombre,
          name: newSubMundo.data.nombre,
          descripcion: newSubMundo.data.descripcion,
          desarrollos: []
        };
        
        // Sincronizar subWorlds para compatibilidad
        nuevoSubMundo.subWorlds = nuevoSubMundo.desarrollos;
        
        mundo.subMundos.push(nuevoSubMundo);
        
        // También sincronizar subWorlds del mundo para compatibilidad
        if (!mundo.subWorlds) mundo.subWorlds = [];
        mundo.subWorlds.push(nuevoSubMundo);
        
        console.log('✅ Sub-mundo agregado al estado local:', nuevoSubMundo);
        console.log('✅ Estado actual del mundo:', mundo);
        console.log('✅ Cantidad de sub-mundos después de agregar:', mundo.subMundos.length);
      }
      
      return newSubMundo.data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error creando sub-mundo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error creando sub-mundo:', error);
    throw error;
  }
}

async function updateSubMundo(id, data) {
  try {
    console.log(`🔄 Actualizando sub-mundo ${id} con datos:`, data);
    
    // ACTUALIZACIÓN INSTANTÁNEA: Primero en el frontend
    const mundo = getCurrentWorld();
    if (mundo && mundo.subMundos) {
      const subMundo = mundo.subMundos.find(s => s.id === id);
      if (subMundo) {
        // Actualizar ambas propiedades para compatibilidad
        subMundo.nombre = data.nombre;
        subMundo.name = data.nombre;
        if (data.descripcion !== undefined) {
          subMundo.descripcion = data.descripcion;
        }
        console.log('✅ Sub-mundo actualizado en frontend:', subMundo);
      }
    }
    
    // Luego actualizar en el backend
    const response = await api(`/sub-mundos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('✅ Sub-mundo actualizado en el servidor');
      // Re-renderizar inmediatamente
      await renderSubWorlds();
      return true;
    } else {
      // Si falla el backend, revertir el cambio en el frontend
      state.data = await loadDataFromAPI();
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error actualizando sub-mundo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error actualizando sub-mundo:', error);
    // Revertir cambios en caso de error
    state.data = await loadDataFromAPI();
    throw error;
  }
}

async function createDesarrollo(data) {
  try {
    console.log(`🆕 Creando desarrollo con datos:`, data);
    
    const response = await api('/desarrollos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      const newDesarrollo = await response.json();
      console.log('✅ Desarrollo creado en el servidor:', newDesarrollo.data);
      
      // Invalidar caché para forzar recarga
      invalidateCache();
      
      // ACTUALIZACIÓN INSTANTÁNEA: Agregar al estado local inmediatamente
      const subMundo = getCurrentSub();
      console.log('🔍 getCurrentSub() retornó:', subMundo);
      console.log('🔍 state.currentSubId:', state.currentSubId);
      
      if (subMundo) {
        if (!subMundo.desarrollos) subMundo.desarrollos = [];
        
        // Agregar el nuevo desarrollo al estado local
        const nuevoDesarrollo = {
          id: newDesarrollo.data.id,
          titulo: newDesarrollo.data.titulo,
          title: newDesarrollo.data.titulo,
          url: newDesarrollo.data.url,
          descripcion: newDesarrollo.data.descripcion,
          desc: newDesarrollo.data.descripcion, // También agregar 'desc' para compatibilidad
          tags: newDesarrollo.data.tags || []
        };
        
        subMundo.desarrollos.push(nuevoDesarrollo);
        
        // Sincronizar subWorlds para compatibilidad
        subMundo.subWorlds = subMundo.desarrollos;
        
        console.log('✅ Desarrollo agregado al estado local:', nuevoDesarrollo);
        console.log('✅ Estado actual del sub-mundo:', subMundo);
        console.log('✅ Cantidad de desarrollos después de agregar:', subMundo.desarrollos.length);
        
        // Forzar re-renderizado inmediato
        await renderDesarrollos();
      } else {
        console.log('❌ No se pudo obtener el sub-mundo actual');
        console.log('❌ state.data:', state.data);
        console.log('❌ state.currentWorldId:', state.currentWorldId);
        console.log('❌ state.currentSubId:', state.currentSubId);
      }
      
      return newDesarrollo.data;
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error creando desarrollo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error creando desarrollo:', error);
    throw error;
  }
}

async function updateDesarrollo(id, data) {
  try {
    console.log(`🔄 Actualizando desarrollo ${id} con datos:`, data);
    
    // ACTUALIZACIÓN INSTANTÁNEA: Primero en el frontend
    const subMundo = getCurrentSub();
    if (subMundo && subMundo.desarrollos) {
      const desarrollo = subMundo.desarrollos.find(d => d.id === id);
      if (desarrollo) {
        // Actualizar propiedades para compatibilidad
        desarrollo.titulo = data.titulo;
        desarrollo.title = data.titulo; // También actualizar title
        if (data.url !== undefined) desarrollo.url = data.url;
        if (data.descripcion !== undefined) desarrollo.descripcion = data.descripcion;
        if (data.tags !== undefined) desarrollo.tags = data.tags;
        console.log('✅ Desarrollo actualizado en frontend:', desarrollo);
      }
    }
    
    // Luego actualizar en el backend
    const response = await api(`/desarrollos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (response.ok) {
      console.log('✅ Desarrollo actualizado en el servidor');
      // Re-renderizar inmediatamente
      await renderDesarrollos();
      return true;
    } else {
      // Si falla el backend, revertir el cambio en el frontend
      state.data = await loadDataFromAPI();
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error actualizando desarrollo: ${response.status} - ${errorData.message || 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error actualizando desarrollo:', error);
    // Revertir cambios en caso de error
    state.data = await loadDataFromAPI();
    throw error;
  }
}

// Función para renderizar admin
async function renderAdmin() {
  const adminContainer = $("#adminContainer");
  if (!adminContainer) return;
  
  try {
    console.log('🔧 Renderizando panel de administración...');
    
    // Cargar usuarios y mundos
    const users = await loadUserListFromAPI();
    const mundos = state.data?.worlds || [];
    
    console.log('👥 Usuarios cargados:', users);
    console.log('🌍 Mundos disponibles:', mundos);
    
    // Crear el HTML del panel de administración
    let adminHTML = `
      <div class="admin-header">
        <h2>Panel de Administración</h2>
        <button onclick="openUserForm()" class="btn btn-primary">Nuevo Usuario</button>
      </div>
      
      <div class="admin-sections">
        <!-- Sección de Usuarios -->
        <div class="admin-section">
          <h3>Usuarios</h3>
          <p class="section-description">Crear, editar y asignar permisos de mundos.</p>
          <button onclick="openUserForm()" class="btn btn-secondary">+ Nuevo usuario</button>
          <div class="users-list">
    `;
    
    if (!users || users.length === 0) {
      adminHTML += '<p class="empty-message">No hay usuarios registrados. Crea el primer usuario.</p>';
    } else {
      users.forEach(user => {
        // Crear badges de mundos permitidos (igual que en el original)
        let worldsBadgesHTML = "";
        if (user.permittedWorldIds === "*") {
          worldsBadgesHTML = `<span class="badge">Todos los mundos</span>`;
        } else {
          try {
            const permittedIds = typeof user.permittedWorldIds === 'string' ? JSON.parse(user.permittedWorldIds) : user.permittedWorldIds;
            const names = mundos.filter(w => permittedIds?.includes(w.id)).map(w => w.name || w.nombre);
            worldsBadgesHTML = names.length ? names.map(n => `<span class="badge">${n}</span>`).join("") : `<span class="badge">Sin acceso</span>`;
          } catch (e) {
            worldsBadgesHTML = `<span class="badge">Sin acceso</span>`;
          }
        }
        
        adminHTML += `
          <div class="user-item">
            <div class="user-row">
              <div class="t-body"><strong>Usuario:</strong> ${user.username}</div>
              <div class="t-body"><strong>Rol:</strong> ${(user.role || 'user').toUpperCase()}</div>
            </div>
            <div class="worlds-badges">${worldsBadgesHTML}</div>
            <div class="user-actions">
              <button class="btn btn-edit" onclick="openUserForm('${user.id}')">Editar</button>
              ${user.username !== "admin" ? `<button class="btn btn-danger" onclick="confirmDeleteUser('${user.id}')">Eliminar</button>` : ''}
            </div>
          </div>
        `;
      });
    }
    
    adminHTML += `
          </div>
        </div>
        
        <!-- Sección de Mundos -->
        <div class="admin-section">
          <h3>Mundos disponibles</h3>
          <p class="section-description">Resumen de mundos actuales. Los permisos se asignan en cada usuario.</p>
          <div class="worlds-summary">
    `;
    
    if (!mundos || mundos.length === 0) {
      adminHTML += '<p class="empty-message">No hay mundos creados. Crea el primer mundo desde la vista principal.</p>';
    } else {
      mundos.forEach(mundo => {
        const subMundosCount = (mundo.subMundos && mundo.subMundos.length) || (mundo.subWorlds && mundo.subWorlds.length) || 0;
        adminHTML += `<span class="badge">${mundo.name || mundo.nombre} (${subMundosCount} sub-mundos)</span>`;
      });
    }
    
    adminHTML += `
          </div>
        </div>
      </div>
    `;
    
    adminContainer.innerHTML = adminHTML;
    
    console.log('✅ Panel de administración renderizado correctamente');
  } catch (error) {
    console.error('Error renderizando admin:', error);
    adminContainer.innerHTML = '<p>Error cargando datos del panel de administración</p>';
  }
}

// Función para seleccionar mundo
async function selectWorld(worldId) {
  state.currentWorldId = worldId;
  await renderSubWorlds(worldId);
  
  // Mostrar contenedor de sub-mundos
  const subWorldsSection = $("#subWorldsSection");
  if (subWorldsSection) {
    subWorldsSection.style.display = 'block';
  }
  
  // Persistir el estado de navegación
  persistSession();
}

// Función para seleccionar sub-mundo
async function selectSubWorld(subWorldId) {
  state.currentSubId = subWorldId;
  await renderDesarrollos(subWorldId);
  
  // Mostrar contenedor de desarrollos
  const devsSection = $("#devsSection");
  if (devsSection) {
    devsSection.style.display = 'block';
  }
  
  // Persistir el estado de navegación
  persistSession();
}

// Función para abrir desarrollo
function openDev(url) {
  if (url.startsWith('http')) {
    window.open(url, '_blank');
  } else {
    window.open(url, '_blank');
  }
}

// ===== Funciones de Formularios =====

// Función para mostrar formulario de login
function showLoginForm() {
  modal.show({
    title: "Iniciar Sesión",
    bodyHTML: `
      <div class="form-group">
        <label for="username">Usuario:</label>
        <input type="text" id="username" placeholder="Ingrese su usuario">
      </div>
      <div class="form-group">
        <label for="password">Contraseña:</label>
        <input type="password" id="password" placeholder="Ingrese su contraseña">
      </div>
    `,
    onSubmit: async () => {
      const username = $("#username").value;
      const password = $("#password").value;
      
      if (await login(username, password)) {
        modal.hide();
        goWorlds();
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    }
  });
}

// Función para mostrar formulario de usuario
function openUserForm(userId = null) {
  const isEdit = userId !== null;
  const title = isEdit ? "Editar Usuario" : "Nuevo Usuario";
  
  modal.show({
    title,
    bodyHTML: `
      <div class="form-group">
        <label for="formUsername">Usuario:</label>
        <input type="text" id="formUsername" placeholder="Ingrese el usuario">
      </div>
      <div class="form-group">
        <label for="formPassword">Contraseña:</label>
        <input type="password" id="formPassword" placeholder="Ingrese la contraseña">
      </div>
      <div class="form-group">
        <label for="formRole">Rol:</label>
        <select id="formRole">
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
    `,
    onSubmit: async () => {
      const userData = {
        username: $("#formUsername").value,
        password: $("#formPassword").value,
        role: $("#formRole").value
      };
      
      console.log('💾 Guardando usuario:', userData);
      
      try {
        if (isEdit) {
          console.log('✏️ Editando usuario existente:', userId);
          await updateUserAPI(userId, userData);
        } else {
          console.log('🆕 Creando nuevo usuario');
          await createUserAPI(userData);
        }
        
        console.log('✅ Usuario guardado exitosamente');
        modal.hide();
        await renderAdmin();
      } catch (error) {
        console.error('❌ Error guardando usuario:', error);
        alert("Error guardando usuario: " + error.message);
      }
    }
  });
}

// Función para confirmar eliminación de usuario
async function confirmDeleteUser(userId) {
  if (confirm("¿Está seguro de que desea eliminar este usuario?")) {
    try {
      await deleteUserAPI(userId);
      await renderAdmin();
    } catch (error) {
      alert("Error eliminando usuario: " + error.message);
    }
  }
}

// Función para mostrar formulario de mundo
function showWorldForm() {
  modal.show({
    title: "Nuevo Mundo",
    bodyHTML: `
      <div class="form-group">
        <label for="worldName">Nombre:</label>
        <input type="text" id="worldName" placeholder="Ingrese el nombre del mundo">
      </div>
      <div class="form-group">
        <label for="worldDesc">Descripción:</label>
        <textarea id="worldDesc" placeholder="Ingrese la descripción"></textarea>
      </div>
    `,
    onSubmit: async () => {
      const mundoData = {
        nombre: $("#worldName").value,
        descripcion: $("#worldDesc").value,
        activo: true,
        orden: 1
      };
      
      try {
        await createMundoAPI(mundoData);
        modal.hide();
        await renderWorlds();
        await updateUserPermissionsForNewWorld(mundoData.id);
      } catch (error) {
        alert("Error creando mundo: " + error.message);
      }
    }
  });
}

// Función para mostrar formulario de sub-mundo
function showSubWorldForm() {
  if (!state.currentWorldId) {
    alert("Debe seleccionar un mundo primero");
    return;
  }
  
  modal.show({
    title: "Nuevo Sub-Mundo",
    bodyHTML: `
      <div class="form-group">
        <label for="subWorldName">Nombre:</label>
        <input type="text" id="subWorldName" placeholder="Ingrese el nombre del sub-mundo">
      </div>
      <div class="form-group">
        <label for="subWorldDesc">Descripción:</label>
        <textarea id="subWorldDesc" placeholder="Ingrese la descripción"></textarea>
      </div>
    `,
    onSubmit: async () => {
      const subMundoData = {
        nombre: $("#subWorldName").value,
        descripcion: $("#subWorldDesc").value,
        activo: true,
        orden: 1,
        mundoId: state.currentWorldId
      };
      
      try {
        await createSubMundoAPI(subMundoData);
        modal.hide();
        await renderSubWorlds(state.currentWorldId);
      } catch (error) {
        alert("Error creando sub-mundo: " + error.message);
      }
    }
  });
}

// Función para mostrar formulario de desarrollo
function showDevForm() {
  if (!state.currentSubId) {
    alert("Debe seleccionar un sub-mundo primero");
    return;
  }

  modal.show({
    title: "Nuevo Desarrollo",
    bodyHTML: `
      <div class="form-group">
        <label for="devTitle">Título:</label>
        <input type="text" id="devTitle" placeholder="Ingrese el título">
      </div>
      <div class="form-group">
        <label for="devDesc">Descripción:</label>
        <textarea id="devDesc" placeholder="Ingrese la descripción"></textarea>
      </div>
      <div class="form-group">
        <label for="devUrl">URL:</label>
        <input type="text" id="devUrl" placeholder="Ingrese la URL">
      </div>
      <div class="form-group">
        <label for="devTags">Tags (separados por coma):</label>
        <input type="text" id="devTags" placeholder="tag1, tag2, tag3">
      </div>
    `,
    onSubmit: async () => {
      const desarrolloData = {
        titulo: $("#devTitle").value,
        descripcion: $("#devDesc").value,
        url: $("#devUrl").value,
        tipo: "web",
        tags: $("#devTags").value.split(',').map(t => t.trim()).filter(t => t),
        activo: true,
        orden: 1,
        subMundoId: state.currentSubId
      };
      
      try {
        await createDesarrolloAPI(desarrolloData);
        modal.hide();
        await renderDesarrollos(state.currentSubId);
      } catch (error) {
        alert("Error creando desarrollo: " + error.message);
      }
    }
  });
}

// Función para confirmar eliminación
async function confirmDelete(scope, id, name) {
  const labels = {world: "mundo", sub: "sub-mundo", dev: "desarrollo"};
  const label = labels[scope] || "elemento";
  
  if (confirm(`¿Está seguro de que desea eliminar este ${label} "${name}"?`)) {
    try {
      console.log(`🗑️ Eliminando ${label} "${name}" con ID: ${id}`);
      
      let success = false;
      
      if (scope === "world") {
        success = await deleteMundo(id);
      } else if (scope === "sub") {
        success = await deleteSubMundo(id);
      } else if (scope === "dev") {
        success = await deleteDesarrollo(id);
      }
      
      if (success) {
        console.log(`✅ ${label} eliminado exitosamente`);
        // La UI ya se actualizó en las funciones de eliminación
      } else {
        alert(`Error eliminando ${label}`);
      }
    } catch (error) {
      console.error(`Error eliminando ${label}:`, error);
      alert(`Error eliminando ${label}: ${error.message}`);
    }
  }
}

// ===== Funciones de Dropzone =====

function setupDropzone() {
  const dropzone = $("#dropzone");
  if (!dropzone) return;
  
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  
  dropzone.addEventListener("dragleave", () => {
    dropzone.classList.remove("dragover");
  });
  
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  });
}

function handleFileUpload(file) {
  // Implementar lógica de subida de archivos
  console.log("Archivo recibido:", file.name);
  alert(`Archivo "${file.name}" recibido. La funcionalidad de subida se implementará próximamente.`);
}

// ===== Inicialización modificada =====
async function initializeApp() {
  try {
    console.log('🚀 Inicializando aplicación...');
    
    // Cargar datos desde la API
    state.data = await loadDataFromAPI();
    console.log('📊 Datos cargados:', state.data);
    
    if (!state.data || !state.data.worlds) {
      console.log('⚠️ Datos no válidos, usando datos por defecto');
      state.data = getDefaultDataStructure();
    }
    
    // Intentar crear usuarios por defecto en la base de datos
    try {
      await createDefaultUsers();
    } catch (error) {
      console.error('Error creando usuarios por defecto:', error);
    }
    
    // Configurar permisos por defecto
    try {
      const users = await loadUserListFromAPI();
      await ensureDefaultPermissions(users, state.data);
    } catch (error) {
      console.error('Error configurando permisos:', error);
      // Continuar sin permisos por defecto
    }
    
    // Si hay usuario en localStorage, validar contra la API
    if (state.user && state.user.username) {
      try {
        console.log('🔍 Validando sesión existente...');
        // Intentar validar la sesión contra la API
        const users = await loadUserListFromAPI();
        const validUser = users.find(u => u.username === state.user.username);
        
        if (validUser) {
          // Usuario válido, completar datos
          console.log('✅ Usuario válido, completando sesión');
          state.user = validUser;
          $("#authSection").classList.remove("active");
          
          // Restaurar navegación previa si es posible
          if (state.currentWorldId) {
            console.log('🔄 Restaurando navegación previa...');
            const mundo = state.data.worlds.find(w => w.id === state.currentWorldId);
            if (mundo) {
              console.log('✅ Mundo anterior encontrado, navegando a sub-mundos');
              await goWorlds();
              await goSubWorlds();
              
              // Si también había un sub-mundo seleccionado, restaurarlo
              if (state.currentSubId) {
                const subMundo = mundo.subMundos?.find(s => s.id === state.currentSubId);
                if (subMundo) {
                  console.log('✅ Sub-mundo anterior encontrado, navegando a desarrollos');
                  await goDevs();
                }
              }
            } else {
              console.log('⚠️ Mundo anterior no encontrado, navegando a mundos');
              await goWorlds();
            }
          } else {
            await goWorlds();
          }
        } else {
          // Usuario no válido, limpiar y mostrar login
          console.log('❌ Usuario no válido, mostrando login');
          state.user = null;
          localStorage.removeItem(LS_SESSION);
          goAuth();
        }
      } catch (error) {
        console.error('Error validando sesión:', error);
        // Error en API, mostrar login
        state.user = null;
        localStorage.removeItem(LS_SESSION);
        goAuth();
      }
    } else {
      // No hay usuario, mostrar login
      console.log('👤 No hay usuario, mostrando login');
      goAuth();
    }
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    // Fallback a datos por defecto
    state.data = getDefaultDataStructure();
    goAuth();
  }
}

// ===== Event Listeners =====

// Event listener para el botón de inicializar usuarios
document.addEventListener('DOMContentLoaded', function() {
  const btnInitUsers = document.getElementById('btnInitUsers');
  if (btnInitUsers) {
    btnInitUsers.addEventListener('click', async function() {
      try {
        this.disabled = true;
        this.textContent = '🔄 Inicializando...';
        
        await createDefaultUsers();
        
        this.textContent = '✅ Usuarios Inicializados';
        this.style.backgroundColor = '#4CAF50';
        this.style.color = 'white';
        
        // Mostrar mensaje de éxito
        const authMsg = document.getElementById('authMsg');
        if (authMsg) {
          authMsg.textContent = 'Usuarios inicializados correctamente. Ahora puedes hacer login con admin/1234';
          authMsg.className = 't-body success';
        }
        
        // Resetear botón después de 3 segundos
        setTimeout(() => {
          this.disabled = false;
          this.textContent = '🔧 Inicializar Usuarios';
          this.style.backgroundColor = '';
          this.style.color = '';
        }, 3000);
        
      } catch (error) {
        console.error('Error inicializando usuarios:', error);
        this.textContent = '❌ Error';
        this.style.backgroundColor = '#f44336';
        this.style.color = 'white';
        
        // Mostrar mensaje de error
        const authMsg = document.getElementById('authMsg');
        if (authMsg) {
          authMsg.textContent = 'Error inicializando usuarios: ' + error.message;
          authMsg.className = 't-body error';
        }
        
        // Resetear botón después de 3 segundos
        setTimeout(() => {
          this.disabled = false;
          this.textContent = '🔧 Inicializar Usuarios';
          this.style.backgroundColor = '';
          this.style.color = '';
        }, 3000);
      }
    });
  }
});

// ===== Init =====
(function init(){
  // Registro invisible pedido
  console.log("CREADO POR IGNACIO RAVETTINI");

  modal.init();
  restoreSession();
  setupDropzone();
  setupUIEvents();

  // Inicializar la aplicación de forma asíncrona
  initializeApp();
})();
