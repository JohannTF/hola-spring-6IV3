package escom.ipn.hola_spring_6IV3.model;

import escom.ipn.hola_spring_6IV3.exception.RoleNotFoundException;

public enum Role {
    ROLE_USER("ROLE_USER"),
    ROLE_ADMIN("ROLE_ADMIN");
    
    private final String name;
    
    Role(String name) {
        this.name = name;
    }
    
    public String getName() {
        return name;
    }
    
    // Método helper para convertir de String a Enum
    public static Role fromString(String roleStr) throws RoleNotFoundException {
        for (Role role : Role.values()) {
            if (role.name.equals("ROLE_" + roleStr.toUpperCase())) {
                return role;
            }
        }
        throw new RoleNotFoundException(roleStr);
    }
    
    // Para obtener el nombre sin el prefijo "ROLE_"
    public String getSimpleName() {
        return name.replace("ROLE_", "");
    }
}
