package escom.ipn.hola_spring_6IV3.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import escom.ipn.hola_spring_6IV3.dtos.UserDto;
import escom.ipn.hola_spring_6IV3.exception.RoleNotFoundException;
import escom.ipn.hola_spring_6IV3.exception.UserNotFoundException;
import escom.ipn.hola_spring_6IV3.model.Role;
import escom.ipn.hola_spring_6IV3.model.User;
import escom.ipn.hola_spring_6IV3.repository.RoleRepository;
import escom.ipn.hola_spring_6IV3.repository.UserRepository;
import lombok.RequiredArgsConstructor;

/**
 * Servicio para la gestión de usuarios.
 * Permite operaciones CRUD y transformaciones entre entidades y DTOs.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Obtiene un usuario por su nombre de usuario
     */
    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
    }

    /**
     * Obtiene un usuario por su ID
     */
    public User getUserById(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("con ID " + userId));
    }

    /**
     * Obtiene todos los usuarios
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Obtiene todos los usuarios como DTOs (transferencia de datos)
     */
    public List<UserDto> getAllUsersDto() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convierte una entidad User a UserDto
     */
    private UserDto convertToDto(User user) {
        return UserDto.builder()
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .country(user.getCountry())
                .role(user.getRole().getName().replace("ROLE_", ""))
                .build();
    }
    
    /**
     * Actualiza un usuario con los datos proporcionados
     * 
     * @param user Usuario a actualizar
     * @param updatedUserDto Datos actualizados
     * @return El usuario actualizado
     */
    @Transactional
    public User updateUser(User user, UserDto updatedUserDto) {
        try {
            // Actualizar datos básicos
            if (updatedUserDto.getFirstname() != null) {
                user.setFirstname(updatedUserDto.getFirstname());
            }
            if (updatedUserDto.getLastname() != null) {
                user.setLastname(updatedUserDto.getLastname());
            }
            if (updatedUserDto.getCountry() != null) {
                user.setCountry(updatedUserDto.getCountry());
            }

            // Si hay un rol en la solicitud, actualizarlo
            if (updatedUserDto.getRole() != null && !updatedUserDto.getRole().isEmpty()) {
                String roleName = "ROLE_" + updatedUserDto.getRole().toUpperCase();
                
                System.out.println("Buscando rol con nombre: " + roleName);
                
                // Listar todos los roles disponibles para depuración
                List<String> allRoles = roleRepository.getAllRoleNames();
                System.out.println("Roles disponibles en la base de datos: " + allRoles);
                
                // Verificar si hay duplicados para depuración
                long roleCount = roleRepository.countByName(roleName);
                if (roleCount > 1) {
                    System.out.println("ADVERTENCIA: Se encontraron " + roleCount + " roles con el nombre: " + roleName);
                    
                    // Listar todos los roles duplicados para depuración
                    List<Object[]> duplicateRoles = roleRepository.findDuplicateRoles();
                    for (Object[] duplicate : duplicateRoles) {
                        System.out.println("Rol duplicado: " + duplicate[0] + " - Cantidad: " + duplicate[1]);
                    }
                } else if (roleCount == 0) {
                    throw new RoleNotFoundException(updatedUserDto.getRole());
                }
                
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RoleNotFoundException(updatedUserDto.getRole()));
                user.setRole(role);
            }

            // Solo actualizar la contraseña si explícitamente se proporciona
            if (updatedUserDto.getPassword() != null && !updatedUserDto.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUserDto.getPassword()));
            }

            // Registrar el usuario antes de guardar
            System.out.println("Usuario a guardar: " + user);
            
            return userRepository.save(user);
        } catch (Exception e) {
            // Registrar cualquier excepción que ocurra
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            e.printStackTrace();
            throw e; // Re-lanzar para que sea manejado por el controlador
        }
    }

    /**
     * Extrae el nombre de usuario de un token JWT
     */
    public String extractUsernameFromToken(String token) {
        return jwtService.extractUsername(token.replace("Bearer ", ""));
    }

    /**
     * Extrae toda la información de un token JWT
     */
    public Map<String, Object> extractAllInfoFromToken(String token) {
        return jwtService.extractAllInfo(token.replace("Bearer ", ""));
    }

    /**
     * Elimina un usuario por su nombre de usuario
     */
    public void deleteUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
        userRepository.delete(user);
    }
}
