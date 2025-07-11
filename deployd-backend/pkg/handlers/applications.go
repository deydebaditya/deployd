package handlers

import (
	"deployd-backend/pkg/db"
	"deployd-backend/pkg/models"
	"deployd-backend/pkg/services"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"gorm.io/gorm"
)

// ApplicationHandler holds dependencies for application handlers.
// ApplicationHandler holds dependencies for application handlers.
type ApplicationHandler struct {
	DB            *gorm.DB
	GithubService *services.GithubService
	Store         *sessions.CookieStore
}

// NewApplicationHandler creates a new ApplicationHandler.
func NewApplicationHandler(db *gorm.DB, githubService *services.GithubService, store *sessions.CookieStore) *ApplicationHandler {
	return &ApplicationHandler{
		DB:            db,
		GithubService: githubService,
		Store:         store,
	}
}

// CreateApplication handles the creation of a new application.
func (h *ApplicationHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	var app models.Application
	if err := json.NewDecoder(r.Body).Decode(&app); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if result := db.DB.Create(&app); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(app)
}

// GetApplications retrieves all applications.
func (h *ApplicationHandler) GetApplications(w http.ResponseWriter, r *http.Request) {
	var apps []models.Application
	if result := db.DB.Find(&apps); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apps)
}

// DeleteApplication handles the deletion of an application.
func (h *ApplicationHandler) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var app models.Application
	if err := h.DB.First(&app, id).Error; err != nil {
		http.Error(w, "Application not found", http.StatusNotFound)
		return
	}

	session, err := h.Store.Get(r, "session-name")
	if err != nil {
		http.Error(w, "Failed to get session", http.StatusInternalServerError)
		return
	}

	accessToken, ok := session.Values["access_token"].(string)
	if !ok || accessToken == "" {
		http.Error(w, "Unauthorized: Access token not found", http.StatusUnauthorized)
		return
	}

	// Extract owner and repo from GitRepo URL
	parsedURL, err := url.Parse(app.GitRepo)
	if err != nil {
		http.Error(w, "Invalid Git repository URL", http.StatusInternalServerError)
		return
	}
	repoPath := strings.TrimPrefix(parsedURL.Path, "/")

	statusCode, err := h.GithubService.DeleteRepo(accessToken, repoPath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete repository: %v", err), http.StatusInternalServerError)
		return
	}

	if statusCode != http.StatusNoContent {
		http.Error(w, fmt.Sprintf("GitHub API returned status code %d", statusCode), http.StatusInternalServerError)
		return
	}

	if result := h.DB.Delete(&app); result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
