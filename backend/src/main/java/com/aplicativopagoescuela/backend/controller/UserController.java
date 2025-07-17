package com.aplicativopagoescuela.backend.controller;

import com.aplicativopagoescuela.backend.model.User;
import com.aplicativopagoescuela.backend.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        try {
            Long longId = Long.valueOf(id);
            Optional<User> user = userService.getUserById(longId);
            return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/users")
    public User createUser(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        Optional<User> existingOpt = userService.getUserById(id);
        if (existingOpt.isEmpty()) return ResponseEntity.notFound().build();
        User existing = existingOpt.get();
        // Actualiza los campos enviados
        existing.setName(user.getName());
        existing.setEmail(user.getEmail());
        existing.setRole(user.getRole());
        existing.setGrade(user.getGrade());
        existing.setPhone(user.getPhone());
        existing.setAddress(user.getAddress());
        // Actualiza la contraseña si se envía
        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existing.setPassword(user.getPassword());
        }
        return ResponseEntity.ok(userService.saveUser(existing));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/auth/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        Optional<User> existingUser = userService.findByEmail(user.getEmail());
        if (existingUser.isEmpty() || !userService.checkPassword(user.getPassword(), existingUser.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        // Devolver el usuario sin la contraseña
        User safeUser = existingUser.get();
        safeUser.setPassword(null);
        // El id se envía tal cual, el frontend puede convertirlo a string si es necesario
        return ResponseEntity.ok(safeUser);
    }
}
