/**
 * Página de detalle de libro - Funcionalidad específica para mostrar detalles de un libro
 */

import { showToast, toggleElement } from '../utils/domUtils.js';
import { redirectIfNotAuthenticated } from '../utils/validationUtils.js';
import { loadGlobalHeader } from '../components/header.js';
import { getBooksService } from '../services/booksService.js';

// Obtener el servicio de libros
const booksService = getBooksService();

// Constantes
const DEFAULT_COVER = '/images/default-cover.jpg';
const OPENLIBRARY_API = {
    COVER: 'https://covers.openlibrary.org/b/id/',
    AUTHOR: 'https://openlibrary.org/authors/',
};

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
    const loadingContainer = document.getElementById('loading-container');
    const bookDetailsContainer = document.getElementById('book-details');
    const errorContainer = document.getElementById('error-container');
    
    // Verificar que existan los elementos necesarios
    if (!bookDetailsContainer) {
        console.error('No se encontró el contenedor de detalles del libro');
        return;
    }
    
    // Mostrar pantalla de carga
    if (loadingContainer) toggleElement(loadingContainer, true, 'flex');
    
    // Ocultar mensaje de error si existe
    if (errorContainer) toggleElement(errorContainer, false);
    
    // Ocultar detalles mientras carga
    toggleElement(bookDetailsContainer, false);
    
    // Obtener datos del libro
    booksService.getBookDetails(bookId)
        .then(book => {
            // Ocultar loading
            if (loadingContainer) toggleElement(loadingContainer, false);
            
            // Mostrar detalles
            toggleElement(bookDetailsContainer, true, 'grid');
            
            // Actualizar título de la página
            document.title = `${book.title || 'Libro'} | OpenBook`;
            
            // Llenar la información del libro
            updateBookDetails(book);
        })
        .catch(error => {
            console.error('Error cargando detalles del libro:', error);
            showBookError('No se pudo cargar la información del libro. Intente nuevamente.');
        });
}

/**
 * Actualiza la interfaz con los detalles del libro
 * @param {Object} book - Datos del libro 
 */
function updateBookDetails(book) {
    // Título
    const titleElement = document.getElementById('book-title');
    if (titleElement) {
        titleElement.textContent = book.title || 'Título desconocido';
    }
    
    // Portada
    const coverElement = document.getElementById('book-cover');
    if (coverElement) {
        if (book.covers && book.covers.length > 0) {
            coverElement.src = `${OPENLIBRARY_API.COVER}${book.covers[0]}-L.jpg`;
            coverElement.onerror = () => {
                coverElement.src = DEFAULT_COVER;
            };
        } else {
            coverElement.src = DEFAULT_COVER;
        }
    }
    
    // Autores
    const authorsElement = document.getElementById('book-authors');
    if (authorsElement) {
        authorsElement.textContent = book.authorNames?.join(', ') || 'Autor desconocido';
    }
    
    // Descripción
    const descriptionElement = document.getElementById('book-description-text');
    if (descriptionElement) {
        if (book.description) {
            if (typeof book.description === 'string') {
                descriptionElement.textContent = book.description;
            } else if (book.description.value) {
                descriptionElement.textContent = book.description.value;
            }
        } else {
            descriptionElement.textContent = 'No hay descripción disponible para este libro.';
        }
    }
    
    // Fecha de publicación
    const publishDateElement = document.getElementById('book-publish-date');
    if (publishDateElement) {
        publishDateElement.textContent = book.first_publish_date || 'Fecha desconocida';
    }
    
    // Editorial
    const publisherElement = document.getElementById('book-publisher');
    if (publisherElement) {
        publisherElement.textContent = book.publishers ? book.publishers.join(', ') : 'Editorial desconocida';
    }
    
    // ISBN
    const isbnElement = document.getElementById('book-isbn');
    if (isbnElement && isbnElement.querySelector('span')) {
        if (book.isbn_13) {
            isbnElement.querySelector('span').textContent = book.isbn_13[0];
        } else if (book.isbn_10) {
            isbnElement.querySelector('span').textContent = book.isbn_10[0];
        }
    }
    
    // Páginas
    const pagesElement = document.getElementById('book-pages');
    if (pagesElement && pagesElement.querySelector('span')) {
        pagesElement.querySelector('span').textContent = book.number_of_pages || '-';
    }
    
    // Categorías/Subjects
    const subjectsElement = document.getElementById('book-subjects-list');
    if (subjectsElement) {
        subjectsElement.innerHTML = '';
        
        if (book.subjects && book.subjects.length > 0) {
            book.subjects.slice(0, 10).forEach(subject => {
                const tagElement = document.createElement('span');
                tagElement.className = 'subject-tag';
                tagElement.textContent = subject;
                subjectsElement.appendChild(tagElement);
            });
        } else {
            subjectsElement.innerHTML = '<p>No hay categorías disponibles.</p>';
        }
    }
    
    // Link a OpenLibrary
    const openLibraryLink = document.getElementById('open-library-link');
    if (openLibraryLink) {
        openLibraryLink.href = `https://openlibrary.org${book.key}`;
    }
}

/**
 * Muestra un mensaje de error en la página de detalles
 * @param {string} message - Mensaje de error
 */
function showBookError(message) {
    console.log("Mostrando error:", message);
    const loadingContainer = document.getElementById('loading-container');
    const bookDetailsContainer = document.getElementById('book-details');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    if (loadingContainer) loadingContainer.style.display = 'none';
    if (bookDetailsContainer) bookDetailsContainer.style.display = 'none';
    
    if (errorContainer) {
        errorContainer.style.display = 'flex';
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    } else {
        console.error("Contenedor de error no encontrado");
        showToast(`Error: ${message}`, 'error');
    }
}

export { setupBookDetailPage, loadBookDetails };
