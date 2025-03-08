# Imagen base para compilar y desarrollo
FROM maven:3.9-eclipse-temurin-21-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Instala herramientas de red para healthcheck
RUN apk add --no-cache netcat-openbsd mysql-client

# Copia el archivo pom.xml para descargar dependencias
COPY pom.xml .

# Descarga dependencias
RUN mvn dependency:go-offline -B

# Script de inicio para esperar a MySQL
COPY start.sh /app/
RUN chmod +x /app/start.sh

# Punto de entrada para desarrollo
ENTRYPOINT ["./start.sh"]