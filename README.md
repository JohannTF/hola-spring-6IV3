# 📚 Plataforma de Literaria con Spring Boot <!-- omit from toc -->

El nombre para esta pequeña aplicación para ingenieria de software es **OpenBook**. Esta construida con Spring Boot que combina autenticación con JWT, consumo de la api proporcionada por OpenLibrary.
La plataforma permite a los usuarios descubrir y explorar algunos libros organizados por categorías, además de contar con un sistema de gestión de usuarios.

## 📋 Índice de Contenidos <!-- omit from toc -->

- [✨ Características Implementadas (Hasta el momento)](#-características-implementadas-hasta-el-momento)
- [🔑 API REST](#-api-rest)
  - [Endpoints de Autenticación](#endpoints-de-autenticación)
  - [Endpoints Usuarios](#endpoints-usuarios)
- [🖥️ Vistas de la Aplicación](#️-vistas-de-la-aplicación)
- [📖 Características de la Consulta de Libros](#-características-de-la-consulta-de-libros)
- [🏗️ Estructura del Proyecto](#️-estructura-del-proyecto)
- [⚙️ Instalación](#️-instalación)
- [Usuario Admin por Defecto](#usuario-admin-por-defecto)
- [APIs Externas](#apis-externas)

## ✨ Características Implementadas (Hasta el momento)

- Autenticación y autorización basada en JWT con roles de usuario
- Exploración de libros por categorías
- Visualización detallada de información de libros
- Interfaz responsiva con soporte para tema claro/oscuro
- Panel administrativo para gestión de usuarios

## 🔑 API REST

La aplicación proporciona varios endpoints para la autenticación, gestión de usuarios y acceso a la información:

### Endpoints de Autenticación

#### `/auth/register` <!-- omit from toc -->
**Método**: `POST`  
**Descripción**: Registra un nuevo usuario en el sistema.

| Parámetros | Respuestas |
|------------|------------|
| **username**: String (requerido)<br>**password**: String (requerido)<br>**firstName**: String (requerido)<br>**lastName**: String (requerido)<br>**country**: String (requerido)<br>**role**: String (opcional, por defecto "USER") | **200**: Registro exitoso (vacío)<br>**400**: `{"Error":"Mensaje de error"}` |

**Ejemplo de solicitud de registro**:
```json
{
  "username": "john.doe",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "country": "USA",
  "role": "USER"
}
```

#### `/auth/login` <!-- omit from toc -->
**Método**: `POST`  
**Descripción**: Inicia sesión y genera un token JWT.

| Parámetros | Respuestas |
|------------|------------|
| **username**: String (requerido)<br>**password**: String (requerido) | **200**: `{"token": "JWT_TOKEN"}`<br>**401**: `null` (Autenticación fallida) |

**Ejemplo de solicitud de login**:
```json
{
  "username": "john.doe",
  "password": "securepassword123"
}
```

**Ejemplo de respuesta de login exitoso**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Endpoints Usuarios

#### `/api/info` <!-- omit from toc -->
**Método**: `GET`  
**Descripción**: Obtiene información del usuario autenticado.

| Parámetros | Respuestas |
|------------|------------|
| **Authorization**: Bearer token (header) | **200**: Información de usuario y claims del token<br>**401**: No autorizado (token inválido) |

#### `/api/update` <!-- omit from toc -->
**Método**: `PUT`  
**Descripción**: Actualiza información del usuario actual.

| Parámetros | Respuestas |
|------------|------------|
| **Authorization**: Bearer token (header)<br>**Body**: Datos a actualizar | **200**: Usuario actualizado y nuevo token<br>**401**: No autorizado |

#### `/api/admin/all-info` <!-- omit from toc -->
**Método**: `GET`  
**Descripción**: Obtiene información de todos los usuarios.

| Parámetros | Respuestas |
|------------|------------|
| **Authorization**: Bearer token con rol ADMIN (header) | **200**: Lista de todos los usuarios<br>**401**: No autorizado<br>**403**: Prohibido (no es admin) |

#### `/api/admin/update/{username}` <!-- omit from toc -->
**Método**: `PUT`  
**Descripción**: Actualiza información de cualquier usuario.

| Parámetros | Respuestas |
|------------|------------|
| **Authorization**: Bearer token con rol ADMIN (header)<br>**username**: Nombre de usuario a actualizar (en URL)<br>**Body**: Datos a actualizar | **200**: Usuario actualizado<br>**401**: No autorizado<br>**403**: Prohibido |

#### `/api/admin/delete/{username}` <!-- omit from toc -->
**Método**: `DELETE`  
**Descripción**: Elimina un usuario del sistema.

| Parámetros | Respuestas |
|------------|------------|
| **Authorization**: Bearer token con rol ADMIN (header)<br>**username**: Nombre de usuario a eliminar (en URL) | **200**: Respuesta vacía (éxito)<br>**401**: No autorizado<br>**403**: Prohibido |

**Ejemplo de respuesta de `/api/info`**:
```json
{
  "claims": {
    "sub": "john.doe",
    "iat": 1709705342,
    "exp": 1709708942,
  },
  "usuario": {
    "id": 1,
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "country": "USA",
    "roles": ["USER"]
  }
}
```

## 🖥️ Vistas de la Aplicación

La aplicación proporciona las siguientes vistas principales (requiere inicio de sesión para acceder a ellas excepto register y login):

| Ruta | Descripción |
|------|-------------|
| `/inicio` | Página principal con exploración de libros por categorías |
| `/libro-detalle` | Detalles completos de un libro específico |
| `/my-profile` | Perfil del usuario donde puede ver y editar su información |
| `/admin/all-users` | Panel administrativo para gestionar usuarios (solo administradores) |
| `/login` | Página de inicio de sesión |
| `/register` | Página de registro de nuevos usuarios |

## 📖 Características de la Consulta de Libros

- **Categorías Predefinidas**: Ficción, Fantasía, Ciencia Ficción, Misterio y Biografías
- **Vista Detallada**: Información completa de libros, incluyendo:
  - Portada
  - Título y autor(es)
  - Fecha de publicación y editorial
  - ISBN y número de páginas
  - Descripción del contenido
  - Categorías asociadas
  - Enlace al libro desde Open Library

## 🏗️ Estructura del Proyecto

El proyecto sigue una arquitectura estándar de Spring Boot:

- `auth`: Controladores de autenticación
- `config`: Configuración de seguridad
- `controllers`: Controladores REST y de vistas
- `dtos`: Objetos de Transferencia de Datos
- `model`: Clases de entidad
- `repository`: Capa de acceso a datos
- `service`: Lógica de negocio
- `resources/templates`: Plantillas HTML para las vistas
- `resources/static`: Recursos estáticos (CSS, JavaScript, imágenes)

## ⚙️ Instalación

Para ejecutar la aplicación, necesitas:

1. Java 21 o superior
2. Base de datos MySQL

Configura tu conexión a la base de datos en un archivo `.env`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC
spring.datasource.username=your_database_username
spring.datasource.password=your_database_password
```

Para construir y ejecutar con Docker Compose:

```sh
docker-compose up --build
```

## Usuario Admin por Defecto

Por defecto, se carga un usuario administrador con las siguientes credenciales:

- **Username**: `sudo`
- **Lastname**: `user`
- **Firstname**: `super`
- **Country**: `not defined`
- **Password**: `password` (encriptada con BCrypt)
- **Role**: `ROLE_ADMIN`

Puedes utilizar estas credenciales para probar las funcionalidades de administrador.

## APIs Externas

La aplicación utiliza la API pública de OpenLibrary para obtener información sobre libros:

- Detalles de obras: `https://openlibrary.org/works/`
- Portadas de libros: `https://covers.openlibrary.org/b/id/`
- Información de autores: `https://openlibrary.org/authors/`
- Categorías: `https://openlibrary.org/subjects/`
