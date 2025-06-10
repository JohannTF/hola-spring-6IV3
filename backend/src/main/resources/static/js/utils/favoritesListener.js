/**
 * Utilidad para gestionar la actualización de recomendaciones cuando cambian los favoritos
 */

import { updateRecommendations } from '../components/recommendationsSection.js';

/**
 * Configura el listener global para cambios en favoritos
 * Solo debe llamarse una vez por página
 */
export function setupGlobalFavoritesListener() {
    // Verificar si ya se configuró para evitar duplicados
    if (window._favoritesListenerConfigured) {
        return;
    }

    let debounceTimer;
    
    window.addEventListener('favoritesChanged', () => {
        // Debounce para evitar múltiples actualizaciones rápidas
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
                // Solo actualizar si estamos en la página de inicio
                if (window.location.pathname === '/inicio') {
                    await updateRecommendations();
                }
            } catch (error) {
                console.error(' Error actualizando recomendaciones:', error);
            }
        }, 3000); // Esperar 3 segundos para que el usuario termine de interactuar
    });

    // Marcar como configurado
    window._favoritesListenerConfigured = true;
}

/**
 * Función para disparar manualmente el evento de cambio en favoritos
 */
export function triggerFavoritesChange() {
    const event = new CustomEvent('favoritesChanged', {
        detail: {
            timestamp: Date.now(),
            source: 'manual'
        }
    });
    
    window.dispatchEvent(event);
}
