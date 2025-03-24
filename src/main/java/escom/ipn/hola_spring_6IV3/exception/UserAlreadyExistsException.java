package escom.ipn.hola_spring_6IV3.exception;

/**
 * Excepción lanzada cuando se intenta crear un usuario que ya existe.
 */
public class UserAlreadyExistsException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public UserAlreadyExistsException(String username) {
        super("El usuario '" + username + "' ya está registrado en el sistema.");
    }
}
