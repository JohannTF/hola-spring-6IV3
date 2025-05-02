package escom.ipn.hola_spring_6IV3.exception;

/**
 * Excepción lanzada cuando se solicita un rol que no existe.
 */
public class RoleNotFoundException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public RoleNotFoundException(String roleName) {
        super("El rol '" + roleName + "' no fue encontrado.");
    }
}
