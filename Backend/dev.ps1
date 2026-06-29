# Local dev runner for Windows PowerShell
# Avoids command-line parsing issues with this environment.

Set-Location -Path "c:\Users\USER\campusos-ai\Backend"

Write-Host "Starting backend from:" (Get-Location)

npm run dev

