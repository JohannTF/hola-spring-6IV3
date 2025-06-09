/**
 * Utilidades de autenticación - Funciones para validar roles y permisos
 */

/**
 * Decodifica un token JWT sin verificar la firma
 * @param {string} token - Token JWT a decodificar
 * @returns {Object|null} - Payload del token o null si es inválido
 */
function decodeJWTPayload(token) {
    try {
        // Remover "Bearer " si está presente
        const cleanToken = token.replace('Bearer ', '');
        
        // Dividir el token en sus partes
        const parts = cleanToken.split('.');
        if (parts.length !== 3) {
            return null;
        }
        
        // Decodificar el payload (segunda parte)
        const payload = parts[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Error decodificando token JWT:', error);
        return null;
    }
}

/**
 * Obtiene los roles del usuario desde el token almacenado
 * @returns {Array<string>} - Array de roles del usuario
 */
function getUserRolesFromToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        return [];
    }
    
    const payload = decodeJWTPayload(token);
    if (!payload) {
        return [];
    }
    
    // Buscar roles en diferentes lugares del payload
    let roles = [];
    
    // Roles como array en el claim "roles"
    if (payload.roles && Array.isArray(payload.roles)) {
        roles = payload.roles;
    }
    // Roles como string único
    else if (payload.roles && typeof payload.roles === 'string') {
        roles = [payload.roles];
    }
    // Authorities de Spring Security
    else if (payload.authorities && Array.isArray(payload.authorities)) {
        roles = payload.authorities.map(auth => 
            typeof auth === 'string' ? auth : auth.authority
        ).filter(Boolean);
    }
    
    return roles;
}

/**
 * Verifica si el usuario actual tiene un rol específico
 * @param {string} requiredRole - Rol requerido (ej: "ROLE_ADMIN", "ADMIN")
 * @returns {boolean} - True si el usuario tiene el rol
 */
function hasRole(requiredRole) {
    const userRoles = getUserRolesFromToken();
    
    // Normalizar el rol requerido
    const normalizedRequired = requiredRole.toUpperCase();
    const roleVariants = [
        normalizedRequired,
        normalizedRequired.replace('ROLE_', ''),
        'ROLE_' + normalizedRequired.replace('ROLE_', '')
    ];
    
    return userRoles.some(role => {
        const normalizedRole = role.toUpperCase();
        return roleVariants.includes(normalizedRole);
    });
}

/**
 * Verifica si el usuario es administrador
 * @returns {boolean} - True si el usuario es admin
 */
function isUserAdmin() {
    return hasRole('ADMIN') || hasRole('ROLE_ADMIN');
}

/**
 * Redirige al usuario si no tiene el rol requerido
 * @param {string} requiredRole - Rol requerido
 * @param {string} redirectUrl - URL de redirección por defecto
 */
function redirectIfNotRole(requiredRole, redirectUrl = '/inicio') {
    if (!hasRole(requiredRole)) {
        console.warn(`Acceso denegado. Rol requerido: ${requiredRole}`);
        
        // Mostrar mensaje antes de redireccionar si hay función showToast disponible
        if (typeof window.showToast === 'function') {
            window.showToast('No tienes permisos para acceder a esta página', 'error');
        }
        
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 1500);
        
        return false;
    }
    return true;
}

/**
 * Redirige al usuario si no es administrador
 * @param {string} redirectUrl - URL de redirección
 */
function redirectIfNotAdmin(redirectUrl = '/inicio') {
    return redirectIfNotRole('ADMIN', redirectUrl);
}

/**
 * Obtiene información básica del usuario desde el token
 * @returns {Object|null} - Información del usuario o null si no hay token
 */
function getUserInfoFromToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        return null;
    }
    
    const payload = decodeJWTPayload(token);
    if (!payload) {
        return null;
    }
    
    return {
        username: payload.sub,
        roles: getUserRolesFromToken(),
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        isAdmin: isUserAdmin()
    };
}

/**
 * Verifica si el token actual es válido (no expirado)
 * @returns {boolean} - True si el token es válido
 */
function isTokenValid() {
    const userInfo = getUserInfoFromToken();
    if (!userInfo) {
        return false;
    }
    
    return userInfo.expiresAt > new Date();
}

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null} - Token de autenticación o null si no existe
 */
function getAuthToken() {
    return localStorage.getItem('token');
}

// Exportar funciones
export {
    decodeJWTPayload,
    getUserRolesFromToken,
    hasRole,
    isUserAdmin,
    redirectIfNotRole,
    redirectIfNotAdmin,
    getUserInfoFromToken,
    isTokenValid,
    getAuthToken
};
