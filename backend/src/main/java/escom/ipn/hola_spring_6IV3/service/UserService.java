package escom.ipn.hola_spring_6IV3.service;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import escom.ipn.hola_spring_6IV3.domain.dto.ProfileImageDTO;
import escom.ipn.hola_spring_6IV3.domain.dto.UserDTO;
import escom.ipn.hola_spring_6IV3.domain.entity.Role;
import escom.ipn.hola_spring_6IV3.domain.entity.User;
import escom.ipn.hola_spring_6IV3.exception.RoleNotFoundException;
import escom.ipn.hola_spring_6IV3.exception.UserNotFoundException;
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
    public List<UserDTO> getAllUsersDto() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convierte una entidad User a UserDto
     */
    private UserDTO convertToDto(User user) {
        UserDTO.UserDTOBuilder builder = UserDTO.builder()
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .country(user.getCountry())
                .role(user.getRole().getName().replace("ROLE_", ""));
        
        // Convertir imagen de perfil a Base64 si existe
        if (user.getProfileImage() != null && user.getProfileImage().length > 0) {
            String base64Image = Base64.getEncoder().encodeToString(user.getProfileImage());
            String imageDataUrl = "data:" + 
                (user.getProfileImageType() != null ? user.getProfileImageType() : "image/jpeg") + 
                ";base64," + base64Image;
            builder.profileImage(imageDataUrl);
            builder.profileImageType(user.getProfileImageType());
        }
        
        return builder.build();
    }
    
    /**
     * Actualiza un usuario con los datos proporcionados
     * 
     * @param user Usuario a actualizar
     * @param updatedUserDto Datos actualizados
     * @return El usuario actualizado
     */
    @Transactional
    public User updateUser(User user, UserDTO updatedUserDto) throws RoleNotFoundException {
        try {
            // Actualizar el nombre de usuario si se proporciona
            if (updatedUserDto.getUsername() != null && !updatedUserDto.getUsername().isEmpty()) {
                // Verificar que el nuevo nombre de usuario no exista (a menos que sea el mismo)
                if (!user.getUsername().equals(updatedUserDto.getUsername()) && 
                    userRepository.findByUsername(updatedUserDto.getUsername()).isPresent()) {
                    throw new RuntimeException("El nombre de usuario ya está en uso");
                }
                user.setUsername(updatedUserDto.getUsername());
            }
            
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
                Role role = Role.fromString(updatedUserDto.getRole().toUpperCase());
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
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            e.printStackTrace();
            throw e;
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
    
    /**
     * Actualiza la imagen de perfil de un usuario
     */
    @Transactional
    public void updateProfileImage(String username, byte[] imageBytes, String contentType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
        user.setProfileImage(imageBytes);
        user.setProfileImageType(contentType);
        userRepository.save(user);
    }

    /**
     * Obtiene la imagen de perfil de un usuario
     */
    public ProfileImageDTO getProfileImage(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException(username));
        
        if (user.getProfileImage() == null) {
            return null;
        }
        
        return ProfileImageDTO.builder()
                .imageBytes(user.getProfileImage())
                .contentType(user.getProfileImageType())
                .build();
    }
}
