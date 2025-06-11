/**
 * Módulo de utilidades DOM - Funciones auxiliares para manipular el DOM
 */

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación: 'success', 'error', 'default'
 * @param {number} duration - Duración en milisegundos
 */
function showToast(message, type = 'default', duration = 3000) {
    // Eliminar toast existente si lo hay
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Forzar un reflow para que la transición funcione
    toast.offsetHeight;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300); // Tiempo para la transición de desaparición
    }, duration);
}

/**
 * Función para mostrar/ocultar un elemento del DOM
 * @param {HTMLElement} element - Elemento a mostrar u ocultar
 * @param {boolean} show - true para mostrar, false para ocultar
 * @param {string} displayType - Tipo de display a usar
 */
function toggleElement(element, show, displayType = 'block') {
    if (!element) return;
    element.style.display = show ? displayType : 'none';
}

/**
 * Crear un elemento de carga
 * @param {string} message - Mensaje a mostrar junto al spinner
 * @returns {HTMLElement} - Elemento de carga
 */
function createLoadingElement(message = 'Cargando...') {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-container';
    loadingElement.style.display = 'flex';
    loadingElement.style.justifyContent = 'center';
    loadingElement.style.alignItems = 'center';
    loadingElement.style.flexDirection = 'column';
    loadingElement.style.padding = '20px';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner-container';
    
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.marginTop = '10px';
    
    loadingElement.appendChild(spinner);
    loadingElement.appendChild(messageElement);
    
    return loadingElement;
}

/**
 * Alterna la visibilidad de la contraseña
 * @param {HTMLElement} icon - Icono que se ha pulsado
 * @param {HTMLElement} passwordElement - Elemento que contiene la contraseña
 */
function togglePasswordVisibility(icon, passwordElement) {
    if (passwordElement.tagName === 'INPUT') {
        // Para inputs de contraseña
        if (passwordElement.type === 'password') {
            passwordElement.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordElement.type = 'password';
            icon.className = 'fas fa-eye';
        }
    } else {
        // Para spans con contraseña ofuscada
        const passwordContainer = icon.closest('.password-container');
        const passwordSpan = passwordContainer.querySelector('span');
        
        if (passwordSpan.textContent === '********') {
            // Lógica para mostrar la contraseña real (debe implementarse)
            icon.className = 'fas fa-eye-slash';
        } else {
            passwordSpan.textContent = '********';
            icon.className = 'fas fa-eye';
        }
    }
}

// Exportar funciones
export { showToast, toggleElement, createLoadingElement, togglePasswordVisibility };
