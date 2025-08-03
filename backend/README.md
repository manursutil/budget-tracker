# Backend Testing

This project includes comprehensive tests for user creation and login functionality.

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test the complete flow from user registration to login
- **API Tests**: Test HTTP endpoints using Supertest

### Test Files

- `src/tests/controllers.test.ts` - Unit tests for user creation and login controllers
- `src/tests/simple-integration.test.ts` - Integration tests for complete authentication flow
- `src/tests/setup.ts` - Test environment setup

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The tests cover:

#### User Creation Controller

- ✅ Successful user creation with valid data
- ✅ Password hashing verification
- ✅ Missing required fields validation
- ✅ Password length validation
- ✅ Duplicate username handling
- ✅ Response format validation

#### User Login Controller

- ✅ Successful login with valid credentials
- ✅ JWT token generation and validation
- ✅ Missing credentials handling
- ✅ Invalid username/password handling
- ✅ Case-sensitive username matching

#### Integration Tests

- ✅ Complete registration to login flow
- ✅ Multiple user handling
- ✅ Data integrity verification
- ✅ Wrong password after registration

### Test Environment

- Uses MongoDB Memory Server for isolated testing
- Automatically cleans up data between tests
- No external dependencies required
- Fast execution with in-memory database

### Prerequisites

Make sure you have the following environment variables set for testing:

- `SECRET` - JWT secret key
- `PORT` - Server port (optional for tests)
- `MONGODB_URI` - MongoDB connection string (optional for tests, uses in-memory DB)

## Development

```bash
# Start development server
npm run dev
```

## API Endpoints

### POST /api/users

Create a new user account.

**Request Body:**

```json
{
  "username": "string",
  "name": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "id": "string",
  "username": "string",
  "name": "string"
}
```

### POST /api/login

Authenticate a user and receive a JWT token.

**Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "string",
  "username": "string",
  "name": "string"
}
```
