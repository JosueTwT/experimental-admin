const SB_URL = "https://ybbaysmlawnwamcbaent.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYmF5c21sYXdud2FtY2JhZW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODM0NDMsImV4cCI6MjA4NjA1OTQ0M30.bgnkSZZB3_mMP_kA5Ut5uWuFlSLydWHCkJG0bl-sywg";
const _supabase = supabase.createClient(SB_URL, SB_KEY);

const CLAVE_MAESTRA = "1234"; 
let idBorrar = null;
let todasLasCanciones = []; // Guardaremos los datos aquí para el buscador

// Notificaciones
function notificar(msg, tipo = 'success') {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = `toast ${tipo}`;
    div.innerHTML = `${tipo === 'success' ? '✅' : '❌'} ${msg}`;
    container.appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

// Login
function entrar() {
    const input = document.getElementById('passInput');
    if (input.value === CLAVE_MAESTRA) {
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        cargarAdmin();
        notificar("Acceso autorizado");
    } else {
        notificar("Clave incorrecta", "error");
        input.value = "";
    }
}

// Cargar datos de Supabase
async function cargarAdmin() {
    const { data: canciones, error } = await _supabase
        .from('canciones')
        .select('*')
        .order('fecha_creacion', { ascending: false });
    
    if (error) {
        notificar("Error al conectar", "error");
        return;
    }

    todasLasCanciones = canciones; // Guardamos copia para el buscador
    renderizarListas(todasLasCanciones);
}

// Dibujar las listas en pantalla
function renderizarListas(listaAMostrar) {
    const pend = document.getElementById('lista-pendientes');
    const apro = document.getElementById('lista-aprobadas');
    pend.innerHTML = ""; apro.innerHTML = "";
    
    let countP = 0; let countA = 0;

    listaAMostrar.forEach(s => {
        const html = `
            <div class="item-row fade-in">
                <span>${s.titulo} <b>(${s.votos_conteo || 0} pts)</b></span>
                <div class="item-actions">
                    ${!s.aprobada ? `<button class="btn-approve" onclick="aprobar('${s.id}')">Aprobar</button>` : ''}
                    <button class="btn-delete" onclick="abrirModal('${s.id}')">🗑</button>
                </div>
            </div>`;
        
        if (s.aprobada) { apro.innerHTML += html; countA++; }
        else { pend.innerHTML += html; countP++; }
    });

    document.getElementById('count-pend').innerText = countP;
    document.getElementById('count-apro').innerText = countA;

    if(countP === 0) pend.innerHTML = '<p class="empty-msg">No hay pendientes</p>';
    if(countA === 0) apro.innerHTML = '<p class="empty-msg">No hay aprobadas</p>';
}

// Lógica del Buscador
function filtrarCanciones() {
    const busqueda = document.getElementById('searchInput').value.toLowerCase();
    const filtradas = todasLasCanciones.filter(c => 
        c.titulo.toLowerCase().includes(busqueda)
    );
    renderizarListas(filtradas);
}

// Aprobar Canción
async function aprobar(id) {
    const { error } = await _supabase.from('canciones').update({ aprobada: true }).eq('id', id);
    if (!error) {
        notificar("Canción aprobada");
        cargarAdmin();
    }
}

// Modal de Borrado
function abrirModal(id) {
    idBorrar = id;
    document.getElementById('modalConfirm').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalConfirm').style.display = 'none';
}

document.getElementById('btnConfirmDelete').onclick = async () => {
    const { error } = await _supabase.from('canciones').delete().eq('id', idBorrar);
    if (!error) {
        notificar("Eliminado correctamente", "success");
        cerrarModal();
        cargarAdmin();
    } else {
        notificar("Error al borrar", "error");
    }
};
