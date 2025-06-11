/**
 * Componente de header global - Header común para toda la aplicación
 */

import { logout } from '../services/authService.js';
import { isAdmin } from '../services/userService.js';

/**
 * Carga el header global en todas las páginas
 */
function loadGlobalHeader() {
    const headerContainer = document.getElementById('global-header');
    if (!headerContainer) return;

    // Inyectar el HTML del header
    headerContainer.innerHTML = `
        <div class="header-container">
            <div class="header-logo">
                <a href="/inicio">
                    <i class="fas fa-book-open"></i>
                    <span>OpenBook</span>
                </a>
            </div>
            <div class="header-search">
                <form id="header-search-form">
                    <input type="text" id="header-search-input" placeholder="Buscar libros...">
                    <button type="submit">
                        <i class="fas fa-search"></i>
                    </button>
                </form>
            </div>
            <nav class="header-nav">
                <ul>
                    <li><a href="/inicio" class="nav-link"><i class="fas fa-home"></i> Inicio</a></li>
                    <li><a href="/favorites" class="nav-link"><i class="fas fa-heart"></i> Favoritos</a></li>
                    <li><a href="/my-profile" class="nav-link"><i class="fas fa-user"></i> Mi Perfil</a></li>
                    <li id="admin-nav-item" style="display:none"><a href="/admin/all-users" class="nav-link"><i class="fas fa-users-cog"></i> Administrar</a></li>
                    <li><a href="#" id="logout-btn" class="nav-link"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
                </ul>
            </nav>
            <div class="header-mobile-toggle">
                <button id="mobile-menu-toggle">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </div>
    `;

    // Configurar el botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Verificar si el usuario es admin
    checkAndShowAdminLink();

    // Configurar la búsqueda en el header
    setupHeaderSearch();

    // Configurar menú móvil
    setupMobileMenu();
}

/**
 * Verifica si el usuario es admin y muestra el enlace de administración
 */
function checkAndShowAdminLink() {
    isAdmin().then(admin => {
        const adminNavItem = document.getElementById('admin-nav-item');
        if (adminNavItem) {
            adminNavItem.style.display = admin ? 'block' : 'none';
        }
    });
}

/**
 * Configura la búsqueda en el header
 */
function setupHeaderSearch() {
    const searchForm = document.getElementById('header-search-form');
    const searchInput = document.getElementById('header-search-input');
    
    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/inicio?search=${encodeURIComponent(query)}`;
            }
        });
    }
}

/**
 * Configura el menú móvil
 */
function setupMobileMenu() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const nav = document.querySelector('.header-nav');
    
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('show-mobile');
        });
    }
}

export { loadGlobalHeader };
