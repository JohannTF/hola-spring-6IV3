/**
 * Página de administración - Funcionalidad específica para la página de administración
 */

import { getAllUsers } from '../services/adminService.js';
import { renderUserTable } from '../components/userTable.js';
import { showToast } from '../utils/domUtils.js';
import { redirectIfNotAuthenticated } from '../utils/validationUtils.js';
import { redirectIfNotAdmin, isUserAdmin, getUserInfoFromToken } from '../utils/authUtils.js';
import { 
    showAddUserModal, 
    closeAddUserModal, 
    validateAddUserForm 
} from '../components/modals.js';

/**
 * Configurar página de administración de usuarios
 */
function setupAdminPage() {
    // Verificar autenticación
    redirectIfNotAuthenticated();

    // Log información del usuario para depuración
    const userInfo = getUserInfoFromToken();

    // Verificar si el usuario es administrador usando el token
    if (!isUserAdmin()) {
        showToast('No tienes permisos para acceder a esta página', 'error');
        setTimeout(() => {
            window.location.href = '/inicio';
        }, 2000);
        return;
    }

    // Cargar la tabla de usuarios
    loadUsersTable();
    
    // Configurar formulario de registro
    setupAddUserForm();
    
    // Añadir event listeners y funciones para el modal y operaciones globales
    window.showAddUserModal = showAddUserModal;
    window.closeAddUserModal = closeAddUserModal;
    window.loadUsersTable = loadUsersTable;
}

/**
 * Cargar tabla de usuarios
 */
function loadUsersTable() {
    const table = document.getElementById('users-table');
    if (!table) return;
    
    // Añadir spinner de carga
    const loadingRow = document.createElement('tr');
    const loadingCell = document.createElement('td');
    loadingCell.colSpan = 7; // Ajustar según el número de columnas
    loadingCell.style.textAlign = 'center';
    loadingCell.innerHTML = '<div class="loading-spinner-container"></div><p>Cargando usuarios...</p>';
    
    const tbody = table.querySelector('tbody') || table.appendChild(document.createElement('tbody'));
    tbody.innerHTML = '';
    tbody.appendChild(loadingRow);
    loadingRow.appendChild(loadingCell);
    
    // Cargar usuarios
    getAllUsers()
        .then(data => {
            tbody.innerHTML = '';
            if (data && Array.isArray(data)) {
                renderUserTable(data, table);
            } else {
                showToast('Error al cargar usuarios: formato de datos incorrecto', 'error');
            }
        })
        .catch(error => {
            tbody.innerHTML = '';
            showToast(`Error al cargar usuarios: ${error.message}`, 'error');
            
            // Mostrar mensaje de error en la tabla
            const errorRow = document.createElement('tr');
            const errorCell = document.createElement('td');
            errorCell.colSpan = 7;
            errorCell.style.textAlign = 'center';
            errorCell.innerHTML = `<p style="color:red">Error al cargar usuarios. <button onclick="loadUsersTable()">Reintentar</button></p>`;
            tbody.appendChild(errorRow);
            errorRow.appendChild(errorCell);
        });
}

/**
 * Registrar un nuevo usuario desde el panel de administración
 * @param {Event} event - Evento de submit
 */
function registerUserFromAdmin(event) {
    event.preventDefault();
    
    const form = event.target;
    const userData = validateAddUserForm(form);
    
    if (!userData) return;
    
    import('../services/adminService.js').then(({ registerUserByAdmin }) => {
        registerUserByAdmin(userData)
            .then(() => {
                showToast('Usuario registrado con éxito', 'success');
                closeAddUserModal();
                loadUsersTable(); // Recargar la tabla
            })
            .catch(error => {
                showToast(`Error al registrar usuario: ${error.message}`, 'error');
            });
    });
}

/**
 * Configurar el formulario de añadir usuario
 */
function setupAddUserForm() {
    const form = document.getElementById('addUserForm');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Capturar los datos del formulario
            const userData = {
                username: document.getElementById('newUsername').value.trim(),
                firstname: document.getElementById('newFirstName').value.trim(),
                lastname: document.getElementById('newLastName').value.trim(),
                country: document.getElementById('newCountry').value.trim(),
                password: document.getElementById('newPassword').value,
                role: document.getElementById('newRole').value
            };
            
            // Validar datos básicos
            if (!userData.username || !userData.firstname || !userData.lastname || !userData.password) {
                showToast('Todos los campos son obligatorios', 'error');
                return;
            }
            
            // Mostrar indicador de carga en el botón
            const submitBtn = form.querySelector('.submit-button');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            submitBtn.disabled = true;
            
            // Registrar el usuario
            import('../services/adminService.js').then(({ registerUserByAdmin }) => {
                registerUserByAdmin(userData)
                    .then(() => {
                        showToast('Usuario registrado con éxito', 'success');
                        closeAddUserModal();
                        loadUsersTable(); // Recargar la tabla
                    })
                    .catch(error => {
                        console.error('Error al registrar:', error);
                        showToast(`Error al registrar usuario: ${error.message || 'Error desconocido'}`, 'error');
                        // Restaurar estado del botón
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    });
            });
        });
    }
    
    // Hacer disponible la función de toggle password para el modal
    window.toggleNewPasswordVisibility = function(icon) {
        const passwordInput = document.getElementById('newPassword');
        if (passwordInput) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
            }
        }
    };
}

export { setupAdminPage };
