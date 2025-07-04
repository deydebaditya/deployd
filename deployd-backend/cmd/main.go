package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
	"github.com/rs/cors"
)

const (
	githubClientID     = "Ov23licNhxP0bWQFmeVq"
	githubClientSecret = "831768e8d55a2809e18ae076f9387fd205519f90"
	frontendURL        = "http://localhost:3000"
)

var store = sessions.NewCookieStore([]byte("secret-key"))

func main() {
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}

	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api").Subrouter()
	api.HandleFunc("/github/create-repo", createRepoHandler).Methods("POST")

	// Auth routes
	auth := r.PathPrefix("/auth").Subrouter()
	auth.HandleFunc("/github/callback", githubCallbackHandler).Methods("GET")
	auth.HandleFunc("/status", statusHandler).Methods("GET")
	auth.HandleFunc("/logout", logoutHandler).Methods("POST")

	// Health check
	r.HandleFunc("/ping", pingHandler).Methods("GET")

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{frontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
		Debug:            true,
	})

	handler := c.Handler(r)

	fmt.Println("Server listening on port 8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

func createRepoHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-name")
	accessToken, ok := session.Values["access_token"].(string)
	if !ok || accessToken == "" {
		http.Error(w, "Unauthorized: Not logged in.", http.StatusUnauthorized)
		return
	}

	var reqBody struct {
		RepoName string `json:"repoName"`
	}

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "Bad Request: Invalid JSON.", http.StatusBadRequest)
		return
	}

	if reqBody.RepoName == "" {
		http.Error(w, "Bad Request: repoName is required.", http.StatusBadRequest)
		return
	}

	githubReqBody, _ := json.Marshal(map[string]interface{}{
		"name":    reqBody.RepoName,
		"private": false,
	})

	req, _ := http.NewRequest("POST", "https://api.github.com/user/repos", bytes.NewBuffer(githubReqBody))
	req.Header.Set("Authorization", fmt.Sprintf("token %s", accessToken))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, "An internal server error occurred.", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

func githubCallbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Error: No authorization code provided by GitHub.", http.StatusBadRequest)
		return
	}

	// Exchange code for access token
	tokenReqBody, _ := json.Marshal(map[string]string{
		"client_id":     githubClientID,
		"client_secret": githubClientSecret,
		"code":          code,
	})

	tokenReq, _ := http.NewRequest("POST", "https://github.com/login/oauth/access_token", bytes.NewBuffer(tokenReqBody))
	tokenReq.Header.Set("Content-Type", "application/json")
	tokenReq.Header.Set("Accept", "application/json")

	client := &http.Client{}
	tokenResp, err := client.Do(tokenReq)
	if err != nil {
		http.Error(w, "An error occurred during authentication.", http.StatusInternalServerError)
		return
	}
	defer tokenResp.Body.Close()

	var tokenData struct {
		AccessToken string `json:"access_token"`
	}

	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil {
		http.Error(w, "An error occurred during authentication.", http.StatusInternalServerError)
		return
	}

	if tokenData.AccessToken == "" {
		http.Error(w, "Failed to retrieve access token from GitHub.", http.StatusInternalServerError)
		return
	}

	// Get user info
	userReq, _ := http.NewRequest("GET", "https://api.github.com/user", nil)
	userReq.Header.Set("Authorization", fmt.Sprintf("token %s", tokenData.AccessToken))

	userResp, err := client.Do(userReq)
	if err != nil {
		http.Error(w, "An error occurred during authentication.", http.StatusInternalServerError)
		return
	}
	defer userResp.Body.Close()

	var userData struct {
		Username string `json:"login"`
	}

	if err := json.NewDecoder(userResp.Body).Decode(&userData); err != nil {
		http.Error(w, "An error occurred during authentication.", http.StatusInternalServerError)
		return
	}

	session, _ := store.Get(r, "session-name")
	session.Values["access_token"] = tokenData.AccessToken
	session.Values["username"] = userData.Username
	session.Values["provider"] = "github"
	session.Save(r, w)

	// Send success message to frontend
	script := fmt.Sprintf(`
		<script>
			window.opener.postMessage({
				source: 'oauth-callback-success',
				payload: { username: '%s' }
			}, '%s');
			window.close();
		</script>
		<h1>Authentication successful!</h1>
		<p>You can close this window.</p>
	`, userData.Username, frontendURL)

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(script))
}

func pingHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("pong"))
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-name")
	session.Values["access_token"] = nil
	session.Values["username"] = nil
	session.Values["provider"] = nil
	session.Options.MaxAge = -1
	session.Save(r, w)
	w.WriteHeader(http.StatusOK)
}

func statusHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "session-name")
	username, u_ok := session.Values["username"].(string)
	provider, p_ok := session.Values["provider"].(string)

	w.Header().Set("Content-Type", "application/json")
	if !u_ok || !p_ok || username == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{"loggedIn": false})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"loggedIn": true,
		"username": username,
		"provider": provider,
	})
}


