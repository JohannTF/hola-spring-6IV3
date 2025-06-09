/**
 * Componente para renderizar tarjetas de libros
 * Proporciona una interfaz uniforme para mostrar libros en carruseles, grids, etc.
 */

import { createFavoriteButton } from './favoriteButton.js';

/**
 * Crea una tarjeta de libro reutilizable
 * @param {Object} book - Datos del libro
 * @param {Object} options - Opciones de configuración
 * @returns {HTMLElement} - Elemento DOM de la tarjeta
 */
function createBookCard(book, options = {}) {
    const {
        showFavoriteButton = true, // Cambiado a true por defecto
        size = 'medium', // 'small', 'medium', 'large'
        clickHandler = null,
        className = '',
        showYear = true,
        showAuthors = true
    } = options;

    // Crear contenedor principal
    const card = document.createElement('div');
    card.className = `book-card ${className} book-card--${size}`;
    card.setAttribute('data-book-id', book.id);

    // Determinar URL de destino
    const bookUrl = book.id ? `/libro/${book.id}` : `/libro-detalle?id=${book.id}`;

    // Crear estructura HTML
    card.innerHTML = `
        <div class="book-card__content">
            <div class="book-card__cover">
                <img src="${book.coverUrl || '/images/default-cover.jpg'}" 
                     alt="${book.title || 'Libro'}" 
                     class="book-card__image"
                     onerror="this.src='/images/default-cover.jpg'">
                ${showFavoriteButton ? '<div class="book-card__favorite-container"></div>' : ''}
            </div>
            <div class="book-card__info">
                <h3 class="book-card__title" title="${book.title || 'Título desconocido'}">${book.title || 'Título desconocido'}</h3>
                ${showAuthors ? `<p class="book-card__authors">${formatAuthors(book.authors)}</p>` : ''}
                ${showYear ? `<p class="book-card__year">${book.publishYear || book.first_publish_year || ''}</p>` : ''}
            </div>
        </div>
    `;

    // Agregar evento de click personalizado o por defecto
    if (clickHandler) {
        card.addEventListener('click', (e) => clickHandler(e, book));
    } else {
        card.addEventListener('click', () => {
            window.location.href = bookUrl;
        });
    }
    
    // Agregar botón de favoritos si es necesario
    if (showFavoriteButton) {
        const favoriteContainer = card.querySelector('.book-card__favorite-container');
        if (favoriteContainer) {
            const bookData = {
                bookId: book.id || book.key?.replace('/works/', '') || book.edition_key?.[0],
                bookTitle: book.title || 'Título desconocido',
                bookCoverId: book.coverId || book.cover_i
            };
            
            const favoriteBtn = createFavoriteButton(bookData);
            favoriteContainer.appendChild(favoriteBtn);
        }
    }

    return card;
}

/**
 * Formatea la lista de autores para mostrar
 */
function formatAuthors(authors) {
    if (!authors || authors.length === 0) return 'Autor desconocido';
    
    if (Array.isArray(authors)) {
        if (typeof authors[0] === 'string') {
            return authors.join(', ');
        } else if (typeof authors[0] === 'object' && authors[0].name) {
            return authors.map(author => author.name).join(', ');
        }
    }
    
    if (typeof authors === 'string') {
        return authors;
    }
    
    return 'Autor desconocido';
}

/**
 * Crea una tarjeta para carrusel (slide)
 */
function createBookSlide(book, options = {}) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    
    const card = createBookCard(book, {
        ...options,
        size: 'medium',
        className: 'book-card--carousel'
    });
    
    slide.appendChild(card);
    return slide;
}

/**
 * Crea una tarjeta para grid de búsqueda
 */
function createSearchResultCard(book, options = {}) {
    return createBookCard(book, {
        ...options,
        size: 'medium',
        className: 'book-card--search-result',
        showFavoriteButton: true
    });
}

/**
 * Renderiza múltiples libros en un contenedor
 */
function renderBookCards(books, container, options = {}) {
    const {
        type = 'grid', // 'grid', 'carousel'
        showFavoriteButton = false,
        size = 'medium'
    } = options;

    if (!books || books.length === 0) {
        container.innerHTML = '<p class="no-results">No se encontraron libros.</p>';
        return;
    }

    container.innerHTML = '';

    if (type === 'carousel') {
        renderCarouselBooks(books, container, options);
    } else {
        renderGridBooks(books, container, options);
    }
}

/**
 * Renderiza libros en formato carrusel
 */
function renderCarouselBooks(books, container, options = {}) {
    // Crear estructura del carrusel
    const swiperContainer = document.createElement('div');
    swiperContainer.className = 'swiper-container book-carousel';
    
    const swiperWrapper = document.createElement('div');
    swiperWrapper.className = 'swiper-wrapper';
    
    // Crear slides
    books.forEach(book => {
        const slide = createBookSlide(book, options);
        swiperWrapper.appendChild(slide);
    });
    
    swiperContainer.appendChild(swiperWrapper);
    
    // Agregar botones de navegación
    const prevButton = document.createElement('div');
    prevButton.className = 'swiper-button-prev';
    
    const nextButton = document.createElement('div');
    nextButton.className = 'swiper-button-next';
    
    swiperContainer.appendChild(prevButton);
    swiperContainer.appendChild(nextButton);
    
    container.appendChild(swiperContainer);
    
    // Inicializar Swiper
    setTimeout(() => {
        new Swiper(swiperContainer, {
            slidesPerView: 1,
            spaceBetween: 10,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1024: { slidesPerView: 4, spaceBetween: 40 },
                1200: { slidesPerView: 5, spaceBetween: 50 }
            }
        });
    }, 100);
}

/**
 * Renderiza libros en formato grid
 */
function renderGridBooks(books, container, options = {}) {
    container.className = 'books-grid';
    
    books.forEach(book => {
        const card = createSearchResultCard(book, options);
        container.appendChild(card);
    });
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.bookCard = {
        create: createBookCard,
        createSlide: createBookSlide,
        createSearchResult: createSearchResultCard,
        render: renderBookCards,
        renderCarousel: renderCarouselBooks,
        renderGrid: renderGridBooks
    };
}

export {
    createBookCard,
    createBookSlide,
    createSearchResultCard,
    renderBookCards,
    renderCarouselBooks,
    renderGridBooks
};