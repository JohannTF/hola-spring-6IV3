/**
 * Componente de tabla de usuarios - Para administración
 */

import { deleteUserByAdmin } from '../services/adminService.js';
import { showToast, toggleElement } from '../utils/domUtils.js';

/**
 * Crear el encabezado de la tabla de usuarios
 * @returns {HTMLTableRowElement} - Fila de encabezado
 */
function createTableHeader() {
    const headerRow = document.createElement('tr');
      const headers = [
        'ID', 'Usuario', 'Nombre', 'Apellido', 'Rol', 'Contraseña', 'Acciones'
    ];
    
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    
    return headerRow;
}

/**
 * Alternar la visibilidad de la contraseña
 * @param {HTMLElement} icon - Icono que se ha pulsado
 */
function togglePasswordVisibility(icon) {
    const passwordContainer = icon.closest('.password-container');
    const passwordSpan = passwordContainer.querySelector('span');
    
    if (passwordSpan.textContent === '********') {
        // Obtener la contraseña almacenada en el dataset
        const realPassword = passwordContainer.dataset.password || '';
        passwordSpan.textContent = realPassword;
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordSpan.textContent = '********';
        icon.className = 'fas fa-eye';
    }
}

/**
 * Crear una celda para mostrar la contraseña con botón para mostrar/ocultar
 * @param {string} password - Contraseña del usuario
 * @returns {HTMLTableCellElement} - Celda de contraseña
 */
function createPasswordCell(password) {
    const td = document.createElement('td');
    
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container';
    passwordContainer.dataset.password = password; // Guardar la contraseña real para mostrarla después
    
    const span = document.createElement('span');
    span.textContent = '********';
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-eye';
    icon.onclick = () => togglePasswordVisibility(icon);
    
    passwordContainer.appendChild(span);
    passwordContainer.appendChild(icon);
    td.appendChild(passwordContainer);
    
    return td;
}

/**
 * Crear una celda de acciones para un usuario
 * @param {Object} user - Datos del usuario
 * @returns {HTMLTableCellElement} - Celda de acciones
 */
function createActionsCell(user) {
    const td = document.createElement('td');
    td.className = 'actions-cell';
    
    // Botón Editar
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => editUser(editBtn);
    editBtn.dataset.username = user.username;
    
    // Botón Eliminar
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.onclick = () => confirmDeleteUser(user.username);
    
    td.appendChild(editBtn);
    td.appendChild(deleteBtn);
    
    return td;
}

/**
 * Crear una fila para un usuario
 * @param {Object} user - Datos del usuario
 * @returns {HTMLTableRowElement} - Fila del usuario
 */
function createUserRow(user) {
    const row = document.createElement('tr');
    row.dataset.username = user.username;
    
    // Celda ID
    const idCell = document.createElement('td');
    idCell.textContent = user.id;
    row.appendChild(idCell);
    
    // Celda Usuario
    const usernameCell = document.createElement('td');
    usernameCell.textContent = user.username;
    row.appendChild(usernameCell);
    
    // Celda Nombre
    const nameCell = document.createElement('td');
    nameCell.textContent = user.firstname || '';
    row.appendChild(nameCell);
    
    // Celda Apellido
    const lastNameCell = document.createElement('td');
    lastNameCell.textContent = user.lastname || '';
    row.appendChild(lastNameCell);
    
    // Celda Roles
    const rolesCell = document.createElement('td');
    rolesCell.textContent = user.role || '';
    row.appendChild(rolesCell);
    
    // Celda Contraseña
    const passwordCell = createPasswordCell(user.password || '');
    row.appendChild(passwordCell);
    
    // Celda Acciones
    const actionsCell = createActionsCell(user);
    row.appendChild(actionsCell);
    
    return row;
}

/**
 * Configurar funcionalidad para editar usuario
 * @param {HTMLElement} button - Botón de edición pulsado
 */
function editUser(button) {
    const row = button.closest('tr');
    const username = row.dataset.username;
    
    // Guardar los valores originales
    const originalValues = {
        username: row.cells[1].textContent,
        name: row.cells[2].textContent,
        lastName: row.cells[3].textContent,
        roles: row.cells[4].textContent,
        password: row.cells[5].querySelector('.password-container').dataset.password || ''
    };
    
    // Cambiar las celdas a inputs
    createEditableCell(row.cells[1], 'username', originalValues.username);
    createEditableCell(row.cells[2], 'name', originalValues.name);
    createEditableCell(row.cells[3], 'lastName', originalValues.lastName);
    
    // Para el rol, crear un dropdown en lugar de un input
    createRoleDropdown(row.cells[4], originalValues.roles);
    
    // Añadir campo de contraseña editable
    createPasswordInput(row.cells[5], originalValues.password);
    
    // Cambiar los botones
    const actionsCell = row.cells[6];
    actionsCell.innerHTML = '';
    
    // Botón Guardar
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.innerHTML = '<i class="fas fa-save"></i>';
    // Pasamos el nombre de usuario original para identificar al usuario en la BD
    saveBtn.onclick = () => saveUser(saveBtn, username, originalValues.username);
    
    // Botón Cancelar
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-btn';
    cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
    cancelBtn.onclick = () => cancelEdit(cancelBtn, originalValues);
    cancelBtn.dataset.username = username;
    
    actionsCell.appendChild(saveBtn);
    actionsCell.appendChild(cancelBtn);
}

