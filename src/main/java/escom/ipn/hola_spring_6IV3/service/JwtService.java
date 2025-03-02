package escom.ipn.hola_spring_6IV3.service;

import org.springframework.security.core.userdetails.UserDetails;
// import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import escom.ipn.hola_spring_6IV3.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtTokenProvider jwtTokenProvider;
    // private final UserDetailsService userDetailsService;

    // Obtener token para un usuario
    public String getToken(UserDetails user) {
        return jwtTokenProvider.generateToken(user);
    }

    // Validar token con UserDetails
    public boolean isTokenValid(String token, UserDetails user) {
        return jwtTokenProvider.isTokenValid(token, user);
    }

    public String extractUsername(String token) {
        return jwtTokenProvider.extractUsername(token);
    }
}
