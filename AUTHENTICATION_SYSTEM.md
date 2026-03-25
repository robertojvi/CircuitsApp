# User Control & Authentication System Implementation

## Overview

A comprehensive user authentication and role-based access control system has been implemented for the AccessParks Circuits application with three user roles:

- **SUPER**: Full access to all features and user management capabilities
- **ADMIN**: Access to all features of the app (can access Admin Component)
- **USER**: Read-only access, cannot access Admin Component

## Backend Implementation (Spring Boot)

### Dependencies Added

- Spring Security
- JWT (JJWT) for token-based authentication

### New Entities & Models

#### User Entity

- `id` (Long): Primary key
- `email` (String, unique): User's email for login
- `password` (String): Encrypted password
- `firstName` (String): User's first name
- `lastName` (String): User's last name
- `role` (Enum): SUPER, ADMIN, or USER
- `enabled` (Boolean): Account status
- `createdAt` (Long): Timestamp
- `updatedAt` (Long): Timestamp

#### Role Enum

- SUPER
- ADMIN
- USER

### DTOs

- `LoginRequest`: Email and password for login
- `LoginResponse`: Token, user info, and role after successful login
- `UserDTO`: User information for API responses (excludes password)
- `CreateUserRequest`: For creating new users (SUPER only)
- `ChangePasswordRequest`: Current and new password for changing password

### Security Components

#### JwtTokenProvider

- Generates JWT tokens with user claims (email, firstName, lastName, role, userId)
- Validates tokens
- Extracts user information from tokens
- Token expiration: 24 hours (configurable in application.properties)

#### JwtAuthenticationFilter

- Intercepts requests and validates JWT tokens
- Sets authentication context for authorized requests
- Extracts Authorization header (Bearer token format)

#### JwtAuthenticationToken

- Custom authentication token implementation
- Stores user email, role, userId, and token
- Implements Spring Security's AbstractAuthenticationToken

#### SecurityConfig

- Configures Spring Security with JWT authentication
- Sets up filter chain with JWT filter
- BCryptPasswordEncoder for password hashing
- Permits public access to `/api/auth/login`, requires authentication for other endpoints

### API Endpoints

#### Authentication Controller (`/api/auth`)

- **POST /login**: Login with email and password
  - Returns JWT token and user info
- **POST /change-password**: Change user's password (authenticated)
  - Requires current password and new password
- **GET /validate**: Validate current JWT token (authenticated)
  - Returns user info if token is valid

#### User Management Controller (`/api/users`)

