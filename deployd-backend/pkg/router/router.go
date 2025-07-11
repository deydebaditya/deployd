package router

import (
	"deployd-backend/pkg/handlers"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// New creates a new router and sets up the routes.
func NewRouter(appHandler *handlers.ApplicationHandler, authHandler *handlers.AuthHandler) *mux.Router {
	r := mux.NewRouter()

	// Auth routes
	r.HandleFunc("/auth/github/callback", authHandler.GithubCallbackHandler).Methods("GET")
	r.HandleFunc("/auth/status", authHandler.StatusHandler).Methods("GET")
	r.HandleFunc("/auth/logout", authHandler.LogoutHandler).Methods("POST")

	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/github/create-repo", authHandler.CreateRepoHandler).Methods("POST")
	api.HandleFunc("/applications", appHandler.CreateApplication).Methods("POST")
	api.HandleFunc("/applications", appHandler.GetApplications).Methods("GET")
	api.HandleFunc("/applications/{id}", appHandler.DeleteApplication).Methods("DELETE")

	// Health check
	r.HandleFunc("/ping", handlers.PingHandler).Methods("GET")

	return r
}

// CORS sets up the CORS middleware.
func CORS(frontendURL string) *cors.Cors {
	return cors.New(cors.Options{
		AllowedOrigins:   []string{frontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            true,
	})
}
