package escom.ipn.hola_spring_6IV3.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HolaSpring {
    /**
    * Controlador rest
    * @return texto "¡Hola Spring!"
    */
    @GetMapping("/")
    public String holaSpring() {
        return "Hola Spring";
    }
}
