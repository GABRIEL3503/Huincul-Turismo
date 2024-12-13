// Manejo de autenticación
const isAuthenticated = () => {
    return localStorage.getItem('isAuthenticated') === 'true';
};

const showAdminControls = () => {
    const adminControls = document.querySelectorAll('.admin-control');
    adminControls.forEach(control => {
        control.style.display = isAuthenticated() ? 'block' : 'none';
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
                <button onclick="togglePDF()">Ver PDF</button>
                <button onclick="closePopup('infoPopup')">Cerrar</button>
            </div>
        </div>
    </div>
`;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Primero removemos cualquier popup existente para evitar duplicados
    ['adminLoginPopup', 'destinoFormPopup', 'infoPopup', 'addDestinoBtn'].forEach(id => {
        const existingElement = document.getElementById(id);
        if (existingElement) {
            existingElement.remove();
        }
    });

    // Agregamos los popups y el botón de añadir
    const elements = [
        { html: loginPopup, id: 'adminLoginPopup' },
        { html: destinoForm, id: 'destinoFormPopup' },
        { html: infoPopup, id: 'infoPopup' },
        { 
            html: '<button id="addDestinoBtn" class="admin-control add-button" onclick="showNewDestinoForm()">+</button>',
            id: 'addDestinoBtn'
        }
    ];

    // Insertamos cada elemento verificando que no exista previamente
    elements.forEach(element => {
        if (!document.getElementById(element.id)) {
            document.body.insertAdjacentHTML('beforeend', element.html);
        }
    });

    // Configuramos los event listeners una sola vez
    setupEventListeners();
    
    // Actualizamos la interfaz según el estado de autenticación
    showAdminControls();
    createAdminControls();

    // Verificamos si ya estamos autenticados
    if (isAuthenticated()) {
        console.log('Usuario ya autenticado');
        showAdminControls();
    } else {
        console.log('Usuario no autenticado');
        // Ocultamos los controles de admin
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

    try {
        const url = id ? `/api/destinos/${id}` : '/api/destinos';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            body: formData
        });

        if (response.ok) {
            location.reload();
        } else {
            alert('Error al guardar destino');
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const destino = await response.json();
        
        // Formatear la fecha para mostrarla
        const fecha = new Date(destino.fecha).toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('infoTitle').textContent = destino.titulo;
        
        const infoContent = `
            <p class="info-fecha">${fecha}</p>
            ${destino.frase_corta ? `<p class="info-frase">${destino.frase_corta}</p>` : ''}
            <div class="info-details">
                ${destino.estadia ? `
                    <h3>Estadía:</h3>
                    <p>${destino.estadia}</p>
                ` : ''}
                ${destino.transporte ? `
                    <h3>Transporte:</h3>
                    <p>${destino.transporte}</p>
                ` : ''}
                ${destino.alojamiento ? `
                    <h3>Alojamiento:</h3>
                    <p>${destino.alojamiento}</p>
                ` : ''}
                ${destino.regimen_comidas ? `
                    <h3>Régimen de comidas:</h3>
                    <p>${destino.regimen_comidas}</p>
                ` : ''}
            </div>
        `;
        
        document.getElementById('infoContent').innerHTML = infoContent;
        
        const pdfViewer = document.getElementById('pdfViewer');
        if (destino.pdf_url) {
            pdfViewer.src = destino.pdf_url;
            pdfViewer.style.display = 'none'; // Inicialmente oculto
            document.querySelector('.info-buttons').style.display = 'block';
        } else {
            pdfViewer.style.display = 'none';
            document.querySelector('.info-buttons').style.display = 'none';
        }
        
        showPopup('infoPopup');
    } catch (error) {
        console.error('Error al cargar la información:', error);
        alert('No se pudo cargar la información del destino');
    }
}
function togglePDF() {
    const pdfViewer = document.getElementById('pdfViewer');
    pdfViewer.style.display = pdfViewer.style.display === 'none' ? 'block' : 'none';
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