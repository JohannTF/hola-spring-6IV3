package escom.ipn.hola_spring_6IV3.config;

import escom.ipn.hola_spring_6IV3.domain.entity.Role;
import escom.ipn.hola_spring_6IV3.domain.entity.User;
import escom.ipn.hola_spring_6IV3.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            // Verificar si ya existe el usuario administrador
            if (userRepository.findByUsername("sudo").isEmpty()) {
                // Crear el usuario administrador
                User user = User.builder()
                        .username("sudo")
                        .lastname("user")
                        .firstname("super")
                        .country("not defined")
                        .password(new BCryptPasswordEncoder().encode("password"))
                        .role(Role.ROLE_ADMIN)
                        .build();
                userRepository.save(user);
                System.out.println("Usuario administrador creado");
            } else {
                System.out.println("Usuario administrador ya existe");
            }
        };
    }
}