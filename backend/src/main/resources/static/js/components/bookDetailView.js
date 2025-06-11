/**
 * Componente para renderizar la vista detallada de un libro
 * Proporciona una interfaz uniforme para mostrar información completa del libro
 */

import { createFavoriteButton } from './favoriteButton.js';

/**
 * Crea la vista detallada de un libro
 * @param {Object} book - Datos completos del libro
 * @param {HTMLElement} container - Contenedor donde renderizar
 * @param {Object} options - Opciones de configuración
 */
function renderBookDetail(book, container, options = {}) {
    const {
        showFavoriteButton = true,
        showBackButton = true,
        backUrl = '/inicio'
    } = options;

    if (!container) {
        console.error('Container element is required for book detail view');
        return;
    }

    // Crear estructura HTML completa
    container.innerHTML = `
        <div class="book-detail">
            ${showBackButton ? `
                <div class="book-detail__back">
                    <a href="${backUrl}" class="btn-back">
                        <i class="fas fa-arrow-left"></i> Volver a inicio
                    </a>
                </div>
            ` : ''}
            
            <div class="book-detail__content">
                <div class="book-detail__cover-section">
                    <div class="book-detail__cover-container">
                        <img src="${getBookCoverUrl(book)}" 
                             alt="${book.title || 'Portada del libro'}" 
                             class="book-detail__cover-image"
                             onerror="this.src='/images/default-cover.jpg'">
                    </div>
                    ${showFavoriteButton ? '<div class="book-detail__favorite-container"></div>' : ''}
                </div>
                
                <div class="book-detail__info-section">
                    <div class="book-detail__header">
                        <h1 class="book-detail__title">${book.title || 'Título desconocido'}</h1>
                        <div class="book-detail__authors">
                            <span class="book-detail__authors-label">Por:</span>
                            <span class="book-detail__authors-list">${formatDetailAuthors(book)}</span>
                        </div>
                    </div>
                    
                    <div class="book-detail__metadata">
                        ${createMetadataSection(book)}
                    </div>
                    
                    <div class="book-detail__description">
                        <h3>Descripción</h3>
                        <div class="book-detail__description-content">
                            ${formatDescription(book.description)}
                        </div>
                    </div>
                    
                    ${book.subjects && book.subjects.length > 0 ? `
                        <div class="book-detail__subjects">
                            <h3>Categorías</h3>
                            <div class="book-detail__subjects-list">
                                ${createSubjectTags(book.subjects)}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="book-detail__actions">
                        ${createActionButtons(book)}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Agregar botón de favoritos si es necesario
    if (showFavoriteButton) {
        const favoriteContainer = container.querySelector('.book-detail__favorite-container');
        if (favoriteContainer) {
            const bookData = {
                bookId: book.id || extractBookId(book),
                bookTitle: book.title || 'Título desconocido',
                bookCoverId: book.covers?.[0] || book.cover_i
            };
            
            try {
                const favoriteBtn = createFavoriteButton(bookData);
                favoriteBtn.classList.add('favorite-btn--large');
                favoriteContainer.appendChild(favoriteBtn);
            } catch (error) {
                // Silent error handling for favorite button creation
            }
        }
    }

    // Actualizar título de la página
    document.title = `${book.title || 'Libro'} | OpenBook`;
}

/**
 * Crea un botón de favoritos básico como fallback
 */
function createBasicFavoriteButton(book) {
    return `
        <button class="favorite-btn favorite-btn--large" data-book-id="${book.id || extractBookId(book)}">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
        </button>
    `;
}

/**
 * Obtiene la URL de la portada del libro
 */
