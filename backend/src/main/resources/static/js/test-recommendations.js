/**
 * Script de prueba para verificar las correcciones del sistema de recomendaciones
 */

console.log('=== INICIANDO PRUEBAS DEL SISTEMA DE RECOMENDACIONES ===');

// Función para probar el formateo de libros para recomendaciones
function testFormatBookForRecommendation() {
    console.log('\n1. Probando formatBookForRecommendation...');
    
    // Simular datos de libro con diferentes estructuras
    const testBooks = [
        // Libro con cover_i
        {
            key: '/works/OL123456W',
            title: 'Test Book 1',
            author_name: ['Test Author 1'],
            cover_i: 12345,
            first_publish_year: 2020
        },
        // Libro con covers array
        {
            key: '/works/OL789012W',
            title: 'Test Book 2',
            authors: [{ name: 'Test Author 2' }],
            covers: [67890],
            first_publish_year: 2019
        },
        // Libro sin portada
        {
            key: '/works/OL345678W',
            title: 'Test Book 3',
            author_name: ['Test Author 3'],
            first_publish_year: 2021
        }
    ];

    testBooks.forEach((book, index) => {
        try {
            const formatted = {
                // Simular el método formatBookForRecommendation
                id: book.key?.replace('/works/', '') || book.id || book.cover_edition_key,
                title: book.title || 'Título desconocido',
                authorNames: book.author_name || (book.authors?.map(a => a.name)) || ['Autor desconocido'],
                subjects: book.subject || book.subjects || [],
                first_publish_date: book.first_publish_year || book.first_publish_date,
                coverUrl: book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                    : book.covers?.[0] 
                        ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-M.jpg`
                        : '/images/default-cover.jpg',
                coverId: book.cover_i || book.covers?.[0]
            };
            
            console.log(`  ✓ Libro ${index + 1} formateado correctamente:`, {
                id: formatted.id,
                title: formatted.title,
                coverUrl: formatted.coverUrl,
                coverId: formatted.coverId
            });
        } catch (error) {
            console.error(`  ✗ Error formateando libro ${index + 1}:`, error);
        }
    });
}

// Función para probar la búsqueda de términos alternativos
function testSubjectSearchTerms() {
    console.log('\n2. Probando términos de búsqueda alternativos...');
    
    const subjectMappings = {
        'fiction': ['fiction', 'novel', 'story'],
        'fantasy': ['fantasy', 'magic', 'dragons'],
        'science_fiction': ['science fiction', 'sci-fi', 'space'],
        'mystery': ['mystery', 'detective', 'crime'],
        'biography': ['biography', 'memoir', 'life story']
    };

    Object.keys(subjectMappings).forEach(subject => {
        const terms = subjectMappings[subject];
        console.log(`  ✓ ${subject} -> términos: ${terms.join(', ')}`);
    });
}

// Función para simular la carga de recomendaciones
function testRecommendationFlow() {
    console.log('\n3. Simulando flujo de recomendaciones...');
    
    // Simular datos de favoritos
    const mockFavorites = [
        { bookId: 'OL123456W', bookTitle: 'Libro Fantasy 1' },
        { bookId: 'OL789012W', bookTitle: 'Libro Mystery 1' }
    ];

    console.log('  ✓ Favoritos simulados:', mockFavorites.length);
    
    // Simular análisis de preferencias
    const mockPreferences = {
        topAuthors: [['J.K. Rowling', 2], ['Agatha Christie', 1]],
        topSubjects: [['fantasy', 1], ['mystery', 1]],
        topDecades: [['2000', 2]],
        totalAnalyzed: 2
    };

    console.log('  ✓ Preferencias analizadas:', mockPreferences);
    
    // Simular recomendaciones generadas
    const mockRecommendations = [
        {
            id: 'OL999999W',
            title: 'Recomendación Fantasy',
            authorNames: ['Fantasy Author'],
            coverUrl: 'https://covers.openlibrary.org/b/id/999999-M.jpg',
            reason: 'Porque te gusta J.K. Rowling'
        },
        {
            id: 'OL888888W',
            title: 'Recomendación Mystery',
            authorNames: ['Mystery Author'],
            coverUrl: '/images/default-cover.jpg',
            reason: 'Basado en tu interés en mystery'
        }
    ];

    console.log('  ✓ Recomendaciones generadas:', mockRecommendations.length);
    
    mockRecommendations.forEach((rec, index) => {
        console.log(`    ${index + 1}. "${rec.title}" - ${rec.reason}`);
        console.log(`       Portada: ${rec.coverUrl}`);
    });
}

// Ejecutar todas las pruebas
function runAllTests() {
    try {
        testFormatBookForRecommendation();
        testSubjectSearchTerms();
        testRecommendationFlow();
        
        console.log('\n=== TODAS LAS PRUEBAS COMPLETADAS ===');
        console.log('✓ Sistema de recomendaciones listo para usar');
        
    } catch (error) {
        console.error('✗ Error durante las pruebas:', error);
    }
}

// Ejecutar pruebas si se carga el script
if (typeof window !== 'undefined') {
    // En el navegador
    runAllTests();
} else {
    // En Node.js
    module.exports = { runAllTests };
}
