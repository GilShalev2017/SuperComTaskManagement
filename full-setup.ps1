# SuperComTaskManagement Full Setup Script
# Author: ChatGPT / Gil Shalev
# Date: 2025-11-29

# -------------------------------
# Step 0: Ask for installation folder
# -------------------------------
$defaultInstallFolder = "C:\Temp\SuperComTaskManagement"
$installFolder = Read-Host "Enter installation folder path [`"$defaultInstallFolder`"]"
if ([string]::IsNullOrWhiteSpace($installFolder)) {
    $installFolder = $defaultInstallFolder
}

Write-Host "`nInstallation folder: $installFolder" -ForegroundColor Green

# -------------------------------
# Step 1: Stop & remove existing Docker containers
# -------------------------------
$dockerContainers = @("sqlserver2022","rabbitmq")

foreach ($container in $dockerContainers) {
    $exists = docker ps -a -q -f "name=$container"
    if ($exists) {
        Write-Host "Stopping Docker container $container..." -ForegroundColor Yellow
        docker stop $container | Out-Null
        Write-Host "Removing Docker container $container..." -ForegroundColor Yellow
        docker rm $container | Out-Null
    }
}

# Optionally remove volumes (to fully reset SQL Server data)
$removeVolumes = Read-Host "Do you want to remove Docker volumes for a clean install? (y/N)"
if ($removeVolumes -eq "y" -or $removeVolumes -eq "Y") {
    Write-Host "Removing SQL Server & RabbitMQ Docker volumes..." -ForegroundColor Yellow
    docker volume rm sqlserver2022_data -f 2>$null
    docker volume rm rabbitmq_data -f 2>$null
}

# -------------------------------
# Step 2: Delete old folder if it exists
# -------------------------------
if (Test-Path $installFolder) {
    Write-Host "Removing existing folder $installFolder..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $installFolder -Recurse -Force
    } catch {
        Write-Host "Error deleting folder. Make sure no files are in use." -ForegroundColor Red
        exit 1
    }
}

# -------------------------------
# Step 3: Clone the Git repository
# -------------------------------
Write-Host "`nCloning Git repository..." -ForegroundColor Green
git clone https://github.com/GilShalev2017/SuperComTaskManagement.git $installFolder
if ($LASTEXITCODE -ne 0) {
    Write-Host "Git clone failed. Please check your internet connection and credentials." -ForegroundColor Red
    exit 1
}

# -------------------------------
# Step 4: Build Backend Projects
# -------------------------------
Write-Host "`nBuilding backend projects..." -ForegroundColor Green

$backendFolder = Join-Path $installFolder "Backend"
$projectsOrder = @(
    "TaskManager.Core",
    "TaskManager.Data",
    "TaskManager.API",
    "TaskManager.Service"
)

foreach ($proj in $projectsOrder) {
    $projPath = Join-Path $backendFolder $proj
    Write-Host "`nBuilding $proj..." -ForegroundColor Cyan
    Push-Location $projPath
    dotnet clean
    dotnet build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed for $proj. Fix errors and run the script again." -ForegroundColor Red
        exit 1
    }
    Pop-Location
}

# -------------------------------
# Step 5: Start Docker Containers
# -------------------------------
Write-Host "`nStarting SQL Server and RabbitMQ Docker containers..." -ForegroundColor Green

# SQL Server
docker run -d `
    --name sqlserver2022 `
    -e "ACCEPT_EULA=Y" `
    -e "SA_PASSWORD=Strong!Passw0rd" `
    -p 1433:1433 `
    -v "$installFolder\docker\sqlserver\data:/var/opt/mssql/data" `
    -v "$installFolder\docker\sqlserver\backups:/var/opt/mssql/backups" `
    mcr.microsoft.com/mssql/server:2022-latest

# RabbitMQ
docker run -d `
    --name rabbitmq `
    -p 5672:5672 `
    -p 15672:15672 `
    -e RABBITMQ_DEFAULT_USER=guest `
    -e RABBITMQ_DEFAULT_PASS=guest `
    -v "$installFolder\docker\rabbitmq:/var/lib/rabbitmq" `
    rabbitmq:3-management

# -------------------------------
# Step 6: Wait for SQL Server readiness
# -------------------------------
Write-Host "Waiting for SQL Server to be ready (20s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Optionally, can loop and try connecting using SqlClient until ready

# -------------------------------
# Step 7: Run API Project
# -------------------------------
Write-Host "`nStarting TaskManager API..." -ForegroundColor Green
$apiFolder = Join-Path $backendFolder "TaskManager.API"
Start-Process -NoNewWindow -WorkingDirectory $apiFolder -FilePath "dotnet" -ArgumentList "run"

Write-Host "Waiting 10s for API to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# -------------------------------
# Step 8: Run TaskManager Service
# -------------------------------
Write-Host "`nStarting TaskManager Windows Service..." -ForegroundColor Green
$serviceFolder = Join-Path $backendFolder "TaskManager.Service"
Start-Process -NoNewWindow -WorkingDirectory $serviceFolder -FilePath "dotnet" -ArgumentList "run"

# -------------------------------
# Step 9: Run React Frontend
# -------------------------------
Write-Host "`nStarting React Frontend..." -ForegroundColor Green
$frontendFolder = Join-Path $installFolder "Frontend\task-manager-ui"
Push-Location $frontendFolder
npm install
Start-Process -NoNewWindow -WorkingDirectory $frontendFolder -FilePath "npm" -ArgumentList "run dev -- --port 3000"
Pop-Location

# -------------------------------
# Step 10: Print URLs
# -------------------------------
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Setup Completed! Access your application at:" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "API: https://localhost:7001/swagger" -ForegroundColor Yellow
Write-Host "RabbitMQ UI: http://localhost:15672" -ForegroundColor Yellow
Write-Host "SQL Server: localhost,1433 (sa / Strong!Passw0rd)" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Green
