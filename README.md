# 🛠️ Tarea 1. Herramientas para el desarrollo de software

> [!IMPORTANT]
> Las capturas de pantalla de las evidencias se encuentran en la carpeta `screenshots`

## 🎯 Objetivo

> Este repositorio contiene la primera tarea del curso de **Ingeniería de Software**, que consiste en la creación de un nuevo proyecto utilizando el framework **Spring Boot**. 
> El proyecto muestra la configuración de una aplicación básica de **Spring Boot** con un controlador **REST** que devuelve el mensaje `"¡Hola, Spring!"`.

## ⚡ Quick Start

<details>
  <summary>👣 Pasos para ejecutar el proyecto</summary>
Para ejecutar el proyecto:

1. **Clona el repositorio** desde GitHub:

```sh
git clone https://github.com/JohannTF/hola-spring-6IV3.git
```

2. Accede a la carpeta del proyecto:
``` sh
cd hola-spring-6IV3
```

3. Asegurarse de tener Java JDK y Maven instalados.
``` sh
java -version
mvn -version
```

4. Ejecuta el siguiente comando para iniciar la aplicación:
``` sh
mvn spring-boot:run
```
5. Una vez que la aplicación inicie, acceder desde el navegador a la ruta:
> http://localhost:8081/

</details>
---

## 📌 Índice de Instalaciones

> 🍵 [Java Development Kit (JDK)](#-java-development-kit-jdk)  
> 🪶 [Maven](#-maven)  
> 🌱 [Spring Boot](#-spring-boot)  
> 🖥️ [Git](#-git)  
> 🐈‍⬛ [GitHub Desktop](#-github-desktop)  
> 🛢️ [XAMPP](#-xampp)  

## 🍵 Java Development Kit (JDK)
1. Descargar la versión 21 de JDK del sitio de [Amazon Corretto](https://docs.aws.amazon.com/corretto/latest/corretto-21-ug/downloads-list.html).
2. Ejecutar el instalador y seguir las instrucciones que aparezcan en pantalla.
3. Configurar la variable de entorno `JAVA_HOME` con la ruta de la ruta `C:\Program Files\Amazon Corretto\jdk21.0.6_7`.
4. Verificar la instalación con el comando: `java -version` desde la terminal.

## 🪶 Maven 
1. Descargar Maven desde la sección de 'Descargas' de su [sitio oficial](https://maven.apache.org/download.cgi) (el archivo `.tar.gz`).
2. Descomprimir la carpeta en algún directorio.
3. Configurar la variable de entorno `PATH` con la ruta del directorio `bin` de Maven del sistema.
4. Verificar la instalación con el comando: `mvn -version` desde la terminal.

## 🌱 Spring Boot
Para instalar Spring Boot, basta con descargar las siguientes extensiones en VSCode:
1. Spring Boot Extension Pack
2. Spring Boot Tools
3. Spring Boot Dashboard
4. Spring Initializr Java Support

## 🖥️ Git
1. Descargar el instalador de **Git** desde [su sitio oficial](https://git-scm.com/downloads).
2. Ejecutar el instalador y seguir los pasos recomendados.
3. Configurar tu usuario con `git config --global user.name "Tu Nombre"` y `git config --global user.email "tu@email.com"`.
4. Verificar la instalación ejecutando `git --version` en la terminal.

## 🐈‍⬛ GitHub Desktop
1. Descargar **GitHub Desktop** desde [su sitio oficial](https://desktop.github.com/).
2. Ejecutar el instalador y seguir las instrucciones.
3. Iniciar sesión con tu cuenta de **GitHub**.

## 🛢️ XAMPP
1. Descargar **XAMPP** desde [su sitio oficial](https://www.apachefriends.org/es/index.html).
2. Ejecutar el instalador y seguir los pasos recomendados.
3. Iniciar los servicios desde el Panel de Control de **XAMPP**.
4. Verificar el funcionamiento accediendo a `http://localhost` en tu navegador.