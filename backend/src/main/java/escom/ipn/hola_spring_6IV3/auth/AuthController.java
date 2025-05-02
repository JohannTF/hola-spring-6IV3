package escom.ipn.hola_spring_6IV3.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import escom.ipn.hola_spring_6IV3.dtos.LoginRequest;
import escom.ipn.hola_spring_6IV3.dtos.RegisterRequest;
import escom.ipn.hola_spring_6IV3.dtos.JwtResponse;
import escom.ipn.hola_spring_6IV3.exception.UserAlreadyExistsException;
import escom.ipn.hola_spring_6IV3.exception.RoleNotFoundException;
import escom.ipn.hola_spring_6IV3.exception.UserNotFoundException;
import escom.ipn.hola_spring_6IV3.service.AuthService;
import lombok.RequiredArgsConstructor;

/**
 * Controlador REST para la autenticación de usuarios.
 * Maneja endpoints para el registro e inicio de sesión.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint para registrar un nuevo usuario
     * 
     * @param request Datos del usuario a registrar
     * @return ResponseEntity con el token JWT o mensaje de error
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            JwtResponse response = authService.registerUser(request);
            return ResponseEntity.ok(response);
        } catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Error: " + e.getMessage());
        } catch (RoleNotFoundException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error inesperado: " + e.getMessage());
        }
    }

    /**
     * Endpoint para autenticar un usuario
     * 
     * @param request Credenciales de inicio de sesión
     * @return ResponseEntity con el token JWT o error de autenticación
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
        try {
            JwtResponse jwtResponse = authService.loginUser(request);
            return ResponseEntity.ok(jwtResponse);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error de autenticación: " + e.getMessage());
        }
    }
}
