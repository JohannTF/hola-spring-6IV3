package escom.ipn.hola_spring_6IV3.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// Genera automáticamente los métodos getter, setter, toString, equals y hashCode
@Data
// Proporciona un patrón de diseño Builder para la clase
@Builder
// Genera un constructor sin argumentos
@NoArgsConstructor
// Genera un constructor con un argumento para cada campo en la clase
@AllArgsConstructor
public class RegisterRequest {
    
    String username;
    String password;
    String firstName;
    String lastName;
    String country;
    
}
