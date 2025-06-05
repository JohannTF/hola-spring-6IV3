package escom.ipn.hola_spring_6IV3.domain.entity;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user", uniqueConstraints = {@UniqueConstraint(columnNames = {"username"})})
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String username;

    private String lastname;
    private String firstname;
    private String country;    
    
    @Column(nullable = false)
    private String password;

    @Column(name = "profile_image", columnDefinition = "LONGBLOB")
    private byte[] profileImage; // Binary Large Object (BLOB)

    @Column(name = "profile_image_type")
    private String profileImageType; // Tipo de contenido (Multipurpose Internet Mail Extensions)

    @Enumerated(EnumType.STRING)
    private Role role;

    /**
     * Returns the authorities granted to the user. This method is used by Spring Security
     * to determine the roles and permissions assigned to the user.
     *
     * @return a collection of granted authorities, which in this case is a list containing
     *         a single SimpleGrantedAuthority object representing the user's role.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.getName()));
    }

}