function getBookCoverUrl(book) {
    // Intentar diferentes fuentes de portada
    if (book.covers && book.covers.length > 0) {
        return `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`;
    }
    
    if (book.cover_i) {
        return `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
    }
    
    if (book.coverUrl) {
        return book.coverUrl.replace('-M.jpg', '-L.jpg');
    }
    
    return '/images/default-cover.jpg';
}

/**
 * Formatea los autores para la vista detallada
 */
function formatDetailAuthors(book) {
    if (book.authorNames && Array.isArray(book.authorNames)) {
        return book.authorNames.join(', ');
    }
    
    if (book.authors && Array.isArray(book.authors)) {
        if (typeof book.authors[0] === 'string') {
            return book.authors.join(', ');
        } else if (book.authors[0]?.name) {
            return book.authors.map(author => author.name).join(', ');
        }
    }
    
    if (book.author_name && Array.isArray(book.author_name)) {
        return book.author_name.join(', ');
    }
    
    return 'Autor desconocido';
}

/**
 * Crea la sección de metadatos del libro
 */
function createMetadataSection(book) {
    const metadata = [];
    
    // Fecha de publicación
    if (book.first_publish_date || book.publish_date) {
        metadata.push({
            label: 'Fecha de publicación',
            value: book.first_publish_date || book.publish_date
        });
    }
    
    // Editorial
    if (book.publishers && book.publishers.length > 0) {
        metadata.push({
            label: 'Editorial',
            value: book.publishers.join(', ')
        });
    }
    
    // ISBN
    if (book.isbn_13 && book.isbn_13.length > 0) {
        metadata.push({
            label: 'ISBN-13',
            value: book.isbn_13[0]
        });
    } else if (book.isbn_10 && book.isbn_10.length > 0) {
        metadata.push({
            label: 'ISBN-10',
            value: book.isbn_10[0]
        });
    }
    
    // Número de páginas
    if (book.number_of_pages) {
        metadata.push({
            label: 'Páginas',
            value: book.number_of_pages
        });
    }
    
    // Idioma
    if (book.languages && book.languages.length > 0) {
        metadata.push({
            label: 'Idioma',
            value: formatLanguages(book.languages)
        });
    }
    
    // Si no hay metadata, mostrar mensaje básico
    if (metadata.length === 0) {
        return '<p class="book-detail__no-metadata">Información adicional no disponible.</p>';
    }
    
    return metadata.map(item => `
        <div class="book-detail__metadata-item">
            <strong class="book-detail__metadata-label">${item.label}:</strong>
            <span class="book-detail__metadata-value">${item.value}</span>
        </div>
    `).join('');
}

/**
 * Formatea la descripción del libro
 */
function formatDescription(description) {
    if (!description) {
        return '<p class="book-detail__no-description">No hay descripción disponible para este libro.</p>';
    }
    
    if (typeof description === 'string') {
        return `<p>${description}</p>`;
    }
    
    if (typeof description === 'object' && description.value) {
        return `<p>${description.value}</p>`;
    }
    
    return '<p class="book-detail__no-description">No hay descripción disponible para este libro.</p>';
}

/**
 * Crea las etiquetas de categorías/subjects
 */
function createSubjectTags(subjects) {
    return subjects.slice(0, 10).map(subject => 
        `<span class="book-detail__subject-tag">${subject}</span>`
    ).join('');
}

/**
 * Crea los botones de acción
 */
function createActionButtons(book) {
    const bookKey = book.key || (book.id ? `/works/${book.id}` : '');
    
    return `
        <a href="https://openlibrary.org${bookKey}" 
           target="_blank" 
           class="btn btn-primary book-detail__action-btn">
            <i class="fas fa-external-link-alt"></i>
            Ver en Open Library
        </a>
    `;
}

/**
 * Formatea los idiomas
 */
function formatLanguages(languages) {
    const languageMap = {
        'eng': 'Inglés',
        'spa': 'Español',
        'fre': 'Francés',
        'ger': 'Alemán',
        'ita': 'Italiano',
        'por': 'Portugués'
    };
    
    return languages.map(lang => {
        const code = typeof lang === 'object' ? lang.key.replace('/languages/', '') : lang;
        return languageMap[code] || code;
    }).join(', ');
}

/**
 * Extrae el ID del libro desde diferentes fuentes
 */
function extractBookId(book) {
    if (book.id) return book.id;
    if (book.key) return book.key.replace('/works/', '');
    return null;
}

/**
 * Crea un skeleton loader para la vista detallada
 */
function createBookDetailSkeleton(container) {
    container.innerHTML = `
        <div class="book-detail-skeleton">
            <div class="book-detail-skeleton__back">
                <div class="skeleton-item skeleton-text skeleton-text--short"></div>
            </div>
            <div class="book-detail-skeleton__content">
                <div class="book-detail-skeleton__cover">
                    <div class="skeleton-item skeleton-image skeleton-image--book-cover"></div>
                </div>
                <div class="book-detail-skeleton__info">
                    <div class="skeleton-item skeleton-text skeleton-text--title"></div>
                    <div class="skeleton-item skeleton-text skeleton-text--medium"></div>
                    <div class="skeleton-item skeleton-text skeleton-text--long"></div>
                    <div class="skeleton-item skeleton-text skeleton-text--long"></div>
                    <div class="skeleton-item skeleton-text skeleton-text--medium"></div>
                </div>
            </div>
        </div>
    `;
}

// Exportar funciones
if (typeof window !== 'undefined') {
    window.bookDetailView = {
        render: renderBookDetail,
        createSkeleton: createBookDetailSkeleton
    };
}

export {
    renderBookDetail,
    createBookDetailSkeleton
};