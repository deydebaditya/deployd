package router

import (
	"deployd-backend/pkg/handlers"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
)

// New creates a new router and sets up the routes.
func New(h *handlers.Handler) *mux.Router {
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/github/create-repo", h.CreateRepoHandler).Methods("POST")

	// Auth routes
	auth := r.PathPrefix("/auth").Subrouter()
	auth.HandleFunc("/github/callback", h.GithubCallbackHandler).Methods("GET")
	auth.HandleFunc("/status", h.StatusHandler).Methods("GET")
	auth.HandleFunc("/logout", h.LogoutHandler).Methods("POST")

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
