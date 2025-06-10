/**
 * Componente de Loader reutilizable
 * Proporciona diferentes tipos de loaders estéticos para la aplicación
 */

/**
 * Crea un loader simple y elegante
 * @param {Object} options - Opciones de configuración
 * @returns {HTMLElement} - Elemento DOM del loader
 */
export function createLoader(options = {}) {
    const {
        type = 'dots',           // 'dots', 'books', 'magic', 'pulse'
        size = 'medium',         // 'small', 'medium', 'large'
        message = 'Cargando...',
        color = 'primary',       // 'primary', 'secondary', 'accent'
        className = ''
    } = options;

    const loader = document.createElement('div');
    loader.className = `modern-loader modern-loader--${type} modern-loader--${size} modern-loader--${color} ${className}`;

    switch (type) {        case 'dots':
            loader.innerHTML = createDotsLoaderHTML(message);
            break;case 'books':
            loader.innerHTML = createBooksLoaderHTML(message);
            break;        case 'magic':
            loader.innerHTML = createMagicLoaderHTML(message);
            break;        case 'pulse':
            loader.innerHTML = createPulseLoaderHTML(message);
            break;        default:
            loader.innerHTML = createDotsLoaderHTML(message);
    }

    return loader;
}

/**
 * Crea un loader con puntos animados
 */
function createDotsLoaderHTML(message) {
    return `
        <div class="loader-content">
            <div class="dots-loader">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
            <p class="loader-message">${message}</p>
        </div>
    `;
}

/**
 * Crea un loader con libros animados
 */
function createBooksLoaderHTML(message) {
    return `
        <div class="loader-content">
            <div class="books-loader">
                <div class="book book-1">
                    <div class="book-cover"></div>
                </div>
                <div class="book book-2">
                    <div class="book-cover"></div>
                </div>
                <div class="book book-3">
                    <div class="book-cover"></div>
                </div>
            </div>
            <p class="loader-message">${message}</p>
        </div>
    `;
}

/**
 * Crea un loader con efectos mágicos
 */
function createMagicLoaderHTML(message) {
    return `
        <div class="loader-content">
            <div class="magic-loader">
                <div class="magic-circle">
                    <i class="fas fa-magic"></i>
                    <div class="sparkle sparkle-1"></div>
                    <div class="sparkle sparkle-2"></div>
                    <div class="sparkle sparkle-3"></div>
                </div>
            </div>
            <p class="loader-message">${message}</p>
        </div>
    `;
}

/**
 * Crea un loader con pulso simple
 */
function createPulseLoaderHTML(message) {
    return `
        <div class="loader-content">
            <div class="pulse-loader">
                <div class="pulse-circle"></div>
            </div>
            <p class="loader-message">${message}</p>
        </div>
    `;
}

/**
 * Funciones de utilidad para mostrar/ocultar loaders
 */
export function showLoader(container, options = {}) {
    if (!container) return null;
    
    const loader = createLoader(options);
    container.innerHTML = '';
    container.appendChild(loader);
    
    return loader;
}

export function hideLoader(container) {
    if (!container) return;
    
    const loader = container.querySelector('.modern-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(loader);
        }, 300);
    }
}

/**
 * Loader específico para recomendaciones
 */
export function createRecommendationsLoader() {
    return createLoader({
        type: 'magic',
        size: 'medium',
        message: 'Generando recomendaciones personalizadas...',
        color: 'primary',
        className: 'recommendations-loader'
    });
}

/**
 * Loader específico para carga de libros
 */
export function createBooksLoader() {
    return createLoader({
        type: 'books',
        size: 'medium',
        message: 'Cargando libros...',
        color: 'primary',
        className: 'books-loader'
    });
}

/**
 * Loader específico para búsquedas
 */
export function createSearchLoader() {
    return createLoader({
        type: 'dots',
        size: 'small',
        message: 'Buscando...',
        color: 'secondary',
        className: 'search-loader'
    });
}
