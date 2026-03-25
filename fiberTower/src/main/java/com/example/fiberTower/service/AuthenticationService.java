package com.example.fiberTower.service;

import com.example.fiberTower.model.LoginRequest;
import com.example.fiberTower.model.LoginResponse;
import com.example.fiberTower.model.User;
import com.example.fiberTower.repository.IUserRepository;
import com.example.fiberTower.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthenticationService {

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public LoginResponse authenticate(LoginRequest loginRequest) {
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = userOptional.get();

        if (!user.getEnabled()) {
            throw new RuntimeException("User account is disabled");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().toString(),
                user.getId()
        );

        return new LoginResponse(
                token,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getId()
        );
    }
}
