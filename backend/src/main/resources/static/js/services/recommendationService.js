/**
 * Servicio de recomendaciones - Genera recomendaciones basadas en favoritos del usuario
 */

import { getUserFavorites } from './favoriteService.js';
import { booksService } from './booksService.js';

/**
 * Clase principal del sistema de recomendaciones
 */
class RecommendationService {
    constructor() {
        this.userPreferences = null;
        this.cachedRecommendations = null;
        this.lastUpdate = null;
        this.debugMode = false; // Agregar modo debug
    }

    /**
     * Habilita o deshabilita el modo debug
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        this.debugLog('Modo debug ' + (enabled ? 'habilitado' : 'deshabilitado'));
    }

    /**
     * Log de debug
     */
    debugLog(message, data = null) {
        if (this.debugMode) {
            console.log(`[RecommendationService DEBUG] ${message}`, data || '');
        }
    }

    /**
     * Genera recomendaciones para el usuario actual
     * @param {number} limit - Número máximo de recomendaciones
     * @returns {Promise<Array>} - Array de libros recomendados
     */
    async generateRecommendations(limit = 15) {
        try {
            console.log('Generando recomendaciones para el usuario...');
            
            // Verificar si tenemos recomendaciones en caché (válidas por 1 hora)
            if (this.cachedRecommendations && this.lastUpdate && 
                Date.now() - this.lastUpdate < 3600000) {
                console.log('Devolviendo recomendaciones desde caché');
                return this.cachedRecommendations.slice(0, limit);
            }

            // Obtener favoritos del usuario
            const favoritesData = await getUserFavorites();
            const favorites = favoritesData.favorites || [];

            if (favorites.length === 0) {
                console.log('Usuario sin favoritos, devolviendo recomendaciones generales');
                return await this.getGeneralRecommendations(limit);
            }

            // Analizar preferencias del usuario
            this.userPreferences = await this.analyzeUserPreferences(favorites);
            console.log('Preferencias del usuario:', this.userPreferences);

            // Generar recomendaciones basadas en preferencias
            const recommendations = await this.findRecommendedBooks(this.userPreferences, favorites, limit);

            // Guardar en caché
            this.cachedRecommendations = recommendations;
            this.lastUpdate = Date.now();

            return recommendations;

        } catch (error) {
            console.error('Error generando recomendaciones:', error);
            return await this.getGeneralRecommendations(limit);
        }
    }

    /**
     * Analiza los favoritos del usuario para extraer preferencias
     * @param {Array} favorites - Array de libros favoritos
     * @returns {Promise<Object>} - Objeto con las preferencias del usuario
     */
    async analyzeUserPreferences(favorites) {
        const preferences = {
            authors: new Map(),
            subjects: new Map(),
            languages: new Map(),
            publishDecades: new Map(),
            totalBooks: favorites.length
        };

        // Obtener detalles de cada favorito
        const detailsPromises = favorites.map(async (favorite) => {
            try {
                const bookDetails = await booksService.getBookDetails(favorite.bookId);
                return bookDetails;
            } catch (error) {
                console.warn(`Error obteniendo detalles del libro ${favorite.bookId}:`, error);
                return null;
            }
        });

        const booksDetails = (await Promise.all(detailsPromises)).filter(book => book !== null);

        // Analizar cada libro
        for (const book of booksDetails) {
            // Analizar autores
            if (book.authorNames && book.authorNames.length > 0) {
                book.authorNames.forEach(author => {
                    if (author && author !== 'Autor desconocido') {
                        const count = preferences.authors.get(author) || 0;
                        preferences.authors.set(author, count + 1);
                    }
                });
            }

            // Analizar materias/categorías
            if (book.subjects && book.subjects.length > 0) {
                book.subjects.forEach(subject => {
                    if (subject && typeof subject === 'string') {
                        const normalizedSubject = this.normalizeSubject(subject);
                        const count = preferences.subjects.get(normalizedSubject) || 0;
                        preferences.subjects.set(normalizedSubject, count + 1);
                    }
                });
            }

            // Analizar décadas de publicación
            if (book.first_publish_date) {
                const decade = this.extractDecade(book.first_publish_date);
                if (decade) {
                    const count = preferences.publishDecades.get(decade) || 0;
                    preferences.publishDecades.set(decade, count + 1);
                }
            }

            // Analizar idiomas
            if (book.languages && book.languages.length > 0) {
                book.languages.forEach(lang => {
                    const count = preferences.languages.get(lang) || 0;
                    preferences.languages.set(lang, count + 1);
                });
            }
        }

        // Convertir Maps a arrays ordenados por frecuencia
        return {
            topAuthors: this.getTopEntries(preferences.authors, 5),
            topSubjects: this.getTopEntries(preferences.subjects, 8),
            topDecades: this.getTopEntries(preferences.publishDecades, 3),
            topLanguages: this.getTopEntries(preferences.languages, 2),
            totalAnalyzed: booksDetails.length
        };
    }

