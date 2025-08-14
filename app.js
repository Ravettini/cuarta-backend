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
    this.titleEl.textContent = title||"";
    this.bodyEl.innerHTML = bodyHTML||"";
    this.onSubmit = onSubmit;
    this.submitEl.textContent = submitLabel;
    this.el.classList.add("open");
    setTimeout(()=>{ const f = this.el.querySelector(initialFocus); if(f) f.focus(); }, 0);
  },
  hide(){ this.el.classList.remove("open"); this.bodyEl.innerHTML=""; this.onSubmit=null; }
};

// ===== Usuarios & Datos con roles =====
const DEFAULT_USER_LIST = [
  { username:"admin",      password:"1234",   role:"admin", permittedWorldIds:"*" },
  { username:"estaciones", password:"est2025",role:"user",  permittedWorldIds:[] },
  { username:"sanfer",     password:"sf2025", role:"user",  permittedWorldIds:[] },
  { username:"ambos",      password:"fullaccess", role:"user", permittedWorldIds:[] }
];

const DEFAULT_DATA = {
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

  // -- Nuevos 4 mapas genéricos --
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

// ===== Estado & Storage =====
const state = { user:null, data:null, currentWorldId:null, currentSubId:null };
const LS_SESSION="gcba_session";

// Función para restaurar sesión (mantenida para compatibilidad)
function restoreSession(){
  const s = JSON.parse(localStorage.getItem(LS_SESSION)||"null");
  if(s && s.username){
    // La sesión se validará contra la API al cargar
    state.user = { username:s.username, role:s.role, permittedWorldIds:s.permittedWorldIds };
  }
}

// Función para persistir sesión
function persistSession(){
  if(state.user) localStorage.setItem(LS_SESSION, JSON.stringify({username:state.user.username}));
  else localStorage.removeItem(LS_SESSION);
}

// Función para cargar usuarios desde la API
async function loadUserListFromAPI() {
  try {
    return await loadUsersFromAPI();
  } catch (error) {
    console.error('Error cargando usuarios desde API:', error);
    // Fallback a usuarios por defecto
    return [
      { username:"admin", password:"1234", role:"admin", permittedWorldIds:"*" },
      { username:"estaciones", password:"est2025",role:"user", permittedWorldIds:[] },
      { username:"sanfer", password:"sf2025", role:"user", permittedWorldIds:[] },
      { username:"ambos", password:"fullaccess", role:"user", permittedWorldIds:[] }
    ];
  }
}

// Función para configurar permisos por defecto
async function ensureDefaultPermissions(users, data) {
  try {
    const mundos = await loadMundosFromAPI();
    const mapByName = Object.fromEntries(mundos.map(w => [w.nombre, w.id]));
    
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
      
      // Actualizar usuario en la base de datos
      try {
        await updateUserAPI(user.id, { permittedWorldIds: user.permittedWorldIds });
      } catch (error) {
        console.error(`Error actualizando permisos para ${user.username}:`, error);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error configurando permisos por defecto:', error);
    return users;
  }
}

// Función para guardar datos (mantenida para compatibilidad)
function saveData(d){ 
  // Los datos ahora se guardan en la base de datos, pero mantenemos esta función
  // para operaciones que aún la necesiten
  console.log('Datos guardados localmente (también se guardaron en la base de datos)');
}

// Nueva función para cargar datos desde la API
async function loadDataFromAPI() {
  try {
    const mundos = await loadMundosFromAPI();
    
    // Si no hay mundos, crear los por defecto
    if (mundos.length === 0) {
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
    
    // Convertir el formato de la API al formato esperado por el frontend
    const formattedData = {
      worlds: mundos.map(mundo => ({
        id: mundo.id,
        name: mundo.nombre,
        subWorlds: [] // Los sub-mundos se cargarán cuando se necesiten
      }))
    };
    
    return formattedData;
  } catch (error) {
    console.error('Error cargando datos desde API:', error);
    // Fallback a datos por defecto si la API falla
    return getDefaultDataStructure();
  }
}

// Función para crear mundos por defecto
async function createDefaultMundos() {
  try {
    // Crear "Estaciones Saludables"
    const estacionesMundo = await createMundoAPI({
      nombre: "Estaciones Saludables",
      descripcion: "Mundo para gestión de estaciones de salud",
      activo: true,
      orden: 1
    });
    
    // Crear "San Fernando"
    const sanferMundo = await createMundoAPI({
      nombre: "San Fernando",
      descripcion: "Mundo para gestión de San Fernando",
      activo: true,
      orden: 2
    });
    
    // Crear sub-mundos para Estaciones Saludables
    const mapasSub = await createSubMundoAPI({
      nombre: "Mapas",
      descripcion: "Mapas de estaciones",
      activo: true,
      orden: 1,
      mundoId: estacionesMundo.id
    });
    
    const biSub = await createSubMundoAPI({
      nombre: "BI",
      descripcion: "Business Intelligence",
      activo: true,
      orden: 2,
      mundoId: estacionesMundo.id
    });
    
    const reportesSub = await createSubMundoAPI({
      nombre: "Reportes",
      descripcion: "Reportes y documentación",
      activo: true,
      orden: 3,
      mundoId: estacionesMundo.id
    });
    
    // Crear sub-mundos para San Fernando
    const mapasSanferSub = await createSubMundoAPI({
      nombre: "Mapas",
      descripcion: "Mapas de San Fernando",
      activo: true,
      orden: 1,
      mundoId: sanferMundo.id
    });
    
    const docsSanferSub = await createSubMundoAPI({
      nombre: "Documentos",
      descripcion: "Documentos de San Fernando",
      activo: true,
      orden: 2,
      mundoId: sanferMundo.id
    });
    
    // Crear desarrollos por defecto
    await createDefaultDesarrollos(mapasSub.id, biSub.id, reportesSub.id, mapasSanferSub.id, docsSanferSub.id);
    
    console.log('Mundos por defecto creados exitosamente');
  } catch (error) {
    console.error('Error creando mundos por defecto:', error);
  }
}

// Función para crear desarrollos por defecto
async function createDefaultDesarrollos(mapasSubId, biSubId, reportesSubId, mapasSanferSubId, docsSanferSubId) {
  try {
    // Desarrollos para Mapas (Estaciones)
    const desarrollosMapas = [
      { titulo: "Mapa de Rangos de Visitas", descripcion: "Visualización por rangos", url: "Mapas Estaciones/mapa_rangos.html", tags: "mapa,CABA", activo: true, orden: 1 },
      { titulo: "Mapa Analítico de Asistentes", descripcion: "Análisis de asistentes", url: "Mapas Estaciones/Mapa_Asistentes_CABA_Analitico.html", tags: "mapa,analítico", activo: true, orden: 2 },
      { titulo: "Mapa de Dispersión de Distancias", descripcion: "Dispersión de distancias", url: "Mapas Estaciones/mapa_distancias.html", tags: "mapa,distancias", activo: true, orden: 3 },
      { titulo: "Mapa Cobertura Barrial", descripcion: "Mapa genérico de cobertura por barrio", url: "Mapas Estaciones/mapa_cobertura_barrial.html", tags: "mapa,genérico", activo: true, orden: 4 },
      { titulo: "Mapa Calor de Asistencia", descripcion: "Mapa de calor genérico", url: "Mapas Estaciones/mapa_calor_asistencia.html", tags: "mapa,calor", activo: true, orden: 5 },
      { titulo: "Mapa Puntos de Atención", descripcion: "Marcadores de puntos de atención", url: "Mapas Estaciones/mapa_puntos_atencion.html", tags: "mapa,puntos", activo: true, orden: 6 },
      { titulo: "Mapa Tendencias Temporales", descripcion: "Tendencias por periodo", url: "Mapas Estaciones/mapa_tendencias_temporales.html", tags: "mapa,tendencias", activo: true, orden: 7 }
    ];
    
    for (const dev of desarrollosMapas) {
      await createDesarrolloAPI({
        ...dev,
        subMundoId: mapasSubId
      });
    }
    
    // Desarrollos para BI
    await createDesarrolloAPI({
      titulo: "Dashboard Power BI",
      descripcion: "Dashboard interactivo",
      url: "https://app.powerbi.com/view?r=eyJrIjoiOGRmY2FlYTYtNjllNS00OWE5LWJjMzEtODhiNjBkMmMyOTgwIiwidCI6IjIzNzc0NzJlLTgwMDQtNDY0OC04NDU2LWJkOTY4N2FmYTE1MCIsImMiOjR9&pageName=ReportSectiona3847c630a8d7da06b55",
      tags: "bi,dashboard",
      activo: true,
      orden: 1,
      subMundoId: biSubId
    });
    
    // Desarrollos para Reportes
    await createDesarrolloAPI({
      titulo: "Reporte General",
      descripcion: "Notion",
      url: "https://www.notion.so/An-lisis-de-Cobertura-y-Participaci-n-Estaciones-Saludables-CABA-2025-2470723826b580fa8654c9aa5b6a1a51?source=copy_link",
      tags: "reporte",
      activo: true,
      orden: 1,
      subMundoId: reportesSubId
    });
    
    // Desarrollos para Mapas San Fernando
    const desarrollosMapasSanfer = [
      { titulo: "Ganador por tipo de piso", descripcion: "", url: "Mapas Sanfer/mapa_ganador_x_tipo_piso.html", tags: "mapa", activo: true, orden: 1 },
      { titulo: "Ganador por nivel educativo", descripcion: "", url: "Mapas Sanfer/mapa_nivel_educativo (1).html", tags: "mapa", activo: true, orden: 2 },
      { titulo: "Ganador por nivel educativo y obra social", descripcion: "", url: "Mapas Sanfer/mapa_partido_ganador (1).html", tags: "mapa", activo: true, orden: 3 },
      { titulo: "Uso de garrafa", descripcion: "", url: "Mapas Sanfer/mapa_uso_garrafa (1).html", tags: "mapa", activo: true, orden: 4 },
      { titulo: "Mesas con Potencial 2023", descripcion: "", url: "Mapas Sanfer/mapa_san_fernando_circuitos (1).html", tags: "mapa", activo: true, orden: 5 },
      { titulo: "Mesas Competitivas 2023", descripcion: "", url: "Mapas Sanfer/mapa_san_fernando_circuitos (4).html", tags: "mapa", activo: true, orden: 6 }
    ];
    
    for (const dev of desarrollosMapasSanfer) {
      await createDesarrolloAPI({
        ...dev,
        subMundoId: mapasSanferSubId
      });
    }
    
    // Desarrollos para Documentos San Fernando
    const desarrollosDocsSanfer = [
      { titulo: "TABLON", descripcion: "", url: "https://docs.google.com/spreadsheets/d1Mu0lNlZRNEa91xgV37TvwMnltyAA9-wH/edit?usp=drive_link&ouid=105283006911507845368&rtpof=true&sd=true", tags: "doc", activo: true, orden: 1 },
      { titulo: "Último Reporte", descripcion: "", url: "https://docs.google.com/document/d1UzqBDIozeX_vEP_F20vcHD_IBDyT373RW7R_r2JkYao/edit?usp=drive_link", tags: "doc", activo: true, orden: 2 },
      { titulo: "Reporte Eze", descripcion: "", url: "https://www.notion.so/Datos-226e1238ed6c807f94f6e8d66a143fa0?source=copy_link", tags: "doc", activo: true, orden: 3 }
    ];
    
    for (const dev of desarrollosDocsSanfer) {
      await createDesarrolloAPI({
        ...dev,
        subMundoId: docsSanferSubId
      });
    }
    
    console.log('Desarrollos por defecto creados exitosamente');
  } catch (error) {
    console.error('Error creando desarrollos por defecto:', error);
  }
}

// Función para obtener estructura de datos por defecto (fallback)
function getDefaultDataStructure() {
  return {
    worlds: [
      {
        id: crypto.randomUUID(),
        name: "Estaciones Saludables",
        subWorlds: []
      },
      {
        id: crypto.randomUUID(),
        name: "San Fernando",
        subWorlds: []
      }
    ]
  };
}

// Función para cargar sub-mundos de un mundo específico
async function loadSubWorldsForMundo(mundoId) {
  try {
    const subMundos = await loadSubMundosFromAPI(mundoId);
    const mundo = state.data.worlds.find(w => w.id === mundoId);
    if (mundo) {
      mundo.subWorlds = subMundos.map(sub => ({
        id: sub.id,
        name: sub.nombre,
        devs: [] // Los desarrollos se cargarán cuando se necesiten
      }));
    }
  } catch (error) {
    console.error('Error cargando sub-mundos para mundo:', mundoId, error);
  }
}

// Función para cargar desarrollos de un sub-mundo específico
async function loadDesarrollosForSubMundo(subMundoId) {
  try {
    const desarrollos = await loadDesarrollosFromAPI(subMundoId);
    const subMundo = findSubMundoById(subMundoId);
    if (subMundo) {
      subMundo.devs = desarrollos.map(dev => ({
        id: dev.id,
        title: dev.titulo,
        desc: dev.descripcion,
        url: dev.url,
        tags: dev.tags ? dev.tags.split(',').map(t => t.trim()) : []
      }));
    }
  } catch (error) {
    console.error('Error cargando desarrollos para sub-mundo:', subMundoId, error);
  }
}

// Función helper para encontrar un sub-mundo por ID
function findSubMundoById(subMundoId) {
  for (const mundo of state.data.worlds) {
    for (const subMundo of mundo.subWorlds) {
      if (subMundo.id === subMundoId) {
        return subMundo;
      }
    }
  }
  return null;
}

// Función helper para encontrar un mundo por ID
function findMundoById(mundoId) {
  return state.data.worlds.find(w => w.id === mundoId);
}

// ===== Permisos =====
function isAdmin(){ return state.user?.role==="admin"; }
function canSeeWorld(worldId){
  if(isAdmin()) return true;
  const perm = state.user?.permittedWorldIds;
  if(perm==="*") return true;
  if(!perm || !Array.isArray(perm)) return false;
  return perm.includes(worldId);
}
function guardAdmin(){
  if(!isAdmin()){ alert("Acceso restringido a ADMIN."); return false; }
  return true;
}

// ===== Render / Navegación =====
function setSection(id){ $$("main section").forEach(s=>s.classList.remove("active")); $(id).classList.add("active"); }
function updateHero(){
  const crumbs=[];
  if(state.currentWorldId){ const w = state.data.worlds.find(w=>w.id===state.currentWorldId); if(w) crumbs.push(w.name); }
  if(state.currentSubId){ const sw = getCurrentSub(); if(sw) crumbs.push(sw.name); }
  $("#heroTitle").textContent = state.user ? `Hola, ${state.user.username}` : "Bienvenido";
  $("#heroDesc").textContent  = state.user ? "Explorá y administrá los mundos a los que tenés acceso." : "Ingresá con tu usuario asignado por un ADMIN.";
  const bc = $("#breadcrumbs"); bc.innerHTML="";
  crumbs.forEach((c,i)=>{
    const pill=document.createElement("button"); pill.className="pill"+(i===crumbs.length-1?" active":""); pill.textContent=c;
    pill.onclick=()=>{ if(i===0){ goWorlds(); } else { goSubWorlds(); } };
    bc.appendChild(pill);
  });
}
function toggleToolbar(show, scope={}){
  $("#btnNewWorld").style.display   = (show && isAdmin()) ? "inline-block":"none";
  $("#btnNewSubWorld").style.display= (show && scope.world && isAdmin()) ? "inline-block":"none";
  $("#btnAddDev").style.display     = (show && scope.sub) ? "inline-block":"none";
  $("#btnBack").style.display       = show ? "inline-block":"none";
  $("#btnLogout").style.display     = state.user ? "inline-block":"none";
  $("#btnAdmin").style.display      = (state.user && isAdmin()) ? "inline-block":"none";
}

function getCurrentWorld(){ return state.data.worlds.find(w=>w.id===state.currentWorldId); }
function getCurrentSub(){ const w=getCurrentWorld(); return w? w.subWorlds.find(s=>s.id===state.currentSubId) : null; }

async function renderWorlds() {
  const grid = $("#worldsGrid");
  grid.innerHTML = "";
  
  // Cargar sub-mundos para cada mundo si no están cargados
  for (const mundo of state.data.worlds) {
    if (mundo.subWorlds.length === 0) {
      await loadSubWorldsForMundo(mundo.id);
    }
  }
  
  const visible = state.data.worlds.filter(w => canSeeWorld(w.id));
  $("#worldsEmpty").style.display = visible.length ? "none" : "block";
  
  visible.forEach(w => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${w.name}</h3>
      <p class="muted t-body">Sub-mundos: ${w.subWorlds.length}</p>
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
      card.querySelector(".btn.btn-rename").onclick = () => showWorldForm({ mode: "rename", worldId: w.id });
      card.querySelector(".btn.btn-danger").onclick = () => confirmDelete({ scope: "world", id: w.id, name: w.name });
    }
    
    grid.appendChild(card);
  });
}

async function renderSubWorlds() {
  const w = getCurrentWorld();
  const grid = $("#subWorldsGrid");
  grid.innerHTML = "";
  
  if (!w) {
    $("#subWorldsEmpty").style.display = "block";
    return;
  }
  
  // Cargar desarrollos para cada sub-mundo si no están cargados
  for (const subMundo of w.subWorlds) {
    if (subMundo.devs.length === 0) {
      await loadDesarrollosForSubMundo(subMundo.id);
    }
  }
  
  $("#subWorldsEmpty").style.display = w.subWorlds.length ? "none" : "block";
  
  w.subWorlds.forEach(sw => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <h3>${sw.name}</h3>
      <p class="muted t-body">Desarrollos: ${sw.devs.length}</p>
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
      card.querySelector(".btn.btn-rename").onclick = () => showSubWorldForm({ mode: "rename", subId: sw.id });
      card.querySelector(".btn.btn-danger").onclick = () => confirmDelete({ scope: "sub", id: sw.id, name: sw.name });
    }
    
    grid.appendChild(card);
  });
}

