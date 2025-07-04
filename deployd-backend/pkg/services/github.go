package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

// GithubService handles interactions with the GitHub API.
type GithubService struct {
	ClientID     string
	ClientSecret string
}

// NewGithubService creates a new GithubService.
func NewGithubService(clientID, clientSecret string) *GithubService {
	return &GithubService{
		ClientID:     clientID,
		ClientSecret: clientSecret,
	}
}

// GetAccessToken exchanges an authorization code for an access token.
func (s *GithubService) GetAccessToken(code string) (string, error) {
	tokenReqBody, _ := json.Marshal(map[string]string{
		"client_id":     s.ClientID,
		"client_secret": s.ClientSecret,
		"code":          code,
	})

	tokenReq, _ := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer(tokenReqBody))
	tokenReq.Header.Set("Content-Type", "application/json")
	tokenReq.Header.Set("Accept", "application/json")

	client := &http.Client{}
	tokenResp, err := client.Do(tokenReq)
	if err != nil {
		return "", fmt.Errorf("failed to send request to get access token: %w", err)
	}
	defer tokenResp.Body.Close()

	var tokenData struct {
		AccessToken string `json:"access_token"`
	}

	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil {
		return "", fmt.Errorf("failed to decode access token response: %w", err)
	}

	if tokenData.AccessToken == "" {
		return "", fmt.Errorf("did not receive access token from GitHub")
	}

	return tokenData.AccessToken, nil
}

// GetUserData retrieves user data from GitHub using an access token.
func (s *GithubService) GetUserData(accessToken string) (string, error) {
	userReq, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
	userReq.Header.Set("Authorization", fmt.Sprintf("token %s", accessToken))

	client := &http.Client{}
	userResp, err := client.Do(userReq)
	if err != nil {
		return "", fmt.Errorf("failed to send request to get user data: %w", err)
	}
	defer userResp.Body.Close()

	var userData struct {
		Username string `json:"login"`
	}

	if err := json.NewDecoder(userResp.Body).Decode(&userData); err != nil {
		return "", fmt.Errorf("failed to decode user data response: %w", err)
	}

	return userData.Username, nil
}

// CreateRepo creates a new repository on GitHub.
func (s *GithubService) CreateRepo(accessToken, repoName string) ([]byte, int, error) {
	githubReqBody, _ := json.Marshal(map[string]interface{}{
		"name":    repoName,
		"private": false,
	})

	req, _ := http.NewRequest("POST", "https://api.github.com/user/repos", bytes.NewBuffer(githubReqBody))
	req.Header.Set("Authorization", fmt.Sprintf("token %s", accessToken))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to send request to create repo: %w", err)
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	return body, resp.StatusCode, nil
}
