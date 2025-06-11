/**
 * Servicio para obtener información de libros desde OpenLibrary
 */

const OPENLIBRARY_API = {
    SEARCH: 'https://openlibrary.org/search.json',
    WORKS: 'https://openlibrary.org/works/',
    AUTHORS: 'https://openlibrary.org/authors/',
    COVERS: 'https://covers.openlibrary.org/b/id/',
    SUBJECTS: 'https://openlibrary.org/subjects/'
};

/**
 * Servicio de libros
 */
class BooksService {
    
    /**
     * Obtiene los detalles completos de un libro
     * @param {string} bookId - ID del libro (work ID)
     * @returns {Promise<Object>} - Datos completos del libro
     */
    async getBookDetails(bookId) {
        try {
            // Obtener información básica del work
            const workResponse = await fetch(`${OPENLIBRARY_API.WORKS}${bookId}.json`);
            
            if (!workResponse.ok) {
                throw new Error(`Error fetching work: ${workResponse.status}`);
            }
            
            const workData = await workResponse.json();
            
            // Obtener información de autores si existe
            const authorsPromises = [];
            if (workData.authors && workData.authors.length > 0) {
                workData.authors.forEach(author => {
                    if (author.author && author.author.key) {
                        authorsPromises.push(
                            fetch(`https://openlibrary.org${author.author.key}.json`)
                                .then(response => response.ok ? response.json() : null)
                                .catch(() => null)
                        );
                    }
                });
            }
            
            const authorsData = await Promise.all(authorsPromises);
            const authorNames = authorsData
                .filter(author => author && author.name)
                .map(author => author.name);
            
            // Formatear y combinar toda la información
            const formattedBook = {
                id: bookId,
                key: workData.key,
                title: workData.title,
                description: workData.description,
                covers: workData.covers,
                subjects: workData.subjects || [],
                first_publish_date: workData.first_publish_date,
                authors: workData.authors || [],
                authorNames: authorNames.length > 0 ? authorNames : ['Autor desconocido'],
                
                // Información adicional que podría estar disponible
                publishers: [],
                publish_date: workData.first_publish_date,
                isbn_13: [],
                isbn_10: [],
                number_of_pages: null,
                languages: [],
                
                // Para compatibilidad con el formato de búsqueda
                author_name: authorNames,
                cover_i: workData.covers ? workData.covers[0] : null
            };
            
            return formattedBook;
            
        } catch (error) {
            throw new Error('No se pudo obtener la información del libro');
        }
    }
    
    /**
     * Busca libros por término
     * @param {string} query - Término de búsqueda
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} - Array de libros
     */
    async searchBooks(query, limit = 20) {
        try {
            const response = await fetch(`${OPENLIBRARY_API.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`Error searching books: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.docs && Array.isArray(data.docs)) {
                return data.docs.map(book => ({
                    id: book.key ? book.key.replace('/works/', '') : null,
                    title: book.title || 'Título desconocido',
                    authors: book.author_name || ['Autor desconocido'],
                    coverUrl: book.cover_i 
                        ? `${OPENLIBRARY_API.COVERS}${book.cover_i}-M.jpg`
                        : '/images/default-cover.jpg',
                    coverId: book.cover_i,
                    publishYear: book.first_publish_year,
                    key: book.key
                }));
            }
            
            return [];
        
        } catch (error) {
            throw error;
        }
    }
    
    /**
     * Obtiene libros por categoría/subject
     * @param {string} subject - Categoría/subject
     * @param {number} limit - Límite de resultados
     * @returns {Promise<Array>} - Array de libros
     */
    async getBooksBySubject(subject, limit = 20) {
        try {
            const response = await fetch(`${OPENLIBRARY_API.SUBJECTS}${subject}.json?limit=${limit}`);
            
            if (!response.ok) {
                throw new Error(`Error fetching subject books: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.works && Array.isArray(data.works)) {
                return data.works.map(book => ({
                    id: book.key ? book.key.replace('/works/', '') : null,
                    title: book.title || 'Título desconocido',
                    authors: book.authors ? book.authors.map(a => a.name) : ['Autor desconocido'],
                    coverUrl: book.cover_id 
                        ? `${OPENLIBRARY_API.COVERS}${book.cover_id}-M.jpg`
                        : '/images/default-cover.jpg',
                    coverId: book.cover_id,
                    publishYear: book.first_publish_year,
                    key: book.key
                }));
            }
            
            return [];
        
        } catch (error) {
            throw error;
        }
    }
}

// Crear instancia única
const booksService = new BooksService();

/**
 * Obtener la instancia del servicio de libros
 */
function getBooksService() {
    return booksService;
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.booksService = booksService;
    window.getBooksService = getBooksService;
}

export { getBooksService, booksService };
