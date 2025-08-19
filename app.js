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

// ===== LOADER GLOBAL =====
const loader = {
  el: null,
  activeRequests: 0,
  
  init() {
    this.el = $("#globalLoader");
    console.log('🔄 Loader inicializado');
  },
  
  show(message = 'Cargando...') {
    if (this.el) {
      const textEl = this.el.querySelector('.loader-text');
      if (textEl) textEl.textContent = message;
      this.el.style.display = 'flex';
      console.log('🔄 Loader mostrado:', message);
    }
  },
  
  hide() {
    if (this.el && this.activeRequests <= 0) {
      this.el.style.display = 'none';
      console.log('✅ Loader ocultado');
    }
  },
  
  // Contador de requests activos
  startRequest() {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.show();
    }
    console.log(`🔄 Request iniciado (total: ${this.activeRequests})`);
  },
  
  endRequest() {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    console.log(`✅ Request finalizado (total: ${this.activeRequests})`);
    if (this.activeRequests === 0) {
      this.hide();
    }
  }
};

// ===== Configuración API =====
const BASE_API = '/api/v1';

// Función helper para llamadas a la API
async function api(url, opts = {}) {
  // Mostrar loader automáticamente para todas las llamadas a la API
  loader.startRequest();
  
  try {
    const response = await fetch(BASE_API + url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...opts.headers
      }
    });
    
    return response;
  } finally {
    loader.endRequest();
  }
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
    
    if (response.ok) {
      const newDesarrollo = await response.json();
      console.log('✅ Desarrollo creado en el servidor:', newDesarrollo.data);
      
      // ACTUALIZACIÓN INSTANTÁNEA: Agregar al estado local inmediatamente
      const subMundo = getCurrentSub();
      if (subMundo) {
        if (!subMundo.desarrollos) subMundo.desarrollos = [];
        
        // Agregar el nuevo desarrollo al estado local
        const nuevoDesarrollo = {
          id: newDesarrollo.data.id,
          titulo: newDesarrollo.data.titulo,
          title: newDesarrollo.data.titulo,
          url: newDesarrollo.data.url,
          descripcion: newDesarrollo.data.descripcion,
          desc: newDesarrollo.data.descripcion,
          tags: newDesarrollo.data.tags || []
        };
        
        subMundo.desarrollos.push(nuevoDesarrollo);
        
        // Sincronizar subWorlds para compatibilidad
        subMundo.subWorlds = subMundo.desarrollos;
        
        console.log('✅ Desarrollo agregado al estado local:', nuevoDesarrollo);
        console.log('✅ Cantidad de desarrollos después de agregar:', subMundo.desarrollos.length);
        
        // Forzar re-renderizado inmediato
        await renderDesarrollos();
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

// Función para ir a autenticación (eliminada - duplicada)
// La implementación correcta está más abajo en el archivo

// Función para ir a mundos (eliminada - duplicada)
// La implementación correcta está más abajo en el archivo

// Función para hacer logout
function logout() {
  state.user = null;
  state.currentWorldId = null;
  state.currentSubId = null;
  localStorage.removeItem(LS_SESSION);
  
  // Ocultar botones inmediatamente antes de ir a auth
  const toolbar = document.querySelector('header.appbar .toolbar');
  if (toolbar) toolbar.style.display = 'none';
  
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
          <button class="btn btn-secondary btn-primary-action">Abrir</button>
          ${isAdmin() ? '<div class="secondary-actions"><button class="btn btn-rename">Renombrar</button><button class="btn btn-danger">Eliminar</button></div>' : ''}
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
          <button class="btn btn-secondary btn-primary-action">Abrir</button>
          ${isAdmin() ? '<div class="secondary-actions"><button class="btn btn-rename">Renombrar</button><button class="btn btn-danger">Eliminar</button></div>' : ''}
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
      // Asegurar que tags sea siempre un array
      const tags = Array.isArray(d.tags) ? d.tags : [];
      
      // Determinar si es un archivo o un enlace
      const isFile = d.fileId || (d.url && d.url.includes('/api/v1/files/'));
      const isLink = d.url && d.url.startsWith('http');
      
      // Preparar información del archivo
      let fileInfo = '';
      if (isFile && d.fileSize) {
        const sizeKB = Math.round(d.fileSize / 1024);
        const sizeMB = (d.fileSize / (1024 * 1024)).toFixed(1);
        fileInfo = `
          <div class="file-info" style="margin: 8px 0; padding: 8px; background: #f0f8ff; border-radius: 3px; border-left: 3px solid #2196F3;">
            <strong>📁 Archivo:</strong> ${d.titulo || d.title}
            <br><small>📏 Tamaño: ${sizeKB} KB (${sizeMB} MB)</small>
            ${d.fileType ? `<br><small>📋 Tipo: ${d.fileType}</small>` : ''}
          </div>`;
      }
      
      // Preparar botón de acción
      let actionButton = '';
      if (isFile) {
        actionButton = `<a class="button-link full-width" href="${d.url}" target="_blank" rel="noopener">⬇️ Descargar</a>`;
      } else if (isLink) {
        actionButton = `<a class="button-link full-width" href="${d.url}" target="_blank" rel="noopener">🔗 Abrir Enlace</a>`;
      }
      
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${d.titulo || d.title || 'Sin título'}</h3>
        <p class="muted t-body">${d.descripcion || d.desc || ""}</p>
        ${fileInfo}
        <div class="tags">${tags.map(t => `<span class="tag cyan">${t}</span>`).join("")}</div>
        <div class="actions">
          ${actionButton}
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
  
  // Actualizar la visibilidad de los botones según la nueva sección
  // Usar setTimeout para asegurar que el DOM se haya actualizado
  setTimeout(() => {
    updateToolbarForSection(id);
  }, 0);
}

// Función para actualizar la toolbar según la sección activa
function updateToolbarForSection(sectionId) {
  // Obtener la sección activa actual
  const activeSection = document.querySelector("main section.active");
  const isLoginView = activeSection && activeSection.id === "authSection";
  const toolbar = document.querySelector('header.appbar .toolbar');

  // En la vista de login, ocultar toda la toolbar y todos los botones
  if (isLoginView) {
    if (toolbar) toolbar.style.display = 'none';
    $("#btnNewWorld").style.display = "none";
    $("#btnNewSubWorld").style.display = "none";
    $("#btnAddDev").style.display = "none";
    $("#btnBack").style.display = "none";
    $("#btnAdmin").style.display = "none";
    $("#btnLogout").style.display = "none";
    return;
  }
  
  // Para otras vistas, mostrar botones según la sección
  switch (sectionId) {
    case "#worldsSection":
      // Solo mostrar botón de crear mundo y admin/logout
      if (toolbar) toolbar.style.display = 'flex';
      $("#btnNewWorld").style.display = isAdmin() ? "inline-block" : "none";
      $("#btnNewSubWorld").style.display = "none";
      $("#btnAddDev").style.display = "none";
      $("#btnBack").style.display = "none";
      $("#btnAdmin").style.display = (state.user && isAdmin()) ? "inline-block" : "none";
      $("#btnLogout").style.display = state.user ? "inline-block" : "none";
      break;
      
    case "#subWorldsSection":
      // Mostrar botón de crear sub-mundo y volver
      if (toolbar) toolbar.style.display = 'flex';
      $("#btnNewWorld").style.display = "none";
      $("#btnNewSubWorld").style.display = isAdmin() ? "inline-block" : "none";
      $("#btnAddDev").style.display = "none";
      $("#btnBack").style.display = "inline-block";
      $("#btnAdmin").style.display = (state.user && isAdmin()) ? "inline-block" : "none";
      $("#btnLogout").style.display = state.user ? "inline-block" : "none";
      break;
      
    case "#devsSection":
      // Mostrar botón de agregar desarrollo y volver
      if (toolbar) toolbar.style.display = 'flex';
      $("#btnNewWorld").style.display = "none";
      $("#btnNewSubWorld").style.display = "none";
      $("#btnAddDev").style.display = "inline-block";
      $("#btnBack").style.display = "inline-block";
      $("#btnAdmin").style.display = (state.user && isAdmin()) ? "inline-block" : "none";
      $("#btnLogout").style.display = state.user ? "inline-block" : "none";
      
      // Agregar botón de espacio disponible
      addStorageButton();
      break;
      
    case "#adminSection":
      // Solo mostrar botón de volver y logout
      if (toolbar) toolbar.style.display = 'flex';
      $("#btnNewWorld").style.display = "none";
      $("#btnNewSubWorld").style.display = "none";
      $("#btnAddDev").style.display = "none";
      $("#btnBack").style.display = "inline-block";
      $("#btnAdmin").style.display = "none";
      $("#btnLogout").style.display = state.user ? "inline-block" : "none";
      break;
      
    default:
      // Para cualquier otra sección, ocultar todos los botones
      if (toolbar) toolbar.style.display = 'flex';
      $("#btnNewWorld").style.display = "none";
      $("#btnNewSubWorld").style.display = "none";
      $("#btnAddDev").style.display = "none";
      $("#btnBack").style.display = "none";
      $("#btnAdmin").style.display = "none";
      $("#btnLogout").style.display = state.user ? "inline-block" : "none";
  }
}

function toggleToolbar(show, scope = {}) {
  // Esta función se mantiene para compatibilidad con código existente
  // pero ahora la lógica principal está en updateToolbarForSection
  const activeSection = document.querySelector("main section.active");
  if (activeSection) {
    updateToolbarForSection(activeSection.id);
  }
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
  // Ocultar botones inmediatamente para la vista de login
  updateToolbarForSection("#authSection");
}

function goWorlds() { 
  state.currentSubId = null; 
  setSection("#worldsSection"); 
  renderWorlds(); 
  updateHero(); 
  // toggleToolbar ya no es necesario aquí porque setSection llama a updateToolbarForSection
}

function goSubWorlds() { 
  setSection("#subWorldsSection"); 
  renderSubWorlds(state.currentWorldId); 
  updateHero(); 
  // toggleToolbar ya no es necesario aquí porque setSection llama a updateToolbarForSection
  persistSession(); // Persistir el estado de navegación
}

function goDevs() { 
  setSection("#devsSection");
  renderDesarrollos(state.currentSubId); 
  updateHero(); 
  // toggleToolbar ya no es necesario aquí porque setSection llama a updateToolbarForSection
  persistSession(); // Persistir el estado de navegación
}

function goAdmin() { 
  if (!guardAdmin()) return; 
  setSection("#adminSection"); 
  renderAdmin(); 
  updateHero(); 
  // toggleToolbar ya no es necesario aquí porque setSection llama a updateToolbarForSection
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
        <label for="devFile">Archivo (opcional)</label>
        <input type="file" id="devFile" accept=".pdf,.zip,.csv,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.svg" />
        <small style="color: #666; display: block; margin-top: 5px;">
          📋 Límites: PDF (10MB), Excel (20MB), ZIP (50MB), Imágenes (5MB)
        </small>
      </div>
      <div class="field">
        <label for="devDesc">Descripción (opcional)</label>
        <textarea id="devDesc" placeholder="Breve descripción...">${existing ? existing.descripcion : ""}</textarea>
      </div>
      <div class="field">
        <label for="devTags">Tags (separadas por coma)</label>
        <input id="devTags" placeholder="mapa, bi, informe" value="${existing ? (existing.tags || []).join(", ") : ""}" />
      </div>
      <div id="filePreview" style="display: none; margin-top: 10px; padding: 10px; background: #f5f5f5; border-radius: 3px;">
        <strong>📁 Archivo seleccionado:</strong> <span id="fileName"></span>
        <br><small id="fileInfo"></small>
      </div>`,
    onSubmit: async () => {
      const titulo = $("#devTitle").value.trim();
      if (!titulo) return;
      
      const url = $("#devURL").value.trim();
      const descripcion = $("#devDesc").value.trim();
      const tags = $("#devTags").value.split(",").map(t => t.trim()).filter(Boolean);
      const fileInput = $("#devFile");
      const file = fileInput.files[0];
      
      // Validar archivo si se seleccionó uno
      if (file) {
        const maxSize = getFileSizeLimit(file.type);
        if (file.size > maxSize) {
          const maxSizeMB = Math.round(maxSize / (1024 * 1024));
          alert(`Archivo demasiado grande. Máximo ${maxSizeMB}MB para ${file.type}`);
          return;
        }
      }
      
      try {
        // Crear carpeta basada en el sub-mundo actual
        const folder = sw.nombre.toLowerCase().replace(/\s+/g, '-');
        
        if (mode === "create") {
          await createDesarrollo({ 
            titulo, 
            url, 
            descripcion, 
            tags, 
            subMundoId: sw.id,
            folder,
            file // Pasar archivo si existe
          });
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
  
  // Agregar preview del archivo seleccionado
  const fileInput = $("#devFile");
  const filePreview = $("#filePreview");
  const fileName = $("#fileName");
  const fileInfo = $("#fileInfo");
  
  fileInput.addEventListener('change', function() {
    if (this.files[0]) {
      const file = this.files[0];
      const sizeKB = Math.round(file.size / 1024);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      fileName.textContent = file.name;
      fileInfo.textContent = `${file.type} - ${sizeKB} KB (${sizeMB} MB)`;
      filePreview.style.display = 'block';
    } else {
      filePreview.style.display = 'none';
    }
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
          
          // Validar tamaño del archivo antes de subir
          const maxSize = getFileSizeLimit(file.type);
          if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            alert(`Archivo demasiado grande. Máximo ${maxSizeMB}MB para ${file.type}`);
            continue;
          }
          
          try {
            // Crear carpeta basada en el sub-mundo actual
            const folder = sw.nombre.toLowerCase().replace(/\s+/g, '-');
            
            // Subir archivo y crear desarrollo
            await createDesarrollo({
              titulo: file.name,
              descripcion: `Archivo subido por drag & drop (${Math.round(file.size / 1024)} KB)`,
              tags: ["archivo", "drag-drop"],
              subMundoId: sw.id,
              folder: folder,
              file: file // Pasar el archivo para que se suba físicamente
            });
            
            await renderDesarrollos();
          } catch (error) {
            console.error('Error procesando archivo:', error);
            alert(`Error subiendo archivo: ${error.message}`);
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

// Función helper para obtener límite de tamaño según tipo MIME
function getFileSizeLimit(mimetype) {
  const FILE_SIZE_LIMITS = {
    // Documentos pequeños
    'application/pdf': 10 * 1024 * 1024,        // 10MB
    'text/csv': 5 * 1024 * 1024,                // 5MB
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 20 * 1024 * 1024, // 20MB
    
    // Archivos comprimidos
    'application/zip': 50 * 1024 * 1024,        // 50MB
    'application/x-rar-compressed': 50 * 1024 * 1024, // 50MB
    'application/x-7z-compressed': 50 * 1024 * 1024,  // 50MB
    
    // Imágenes
    'image/jpeg': 5 * 1024 * 1024,              // 5MB
    'image/png': 5 * 1024 * 1024,               // 5MB
    'image/gif': 10 * 1024 * 1024,              // 10MB
    'image/webp': 5 * 1024 * 1024,              // 5MB
    'image/svg+xml': 1 * 1024 * 1024,           // 1MB
    
    // Límite por defecto para otros tipos
    'default': 25 * 1024 * 1024                 // 25MB
  };
  
  return FILE_SIZE_LIMITS[mimetype] || FILE_SIZE_LIMITS.default;
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
    
    // Si hay un archivo para subir, subirlo primero
    let fileData = null;
    if (data.file) {
      console.log('📁 Subiendo archivo al servidor...');
      try {
        const formData = new FormData();
        formData.append('file', data.file);
        if (data.folder) formData.append('folder', data.folder);
        if (data.tags && data.tags.length > 0) formData.append('tags', data.tags.join(','));
        
        const fileResponse = await api('/files', {
          method: 'POST',
          body: formData,
          headers: {} // No incluir Content-Type para FormData
        });
        
        if (fileResponse.ok) {
          fileData = await fileResponse.json();
          console.log('✅ Archivo subido exitosamente:', fileData);
          
          // Actualizar la URL para usar el archivo del servidor
          data.url = `/api/v1/files/${fileData.file.id}/download`;
          data.fileId = fileData.file.id; // Guardar ID del archivo para referencia
          data.fileSize = fileData.file.size;
          data.fileType = fileData.file.content_type;
          
          console.log('🔄 URL actualizada para usar archivo del servidor:', data.url);
        } else {
          const errorData = await fileResponse.json().catch(() => ({}));
          throw new Error(`Error subiendo archivo: ${errorData.error || 'Error desconocido'}`);
        }
      } catch (fileError) {
        console.error('❌ Error subiendo archivo:', fileError);
        throw new Error(`No se pudo subir el archivo: ${fileError.message}`);
      }
    }
    
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
          tags: newDesarrollo.data.tags || [],
          fileId: data.fileId, // Agregar referencia al archivo
          fileSize: data.fileSize,
          fileType: data.fileType
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
  const usersListContainer = $("#usersList");
  const worldsSummaryContainer = $("#worldsSummary");
  
  if (!usersListContainer) {
    console.error('❌ No se encontró el contenedor usersList');
    return;
  }
  
  if (!worldsSummaryContainer) {
    console.error('❌ No se encontró el contenedor worldsSummary');
    return;
  }
  
  try {
    console.log('🔧 Renderizando panel de administración...');
    console.log('🔍 Contenedor usersList encontrado:', usersListContainer);
    console.log('🔍 Contenedor worldsSummary encontrado:', worldsSummaryContainer);
    
    // Cargar usuarios y mundos
    const users = await loadUserListFromAPI();
    const mundos = state.data?.worlds || [];
    
    console.log('👥 Usuarios cargados:', users);
    console.log('👥 Cantidad de usuarios:', users ? users.length : 'undefined');
    console.log('🌍 Mundos disponibles:', mundos);
    
    // Renderizar usuarios
    let usersHTML = '';
    
    if (!users || users.length === 0) {
      console.log('⚠️ No hay usuarios para mostrar, agregando mensaje vacío');
      usersHTML = '<p class="empty-message">No hay usuarios registrados. Crea el primer usuario.</p>';
    } else {
      console.log('✅ Renderizando usuarios:', users.length);
      users.forEach((user, index) => {
        console.log(`👤 Renderizando usuario ${index + 1}:`, user);
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
        
        usersHTML += `
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
    
    // Renderizar mundos
    let worldsHTML = '';
    
    if (!mundos || mundos.length === 0) {
      worldsHTML = '<p class="empty-message">No hay mundos creados. Crea el primer mundo desde la vista principal.</p>';
    } else {
      mundos.forEach(mundo => {
        const subMundosCount = (mundo.subMundos && mundo.subMundos.length) || (mundo.subWorlds && mundo.subWorlds.length) || 0;
        worldsHTML += `<span class="badge">${mundo.name || mundo.nombre} (${subMundosCount} sub-mundos)</span>`;
      });
    }
    
    // Aplicar el HTML a los contenedores
    usersListContainer.innerHTML = usersHTML;
    worldsSummaryContainer.innerHTML = worldsHTML;
    
    console.log('✅ Panel de administración renderizado correctamente');
    console.log('🔍 Contenedor usersList después del render:', usersListContainer.innerHTML.substring(0, 500) + '...');
    console.log('🔍 Contenedor worldsSummary después del render:', worldsSummaryContainer.innerHTML.substring(0, 500) + '...');
  } catch (error) {
    console.error('❌ Error renderizando admin:', error);
    if (usersListContainer) usersListContainer.innerHTML = '<p>Error cargando usuarios</p>';
    if (worldsSummaryContainer) worldsSummaryContainer.innerHTML = '<p>Error cargando mundos</p>';
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
async function openUserForm(userId = null) {
  const isEdit = userId !== null;
  const title = isEdit ? "Editar Usuario" : "Nuevo Usuario";
  
  // Cargar mundos disponibles
  let mundos = [];
  try {
    mundos = await loadMundosFromAPI();
  } catch (error) {
    console.error('Error cargando mundos:', error);
    mundos = [];
  }
  
  // Cargar datos del usuario si es edición
  let userData = null;
  if (isEdit) {
    try {
      const users = await loadUserListFromAPI();
      userData = users.find(u => u.id === userId);
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }
  
  // Generar HTML para la selección de mundos
  const mundosHTML = mundos.map(mundo => {
    const isSelected = userData && userData.permittedWorldIds && 
      (userData.permittedWorldIds === '*' || userData.permittedWorldIds.includes(mundo.id));
    
    return `
      <div class="checkbox-group">
        <input type="checkbox" id="mundo_${mundo.id}" value="${mundo.id}" ${isSelected ? 'checked' : ''}>
        <label for="mundo_${mundo.id}">${mundo.nombre}</label>
      </div>
    `;
  }).join('');
  
  modal.show({
    title,
    bodyHTML: `
      <div class="form-group">
        <label for="formUsername">Usuario:</label>
        <input type="text" id="formUsername" placeholder="Ingrese el usuario" value="${userData ? userData.username : ''}">
      </div>
      <div class="form-group">
        <label for="formPassword">Contraseña:</label>
        <input type="password" id="formPassword" placeholder="Ingrese la contraseña" ${isEdit ? '' : 'required'}>
        ${isEdit ? '<small class="form-help">Dejar vacío para mantener la contraseña actual</small>' : ''}
      </div>
      <div class="form-group">
        <label for="formRole">Rol:</label>
        <select id="formRole">
          <option value="user" ${userData && userData.role === 'user' ? 'selected' : ''}>Usuario</option>
          <option value="admin" ${userData && userData.role === 'admin' ? 'selected' : ''}>Administrador</option>
        </select>
      </div>
      <div class="form-group">
        <label>Mundos permitidos:</label>
        <div class="worlds-selection">
          ${mundosHTML}
        </div>
        <small class="form-help">Seleccione los mundos que este usuario podrá ver</small>
      </div>
    `,
    onSubmit: async () => {
      const username = $("#formUsername").value;
      const password = $("#formPassword").value;
      const role = $("#formRole").value;
      
      // Obtener mundos seleccionados
      const selectedMundos = [];
      mundos.forEach(mundo => {
        const checkbox = document.getElementById(`mundo_${mundo.id}`);
        if (checkbox && checkbox.checked) {
          selectedMundos.push(mundo.id);
        }
      });
      
      const userData = {
        username,
        role,
        permittedWorldIds: selectedMundos
      };
      
      // Solo incluir contraseña si se proporcionó una nueva
      if (password.trim()) {
        userData.password = password;
      }
      
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
        // No es necesario llamar a renderDesarrollos aquí, createDesarrolloAPI ya lo hace
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
  const fileInput = $("#fileInput");
  const dropzoneButton = $("#dropzoneButton");
  if (!dropzone) return;

  // Estados visuales de arrastre
  ["dragenter", "dragover"].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("dragover");
    });
  });

  ["dragleave", "drop"].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("dragover");
    });
  });

  // Soltar archivos/enlaces
  dropzone.addEventListener("drop", async e => {
    const sw = getCurrentSub();
    if (!sw) return alert("Elegí un sub-mundo.");

    const items = e.dataTransfer && e.dataTransfer.items;
    if (items && items.length) {
      for (const it of items) {
        if (it.kind === "string") {
          it.getAsString(str => {
            try {
              const maybeURL = (str || "").trim();
              if (maybeURL.startsWith("http")) {
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
          if (!file) continue;
          const url = URL.createObjectURL(file);
          showDragDropModal({
            titulo: file.name,
            url,
            descripcion: `Archivo local (${Math.round(file.size/1024)} KB)`,
            tags: ["archivo"]
          });
        }
      }
    }
  });

  // Pegar enlaces
  dropzone.addEventListener("paste", e => {
    const sw = getCurrentSub();
    if (!sw) return;
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if (text && text.startsWith("http")) {
      showDragDropModal({
        titulo: new URL(text).hostname,
        url: text,
        descripcion: "Agregado por pegar enlace",
        tags: ["link"]
      });
    }
  });

  // Click/tap para abrir explorador de archivos
  const openPicker = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (!getCurrentSub()) return alert("Elegí un sub-mundo.");
    if (fileInput) {
      console.log("Abriendo explorador de archivos...");
      fileInput.click();
    } else {
      console.error("fileInput no encontrado");
    }
  };

  // Solo el botón abre el explorador, no toda la zona
  if (dropzoneButton) {
    dropzoneButton.addEventListener("click", openPicker);
  }

  // Al seleccionar archivos desde el explorador
  if (fileInput) {
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      for (const file of files) {
        const url = URL.createObjectURL(file);
        showDragDropModal({
          titulo: file.name,
          url,
          descripcion: `Archivo local (${Math.round(file.size/1024)} KB)`,
          tags: ["archivo"]
        });
      }
      // Permitir volver a seleccionar el mismo archivo después
      e.target.value = "";
    });
  }
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
          
          // Ocultar botones inmediatamente antes de ir a auth
          const toolbar = document.querySelector('header.appbar .toolbar');
          if (toolbar) toolbar.style.display = 'none';
          
          goAuth();
        }
      } catch (error) {
        console.error('Error validando sesión:', error);
        // Error en API, mostrar login
        state.user = null;
        localStorage.removeItem(LS_SESSION);
        
        // Ocultar botones inmediatamente antes de ir a auth
        const toolbar = document.querySelector('header.appbar .toolbar');
        if (toolbar) toolbar.style.display = 'none';
        
        goAuth();
      }
    } else {
      // No hay usuario, mostrar login
      console.log('👤 No hay usuario, mostrando login');
      
      // Ocultar botones inmediatamente antes de ir a auth
      const toolbar = document.querySelector('header.appbar .toolbar');
      if (toolbar) toolbar.style.display = 'none';
      
      goAuth();
    }
    
    // Asegurar que la toolbar se actualice correctamente
    const activeSection = document.querySelector("main section.active");
    if (activeSection) {
      console.log('🚀 initializeApp: Actualizando toolbar para sección:', activeSection.id);
      updateToolbarForSection(activeSection.id);
    }
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    // Fallback a datos por defecto
    state.data = getDefaultDataStructure();
    
    // Ocultar botones inmediatamente antes de ir a auth
    const toolbar = document.querySelector('header.appbar .toolbar');
    if (toolbar) toolbar.style.display = 'none';
    
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

  // Ocultar toolbar inmediatamente si no hay sesión válida
  const sessionData = JSON.parse(localStorage.getItem(LS_SESSION) || "null");
  if (!sessionData || !sessionData.user) {
    const toolbar = document.querySelector('header.appbar .toolbar');
    if (toolbar) {
      console.log('🚫 Toolbar ocultada desde el inicio (sin sesión)');
      toolbar.style.display = 'none';
    }
  }

        modal.init();
      loader.init();
      restoreSession();
      setupDropzone();
      setupUIEvents();

  // Inicializar la aplicación de forma asíncrona
  initializeApp();
})();

