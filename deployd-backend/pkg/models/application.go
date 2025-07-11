package models

import "gorm.io/gorm"

// Application represents an onboarded application.
type Application struct {
	gorm.Model
	Name      string `json:"name"`
	GitRepo   string `json:"git_repo"`
	State     string `json:"state"`
	Language  string `json:"language"`
}
