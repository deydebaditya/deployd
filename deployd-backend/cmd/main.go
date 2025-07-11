package main

import (
	"log"
	"net/http"

	"deployd-backend/config"
	"deployd-backend/pkg/db"
	"deployd-backend/pkg/handlers"
	"deployd-backend/pkg/router"
	"deployd-backend/pkg/services"
	"github.com/gorilla/sessions"
	"github.com/rs/cors"
)

func main() {
	cfg, err := config.LoadConfig("application.yaml")
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	db.Init(cfg)

	store := sessions.NewCookieStore([]byte("super-secret-key")) // TODO: Move to config
	githubService := services.NewGithubService(cfg.Github.ClientID, cfg.Github.ClientSecret)

	appHandler := handlers.NewApplicationHandler(db.DB, githubService, store)
	authHandler := handlers.NewAuthHandler(store, githubService, cfg.Frontend.URL)

	r := router.NewRouter(appHandler, authHandler)

	// CORS middleware
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{cfg.Frontend.URL},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
	})

	handler := c.Handler(r)

	log.Printf("Server starting on port %s...", cfg.Server.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Server.Port, handler))
}
