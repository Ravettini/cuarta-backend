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
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

// ===== Estado & Storage =====
const state = { user:null, data:null, currentWorldId:null, currentSubId:null };
const LS_SESSION="gcba_session";

// Función para restaurar sesión (mantenida para compatibilidad)
function restoreSession(){
  const s = JSON.parse(localStorage.getItem(LS_SESSION)||"null");
  if(s && s.username){
    // Solo guardar el username, la validación se hará contra la API
    state.user = { username:s.username };
  }
}

// Función para persistir sesión
function persistSession(){
  if(state.user) localStorage.setItem(LS_SESSION, JSON.stringify({username:state.user.username}));
  else localStorage.removeItem(LS_SESSION);
}

// ===== Funciones de Usuarios =====

// Función para cargar usuarios desde la API
async function loadUserListFromAPI() {
  try {
    const response = await api('/users');
    return response.data;
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
    
    const response = await api('/users/auth', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    console.log('📡 Respuesta de la API:', response);
    
    if (response.success) {
      state.user = response.data;
      persistSession();
      console.log('✅ Login exitoso, usuario:', state.user);
      return true;
    }
    
    console.log('❌ Login fallido, respuesta:', response);
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
    // Fallback a datos por defecto
    return getDefaultDataStructure();
  }
}

// Función para guardar datos (mantenida para compatibilidad)
function saveData(d){ 
  // Los datos ahora se guardan en la base de datos, pero mantenemos esta función
  // para operaciones que aún la necesiten
  console.log('Datos guardados localmente (también se guardaron en la base de datos)');
}

// ===== Funciones de API para Mundos =====

async function loadMundosFromAPI() {
  try {
    const response = await api('/mundos');
    return response.data;
  } catch (error) {
    console.error('Error cargando mundos desde API:', error);
    return [];
  }
}

async function loadSubMundosForMundo(mundoId) {
  try {
    const response = await api(`/mundos/${mundoId}/sub-mundos`);
    return response.data;
  } catch (error) {
    console.error('Error cargando sub-mundos desde API:', error);
    return [];
  }
}

async function loadDesarrollosForSubMundo(subMundoId) {
  try {
    const response = await api(`/sub-mundos/${subMundoId}/desarrollos`);
    return response.data;
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

async function deleteUserAPI(userId) {
  try {
    const response = await api(`/users/${userId}`, {
      method: 'DELETE'
    });
    return response.success;
  } catch (error) {
    console.error('Error eliminando usuario:', error);
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
  const worldsContainer = $("#worldsContainer");
  if (!worldsContainer) return;
  
  try {
    const mundos = await loadMundosFromAPI();
    
    worldsContainer.innerHTML = `
      <div class="header-actions">
        <h2>Mundos Disponibles</h2>
        <div class="user-info">
          <span>Usuario: ${state.user.username}</span>
          <button onclick="logout()" class="btn btn-small btn-secondary">Logout</button>
        </div>
      </div>
      <div class="worlds-grid">
        ${mundos
          .filter(mundo => canSeeWorld(mundo.id))
          .map(mundo => `
            <div class="world-card" onclick="selectWorld('${mundo.id}')">
              <h3>${mundo.nombre}</h3>
              <p>${mundo.descripcion || ''}</p>
            </div>
          `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error renderizando mundos:', error);
    worldsContainer.innerHTML = '<p>Error cargando mundos</p>';
  }
}

// Función para renderizar sub-mundos
async function renderSubWorlds(mundoId) {
  const subWorldsContainer = $("#subWorldsContainer");
  if (!subWorldsContainer) return;
  
  try {
    const subMundos = await loadSubMundosForMundo(mundoId);
    
    subWorldsContainer.innerHTML = subMundos.map(subMundo => `
      <div class="sub-world-card" onclick="selectSubWorld('${subMundo.id}')">
        <h4>${subMundo.nombre}</h4>
        <p>${subMundo.descripcion || ''}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error renderizando sub-mundos:', error);
    subWorldsContainer.innerHTML = '<p>Error cargando sub-mundos</p>';
  }
}

// Función para renderizar desarrollos
async function renderDesarrollos(subMundoId) {
  const devsContainer = $("#devsContainer");
  if (!devsContainer) return;
  
  try {
    const desarrollos = await loadDesarrollosForSubMundo(subMundoId);
    
    devsContainer.innerHTML = desarrollos.map(desarrollo => `
      <div class="dev-card" onclick="openDev('${desarrollo.url}')">
        <h5>${desarrollo.titulo}</h5>
        <p>${desarrollo.descripcion || ''}</p>
        <div class="tags">
          ${(desarrollo.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error renderizando desarrollos:', error);
    devsContainer.innerHTML = '<p>Error cargando desarrollos</p>';
  }
}

// Función para renderizar admin
async function renderAdmin() {
  const adminContainer = $("#adminContainer");
  if (!adminContainer) return;
  
  try {
    const users = await loadUserListFromAPI();
    
    adminContainer.innerHTML = `
      <div class="admin-header">
        <h2>Panel de Administración</h2>
        <button onclick="openUserForm()" class="btn btn-primary">Nuevo Usuario</button>
      </div>
      <div class="users-list">
        ${users.map(user => `
          <div class="user-card">
            <div class="user-info">
              <h4>${user.username}</h4>
              <p>Rol: ${user.role}</p>
              <p>Permisos: ${user.permittedWorldIds === '*' ? 'Todos' : user.permittedWorldIds.join(', ')}</p>
            </div>
            <div class="user-actions">
              <button onclick="openUserForm('${user.id}')" class="btn btn-small">Editar</button>
              <button onclick="confirmDeleteUser('${user.id}')" class="btn btn-small btn-danger">Eliminar</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error renderizando admin:', error);
    adminContainer.innerHTML = '<p>Error cargando usuarios</p>';
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
      
      try {
        if (isEdit) {
          await updateUserAPI(userId, userData);
        } else {
          await createUserAPI(userData);
        }
        
        modal.hide();
        await renderAdmin();
      } catch (error) {
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
function confirmDelete(itemType, itemId) {
  if (confirm(`¿Está seguro de que desea eliminar este ${itemType}?`)) {
    // Implementar eliminación según el tipo
    console.log(`Eliminando ${itemType} con ID: ${itemId}`);
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
    // Cargar datos desde la API
    state.data = await loadDataFromAPI();
    
    // Configurar permisos por defecto
    await ensureDefaultPermissions(await loadUserListFromAPI(), state.data);
    
    // Si hay usuario en localStorage, validar contra la API
    if (state.user && state.user.username) {
      try {
        // Intentar validar la sesión contra la API
        const users = await loadUserListFromAPI();
        const validUser = users.find(u => u.username === state.user.username);
        
        if (validUser) {
          // Usuario válido, completar datos
          state.user = validUser;
          $("#authSection").classList.remove("active");
          await goWorlds();
        } else {
          // Usuario no válido, limpiar y mostrar login
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
  
  // Conectar botón de login y formulario
  const loginBtn = document.getElementById('doLogin');
  const loginUser = document.getElementById('loginUser');
  const loginPass = document.getElementById('loginPass');
  
  console.log('🔍 Elementos del login encontrados:', { 
    loginBtn: !!loginBtn, 
    loginUser: !!loginUser, 
    loginPass: !!loginPass 
  });
  
  if (loginBtn && loginUser && loginPass) {
    // Función de login
    const performLogin = async () => {
      const username = loginUser.value;
      const password = loginPass.value;
      
      if (!username || !password) {
        showAuthMessage('Por favor ingrese usuario y contraseña', 'error');
        return;
      }
      
      // Mostrar estado de carga
      showAuthMessage('Iniciando sesión...', 'loading');
      loginBtn.disabled = true;
      
      try {
        if (await login(username, password)) {
          showAuthMessage('¡Login exitoso!', 'success');
          setTimeout(async () => {
            await goWorlds();
          }, 500);
        } else {
          showAuthMessage('Usuario o contraseña incorrectos', 'error');
          loginBtn.disabled = false;
        }
      } catch (error) {
        console.error('Error en login:', error);
        showAuthMessage('Error al intentar hacer login', 'error');
        loginBtn.disabled = false;
      }
    };
    
    // Click en botón
    loginBtn.addEventListener('click', performLogin);
    
    // Enter en campos de texto
    loginUser.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performLogin();
    });
    
    loginPass.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') performLogin();
    });
  }

  // Inicializar la aplicación de forma asíncrona
  initializeApp();
})();
