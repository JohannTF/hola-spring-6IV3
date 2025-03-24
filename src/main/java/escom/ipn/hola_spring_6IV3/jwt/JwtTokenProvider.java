package escom.ipn.hola_spring_6IV3.jwt;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

/**
 * Componente para generación y validación de tokens JWT.
 * Encapsula toda la lógica relacionada con la creación y verificación de tokens.
 */
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMills;

    /**
     * Genera un token JWT para un usuario sin claims adicionales
     */
    public String generateToken(UserDetails user) {
        return getToken(new HashMap<>(), user);
    }

    /**
     * Genera un token JWT con claims adicionales
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails user) {
        return getToken(extraClaims, user);
    }

    /**
     * Obtiene la clave secreta para firmar el JWT
     */
    private Key getKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Construye un token JWT con los datos proporcionados
     */
    @SuppressWarnings("deprecation")
    private String getToken(Map<String, Object> extraClaims, UserDetails user) {
        return Jwts.builder()
            .setClaims(extraClaims)
            .setSubject(user.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMills))
            .signWith(getKey())
            .compact();
    }

    /**
     * Extrae los claims del token JWT
     */
    @SuppressWarnings("deprecation")
    private Claims extractClaims(String token) {
        return Jwts.parser()
            .setSigningKey(getKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }
    
    /**
     * Verifica si el token ha expirado
     */
    private boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }
    
    /**
     * Extrae el nombre de usuario del token
     */
    public String extractUsername(String token){
        return extractClaims(token).getSubject();
    }
    
    /**
     * Extrae toda la información del token
     */
    public Map<String, Object> extractAllInfo(String token) {
        Claims claims = extractClaims(token);
        Map<String, Object> info = new HashMap<>();
        info.put("username", claims.getSubject());
        info.put("issuedAt", claims.getIssuedAt());
        info.put("expiration", claims.getExpiration());
        info.putAll(claims);
        return info;
    }

    /**
     * Valida un token JWT para un usuario específico
     */
    public boolean isTokenValid(String token, UserDetails user) {
        try {
            final String username = extractUsername(token);
            return username.equals(user.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
