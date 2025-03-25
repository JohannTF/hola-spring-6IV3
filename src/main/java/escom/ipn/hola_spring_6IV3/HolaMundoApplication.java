package escom.ipn.hola_spring_6IV3;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.io.File;
import java.util.Arrays;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class HolaMundoApplication {

    public static void main(String[] args) {
        // Detectar si estamos en Docker o entorno local
        boolean isDockerEnvironment = isRunningInDocker();
        System.out.println("\n*** ENTORNO DE EJECUCIÓN ***");
        System.out.println("Ejecutando en: " + (isDockerEnvironment ? "Docker" : "Local"));
        
        // Cargar variables desde .env solo si estamos en entorno local
        // o si faltan variables críticas en Docker
        if (!isDockerEnvironment || System.getenv("DB_URL") == null) {
            try {
                System.out.println("Intentando cargar configuración desde .env...");
                Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .systemProperties()
                    .load();
                
                if (dotenv.entries().isEmpty()) {
                    System.out.println("Archivo .env no encontrado o vacío. Usando valores predeterminados.");
                } else {
                    System.out.println("Configuración cargada correctamente desde .env");
                }
            } catch (Exception e) {
                System.out.println("Error al cargar configuración local: " + e.getMessage());
            }
        } else {
            System.out.println("Usando configuración de variables de entorno de Docker");
        }
        
        // Iniciamos la aplicación
        ConfigurableApplicationContext context = SpringApplication.run(HolaMundoApplication.class, args);
        
        // Información básica sobre la aplicación sin detalles sensibles
        Environment env = context.getEnvironment();
        String[] activeProfiles = env.getActiveProfiles();
        
        System.out.println("\n*** APLICACIÓN INICIADA ***");
        System.out.println("Nombre: " + env.getProperty("spring.application.name"));
        System.out.println("Perfiles activos: " + (activeProfiles.length > 0 ? Arrays.toString(activeProfiles) : "default"));
        System.out.println("Modo JPA: " + env.getProperty("spring.jpa.hibernate.ddl-auto"));
        System.out.println("**************************************\n");
    }
    
    /**
     * Detecta si la aplicación se está ejecutando en un contenedor Docker.
     */
    private static boolean isRunningInDocker() {
        try {
            // Método 1: Verificar archivo /.dockerenv (existente en muchos contenedores Docker)
            if (new File("/.dockerenv").exists()) {
                return true;
            }
            
            // Método 2: Buscar "docker" en /proc/1/cgroup
            File cgroupFile = new File("/proc/1/cgroup");
            if (cgroupFile.exists() && cgroupFile.canRead()) {
                try (java.util.Scanner scanner = new java.util.Scanner(cgroupFile)) {
                    while (scanner.hasNextLine()) {
                        if (scanner.nextLine().contains("docker")) {
                            return true;
                        }
                    }
                } catch (Exception e) {
                    // Ignorar excepción y continuar con otros métodos
                }
            }
            
            // Método 3: Comprobar variables de entorno típicas de Docker
            if (System.getenv("DOCKER_CONTAINER") != null ||
                System.getenv("DOCKER_HOST") != null) {
                return true;
            }
            
            // Método 4: Heurística - Si las variables críticas están todas presentes,
            // probablemente estemos en Docker según nuestra config
            if (System.getenv("DB_URL") != null && 
                System.getenv("DB_USERNAME") != null && 
                System.getenv("DB_PASSWORD") != null &&
                System.getenv("JWT_SECRET") != null) {
                return true;
            }
            
        } catch (Exception e) {
            System.out.println("Error al detectar entorno Docker: " + e.getMessage());
        }
        
        return false;
    }
}