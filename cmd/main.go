package main

import (
	"fmt"
	"log"

	"github.com/alltomatos/clawflow/internal/agent"
	"github.com/alltomatos/clawflow/internal/core"
	"github.com/alltomatos/clawflow/internal/db"
)

func main() {
	fmt.Println("🦞 ClawFlow - Gerenciador de Projetos Agent-Native")

	// 1. Carregar Config do OpenClaw
	cfg, err := core.LoadConfig()
	if err != nil {
		log.Fatalf("Erro ao carregar openclaw.json: %v", err)
	}
	fmt.Printf("Config carregada! Gateway na porta: %d\n", cfg.Gateway.Port)

	// 2. Inicializar Banco de Dados (SQLite)
	store, err := db.NewStore()
	if err != nil {
		log.Fatalf("Erro ao inicializar SQLite: %v", err)
	}
	fmt.Println("Banco de dados SQLite pronto!")
	defer store.DB.Close()

	// 3. Conectar ao Gateway como Operador
	client := agent.NewClient(cfg)
	if err := client.Connect(); err != nil {
		fmt.Printf("Aviso: No foi possvel conectar ao Gateway: %v\n", err)
	}

	// 4. Manter vivo
	fmt.Println("ClawFlow rodando. Pressione Ctrl+C para sair.")
	select {}
}
