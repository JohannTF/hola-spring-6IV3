#!/bin/sh
set -e  # Esto hará que el script se detenga si hay errores

echo "Waiting for MySQL to start..."
while ! nc -z mysql 3306; do
    echo "MySQL not ready yet, waiting..."
    sleep 2
done
echo "MySQL is up - starting application"

exec java -jar /app/app.jar  # Usa exec para evitar problemas con Docker