function renderDevs(){
  const sw=getCurrentSub(); $("#devsGrid").innerHTML="";
  $("#devsEmpty").style.display = sw && sw.devs.length ? "none":"block";
  if(!sw) return;
  sw.devs.forEach(d=>{
    const card=document.createElement("div"); card.className="card";
    card.innerHTML=`
      <h3>${d.title}</h3>
      <p class="muted t-body">${d.desc || ""}</p>
      <div class="tags">${(d.tags||[]).map(t=>`<span class="tag cyan">${t}</span>`).join("")}</div>
      <div class="actions">
        ${d.url ? `<a class="button-link" href="${d.url}" target="_blank" rel="noopener">Abrir</a>`:""}
        <button class="btn btn-edit">Editar</button>
        <button class="btn btn-danger">Eliminar</button>
      </div>`;
    card.querySelector(".btn.btn-edit").onclick=()=>showDevForm({mode:"edit", devId:d.id});
    card.querySelector(".btn.btn-danger").onclick=()=>confirmDelete({scope:"dev", id:d.id, name:d.title});
    $("#devsGrid").appendChild(card);
  });
}

// ===== Navegación =====
function goAuth(){ setSection("#authSection"); updateHero(); toggleToolbar(false); }
async function goWorlds(){ state.currentSubId=null; setSection("#worldsSection"); await renderWorlds(); updateHero(); toggleToolbar(true,{world:true}); }
async function goSubWorlds(){ setSection("#subWorldsSection"); await renderSubWorlds(); updateHero(); toggleToolbar(true,{world:true, sub:true}); }
function goDevs(){ setSection("#devsSection"); renderDevs(); updateHero(); toggleToolbar(true,{world:true, sub:true, dev:true}); }
async function goAdmin(){ if(!guardAdmin()) return; setSection("#adminSection"); await renderAdmin(); updateHero(); toggleToolbar(true,{world:true}); }

