/**
 * Módulo de API - Contiene funciones para realizar peticiones HTTP al backend
 */

/**
 * Función para realizar peticiones fetch con configuración común
 * @param {string} url - URL de la petición
 * @param {Object} options - Opciones de fetch (method, body, etc)
 * @param {boolean} includeToken - Si se debe incluir el token de autenticación
 * @returns {Promise} - Promesa con la respuesta
 */
async function fetchWithConfig(url, options = {}, includeToken = true) {
    // Definir headers por defecto
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Incluir token si es necesario
    if (includeToken) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Redireccionar al login si no hay token y se requiere
            window.location.href = '/login';
            return Promise.reject('No hay token de autenticación');
        }
    }
    
    // Configuración completa de la petición
    const fetchOptions = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(url, fetchOptions);
        
        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            // Intenta obtener un mensaje de error detallado del servidor
            const errorData = await response.json().catch(() => ({
                message: `Error ${response.status}: ${response.statusText}`
            }));
            
            // Lanzar error con mensaje del servidor o un mensaje predeterminado
            throw new Error(errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        // Para respuestas sin contenido (204)
        if (response.status === 204) {
            return null;
        }
        
        // Intentar parsear como JSON, si no funciona devolver el texto
        return response.json().catch(() => response.text());
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}

/**
 * Realizar una petición GET
 * @param {string} url - URL de la petición
 * @param {boolean} includeToken - Si se debe incluir el token
 * @returns {Promise} - Promesa con la respuesta
 */
function apiGet(url, includeToken = true) {
    return fetchWithConfig(url, {
        method: 'GET'
    }, includeToken);
}

/**
 * Realizar una petición POST
 * @param {string} url - URL de la petición
 * @param {Object} data - Datos a enviar
 * @param {boolean} includeToken - Si se debe incluir el token
 * @returns {Promise} - Promesa con la respuesta
 */
function apiPost(url, data, includeToken = true) {
    return fetchWithConfig(url, {
        method: 'POST',
        body: JSON.stringify(data)
    }, includeToken);
}

/**
 * Realizar una petición PUT
 * @param {string} url - URL de la petición
 * @param {Object} data - Datos a enviar
 * @returns {Promise} - Promesa con la respuesta
 */
function apiPut(url, data) {
    return fetchWithConfig(url, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

/**
 * Realizar una petición DELETE
 * @param {string} url - URL de la petición
 * @returns {Promise} - Promesa con la respuesta
 */
function apiDelete(url) {
    return fetchWithConfig(url, {
        method: 'DELETE'
    });
}

// Exportar las funciones para uso en otros módulos
export { apiGet, apiPost, apiPut, apiDelete };
