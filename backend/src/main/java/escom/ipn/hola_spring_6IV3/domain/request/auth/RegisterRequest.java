package escom.ipn.hola_spring_6IV3.domain.request.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String country;
    private String role;
    
}
