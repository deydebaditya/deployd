# Deployd

Deployd is a web-based platform designed to simplify the onboarding and deployment of new software applications. It provides a user-friendly interface to configure and create new projects, starting with automated Git repository creation.

## Features

- **Web-based Onboarding:** A multi-step form to configure new applications (e.g., language, framework, repository name).
- **GitHub Integration:** Automatically creates a new GitHub repository for each onboarded application.
- **Secure Authentication:** Uses an OAuth2 flow to securely connect to a user's GitHub account.
- **Session Management:** Maintains user sessions between the frontend and backend.

## Architecture

The project is a monorepo containing two main components:

- **`deployd-frontend`**: A React single-page application built with Create React App that provides the user interface.
- **`deployd-backend`**: A Go server using `gorilla/mux` that handles API requests, GitHub OAuth, and repository creation.

## Getting Started

Follow these instructions to get the project running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Go](https://go.dev/) (v1.18 or later)
- A GitHub OAuth Application for authentication.

### Configuration

1.  **Backend:** Update the `githubClientID` and `githubClientSecret` constants in `deployd-backend/cmd/main.go`.
2.  **Frontend:** Update the `GITHUB_CLIENT_ID` constant in `deployd-frontend/src/config/oauth.js`.

### Installation & Running

1.  **Run the Backend Server:**
    ```bash
    cd deployd-backend
    go run cmd/main.go
    ```
    The backend will be running at `http://localhost:8080`.

2.  **Run the Frontend Application:**
    ```bash
    cd deployd-frontend
    npm install
    npm start
    ```
    The frontend will be running at `http://localhost:3000`.
