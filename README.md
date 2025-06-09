<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Document Management System

A NestJS-based backend service for managing users and documents with ingestion capabilities.

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Project Overview

This is a backend service built with NestJS that provides user management, document management, and document ingestion capabilities. The system supports authentication, role-based access control, and scalable document processing.

## Prerequisites

- Node.js >= 16.20.1
- MongoDB
- Redis
- Docker (for production deployment)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy environment file:
```bash
cp .env.example .env
```

4. Update .env with your configuration:
- MongoDB connection string
- Redis connection details
- JWT secret
- Other configuration values

## Running the Application

### Development
```bash
npm run start:dev  # Start in development mode with hot reload
```

### Production
```bash
npm run start:prod  # Start in production mode
```

### Docker
```bash
docker-compose up -d  # Start all services using Docker
```

## API Documentation

The API is documented using Swagger/OpenAPI. Access the documentation at:

```
http://localhost:3000/api
```

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