/**
 * Crear una celda editable para un usuario
 * @param {HTMLTableCellElement} cell - Celda a hacer editable
 * @param {string} name - Nombre del campo
 * @param {string} value - Valor actual
 */
function createEditableCell(cell, name, value) {
    const originalContent = cell.textContent;
    cell.dataset.original = originalContent;
    
    cell.innerHTML = '';
    const input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.value = value;
    
    cell.appendChild(input);
}

/**
 * Crear un dropdown para seleccionar roles
 * @param {HTMLTableCellElement} cell - Celda a hacer editable
 * @param {string} currentRoles - Roles actuales como string
 */
function createRoleDropdown(cell, currentRoles) {
    // Guardar contenido original
    const originalContent = cell.textContent;
    cell.dataset.original = originalContent;
    
    // Limpiar celda
    cell.innerHTML = '';
    
    // Crear select
    const select = document.createElement('select');
    select.name = 'role';
    select.className = 'role-select';
    
    // Opciones disponibles
    const options = [
        { value: 'USER', text: 'Usuario' },
        { value: 'ADMIN', text: 'Administrador' }
    ];
    
    // Añadir opciones
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        
        // Marcar como seleccionada si coincide con el rol actual
        const normalizedCurrentRole = currentRoles.toUpperCase().replace('ROLE_', '');
        if (normalizedCurrentRole === option.value) {
            optionElement.selected = true;
        }
        
        select.appendChild(optionElement);
    });
    
    cell.appendChild(select);
}

/**
 * Crear un campo para editar la contraseña
 * @param {HTMLTableCellElement} cell - Celda de contraseña
 * @param {string} currentPassword - Contraseña actual
 */
function createPasswordInput(cell, currentPassword) {
    // Guardar contenido original
    const originalContainer = cell.querySelector('.password-container');
    if (originalContainer) {
        cell.dataset.original = originalContainer.outerHTML;
    }
    
    // Limpiar celda
    cell.innerHTML = '';
    
    // Crear input para contraseña
    const input = document.createElement('input');
    input.type = 'password';
    input.name = 'password';
    input.value = currentPassword;
    input.placeholder = 'Nueva contraseña';
    input.className = 'password-input';
    
    // Crear botón para mostrar/ocultar contraseña
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'toggle-password-btn';
    toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    toggleBtn.onclick = () => {
        if (input.type === 'password') {
            input.type = 'text';
            toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        }
    };
    
    // Crear contenedor para alinear elementos
    const container = document.createElement('div');
    container.className = 'password-edit-container';
    container.appendChild(input);
    container.appendChild(toggleBtn);
    
    cell.appendChild(container);
}

/**
 * Guardar cambios en un usuario editado
 * @param {HTMLElement} button - Botón de guardar pulsado
 * @param {string} currentUsername - Nombre de usuario actual
 * @param {string} originalUsername - Nombre de usuario original (para identificación en BD)
 */
