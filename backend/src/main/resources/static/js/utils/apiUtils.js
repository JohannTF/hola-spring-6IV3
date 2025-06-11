/**
 * Utilidades para realizar llamadas a la API REST
 */

/**
 * Realiza una llamada a la API con manejo de autenticación y errores
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones de la petición (method, headers, body, etc.)
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function apiCall(url, options = {}) {
    try {
        // Configurar headers por defecto
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Agregar token de autenticación si existe
        const token = localStorage.getItem('token');
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        }

        // Configurar opciones de la petición
        const requestOptions = {
            method: 'GET',
            ...options,
            headers: defaultHeaders
        };

        // Si el body no es FormData, convertir a JSON
        if (requestOptions.body && !(requestOptions.body instanceof FormData)) {
            if (typeof requestOptions.body === 'object') {
                requestOptions.body = JSON.stringify(requestOptions.body);
            }
        }

        // Si es FormData, remover Content-Type para que el navegador lo establezca automáticamente
        if (requestOptions.body instanceof FormData) {
            delete requestOptions.headers['Content-Type'];
        }

        // Realizar la petición
        const response = await fetch(url, requestOptions);

        // Verificar si la respuesta es exitosa
        if (!response.ok) {
            await handleApiError(response);
        }

        // Intentar parsear como JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        // Si no es JSON, devolver el texto
        return await response.text();

    } catch (error) {
        console.error('Error en llamada a API:', error);
        throw error;
    }
}

/**
 * Maneja errores de respuesta de la API
 * @param {Response} response - Respuesta de fetch
 */
async function handleApiError(response) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
            const errorText = await response.text();
            if (errorText) {
                errorMessage = errorText;
            }
        }
    } catch (parseError) {
        console.error('Error parsing error response:', parseError);
    }

    // Manejar casos específicos de error
    switch (response.status) {
        case 401:
            // Token expirado o no válido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
            throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
            
        case 403:
            throw new Error('No tiene permisos para realizar esta acción.');
            
        case 404:
            throw new Error('Recurso no encontrado.');
            
        case 409:
            throw new Error(errorMessage || 'Conflicto: el recurso ya existe.');
            
        case 422:
            throw new Error(errorMessage || 'Datos de entrada no válidos.');
            
        case 500:
            throw new Error('Error interno del servidor. Intente nuevamente más tarde.');
            
        default:
            throw new Error(errorMessage);
    }
}

/**
 * Realiza una petición GET
 * @param {string} url - URL del endpoint
 * @param {Object} headers - Headers adicionales
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function get(url, headers = {}) {
    return apiCall(url, {
        method: 'GET',
        headers
    });
}

/**
 * Realiza una petición POST
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} headers - Headers adicionales
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function post(url, data = null, headers = {}) {
    return apiCall(url, {
        method: 'POST',
        body: data,
        headers
    });
}

/**
 * Realiza una petición PUT
 * @param {string} url - URL del endpoint
 * @param {Object} data - Datos a enviar
 * @param {Object} headers - Headers adicionales
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function put(url, data = null, headers = {}) {
    return apiCall(url, {
        method: 'PUT',
        body: data,
        headers
    });
}

/**
 * Realiza una petición DELETE
 * @param {string} url - URL del endpoint
 * @param {Object} headers - Headers adicionales
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function deleteRequest(url, headers = {}) {
    return apiCall(url, {
        method: 'DELETE',
        headers
    });
}

/**
 * Construye una URL con parámetros de consulta
 * @param {string} baseUrl - URL base
 * @param {Object} params - Parámetros de consulta
 * @returns {string} URL con parámetros
 */
export function buildUrlWithParams(baseUrl, params = {}) {
    const url = new URL(baseUrl, window.location.origin);
    
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
            url.searchParams.append(key, params[key]);
        }
    });
    
    return url.toString();
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado
 */
export function isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        // Verificar si el token no ha expirado
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        return payload.exp > currentTime;
    } catch (error) {
        console.error('Error verificando token:', error);
        return false;
    }
}

/**
 * Obtiene información del usuario desde el token
 * @returns {Object|null} Información del usuario o null si no está autenticado
 */
export function getUserFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.sub,
            roles: payload.authorities || [],
            exp: payload.exp
        };
    } catch (error) {
        console.error('Error decodificando token:', error);
        return null;
    }
}
