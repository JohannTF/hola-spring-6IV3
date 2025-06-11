/**
 * Servicio para gestionar favoritos - API calls
 */

import { getAuthToken } from '../utils/authUtils.js';

const API_BASE_URL = '/api/favorites';

/**
 * Obtiene todos los favoritos del usuario autenticado
 */
export async function getUserFavorites() {
    try {
        const token = getAuthToken();
        const response = await fetch(API_BASE_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        throw error;
    }
}

/**
 * Añade un libro a favoritos
 */
export async function addToFavorites(bookData) {
    try {
        const token = getAuthToken();
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: bookData.bookId,
                bookTitle: bookData.bookTitle,
                bookCoverId: bookData.bookCoverId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al añadir a favoritos:', error);
        throw error;
    }
}

/**
 * Elimina un libro de favoritos
 */
export async function removeFromFavorites(bookId) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/${bookId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al eliminar de favoritos:', error);
        throw error;
    }
}

/**
 * Verifica si un libro está en favoritos
 */
export async function checkIfFavorite(bookId) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/check/${bookId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data.isFavorite;
    } catch (error) {
        console.error('Error al verificar favorito:', error);
        return false;
    }
}

/**
 * Alterna el estado de favorito (añadir/eliminar)
 */
export async function toggleFavorite(bookData) {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/toggle`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                bookId: bookData.bookId,
                bookTitle: bookData.bookTitle,
                bookCoverId: bookData.bookCoverId
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al alternar favorito:', error);
        throw error;
    }
}

/**
 * Obtiene el número de favoritos del usuario
 */
export async function getFavoritesCount() {
    try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/count`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('Error al obtener contador de favoritos:', error);
        return 0;
    }
}
