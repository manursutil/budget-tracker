# Backend – Budget Tracker API

This is the backend for the Budget Tracker app, built with Node.js, Express, TypeScript, and MongoDB.

---

## Tech Stack

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **TypeScript**
- **JWT Authentication**
- **Testing**: Jest + Supertest + MongoDB Memory Server

## Backend Testing

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test the complete flow from user registration to login
- **API Tests**: Test HTTP endpoints using Supertest (auth + category)

### Test Files

- `src/tests/controllers.test.ts` – Unit tests for user creation and login controllers
- `src/tests/simple-integration.test.ts` – Integration tests for complete authentication flow
- `src/tests/categoryControllers.test.ts` – Integration and API tests for category endpoints
- `src/tests/transactionControllers.test.ts` – Tests for transaction controller logic
- `src/tests/setup.ts` – Test environment setup

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

#### Category Controller

- ✅ GET /categories: fetch all active categories for logged-in user
- ✅ POST /categories: create category with valid data
- ✅ Prevent duplicate category names for same user
- ✅ Allow same name across different users
- ✅ Return 400 for validation and ObjectId errors
- ✅ GET /categories/:id: fetch single category
- ✅ PATCH /categories/:id: update category fields (with field whitelist)
- ✅ Prevent updates to protected fields (userId, createdAt)
- ✅ DELETE /categories/:id: delete category with ownership check
- ✅ Proper handling of unauthorized access or non-existent resources

#### Transaction Controller

- ✅ GET /transactions: fetch transactions by user and optional type filter
- ✅ POST /transactions: create transaction with validation
- ✅ GET /transactions/:id: fetch a single transaction
- ✅ PATCH /transactions/:id: update existing transaction
- ✅ DELETE /transactions/:id: remove a transaction
- ✅ Input validation using Zod
- ✅ Category existence checks
- ✅ ObjectId validation
- ✅ Response format and error handling

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

#### Auth Endpoints:

- POST /api/auth/login
- POST /api/users/register
- GET /api/users/
- GET /api/users/me

#### Category Endpoints:

- GET /api/categories
- POST /api/categories
- GET /api/categories/:id
- DELETE /api/categories/:id
- PATCH /api/categories/:id

#### Transaction Endpoints:

- GET /api/transactions
- POST /api/transactions
- GET /api/transactions/:id
- DELETE /api/transactions/:id
- PATCH /api/transactions/:id

## Authorization

Use JWT in the Authorization header for all protected routes:

```bash
Authorization: Bearer <token>
```

## Folder Structure

```bash
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── types/
│   ├── tests/
│   ├── utils/
│   ├── schemas/
│   ├── config/
│   ├── middleware/
│   ├── constants.ts
│   └── server.ts
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── nodemon.json
├── jest.config.js
├── .prettierrc
├── .prettierignore
├── README.md
└── tsconfig.json
```
