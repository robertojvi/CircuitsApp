# Quick Start Guide - User Authentication System

## Prerequisites

- Java 24
- MySQL 8.0+
- Node.js 18+
- Maven 3.8+

## Step 1: Backend Setup

### 1.1 Update Database Configuration

Edit `fiberTower/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/circuits?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_mysql_password
```

### 1.2 Build and Run Backend

```bash
cd fiberTower
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 1.3 Create Initial SUPER User

Once the backend is running, the `users` table will be created automatically.

Open MySQL and run:

```sql
INSERT INTO users (email, password, first_name, last_name, role, enabled, created_at, updated_at)
VALUES (
    'super@accessparks.com',
    '$2a$10$slYQmyNdGzqy5LHjHJ2cYuP5tZ.tXVnEMJfE6lc1KfY4eFxMvNqFO',
    'Admin',
    'Super',
    'SUPER',
    true,
    UNIX_TIMESTAMP() * 1000,
    UNIX_TIMESTAMP() * 1000
);
```

**Login Credentials:**

- Email: `super@accessparks.com`
- Password: `password123`

(The password hash above is for "password123" - change in production!)

To generate your own password hash, you can use:

- Online BCrypt generator: https://bcrypt-generator.com/
- Use BCrypt from Java or command line: `htpasswd -bcB 10 "" yourenewpassword`

## Step 2: Frontend Setup

### 2.1 Install Dependencies

```bash
cd circuitsApp
npm install
```

### 2.2 Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Step 3: Initial Login and User Creation

### 3.1 Login to Application

1. Navigate to `http://localhost:5173/login`
2. Login with super user credentials:
   - Email: `super@accessparks.com`
   - Password: `password123`

### 3.2 Create Additional Users

After logging in as SUPER user:

1. Click "Manage Users" button in the top-right navbar
2. Click "Create New User" button
3. Fill in user details
4. Select role (SUPER, ADMIN, or USER)
5. Click "Create User"

#### Example Users to Create:

**Admin User:**

- Email: `admin@accessparks.com`
- Password: `adminPass123`
- First Name: Admin
- Last Name: User
- Role: ADMIN

**Regular User:**

- Email: `user@accessparks.com`
- Password: `userPass123`
- First Name: Regular
- Last Name: User
- Role: USER

## Step 4: Test Each Role

### SUPER User Features

- ✅ Can access Admin component
- ✅ Can access Circuits and Reports
- ✅ Can manage all users (create, delete, modify roles)
- ✅ Can change own password
- ✅ Can enable/disable user accounts

### ADMIN User Features

- ✅ Can access Admin component
- ✅ Can access Circuits and Reports
- ❌ Cannot manage users
- ✅ Can change own password

### USER Role Features

- ❌ Cannot access Admin component
- ✅ Can view Circuits (read-only)
- ✅ Can view Reports
- ✅ Can change own password

## Step 5: Common Operations

### Change Your Password

1. Click "Change Password" button in navbar
2. Enter current password
3. Enter new password (min 6 characters)
4. Confirm new password
5. Click "Change Password"

### Create Admin User

1. Click "Manage Users"
2. Fill in form with admin details
3. Select "ADMIN" from role dropdown
4. Click "Create User"

### Disable User Account

1. Click "Manage Users"
2. Find user in list
3. Click "Disable" button
4. Disabled users cannot login

### Update User Role

1. Click "Manage Users"
2. Find user in list
3. Click role dropdown and select new role
4. Role updates immediately

### Delete User

1. Click "Manage Users"
2. Find user in list
3. Click "Delete" button
4. Confirm deletion
5. User is permanently deleted

## Development Notes

### Token Storage

The JWT token is stored in the browser's localStorage at key `token`. In production:

- Consider using httpOnly cookies instead
- Implement token refresh mechanism
- Add proper CORS configuration

### API Base URL

All API calls use `http://localhost:8080`. To use a different URL, update:

- `circuitsApp/src/context/AuthContext.jsx`
- `circuitsApp/src/components/*.jsx` (all components with API calls)

### JWT Configuration

Current configuration in `application.properties`:

```properties
jwt.secret=mySecretKeyForAccessParksCircuitsApplicationJWTTokenEncryption
jwt.expiration=86400000  # 24 hours in milliseconds
```

Change the secret in production!

### Database Reset

To reset the entire user system:

```sql
DROP TABLE users;
```

The table will be recreated on next backend startup.

## Troubleshooting

### "Unable to connect to backend" Error

- Verify backend is running on port 8080
- Check `curl http://localhost:8080/api/users` in terminal
- Review backend logs for errors
- Check CORS configuration in SecurityConfig

### Login fails with valid credentials

- Verify username and password are correct
- Check that user account is enabled in database
- Review backend logs
- Check network tab in browser dev tools

### Cannot create users as SUPER

- Verify you're logged in as a SUPER user
- Check role badge in navbar shows "SUPER"
- Refresh the page
- Check browser console for errors

### Circuits/Reports show no data

- Verify you have circuits in the database
- Check backend API is working: `curl http://localhost:8080/api/circuits`
- Verify JWT token is valid
- Check browser console for API errors

### Admin Component not accessible

- Verify your user role is SUPER or ADMIN
- Check user role in "Manage Users" list
- Update role if needed
- Refresh page and login again

## Security Reminders

⚠️ **For Production Deployment:**

1. Change JWT secret to a strong random value
2. Use environment variables for sensitive config
3. Move JWT from localStorage to httpOnly cookies
4. Implement HTTPS/TLS
5. Use strong password requirements in validation
6. Implement rate limiting on login endpoint
7. Add email verification for new accounts
8. Implement audit logging
9. Use proper CORS configuration
10. Add security headers (HSTS, CSP, etc.)

## Next Steps

1. **Customize password policy** - Add more validation rules
2. **Add email notifications** - Send welcome emails to new users
3. **Implement audit logging** - Track all user actions
4. **Add two-factor authentication** - Enhanced security
5. **Create password reset flow** - Forgot password functionality
6. **Add user profile management** - Allow users to update info
7. **Implement permission system** - Fine-grained access control per feature

## Support

For issues or questions:

1. Check AUTHENTICATION_SYSTEM.md for detailed documentation
2. Review application logs
3. Check browser console for client-side errors
4. Verify network requests in browser dev tools
5. Test API endpoints directly with curl or Postman
