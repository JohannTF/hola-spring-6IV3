/**
 * Archivo principal - Punto de entrada para la aplicación
 * 
 * Este archivo se encarga de inicializar las funciones correspondientes
 * según la página en la que nos encontremos.
 */

import { initTheme } from './utils/themeUtils.js';
import { setupLoginForm, setupRegisterForm } from './pages/authPage.js';
import { setupProfilePage } from './pages/profilePage.js';
import { setupAdminPage } from './pages/adminPage.js';
import { setupHomePage } from './pages/booksPage.js';
import { setupBookDetailPage, loadBookDetails } from './pages/bookDetailPage.js';
import { loadGlobalHeader } from './components/header.js';
import { redirectIfNotAuthenticated } from './utils/validationUtils.js';

// Iniciar el sistema de temas en todas las páginas
initTheme();

// Detectar la página actual según la URL
const currentPath = window.location.pathname;

// Configurar la funcionalidad adecuada según la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando aplicación en:', currentPath);
    
    // Páginas que requieren autenticación
    if (currentPath !== '/login' && currentPath !== '/register') {
        redirectIfNotAuthenticated();
    }
    
    // Páginas con header global (excluir solo login y register)
    if (currentPath !== '/login' && currentPath !== '/register') {
        loadGlobalHeader();
    }    
    // Inicializar según la ruta
    if (currentPath === '/login') {
        setupLoginForm();
    }
    else if (currentPath === '/register') {
        setupRegisterForm();
    }
    else if (currentPath === '/my-profile') {
        setupProfilePage();
    }
    else if (currentPath === '/inicio') {
        setupHomePage();
    }    else if (currentPath.startsWith('/libro/')) {
        setupBookDetailPage();
    }
    else if (currentPath === '/libro-detalle') {
        setupBookDetailPage();
    }
    else if (currentPath === '/admin/all-users') {
        setupAdminPage();
    }
});

// Exportar funciones que podrían necesitarse globalmente
export {
    initTheme,
    loadGlobalHeader
};
