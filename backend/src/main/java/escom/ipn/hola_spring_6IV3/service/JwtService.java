package escom.ipn.hola_spring_6IV3.service;

import java.util.Map;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import escom.ipn.hola_spring_6IV3.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;

/**
 * Servicio para operaciones relacionadas con JSON Web Tokens.
 * Actúa como capa de abstracción sobre JwtTokenProvider.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Genera un token JWT para un usuario autenticado
     * 
     * @param user Detalles del usuario
     * @return Token JWT generado
     */
    public String getToken(UserDetails user) {
        return jwtTokenProvider.generateToken(user);
    }

    /**
     * Valida un token JWT para un usuario específico
     * 
     * @param token Token JWT a validar
     * @param user Usuario al que debe pertenecer el token
     * @return true si el token es válido para el usuario
     */
    public boolean isTokenValid(String token, UserDetails user) {
        return jwtTokenProvider.isTokenValid(token, user);
    }

    /**
     * Extrae el nombre de usuario de un token JWT
     * 
     * @param token Token JWT
     * @return Nombre de usuario extraído
     */
    public String extractUsername(String token) {
        return jwtTokenProvider.extractUsername(token);
    }

    /**
     * Extrae todos los claims del token JWT
     * 
     * @param token Token JWT
     * @return Mapa con todos los claims del token
     */
    public Map<String, Object> extractAllInfo(String token) {
        return jwtTokenProvider.extractAllInfo(token);
    }
}
