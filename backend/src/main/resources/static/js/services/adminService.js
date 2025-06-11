/**
 * Servicio de administración - Funciones para gestionar usuarios como administrador
 */

import { apiGet, apiPut, apiDelete, apiPost } from '../api/api.js';

/**
 * Obtener lista de todos los usuarios
 * @returns {Promise} - Promesa con la lista de usuarios
 */
function getAllUsers() {
    return apiGet('/api/admin/all-info');
}

/**
 * Actualizar un usuario como administrador
 * @param {string} username - Nombre de usuario a actualizar
 * @param {Object} userData - Datos actualizados
 * @returns {Promise} - Promesa con el resultado
 */
function updateUserByAdmin(username, userData) {
    return apiPut(`/api/admin/update/${username}`, userData);
}

/**
 * Eliminar un usuario
 * @param {string} username - Nombre de usuario a eliminar
 * @returns {Promise} - Promesa con el resultado
 */
function deleteUserByAdmin(username) {
    return apiDelete(`/api/admin/delete/${username}`);
}

/**
 * Registrar un nuevo usuario desde administración
 * @param {Object} userData - Datos del nuevo usuario
 * @returns {Promise} - Promesa con el resultado
 */
function registerUserByAdmin(userData) {
    // Convertimos los datos al formato esperado por el backend
    const registerData = {
        username: userData.username,
        password: userData.password,
        firstName: userData.firstname,
        lastName: userData.lastname,
        country: userData.country,
        role: userData.role
    };
    return apiPost('/auth/register', registerData);
}

// Exportar funciones
export { getAllUsers, updateUserByAdmin, deleteUserByAdmin, registerUserByAdmin };
