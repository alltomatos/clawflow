param(
  [string]$BaseUrl = "http://127.0.0.1:19192",
  [string]$ProjectName = "mvp-e2e-smoke",
  [int]$SleepMs = 900
)

$ErrorActionPreference = "Stop"

Write-Host "[1/6] Creating project..."
$projectBody = @{ name = $ProjectName; description = "smoke test mvp" } | ConvertTo-Json
$p = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/projects" -ContentType "application/json" -Body $projectBody
$projectId = $p.id
Write-Host "Project ID: $projectId"
Write-Host "Project Path: $($p.path)"

$steps = @(
  "Projeto novo",
  "software",
  "Objetivo: validar release candidate do MVP",
  "Entregáveis: PRD, DER, POPs e backlog inicial",
  "Próximo marco: validar documentação incremental"
)

Write-Host "[2/6] Running planner flow..."
foreach ($m in $steps) {
  Start-Sleep -Milliseconds $SleepMs
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/projects/$projectId/manager/message" -ContentType "application/json" -Body (@{ message = $m } | ConvertTo-Json) | Out-Null
  Write-Host "  OK -> $m"
}

Write-Host "[3/6] Checking manager status..."
$mgr = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/projects/$projectId/manager"
Write-Host "manager_status=$($mgr.manager_status) daily_calls=$($mgr.daily_calls) api_calls=$($mgr.api_calls)"

Write-Host "[4/6] Checking messages + summary..."
$msgs = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/projects/$projectId/messages"
$sum = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/projects/$projectId/summary"
Write-Host "messages_count=$($msgs.Count) summary_version=$($sum.version)"

Write-Host "[5/6] Checking docs artifacts..."
$docsPath = Join-Path $p.path "docs"
$required = @("PLANNING.md", "PRD.md", "DER.md", "POPS.md")
$missing = @()
foreach ($f in $required) {
  if (!(Test-Path (Join-Path $docsPath $f))) { $missing += $f }
}
if ($missing.Count -gt 0) {
  throw "Missing docs: $($missing -join ', ')"
}
Write-Host "docs OK: $($required -join ', ')"

Write-Host "[6/6] Checking git checkpoint commits..."
$gitLog = git -C $p.path log --oneline -n 5
$found = $false
foreach ($line in $gitLog) {
  if ($line -match "chore\(docs\): marco") { $found = $true; break }
}
if (-not $found) {
  throw "No docs checkpoint commit found in last 5 commits"
}
Write-Host "git checkpoint OK"

Write-Host ""
Write-Host "SMOKE_E2E_OK project_id=$projectId"
