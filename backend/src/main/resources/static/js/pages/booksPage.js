/**
 * Página de libros - Funcionalidad específica para el manejo de libros
 */

import { showToast, toggleElement } from '../utils/domUtils.js';
import { redirectIfNotAuthenticated } from '../utils/validationUtils.js';
import { loadGlobalHeader } from '../components/header.js';

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
        // Hay una búsqueda en la URL, mostrar resultados
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
        // Buscar al hacer clic en el botón
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                searchBooks(query);
            }
        });
        
        // Buscar al presionar Enter
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
 * @param {string} query - Término de búsqueda
 */
function searchBooks(query) {
    const searchResultsContainer = document.getElementById('search-results');
    const categoriesContainer = document.getElementById('categories-container');
    const loadingContainer = document.getElementById('loading-container');

    // Verificar que los elementos existen
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
    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`)
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
            
            // Remover clase hidden en lugar de toggleElement para evitar conflictos
            searchResultsContainer.classList.remove('hidden');
            searchResultsContainer.style.display = 'block';

            if (data && data.docs && data.docs.length > 0) {
                const books = data.docs.map(book => ({
                    id: book.key ? book.key.replace('/works/', '') : null,
                    title: book.title || 'Título desconocido',
                    authors: book.author_name ? book.author_name.join(', ') : 'Autor desconocido',
                    coverId: book.cover_i || null,
                    coverUrl: book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : '/images/default-cover.jpg',
                    publishYear: book.first_publish_year || 'Año desconocido'
                }));

                renderSearchResults(books, booksContainer);
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
 * Renderiza los resultados de búsqueda como grid simple (sin carrusel)
 * @param {Array} books - Libros a renderizar
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderSearchResults(books, container) {
    if (!books || books.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron libros.</p>';
        return;
    }

    // Usar grid simple para resultados de búsqueda
    container.className = 'search-grid';
    container.innerHTML = '';

    books.forEach(book => {
        const bookElement = document.createElement('div');
        bookElement.className = 'book-card search-result';
        bookElement.innerHTML = `
            <div class="book-cover">
                <img src="${book.coverUrl}" alt="${book.title}" onerror="this.src='/images/default-cover.jpg'">
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.authors}</p>
                <p class="book-year">${book.publishYear}</p>
            </div>
        `;

        // Añadir evento click para ver detalles
        bookElement.addEventListener('click', () => {
            window.location.href = `/libro-detalle?id=${book.id}`;
        });

        container.appendChild(bookElement);
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
    
    // Promise.all para cargar todas las categorías en paralelo
    const promises = [];
    
    categorySections.forEach(section => {
        const category = section.dataset.category;
        if (category) {
            const promise = fetchBooksByCategory(category)
                .then(books => {
                    const categoryTitle = getCategoryTitle(category);
                    section.innerHTML = `
                        <h2 class="category-title">${categoryTitle}</h2>
                        <div class="books-carousel swiper-container" data-category="${category}">
                            <div class="swiper-wrapper"></div>
                            <div class="swiper-button-next swiper-button-next-${category}"></div>
                            <div class="swiper-button-prev swiper-button-prev-${category}"></div>
                        </div>
                    `;
                    
                    const container = section.querySelector('.swiper-wrapper');
                    renderBooks(books, container);
                    
                    // Inicializar Swiper después de renderizar los libros con selectores únicos
                    new Swiper(section.querySelector('.swiper-container'), {
                        slidesPerView: 1,
                        spaceBetween: 10,
                        navigation: {
                            nextEl: `.swiper-button-next-${category}`,
                            prevEl: `.swiper-button-prev-${category}`,
                        },
                        breakpoints: {
                            640: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            768: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                            },
                            1024: {
                                slidesPerView: 5,
                                spaceBetween: 40,
                            },
                        }
                    });
                })
                .catch(error => {
                    console.error(`Error cargando categoría ${category}:`, error);
                    section.innerHTML = `<p class="error-message">Error al cargar los libros de ${getCategoryTitle(category)}.</p>`;
                });
                
            promises.push(promise);
        }
    });
    
    // Cuando todas las categorías estén cargadas, ocultar el loading
    Promise.all(promises)
        .finally(() => {
            if (loadingContainer) {
                toggleElement(loadingContainer, false);
            }
        });
}

/**
 * Obtiene el título legible de una categoría
 * @param {string} category - Código de categoría
 * @returns {string} - Título legible
 */
function getCategoryTitle(category) {
    const titles = {
        'fiction': 'Ficción Popular',
        'fantasy': 'Fantasía',
        'science_fiction': 'Ciencia Ficción',
        'mystery': 'Misterio y Suspenso',
        'biography': 'Biografías'
    };
    
    return titles[category] || category.replace('_', ' ');
}

/**
 * Obtiene libros por categoría desde OpenLibrary
 * @param {string} category - Categoría a buscar
 * @returns {Promise<Array>} - Libros de esa categoría
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
 * @param {Object} book - Datos del libro de la API
 * @returns {Object} - Datos formateados
 */
function formatBookData(book) {
    // Obtener ID de la portada o usar undefined si no existe
    const coverId = book.cover_id || book.cover_i;
    
    // Generar URL de la portada si hay ID
    const coverUrl = coverId 
        ? `${OPENLIBRARY_API.COVER}${coverId}-M.jpg` 
        : DEFAULT_COVER;
    
    // Extraer el ID del trabajo limpiando el key
    const workId = book.key ? book.key.split('/').pop() : '';
    
    return {
        id: workId,
        title: book.title,
        authors: book.authors || [],
        coverUrl: coverUrl,
        coverId: coverId,
        description: book.description || '',
        publishYear: book.first_publish_year || ''
    };
}

/**
 * Renderiza una colección de libros en un contenedor
 * @param {Array} books - Libros a renderizar
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderBooks(books, container) {
    if (!container || !books) return;
    
    books.forEach(book => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        
        const bookCard = document.createElement('div');
        bookCard.className = 'book-card';
        bookCard.setAttribute('data-id', book.id);
        
        // Crear enlace a detalle del libro
        const bookLink = document.createElement('a');
        bookLink.href = `/libro/${book.id}`;
        bookLink.className = 'book-link';
        
        // Crear contenedor de portada
        const coverContainer = document.createElement('div');
        coverContainer.className = 'book-cover';
        
        // Crear imagen
        const img = document.createElement('img');
        img.src = book.coverUrl;
        img.alt = book.title;
        img.onerror = () => { img.src = DEFAULT_COVER; };
        
        // Crear título
        const title = document.createElement('h3');
        title.className = 'book-title';
        title.textContent = book.title;
        
        // Crear info de autor
        const author = document.createElement('p');
        author.className = 'book-author';
        author.textContent = book.authors.map(author => author.name).join(', ') || 'Autor desconocido';
        
        // Armar estructura
        coverContainer.appendChild(img);
        bookLink.appendChild(coverContainer);
        bookLink.appendChild(title);
        bookLink.appendChild(author);
        bookCard.appendChild(bookLink);
        slide.appendChild(bookCard);
        container.appendChild(slide);
    });
}

/**
 * Carga los detalles de un libro específico
 */
function loadBookDetails() {
    redirectIfNotAuthenticated();
    loadGlobalHeader();
    
    const loadingContainer = document.getElementById('loading-container');
    const bookDetailsContainer = document.getElementById('book-details');
    const errorContainer = document.getElementById('error-container');
    
    // Obtener ID del libro de la URL
    const pathParts = window.location.pathname.split('/');
    const bookId = pathParts[pathParts.length - 1];
    
    if (!bookId) {
        showBookError('No se pudo identificar el libro solicitado.');
        return;
    }
    
    // URL para obtener detalles del libro
    const bookUrl = `${OPENLIBRARY_API.WORK}${bookId}.json`;
    
    // Mostrar cargando
    if (loadingContainer) toggleElement(loadingContainer, true, 'flex');
    
    // Cargar datos del libro
    fetch(bookUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // Ocultar cargando
            if (loadingContainer) toggleElement(loadingContainer, false);
            
            // Mostrar contenedor de detalles
            if (bookDetailsContainer) toggleElement(bookDetailsContainer, true, 'flex');
            
            // Extraer información del libro
            const title = data.title || 'Título desconocido';
            const description = data.description || 'No hay descripción disponible.';
            const coverID = data.covers && data.covers.length > 0 ? data.covers[0] : null;
            const coverUrl = coverID ? `${OPENLIBRARY_API.COVER}${coverID}-L.jpg` : DEFAULT_COVER;
            
            // Generar HTML para la portada
            const coverContainer = bookDetailsContainer.querySelector('.book-cover-container');
            if (coverContainer) {
                coverContainer.innerHTML = `
                    <img src="${coverUrl}" alt="${title}" class="book-detail-cover">
                `;
            }
            
            // Generar HTML para la información
            const infoContainer = bookDetailsContainer.querySelector('.book-info');
            if (infoContainer) {
                infoContainer.innerHTML = `
                    <h1 class="book-detail-title">${title}</h1>
                    
                    <div class="book-authors">
                        <h3>Autor(es):</h3>
                        <div id="authors-container">
                            <p>Cargando autores...</p>
                        </div>
                    </div>
                    
                    <div class="book-description">
                        <h3>Descripción:</h3>
                        <div class="description-content">
                            ${typeof description === 'object' ? description.value || '' : description}
                        </div>
                    </div>
                `;
            }
            
            // Cargar información de autores
            if (data.authors) {
                loadAuthors(data.authors);
            }
        })
        .catch(error => {
            console.error('Error cargando detalles del libro:', error);
            showBookError(error.message);
        });
}

/**
 * Carga información de los autores del libro
 * @param {Array} authorRefs - Referencias a autores
 */
function loadAuthors(authorRefs) {
    const authorsContainer = document.getElementById('authors-container');
    if (!authorsContainer) return;
    
    const authorPromises = authorRefs.map(authorRef => {
        const authorKey = authorRef.author.key;
        return fetch(`https://openlibrary.org${authorKey}.json`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(authorData => ({
                name: authorData.name,
                bio: authorData.bio
            }))
            .catch(() => ({
                name: 'Autor desconocido',
                bio: null
            }));
    });
    
    Promise.all(authorPromises)
        .then(authors => {
            authorsContainer.innerHTML = authors.map(author => `
                <div class="author-info">
                    <p class="author-name">${author.name}</p>
                    ${author.bio ? `<p class="author-bio">${typeof author.bio === 'object' ? author.bio.value || '' : author.bio}</p>` : ''}
                </div>
            `).join('');
        })
        .catch(error => {
            authorsContainer.innerHTML = `<p>Error al cargar información de autores: ${error.message}</p>`;
        });
}

/**
 * Muestra un mensaje de error en la página de detalles
 * @param {string} message - Mensaje de error
 */
function showBookError(message) {
    const loadingContainer = document.getElementById('loading-container');
    const bookDetailsContainer = document.getElementById('book-details');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    
    // Ocultar cargando y detalles
    if (loadingContainer) toggleElement(loadingContainer, false);
    if (bookDetailsContainer) toggleElement(bookDetailsContainer, false);
    
    // Mostrar error
    if (errorContainer) toggleElement(errorContainer, true, 'flex');
    if (errorMessage) errorMessage.textContent = message;
}

export { setupHomePage, loadBookDetails };
