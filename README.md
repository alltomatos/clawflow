# ClawProject 🦞

**Seu gestor de projetos com IA, integrado ao OpenClaw.**

ClawProject foi feito para quem quer sair de uma ideia e chegar em uma entrega real com menos fricção.
Você cria o projeto, o agente ajuda a planejar, transforma em tarefas e acompanha até a entrega final.

---

## Para quem é

- Gestores de projeto
- Fundadores/operadores
- Times enxutos que precisam executar rápido

Se você já perdeu tempo com board bonito e pouca entrega, esse projeto é para você.

---

## O que você consegue fazer hoje (MVP)

1. **Criar projeto** pelo dashboard
2. **Conversar com o gestor IA** do projeto
3. **Registrar planejamento** em `docs/PLANNING.md`
4. **Organizar execução** com cards/tarefas
5. **Fechar entrega** com endpoint de `deliver` e gerar `docs/DELIVERY.md`

---

## Fluxo recomendado (ponta a ponta)

1. **Create Project**
2. **Start Execution** (ativa diretrizes do gestor)
3. **Refinar escopo e roadmap** com o agente
4. **Executar tarefas críticas**
5. **Deliver Project** (gera artefato final)

Resumo: **create → plan → execute → deliver**.

---

## Primeiros 5 minutos

### 1) Subir backend

```bash
go run cmd/main.go
```

Dashboard:
- `http://127.0.0.1:19192`

### 2) Criar projeto
Use a interface web em `/api/projects`.

### 3) Iniciar execução
Endpoint:
- `POST /api/projects/:id/manager/control`
- Body: `{ "action": "start-execution" }`

### 4) Fechar entrega (MVP)
Endpoint:
- `POST /api/projects/:id/deliver`

Exemplo:
```json
{
  "approved_by": "ronaldo",
  "notes": "entrega MVP",
  "force": true
}
```

---

## Entregáveis gerados

No diretório do projeto (`/workspace/<nome-projeto>/docs`):

- `PLANNING.md` (planejamento vivo)
- `ROADMAP.md` (quando disponível)
- `DELIVERY.md` (resumo da entrega final)

---

## Limites atuais do MVP

Transparência total:

- Ainda não é um produto enterprise
- Alguns fluxos ainda dependem de validações progressivas
- O foco atual é **validar o ciclo completo de entrega**

Se esse ciclo funcionar com consistência, a base está pronta para escala.

---

## Stack (resumo técnico)

- Go
- SQLite
- Dashboard web embutido
- Integração com OpenClaw

---

## Visão do produto

ClawProject não é só um Kanban.
É um **orquestrador de execução com IA**, onde cada projeto tem contexto, plano e trilha de entrega.

---

**Desenvolvido por Ronaldo & watinker_bot.**
