/**
 * Página de detalle de libro actualizada para usar componentes reutilizables
 */

import { showToast, toggleElement } from '../utils/domUtils.js';
import { redirectIfNotAuthenticated } from '../utils/validationUtils.js';
import { loadGlobalHeader } from '../components/header.js';
import { renderBookDetail, createBookDetailSkeleton } from '../components/bookDetailView.js';
import { getBooksService } from '../services/booksService.js';

/**
 * Inicializa la página de detalles del libro
 */
function setupBookDetailPage() {
    // Verificar autenticación
    redirectIfNotAuthenticated();
    
    // Cargar el header global
    loadGlobalHeader();
    
    // Cargar detalles del libro
    loadBookDetails();
}

/**
 * Carga los detalles de un libro específico
 */
function loadBookDetails() {
    // Obtener ID del libro de la URL
    let bookId = '';
    const urlParams = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    
    if (path.startsWith('/libro/')) {
        bookId = path.split('/')[2];
    } else {
        bookId = urlParams.get('id');
    }
    
    if (!bookId) {
        showBookError('No se ha especificado un ID de libro válido');
        return;
    }
    
    // Referencias a elementos del DOM
    const container = document.getElementById('book-details-container') || 
                     document.querySelector('.container') ||
                     document.querySelector('main');
    
    if (!container) {
        console.error('No se encontró el contenedor principal');
        showBookError('Error en la estructura de la página');
        return;
    }
    
    
    // Mostrar skeleton loader
    createBookDetailSkeleton(container);
    
    // Obtener el servicio de libros
    const booksService = getBooksService();
    
    // Obtener datos del libro
    booksService.getBookDetails(bookId)
        .then(book => {
            
            // Renderizar vista detallada usando el componente
            renderBookDetail(book, container, {
                showFavoriteButton: true,
                showBackButton: true,
                backUrl: '/inicio'
            });
        })
        .catch(error => {
            console.error('Error cargando detalles del libro:', error);
            showBookError('No se pudo cargar la información del libro. Intente nuevamente.');
        });
}

/**
 * Muestra un mensaje de error
 */
function showBookError(message) {
    const container = document.getElementById('book-details-container') || 
                     document.querySelector('.container') ||
                     document.querySelector('main');
    
    if (container) {
        container.innerHTML = `
            <div class="error-container" style="
                text-align: center; 
                padding: 60px 20px; 
                background: #ffffff; 
                border-radius: 12px; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                margin: 20px auto;
                max-width: 600px;
            ">
                <div class="error-icon" style="font-size: 4rem; color: #e74c3c; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 style="color: #2c3e50; margin-bottom: 16px;">No se pudo cargar el libro</h2>
                <p style="color: #7f8c8d; margin-bottom: 30px; line-height: 1.6;">${message}</p>
                <a href="/inicio" class="btn btn-primary" style="
                    display: inline-block;
                    background-color: #3498db;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 500;
                    transition: background-color 0.3s ease;
                ">Volver a inicio</a>
            </div>
        `;
    }
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.setupBookDetailPage = setupBookDetailPage;
    window.loadBookDetails = loadBookDetails;
}

export { setupBookDetailPage, loadBookDetails };
