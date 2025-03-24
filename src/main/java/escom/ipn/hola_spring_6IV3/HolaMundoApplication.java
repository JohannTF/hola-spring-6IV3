package escom.ipn.hola_spring_6IV3;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;

import java.util.Arrays;
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class HolaMundoApplication {

    public static void main(String[] args) {
        // Intenta cargar las variables de entorno desde .env
        try {
            Dotenv.configure()
                .ignoreIfMissing() // No falla si no encuentra el archivo
                .systemProperties() // Automáticamente establece las propiedades del sistema
                .load();
            
            // Información reducida para centrarse en lo importante
            System.out.println("Cargando variables de entorno...");
        } catch (Exception e) {
            System.out.println("No se pudo cargar el archivo .env: " + e.getMessage());
        }
        
        // Iniciamos la aplicación y capturamos el contexto para depuración
        ConfigurableApplicationContext context = SpringApplication.run(HolaMundoApplication.class, args);
        
        // Imprimir la configuración efectiva para depuración
        Environment env = context.getEnvironment();
        String[] activeProfiles = env.getActiveProfiles();
        
        System.out.println("\n*** INFORMACIÓN DE CONFIGURACIÓN ***");
        System.out.println("Perfiles activos: " + (activeProfiles.length > 0 ? Arrays.toString(activeProfiles) : "default"));
        System.out.println("URL de base de datos: " + env.getProperty("spring.datasource.url"));
        System.out.println("Usuario de base de datos: " + env.getProperty("spring.datasource.username"));
        System.out.println("Modo JPA: " + env.getProperty("spring.jpa.hibernate.ddl-auto"));
        System.out.println("Aplicación: " + env.getProperty("spring.application.name"));
        System.out.println("**************************************\n");
    }
}