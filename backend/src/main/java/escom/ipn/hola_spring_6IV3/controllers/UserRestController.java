package escom.ipn.hola_spring_6IV3.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import escom.ipn.hola_spring_6IV3.domain.dto.UserDTO;
import escom.ipn.hola_spring_6IV3.domain.entity.User;
import escom.ipn.hola_spring_6IV3.exception.UserNotFoundException;
import escom.ipn.hola_spring_6IV3.service.JwtService;
import escom.ipn.hola_spring_6IV3.service.UserService;
import lombok.RequiredArgsConstructor;

/**
 * Controlador REST para operaciones de usuario.
 * Maneja endpoints para obtener información de usuarios, actualizarlos y eliminarlos.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserRestController {

    private final UserService userService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    /**
     * Obtiene información del usuario autenticado
     */
    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(@RequestHeader("Authorization") String token) {
        try {
            String username = userService.extractUsernameFromToken(token);
            User user = userService.getUserByUsername(username);
            Map<String, Object> claims = userService.extractAllInfoFromToken(token);
            return ResponseEntity.ok(Map.of("claims", claims, "usuario", user));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * Obtiene información de todos los usuarios (solo para administradores)
     */
    @GetMapping("/admin/all-info")
    public ResponseEntity<?> getAllUsersInfo() {
        try {
            List<UserDTO> users = userService.getAllUsersDto();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
    
    /**
     * Actualiza información del usuario autenticado
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String token, @RequestBody UserDTO updatedUserDto) {
        try {
            String username = userService.extractUsernameFromToken(token);
            User user = userService.getUserByUsername(username);
            
            // Registrar los datos recibidos para depuración
            System.out.println("DTO recibido para actualización: " + updatedUserDto);
            System.out.println("Usuario original: " + user);
            
            // No permitir cambio de rol en la auto-actualización
            updatedUserDto.setRole(user.getRole().getName().replace("ROLE_", ""));

            // No actualizar la contraseña si no se proporciona explícitamente
            if (updatedUserDto.getPassword() == null || updatedUserDto.getPassword().isEmpty()) {
                updatedUserDto.setPassword(null);
            }
            
            User updated = userService.updateUser(user, updatedUserDto);

            // Generar nuevo token con información actualizada
            UserDetails userDetails = userDetailsService.loadUserByUsername(updated.getUsername());
            String newToken = jwtService.getToken(userDetails);

            // Usar HashMap en lugar de Map.of para evitar limitaciones
            Map<String, Object> response = new HashMap<>();
            response.put("user", updated);
            response.put("token", newToken);
            return ResponseEntity.ok(response);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error User: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // Imprime el stack trace completo para depuración
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * Actualiza información de un usuario por su nombre de usuario (solo para administradores)
     */
    @PutMapping("/admin/update/{username}")
    public ResponseEntity<?> updateUserByAdmin(@PathVariable String username, @RequestBody UserDTO updatedUserDto) {
        try {
            User user = userService.getUserByUsername(username);
            User updated = userService.updateUser(user, updatedUserDto);
            return ResponseEntity.ok(Map.of("user", updated));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    /**
     * Elimina un usuario por su nombre de usuario (solo para administradores)
     */
    @DeleteMapping("/admin/delete/{username}")
    public ResponseEntity<?> deleteUser(@PathVariable String username) {
        try {
            userService.deleteUserByUsername(username);
            return ResponseEntity.ok().build();
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
