Write-Host "Task Manager Application - Docker Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if Docker is running
Write-Host "`nChecking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Start SQL Server
Write-Host "`nStarting SQL Server 2022..." -ForegroundColor Yellow
$sqlContainer = docker ps -a -q -f name=sqlserver2022
if ($sqlContainer) {
    Write-Host "SQL Server container exists, starting..." -ForegroundColor Cyan
    docker start sqlserver2022
} else {
    Write-Host "Creating SQL Server container..." -ForegroundColor Cyan
    docker run -d `
        --name sqlserver2022 `
        -e "ACCEPT_EULA=Y" `
        -e "SA_PASSWORD=Strong!Passw0rd" `
        -p 1433:1433 `
        -v C:\docker\sqlserver\data:/var/opt/mssql/data `
        -v C:\docker\sqlserver\backups:/var/opt/mssql/backups `
        mcr.microsoft.com/mssql/server:2022-latest
}

# Wait for SQL Server to be ready
Write-Host "Waiting for SQL Server to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Start RabbitMQ
Write-Host "`nStarting RabbitMQ..." -ForegroundColor Yellow
$rabbitContainer = docker ps -a -q -f name=rabbitmq
if ($rabbitContainer) {
    Write-Host "RabbitMQ container exists, starting..." -ForegroundColor Cyan
    docker start rabbitmq
} else {
    Write-Host "Creating RabbitMQ container..." -ForegroundColor Cyan
    docker run -d `
        --name rabbitmq `
        -p 5672:5672 `
        -p 15672:15672 `
        -e RABBITMQ_DEFAULT_USER=guest `
        -e RABBITMQ_DEFAULT_PASS=guest `
        rabbitmq:3-management
}

Write-Host "`n✓ Docker containers started!" -ForegroundColor Green
Write-Host "`nContainer Status:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "Services Available:" -ForegroundColor Yellow
Write-Host "  SQL Server: localhost,1433" -ForegroundColor Cyan
Write-Host "  Username: sa" -ForegroundColor Cyan
Write-Host "  Password: Strong!Passw0rd" -ForegroundColor Cyan
Write-Host "`n  RabbitMQ: localhost:5672" -ForegroundColor Cyan
Write-Host "  Management UI: http://localhost:15672" -ForegroundColor Cyan
Write-Host "  Username: guest" -ForegroundColor Cyan
Write-Host "  Password: guest" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Apply database migrations:" -ForegroundColor Cyan
Write-Host "   cd Backend/TaskManager.API" -ForegroundColor White
Write-Host "   dotnet ef database update" -ForegroundColor White
Write-Host "`n2. Run the application:" -ForegroundColor Cyan
Write-Host "   Use run-all.ps1 script" -ForegroundColor White