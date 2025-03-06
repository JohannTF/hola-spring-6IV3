# Imagen base para compilar
FROM maven:3.9-eclipse-temurin-21-alpine AS build

# Establece el directorio de trabajo
WORKDIR /build

# Copia el archivo pom.xml para descargar dependencias
COPY pom.xml .

# Descarga dependencias
RUN mvn dependency:go-offline -B

# Copia el código fuente
COPY src ./src

# Compila y empaqueta la aplicación
RUN mvn package -DskipTests

# Imagen final para ejecutar
FROM eclipse-temurin:21-jre-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia el JAR desde la etapa de compilación
COPY --from=build /build/target/*.jar /app/app.jar

# Script para esperar a que MySQL esté disponible
RUN apk add --no-cache mysql-client

# Script de inicio para esperar a MySQL
COPY start.sh /app/
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]