/**
 * Componente de botón de favorito reutilizable
 */

import { checkIfFavorite, toggleFavorite } from '../services/favoriteService.js';

/**
 * Crea un botón de favorito
 * @param {Object} bookData - Datos del libro (bookId, bookTitle, bookCoverId)
 * @param {Function} onToggle - Callback opcional cuando se alterna el favorito
 * @returns {HTMLElement} - Elemento del botón de favorito
 */
export function createFavoriteButton(bookData, onToggle = null) {
    const button = document.createElement('button');
    button.className = 'favorite-btn';
    button.setAttribute('data-book-id', bookData.bookId);
    button.innerHTML = '<i class="far fa-heart"></i>';
    button.title = 'Añadir a favoritos';

    // Estado inicial
    let isFavorite = false;

    // Verificar estado inicial
    updateFavoriteStatus();

    // Event listener
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            const result = await toggleFavorite(bookData);
            isFavorite = result.isFavorite;
            
            updateButtonAppearance();
            
            // Mostrar mensaje de éxito
            showFavoriteMessage(result.message);
            
            // Llamar callback si existe
            if (onToggle) {
                onToggle(isFavorite, bookData);
            }
            
        } catch (error) {
            console.error('Error al alternar favorito:', error);
            showFavoriteMessage('Error al actualizar favoritos', 'error');
        } finally {
            button.disabled = false;
        }
    });

    /**
     * Actualiza el estado del favorito desde el servidor
     */
    async function updateFavoriteStatus() {
        try {
            isFavorite = await checkIfFavorite(bookData.bookId);
            updateButtonAppearance();
        } catch (error) {
            console.error('Error al verificar estado de favorito:', error);
        }
    }

    /**
     * Actualiza la apariencia del botón según el estado
     */
    function updateButtonAppearance() {
        if (isFavorite) {
            button.innerHTML = '<i class="fas fa-heart"></i>';
            button.classList.add('is-favorite');
            button.title = 'Eliminar de favoritos';
        } else {
            button.innerHTML = '<i class="far fa-heart"></i>';
            button.classList.remove('is-favorite');
            button.title = 'Añadir a favoritos';
        }
    }

    return button;
}

/**
 * Muestra un mensaje de feedback al usuario
 */
function showFavoriteMessage(message, type = 'success') {
    // Crear elemento de mensaje
    const messageEl = document.createElement('div');
    messageEl.className = `favorite-message favorite-message-${type}`;
    messageEl.textContent = message;

    // Añadir al DOM
    document.body.appendChild(messageEl);

    // Mostrar con animación
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 10);

    // Ocultar después de 3 segundos
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 300);
    }, 3000);
}

/**
 * Añade funcionalidad de favoritos a tarjetas de libros existentes
 * @param {NodeList|Array} bookCards - Elementos de tarjetas de libros
 */
export function addFavoriteButtonsToBookCards(bookCards) {
    bookCards.forEach(card => {
        // Buscar datos del libro en la tarjeta
        const bookId = card.getAttribute('data-book-id');
        const titleElement = card.querySelector('.book-title, .card-title, h3, h4');
        const coverElement = card.querySelector('.book-cover img, .card-image img, img');
        
        if (!bookId || !titleElement) return;

        const bookData = {
            bookId: bookId,
            bookTitle: titleElement.textContent.trim(),
            bookCoverId: coverElement ? extractCoverIdFromSrc(coverElement.src) : null
        };

        // Crear botón de favorito
        const favoriteBtn = createFavoriteButton(bookData);
        
        // Añadir botón a la tarjeta
        const cardActions = card.querySelector('.card-actions, .book-actions');
        if (cardActions) {
            cardActions.appendChild(favoriteBtn);
        } else {
            // Crear contenedor de acciones si no existe
            const actionsContainer = document.createElement('div');
            actionsContainer.className = 'card-actions';
            actionsContainer.appendChild(favoriteBtn);
            card.appendChild(actionsContainer);
        }
    });
}

/**
 * Extrae el ID de cobertura de una URL de imagen
 */
function extractCoverIdFromSrc(src) {
    if (!src) return null;
    
    // Para imágenes de OpenLibrary
    const match = src.match(/\/covers\/[^\/]+\/([^-\.]+)/);
    return match ? match[1] : null;
}
