/**
 * Página de perfil de usuario - Funcionalidad específica para la página de perfil
 */

import { getUserInfo, updateUserInfo } from '../services/userService.js';
import { logout } from '../services/authService.js';
import { showToast, toggleElement } from '../utils/domUtils.js';
import { redirectIfNotAuthenticated } from '../utils/validationUtils.js';

/**
 * Alternar la visibilidad de la contraseña
 * @param {HTMLElement} icon - Icono que se ha pulsado
 */
function togglePasswordVisibility(icon) {
    const passwordInput = icon.previousElementSibling;
    if (passwordInput) {
        if (passwordInput.type === 'password') {
            // Al mostrar: si está vacío, mostrar asteriscos simulados
            if (!passwordInput.value.trim()) {
                passwordInput.value = '••••••••'; // Contraseña simulada
                passwordInput.setAttribute('data-simulated', 'true');
            }
            passwordInput.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            // Al ocultar: si es contraseña simulada, limpiar el campo
            if (passwordInput.getAttribute('data-simulated') === 'true') {
                passwordInput.value = '';
                passwordInput.removeAttribute('data-simulated');
            }
            passwordInput.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

/**
 * Configura la página de perfil de usuario
 */
function setupProfilePage() {
    // Verificar autenticación
    redirectIfNotAuthenticated();
    
    // Estado para guardar los datos originales
    let originalUserData = {};

    // Elementos del DOM
    const form = document.getElementById('update-form');
    const inputs = form ? form.querySelectorAll('input') : [];
    const editBtn = document.getElementById('edit-info');
    const saveBtn = document.getElementById('save-changes');
    const cancelBtn = document.getElementById('cancel-changes');
    const loadingContainer = document.getElementById('loading');
    const profileCard = document.querySelector('.profile-card');

    // Por defecto, todos los campos están deshabilitados
    inputs.forEach(input => {
        input.disabled = true;
    });

    // Ocultar botones de guardar y cancelar
    if (saveBtn) toggleElement(saveBtn, false);
    if (cancelBtn) toggleElement(cancelBtn, false);

    // Mostrar animación de carga
    if (loadingContainer) toggleElement(loadingContainer, true, 'flex');

    // Cargar información del usuario
    getUserInfo()
        .then(data => {
            // Ocultar animación de carga
            if (loadingContainer) toggleElement(loadingContainer, false);

            const user = data.usuario;
            originalUserData = { ...user };            
            // Actualizar UI
            const welcomeUsername = document.getElementById('welcome-username');
            const usernameInput = document.getElementById('username-input');
            const firstname = document.getElementById('firstname');
            const lastname = document.getElementById('lastname');
            const country = document.getElementById('country');

            if (welcomeUsername) welcomeUsername.textContent = user.username;
            if (usernameInput) usernameInput.value = user.username;
            if (firstname) firstname.value = user.firstname;
            if (lastname) lastname.value = user.lastname;
            if (country) country.value = user.country || '';

            // Mostrar botón de administración si es admin
            if (user.roles && user.roles.includes('ADMIN')) {
                const adminBtn = document.getElementById('admin-page');
                if (adminBtn) toggleElement(adminBtn, true);
            }
        })
        .catch(error => {
            if (loadingContainer) toggleElement(loadingContainer, false);
            showToast(`Error al cargar información: ${error.message}`, 'error');
        });    
    
    // Manejador para editar información
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // Habilitar TODOS los campos, incluyendo username
            inputs.forEach(input => {
                input.disabled = false;
            });

            // Mostrar contraseña actual (simulada por seguridad) 
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.placeholder = 'Ingrese nueva contraseña o deje en blanco para mantener la actual';
                passwordInput.value = ''; // Limpiar el campo
            }

            // Mostrar botones de guardar y cancelar
            toggleElement(saveBtn, true);
            toggleElement(cancelBtn, true);

            // Ocultar botón de editar
            toggleElement(editBtn, false);
        });
    }    
    // Manejador para cancelar la edición
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            // Deshabilitar campos
            inputs.forEach(input => {
                input.disabled = true;
            });

            // Restaurar valores originales para TODOS los campos
            const usernameInput = document.getElementById('username-input');
            const firstname = document.getElementById('firstname');
            const lastname = document.getElementById('lastname');
            const country = document.getElementById('country');
            const password = document.getElementById('password');
            
            if (usernameInput) usernameInput.value = originalUserData.username || '';
            if (firstname) firstname.value = originalUserData.firstname || '';
            if (lastname) lastname.value = originalUserData.lastname || '';
            if (country) country.value = originalUserData.country || '';
            if (password) {
                password.value = ''; // Clear password field
                password.type = 'password'; // Ensure it's hidden
                password.removeAttribute('data-simulated'); // Remove simulation flag
                
                // Reset eye icon
                const eyeIcon = password.parentNode.querySelector('i');
                if (eyeIcon) {
                    eyeIcon.classList.remove('fa-eye-slash');
                    eyeIcon.classList.add('fa-eye');
                }
            }

            // Ocultar botones de guardar y cancelar
            toggleElement(saveBtn, false);
            toggleElement(cancelBtn, false);

            // Mostrar botón de editar
            toggleElement(editBtn, true);
        });
    }
    // Manejador para enviar el formulario
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Recoger datos de todos los campos
            const usernameInput = document.getElementById('username-input');
            const firstnameInput = document.getElementById('firstname');
            const lastnameInput = document.getElementById('lastname');
            const countryInput = document.getElementById('country');
            const passwordInput = document.getElementById('password');
            const username = usernameInput ? usernameInput.value.trim() : '';
            const firstname = firstnameInput ? firstnameInput.value.trim() : '';
            const lastname = lastnameInput ? lastnameInput.value.trim() : '';
            const country = countryInput ? countryInput.value.trim() : '';
            let password = passwordInput ? passwordInput.value.trim() : '';

            // No enviar contraseña simulada
            if (passwordInput && passwordInput.getAttribute('data-simulated') === 'true') {
                password = '';
            }

            // Si la contraseña son solo asteriscos, considerarla como vacía
            if (password === '••••••••' || password === '********') {
                password = '';
            }

            // Validation
            if (!username || !firstname || !lastname) {
                showToast('Por favor complete los campos obligatorios (usuario, nombre, apellido)', 'error');
                return;
            }

            const userData = {
                username,
                firstname,
                lastname,
                country,
                password: password || null // Send null if password is empty (keep current password)
            };

            // Show loading state
            const originalSaveText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            saveBtn.disabled = true;
            cancelBtn.disabled = true;

            // Actualizar usuario
            updateUserInfo(userData)
                .then((response) => {
                    showToast('Información actualizada correctamente', 'success');

                    // Update original data with new values
                    originalUserData = { ...originalUserData, username, firstname, lastname, country };

                    // Update welcome message if username changed
                    const welcomeUsername = document.getElementById('welcome-username');
                    if (welcomeUsername) welcomeUsername.textContent = username;

                    // Handle token update if username was changed
                    if (response && response.token) {
                        localStorage.setItem('token', response.token);
                        showToast('Sesión actualizada correctamente.', 'info');
                    }

                    // Clear password field for security
                    if (passwordInput) passwordInput.value = '';

                    // Deshabilitar campos
                    inputs.forEach(input => {
                        input.disabled = true;
                    });

                    // Restore buttons
                    saveBtn.innerHTML = originalSaveText;
                    saveBtn.disabled = false;
                    cancelBtn.disabled = false;

                    // Ocultar botones de guardar y cancelar
                    toggleElement(saveBtn, false);
                    toggleElement(cancelBtn, false);

                    // Mostrar botón de editar
                    toggleElement(editBtn, true);
                })
                .catch(error => {
                    console.error('Update error:', error);
                    
                    // Handle specific error cases
                    let errorMessage = 'Error al actualizar: ';
                    if (error.message && error.message.includes('ya está en uso')) {
                        errorMessage += 'El nombre de usuario ya está en uso';
                    } else if (error.message && error.message.includes('token')) {
                        errorMessage += 'Error de autenticación. Por favor, inicie sesión nuevamente';
                    } else {
                        errorMessage += error.message || 'Error de comunicación con el servidor';
                    }
                    
                    showToast(errorMessage, 'error');

                    // Restore buttons
                    saveBtn.innerHTML = originalSaveText;
                    saveBtn.disabled = false;
                    cancelBtn.disabled = false;
                });
        });
    }

    // Configurar botón de administración
    const adminBtn = document.getElementById('admin-page');
    if (adminBtn) {
        adminBtn.addEventListener('click', function() {
            window.location.href = '/admin/all-users';
        });
    }
}

export { setupProfilePage, togglePasswordVisibility };

// Make togglePasswordVisibility available globally for onclick attributes
window.togglePasswordVisibility = togglePasswordVisibility;
