// Manejo de autenticación
const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

const showAdminControls = () => {
    const adminControls = document.querySelectorAll('.admin-control');
    adminControls.forEach(control => {
        control.style.display = isAuthenticated() ? 'flex' : 'none';
    });
};

// Templates HTML
const loginPopup = `
    <div id="adminLoginPopup" class="popup">
        <div class="popup-content">
            <h2>Iniciar Sesión</h2>
            <form id="adminLoginForm">
                <input type="password" id="adminPassword" placeholder="Contraseña" required>
                <button type="submit">Ingresar</button>
                <button type="button" onclick="closePopup('adminLoginPopup')">Cancelar</button>
            </form>
        </div>
    </div>
`;

const destinoForm = `
    <div id="destinoFormPopup" class="popup">
        <div class="popup-content">
            <h2>Gestionar Destino</h2>
            <form id="destinoForm" enctype="multipart/form-data">
                <input type="text" name="titulo" placeholder="Título" required>
                <input type="date" name="fecha" required>
                <div class="file-inputs">
                    <label>Imagen: <input type="file" name="imagen" accept="image/*"></label>
                    <label>PDF: <input type="file" name="pdf" accept="application/pdf"></label>
                </div>
                <textarea name="frase_corta" placeholder="Frase corta"></textarea>
                <textarea name="estadia" placeholder="Estadía"></textarea>
                <textarea name="transporte" placeholder="Transporte"></textarea>
                <textarea name="alojamiento" placeholder="Alojamiento"></textarea>
                <textarea name="regimen_comidas" placeholder="Régimen de comidas"></textarea>
                <div class="form-buttons">
                    <button type="submit">Guardar</button>
                    <button type="button" onclick="closePopup('destinoFormPopup')">Cancelar</button>
                </div>
            </form>
        </div>
    </div>
`;

const infoPopup = `
    <div id="infoPopup" class="popup">
        <div class="popup-content">
            <h2 id="infoTitle"></h2>
            <div id="infoContent"></div>
            <iframe id="pdfViewer" style="width: 100%; height: 500px; display: none;"></iframe>
            <div class="info-buttons">
<button id="openPdfBtn" style="display: none;">Ver PDF</button>
                <button onclick="closePopup('infoPopup')">Cerrar</button>
            </div>
        </div>
    </div>
`;
document.addEventListener('DOMContentLoaded', () => {
    // Eliminar elementos duplicados si ya existen
    ['adminLoginPopup', 'destinoFormPopup', 'infoPopup', 'addDestinoBtn'].forEach(id => {
        const existingElement = document.getElementById(id);
        if (existingElement) {
            existingElement.remove();
        }
    });

    // Insertar el botón "Agregar Destino" dentro de un span en la sección "Destinos"
    const destinoTitle = document.querySelector('h2.destinos');
    if (destinoTitle) {
        // Crear un span con clase btn-agregar y agregar el botón dentro
        const spanContainer = document.createElement('span');
        spanContainer.className = 'btn-agregar';
        spanContainer.innerHTML = `
            <button id="addDestinoBtn" class="admin-control add-button" onclick="showNewDestinoForm()">Agregar Destino</button>
        `;
        
        // Insertar el span después del h2 "Destinos"
        destinoTitle.insertAdjacentElement('afterend', spanContainer);
    }

    // Insertar popups
    const elements = [
        { html: loginPopup, id: 'adminLoginPopup' },
        { html: destinoForm, id: 'destinoFormPopup' },
        { html: infoPopup, id: 'infoPopup' }
    ];

    elements.forEach(element => {
        if (!document.getElementById(element.id)) {
            document.body.insertAdjacentHTML('beforeend', element.html);
        }
    });

    // Configurar eventos y autenticación
    setupEventListeners();
    showAdminControls();
    createAdminControls();
    if (isAuthenticated()) {
        console.log('Usuario autenticado');
        showAdminControls();
    } else {
        console.log('Usuario no autenticado');
        document.querySelectorAll('.admin-control').forEach(control => {
            control.style.display = 'none';
        });
    }
    loadDestinos();
});



