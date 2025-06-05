package escom.ipn.hola_spring_6IV3.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import escom.ipn.hola_spring_6IV3.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;

/**
 * Controlador REST para el manejo de imágenes de perfil de usuario.
 * Las imágenes se almacenan como BLOB en la base de datos.
 */
@RestController
@RequestMapping("/api/profile-image")
@RequiredArgsConstructor
@Slf4j
public class ProfileImageController {

    private final UserService userService;
    
    // Tipos de archivo permitidos
    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp"};
    private static final String[] ALLOWED_MIME_TYPES = {
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    };
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    /**
     * Subir imagen de perfil del usuario autenticado
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        
        try {
            String username = authentication.getName();
            
            // Validar el archivo
            String validationError = validateFile(file);
            if (validationError != null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", validationError));
            }
            
            // Convertir archivo a bytes
            byte[] imageBytes = file.getBytes();
            String contentType = file.getContentType();
            
            // Actualizar usuario en la base de datos
            userService.updateProfileImage(username, imageBytes, contentType);
            
            // Crear imagen en formato Base64 para respuesta
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);
            String imageDataUrl = "data:" + contentType + ";base64," + base64Image;
            
            log.info("Imagen de perfil subida exitosamente para usuario {}", username);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Imagen de perfil actualizada correctamente",
                "imageUrl", imageDataUrl
            ));
            
        } catch (IOException e) {
            log.error("Error al procesar imagen de perfil", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al procesar la imagen"));
        } catch (Exception e) {
            log.error("Error inesperado al subir imagen de perfil", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error inesperado: " + e.getMessage()));
        }
    }    /**
     * Obtener imagen de perfil del usuario especificado (devuelve bytes para img src)
     */
    @GetMapping("/{username}")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable String username) {
        try {
            // Obtener imagen desde el servicio
            var imageData = userService.getProfileImage(username);
            
            if (imageData == null || imageData.getImageBytes() == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Determinar el tipo de contenido
            String contentType = imageData.getContentType();
            if (contentType == null || contentType.trim().isEmpty()) {
                contentType = "image/jpeg"; // Fallback por defecto
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CACHE_CONTROL, "max-age=31536000") // Cache por 1 año
                .body(imageData.getImageBytes());
                
        } catch (Exception e) {
            log.error("Error al obtener imagen de perfil para usuario: {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtener imagen de perfil como JSON con Base64 (para JavaScript)
     */
    @GetMapping("/{username}/data")
    public ResponseEntity<?> getProfileImageData(@PathVariable String username) {
        try {
            // Obtener imagen desde el servicio
            var imageData = userService.getProfileImage(username);
            
            if (imageData == null || imageData.getImageBytes() == null) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Usuario no tiene imagen de perfil"
                ));
            }
            
            // Convertir a Base64
            String base64Image = Base64.getEncoder().encodeToString(imageData.getImageBytes());
            String contentType = imageData.getContentType();
            if (contentType == null || contentType.trim().isEmpty()) {
                contentType = "image/jpeg";
            }
            
            String imageDataUrl = "data:" + contentType + ";base64," + base64Image;
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "imageData", imageDataUrl,
                "contentType", contentType
            ));
                
        } catch (Exception e) {
            log.error("Error al obtener datos de imagen de perfil para usuario: {}", username, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("success", false, "error", "Error al obtener imagen de perfil"));
        }
    }

    /**
     * Eliminar imagen de perfil del usuario autenticado
     */
    @DeleteMapping
    public ResponseEntity<?> deleteProfileImage(Authentication authentication) {
        try {
            String username = authentication.getName();
            log.info("Usuario {} eliminando imagen de perfil", username);
            
            // Eliminar imagen de la base de datos
            userService.updateProfileImage(username, null, null);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Imagen de perfil eliminada correctamente"
            ));
            
        } catch (Exception e) {
            log.error("Error al eliminar imagen de perfil", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al eliminar imagen de perfil"));
        }
    }

    /**
     * Validar archivo subido
     */
    private String validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            return "El archivo está vacío";
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            return "El archivo es demasiado grande. Máximo permitido: 5MB";
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            return "Nombre de archivo inválido";
        }
        
        // Validar extensión del archivo
        String extension = getFileExtension(filename).toLowerCase();
        boolean validExtension = false;
        for (String allowedExt : ALLOWED_EXTENSIONS) {
            if (allowedExt.equals(extension)) {
                validExtension = true;
                break;
            }
        }
        
        if (!validExtension) {
            return "Tipo de archivo no permitido. Permitidos: " + String.join(", ", ALLOWED_EXTENSIONS);
        }
        
        // Validar tipo MIME
        String contentType = file.getContentType();
        if (contentType == null) {
            return "No se pudo determinar el tipo de archivo";
        }
        
        boolean validMimeType = false;
        for (String allowedMime : ALLOWED_MIME_TYPES) {
            if (allowedMime.equals(contentType)) {
                validMimeType = true;
                break;
            }
        }
        
        if (!validMimeType) {
            return "Tipo de archivo no soportado: " + contentType;
        }
        
        return null; // Sin errores
    }

    /**
     * Obtener extensión del archivo
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf('.') == -1) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
