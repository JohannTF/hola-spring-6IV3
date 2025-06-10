/**
 * Configuración y utilidades para debugging del sistema de recomendaciones
 */

// Función para habilitar modo debug
window.enableRecommendationDebug = function() {
    if (window.recommendationService) {
        window.recommendationService.setDebugMode(true);
        console.log('✓ Modo debug de recomendaciones habilitado');
    } else {
        console.warn('⚠ recommendationService no está disponible');
    }
};

// Función para deshabilitar modo debug
window.disableRecommendationDebug = function() {
    if (window.recommendationService) {
        window.recommendationService.setDebugMode(false);
        console.log('✓ Modo debug de recomendaciones deshabilitado');
    } else {
        console.warn('⚠ recommendationService no está disponible');
    }
};

// Función para probar recomendaciones con datos específicos
window.testRecommendationsWithData = async function(testData = null) {
    console.log('🧪 Iniciando prueba de recomendaciones...');
    
    if (!window.recommendationService) {
        console.error('❌ recommendationService no está disponible');
        return;
    }

    // Habilitar modo debug temporalmente
    const wasDebugEnabled = window.recommendationService.debugMode;
    window.recommendationService.setDebugMode(true);

    try {
        // Limpiar caché para prueba fresca
        window.recommendationService.clearCache();

        // Generar recomendaciones
        const recommendations = await window.recommendationService.generateRecommendations(5);
        
        console.log('✅ Recomendaciones generadas:', recommendations);
        console.log('📊 Total de recomendaciones:', recommendations.length);
        
        // Verificar portadas
        let validCovers = 0;
        let defaultCovers = 0;
        
        recommendations.forEach((rec, index) => {
            console.log(`📖 Recomendación ${index + 1}:`, {
                title: rec.title,
                coverUrl: rec.coverUrl,
                coverId: rec.coverId,
                reason: rec.reason
            });
            
            if (rec.coverUrl && rec.coverUrl !== '/images/default-cover.jpg') {
                validCovers++;
            } else {
                defaultCovers++;
            }
        });
        
        console.log(`📈 Estadísticas de portadas: ${validCovers} válidas, ${defaultCovers} por defecto`);
        
        // Restaurar estado de debug
        window.recommendationService.setDebugMode(wasDebugEnabled);
        
        return recommendations;
        
    } catch (error) {
        console.error('❌ Error en prueba de recomendaciones:', error);
        window.recommendationService.setDebugMode(wasDebugEnabled);
        throw error;
    }
};

// Función para verificar estado de imágenes
window.checkRecommendationImages = function(recommendations) {
    if (!recommendations || !Array.isArray(recommendations)) {
        console.warn('⚠ No se proporcionaron recomendaciones válidas');
        return;
    }

    console.log('🖼 Verificando estado de imágenes...');
    
    recommendations.forEach((rec, index) => {
        const img = new Image();
        
        img.onload = function() {
            console.log(`✅ Imagen ${index + 1} cargada correctamente: ${rec.coverUrl}`);
        };
        
        img.onerror = function() {
            console.warn(`⚠ Error cargando imagen ${index + 1}: ${rec.coverUrl}`);
            console.log(`   Fallback disponible: /images/default-cover.jpg`);
        };
        
        img.src = rec.coverUrl;
    });
};

// Función para generar reporte completo
window.generateRecommendationReport = async function() {
    console.log('📋 Generando reporte completo del sistema de recomendaciones...');
    
    const report = {
        timestamp: new Date().toISOString(),
        systemStatus: {},
        testResults: {},
        recommendations: null
    };

    // Verificar estado del sistema
    report.systemStatus = {
        recommendationServiceAvailable: !!window.recommendationService,
        booksServiceAvailable: !!window.booksService,
        swiperAvailable: !!window.Swiper,
        debugMode: window.recommendationService?.debugMode || false
    };

    try {
        // Ejecutar prueba de recomendaciones
        report.recommendations = await window.testRecommendationsWithData();
        
        // Analizar resultados
        report.testResults = {
            totalRecommendations: report.recommendations.length,
            withValidCovers: report.recommendations.filter(r => 
                r.coverUrl && r.coverUrl !== '/images/default-cover.jpg'
            ).length,
            withDefaultCovers: report.recommendations.filter(r => 
                !r.coverUrl || r.coverUrl === '/images/default-cover.jpg'
            ).length,
            uniqueAuthors: new Set(
                report.recommendations.flatMap(r => r.authorNames)
            ).size,
            reasonTypes: [...new Set(report.recommendations.map(r => r.reason))]
        };

        // Verificar imágenes
        window.checkRecommendationImages(report.recommendations);

    } catch (error) {
        report.testResults.error = error.message;
        console.error('❌ Error generando reporte:', error);
    }

    console.log('📊 Reporte completo:', report);
    
    // Guardar en localStorage para debugging
    localStorage.setItem('recommendationReport', JSON.stringify(report, null, 2));
    console.log('💾 Reporte guardado en localStorage como "recommendationReport"');
    
    return report;
};

// Auto-ejecutar verificación básica al cargar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.recommendationService) {
            console.log('🔧 Sistema de recomendaciones detectado');
            console.log('💡 Comandos disponibles:');
            console.log('   enableRecommendationDebug() - Habilitar modo debug');
            console.log('   disableRecommendationDebug() - Deshabilitar modo debug');
            console.log('   testRecommendationsWithData() - Probar recomendaciones');
            console.log('   generateRecommendationReport() - Generar reporte completo');
        }
    }, 1000);
});

console.log('🔧 Utilidades de debugging de recomendaciones cargadas');
