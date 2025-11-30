# Task Manager Application

Full-stack task management application with .NET Core, React, SQL Server, and RabbitMQ.

## 🏗️ Architecture

- **Backend**: .NET Core 9.0 Web API
- **Frontend**: React 19 with TypeScript + Vite
- **Database**: SQL Server 2022 (Docker)
- **Message Queue**: RabbitMQ (Docker)
- **State Management**: Redux Toolkit

## 📦 Project Structure
```
TaskManager/
├── docker-compose.yml             # Docker orchestration
├── Backend/
│   ├── TaskManager.sln
│   ├── TaskManager.Core/          # Domain models & DTOs
│   ├── TaskManager.Data/          # EF Core, Repositories
│   ├── TaskManager.API/           # Web API
│   ├── TaskManager.Service/       # Windows Service (RabbitMQ)
│   └── TaskManager.Tests/         # Unit tests
├── Frontend/
│   └── task-manager-ui/           # React + TypeScript
└── Database/
    └── Scripts/                   # SQL queries
```

## 🚀 Getting Started

### Prerequisites

**Required:**
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) ⚠️ **Must be installed and running**

**Note:** Make sure Docker Desktop is running before proceeding with the setup.

### Clone the Repository
```bash
git clone https://github.com/GilShalev2017/SuperComTaskManagement.git
cd  SuperComTaskManagement
```

### Quick Setup with Docker Compose (Recommended)

The easiest way to get started is using Docker Compose:
```powershell
# Start all Docker containers (SQL Server + RabbitMQ)
docker-compose up -d

# Verify containers are running
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

**This will start:**
- SQL Server 2022 on port `1433`
- RabbitMQ on port `5672`
- RabbitMQ Management UI on port `15672`

### Alternative: Manual Docker Setup

If you prefer to run containers individually:

#### SQL Server 2022
```powershell
docker run -d `
  --name sqlserver2022 `
  -e "ACCEPT_EULA=Y" `
  -e "SA_PASSWORD=Strong!Passw0rd" `
  -p 1433:1433 `
  -v C:\docker\sqlserver\data:/var/opt/mssql/data `
  -v C:\docker\sqlserver\backups:/var/opt/mssql/backups `
  mcr.microsoft.com/mssql/server:2022-latest
```

**Verify SQL Server is running:**
```powershell
docker ps | Select-String sqlserver2022
```

#### RabbitMQ with Management Console
```powershell
docker run -d `
  --name rabbitmq `
  -p 5672:5672 `
  -p 15672:15672 `
  -e RABBITMQ_DEFAULT_USER=guest `
  -e RABBITMQ_DEFAULT_PASS=guest `
  rabbitmq:3-management
```

**Verify RabbitMQ is running:**
```powershell
docker ps | Select-String rabbitmq
```

**Access RabbitMQ Management UI:**
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

### Setup Backend
```powershell
cd Backend/TaskManager.API

# Restore packages
dotnet restore

(Developers only — testers do NOT run this)
dotnet ef database update --project ../TaskManager.Data --startup-project .

# Run the API
dotnet run
```


**API will be available at:** https://localhost:7001

**Swagger UI:** https://localhost:7001/swagger

### Setup Windows Service

Open a new terminal:
```powershell
cd Backend/TaskManager.Service

# Restore packages
dotnet restore

# Run the service
dotnet run
```

### Setup Frontend

Open a new terminal:
```powershell
cd Frontend/task-manager-ui

# Install dependencies
npm install

# Run the app
npm run dev
```

**Frontend will be available at:** http://localhost:3000

## 🐳 Docker Management

### Using Docker Compose (Recommended)
```powershell
# Start all containers
docker-compose up -d

# Stop all containers
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f sqlserver
docker-compose logs -f rabbitmq

# Restart all containers
docker-compose restart

# Check container status
docker-compose ps
```

### Managing Individual Containers

