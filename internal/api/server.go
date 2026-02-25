package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/alltomatos/clawflow/internal/core"
	"github.com/alltomatos/clawflow/internal/db"
)

type Server struct {
	store *db.Store
}

func NewServer(store *db.Store) *Server {
	return &Server{store: store}
}

func (s *Server) RegisterHandlers() {
	http.HandleFunc("/api/projects", s.handleProjects)
	http.HandleFunc("/api/status", s.handleStatus)
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "ok", 
		"time": time.Now(),
		"gateway": "stable",
	})
}

func (s *Server) handleProjects(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	switch r.Method {
	case http.MethodGet:
		// TODO: Implementar store.ListProjects()
		projects := []core.Project{}
		json.NewEncoder(w).Encode(projects)

	case http.MethodPost:
		var p core.Project
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		
		p.ID = time.Now().Format("20060102-150405")
		p.CreatedAt = time.Now()
		p.Status = "active"
		
		// TODO: Implementar store.CreateProject(&p)
		
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(p)
	}
}
