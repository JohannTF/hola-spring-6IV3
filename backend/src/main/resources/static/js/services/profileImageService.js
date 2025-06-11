/**
 * Servicio para manejo de imágenes de perfil
 */

import { apiGet, apiPost, apiDelete } from '../api/api.js';

/**
 * Sube una nueva imagen de perfil
 * @param {File} imageFile - Archivo de imagen a subir
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function uploadProfileImage(imageFile) {
    if (!imageFile) {
        throw new Error('No se ha seleccionado ningún archivo');
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(imageFile.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten imágenes JPEG, PNG y GIF');
    }

    // Validar tamaño de archivo (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (imageFile.size > maxSize) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 5MB');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    // Usar fetch directamente para FormData porque api.js siempre pone Content-Type JSON
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    try {
        const response = await fetch('/api/profile-image/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // No establecer Content-Type para FormData
            },
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `Error ${response.status}: ${response.statusText}`
            }));
            throw new Error(errorData.error || errorData.message || `Error ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Obtiene la imagen de perfil de un usuario
 * @param {string} username - Nombre del usuario
 * @returns {Promise<Object>} Datos de la imagen
 */
export async function getProfileImage(username) {
    if (!username) {
        throw new Error('Se requiere un nombre de usuario');
    }

    try {
        const response = await fetch(`/api/profile-image/${encodeURIComponent(username)}/data`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null; // No tiene imagen
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // La respuesta es JSON con la imagen en Base64
        const data = await response.json();
        return {
            success: true,
            imageData: data.imageData
        };
    } catch (error) {
        console.error('Error getting profile image:', error);
        throw error;
    }
}

/**
 * Elimina la imagen de perfil del usuario actual
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function deleteProfileImage() {
    return apiDelete('/api/profile-image');
}

/**
 * Convierte un archivo a una URL de datos para previsualización
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} URL de datos de la imagen
 */
export function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
    });
}

/**
 * Valida y redimensiona una imagen si es necesario
 * @param {File} file - Archivo de imagen original
 * @param {number} maxWidth - Ancho máximo (por defecto 400px)
 * @param {number} maxHeight - Alto máximo (por defecto 400px)
 * @param {number} quality - Calidad de compresión JPEG (0.1 a 1.0, por defecto 0.8)
 * @returns {Promise<Blob>} Imagen redimensionada
 */
export function resizeImage(file, maxWidth = 400, maxHeight = 400, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calcular nuevas dimensiones manteniendo la proporción
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            // Configurar canvas
            canvas.width = width;
            canvas.height = height;

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir a blob
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Error al procesar la imagen'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = URL.createObjectURL(file);
    });
}
