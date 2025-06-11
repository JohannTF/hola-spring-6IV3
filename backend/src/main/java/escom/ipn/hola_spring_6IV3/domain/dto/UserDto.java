package escom.ipn.hola_spring_6IV3.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String username;
    private String password;
    private String firstname;
    private String lastname;
    private String country;
    private String profileImage;
    private String profileImageType;
    private String role;
}
