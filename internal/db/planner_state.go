package db

import (
	"context"
	"database/sql"
	"time"
)

type PlannerState struct {
	ProjectID    string    `json:"project_id"`
	Stage        string    `json:"stage"`
	ProjectType  string    `json:"project_type"`
	Niche        string    `json:"niche"`
	Objective    string    `json:"objective"`
	Deliverables string    `json:"deliverables"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (s *Store) GetPlannerState(ctx context.Context, projectID string) (*PlannerState, error) {
	row := s.DB.QueryRowContext(ctx, `SELECT project_id, stage, project_type, niche, objective, deliverables, updated_at FROM project_planner_state WHERE project_id = ? LIMIT 1`, projectID)
	st := &PlannerState{}
	if err := row.Scan(&st.ProjectID, &st.Stage, &st.ProjectType, &st.Niche, &st.Objective, &st.Deliverables, &st.UpdatedAt); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return st, nil
}

func (s *Store) UpsertPlannerState(ctx context.Context, st *PlannerState) error {
	if st == nil {
		return nil
	}
	current, err := s.GetPlannerState(ctx, st.ProjectID)
	if err != nil {
		return err
	}
	now := time.Now()
	if current == nil {
		_, err = s.DB.ExecContext(ctx, `INSERT INTO project_planner_state (project_id, stage, project_type, niche, objective, deliverables, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
			st.ProjectID, st.Stage, st.ProjectType, st.Niche, st.Objective, st.Deliverables, now)
		return err
	}
	_, err = s.DB.ExecContext(ctx, `UPDATE project_planner_state SET stage = ?, project_type = ?, niche = ?, objective = ?, deliverables = ?, updated_at = ? WHERE project_id = ?`,
		st.Stage, st.ProjectType, st.Niche, st.Objective, st.Deliverables, now, st.ProjectID)
	return err
}
