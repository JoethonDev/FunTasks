# FunTasks Backend

This is the backend service for FunTasks, a system for scheduling and managing one-time events for users.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Running Unit Tests](#running-unit-tests)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)

## Features

- **User Management**: Create, update, retrieve, and delete user accounts.
- **Event Scheduling**: Schedule, update, retrieve, and delete one-time events for a specific user.
- **Conditional Logic**: Events can only be updated or deleted if their status is `PENDING`.
- **API Documentation**: Comprehensive Swagger API documentation for all endpoints.
- **Unit Testing**: Full test coverage using JestJS for all service and controller logic.
- **Database**: PostgreSQL with TypeORM for data persistence.

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- PostgreSQL database server

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repository-name.git](https://github.com/your-username/your-repository-name.git)
    cd your-repository-name
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create a `.env` file:**
    Create a `.env` file in the root directory and configure your database connection.
    ```env
    PORT=3000

    # PostgreSQL Database
    DATABASE_TYPE=postgres
    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=postgres
    DATABASE_PASSWORD=your_password
    DATABASE_NAME=funtasks_db
    ```
    > **Note:** `SYNCHRONIZE=true` is set for development purposes to automatically create tables. For production, it should be set to `false`, and migrations should be used.

4.  **Create the database:**
    Ensure a PostgreSQL database with the name specified in `DATABASE_NAME` is created.

## Running the Application

To run the application in development mode with live reloading:
```bash
npm run start:dev
```

The application will be available at http://localhost:3000.

## Running Unit Tests

To run all unit tests for the project:

```bash
npm run test
```

To run a specific test file:

```bash
npm run test -- src/users/users.service.spec.ts
```

## API Documentation

The project includes Swagger for API documentation. Once the application is running, you can access the interactive documentation at:

* http://localhost:3000/api

## Project Structure


```
src/
├── common/
│   └── validators/
│       └── is-future-date.decorator.ts
├── events/
│   ├── dto/
│   │   ├── create-event.dto.ts
│   │   ├── event-id.dto.ts
│   │   ├── event-response.dto.ts
│   │   └── update-event.dto.ts
│   ├── entities/
│   │   └── event.entity.ts
│   ├── events.controller.ts
│   ├── events.module.ts
│   ├── events.service.ts
│   ├── events.controller.spec.ts
│   └── events.service.spec.ts
├── users/
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-id.dto.ts
│   ├── entities/
│   │   └── user.entity.ts
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.spec.ts
│   └── users.service.spec.ts
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```