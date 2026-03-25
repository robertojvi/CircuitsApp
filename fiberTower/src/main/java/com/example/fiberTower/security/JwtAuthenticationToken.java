package com.example.fiberTower.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;

public class JwtAuthenticationToken extends AbstractAuthenticationToken {
    private final String email;
    private final String role;
    private final Long userId;
    private final String token;

    public JwtAuthenticationToken(String email, String role, Long userId, String token) {
        super(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
        this.email = email;
        this.role = role;
        this.userId = userId;
        this.token = token;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return token;
    }

    @Override
    public Object getPrincipal() {
        return email;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getToken() {
        return token;
    }
}