function saveUser(button, currentUsername, originalUsername) {
    const row = button.closest('tr');
    
    // Mostrar un indicador de carga en el botón
    const originalButtonHtml = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    // Obtener los nuevos valores
    const newUsername = row.cells[1].querySelector('input').value.trim();
    const firstname = row.cells[2].querySelector('input').value.trim();
    const lastname = row.cells[3].querySelector('input').value.trim();
    const role = row.cells[4].querySelector('select').value;
    const password = row.cells[5].querySelector('input').value;
    
    // Validar datos
    if (!newUsername) {
        showToast('El nombre de usuario no puede estar vacío', 'error');
        button.innerHTML = originalButtonHtml;
        button.disabled = false;
        return;
    }
    
    // Asegurarse de que estamos usando el nombre de usuario correcto para identificación
    const usernameToFind = originalUsername || currentUsername;
    
    console.log('Guardando usuario:', {
        originalUsername: usernameToFind,
        newData: { username: newUsername, firstname, lastname, role }
    });
    
    // Crear objeto con datos actualizados
    const userData = {
        username: newUsername, // Enviamos el nuevo nombre de usuario
        firstname: firstname,
        lastname: lastname,
        role: role
    };
    
    // Solo incluir la contraseña si no está vacía
    if (password && password.trim() !== '') {
        userData.password = password;
    }
    
    import('../services/adminService.js').then(({ updateUserByAdmin }) => {
        updateUserByAdmin(usernameToFind, userData)
            .then((response) => {
                showToast('Usuario actualizado con éxito', 'success');
                
                // Actualizar la vista
                row.cells[1].textContent = userData.username;
                row.cells[2].textContent = userData.firstname;
                row.cells[3].textContent = userData.lastname;
                row.cells[4].textContent = userData.role;
                
                // Si se actualizó la contraseña, actualizamos el contenedor de contraseña
                const passwordCell = createPasswordCell(userData.password || '');
                row.cells[5].innerHTML = passwordCell.innerHTML;
                
                // Restaurar botones y actualizar dataset con el nuevo nombre de usuario
                restoreActionButtons(row, userData.username);
                
                // Log para depuración
                console.log('Usuario actualizado correctamente:', userData.username);
            })            .catch(error => {
                console.error('Error al actualizar usuario:', error);
                
                // Mostrar un mensaje de error más detallado
                let errorMsg = 'Error al actualizar';
                if (error.message && error.message.includes('nombre de usuario ya está en uso')) {
                    errorMsg = 'El nombre de usuario ya está en uso por otro usuario';
                } else if (error.message) {
                    errorMsg = error.message;
                }
                
                showToast(`Error al actualizar: ${errorMsg}`, 'error');
                
                // Restaurar estado del botón
                button.innerHTML = originalButtonHtml;
                button.disabled = false;
            });
    });
}

/**
 * Cancelar la edición de un usuario
 * @param {HTMLElement} button - Botón de cancelar pulsado
 * @param {Object} originalValues - Valores originales
 */
function cancelEdit(button, originalValues) {
    const row = button.closest('tr');
    const username = button.dataset.username;
    
    // Restaurar valores originales
    row.cells[1].textContent = originalValues.username;
    row.cells[2].textContent = originalValues.name;
    row.cells[3].textContent = originalValues.lastName;
    row.cells[4].textContent = originalValues.roles;
    
    // Restaurar contenedor de contraseña
    const passwordCell = createPasswordCell(originalValues.password);
    row.cells[5].innerHTML = passwordCell.innerHTML;
    
    // Restaurar botones y dataset con el nombre de usuario original
    restoreActionButtons(row, originalValues.username);
    
    // Mostrar mensaje
    showToast('Edición cancelada', 'info');
}

/**
 * Restaurar botones de acciones después de editar
 * @param {HTMLTableRowElement} row - Fila del usuario
 * @param {string} username - Nombre de usuario
 */
function restoreActionButtons(row, username) {
    const actionsCell = row.cells[6];
    actionsCell.innerHTML = '';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.onclick = () => editUser(editBtn);
    editBtn.dataset.username = username;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.onclick = () => confirmDeleteUser(username);
    
    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
    
    // Actualizar el dataset de la fila para reflejar el nombre de usuario actualizado
    row.dataset.username = username;
}

/**
 * Mostrar confirmación para eliminar usuario
 * @param {string} username - Nombre de usuario a eliminar
 */
function confirmDeleteUser(username) {
    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${username}?`);
    
    if (confirmed) {
        deleteUser(username);
    }
}

/**
 * Eliminar un usuario
 * @param {string} username - Nombre de usuario a eliminar
 */
function deleteUser(username) {
    deleteUserByAdmin(username)
        .then(() => {
            const table = document.getElementById('users-table');
            const rows = table.querySelectorAll('tbody tr');
            
            for (const row of rows) {
                if (row.dataset.username === username) {
                    row.remove();
                    break;
                }
            }
            
            showToast(`Usuario ${username} eliminado con éxito`, 'success');
        })
        .catch(error => {
            showToast(`Error al eliminar usuario: ${error.message}`, 'error');
        });
}

/**
 * Renderizar la tabla de usuarios
 * @param {Array} users - Array de usuarios
 * @param {HTMLTableElement} table - Tabla a renderizar
 */
function renderUserTable(users, table) {
    if (!table) return;
    
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    // Limpiar tabla
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // Crear encabezado
    thead.appendChild(createTableHeader());
    
    // Crear filas
    users.forEach(user => {
        tbody.appendChild(createUserRow(user));
    });
}

export { renderUserTable, togglePasswordVisibility };
