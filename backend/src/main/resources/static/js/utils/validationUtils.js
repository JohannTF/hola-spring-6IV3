/**
 * Módulo de validación - Funciones para validar datos de formularios
 */

/**
 * Valida que un campo no esté vacío
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nombre del campo para el mensaje de error
 * @returns {string|null} - Mensaje de error o null si es válido
 */
function validateRequired(value, fieldName) {
    return value ? null : `El campo ${fieldName} es obligatorio`;
}

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && re.test(email) ? null : 'Email inválido';
}

/**
 * Valida una contraseña (mínimo 6 caracteres)
 * @param {string} password - Contraseña a validar
 * @returns {string|null} - Mensaje de error o null si es válido
 */
function validatePassword(password) {
    return password && password.length >= 6 
        ? null 
        : 'La contraseña debe tener al menos 6 caracteres';
}

/**
 * Valida que dos contraseñas coincidan
 * @param {string} password - Contraseña original
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {string|null} - Mensaje de error o null si es válido
 */
function validatePasswordMatch(password, confirmPassword) {
    return password === confirmPassword
        ? null
        : 'Las contraseñas no coinciden';
}

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean} - true si está autenticado
 */
function isAuthenticated() {
    const token = localStorage.getItem('token');
    // Solo considerar autenticado si el token existe y no está vacío
    return token && token.trim() !== '';
}

/**
 * Redireccionar si no está autenticado
 * @param {string} redirectUrl - URL a la que redireccionar
 */
function redirectIfNotAuthenticated(redirectUrl = '/login') {
    if (!isAuthenticated()) {
        // Limpiar cualquier token inválido antes de redireccionar
        localStorage.removeItem('token');
        window.location.href = redirectUrl;
    }
}

// Exportar funciones
export {
    validateRequired,
    validateEmail,
    validatePassword,
    validatePasswordMatch,
    isAuthenticated,
    redirectIfNotAuthenticated
};
