/**
 * Funciones para manejar libros y la API de  ibrary
 */

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
    // Cargar libros por categorías
    loadBooksByCategories();
    
    // Configurar búsqueda
    setupSearch();
    
    // Verificar si hay parámetro de búsqueda en la URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    
    if (searchQuery) {
        document.getElementById('search-input').value = searchQuery;
        searchBooks(searchQuery);
    }
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
        const container = section.querySelector('.books-container');
        
        if (category && container) {
            promises.push(
                fetchBooksByCategory(category)
                    .then(books => {
                        renderBooks(books, container);
                    })
                    .catch(error => {
                        console.error(`Error cargando categoría ${category}:`, error);
                        container.innerHTML = `<p class="error-message">No se pudieron cargar los libros de esta categoría.</p>`;
                    })
            );
        }
    });
    
    // Cuando todas las categorías estén cargadas
    Promise.all(promises)
        .then(() => {
            if (loadingContainer) {
                toggleElement(loadingContainer, false);
            }
        })
        .catch(error => {
            console.error('Error cargando categorías:', error);
            if (loadingContainer) {
                toggleElement(loadingContainer, false);
            }
        });
}

/**
 * Obtiene libros por categoría desde OpenLibrary
 * @param {string} category - Categoría a buscar
 * @returns {Promise<Array>} - Libros de esa categoría
 */
function fetchBooksByCategory(category) {
    // Usar https y añadir parámetros adicionales para mejorar la respuesta
    return fetch(`https://openlibrary.org/subjects/${category}.json?limit=25`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.works && data.works.length > 0) {
                return data.works.map(formatBookData);
            }
            return [];
        })
        .catch(error => {
            console.error(`Error en fetchBooksByCategory para ${category}:`, error);
            throw error; // Re-lanzar para manejo en el llamador
        });
}

/**
 * Formatea los datos de un libro para su uso en la aplicación
 * @param {Object} book - Datos del libro de la API
 * @returns {Object} - Datos formateados
 */
function formatBookData(book) {
    return {
        id: book.key ? book.key.replace('/works/', '') : null,
        title: book.title || 'Título desconocido',
        authors: book.authors ? book.authors.map(author => author.name || 'Autor desconocido').join(', ') : 'Autor desconocido',
        coverId: book.cover_id || book.cover_i || null,
        coverUrl: book.cover_id || book.cover_i ? 
            `https://covers.openlibrary.org/b/id/${book.cover_id || book.cover_i}-M.jpg` : 
            DEFAULT_COVER,
        publishYear: book.first_publish_year || book.publish_year || 'Año desconocido',
        subjects: book.subject || []
    };
}

/**
 * Renderiza una colección de libros en un contenedor
 * @param {Array} books - Libros a renderizar
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderBooks(books, container) {
    if (!books || books.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron libros en esta categoría.</p>';
        return;
    }

    // Crear el contenedor del carrusel
    const swiperContainer = document.createElement('div');
    swiperContainer.className = 'swiper-container book-carousel';

    // Crear el wrapper para las slides
    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';
    swiperContainer.appendChild(swiperWrapper);

    // Renderizar cada libro como un slide
    books.forEach(book => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        const bookElement = document.createElement('div');
        bookElement.className = 'book-card';
        bookElement.innerHTML = `
            <div class="book-cover">
                <img src="${book.coverUrl}" alt="${book.title}" onerror="this.src='${DEFAULT_COVER}'">
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

        slide.appendChild(bookElement);
        swiperWrapper.appendChild(slide);
    });

    // Limpiar el contenedor y añadir el carrusel
    container.innerHTML = ''; // Asegurar que el contenedor esté vacío
    container.appendChild(swiperContainer);

    // Añadir botones de navegación al carrusel
    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev';
    swiperContainer.appendChild(prevButton);

    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next';
    swiperContainer.appendChild(nextButton);

    // Inicializar Swiper
    setTimeout(() => {
        new Swiper(swiperContainer, {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                320: {
                    slidesPerView: 2,
                    spaceBetween: 10
                },
                480: {
                    slidesPerView: 3,
                    spaceBetween: 15
                },
                768: {
                    slidesPerView: 4,
                    spaceBetween: 15
                },
                992: {
                    slidesPerView: 5,
                    spaceBetween: 20
                }
            }
        });
    }, 0); // Asegurar que Swiper se inicialice después de renderizar el DOM
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
    const booksContainer = searchResultsContainer.querySelector('.books-container');
    const categoriesContainer = document.getElementById('categories-container');
    const loadingContainer = document.getElementById('loading-container');

    // Mostrar carga
    toggleElement(loadingContainer, true, 'flex');
    toggleElement(categoriesContainer, false);
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
            toggleElement(loadingContainer, false);
            toggleElement(searchResultsContainer, true, 'block');

            if (data && data.docs && data.docs.length > 0) {
                const books = data.docs.map(book => ({
                    id: book.key ? book.key.replace('/works/', '') : null,
                    title: book.title || 'Título desconocido',
                    authors: book.author_name ? book.author_name.join(', ') : 'Autor desconocido',
                    coverId: book.cover_i || null,
                    coverUrl: book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : DEFAULT_COVER,
                    publishYear: book.first_publish_year || 'Año desconocido'
                }));

                renderBooks(books, booksContainer);
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
            toggleElement(loadingContainer, false);
            toggleElement(searchResultsContainer, true, 'block');

            booksContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Ha ocurrido un error al buscar. Intente nuevamente.</p>
                </div>
            `;
        });
}

/**
 * Carga los detalles de un libro específico
 */
function loadBookDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
        showBookError('No se especificó un ID de libro válido.');
        return;
    }
    
    const loadingContainer = document.getElementById('loading-container');
    const bookDetailsContainer = document.getElementById('book-details');
    const errorContainer = document.getElementById('error-container');
    
    // Verificar que los elementos existen
    if (!loadingContainer || !bookDetailsContainer) {
        console.error("Elementos del DOM no encontrados:", {
            loadingContainer: !!loadingContainer,
            bookDetailsContainer: !!bookDetailsContainer
        });
        return;
    }
    
    // Asegurar que todos los elementos están en su estado inicial
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
    bookDetailsContainer.style.display = 'none';
    loadingContainer.style.display = 'flex';
    
    
    // Obtener detalles del libro
    fetch(`https://openlibrary.org/works/${bookId}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            
            // Ocultar carga y mostrar detalles
            loadingContainer.style.display = 'none';
            bookDetailsContainer.style.display = 'grid';
            
            // Actualizar el título de la página
            document.title = `${data.title || 'Libro'} | OpenBook`;
            
            // Llenar detalles del libro
            document.getElementById('book-title').textContent = data.title || 'Título desconocido';
            
            // Portada
            const coverElement = document.getElementById('book-cover');
            if (coverElement) {
                if (data.covers && data.covers.length > 0) {
                    coverElement.src = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
                    coverElement.onerror = () => { 
                        console.log("Error al cargar la imagen, usando imagen por defecto");
                        coverElement.src = '/images/default-cover.jpg';
                    };
                } else {
                    coverElement.src = '/images/default-cover.jpg';
                }
            }
            
            // Autor(es)
            loadAuthors(data.authors);
            
            // Descripción
            const descriptionElement = document.getElementById('book-description-text');
            if (descriptionElement) {
                if (data.description) {
                    if (typeof data.description === 'string') {
                        descriptionElement.textContent = data.description;
                    } else if (data.description.value) {
                        descriptionElement.textContent = data.description.value;
                    }
                } else {
                    descriptionElement.textContent = 'No hay descripción disponible para este libro.';
                }
            }
            
            // Fecha de publicación
            const publishDateElement = document.getElementById('book-publish-date');
            if (publishDateElement) {
                publishDateElement.textContent = data.first_publish_date || 'Fecha desconocida';
            }
            
            // Editorial
            const publisherElement = document.getElementById('book-publisher');
            if (publisherElement) {
                publisherElement.textContent = data.publishers ? data.publishers.join(', ') : 'Editorial desconocida';
            }
            
            // ISBN
            const isbnElement = document.getElementById('book-isbn');
            if (isbnElement && isbnElement.querySelector('span')) {
                if (data.isbn_13) {
                    isbnElement.querySelector('span').textContent = data.isbn_13[0];
                } else if (data.isbn_10) {
                    isbnElement.querySelector('span').textContent = data.isbn_10[0];
                }
            }
            
            // Páginas
            const pagesElement = document.getElementById('book-pages');
            if (pagesElement && pagesElement.querySelector('span')) {
                pagesElement.querySelector('span').textContent = data.number_of_pages || '-';
            }
            
            // Categorías/Subjects
            const subjectsElement = document.getElementById('book-subjects-list');
            if (subjectsElement) {
                subjectsElement.innerHTML = '';
                
                if (data.subjects && data.subjects.length > 0) {
                    data.subjects.slice(0, 10).forEach(subject => {
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
                openLibraryLink.href = `https://openlibrary.org${data.key}`;
            }
        })
        .catch(error => {
            console.error('Error cargando detalles del libro:', error);
            showBookError('No se pudo cargar la información del libro. Intente nuevamente.');
        });
}

/**
 * Carga información de los autores del libro
 * @param {Array} authorRefs - Referencias a autores
 */
function loadAuthors(authorRefs) {
    const authorsElement = document.getElementById('book-authors');
    
    if (!authorRefs || authorRefs.length === 0) {
        authorsElement.textContent = 'Autor desconocido';
        return;
    }
    
    // Extraer IDs de autores
    const authorPromises = authorRefs.map(ref => {
        const authorKey = ref.author ? ref.author.key : (ref.key || '');
        if (!authorKey) return Promise.resolve({ name: 'Autor desconocido' });
        
        return fetch(`https://openlibrary.org${authorKey}.json`)
            .then(response => response.json())
            .then(author => ({ name: author.name || 'Autor desconocido' }))
            .catch(() => ({ name: 'Autor desconocido' }));
    });
    
    Promise.all(authorPromises)
        .then(authors => {
            authorsElement.textContent = authors.map(author => author.name).join(', ');
        })
        .catch(error => {
            console.error('Error cargando autores:', error);
            authorsElement.textContent = 'Autor(es) no disponible(s)';
        });
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
    }
}
