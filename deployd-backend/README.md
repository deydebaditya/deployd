# Deployd Backend

This is the backend service for the Deployd application, written in Golang.

## Getting Started

To get started with the backend service, you'll need to have Go installed on your system. You can then use the provided `Makefile` to manage the application.

### Configuration

Before running the application, you need to create a `application.yaml` file in the root of the `deployd-backend` directory. You can do this by copying the sample file:

```bash
cp application.yaml.sample application.yaml
```

Next, open `application.yaml` and fill in your GitHub application's client ID and secret. Your GitHub OAuth application must have the `repo`, `user:email`, and `delete_repo` scopes.

### Available Commands

*   `make all`: Builds the application.
*   `make test`: Runs the test suite.
*   `make lint`: Lints the codebase.
*   `make fmt`: Formats the codebase.
*   `make compile`: Compiles the application.
*   `make clean`: Removes the compiled binary.
*   `make build`: Builds the application.

## API Endpoints

- `POST /api/applications`: Creates a new application.
- `GET /api/applications`: Retrieves a list of all applications.
- `DELETE /api/applications/{id}`: Deletes an application and its associated GitHub repository.
