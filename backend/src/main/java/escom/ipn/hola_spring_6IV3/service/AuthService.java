package escom.ipn.hola_spring_6IV3.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import escom.ipn.hola_spring_6IV3.dtos.JwtResponse;
import escom.ipn.hola_spring_6IV3.dtos.LoginRequest;
import escom.ipn.hola_spring_6IV3.dtos.RegisterRequest;
import escom.ipn.hola_spring_6IV3.exception.UserAlreadyExistsException;
import escom.ipn.hola_spring_6IV3.exception.RoleNotFoundException;
import escom.ipn.hola_spring_6IV3.exception.UserNotFoundException;
import escom.ipn.hola_spring_6IV3.model.Role;
import escom.ipn.hola_spring_6IV3.model.User;
import escom.ipn.hola_spring_6IV3.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * Servicio para gestionar la autenticación y registro de usuarios.
 * Maneja operaciones relacionadas con JWT y credenciales de usuario.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    /**
     * Registra un nuevo usuario y genera su token JWT
     * 
     * @param request Datos del usuario a registrar
     * @return JwtResponse con el token de autenticacións
     * @throws RoleNotFoundException
     * @throws UserAlreadyExistsException
     */
    public JwtResponse registerUser(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException(request.getUsername());
        }

        // Obtener el rol correspondiente
        Role role = Role.fromString(request.getRole());

        // Crear el nuevo usuario
        User user = User.builder()
            .username(request.getUsername())
            .password(passwordEncoder.encode(request.getPassword()))
            .firstname(request.getFirstName())
            .lastname(request.getLastName())
            .country(request.getCountry())
            .role(role)
            .build();

        // Guardar el usuario en la BD
        userRepository.save(user);
        
        // Generar el token JWT
        String token = jwtService.getToken(user);
        
        return JwtResponse.builder()
            .token(token)
            .build();
    }

    /**
     * Autentica un usuario y genera su token JWT
     * 
     * @param request Credenciales de inicio de sesión
     * @return JwtResponse con el token de autenticación
     * @throws UserNotFoundException
     */
    public JwtResponse loginUser(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        
        UserDetails user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException(request.getUsername()));
        
        String token = jwtService.getToken(user);
        return new JwtResponse(token);
    }
}
