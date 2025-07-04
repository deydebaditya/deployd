package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

func (h *Handler) CreateRepoHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := h.Store.Get(r, "session-name")
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

	body, statusCode, err := h.GithubService.CreateRepo(accessToken, reqBody.RepoName)
	if err != nil {
		http.Error(w, "An internal server error occurred.", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	w.Write(body)
}

func (h *Handler) GithubCallbackHandler(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Query().Get("code")
	if code == "" {
		http.Error(w, "Error: No authorization code provided by GitHub.", http.StatusBadRequest)
		return
	}

	accessToken, err := h.GithubService.GetAccessToken(code)
	if err != nil {
		http.Error(w, "An error occurred during authentication.", http.StatusInternalServerError)
		return
	}

	username, err := h.GithubService.GetUserData(accessToken)
	if err != nil {
		http.Error(w, "An error occurred during authentication.", http.StatusInternalServerError)
		return
	}

	session, _ := h.Store.Get(r, "session-name")
	session.Values["access_token"] = accessToken
	session.Values["username"] = username
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
	`, username, h.FrontendURL)

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(script))
}

func (h *Handler) LogoutHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := h.Store.Get(r, "session-name")
	session.Values["access_token"] = nil
	session.Values["username"] = nil
	session.Values["provider"] = nil
	session.Options.MaxAge = -1
	session.Save(r, w)
	w.WriteHeader(http.StatusOK)
}

func (h *Handler) StatusHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := h.Store.Get(r, "session-name")
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
