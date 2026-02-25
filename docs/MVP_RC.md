# ClawProject MVP Release Candidate (RC)

## Objetivo
Checklist curto para validar o MVP ponta a ponta antes de release.

## Pré-requisitos
- API rodando em `http://127.0.0.1:19192`
- `go build` sem erros
- Git instalado no host

## Smoke test (1 comando)
```powershell
pwsh ./scripts/e2e_smoke.ps1
```

## Critérios de aceite (RC)
- [ ] Criação de projeto funcionando via `/api/projects`
- [ ] Triagem state machine (novo/existente + nicho + objetivo + entregáveis)
- [ ] `docs/PLANNING.md` atualizado automaticamente
- [ ] Entregáveis do nicho gerados em `docs/`
- [ ] Marcos incrementais anexados nos docs
- [ ] Resumo de projeto atualizado (`/summary`)
- [ ] Checkpoint git automático com `chore(docs): marco ...`
- [ ] Guardrails de limite ativos (debounce/429 + limite diário)

## Observações operacionais
- Se houver 429, respeitar >800ms entre mensagens.
- Para bridge real do gestor, habilitar `OPENCLAW_MANAGER_ENABLED=true`.
- Para cota diária, ajustar `OPENCLAW_MANAGER_DAILY_LIMIT`.

## Comandos úteis
```powershell
# Build
cd C:/Users/ronaldo/.openclaw/workspace/clawproject
go build ./...

# Run local
$env:OPENCLAW_MANAGER_ENABLED='false'
./clawproject.exe
```