// ===== Auth =====
async function login(u,p){
  try {
    const userData = await authenticateUserAPI(u, p);
    state.user = {
      username: userData.username,
      role: userData.role,
      permittedWorldIds: userData.permittedWorldIds
    };
    persistSession();
    $("#authMsg").textContent = "";
    return true;
  } catch (error) {
    console.error('Error en login:', error);
    return false;
  }
}

function logout(){ state.user=null; state.currentWorldId=null; state.currentSubId=null; persistSession(); goAuth(); }

// ===== Formularios en modal =====
function showWorldForm({mode="create", worldId=null}={}){
  if(!isAdmin()) return;
  const existing = worldId ? state.data.worlds.find(w=>w.id===worldId) : null;
  modal.show({
    title: mode==="create" ? "Nuevo mundo" : "Renombrar mundo",
    bodyHTML:`
      <div class="field">
        <label for="worldName">Nombre del mundo</label>
        <input id="worldName" placeholder="Nombre" value="${existing?existing.name:""}" />
      </div>`,
    onSubmit:async ()=>{
      const name = $("#worldName").value.trim();
      if(!name) return;
      if(mode==="create"){
        try {
          const nuevoMundo = await createMundoAPI({
            nombre: name,
            descripcion: "",
            activo: true,
            orden: state.data.worlds.length + 1
          });
          state.data.worlds.push({id:nuevoMundo.id, name, subWorlds:[]});
          
          // Actualizar permisos de usuarios
          await updateUserPermissionsForNewWorld(nuevoMundo.id);
        } catch (error) {
          alert('Error creando mundo: ' + error.message);
          return;
        }
      }else{
        try {
          // TODO: Implementar actualización de mundo
          existing.name=name;
        } catch (error) {
          alert('Error renombrando mundo: ' + error.message);
          return;
        }
      }
      saveData(state.data); modal.hide(); renderWorlds(); renderAdmin?.(); updateHero();
    },
    initialFocus:"#worldName",
    submitLabel: mode==="create" ? "Crear" : "Guardar"
  });
}