#### SQL Server Commands
```powershell
# Start container
docker start sqlserver2022

# Stop container
docker stop sqlserver2022

# View logs
docker logs sqlserver2022

# Remove container (keeps volumes)
docker rm sqlserver2022

# Connect to SQL Server
docker exec -it sqlserver2022 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Strong!Passw0rd"
```

#### RabbitMQ Commands
```powershell
# Start container
docker start rabbitmq

# Stop container
docker stop rabbitmq

# View logs
docker logs rabbitmq

# Remove container
docker rm rabbitmq

# Access shell
docker exec -it rabbitmq bash
```

### Stop All Containers
```powershell
# With Docker Compose
docker-compose down

# Or manually
docker stop sqlserver2022 rabbitmq
```

### Remove All Containers
```powershell
# With Docker Compose (removes containers but keeps volumes)
docker-compose down

# Remove containers and volumes (deletes all data)
docker-compose down -v

# Or manually
docker rm sqlserver2022 rabbitmq
```

### View Running Containers
```powershell
# All running containers
docker ps

# With Docker Compose
docker-compose ps
```

## ⚙️ Configuration

### Database Connection String

Located in:
- `Backend/TaskManager.API/appsettings.json`
- `Backend/TaskManager.Service/appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=TaskManagerDB;User Id=sa;Password=Strong!Passw0rd;TrustServerCertificate=True;"
  }
}
```

**Note:** Port `1433` is explicitly specified for Docker.

### RabbitMQ Configuration
```json
{
  "RabbitMQ": {
    "HostName": "localhost",
    "Port": 5672,
    "UserName": "guest",
    "Password": "guest",
    "QueueName": "task-reminders"
  }
}
```

## 🧪 Testing

### Backend Tests
```powershell
cd Backend/TaskManager.Tests
dotnet test
```

### Frontend Tests
```powershell
cd Frontend/task-manager-ui
npm test
```

## 📊 Database Schema

### Tables

**Tasks**
- Id (int, PK)
- Title (nvarchar(200), required)
- Description (nvarchar(2000))
- DueDate (datetime2, required)
- Priority (int, required) [1=Low, 2=Medium, 3=High]
- FullName (nvarchar(100), required)
- Telephone (nvarchar(20), required)
- Email (nvarchar(100), required)
- CreatedAt (datetime2)
- UpdatedAt (datetime2)

**Tags**
- Id (int, PK)
- Name (nvarchar(50), required, unique)

**TaskTags** (Join Table)
- TaskId (int, FK)
- TagId (int, FK)

### SQL Query: Tasks with At Least Two Tags
```sql
SELECT 
    t.Id,
    t.Title,
    t.Description,
    t.DueDate,
    t.Priority,
    t.FullName,
    t.Email,
    t.Telephone,
    COUNT(tt.TagId) AS TagCount,
    STRING_AGG(tag.Name, ', ') AS TagNames
FROM 
    Tasks t
INNER JOIN 
    TaskTags tt ON t.Id = tt.TaskId
INNER JOIN 
    Tags tag ON tt.TagId = tag.Id
GROUP BY 
    t.Id, t.Title, t.Description, t.DueDate, t.Priority, 
    t.FullName, t.Email, t.Telephone
HAVING 
    COUNT(tt.TagId) >= 2
ORDER BY 
    TagCount DESC, t.Title ASC;
```

## 🎯 Key Features

- ✅ Full CRUD operations for tasks
- ✅ Real-time validation on all fields
- ✅ N:N relationship between Tasks and Tags
- ✅ RabbitMQ message queue for task reminders
- ✅ Windows Service checks overdue tasks every minute
- ✅ Material-UI responsive design
- ✅ Redux Toolkit state management
- ✅ Entity Framework Core with Code First
- ✅ Repository Pattern + Unit of Work
- ✅ Comprehensive error handling
- ✅ Unit tests for backend and frontend

## 🔧 Troubleshooting

### Docker Desktop Not Running

**Problem:** "Cannot connect to the Docker daemon"

