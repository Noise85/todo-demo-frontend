# Todo Board API Documentation

This folder contains the OpenAPI v3 specification for the Todo Board API. The API provides endpoints for managing tasks, users, and tags in the Todo Board application.

## API Overview

The API is organized around the following resources:

- **Tasks**: CRUD operations for tasks, including filtering, sorting, and pagination
- **Users**: User management and profile operations
- **Tags**: Tag management for categorizing tasks
- **Authentication**: User registration and login

## Getting Started

### Viewing the API Documentation

You can view the API documentation in several ways:

1. **Swagger UI**: Import the `openapi.yaml` file into [Swagger Editor](https://editor.swagger.io/) to view and interact with the API documentation.

2. **Redoc**: Use [Redoc](https://redocly.github.io/redoc/) to view a more user-friendly version of the documentation.

3. **Local Development**: You can also use tools like [Swagger UI Express](https://www.npmjs.com/package/swagger-ui-express) to serve the documentation locally.

### Authentication

Most API endpoints require authentication. The API uses JWT (JSON Web Token) for authentication. To authenticate:

1. Register a new user or login with existing credentials
2. Include the JWT token in the Authorization header of your requests:
   \`\`\`
   Authorization: Bearer <your_jwt_token>
   \`\`\`

## Key Endpoints

### Tasks

- `GET /todos/all`: Get all tasks with pagination and sorting
- `POST /todos/all`: Search tasks with complex filtering
- `GET /todos/board`: Get tasks for the board view (excluding backlog)
- `GET /todos/backlog`: Get tasks in the backlog
- `GET /todos/todo/status/{status}`: Get tasks by status
- `PUT /todos/todo`: Create a new task
- `POST /todos/todo`: Update an existing task
- `GET /todos/todo/{id}`: Get a task by ID
- `DELETE /todos/todo/{id}`: Delete a task

### Users

- `GET /users`: Get all users
- `GET /user/profile`: Get the authenticated user's profile
- `PUT /user/profile`: Update the authenticated user's profile

### Tags

- `GET /tags`: Get all tags

### Authentication

- `POST /auth/login`: User login
- `POST /auth/register`: User registration

## Models

The API uses the following main data models:

- `TodoItem`: Represents a task
- `User`: Represents a user
- `Tag`: Represents a tag for categorizing tasks
- `Status`: Enum representing the possible statuses of a task

## Pagination

List endpoints return paginated results. The pagination information is included in the response:

\`\`\`json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0,
  "first": true,
  "last": false,
  "empty": false
}
\`\`\`

## Filtering and Sorting

The API supports complex filtering and sorting:

- Use the `sort` query parameter to sort results (e.g., `sort=dueDate,desc`)
- Use the search endpoint (`POST /todos/all`) with a `TaskSearchDTO` for complex filtering

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a code, message, and optional details:

\`\`\`json
{
  "code": "INVALID_REQUEST",
  "message": "Invalid request parameters",
  "details": ["Field 'email' is required"]
}