// Eliminar la segunda definición de setupEventListeners y modificar la primera:
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm && !loginForm.hasListener) {
        loginForm.addEventListener('submit', handleLogin);
        loginForm.hasListener = true;
    }

    // Destino form
    const destinoForm = document.getElementById('destinoForm');
    if (destinoForm && !destinoForm.hasListener) {
        destinoForm.addEventListener('submit', handleDestinoSubmit);
        destinoForm.hasListener = true;
    }

    // Login button en la navbar
    const loginButton = document.querySelector('[data-action="admin-login"]');
    if (loginButton && !loginButton.hasListener) {
        loginButton.addEventListener('click', () => showPopup('adminLoginPopup'));
        loginButton.hasListener = true;
    }
}
// Manejo de login
async function handleLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            credentials: 'include', // Incluir cookies de sesión
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        if (data.success) {
            localStorage.setItem('isAuthenticated', 'true');
            closePopup('adminLoginPopup');
            showAdminControls();
            loadDestinos(); // Recargar los destinos para mostrar los controles de admin
        } else {
            alert('Contraseña incorrecta');
        }
    } catch (error) {
        alert('Error al iniciar sesión');
    }
}
// Manejo de formulario de destino
async function handleDestinoSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const id = form.dataset.id;

    // 1️⃣ Verificar autenticación antes de enviar
    const authResponse = await fetch('/api/check-auth');
    const authData = await authResponse.json();
    if (!authData.authenticated) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return;
    }

    try {
        const url = id ? `/api/destinos/${id}` : '/api/destinos';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            credentials: 'include', // Asegurar envío de cookies de sesión
            body: formData
        });

        if (response.ok) {
            location.reload();
        } else {
            const errorText = await response.text();
            alert(`Error al guardar destino: ${errorText}`);
        }
    } catch (error) {
        alert('Error al procesar la solicitud');
    }
}


// Funciones de UI
function showNewDestinoForm() {
    const form = document.getElementById('destinoForm');
    form.reset();
    delete form.dataset.id;
    showPopup('destinoFormPopup');
}

function createAdminControls() {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        const adminButtons = document.createElement('div');
        adminButtons.className = 'admin-control';
        adminButtons.innerHTML = `
            <button onclick="editDestino(this)" class="edit-btn">Editar</button>
            <button onclick="deleteDestino(this)" class="delete-btn">Eliminar</button>
        `;
        card.appendChild(adminButtons);
    });
}

// Manejo de popups
function closePopup(popupId) {
    document.getElementById(popupId).style.display = 'none';
    if (popupId === 'infoPopup') {
        document.getElementById('pdfViewer').style.display = 'none';
    }
}

function showPopup(popupId) {
    document.getElementById(popupId).style.display = 'flex';
}

// Funciones CRUD
async function editDestino(button) {
    const card = button.closest('.card');
    const id = card.dataset.id;
    
    try {
        const response = await fetch(`/api/destinos/${id}`);
        const destino = await response.json();
        
        const form = document.getElementById('destinoForm');
        Object.keys(destino).forEach(key => {
            if (form[key]) {
                form[key].value = destino[key] || '';
            }
        });
        
        form.dataset.id = id;
        showPopup('destinoFormPopup');
    } catch (error) {
        alert('Error al cargar destino');
    }
}

