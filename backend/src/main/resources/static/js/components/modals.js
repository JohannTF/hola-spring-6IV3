/**
 * Componente de modales - Funciones para manejar ventanas modales
 */

import { showToast, toggleElement } from '../utils/domUtils.js';
import { validateRequired, validatePassword, validateEmail } from '../utils/validationUtils.js';

/**
 * Mostrar un modal por su ID
 * @param {string} modalId - ID del modal a mostrar
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Cerrar un modal por su ID
 * @param {string} modalId - ID del modal a cerrar
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Mostrar el modal para añadir un usuario
 */
function showAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (!modal) return;
    
    // Si el contenido del modal está vacío, inicializarlo
    const modalHeader = modal.querySelector('.modal-header');
    if (!modalHeader.innerHTML) {
        initializeAddUserModal(modal);
    }
    
    showModal('addUserModal');
}

/**
 * Cerrar el modal para añadir un usuario
 */
function closeAddUserModal() {
    closeModal('addUserModal');
    
    // Limpiar el formulario
    const form = document.getElementById('addUserForm');
    if (form) {
        form.reset();
    }
}

/**
 * Inicializar el contenido del modal para añadir usuario
 * @param {HTMLElement} modal - Elemento modal
 */
function initializeAddUserModal(modal) {
    const modalHeader = modal.querySelector('.modal-header');
    const form = modal.querySelector('#addUserForm');
    
    // Configurar encabezado
    modalHeader.innerHTML = `
        <h3>Añadir Nuevo Usuario</h3>
        <span class="close-modal" onclick="closeAddUserModal()">&times;</span>
    `;
    
    // Configurar formulario
    form.innerHTML = `
        <div class="form-group">
            <label for="newUsername">Usuario:</label>
            <input type="text" id="newUsername" name="username" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="newFirstname">Nombre:</label>
                <input type="text" id="newFirstname" name="firstname" required>
            </div>
            <div class="form-group">
                <label for="newLastname">Apellido:</label>
                <input type="text" id="newLastname" name="lastname" required>
            </div>
        </div>
        <div class="form-group">
            <label for="newPassword">Contraseña:</label>
            <div class="password-input-container">
                <input type="password" id="newPassword" name="password" required>
                <i class="fas fa-eye" onclick="toggleNewPasswordVisibility(this)"></i>
            </div>
        </div>
        <div class="form-group">
            <label for="newRoles">Roles (separados por coma):</label>
            <input type="text" id="newRoles" name="roles" value="USER">
        </div>
        <button type="submit" class="btn btn-primary">Registrar Usuario</button>
        <button type="button" class="btn btn-secondary" onclick="closeAddUserModal()">Cancelar</button>
    `;
}

/**
 * Alternar la visibilidad de la contraseña en el formulario de nuevo usuario
 * @param {HTMLElement} icon - Icono que se ha pulsado
 */
function toggleNewPasswordVisibility(icon) {
    const passwordInput = document.getElementById('newPassword');
    if (!passwordInput) return;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

/**
 * Validar formulario de nuevo usuario
 * @param {HTMLFormElement} form - Formulario a validar
 * @returns {Object|null} - Datos del usuario o null si no es válido
 */
function validateAddUserForm(form) {
    const username = form.username.value.trim();
    const firstname = form.firstname.value.trim();
    const lastname = form.lastname.value.trim();
    const password = form.password.value;
    const roles = form.roles.value.split(',').map(role => role.trim());
    
    // Validar campos requeridos
    let error = validateRequired(username, 'Usuario');
    if (error) {
        showToast(error, 'error');
        return null;
    }
    
    error = validateRequired(firstname, 'Nombre');
    if (error) {
        showToast(error, 'error');
        return null;
    }
    
    error = validateRequired(lastname, 'Apellido');
    if (error) {
        showToast(error, 'error');
        return null;
    }
    
    error = validateRequired(password, 'Contraseña');
    if (error) {
        showToast(error, 'error');
        return null;
    }
    
    error = validatePassword(password);
    if (error) {
        showToast(error, 'error');
        return null;
    }
    
    // Datos válidos, retornar objeto de usuario
    return {
        username,
        firstname,
        lastname,
        password,
        roles
    };
}

export { 
    showModal, 
    closeModal, 
    showAddUserModal, 
    closeAddUserModal, 
    toggleNewPasswordVisibility, 
    validateAddUserForm 
};
