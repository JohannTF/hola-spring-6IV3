/**
 * Módulo de tema - Funciones para manejar el tema de la aplicación
 */

/**
 * Inicializa el sistema de temas
 */
function initTheme() {
    // Agregar el botón de toggle al body
    addThemeToggleButton();

    // Aplicar el tema guardado o detectar preferencia del sistema
    applyTheme();

    // Configurar el evento de clic en el botón de tema
    setupThemeListener();
}

/**
 * Agrega el botón para cambiar de tema
 */
function addThemeToggleButton() {
    // Verificar si ya existe el botón para evitar duplicados
    if (document.querySelector('.theme-toggle')) {
        return;
    }
    
    // Crear el botón
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.id = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Cambiar tema');
    themeToggle.setAttribute('title', 'Cambiar tema');
    
    // Agregar el ícono (depende del tema actual)
    const currentTheme = localStorage.getItem('theme') || 'light';
    const icon = currentTheme === 'dark' ? 'fa-sun' : 'fa-moon';
    themeToggle.innerHTML = `<i class="fas ${icon}"></i>`;
    
    // Agregar el botón al body
    document.body.appendChild(themeToggle);
}

/**
 * Configura el evento de clic para cambiar de tema
 */
function setupThemeListener() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Obtener el tema actual
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Cambiar tema
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Guardar la preferencia
            localStorage.setItem('theme', newTheme);
            
            // Cambiar el ícono del botón
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        });
    }
}

/**
 * Detecta y aplica el tema preferido
 */
function applyTheme() {
    // Verificar si hay un tema guardado
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // Aplicar tema guardado
        document.documentElement.setAttribute('data-theme', savedTheme);
        return;
    }
    
    // Si no hay tema guardado, detectar preferencia del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

export { initTheme };
