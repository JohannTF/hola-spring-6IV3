# Spring Boot Authentication Project

In this project, you can find a complete Spring Boot application with JWT authentication and role-based authorization. This project provides a RESTful API for user management with various endpoints.

## Authentication API

The application provides several endpoints for user authentication and management:

**URL**: `/auth/register`
**Method**: `POST`
**Parameters**:
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | username      |  required | String   | The username for the new account  |
> | password      |  required | String   | The password for the new account  |
> | firstName      |  required | String   | The first name of the user  |
> | lastName      |  required | String   | The last name of the user  |
> | country      |  required | String   | The country of the user  |
> | role      |  optional | String   | The role for the user (defaults to USER if not specified)  |

**Responses**:

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `400`         | `application/json`    | `{"Error":"Error message"}` |
> | `200`         | `application/json`    | `Success response (empty)`                      |

**Example request**:
```js
{
  "username": "john.doe",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "country": "USA",
  "role": "USER"
}
```

---
**URL**: `/auth/login`
**Method**: `POST`
**Parameters**:
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | username      |  required | String   | The username for authentication  |
> | password      |  required | String   | The password for authentication  |

**Responses**:

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `401`         | `application/json`    | `null` (Authentication failed) |
> | `200`         | `application/json`    | `{"token": "JWT_TOKEN"}`                      |

**Example request**:
```js
{
  "username": "john.doe",
  "password": "securepassword123"
}
```