function showSubWorldForm({mode="create", subId=null}={}){
  if(!isAdmin()) return;
  const w=getCurrentWorld(); if(!w) return;
  const existing = subId ? w.subWorlds.find(s=>s.id===subId) : null;
  modal.show({
    title: mode==="create" ? "Nuevo sub-mundo" : "Renombrar sub-mundo",
    bodyHTML:`
      <div class="field">
        <label for="subName">Nombre del sub-mundo</label>
        <input id="subName" placeholder="Nombre" value="${existing?existing.name:""}" />
      </div>`,
    onSubmit:async ()=>{
      const name=$("#subName").value.trim(); if(!name) return;
      if(mode==="create"){
        try {
          const nuevoSubMundo = await createSubMundoAPI({
            nombre: name,
            descripcion: "",
            activo: true,
            orden: w.subWorlds.length + 1,
            mundoId: w.id
          });
          w.subWorlds.push({id:nuevoSubMundo.id, name, devs:[]});
        } catch (error) {
          alert('Error creando sub-mundo: ' + error.message);
          return;
        }
      }else{
        try {
          // TODO: Implementar actualización de sub-mundo
          existing.name=name;
        } catch (error) {
          alert('Error renombrando sub-mundo: ' + error.message);
          return;
        }
      }
      saveData(state.data); modal.hide(); renderSubWorlds(); updateHero();
    },
    initialFocus:"#subName",
    submitLabel: mode==="create" ? "Crear" : "Guardar"
  });
}

