# Imagen base para compilar y desarrollo
FROM maven:3.9-eclipse-temurin-21-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Instala herramientas necesarias
RUN apk add --no-cache bash mysql-client

# Copia el archivo pom.xml para descargar dependencias
COPY pom.xml .

# Descarga dependencias
RUN mvn dependency:go-offline -B

# Comando para iniciar la aplicación Spring Boot
# Nota: El perfil se establece mediante la variable SPRING_PROFILES_ACTIVE en docker-compose.yml
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Dspring.devtools.restart.enabled=true -Dspring.devtools.livereload.enabled=true"]