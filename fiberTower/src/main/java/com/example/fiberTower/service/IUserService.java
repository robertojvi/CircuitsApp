package com.example.fiberTower.service;

import com.example.fiberTower.model.User;
import com.example.fiberTower.model.UserDTO;
import com.example.fiberTower.model.CreateUserRequest;
import com.example.fiberTower.model.Role;

import java.util.List;
import java.util.Optional;

public interface IUserService {
    User createUser(CreateUserRequest request);
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    List<UserDTO> getAllUsers();
    UserDTO updateUser(Long id, User updatedUser);
    void deleteUser(Long id);
    void updateUserRole(Long id, Role newRole);
    void disableUser(Long id);
    void enableUser(Long id);
    void changePassword(Long userId, String oldPassword, String newPassword);
}
