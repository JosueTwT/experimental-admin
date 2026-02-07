const SB_URL = "https://ybbaysmlawnwamcbaent.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYmF5c21sYXdud2FtY2JhZW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODM0NDMsImV4cCI6MjA4NjA1OTQ0M30.bgnkSZZB3_mMP_kA5Ut5uWuFlSLydWHCkJG0bl-sywg";
const _supabase = supabase.createClient(SB_URL, SB_KEY);
const CLAVE = "LOGANTUNER"; 
let idBorrar = null;

function notificar(msg, tipo = 'success') {
    const div = document.createElement('div');
    div.className = `toast ${tipo}`;
    div.innerHTML = `<span>${tipo==='success'?'✅':'❌'}</span> ${msg}`;
    document.getElementById('toast-container').appendChild(div);
    setTimeout(() => div.remove(), 3000);
}

function entrar() {
    if (document.getElementById('passInput').value === CLAVE) {
        document.getElementById('auth-box').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        cargarAdmin();
        notificar("Bienvenido Admin", "success");
    } else {
        notificar("Contraseña Incorrecta", "error");
    }
}

async function cargarAdmin() {
    const { data: canciones } = await _supabase.from('canciones').select('*').order('fecha_creacion', { ascending: false });
    
    const pend = document.getElementById('lista-pendientes');
    const apro = document.getElementById('lista-aprobadas');
    pend.innerHTML = ""; apro.innerHTML = "";
    
    let countP = 0;
    let countA = 0;

    canciones.forEach(s => {
        const html = `
            <div class="item-row">
                <span>${s.titulo} <b>(${s.votos_conteo || 0})</b></span>
                <div class="item-actions">
                    ${!s.aprobada ? `<button class="btn-approve" onclick="aprobar('${s.id}')">✓</button>` : ''}
                    <button class="btn-delete" onclick="abrirModal('${s.id}')">🗑</button>
                </div>
            </div>`;
        
        if (s.aprobada) { apro.innerHTML += html; countA++; }
        else { pend.innerHTML += html; countP++; }
    });

    document.getElementById('count-pend').innerText = countP;
    document.getElementById('count-apro').innerText = countA;
}

async function aprobar(id) {
    await _supabase.from('canciones').update({ aprobada: true }).eq('id', id);
    notificar("Canción Aprobada");
    cargarAdmin();
}

function abrirModal(id) { idBorrar = id; document.getElementById('modalConfirm').style.display = 'flex'; }
function cerrarModal() { document.getElementById('modalConfirm').style.display = 'none'; }

document.getElementById('btnConfirmDelete').onclick = async () => {
    await _supabase.from('canciones').delete().eq('id', idBorrar);
    notificar("Canción Eliminada", "error");
    cerrarModal();
    cargarAdmin();

};