function showDevForm({mode="create", devId=null}={}){
  const sw=getCurrentSub(); if(!sw) return;
  const existing = devId ? sw.devs.find(d=>d.id===devId) : null;
  modal.show({
    title: mode==="create" ? "Nuevo desarrollo" : "Editar desarrollo",
    bodyHTML:`
      <div class="field"><label for="devTitle">Título</label>
        <input id="devTitle" placeholder="Ej. Dashboard Ventas" value="${existing?existing.title:""}"/></div>
      <div class="field"><label for="devURL">URL (opcional)</label>
        <input id="devURL" placeholder="https://..." value="${existing?(existing.url||""):""}"/></div>
      <div class="field"><label for="devDesc">Descripción (opcional)</label>
        <textarea id="devDesc" placeholder="Breve descripción...">${existing?(existing.desc||""):""}</textarea></div>
      <div class="field"><label for="devTags">Tags (separadas por coma)</label>
        <input id="devTags" placeholder="mapa, bi, informe" value="${existing?(existing.tags||[]).join(", "):""}"/></div>
    `,
    onSubmit:async ()=>{
      const title=$("#devTitle").value.trim(); if(!title) return;
      const url=$("#devURL").value.trim();
      const desc=$("#devDesc").value.trim();
      const tags=$("#devTags").value.split(",").map(t=>t.trim()).filter(Boolean);
      if(mode==="create"){
        try {
          const nuevoDesarrollo = await createDesarrolloAPI({
            titulo: title,
            url: url,
            descripcion: desc,
            tags: tags.join(', '),
            activo: true,
            orden: sw.devs.length + 1,
            subMundoId: sw.id
          });
          sw.devs.push({id:nuevoDesarrollo.id, title, url, desc, tags});
        } catch (error) {
          alert('Error creando desarrollo: ' + error.message);
          return;
        }
      }else{
        try {
          // TODO: Implementar actualización de desarrollo
          existing.title=title; existing.url=url; existing.desc=desc; existing.tags=tags;
        } catch (error) {
          alert('Error editando desarrollo: ' + error.message);
          return;
        }
      }
      saveData(state.data); modal.hide(); renderDevs();
    },
    initialFocus:"#devTitle",
    submitLabel: mode==="create" ? "Crear" : "Guardar"
  });
}

