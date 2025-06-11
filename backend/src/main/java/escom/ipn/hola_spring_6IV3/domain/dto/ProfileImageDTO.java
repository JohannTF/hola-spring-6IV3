package escom.ipn.hola_spring_6IV3.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para transferir datos de imagen de perfil
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileImageDTO {
    private byte[] imageBytes;
    private String contentType;
}
