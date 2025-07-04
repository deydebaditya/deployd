package main

import (
	"deployd-backend/pkg/handlers"
	"deployd-backend/pkg/router"
	"deployd-backend/pkg/services"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/sessions"
)

const (
	githubClientID     = "Ov23licNhxP0bWQFmeVq"
	githubClientSecret = "831768e8d55a2809e18ae076f9387fd205519f90"
	frontendURL        = "http://localhost:3000"
)

func main() {
	store := sessions.NewCookieStore([]byte("secret-key"))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	githubService := services.NewGithubService(githubClientID, githubClientSecret)

	h := &handlers.Handler{
		Store:         store,
		GithubService: githubService,
		FrontendURL:   frontendURL,
	}

	r := router.New(h)
	c := router.CORS(frontendURL)

	handler := c.Handler(r)

	fmt.Println("Server listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