function confirmDelete({scope, id, name}){
  const labels = {world:"mundo", sub:"sub-mundo", dev:"desarrollo"};
  modal.show({
    title:`Eliminar ${labels[scope]}`,
    bodyHTML:`<p class="t-body">¿Seguro querés eliminar <strong>${name}</strong>? Esta acción no se puede deshacer.</p>`,
    onSubmit:async ()=>{
      if(scope==="world"){
        try {
          // TODO: Implementar eliminación de mundo via API
          state.data.worlds = state.data.worlds.filter(w=>w.id!==id);
          // limpiar permisos
          const users = await loadUserListFromAPI();
          const updatedUsers = users.map(u=>{
            if(u.permittedWorldIds==="*") return u;
            u.permittedWorldIds=(u.permittedWorldIds||[]).filter(x=>x!==id); return u;
          });
          
          // Actualizar usuarios en la base de datos
          await Promise.all(updatedUsers.map(u => 
            updateUserAPI(u.id, { permittedWorldIds: u.permittedWorldIds })
          ));
          
          saveData(state.data); modal.hide(); renderWorlds(); renderAdmin(); updateHero();
        } catch (error) {
          alert('Error eliminando mundo: ' + error.message);
        }
      }else if(scope==="sub"){
        const w=getCurrentWorld(); if(!w) return;
        try {
          // TODO: Implementar eliminación de sub-mundo via API
          w.subWorlds = w.subWorlds.filter(s=>s.id!==id);
          saveData(state.data); modal.hide(); renderSubWorlds(); updateHero();
        } catch (error) {
          alert('Error eliminando sub-mundo: ' + error.message);
        }
      }else if(scope==="dev"){
        const sw=getCurrentSub(); if(!sw) return;
        try {
          // TODO: Implementar eliminación de desarrollo via API
          sw.devs = sw.devs.filter(d=>d.id!==id);
          saveData(state.data); modal.hide(); renderDevs();
        } catch (error) {
          alert('Error eliminando desarrollo: ' + error.message);
        }
      }
    },
    submitLabel:"Eliminar"
  });
}

// ===== Panel de control =====
async function renderAdmin(){
  if(!isAdmin()) return;
  const ws=state.data.worlds;
  const sum=$("#worldsSummary"); sum.innerHTML="";
  ws.forEach(w=>{ const b=document.createElement("span"); b.className="badge"; b.textContent=`${w.name} (${w.subWorlds.length} sub-mundos)`; sum.appendChild(b); });

  const list=await loadUserListFromAPI();
  const cont=$("#usersList"); cont.innerHTML="";
  list.forEach(u=>{
    const item=document.createElement("div"); item.className="user-item";
    let worldsBadgesHTML="";
    if(u.permittedWorldIds==="*"){ worldsBadgesHTML = `<span class="badge">Todos los mundos</span>`; }
    else{
      const names = ws.filter(w=>u.permittedWorldIds?.includes(w.id)).map(w=>w.name);
      worldsBadgesHTML = names.length ? names.map(n=>`<span class="badge">${n}</span>`).join("") : `<span class="badge">Sin acceso</span>`;
    }
    item.innerHTML=`
      <div class="user-row">
        <div class="t-body"><strong>Usuario:</strong> ${u.username}</div>
        <div class="t-body"><strong>Rol:</strong> ${u.role.toUpperCase()}</div>
      </div>
      <div class="worlds-badges">${worldsBadgesHTML}</div>
      <div class="user-actions">
        <button class="btn btn-edit" data-action="edit">Editar</button>
        ${u.username!=="admin" ? '<button class="btn btn-danger" data-action="delete">Eliminar</button>' : ''}
      </div>`;
    item.querySelector('[data-action="edit"]').onclick=()=>openUserForm(u);
    const del=item.querySelector('[data-action="delete"]');
    if(del){ del.onclick=()=>confirmDeleteUser(u); }
    cont.appendChild(item);
  });
}

function confirmDeleteUser(user){
  modal.show({
    title:"Eliminar usuario",
    bodyHTML:`<p class="t-body">¿Eliminar el usuario <strong>${user.username}</strong>?</p>`,
    onSubmit:async ()=>{
      try {
        await deleteUserAPI(user.id);
        if(state.user?.username===user.username) logout();
        modal.hide(); 
        renderAdmin();
      } catch (error) {
        alert('Error eliminando usuario: ' + error.message);
      }
    },
    submitLabel:"Eliminar"
  });
}

