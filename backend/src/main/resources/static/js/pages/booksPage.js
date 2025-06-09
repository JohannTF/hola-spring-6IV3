/**
 * Página de libros actualizada para usar componentes reutilizables
 */

import { showToast, toggleElement } from '../utils/domUtils.js';
import { redirectIfNotAuthenticated } from '../utils/validationUtils.js';
import { loadGlobalHeader } from '../components/header.js';
import { renderBookCards } from '../components/bookCard.js';

// URLs de la API de OpenLibrary
const OPENLIBRARY_API = {
    SEARCH: 'https://openlibrary.org/search.json',
    WORK: 'https://openlibrary.org/works/',
    COVER: 'https://covers.openlibrary.org/b/id/',
    AUTHOR: 'https://openlibrary.org/authors/',
    SUBJECT: 'https://openlibrary.org/subjects/'
};

// Imagen de portada por defecto
const DEFAULT_COVER = '/images/default-cover.jpg';

/**
 * Configura la página principal
 */
function setupHomePage() {
    // Verificar autenticación
    redirectIfNotAuthenticated();
    
    // Cargar el header global
    loadGlobalHeader();
    
    // Cargar libros por categorías
    loadBooksByCategories();
    
    // Configurar búsqueda
    setupSearch();
    
    // Verificar si hay parámetro de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = searchQuery;
        }
        searchBooks(searchQuery);
    }
}

/**
 * Configura la funcionalidad de búsqueda
 */
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchBooks(query);
            }
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                if (query) {
                    searchBooks(query);
                }
            }
        });
    }
}

/**
 * Busca libros por término de búsqueda
 */
function searchBooks(query) {
    const searchResultsContainer = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('categories-container');
    const loadingContainer = document.getElementById('loading-container');

    if (!searchResultsContainer) {
        console.error('Contenedor search-results no encontrado');
        return;
    }

    // Crear el contenedor de libros si no existe
    let booksContainer = searchResultsContainer.querySelector('.books-container');
    if (!booksContainer) {
        searchResultsContainer.innerHTML = `
            <h2>Resultados de búsqueda para: "${query}"</h2>
            <div class="books-container"></div>
        `;
        booksContainer = searchResultsContainer.querySelector('.books-container');
    }

    // Mostrar carga
    if (loadingContainer) {
        toggleElement(loadingContainer, true, 'flex');
    }
    if (categoriesContainer) {
        toggleElement(categoriesContainer, false);
    }
    toggleElement(searchResultsContainer, false);

    // Realizar búsqueda
    fetch(`${OPENLIBRARY_API.SEARCH}?q=${encodeURIComponent(query)}&limit=20`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (loadingContainer) {
                toggleElement(loadingContainer, false);
            }
            
            searchResultsContainer.classList.remove('hidden');
            searchResultsContainer.style.display = 'block';

            if (data && data.docs && data.docs.length > 0) {
                const books = data.docs.map(book => ({
                    id: book.key ? book.key.replace('/works/', '') : null,
                    title: book.title || 'Título desconocido',
                    authors: book.author_name ? book.author_name.join(', ') : 'Autor desconocido',
                    coverId: book.cover_i || null,
                    coverUrl: book.cover_i
                        ? `${OPENLIBRARY_API.COVER}${book.cover_i}-M.jpg`
                        : DEFAULT_COVER,
                    publishYear: book.first_publish_year || 'Año desconocido'
                }));

                // Usar el componente reutilizable
                renderBookCards(books, booksContainer, {
                    type: 'grid',
                    showFavoriteButton: true,
                    size: 'medium'
                });
            } else {
                booksContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <p>No se encontraron resultados para "${query}".</p>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error en búsqueda:', error);
            if (loadingContainer) {
                toggleElement(loadingContainer, false);
            }
            
            searchResultsContainer.classList.remove('hidden');
            searchResultsContainer.style.display = 'block';

            booksContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Ha ocurrido un error al buscar. Intente nuevamente.</p>
                </div>
            `;
        });
}

/**
 * Carga libros por categorías
 */
function loadBooksByCategories() {
    const categorySections = document.querySelectorAll('.category-section');
    const loadingContainer = document.getElementById('loading-container');
    
    if (loadingContainer) {
        toggleElement(loadingContainer, true, 'flex');
    }
    
    const promises = [];
    
    categorySections.forEach(section => {
        const category = section.dataset.category;
        if (category) {
            const promise = fetchBooksByCategory(category)
                .then(books => {
                    const categoryTitle = getCategoryTitle(category);
                    section.innerHTML = `
                        <h2 class="category-title">${categoryTitle}</h2>
                        <div class="books-carousel-container"></div>
                    `;
                    
                    const container = section.querySelector('.books-carousel-container');
                    
                    // Usar el componente reutilizable para carrusel
                    renderBookCards(books, container, {
                        type: 'carousel',
                        showFavoriteButton: true,
                        size: 'medium'
                    });
                })
                .catch(error => {
                    console.error(`Error cargando categoría ${category}:`, error);
                    section.innerHTML = `<p class="error-message">Error al cargar los libros de ${getCategoryTitle(category)}.</p>`;
                });
                
            promises.push(promise);
        }
    });
    
    Promise.all(promises)
        .finally(() => {
            if (loadingContainer) {
                toggleElement(loadingContainer, false);
            }
        });
}

/**
 * Obtiene el título legible de una categoría
 */
function getCategoryTitle(category) {
    const titles = {
        'fiction': 'Ficción',
        'fantasy': 'Fantasía',
        'science_fiction': 'Ciencia Ficción',
        'mystery': 'Misterio',
        'biography': 'Biografías',
        'history': 'Historia',
        'romance': 'Romance',
        'thriller': 'Thriller'
    };
    return titles[category] || category;
}

/**
 * Obtiene libros por categoría desde OpenLibrary
 */
function fetchBooksByCategory(category) {
    const url = `${OPENLIBRARY_API.SUBJECT}${category}.json?limit=20`;
    
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.works && Array.isArray(data.works)) {
                return data.works.map(formatBookData);
            }
            return [];
        });
}

/**
 * Formatea los datos de un libro para su uso en la aplicación
 */
function formatBookData(book) {
    const coverId = book.cover_id || book.cover_i;
    const coverUrl = coverId 
        ? `${OPENLIBRARY_API.COVER}${coverId}-M.jpg` 
        : DEFAULT_COVER;
    
    const workId = book.key ? book.key.split('/').pop() : '';
    
    return {
        id: workId,
        title: book.title,
        authors: book.authors || [],
        coverUrl: coverUrl,
        coverId: coverId,
        publishYear: book.first_publish_year || ''
    };
}

export { setupHomePage };
