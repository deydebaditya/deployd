package main

import (
	"log"
	"net/http"

	"deployd-backend/config"
	"deployd-backend/pkg/handlers"
	"deployd-backend/pkg/router"
	"deployd-backend/pkg/services"
	"github.com/gorilla/sessions"
)

func main() {
	cfg, err := config.LoadConfig("application.yaml")
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	store := sessions.NewCookieStore([]byte("super-secret-key")) // TODO: Move to config
	githubService := services.NewGithubService(cfg.Github.ClientID, cfg.Github.ClientSecret)

	h := &handlers.Handler{
		Store:         store,
		GithubService: githubService,
		FrontendURL:   cfg.Frontend.URL,
	}

	r := router.New(h)
	c := router.CORS(cfg.Frontend.URL)

	handler := c.Handler(r)

	log.Printf("Server starting on port %s...", cfg.Server.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Server.Port, handler))
}