function openUserForm(user=null){
  const isEdit = !!user;
  const ws = state.data.worlds;
  const checkboxList = ws.map(w=>{
    const checked = user && user.permittedWorldIds!=="*" && user.permittedWorldIds?.includes(w.id) ? "checked" : "";
    return `<label class="t-body" style="display:flex;align-items:center;gap:8px">
              <input type="checkbox" value="${w.id}" ${checked}/> ${w.name}
            </label>`;
  }).join("");

  modal.show({
    title: isEdit ? `Editar usuario` : `Nuevo usuario`,
    bodyHTML:`
      <div class="field"><label for="uName">Usuario</label>
        <input id="uName" ${isEdit?'disabled':''} value="${user?user.username:''}" placeholder="usuario"/></div>
      <div class="field"><label for="uPass">${isEdit?'Nueva contraseña (opcional)':'Contraseña'}</label>
        <input id="uPass" type="password" placeholder="${isEdit?'(dejar vacío para mantener)':'Mínimo 4 caracteres'}"/></div>
      <div class="field"><label for="uRole">Rol</label>
        <select id="uRole">
          <option value="user" ${user&&user.role==='user'?'selected':''}>User</option>
          <option value="admin" ${user&&user.role==='admin'?'selected':''}>Admin</option>
        </select>
      </div>
      <div id="permWorlds" class="field">
        <label>Permisos por mundo</label>
        <div class="card" style="padding:12px">${checkboxList || '<span class="t-body muted">No hay mundos aún.</span>'}</div>
      </div>
    `,
    onSubmit:async ()=>{
      const username = $("#uName").value.trim();
      const pass = $("#uPass").value;
      const role = $("#uRole").value;
      const checked = Array.from($("#permWorlds").querySelectorAll('input[type="checkbox"]:checked')).map(i=>i.value);

      try {
        if(isEdit){
          if(pass) await updateUserAPI(user.id, { password: pass });
          await updateUserAPI(user.id, { role });
          await updateUserAPI(user.id, { permittedWorldIds: (role==="admin") ? "*" : checked });
        }else{
          if(!username){ alert("Usuario inválido."); return; }
          if(!pass || pass.length<4){ alert("Contraseña inválida (mín. 4)."); return; }
          
          const newUser = await createUserAPI({
            username, password: pass, role, permittedWorldIds: role==="admin" ? "*" : checked
          });
        }
        
        // actualizar sesión si es necesario
        if(state.user && isEdit && state.user.username===user.username){
          state.user.role = role; 
          state.user.permittedWorldIds = role==="admin"?"*":checked; 
          persistSession();
          if(state.currentWorldId && !canSeeWorld(state.currentWorldId)){ 
            state.currentWorldId=null; 
            state.currentSubId=null; 
            goWorlds(); 
          }
          toggleToolbar(true,{world:true});
        }
        
        modal.hide(); 
        renderAdmin();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    },
    initialFocus:"#uName",
    submitLabel: isEdit ? "Guardar" : "Crear"
  });

  const roleSel = $("#uRole");
  const permBox = $("#permWorlds");
  const togglePerms = ()=>{ permBox.style.display = roleSel.value==="admin" ? "none":"block"; };
  roleSel.onchange = togglePerms;
  togglePerms();
}

// ===== CRUD (usando modales) =====
function createWorld(){ showWorldForm({mode:"create"}); }
function renameWorld(id){ showWorldForm({mode:"rename", worldId:id}); }
function deleteWorld(id){
  const w = state.data.worlds.find(x=>x.id===id);
  if(!w) return;
  confirmDelete({scope:"world", id, name:w.name});
}

function createSubWorld(){ showSubWorldForm({mode:"create"}); }
function renameSub(id){ showSubWorldForm({mode:"rename", subId:id}); }
function deleteSub(id){
  const w=getCurrentWorld(); if(!w) return;
  const sw = w.subWorlds.find(x=>x.id===id); if(!sw) return;
  confirmDelete({scope:"sub", id, name:sw.name});
}

function addDevManually(){ showDevForm({mode:"create"}); }
function editDev(id){ showDevForm({mode:"edit", devId:id}); }
function deleteDev(id){
  const sw=getCurrentSub(); if(!sw) return;
  const d = sw.devs.find(x=>x.id===id); if(!d) return;
  confirmDelete({scope:"dev", id, name:d.title});
}

// ===== Drag & Drop =====
function setupDropzone(){
  const dz = $("#dropzone");
  ["dragenter","dragover"].forEach(evt=>{
    dz.addEventListener(evt, e=>{ e.preventDefault(); e.stopPropagation(); dz.classList.add("dragover"); });
  });
  ["dragleave","drop"].forEach(evt=>{
    dz.addEventListener(evt, e=>{ e.preventDefault(); e.stopPropagation(); dz.classList.remove("dragover"); });
  });
  dz.addEventListener("drop", e=>{
    const sw = getCurrentSub(); if(!sw) return alert("Elegí un sub-mundo.");
    const items = e.dataTransfer.items;
    if(items && items.length){
      for(const it of items){
        if(it.kind==="string"){
          it.getAsString(str=>{
            try{
              const maybeURL = (str||"").trim();
              if(maybeURL.startsWith("http")){
                sw.devs.push({id:crypto.randomUUID(), title: new URL(maybeURL).hostname, url: maybeURL, desc:"Agregado por drag & drop", tags:["link"]});
                saveData(state.data); renderDevs();
              }
            }catch{}
          });
        } else if(it.kind==="file"){
          const file = it.getAsFile();
          const url = URL.createObjectURL(file);
          sw.devs.push({id:crypto.randomUUID(), title:file.name, url, desc:`Archivo local (${Math.round(file.size/1024)} KB)`, tags:["archivo"]});
          saveData(state.data); renderDevs();
        }
      }
    }
  });
  dz.addEventListener("paste", e=>{
    const sw = getCurrentSub(); if(!sw) return;
    const text = (e.clipboardData || window.clipboardData).getData("text");
    if(text && text.startsWith("http")){
      sw.devs.push({id:crypto.randomUUID(), title:new URL(text).hostname, url:text, desc:"Agregado por pegar enlace", tags:["link"]});
      saveData(state.data); renderDevs();
    }
  });
}

// ===== Eventos UI =====
$("#btnNewWorld").onclick=()=>{ if(isAdmin()) createWorld(); else alert("Solo ADMIN."); };
$("#btnNewSubWorld").onclick=()=>{ if(isAdmin()) createSubWorld(); else alert("Solo ADMIN."); };
$("#btnAddDev").onclick=addDevManually;
$("#btnBack").onclick=()=>{ if(state.currentSubId){ state.currentSubId=null; goSubWorlds(); } else if(state.currentWorldId){ state.currentWorldId=null; goWorlds(); } else { goWorlds(); } };
$("#btnLogout").onclick=logout;
$("#btnAdmin").onclick=goAdmin;
$("#doLogin").onclick=()=>{
  const u=$("#loginUser").value.trim(); const p=$("#loginPass").value.trim();
  if(await login(u,p)){
    $("#authSection").classList.remove("active");
    $("#heroTitle").textContent=`Hola, ${u}`;
    $("#heroDesc").textContent="Elegí un mundo para empezar.";
    goWorlds();
  }else{
    $("#authMsg").textContent="Credenciales incorrectas. Probá nuevamente.";
  }
};
$("#btnAddUser")?.addEventListener("click", ()=> openUserForm(null));

// ===== API Integration =====
// Configuración de la API - Cambiar si el backend corre en otro puerto
const BASE_API = '/api/v1';

// Cliente API genérico
async function api(url, opts = {}) {
  const response = await fetch(BASE_API + url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...opts.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// Funciones de la API
async function listFiles({ folder, q, limit = 50, offset = 0 } = {}) {
  const params = new URLSearchParams();
  if (folder) params.append('folder', folder);
  if (q) params.append('q', q);
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  return api(`/files?${params.toString()}`);
}

async function uploadFile(file, folder = null, tags = null) {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);
  if (tags) formData.append('tags', tags);
  
  const response = await fetch(BASE_API + '/files', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

async function deleteFile(id) {
  return api(`/files/${id}`, {
    method: 'DELETE'
  });
}

async function downloadFile(id) {
  window.open(`${BASE_API}/files/${id}/download`, '_blank');
}

// Las funciones de archivos están disponibles para uso futuro si las necesitas
// pero no se muestran botones en la UI para evitar duplicación

// ===== API para datos de la aplicación =====
async function loadMundosFromAPI() {
  try {
    const response = await api('/mundos');
    return response.data || [];
  } catch (error) {
    console.error('Error cargando mundos:', error);
    return [];
  }
}

async function loadSubMundosFromAPI(mundoId) {
  try {
    const response = await api(`/mundos/${mundoId}/sub-mundos`);
    return response.data || [];
  } catch (error) {
    console.error('Error cargando sub-mundos:', error);
    return [];
  }
}

async function loadDesarrollosFromAPI(subMundoId) {
  try {
    const response = await api(`/sub-mundos/${subMundoId}/desarrollos`);
    return response.data || [];
  } catch (error) {
    console.error('Error cargando desarrollos:', error);
    return [];
  }
}

// ===== API para usuarios =====
async function loadUsersFromAPI() {
  try {
    const response = await api('/users');
    return response.data || [];
  } catch (error) {
    console.error('Error cargando usuarios:', error);
    return [];
  }
}

async function createUserAPI(userData) {
  try {
    const response = await api('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return response.data;
  } catch (error) {
    console.error('Error creando usuario:', error);
    throw error;
  }
}

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

async function deleteUserAPI(userId) {
  try {
    const response = await api(`/users/${userId}`, {
      method: 'DELETE'
    });
    return response.data;
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    throw error;
  }
}

async function authenticateUserAPI(username, password) {
  try {
    const response = await api('/users/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    return response.data;
  } catch (error) {
    console.error('Error autenticando usuario:', error);
    throw error;
  }
}

async function getUserPermissionsAPI(userId) {
  try {
    const response = await api(`/users/${userId}/permisos`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    throw error;
  }
}

async function createMundoAPI(mundoData) {
  try {
    const response = await api('/mundos', {
      method: 'POST',
      body: JSON.stringify(mundoData)
    });
    return response.data;
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
    return response.data;
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

// ===== Inicialización modificada =====
async function initializeApp() {
  try {
    // Cargar datos desde la API
    state.data = await loadDataFromAPI();
    
    // Configurar permisos por defecto
    await ensureDefaultPermissions(await loadUserListFromAPI(), state.data);
    
    // Si hay usuario logueado, ir a mundos
    if (state.user) {
      $("#authSection").classList.remove("active");
      await goWorlds();
    } else {
      goAuth();
    }
  } catch (error) {
    console.error('Error inicializando la aplicación:', error);
    // Fallback a datos por defecto
    state.data = getDefaultDataStructure();
    goAuth();
  }
}

// ===== Init =====
(function init(){
  // Registro invisible pedido
  console.log("CREADO POR IGNACIO RAVETTINI");

  modal.init();
  restoreSession();
  setupDropzone();

  // Inicializar la aplicación de forma asíncrona
  initializeApp();
})();