    /**
     * Encuentra libros recomendados basados en las preferencias
     * @param {Object} preferences - Preferencias del usuario
     * @param {Array} favorites - Libros favoritos (para evitar duplicados)
     * @param {number} limit - Límite de recomendaciones
     * @returns {Promise<Array>} - Array de libros recomendados
     */
    async findRecommendedBooks(preferences, favorites, limit) {
        const recommendedBooks = new Map(); // Usar Map para evitar duplicados
        const favoriteIds = new Set(favorites.map(f => f.bookId));

        try {
            // 1. Buscar por autores favoritos (40% peso)
            for (const [author, count] of preferences.topAuthors.slice(0, 3)) {
                const books = await this.searchBooksByAuthor(author, 8);
                books.forEach(book => {
                    if (!favoriteIds.has(book.id)) {
                        const score = this.calculateBookScore(book, preferences) + (count * 0.4);
                        if (!recommendedBooks.has(book.id) || recommendedBooks.get(book.id).score < score) {
                            recommendedBooks.set(book.id, { ...book, score, reason: `Porque te gusta ${author}` });
                        }
                    }
                });
            }

            // 2. Buscar por materias favoritas (35% peso)
            for (const [subject, count] of preferences.topSubjects.slice(0, 4)) {
                const books = await this.searchBooksBySubject(subject, 6);
                books.forEach(book => {
                    if (!favoriteIds.has(book.id)) {
                        const score = this.calculateBookScore(book, preferences) + (count * 0.35);
                        if (!recommendedBooks.has(book.id) || recommendedBooks.get(book.id).score < score) {
                            recommendedBooks.set(book.id, { ...book, score, reason: `Basado en tu interés en ${subject}` });
                        }
                    }
                });
            }

            // 3. Buscar libros populares en categorías de interés (25% peso)
            for (const [subject] of preferences.topSubjects.slice(0, 2)) {
                const books = await this.getPopularBooksInSubject(subject, 5);
                books.forEach(book => {
                    if (!favoriteIds.has(book.id)) {
                        const score = this.calculateBookScore(book, preferences) + 0.25;
                        if (!recommendedBooks.has(book.id) || recommendedBooks.get(book.id).score < score) {
                            recommendedBooks.set(book.id, { ...book, score, reason: `Popular en ${subject}` });
                        }
                    }
                });
            }

        } catch (error) {
            console.error('Error buscando recomendaciones:', error);
        }

        // Convertir Map a Array y ordenar por puntuación
        return Array.from(recommendedBooks.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }
    /**
     * Busca libros por autor usando múltiples métodos
     */
    async searchBooksByAuthor(author, limit = 10) {
        try {
            // Usar booksService para búsqueda más robusta
            const books = await booksService.searchBooks(`author:"${author}"`, limit);
            return books.map(book => this.formatBookForRecommendation({
                ...book,
                author_name: [author], // Asegurar que el autor esté presente  
                cover_i: book.coverId,
                title: book.title,
                key: book.key || `/works/${book.id}`
            }));
        } catch (error) {
            console.warn(`Error buscando libros del autor ${author}:`, error);
            return [];
        }
    }

    /**
     * Busca libros por materia/subject usando métodos alternativos
     */
    async searchBooksBySubject(subject, limit = 10) {
        try {
            // Método 1: Usar booksService con búsqueda por subject
            const books = await booksService.searchBooks(`subject:"${subject}"`, limit);
            if (books.length > 0) {
                return books.map(book => this.formatBookForRecommendation({
                    ...book,
                    subject: [subject],
                    cover_i: book.coverId,
                    key: book.key || `/works/${book.id}`
                }));
            }

            // Método 2: Búsqueda alternativa si no hay resultados
            const alternativeBooks = await booksService.searchBooks(subject, limit);
            return alternativeBooks.map(book => this.formatBookForRecommendation({
                ...book,
                subject: [subject],
                cover_i: book.coverId,
                key: book.key || `/works/${book.id}`
            }));
        } catch (error) {
            console.warn(`Error buscando libros de la materia ${subject}:`, error);
            return [];
        }
    }

    /**
     * Obtiene libros populares en una materia específica usando métodos alternativos
     */
    async getPopularBooksInSubject(subject, limit = 10) {
        try {
            // Método 1: Intentar con booksService usando palabras clave de la materia
            const searchTerms = this.getSubjectSearchTerms(subject);
            
            for (const term of searchTerms) {
                try {
                    const books = await booksService.searchBooks(term, Math.ceil(limit / 2));
                    if (books.length > 0) {
                        return books.slice(0, limit).map(book => this.formatBookForRecommendation({
                            ...book,
                            subject: [subject],
                            cover_i: book.coverId,
                            key: book.key || `/works/${book.id}`
                        }));
                    }
                } catch (termError) {
                    console.warn(`Error con término de búsqueda ${term}:`, termError);
                    continue;
                }
            }

            // Método 2: Fallback con términos generales
            const fallbackBooks = await booksService.searchBooks(subject.replace(/[_-]/g, ' '), limit);
            return fallbackBooks.map(book => this.formatBookForRecommendation({
                ...book,
                subject: [subject],
                cover_i: book.coverId,
                key: book.key || `/works/${book.id}`
            }));
        } catch (error) {
            console.warn(`Error obteniendo libros populares de ${subject}:`, error);
            return [];
        }
    }

    /**
     * Genera términos de búsqueda alternativos para una materia
     */
    getSubjectSearchTerms(subject) {
        const baseTerms = [subject];
        
        // Mapear términos comunes
        const subjectMappings = {
            'fiction': ['fiction', 'novel', 'story'],
            'fantasy': ['fantasy', 'magic', 'dragons'],
            'science_fiction': ['science fiction', 'sci-fi', 'space'],
            'mystery': ['mystery', 'detective', 'crime'],
            'biography': ['biography', 'memoir', 'life story'],
            'history': ['history', 'historical', 'past'],
            'romance': ['romance', 'love story', 'romantic'],
            'thriller': ['thriller', 'suspense', 'action'],
            'horror': ['horror', 'scary', 'supernatural'],
            'poetry': ['poetry', 'poems', 'verse']
        };

        const mappedTerms = subjectMappings[subject.toLowerCase()] || [];
        return [...baseTerms, ...mappedTerms];
    }

    /**
     * Calcula la puntuación de un libro basada en las preferencias del usuario
     */
    calculateBookScore(book, preferences) {
        let score = 0;

        // Puntuación por autor
        if (book.authorNames) {
            book.authorNames.forEach(author => {
                const authorScore = preferences.topAuthors.find(([a]) => a === author);
                if (authorScore) score += authorScore[1] * 0.3;
            });
        }

        // Puntuación por materia
        if (book.subjects) {
            book.subjects.forEach(subject => {
                const normalizedSubject = this.normalizeSubject(subject);
                const subjectScore = preferences.topSubjects.find(([s]) => s === normalizedSubject);
                if (subjectScore) score += subjectScore[1] * 0.2;
            });
        }

        // Puntuación por década
        if (book.first_publish_date) {
            const decade = this.extractDecade(book.first_publish_date);
            const decadeScore = preferences.topDecades.find(([d]) => d === decade);
            if (decadeScore) score += decadeScore[1] * 0.1;
        }

        return score;
    }

    /**
     * Recomendaciones generales para usuarios sin favoritos
     */
    async getGeneralRecommendations(limit = 15) {
        const popularTerms = [
            'popular fiction', 'bestseller', 'classic literature', 
            'fantasy adventure', 'mystery thriller', 'science fiction',
            'historical fiction', 'contemporary fiction', 'biography'
        ];
        const recommendations = [];

        for (const term of popularTerms) {
            try {
                const books = await booksService.searchBooks(term, 2);
                recommendations.push(...books.map(book => this.formatBookForRecommendation({
                    ...book,
                    cover_i: book.coverId,
                    key: book.key || `/works/${book.id}`,
                    reason: 'Recomendación popular',
                    score: Math.random() // Puntuación aleatoria para variedad
                })));

                // Evitar hacer demasiadas peticiones
                if (recommendations.length >= limit) break;
            } catch (error) {
                console.warn(`Error obteniendo recomendaciones generales para ${term}:`, error);
            }
        }

        return recommendations.slice(0, limit);
    }

    /**
     * Métodos auxiliares
     */
    normalizeSubject(subject) {
        return subject.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    extractDecade(dateString) {
        const year = parseInt(dateString);
        if (isNaN(year)) return null;
        return Math.floor(year / 10) * 10;
    }

    getTopEntries(map, limit) {
        return Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit);
    }
    
    formatBookForRecommendation(book) {
        this.debugLog('Formateando libro para recomendación:', book);
        
        // Determinar el ID de portada desde múltiples fuentes
        const coverId = book.cover_i || book.cover_id || book.covers?.[0] || book.coverId;
        this.debugLog('Cover ID encontrado:', coverId);
        
        // Crear URL de portada con fallback robusto
        let coverUrl = '/images/default-cover.jpg';
        if (coverId) {
            coverUrl = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
        } else if (book.coverUrl) {
            coverUrl = book.coverUrl;
        }
        this.debugLog('Cover URL generada:', coverUrl);

        // Formatear autores correctamente
        let authorNames = ['Autor desconocido'];
        if (book.author_name && Array.isArray(book.author_name)) {
            authorNames = book.author_name;
        } else if (book.authors && Array.isArray(book.authors)) {
            if (typeof book.authors[0] === 'string') {
                authorNames = book.authors;
            } else if (book.authors[0]?.name) {
                authorNames = book.authors.map(a => a.name);
            }
        } else if (typeof book.authors === 'string') {
            authorNames = [book.authors];
        }
        this.debugLog('Autores formateados:', authorNames);

        const formatted = {
            id: book.key?.replace('/works/', '') || book.id || book.cover_edition_key,
            title: book.title || 'Título desconocido',
            authorNames: authorNames,
            subjects: book.subject || book.subjects || [],
            first_publish_date: book.first_publish_year || book.first_publish_date,
            coverUrl: coverUrl,
            coverId: coverId
        };
        
        this.debugLog('Libro formateado:', formatted);
        return formatted;
    }

    /**
     * Limpia la caché de recomendaciones
     */
    clearCache() {
        this.cachedRecommendations = null;
        this.lastUpdate = null;
        this.userPreferences = null;
    }
}

// Exportar instancia singleton
export const recommendationService = new RecommendationService();
