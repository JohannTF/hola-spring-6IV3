/**
 * Página de perfil de usuario - Funcionalidad específica para la página de perfil
 */

import { getUserInfo, updateUserInfo } from '../services/userService.js';
import { logout } from '../services/authService.js';
import { uploadProfileImage, getProfileImage, deleteProfileImage, fileToDataURL, resizeImage } from '../services/profileImageService.js';
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
 * Configura la funcionalidad de imagen de perfil
 */
function setupProfileImage() {
    const profileImage = document.getElementById('profile-image');
    const imageUpload = document.getElementById('image-upload');
    const uploadBtn = document.getElementById('upload-image-btn');
    const deleteBtn = document.getElementById('delete-image-btn');
    const imageWrapper = document.querySelector('.profile-image-wrapper');

    // Cargar imagen de perfil actual
    loadCurrentProfileImage();

    // Event listeners
    if (uploadBtn) {
        uploadBtn.addEventListener('click', () => {
            if (imageUpload) imageUpload.click();
        });
    }

    if (imageWrapper) {
        imageWrapper.addEventListener('click', () => {
            if (imageUpload) imageUpload.click();
        });
    }

    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', handleImageDelete);
    }
}

/**
 * Carga la imagen de perfil actual del usuario
 */
async function loadCurrentProfileImage() {
    try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Decodificar token para obtener username
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub;

        const imageData = await getProfileImage(username);
        if (imageData && imageData.success && imageData.imageData) {
            const profileImage = document.getElementById('profile-image');
            const deleteBtn = document.getElementById('delete-image-btn');
            
            if (profileImage) {
                profileImage.src = imageData.imageData;
                profileImage.classList.remove('default-avatar');
            }
            
            if (deleteBtn) {
                toggleElement(deleteBtn, true);
            }
        }
    } catch (error) {
        // Silently fail - user doesn't have a profile image
        console.log('No profile image found or error loading image:', error.message);
    }
}

/**
 * Maneja la subida de imagen de perfil
 */
async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadBtn = document.getElementById('upload-image-btn');
    const deleteBtn = document.getElementById('delete-image-btn');
    const profileImage = document.getElementById('profile-image');

    try {
        // Mostrar estado de carga
        const originalUploadText = uploadBtn.innerHTML;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subiendo...';
        uploadBtn.disabled = true;

        // Previsualización inmediata
        const previewUrl = await fileToDataURL(file);
        if (profileImage) {
            profileImage.src = previewUrl;
            profileImage.classList.remove('default-avatar');
        }

        // Redimensionar imagen si es necesario
        const resizedImage = await resizeImage(file, 400, 400, 0.8);
        
        // Crear archivo desde blob redimensionado
        const resizedFile = new File([resizedImage], file.name, {
            type: file.type,
            lastModified: Date.now(),
        });

        // Subir imagen
        const response = await uploadProfileImage(resizedFile);
        
        if (response.success) {
            showToast('Imagen de perfil actualizada correctamente', 'success');
            toggleElement(deleteBtn, true);
        } else {
            throw new Error(response.message || 'Error al subir la imagen');
        }

    } catch (error) {
        console.error('Error uploading image:', error);
        showToast(`Error al subir imagen: ${error.message}`, 'error');
        
        // Restaurar imagen por defecto en caso de error
        if (profileImage) {
            profileImage.src = '/images/default-avatar.svg';
            profileImage.classList.add('default-avatar');
        }
        toggleElement(deleteBtn, false);
    } finally {
        // Restaurar estado del botón
        const originalUploadText = '<i class="fas fa-upload"></i> Subir Foto';
        uploadBtn.innerHTML = originalUploadText;
        uploadBtn.disabled = false;
        
        // Limpiar input file
        event.target.value = '';
    }
}

/**
 * Maneja la eliminación de imagen de perfil
 */
async function handleImageDelete() {
    const deleteBtn = document.getElementById('delete-image-btn');
    const profileImage = document.getElementById('profile-image');

    try {
        // Mostrar estado de carga
        const originalDeleteText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
        deleteBtn.disabled = true;

        const response = await deleteProfileImage();
        
        if (response.success) {
            showToast('Imagen de perfil eliminada correctamente', 'success');
            
            // Restaurar imagen por defecto
            if (profileImage) {
                profileImage.src = '/images/default-avatar.svg';
                profileImage.classList.add('default-avatar');
            }
            
            toggleElement(deleteBtn, false);
        } else {
            throw new Error(response.message || 'Error al eliminar la imagen');
        }

    } catch (error) {
        console.error('Error deleting image:', error);
        showToast(`Error al eliminar imagen: ${error.message}`, 'error');
    } finally {
        // Restaurar estado del botón
        const originalDeleteText = '<i class="fas fa-trash"></i> Eliminar';
        deleteBtn.innerHTML = originalDeleteText;
        deleteBtn.disabled = false;
    }
}

/**
 * Configura la página de perfil de usuario
 */
function setupProfilePage() {    // Verificar autenticación
    redirectIfNotAuthenticated();
    
    // Configurar funcionalidad de imagen de perfil
    setupProfileImage();
    
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