async function deleteDestino(button) {
    if (!confirm('¿Estás seguro de que quieres eliminar este destino?')) return;
    
    const card = button.closest('.card');
    const id = card.dataset.id;
    
    try {
        const response = await fetch(`/api/destinos/${id}`, {
            method: 'DELETE',
            credentials: 'include', // Incluir cookies de sesión
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            card.remove();
        } else if (response.status === 401) {
            alert('Sesión expirada. Por favor, inicie sesión nuevamente.');
            localStorage.removeItem('isAuthenticated');
            showAdminControls();
        } else {
            alert('Error al eliminar destino');
        }
    } catch (error) {
        alert('Error al eliminar destino');
    }
}
async function showDestinInfo(button) {
    const card = button.closest('.card');
    const id = card.dataset.id;

    try {
        const response = await fetch(`/api/destinos/${id}`);
        const destino = await response.json();

        document.getElementById('infoTitle').innerHTML = `
            <button class="close-popup" onclick="closePopup('infoPopup')">
                <box-icon name="x" color="#ff4d4d" width="80" height="80"></box-icon>
            </button>
            ${destino.titulo}
        `;

        document.getElementById('infoContent').innerHTML = `
            <div class="flip-card-back">
                <span id="texto" class="texto">
                    <h4>${destino.frase_corta || '¡Experiencia inolvidable asegurada!'}</h4>
                    
                    <p><box-icon class="icon-tarj" type="solid" name="calendar" color="#4EB3D3"></box-icon> 
                    <br> <strong>Fecha:</strong> ${destino.fecha}</p>

                    <p><box-icon class="icon-tarj" name="hotel" type="solid" color="#4EB3D3"></box-icon> 
                    <br><strong>Estadía:</strong> ${destino.estadia || 'No especificado'}</p>

                    <p><box-icon class="icon-tarj" name="bus" color="#4EB3D3"></box-icon> 
                    <br> <strong>Transporte:</strong> ${destino.transporte || 'No especificado'}</p>

                    <p><box-icon class="icon-tarj" name="restaurant" color="#4EB3D3"></box-icon>
                    <br> <strong>Régimen de comidas:</strong> ${destino.regimen_comidas || 'No especificado'}</p>

                    <p><strong>Descripción:</strong> ${destino.descripcion || 'No disponible'}</p>

                    <div id="pdfContainer" style="display: none;">
                        <button id="openPdfBtn" class="btn-pdf">Ver PDF</button>
                    </div>

                    <div class="contenedor-social-links">
                        <div>
                            <a href="https://api.whatsapp.com/send?phone=5492995657308&text=Hola!%20Estoy%20interesado%20en%20el%20paquete%20de%20${encodeURIComponent(destino.titulo)}" 
                               target="_blank" style="font-size: 18px;">
                                <button class="social-links">
                                    Solicitar más Info
                                    <span>
                                        <img src="img/whatsapp.png" alt="">
                                    </span>
                                </button>
                            </a>
                        </div>
                    </div>
                </span>
            </div>
        `;

        // Mostrar botón "Ver PDF" si hay un PDF disponible
        const pdfContainer = document.getElementById('pdfContainer');
        const openPdfButton = document.getElementById('openPdfBtn');

        if (destino.pdf_url) {
            pdfContainer.style.display = 'block';
            openPdfButton.onclick = function() {
                window.open(destino.pdf_url, '_blank');
            };
        } else {
            pdfContainer.style.display = 'none';
        }

        showPopup('infoPopup');
    } catch (error) {
        console.error("❌ Error al obtener los datos del destino:", error);
        alert('No se pudo cargar la información del destino.');
    }
}





function togglePDF() {
    const pdfViewer = document.getElementById('pdfViewer');

    if (!pdfViewer.src || pdfViewer.src === window.location.href) {
        alert("⚠️ No hay un PDF disponible para mostrar.");
        return;
    }

    if (pdfViewer.style.display === 'none' || pdfViewer.style.display === '') {
        pdfViewer.style.display = 'block';
    } else {
        pdfViewer.style.display = 'none';
    }
}


// Agregar esta función al inicio del archivo admin.js
// Modificar la generación de cards en loadDestinos
async function loadDestinos() {
    try {
        const response = await fetch('/api/destinos');
        const destinos = await response.json();
        
        const containerCard = document.querySelector('.container-card');
        containerCard.innerHTML = ''; 
        
        destinos.forEach(destino => {
            // Formatear la fecha para mostrarla como texto
            const fecha = new Date(destino.fecha).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long'
            }).toUpperCase();
            
            const cardHTML = `
                <div class="card" data-id="${destino.id}" aos="fade-up" aos-duration="1500">
                    <img src="${destino.imagen_url}" alt="${destino.titulo}">
                    <div class="admin-control">
                        <button onclick="editDestino(this)" class="edit-btn">Editar</button>
                        <button onclick="deleteDestino(this)" class="delete-btn">Eliminar</button>
                    </div>
                    <div class="card-content">
                        <h3>${destino.titulo}</h3>
                        <p>${fecha}</p>
                        <button class="boton-card btn-get-started scrollto butcard" onclick="showDestinInfo(this)">MAS INFO</button>
                    </div>
                </div>
            `;
            
            containerCard.insertAdjacentHTML('beforeend', cardHTML);
        });

        showAdminControls();

    } catch (error) {
        console.error('Error al cargar destinos:', error);
    }
}