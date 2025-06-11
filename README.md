# Document Management System

### Prerequisites
Make sure you have these installed:
- Node.js (version 16.20.1 or higher)
- MongoDB
- Redis
- Docker (for Docker deployment)

### Quick Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy the environment file:
```bash
cp .env.example .env
```

4. Update your `.env` file with your configuration:
- MongoDB connection string
- Redis connection details
- JWT secret
- Other configuration values

## Running the Application

### Option 1: Using Docker (Recommended)

1. Ensure Docker and Docker Compose are installed
2. Start all services:
```bash
docker-compose up -d
```

3. Access the application at `http://localhost:3000`
4. Access the API documentation at `http://localhost:3000/api`

### Option 2: Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Start the application in development mode:
```bash
npm run start:dev
```

3. Start the application in production mode:
```bash
npm run start:prod
```

## API Documentation

The API is documented using Swagger. You can access it at:
```
http://localhost:3000/api
```

## Testing

Run unit tests:
```bash
npm run test
```

Run end-to-end tests:
```bash
npm run test:e2e
```

Check test coverage:
```bash
npm run test:cov
```

## Project Structure

```
src/
├── auth/              # Authentication module
├── common/            # Shared utilities and decorators
├── config/            # Configuration management
├── documents/         # Document management module
├── ingestion/         # Document ingestion module
└── users/            # User management module
```

## Features

- User Management:
  - Registration
  - Authentication
  - Role-based access control
  - User profile management

- Document Management:
  - CRUD operations
  - Document metadata management
  - File upload and storage
  - Version control

- Document Ingestion:
  - Background processing
  - Status tracking
  - Error handling
  - Retry mechanisms

## Deployment

### Local Development

1. Install dependencies
2. Configure environment variables
3. Start MongoDB and Redis
4. Run the application

### Docker

1. Build Docker images:
```bash
docker-compose build
```

2. Start services:
```bash
docker-compose up -d
```

3. Access the application:
```
http://localhost:3000
```
