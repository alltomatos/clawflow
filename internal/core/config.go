package core

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// OpenClawConfig representa a estrutura simplificada do openclaw.json
type OpenClawConfig struct {
	Gateway struct {
		Port  int    `json:"port"`
		Token string `json:"token"`
	} `json:"gateway"`
	Agent struct {
		Workspace string `json:"workspace"`
	} `json:"agent"`
}

// LoadConfig tenta localizar e carregar o arquivo openclaw.json
func LoadConfig() (*OpenClawConfig, error) {
	home, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("falha ao obter home dir: %w", err)
	}

	configPath := filepath.Join(home, ".openclaw", "openclaw.json")
	
	// Ajuste para Windows se necessrio, embora filepath.Join j lide com isso
	if runtime.GOOS == "windows" {
		// No Windows o OpenClaw costuma seguir o mesmo padro ~/.openclaw
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("no foi possvel ler %s: %w", configPath, err)
	}

	var config OpenClawConfig
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("erro no parse do JSON: %w", err)
	}

	return &config, nil
}
