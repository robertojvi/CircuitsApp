package com.example.fiberTower.controller;

import com.example.fiberTower.model.CreateUserRequest;
import com.example.fiberTower.model.Role;
import com.example.fiberTower.model.UserDTO;
import com.example.fiberTower.service.UserService;
import com.example.fiberTower.security.JwtAuthenticationToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://192.168.68.111:5173"})
public class UserManagementController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            JwtAuthenticationToken authentication = 
                    (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String role = authentication.getRole();
            if (!role.equals("SUPER") && !role.equals("ADMIN")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Only SUPER and ADMIN users can access this resource.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        try {
            JwtAuthenticationToken authentication = 
                    (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String role = authentication.getRole();
            if (!role.equals("SUPER")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Only SUPER users can create new users.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            var user = userService.createUser(request);
            UserDTO result = new UserDTO(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole(),
                    user.getEnabled()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            JwtAuthenticationToken authentication = 
                    (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String role = authentication.getRole();
            if (!role.equals("SUPER")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Only SUPER users can modify roles.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            Role newRole = Role.valueOf(request.get("role"));
            userService.updateUserRole(id, newRole);
            
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "User role updated successfully");
            return ResponseEntity.ok(successResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            JwtAuthenticationToken authentication = 
                    (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String role = authentication.getRole();
            if (!role.equals("SUPER")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Only SUPER users can delete users.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            userService.deleteUser(id);
            
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "User deleted successfully");
            return ResponseEntity.ok(successResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disableUser(@PathVariable Long id) {
        try {
            JwtAuthenticationToken authentication = 
                    (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String role = authentication.getRole();
            if (!role.equals("SUPER")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Only SUPER users can disable users.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            userService.disableUser(id);
            
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "User disabled successfully");
            return ResponseEntity.ok(successResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<?> enableUser(@PathVariable Long id) {
        try {
            JwtAuthenticationToken authentication = 
                    (JwtAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null || !authentication.isAuthenticated()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Unauthorized");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            String role = authentication.getRole();
            if (!role.equals("SUPER")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Access denied. Only SUPER users can enable users.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
            }

            userService.enableUser(id);
            
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "User enabled successfully");
            return ResponseEntity.ok(successResponse);
        } catch (RuntimeException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}
