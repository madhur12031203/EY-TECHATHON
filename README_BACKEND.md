# Buyoh Backend API

Backend server for Buyoh authentication system with PostgreSQL database.

## Setup Instructions

### 1. Install PostgreSQL

Make sure PostgreSQL is installed on your system:
- Windows: Download from https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql`
- Linux: `sudo apt-get install postgresql`

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE buyoh_db;

# Exit psql
\q
```

Or run the SQL script:
```bash
psql -U postgres -f database.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=buyoh_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

### 4. Install Dependencies

Dependencies are already installed, but if needed:
```bash
npm install
```

### 5. Start the Server

```bash
node server.js
```

The server will start on `http://localhost:5000`

## API Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
  ```

### Health Check
- **GET** `/api/health`
- **Response:**
  ```json
  {
    "status": "OK",
    "message": "Server is running"
  }
  ```

## Database Schema

### Users Table
- `id` - SERIAL PRIMARY KEY
- `name` - VARCHAR(255) NOT NULL
- `email` - VARCHAR(255) UNIQUE NOT NULL
- `phone` - VARCHAR(20)
- `password` - VARCHAR(255) NOT NULL (hashed)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

## Security Notes

1. **JWT Secret**: Change the JWT_SECRET in production
2. **Password Hashing**: Passwords are hashed using bcrypt (10 salt rounds)
3. **CORS**: Currently allows all origins (configure for production)
4. **Environment Variables**: Never commit `.env` file to version control

## Troubleshooting

### Database Connection Error
- Check if PostgreSQL is running
- Verify database credentials in `.env`
- Ensure database `buyoh_db` exists

### Port Already in Use
- Change PORT in `.env` or kill the process using port 5000

