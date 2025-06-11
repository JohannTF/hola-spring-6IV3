/**
 * Servicio de libros - Funciones para interactuar con la API de OpenLibrary
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
 * Busca libros por un término
 * @param {string} query - Término de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} - Libros encontrados
 */
async function searchBooks(query, limit = 20) {
    try {
        const response = await fetch(`${OPENLIBRARY_API.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.docs && data.docs.length > 0) {
            return data.docs.map(formatSearchResult);
        }
        
        return [];
    } catch (error) {
        console.error('Error en searchBooks:', error);
        throw error;
    }
}

/**
 * Obtiene libros por categoría
 * @param {string} category - Categoría a buscar
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Array>} - Libros de esa categoría
 */
async function getBooksByCategory(category, limit = 10) {
    try {
        const response = await fetch(`${OPENLIBRARY_API.SUBJECT}${category}.json?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.works && Array.isArray(data.works)) {
            return data.works.map(formatBookData);
        }
        
        return [];
    } catch (error) {
        console.error(`Error en getBooksByCategory (${category}):`, error);
        throw error;
    }
}

/**
 * Obtiene detalles de un libro por su ID
 * @param {string} bookId - ID del libro
 * @returns {Promise<Object>} - Detalles del libro
 */
async function getBookDetails(bookId) {
    try {
        const response = await fetch(`${OPENLIBRARY_API.WORK}${bookId}.json`);
        if (!response.ok) {
            throw new Error(`Error al cargar el libro (${response.status})`);
        }
        
        const book = await response.json();
        
        // Si hay autores, cargar sus nombres
        if (book.authors && book.authors.length > 0) {
            book.authorNames = await getAuthorsInfo(book.authors);
        } else {
            book.authorNames = ['Autor desconocido'];
        }
        
        return book;
    } catch (error) {
        console.error('Error en getBookDetails:', error);
        throw error;
    }
}

/**
 * Obtiene información de los autores
 * @param {Array} authorRefs - Referencias a autores
 * @returns {Promise<Array>} - Nombres de los autores
 */
async function getAuthorsInfo(authorRefs) {
    const authorPromises = authorRefs.map(async (authorRef) => {
        // Extraer ID del autor
        const authorKey = authorRef.author.key;
        if (!authorKey) return 'Autor desconocido';
        
        try {
            // Cargar datos del autor
            const response = await fetch(`https://openlibrary.org${authorKey}.json`);
            if (!response.ok) return 'Autor desconocido';
            
            const author = await response.json();
            return author.name || 'Autor desconocido';
        } catch (error) {
            console.error('Error al cargar autor:', error);
            return 'Autor desconocido';
        }
    });
    
    try {
        const authorNames = await Promise.all(authorPromises);
        return authorNames.filter(name => name !== null);
    } catch (error) {
        console.error('Error en getAuthorsInfo:', error);
        return ['Autor desconocido'];
    }
}

/**
 * Formatea los datos de un libro para su uso en la aplicación
 * @param {Object} book - Datos del libro de la API
 * @returns {Object} - Datos formateados
 */
function formatBookData(book) {
    // Obtener ID de portada si existe
    const coverId = book.cover_id || (book.covers && book.covers.length > 0 ? book.covers[0] : null);
    
    // URL de la portada
    const coverUrl = coverId 
        ? `${OPENLIBRARY_API.COVER}${coverId}-M.jpg` 
        : DEFAULT_COVER;
    
    // Extraer el ID único del trabajo
    const workId = book.key ? book.key.split('/').pop() : '';
    
    return {
        id: workId,
        title: book.title || 'Título desconocido',
        authors: book.authors ? book.authors.map(author => author.name || 'Autor desconocido') : ['Autor desconocido'],
        coverUrl: coverUrl,
        publishYear: book.first_publish_year || 'Año desconocido',
        subjects: book.subject || []
    };
}

/**
 * Formatea los resultados de búsqueda
 * @param {Object} book - Datos del libro de la búsqueda
 * @returns {Object} - Datos formateados
 */
function formatSearchResult(book) {
    const coverId = book.cover_i;
    const coverUrl = coverId 
        ? `${OPENLIBRARY_API.COVER}${coverId}-M.jpg` 
        : DEFAULT_COVER;
    
    // Extraer ID de trabajo si existe, o usar el primer ID de edición
    let workId = '';
    if (book.key) {
        workId = book.key.replace('/works/', '');
    } else if (book.edition_key && book.edition_key.length > 0) {
        workId = book.edition_key[0];
    }
    
    return {
        id: workId,
        title: book.title || 'Título desconocido',
        authors: book.author_name || ['Autor desconocido'],
        coverUrl: coverUrl,
        publishYear: book.first_publish_year || 'Año desconocido',
        subjects: book.subject || []
    };
}

/**
 * Función para obtener servicios de libros
 * @returns {Object} - Servicios de libros
 */
function getBooksService() {
    return {
        searchBooks,
        getBooksByCategory,
        getBookDetails,
        getAuthorsInfo
    };
}

export { getBooksService };
