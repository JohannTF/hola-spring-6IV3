/**
 * Servicio de autenticación - Funciones para gestionar la autenticación de usuarios
 */

import { apiPost } from '../api/api.js';
import { showToast } from '../utils/domUtils.js';

/**
 * Iniciar sesión
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise} - Promesa con el resultado
 */
function login(username, password) {
    return apiPost('/auth/login', { username, password }, false)
        .then(data => {
            if (data && data.token) {
                localStorage.setItem('token', data.token);
                return data;
            } else {
                throw new Error('No se recibió un token válido');
            }
        });
}

/**
 * Registrar un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise} - Promesa con el resultado
 */
function register(userData) {
    console.log('Enviando datos de registro:', userData);
    return apiPost('/auth/register', userData, false);
}

/**
 * Cerrar sesión
 */
function logout() {
    localStorage.removeItem('token');
    showToast('Sesión cerrada correctamente', 'success');
    setTimeout(() => {
        window.location.href = '/login';
    }, 1000);
}

// Exportar funciones
export { login, register, logout };