// ===== Funciones de Gestión de Archivos =====

// Función para mostrar información del espacio en disco
async function showDiskUsage() {
  try {
    const response = await api('/files/disk-usage');
    if (!response.ok) {
      throw new Error('Error obteniendo información del disco');
    }
    
    const usage = await response.json();
    const usedMB = Math.round(usage.disk.used / (1024 * 1024));
    const availableMB = Math.round(usage.disk.available / (1024 * 1024));
    const totalMB = Math.round(usage.disk.total / (1024 * 1024));

    let message = `💾 **Uso del Disco**\n\n`;
    message += `📊 **Espacio Total:** ${totalMB} MB\n`;
    message += `📁 **Espacio Usado:** ${usedMB} MB (${usage.disk.usedPercentage}%)\n`;
    message += `🆓 **Espacio Disponible:** ${availableMB} MB (${usage.disk.availablePercentage}%)\n`;
    message += `📄 **Archivos:** ${usage.files.count}\n\n`;

    if (usage.recommendations.warning) {
      message += `⚠️ **Advertencia:** ${usage.recommendations.warning}\n\n`;
    }
    if (usage.recommendations.critical) {
      message += `🚨 **CRÍTICO:** ${usage.recommendations.critical}\n\n`;
    }

    message += `📋 **Límites por tipo de archivo:**\n`;
    message += `• PDF: 10MB\n`;
    message += `• Excel: 20MB\n`;
    message += `• ZIP/RAR: 50MB\n`;
    message += `• Imágenes: 5-10MB\n`;
    message += `• Otros: 25MB`;

    modal.show({
      title: '💾 Estado del Almacenamiento',
      bodyHTML: `<div style="white-space: pre-line; font-family: monospace;">${message}</div>`,
      submitLabel: 'Cerrar',
      onSubmit: () => modal.hide()
    });
  } catch (error) {
    console.error('Error obteniendo uso del disco:', error);
    alert('Error obteniendo información del disco: ' + error.message);
  }
}

// Función para agregar botón de espacio disponible
function addStorageButton() {
  // Solo mostrar el botón si el usuario es admin
  if (!isAdmin()) return;
  
  const toolbar = document.querySelector('header.appbar .toolbar');
  if (!toolbar) return;
  
  // Verificar si ya existe el botón
  if (toolbar.querySelector('#btnStorage')) return;
  
  const storageButton = document.createElement('button');
  storageButton.id = 'btnStorage';
  storageButton.className = 'btn btn-info';
  storageButton.style.cssText = 'background: #2196F3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 0 5px;';
  storageButton.innerHTML = '💾 Espacio';
  storageButton.onclick = showDiskUsage;
  
  // Insertar después del botón de agregar desarrollo
  const btnAddDev = document.getElementById('btnAddDev');
  if (btnAddDev && btnAddDev.parentNode) {
    btnAddDev.parentNode.insertBefore(storageButton, btnAddDev.nextSibling);
  } else {
    toolbar.appendChild(storageButton);
  }
}
