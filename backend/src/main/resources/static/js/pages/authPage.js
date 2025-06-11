/**
 * Página de autenticación - Funcionalidad para login y registro
 */

import { login, register } from '../services/authService.js';
import { showToast, toggleElement } from '../utils/domUtils.js';
import { validateRequired, validatePassword, validateEmail } from '../utils/validationUtils.js';

/**
 * Configurar el formulario de inicio de sesión
 */
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    const errorMsg = document.getElementById('errorMessage');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            
            // Validar campos
            let error = validateRequired(username, 'Usuario');
            if (error) {
                showFormError(errorMsg, error);
                return;
            }
            
            error = validateRequired(password, 'Contraseña');
            if (error) {
                showFormError(errorMsg, error);
                return;
            }
            
            // Ocultar mensaje de error si existe
            toggleElement(errorMsg, false);
            
            // Mostrar indicador de carga
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
            submitBtn.disabled = true;
            
            // Intentar login
            login(username, password)
                .then(() => {
                    showToast('Inicio de sesión exitoso', 'success');
                    setTimeout(() => {
                        window.location.href = '/inicio';
                    }, 500);
                })
                .catch(error => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    showFormError(errorMsg, 'Error de autenticación: ' + error.message);
                });
        });
    }
}

/**
 * Configurar el formulario de registro
 */
function setupRegisterForm() {
    const form = document.getElementById('registerForm');
    const errorMsg = document.getElementById('errorMessage');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
              const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const firstName = document.getElementById('firstname').value.trim();
            const lastName = document.getElementById('lastname').value.trim();
            const country = document.getElementById('country')?.value;
            
            // Validar campos
            let error = validateRequired(username, 'Usuario');
            if (error) {
                showFormError(errorMsg, error);
                return;
            }
            
            error = validateRequired(firstName, 'Nombre');
            if (error) {
                showFormError(errorMsg, error);
                return;
            }
            
            error = validateRequired(lastName, 'Apellido');
            if (error) {
                showFormError(errorMsg, error);
                return;
            }
            
            error = validatePassword(password);
            if (error) {
                showFormError(errorMsg, error);
                return;
            }
            
            // Ocultar mensaje de error si existe
            toggleElement(errorMsg, false);
            
            // Mostrar indicador de carga
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
            submitBtn.disabled = true;
            
            // Datos del usuario para el registro
            const userData = {
                username,
                password,
                firstName,
                lastName,
                country,
                role: "USER"
            };
            
            // Intentar registro
            register(userData)
                .then(() => {
                    showToast('Registro exitoso', 'success');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                })
                .catch(error => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    showFormError(errorMsg, 'Error en el registro: ' + error.message);
                });
        });
    }
}

/**
 * Mostrar un error en el formulario
 * @param {HTMLElement} errorElement - Elemento donde mostrar el error
 * @param {string} message - Mensaje de error
 */
function showFormError(errorElement, message) {
    if (errorElement) {
        errorElement.textContent = message;
        toggleElement(errorElement, true);
        
        // Efecto de shake en el error
        errorElement.classList.add('shake');
        setTimeout(() => {
            errorElement.classList.remove('shake');
        }, 500);
    } else {
        showToast(message, 'error');
    }
}

export { setupLoginForm, setupRegisterForm };