**Example response**:
```js
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---
**URL**: `/api/info`
**Method**: `GET`
**Parameters**:
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | Authorization      |  required | String   | The JWT token in header (Bearer token)  |

**Responses**:

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `401`         | `application/json`    | Unauthorized (invalid token) |
> | `200`         | `application/json`    | User information and token claims |

**Example response**:
```js
{
  "claims": {
    "sub": "john.doe",
    "iat": 1709705342,
    "exp": 1709708942,
    "roles": ["USER"]
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

---
**URL**: `/api/admin/all-info`
**Method**: `GET`
**Parameters**:
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | Authorization      |  required | String   | The JWT token in header (Bearer token with ADMIN role)  |

**Responses**:

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `401`         | `application/json`    | Unauthorized (invalid token) |
> | `403`         | `application/json`    | Forbidden (not an admin) |
> | `200`         | `application/json`    | List of all users |

**Example response**:
```js
[
  {
    "username": "john.doe",
    "firstname": "John",
    "lastname": "Doe",
    "country": "USA",
    "role": "USER"
  },
  {
    "username": "admin.user",
    "firstname": "Admin",
    "lastname": "User",
    "country": "Canada",
    "role": "ADMIN"
  }
]
```

---
**URL**: `/api/update`
**Method**: `PUT`
**Parameters**:
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | Authorization      |  required | String   | The JWT token in header (Bearer token)  |
> | UserDto      |  required | Object   | User data to update  |

**Responses**:

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `401`         | `application/json`    | Unauthorized (invalid token) |
> | `200`         | `application/json`    | Updated user information and new token |

**Example request**:
```js
{
  "username": "john.doe",
  "firstname": "Johnny",
  "lastname": "Doe",
  "country": "Canada"
}
```

**Example response**:
```js
{
  "user": {
    "id": 1,
    "username": "john.doe",
    "firstName": "Johnny",
    "lastName": "Doe",
    "country": "Canada",
    "roles": ["USER"]
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---
**URL**: `/api/admin/update/{username}`
**Method**: `PUT`
**Parameters**:
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | Authorization      |  required | String   | The JWT token in header (Bearer token with ADMIN role)  |
> | username      |  required | String   | Username of the user to update (in URL)  |
> | UserDto      |  required | Object   | User data to update  |

**Responses**:

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `401`         | `application/json`    | Unauthorized (invalid token) |
> | `403`         | `application/json`    | Forbidden (not an admin) |
> | `200`         | `application/json`    | Updated user information |

**Example request**:
```js
{
  "firstname": "John",
  "lastname": "Smith",
  "country": "UK",
  "role": "ADMIN"
}
```

**Example response**:
```js
{
  "user": {
    "id": 1,
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Smith",
    "country": "UK",
    "roles": ["ADMIN"]
  }
}
```

---
**URL**: `/api/admin/delete/{username}`
**Method**: `DELETE`
**Parameters**:
> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | Authorization      |  required | String   | The JWT token in header (Bearer token with ADMIN role)  |
> | username      |  required | String   | Username of the user to delete (in URL)  |

**Responses**:

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `401`         | `application/json`    | Unauthorized (invalid token) |
> | `403`         | `application/json`    | Forbidden (not an admin) |
> | `200`         | `application/json`    | Empty response (success) |

## Project Structure

The project follows a standard Spring Boot architecture:

- `auth` package: Contains authentication controllers
- `config` package: Contains security configuration
- `controllers` package: REST and view controllers
- `dtos` package: Data Transfer Objects
- `model` package: Entity classes
- `repository` package: Data access layer
- `service` package: Business logic

## Security Configuration

The security configuration uses JWT (JSON Web Token) for authentication:

- Tokens are valid for 1 hour (3,600,000 milliseconds)
- Passwords are encrypted using BCrypt
- API endpoints are secured by role-based authorization
- Web views are accessible under the `/view` path

## Installation

To run the application, you need:

1. Java 21 or higher
2. MySQL database

Configure your database connection in the `application.properties` file:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database_name?useSSL=false&serverTimezone=UTC
spring.datasource.username=your_database_username
spring.datasource.password=your_database_password
```

You can start the application using:

```sh
./gradlew bootRun
```

Or build and run the JAR file:

```sh
./gradlew build
java -jar build/libs/your-application-name.jar
```

## Docker Deployment

For Docker deployment, you can use the following Dockerfile:

```dockerfile
FROM openjdk:21-jdk AS builder

WORKDIR /app

RUN microdnf install findutils

COPY build.gradle settings.gradle gradlew /app/

COPY gradle /app/gradle

RUN ./gradlew dependencies --no-daemon || true

COPY src /app/src

RUN ./gradlew build --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar /app/app.jar

CMD ["java", "-jar", "app.jar"]
```

And a Docker Compose file:

```yaml
services:
  db:
    image: mysql:8.0
    container_name: db
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: "your_root_password"
      MYSQL_DATABASE: "your_database"
      MYSQL_USER: "your_username"
      MYSQL_PASSWORD: "your_password"
    volumes:
      - db_data:/var/lib/mysql
    
  spring-auth-service:
    build:
      context: .
    container_name: spring-auth-service
    ports:
      - "8081:8081"
    depends_on:
      - db
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/your_database
      SPRING_DATASOURCE_USERNAME: your_username
      SPRING_DATASOURCE_PASSWORD: your_password
      JWT_SECRET: your_jwt_secret
      JWT_EXPIRATION: 3600000

volumes:
  db_data:
```

To build and run with Docker Compose:

```sh
docker-compose up --build
```

## Creating an Admin User

To create an admin user programmatically:

```java
@Component
public class AdminInitializer implements CommandLineRunner {
    
    private final UserService userService;
    
    public AdminInitializer(UserService userService) {
        this.userService = userService;
    }
    
    @Override
    public void run(String... args) {
        if (!userService.existsByUsername("admin")) {
            RegisterRequest admin = new RegisterRequest();
            admin.setUsername("admin");
            admin.setPassword("secure_admin_password");
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setCountry("System");
            admin.setRole("ADMIN");
            
            userService.registerUser(admin);
            System.out.println("Admin user created successfully");
        }
    }
}
```

## Views

The application provides the following views:

- `/view/my-profile` - User profile page
- `/view/admin/all-users` - Admin page to manage users