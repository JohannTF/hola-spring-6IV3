#!/bin/sh

echo "Waiting for MySQL to start..."
while ! mysqladmin ping -h "mysql" --silent; do
    echo "MySQL not ready yet, waiting..."
    sleep 2
done
echo "MySQL is up - starting application"

java -jar /app/app.jar