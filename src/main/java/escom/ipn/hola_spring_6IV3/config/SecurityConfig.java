package escom.ipn.hola_spring_6IV3.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import escom.ipn.hola_spring_6IV3.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;

/**
 * Configuración de seguridad para la aplicación.
 * Define reglas de acceso, políticas de sesión y filtros de autenticación.
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthenticationProvider authProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Configura el filtro de seguridad HTTP
     * 
     * @param http Objeto HttpSecurity a configurar
     * @return SecurityFilterChain configurada
     * @throws Exception Si hay errores en la configuración
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Deshabilitar CSRF (Cross-Site Request Forgery definida por defecto by SpringSecurity) para APIs REST con autenticación sin estado
            .csrf(csrf -> csrf.disable())
            
            // Configurar reglas de autorización para rutas
            .authorizeHttpRequests(authRequest -> 
                authRequest
                    // Permitir acceso a recursos estáticos
                    .requestMatchers("/js/**", "/styles/**", "/css/**", "/images/**").permitAll()
                    
                    // Permitir acceso a páginas y endpoints de autenticación
                    .requestMatchers("/login", "/register", "/auth/**", "/view/**").permitAll()
                    
                    // Rutas administrativas solo para rol ADMIN
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    
                    // Todas las demás rutas requieren autenticación
                    .anyRequest().authenticated()
            )
            
            // Configurar política de sesión sin estado (stateless) para JWT
            .sessionManagement(sessionManager -> 
                sessionManager.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Configurar proveedor de autenticación
            .authenticationProvider(authProvider)
            
            // Añadir filtro JWT antes del filtro estándar de autenticación
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            
            // Construir la configuración
            .build();
    }
}