**Solution:**
1. Open Docker Desktop
2. Wait for it to start completely (whale icon in system tray should be steady)
3. Run `docker ps` to verify it's working

### SQL Server Connection Issues

**Problem:** Cannot connect to SQL Server

**Solution:**
```powershell
# Check if container is running
docker-compose ps
# or
docker ps

# If not running, start it
docker-compose up -d sqlserver
# or
docker start sqlserver2022

# Check logs for errors
docker-compose logs sqlserver
# or
docker logs sqlserver2022

# Test connection
docker exec -it sqlserver2022 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Strong!Passw0rd" -Q "SELECT @@VERSION"
```

### RabbitMQ Connection Issues

**Problem:** Service cannot connect to RabbitMQ

**Solution:**
```powershell
# Check if container is running
docker-compose ps

# Start RabbitMQ
docker-compose up -d rabbitmq
# or
docker start rabbitmq

# Check logs
docker-compose logs rabbitmq
# or
docker logs rabbitmq

# Verify management UI is accessible
# Open http://localhost:15672 in browser
```

### Port Already in Use

**Problem:** Port 1433, 5672, or 15672 already in use

**Solution:**
```powershell
# Find process using port (example: 1433)
netstat -ano | findstr :1433

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port mapping in docker-compose.yml
# Edit docker-compose.yml and change:
# ports:
#   - "1434:1433"  # Changed from 1433:1433
# Then update connection string to use port 1434
```

### Database Migration Issues

**Problem:** `dotnet ef database update` fails

**Solution:**
```powershell
# Make sure SQL Server is running
docker-compose ps

# Delete existing migrations
cd Backend/TaskManager.Data
Remove-Item -Recurse -Force Migrations

# Create new migration
cd ../TaskManager.API
dotnet ef migrations add InitialCreate --project ../TaskManager.Data

# Apply migration
dotnet ef database update --project ../TaskManager.Data
```

### Docker Compose Issues

**Problem:** `docker-compose` command not found

**Solution:**
Docker Desktop includes Docker Compose. Make sure:
1. Docker Desktop is installed and running
2. Try `docker compose` (without hyphen) - newer versions use this syntax
3. Or use PowerShell: `docker-compose` should work

## 📋 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag

## 🛑 Cleanup

When done with the assignment:
```powershell
# Stop all containers (using Docker Compose)
docker-compose down

# Or stop individual containers
docker stop sqlserver2022 rabbitmq

# Remove containers (keeps data volumes)
docker-compose down
# or
docker rm sqlserver2022 rabbitmq

# Remove containers AND volumes (deletes all data) - Use with caution!
docker-compose down -v
```

## 📝 Validation Rules

### Task Validation
- **Title**: Required, max 200 characters
- **Description**: Optional, max 2000 characters
- **Due Date**: Required, must be future date
- **Priority**: Required, 1-3 (Low/Medium/High)
- **Full Name**: Required, 2-100 characters
- **Telephone**: Required, valid phone format
- **Email**: Required, valid email format
- **Tags**: At least one tag required

## 🎓 Technologies Used

### Backend
- .NET Core 9.0
- Entity Framework Core 9.0
- FluentValidation
- Serilog
- xUnit, Moq (testing)

### Frontend
- React 19
- TypeScript
- Redux Toolkit
- Material-UI (MUI)
- React Hook Form
- Axios
- Vite

### Infrastructure
- SQL Server 2022 (Docker)
- RabbitMQ 3 (Docker)
- Docker Compose

## 📞 Access Points Summary

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | N/A |
| **API** | https://localhost:7001 | N/A |
| **Swagger** | https://localhost:7001/swagger | N/A |
| **SQL Server** | localhost,1433 | User: `sa`<br>Password: `Strong!Passw0rd` |
| **RabbitMQ** | localhost:5672 | User: `guest`<br>Password: `guest` |
| **RabbitMQ UI** | http://localhost:15672 | User: `guest`<br>Password: `guest` |

## 📄 License

This project is for educational/evaluation purposes.