package handlers

import (
	"github.com/gorilla/sessions"
	"deployd-backend/pkg/services"
)

// Handler holds dependencies for handlers.
type Handler struct {
	Store         *sessions.CookieStore
	GithubService *services.GithubService
	FrontendURL   string
}
