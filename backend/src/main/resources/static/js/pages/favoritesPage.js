/**
 * Página de favoritos - Gestión de libros favoritos del usuario
 */

import { getUserFavorites } from '../services/favoriteService.js';
import { createFavoriteButton } from '../components/favoriteButton.js';

/**
 * Inicializa la página de favoritos
 */
export function setupFavoritesPage() {
    console.log('Inicializando página de favoritos');
    
    loadFavorites();
    setupSearchFunctionality();
}

/**
 * Carga y muestra los favoritos del usuario
 */
async function loadFavorites() {
    const favoritesContainer = document.getElementById('favorites-container');
    const loadingElement = document.getElementById('favorites-loading');
    const emptyState = document.getElementById('favorites-empty');
    const favoritesCount = document.getElementById('favorites-count');
    
    try {
        if (loadingElement) loadingElement.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';
        if (favoritesContainer) favoritesContainer.innerHTML = '';

        const response = await getUserFavorites();
        const favorites = response.favorites || [];

        if (loadingElement) loadingElement.style.display = 'none';

        // Actualizar contador
        if (favoritesCount) {
            favoritesCount.textContent = favorites.length;
        }

        if (favorites.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        // Renderizar favoritos
        if (favoritesContainer) {
            favoritesContainer.innerHTML = favorites.map(favorite => 
                createFavoriteCard(favorite)
            ).join('');

            // Añadir event listeners después de renderizar
            addFavoriteCardListeners();
        }

    } catch (error) {
        console.error('Error al cargar favoritos:', error);
        if (loadingElement) loadingElement.style.display = 'none';
        if (favoritesContainer) {
            favoritesContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al cargar los favoritos. Por favor, intenta de nuevo.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Recargar</button>
                </div>
            `;
        }
    }
}

/**
 * Crea el HTML para una tarjeta de favorito
 */
function createFavoriteCard(favorite) {
    const coverUrl = favorite.bookCoverId 
        ? `https://covers.openlibrary.org/b/id/${favorite.bookCoverId}-M.jpg`
        : '/images/default-cover.jpg';

    const addedDate = new Date(favorite.addedDate).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `
        <div class="favorite-card" data-book-id="${favorite.bookId}">
            <div class="favorite-card-image">
                <img src="${coverUrl}" alt="${favorite.bookTitle}" loading="lazy" 
                     onerror="this.src='/images/default-cover.jpg'">
            </div>
            <div class="favorite-card-content">
                <h3 class="favorite-card-title">${favorite.bookTitle}</h3>
                <p class="favorite-card-date">
                    <i class="fas fa-calendar-plus"></i>
                    Añadido el ${addedDate}
                </p>
                <div class="favorite-card-actions">
                    <button class="btn btn-primary btn-sm" onclick="viewBookDetails('${favorite.bookId}')">
                        <i class="fas fa-eye"></i> Ver detalles
                    </button>
                    <div class="favorite-btn-container" data-book-id="${favorite.bookId}"></div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Añade event listeners a las tarjetas de favoritos
 */
function addFavoriteCardListeners() {
    // Añadir botones de favorito a cada tarjeta
    const favoriteBtnContainers = document.querySelectorAll('.favorite-btn-container');
    
    favoriteBtnContainers.forEach(container => {
        const bookId = container.getAttribute('data-book-id');
        const card = container.closest('.favorite-card');
        const titleElement = card.querySelector('.favorite-card-title');
        const imgElement = card.querySelector('img');
        
        if (bookId && titleElement) {
            const bookData = {
                bookId: bookId,
                bookTitle: titleElement.textContent.trim(),
                bookCoverId: extractCoverIdFromSrc(imgElement.src)
            };

            // Crear botón de favorito con callback para remover de la vista
            const favoriteBtn = createFavoriteButton(bookData, (isFavorite) => {
                if (!isFavorite) {
                    // Animar y remover la tarjeta
                    card.style.opacity = '0.5';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.remove();
                        updateFavoritesCount();
                        checkIfEmpty();
                    }, 300);
                }
            });

            container.appendChild(favoriteBtn);
        }
    });
}

/**
 * Navega a la página de detalles del libro
 */
window.viewBookDetails = function(bookId) {
    window.location.href = `/libro/${bookId}`;
};

/**
 * Actualiza el contador de favoritos
 */
function updateFavoritesCount() {
    const remainingCards = document.querySelectorAll('.favorite-card').length;
    const favoritesCount = document.getElementById('favorites-count');
    if (favoritesCount) {
        favoritesCount.textContent = remainingCards;
    }
}

/**
 * Verifica si no hay favoritos y muestra el estado vacío
 */
function checkIfEmpty() {
    const remainingCards = document.querySelectorAll('.favorite-card').length;
    const emptyState = document.getElementById('favorites-empty');
    
    if (remainingCards === 0 && emptyState) {
        emptyState.style.display = 'block';
    }
}

/**
 * Configura la funcionalidad de búsqueda en favoritos
 */
function setupSearchFunctionality() {
    const searchInput = document.getElementById('favorites-search');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            filterFavorites(searchTerm);
        });
    }
}

/**
 * Filtra los favoritos según el término de búsqueda
 */
function filterFavorites(searchTerm) {
    const favoriteCards = document.querySelectorAll('.favorite-card');
    let visibleCount = 0;

    favoriteCards.forEach(card => {
        const title = card.querySelector('.favorite-card-title').textContent.toLowerCase();
        const isVisible = title.includes(searchTerm);
        
        card.style.display = isVisible ? 'block' : 'none';
        if (isVisible) visibleCount++;
    });

    // Mostrar mensaje si no hay resultados
    const noResultsMessage = document.getElementById('no-search-results');
    if (noResultsMessage) {
        noResultsMessage.style.display = visibleCount === 0 && searchTerm ? 'block' : 'none';
    }
}

/**
 * Extrae el ID de cobertura de una URL de imagen
 */
function extractCoverIdFromSrc(src) {
    if (!src) return null;
    
    const match = src.match(/\/covers\/[^\/]+\/([^-\.]+)/);
    return match ? match[1] : null;
}
