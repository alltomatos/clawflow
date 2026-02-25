package db

import (
	"context"
	"time"
)

func (s *Store) IncrementDailyManagerUsage(ctx context.Context, projectID, usageDate string) (int, error) {
	if usageDate == "" {
		usageDate = time.Now().Format("2006-01-02")
	}
	_, err := s.DB.ExecContext(ctx, `
		INSERT INTO project_manager_daily_usage (project_id, usage_date, calls, updated_at)
		VALUES (?, ?, 1, ?)
		ON CONFLICT(project_id, usage_date)
		DO UPDATE SET calls = calls + 1, updated_at = excluded.updated_at
	`, projectID, usageDate, time.Now())
	if err != nil {
		return 0, err
	}
	var calls int
	err = s.DB.QueryRowContext(ctx, `SELECT calls FROM project_manager_daily_usage WHERE project_id = ? AND usage_date = ?`, projectID, usageDate).Scan(&calls)
	return calls, err
}

func (s *Store) GetDailyManagerUsage(ctx context.Context, projectID, usageDate string) (int, error) {
	if usageDate == "" {
		usageDate = time.Now().Format("2006-01-02")
	}
	var calls int
	err := s.DB.QueryRowContext(ctx, `SELECT COALESCE(calls, 0) FROM project_manager_daily_usage WHERE project_id = ? AND usage_date = ?`, projectID, usageDate).Scan(&calls)
	if err != nil {
		// no row -> zero usage
		return 0, nil
	}
	return calls, nil
}
