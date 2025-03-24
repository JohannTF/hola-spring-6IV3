/**
 * Funciones de autenticación (login y registro)
 */

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
            
            toggleElement(errorMsg, false);
            
            login(username, password)
                .then(() => {
                    window.location.replace('/view/my-profile');
                })
                .catch(error => {
                    console.error('Error:', error);
                    toggleElement(errorMsg, true);
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
            
            const userData = {
                username: document.getElementById('username').value.trim(),
                password: document.getElementById('password').value,
                firstName: document.getElementById('firstname').value.trim(),
                lastName: document.getElementById('lastname').value.trim(),
                country: document.getElementById('country').value.trim(),
                role: "USER" // Valor fijo establecido como "USER"
            };
            
            toggleElement(errorMsg, false);
            
            register(userData)
                .then(() => {
                    window.location.href = '/login';
                })
                .catch(error => {
                    console.error('Error:', error);
                    toggleElement(errorMsg, true);
                });
        });
    }
}
