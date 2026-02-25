# ClawProject 🦞

**Gerenciador de Projetos Agent-Native para o Ecossistema OpenClaw.**

O ClawProject é uma ferramenta de ALM (Application Lifecycle Management) desenvolvida em Go, projetada para unir o poder de raciocínio das IAs com uma gestão visual e técnica de projetos.

## 🚀 Conceito

Diferente de gerenciadores de tarefas tradicionais, o ClawProject nasce de um diálogo. O fluxo padrão segue o ciclo:
1. **Diálogo de Descoberta:** Conversa inicial com o agente.
2. **Geração de POP:** Criação de um Procedimento Operacional Padrão flexível.
3. **Execução Visual:** Transformação do POP em cards de Kanban e execução via subagentes.

## 🛠 Stack Técnica

- **Linguagem:** Go (Golang)
- **Banco de Dados:** SQLite
- **Interface:** Web Dashboard (Embutido no binário)
- **Integração:** Nativa com Gateway OpenClaw

## 📂 Estrutura de Pastas

- `/cmd`: Entrypoint da aplicação.
- `/internal/core`: Lógica de negócio (Projetos e POPs).
- `/internal/db`: Camada de persistência e schema SQLite.
- `/internal/api`: Endpoints REST para o frontend e integrações.
- `/internal/agent`: Módulos de comunicação com o OpenClaw.
- `/ui`: Dashboard visual.

## 📝 Instalação (Draft)

```bash
git clone https://github.com/alltomatos/ClawProject
cd ClawProject
go mod download
go run cmd/main.go
```

---
*Desenvolvido por Ronaldo & watinker_bot.*
