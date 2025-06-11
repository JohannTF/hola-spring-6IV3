/**
 * Servicio de usuarios - Funciones para gestionar usuarios
 */

import { apiGet, apiPut } from '../api/api.js';

/**
 * Obtener información del usuario actual
 * @returns {Promise} - Promesa con la información
 */
function getUserInfo() {
    return apiGet('/api/info');
}

/**
 * Actualizar información del usuario
 * @param {Object} userData - Datos actualizados del usuario
 * @returns {Promise} - Promesa con el resultado
 */
function updateUserInfo(userData) {
    return apiPut('/api/update', userData);
}

/**
 * Verificar si el usuario es administrador
 * @returns {Promise<boolean>} - Promesa que resuelve a true si es admin
 */
async function isAdmin() {
    try {
        const data = await getUserInfo();
        console.log('Datos de usuario recibidos:', data); // Log para depurar
        
        if (!data) return false;
        
        // Verificar todas las posibles estructuras donde podría venir el rol
        let isAdminUser = false;
        
        if (data.usuario) {
            // Verificar si tiene role como propiedad directa
            if (data.usuario.role && 
                (data.usuario.role === 'ROLE_ADMIN' || 
                 data.usuario.role.name === 'ROLE_ADMIN' || 
                 data.usuario.role.includes('ADMIN'))) {
                isAdminUser = true;
            }
            
            // Verificar si tiene roles como array
            if (data.usuario.roles && Array.isArray(data.usuario.roles)) {
                if (data.usuario.roles.some(role => typeof role === 'string' ? 
                    role.toLowerCase().includes('admin') : 
                    (role.name && role.name.toLowerCase().includes('admin')))) {
                    isAdminUser = true;
                }
            }
            
            // Verificar authorities (usado por Spring Security)
            if (data.usuario.authorities && Array.isArray(data.usuario.authorities)) {
                if (data.usuario.authorities.some(auth => 
                    (auth.authority && auth.authority.toLowerCase().includes('admin')) || 
                    (typeof auth === 'string' && auth.toLowerCase().includes('admin')))) {
                    isAdminUser = true;
                }
            }
        }
        
        // Verificar en los claims del token
        if (data.claims && data.claims.roles) {
            const roles = Array.isArray(data.claims.roles) ? data.claims.roles : [data.claims.roles];
            if (roles.some(role => typeof role === 'string' && role.toLowerCase().includes('admin'))) {
                isAdminUser = true;
            }
        }
        
        console.log('¿Es usuario admin?', isAdminUser);
        return isAdminUser;
    } catch (error) {
        console.error('Error al verificar rol de admin:', error);
        return false;
    }
}

// Exportar funciones
export { getUserInfo, updateUserInfo, isAdmin };
