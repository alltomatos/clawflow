package db

import (
	"context"
	"database/sql"
	"time"
)

type ManagerProfile struct {
	ProjectID    string    `json:"project_id"`
	Instructions string    `json:"instructions"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (s *Store) GetManagerProfile(ctx context.Context, projectID string) (*ManagerProfile, error) {
	row := s.DB.QueryRowContext(ctx, `SELECT project_id, instructions, updated_at FROM project_manager_profile WHERE project_id = ? LIMIT 1`, projectID)
	mp := &ManagerProfile{}
	if err := row.Scan(&mp.ProjectID, &mp.Instructions, &mp.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return &ManagerProfile{ProjectID: projectID, Instructions: ""}, nil
		}
		return nil, err
	}
	return mp, nil
}

func (s *Store) UpsertManagerProfile(ctx context.Context, projectID, instructions string) error {
	_, err := s.DB.ExecContext(ctx, `
		INSERT INTO project_manager_profile (project_id, instructions, updated_at)
		VALUES (?, ?, ?)
		ON CONFLICT(project_id)
		DO UPDATE SET instructions = excluded.instructions, updated_at = excluded.updated_at
	`, projectID, instructions, time.Now())
	return err
}