- **GET /**: List all users (SUPER/ADMIN only)
- **POST /**: Create new user (SUPER only)
- **PUT /{id}/role**: Update user role (SUPER only)
- **DELETE /{id}**: Delete user (SUPER only)
- **PUT /{id}/disable**: Disable user account (SUPER only)
- **PUT /{id}/enable**: Enable user account (SUPER only)

### Configuration

Update `application.properties`:

```properties
jwt.secret=mySecretKeyForAccessParksCircuitsApplicationJWTTokenEncryption
jwt.expiration=86400000  # 24 hours in milliseconds
```

## Frontend Implementation (React)

### Authentication Context (`AuthContext.jsx`)

- Manages global authentication state
- Stores JWT token in localStorage
- Provides methods:
  - `login(email, password)`: Authenticate user
  - `logout()`: Clear authentication
  - `changePassword(currentPassword, newPassword)`: Change password
  - `validateToken()`: Validate token on app load

### Protected Route Component (`ProtectedRoute.jsx`)

- Wraps routes that require authentication
- Checks user authentication status
- Validates user role against required roles
- Redirects unauthenticated users to login
- Shows loading state while validating

### Components

#### Login Component (`Login.jsx`)

- Email and password input fields
- Error handling and display
- Loading state during login
- Redirects to home on successful login

#### Layout Component (Updated)

- Shows user info (name and role badge)
- Change Password button (all authenticated users)
- Manage Users button (SUPER role only)
- Logout button
- Conditional navigation links based on user role
  - Admin link only visible to SUPER and ADMIN users
  - Circuits and Reports links visible to all authenticated users

#### ChangePasswordModal Component (`ChangePasswordModal.jsx`)

- Form to change current password
- Password confirmation validation
- Minimum length check (6 characters)
- Success/error messages
- Available to all authenticated users

#### UserManagementModal Component (`UserManagementModal.jsx`)

- SUPER users can:
  - View all users in a table
  - Create new users with role assignment (SUPER, ADMIN, or USER)
  - Update user roles
  - Enable/disable user accounts
  - Delete users
- Confirmation dialogs for destructive actions
- Real-time updates after changes

### API Integration

All API calls updated to include:

- Full URL: `http://localhost:8080/api/...`
- Authorization header: `Bearer ${token}`

Updated components:

- `Admin.jsx`: All CRUD operations for sites, providers, and circuits
- `Circuits.jsx`: Get circuits, update circuit operations
- `Reports.jsx`: Fetch circuits for report generation

## Security Features

1. **Password Hashing**: BCrypt algorithm with spring-security-crypto
2. **JWT Tokens**: Stateless authentication with secure token verification
3. **Role-Based Access Control**: Endpoint-level authorization checks
4. **Token Expiration**: 24-hour default expiration
5. **Secure Storage**: Token stored in localStorage (consider using httpOnly cookies for production)

## Database Schema

### Users Table

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL
);
```

## Testing the Implementation

### 1. Start the Backend

```bash
cd fiberTower
mvn clean install
mvn spring-boot:run
```

### 2. Start the Frontend

```bash
cd circuitsApp
npm install
npm run dev
```

### 3. Initial Setup - Create First SUPER User

Execute SQL to create initial user:

```sql
INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at)
VALUES (
    'super@example.com',
    '$2a$10$YOUR_BCRYPT_HASHED_PASSWORD',
    'Super',
    'Admin',
    'SUPER',
    true,
    UNIX_TIMESTAMP() * 1000,
    UNIX_TIMESTAMP() * 1000
);
```

Or create user via API:

- Create a temporary SUPER user first, or
- Use an admin tool to insert the user directly

### 4. Login and Test

1. Navigate to `http://localhost:5173/login`
2. Enter super user credentials
3. Test user creation functionality
4. Create ADMIN and USER accounts
5. Test role-based access

## Usage Examples

### Login

```
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJ...",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "ADMIN",
  "userId": 1
}
```

### Create User (SUPER only)

```
POST /api/users
Authorization: Bearer {token}
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "USER"
}
```

### Change Password

```
POST /api/auth/change-password
Authorization: Bearer {token}
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

### Update User Role (SUPER only)

```
PUT /api/users/{userId}/role
Authorization: Bearer {token}
{
  "role": "ADMIN"
}
```

## File Structure

### Backend

```
fiberTower/src/main/java/com/example/fiberTower/
├── model/
│   ├── User.java
│   ├── Role.java
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── UserDTO.java
│   ├── CreateUserRequest.java
│   └── ChangePasswordRequest.java
├── repository/
│   └── IUserRepository.java
├── service/
│   ├── IUserService.java
│   ├── UserService.java
│   └── AuthenticationService.java
├── controller/
│   ├── AuthenticationController.java
│   └── UserManagementController.java
└── security/
    ├── JwtTokenProvider.java
    ├── JwtAuthenticationFilter.java
    ├── JwtAuthenticationToken.java
    └── SecurityConfig.java
```

### Frontend

```
circuitsApp/src/
├── context/
│   └── AuthContext.jsx
├── components/
│   ├── Login.jsx
│   ├── ProtectedRoute.jsx
│   ├── Layout.jsx (updated)
│   ├── ChangePasswordModal.jsx
│   ├── UserManagementModal.jsx
│   ├── Admin.jsx (updated)
│   ├── Circuits.jsx (updated)
│   └── Reports.jsx (updated)
└── App.jsx (updated)
```

## Future Enhancements

1. **Refresh Token**: Implement refresh token mechanism for better security
2. **Two-Factor Authentication**: Add 2FA for enhanced security
3. **User Audit Log**: Track user actions and login history
4. **Email Verification**: Verify email addresses on user creation
5. **Password Reset**: Forgot password functionality with email
6. **HttpOnly Cookies**: Move JWT from localStorage to httpOnly cookies
7. **Rate Limiting**: Prevent brute force attacks on login
8. **User Profile Page**: Allow users to manage their profile information

## Troubleshooting

### Login Page Shows Blank

- Ensure backend is running on http://localhost:8080
- Check browser console for CORS errors
- Verify database connection

### Token Validation fails

- Check JWT secret in application.properties matches
- Verify token expiration time
- Ensure Authorization header format is correct: `Bearer {token}`

### Cannot access Admin Component

- Verify user role is SUPER or ADMIN
- Check that token is valid and not expired
- Review SecurityConfig authorization rules

### Database Errors

- Run database migrations
- Verify MySQL is running and accessible
- Check database credentials in application.properties
