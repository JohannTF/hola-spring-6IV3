/**
 * Componente de sección de recomendaciones
 * Renderiza y gestiona la sección de libros recomendados en la página principal
 */

import { recommendationService } from '../services/recommendationService.js';
import { createBookCard, renderCarouselBooks } from './bookCard.js';
import { createRecommendationsLoader, showLoader, hideLoader } from './loader.js';

/**
 * Crea y renderiza la sección de recomendaciones
 * @param {HTMLElement} container - Contenedor donde insertar la sección
 * @returns {Promise<void>}
 */
export async function createRecommendationsSection(container) {
    if (!container) {
        return;
    }

    // Crear la estructura HTML de la sección
    const recommendationsHTML = `
        <div class="recommendations-section">
            <div class="section-header">
                <div class="section-title-group">
                    <h2 class="section-title">
                        <i class="fas fa-magic"></i>
                        Recomendado para ti
                    </h2>
                    <p class="section-subtitle">Descubre libros basados en tus gustos</p>
                </div>
                <div class="section-controls">
                    <button class="refresh-recommendations-btn" id="refresh-recommendations" title="Actualizar recomendaciones">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </div>
            </div>
              <div class="recommendations-container">
                <!-- Estado de carga -->
                <div id="recommendations-loading" class="recommendations-loading" style="display: none;">
                    <!-- El loader se insertará aquí dinámicamente -->
                </div>
                
                <!-- Contenedor de carrusel de recomendaciones -->
                <div id="recommendations-carousel-container" class="recommendations-carousel-container">
                    <!-- El carrusel se cargará aquí -->
                </div>
                
                <!-- Estado de error -->
                <div id="recommendations-error" class="recommendations-error" style="display: none;">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>No se pudieron cargar las recomendaciones</h3>
                    <p>Hubo un problema al generar tus recomendaciones personalizadas.</p>
                    <button class="btn btn-primary" onclick="location.reload()">
                        <i class="fas fa-redo"></i>
                        Intentar de nuevo
                    </button>
                </div>
                
                <!-- Estado sin favoritos -->
                <div id="recommendations-no-favorites" class="recommendations-no-favorites" style="display: none;">
                    <div class="no-favorites-icon">
                        <i class="far fa-heart"></i>
                    </div>
                    <h3>Añade algunos favoritos</h3>
                    <p>Marca libros como favoritos para recibir recomendaciones personalizadas basadas en tus gustos.</p>
                    <a href="#categories-container" class="btn btn-primary scroll-to-categories">
                        <i class="fas fa-search"></i>
                        Explorar categorías
                    </a>
                </div>
            </div>
            
            <!-- Indicador de recomendaciones -->
            <div class="recommendations-footer" id="recommendations-footer" style="display: none;">
                <div class="recommendations-stats">
                    <span class="recommendations-count">
                        <i class="fas fa-sparkles"></i>
                        <span id="recommendations-total">0</span> recomendaciones encontradas
                    </span>
                    <button class="btn btn-outline-secondary btn-sm" id="regenerate-recommendations">
                        <i class="fas fa-dice"></i>
                        Generar nuevas
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insertar HTML en el contenedor
    container.insertAdjacentHTML('beforeend', recommendationsHTML);    // Configurar event listeners
    setupRecommendationsEventListeners();

    // Cargar recomendaciones iniciales
    await loadRecommendations();
}

/**
 * Configura los event listeners para la sección de recomendaciones
 */
function setupRecommendationsEventListeners() {
    // Botón de refrescar recomendaciones
    const refreshBtn = document.getElementById('refresh-recommendations');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.classList.add('spinning');
            recommendationService.clearCache();
            
            // Mostrar loader mientras se actualizan
            const loadingElement = document.getElementById('recommendations-loading');
            if (loadingElement) {
                showLoader(loadingElement, {
                    type: 'magic',
                    size: 'medium',
                    message: 'Actualizando recomendaciones...',
                    color: 'primary'
                });
                showElement(loadingElement);
            }
            
            await loadRecommendations();
            refreshBtn.classList.remove('spinning');
        });
    }

    // Botón de regenerar recomendaciones
    const regenerateBtn = document.getElementById('regenerate-recommendations');
    if (regenerateBtn) {
        regenerateBtn.addEventListener('click', async () => {
            regenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            regenerateBtn.disabled = true;
            
            recommendationService.clearCache();
            await loadRecommendations();
            
            regenerateBtn.innerHTML = '<i class="fas fa-dice"></i> Generar nuevas';
            regenerateBtn.disabled = false;
        });
    }

    // Scroll suave a categorías
    const scrollBtn = document.querySelector('.scroll-to-categories');
    if (scrollBtn) {
        scrollBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const categoriesSection = document.getElementById('categories-container');
            if (categoriesSection) {
                categoriesSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }
}

/**
 * Carga y muestra las recomendaciones
 */
async function loadRecommendations() {
    const loadingElement = document.getElementById('recommendations-loading');
    const carouselContainer = document.getElementById('recommendations-carousel-container');
    const errorElement = document.getElementById('recommendations-error');
    const noFavoritesElement = document.getElementById('recommendations-no-favorites');
    const footerElement = document.getElementById('recommendations-footer');
    const totalElement = document.getElementById('recommendations-total');    try {
        // Mostrar loading con el nuevo componente
        if (loadingElement) {
            showLoader(loadingElement, {
                type: 'magic',
                size: 'medium',
                message: 'Generando recomendaciones personalizadas...',
                color: 'primary'
            });
            showElement(loadingElement);
        }
        
        hideElement(carouselContainer);
        hideElement(errorElement);
        hideElement(noFavoritesElement);
        hideElement(footerElement);

        // Generar recomendaciones
        const recommendations = await recommendationService.generateRecommendations(20);

        // Ocultar loading
        hideElement(loadingElement);

        if (recommendations.length === 0) {
            showElement(noFavoritesElement);
            return;
        }

        // Renderizar recomendaciones en carrusel
        renderRecommendationsCarousel(recommendations, carouselContainer);
        showElement(carouselContainer);
        showElement(footerElement);

        // Actualizar contador
        if (totalElement) {
            totalElement.textContent = recommendations.length;
        }

    } catch (error) {
        console.error('Error cargando recomendaciones:', error);
        hideElement(loadingElement);
        showElement(errorElement);
    }
}

/**
 * Renderiza las recomendaciones en formato carrusel
 * @param {Array} recommendations - Array de libros recomendados
 * @param {HTMLElement} container - Contenedor donde renderizar
 */
function renderRecommendationsCarousel(recommendations, container) {
    if (!recommendations || recommendations.length === 0) {
        container.innerHTML = '<p class="no-results">No hay recomendaciones disponibles.</p>';
        return;
    }

    // Limpiar contenedor
    container.innerHTML = '';
    // Formatear libros para el componente bookCard
    const formattedBooks = recommendations.map(rec => {
        // Asegurar que tenemos una URL de portada válida
        let coverUrl = rec.coverUrl;
        if (!coverUrl || coverUrl === '/images/default-cover.jpg') {
            // Intentar construir URL desde coverId si existe
            if (rec.coverId) {
                coverUrl = `https://covers.openlibrary.org/b/id/${rec.coverId}-M.jpg`;
            } else {
                coverUrl = '/images/default-cover.jpg';
            }
        }

        return {
            id: rec.id,
            title: rec.title,
            authors: rec.authorNames || ['Autor desconocido'],
            authorNames: rec.authorNames || ['Autor desconocido'],
            coverUrl: coverUrl,
            coverId: rec.coverId,
            publishYear: rec.first_publish_date,
            first_publish_year: rec.first_publish_date,
            reason: rec.reason // Información adicional para mostrar por qué se recomienda
        };
    });

    // Usar el componente de carrusel existente
    renderCarouselBooks(formattedBooks, container, {
        showFavoriteButton: true,
        size: 'medium',
        className: 'recommendation-card',
        showYear: true,
        showAuthors: true
    });
    
    // Añadir información de recomendación a cada tarjeta
    setTimeout(() => {
        addRecommendationBadges(container, recommendations);
    }, 200);
}

/**
 * Añade badges de recomendación a las tarjetas
 */
function addRecommendationBadges(container, recommendations) {
    const bookCards = container.querySelectorAll('.book-card');
    
    bookCards.forEach((card, index) => {
        if (recommendations[index] && recommendations[index].reason) {
            // Crear badge de razón
            const reasonBadge = document.createElement('div');
            reasonBadge.className = 'recommendation-reason-badge';
            reasonBadge.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>${recommendations[index].reason}</span>
            `;
            
            // Insertar badge en la tarjeta
            const cardContent = card.querySelector('.book-card__content');
            if (cardContent) {
                cardContent.appendChild(reasonBadge);
            }

            // Añadir clase especial para recomendaciones
            card.classList.add('recommendation-enhanced');
        }
    });
}

/**
 * Utilidades para mostrar/ocultar elementos
 */
function showElement(element) {
    if (element) element.style.display = 'block';
}

function hideElement(element) {
    if (element) element.style.display = 'none';
}

/**
 * Función para actualizar recomendaciones desde el exterior
 */
export async function updateRecommendations() {
    recommendationService.clearCache();
    await loadRecommendations();
}
