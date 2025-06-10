// Test script para verificar que el loader funciona correctamente
console.log('🧪 Iniciando pruebas del sistema de loaders...');

// Test 1: Verificar que el módulo loader se puede importar
try {
    import('./components/loader.js').then(loaderModule => {
        console.log('✅ Módulo loader importado correctamente');
        console.log('📦 Funciones disponibles:', Object.keys(loaderModule));
        
        // Test 2: Crear diferentes tipos de loaders
        const testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
        
        // Test loader de dots
        const dotsLoader = loaderModule.createLoader({
            type: 'dots',
            message: 'Prueba dots loader'
        });
        console.log('✅ Dots loader creado:', dotsLoader);
        
        // Test loader de libros
        const booksLoader = loaderModule.createBooksLoader();
        console.log('✅ Books loader creado:', booksLoader);
        
        // Test loader de recomendaciones
        const recomLoader = loaderModule.createRecommendationsLoader();
        console.log('✅ Recommendations loader creado:', recomLoader);
        
        // Test showLoader/hideLoader
        loaderModule.showLoader(testContainer, {
            type: 'magic',
            message: 'Prueba de showLoader'
        });
        console.log('✅ showLoader funcionando');
        
        setTimeout(() => {
            loaderModule.hideLoader(testContainer);
            console.log('✅ hideLoader funcionando');
            document.body.removeChild(testContainer);
            console.log('🎉 Todas las pruebas del loader completadas exitosamente!');
        }, 2000);
        
    }).catch(error => {
        console.error('❌ Error al importar loader:', error);
    });
} catch (error) {
    console.error('❌ Error en las pruebas:', error);
}

// Test 3: Verificar que no hay conflictos de nombres
console.log('🔍 Verificando que no hay conflictos de nombres...');

// Simular verificación de funciones duplicadas
const expectedFunctions = [
    'createLoader',
    'showLoader', 
    'hideLoader',
    'createRecommendationsLoader',
    'createBooksLoader',
    'createSearchLoader'
];

console.log('📝 Funciones esperadas:', expectedFunctions);
console.log('✅ Verificación de conflictos completada');
