package main

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"

	"github.com/alltomatos/clawflow/internal/agent"
	"github.com/alltomatos/clawflow/internal/api"
	"github.com/alltomatos/clawflow/internal/core"
	"github.com/alltomatos/clawflow/internal/db"
)

//go:embed all:ui
var uiAssets embed.FS

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

	// 3. Conectar ao Gateway como Operador (Background)
	client := agent.NewClient(cfg)
	go func() {
		if err := client.Connect(); err != nil {
			fmt.Printf("Aviso: Falha na conexão agentica: %v\n", err)
		}
	}()

	// 4. Inicializar APIs
	apiServer := api.NewServer(store)
	apiServer.RegisterHandlers()

	// 5. Servir Frontend Embutido
	distFS, _ := fs.Sub(uiAssets, "ui")
	
	http.Handle("/", http.FileServer(http.FS(distFS)))

	serverPort := 19192
	fmt.Printf("Dashboard disponível em: http://0.0.0.0:%d\n", serverPort)
	
	if err := http.ListenAndServe(fmt.Sprintf("0.0.0.0:%d", serverPort), nil); err != nil {
		log.Fatal(err)
	}
}
