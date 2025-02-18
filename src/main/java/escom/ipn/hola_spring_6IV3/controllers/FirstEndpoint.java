package escom.ipn.hola_spring_6IV3.controllers;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class FirstEndpoint {
    /**
    * Controlador rest
    * @return texto "¡Hola Spring!"
    */
    @GetMapping("/")
    public String holaSpring() {
        return "¡Hola Spring!";
    }
    
}
