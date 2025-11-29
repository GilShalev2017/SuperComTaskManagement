# Task Manager Application

Full-stack task management system built with **.NET Core**, **React**, **SQL Server**, and **RabbitMQ**.

---

## 🏗️ **Architecture Overview**

- **Backend:** .NET Core 9.0 Web API  
- **Frontend:** React 18, TypeScript, Vite  
- **Database:** SQL Server 2022 (Dockerized)  
- **Message Queue:** RabbitMQ (Dockerized)  
- **State Management:** Redux Toolkit  

---

## 📦 **Project Structure**

TaskManager/
├── docker-compose.yml
├── Backend/
│ ├── TaskManager.sln
│ ├── TaskManager.Core/ # Domain models & DTOs
│ ├── TaskManager.Data/ # EF Core, Repositories
│ ├── TaskManager.API/ # Web API
│ ├── TaskManager.Service/ # Windows Service (RabbitMQ consumer)
│ └── TaskManager.Tests/ # Unit tests
├── Frontend/
│ └── task-manager-ui/ # React + TypeScript
└── Database/
└── Scripts/ # SQL scripts

yaml
Copy code

---

## 🚀 **Getting Started**

### **Prerequisites**

**Required:**
- .NET 9.0 SDK  
- Node.js 18+  
- Docker Desktop (must be running)

---

## 🔽 **Clone the Repository**
```bash
git clone https://github.com/YOUR_USERNAME/TaskManager.git
cd TaskManager
⚡ Quick Start with Docker Compose (Recommended)
powershell
Copy code
docker-compose up -d

docker-compose ps
docker-compose logs -f   # optional
This starts:

SQL Server 2022 → port 1433

RabbitMQ → port 5672

RabbitMQ Management UI → port 15672

🐋 Manual Docker Setup (Optional)
SQL Server 2022
powershell
Copy code
docker run -d `
  --name sqlserver2022 `
  -e "ACCEPT_EULA=Y" `
  -e "SA_PASSWORD=Strong!Passw0rd" `
  -p 1433:1433 `
  -v C:\docker\sqlserver\data:/var/opt/mssql/data `
  -v C:\docker\sqlserver\backups:/var/opt/mssql/backups `
  mcr.microsoft.com/mssql/server:2022-latest
RabbitMQ with Management UI
powershell
Copy code
docker run -d `
  --name rabbitmq `
  -p 5672:5672 `
  -p 15672:15672 `
  -e RABBITMQ_DEFAULT_USER=guest `
  -e RABBITMQ_DEFAULT_PASS=guest `
  rabbitmq:3-management
RabbitMQ Management UI → http://localhost:15672
Credentials: guest / guest

🖥️ Backend Setup
powershell
Copy code
cd Backend/TaskManager.API
dotnet restore

# Developers only (testers skip this):
dotnet ef database update --project ../TaskManager.Data --startup-project .

dotnet run
API → https://localhost:7001
Swagger → https://localhost:7001/swagger

⚙️ Windows Service (RabbitMQ Listener)
powershell
Copy code
cd Backend/TaskManager.Service
dotnet restore
dotnet run
🌐 Frontend Setup
powershell
Copy code
cd Frontend/task-manager-ui
npm install
npm run dev
Frontend → http://localhost:3000

🐳 Docker Management
Docker Compose
powershell
Copy code
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose logs -f sqlserver
docker-compose logs -f rabbitmq
docker-compose restart
docker-compose ps
SQL Server Container
powershell
Copy code
docker start sqlserver2022
docker stop sqlserver2022
docker logs sqlserver2022
docker rm sqlserver2022
docker exec -it sqlserver2022 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Strong!Passw0rd"
RabbitMQ Container
powershell
Copy code
docker start rabbitmq
docker stop rabbitmq
docker logs rabbitmq
docker rm rabbitmq
docker exec -it rabbitmq bash
⚙️ Configuration
Database Connection String
json
Copy code
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=TaskManagerDB;User Id=sa;Password=Strong!Passw0rd;TrustServerCertificate=True;"
  }
}
RabbitMQ Configuration
json
Copy code
{
  "RabbitMQ": {
    "HostName": "localhost",
    "Port": 5672,
    "UserName": "guest",
    "Password": "guest",
    "QueueName": "task-reminders"
  }
}
🧪 Testing
Backend
powershell
Copy code
cd Backend/TaskManager.Tests
dotnet test
Frontend
powershell
Copy code
cd Frontend/task-manager-ui
npm test
📊 Database Schema
Tables
Tasks
Id (PK)

Title (nvarchar 200, required)

Description (nvarchar 2000)

DueDate (datetime2, required)

Priority (1=Low, 2=Medium, 3=High)

FullName, Telephone, Email

CreatedAt, UpdatedAt

Tags
Id (PK)

Name (nvarchar 50, unique)

TaskTags
TaskId (FK)

TagId (FK)

SQL Example: Tasks With ≥2 Tags
sql
Copy code
SELECT 
    t.Id, t.Title, t.Description, t.DueDate, t.Priority,
    t.FullName, t.Email, t.Telephone,
    COUNT(tt.TagId) AS TagCount,
    STRING_AGG(tag.Name, ', ') AS TagNames
FROM Tasks t
INNER JOIN TaskTags tt ON t.Id = tt.TaskId
INNER JOIN Tags tag ON tt.TagId = tag.Id
GROUP BY 
    t.Id, t.Title, t.Description, t.DueDate, t.Priority,
    t.FullName, t.Email, t.Telephone
HAVING COUNT(tt.TagId) >= 2
ORDER BY TagCount DESC, t.Title ASC;
🎯 Key Features
Full CRUD for tasks

Real-time validation

Many-to-many Tasks–Tags

RabbitMQ task-reminder queue

Windows Service checks overdue tasks every minute

Material-UI responsive UI

Redux Toolkit state

EF Core Code-First

Repository + Unit of Work

Structured logging (Serilog)

Backend + frontend unit tests

🔧 Troubleshooting
Docker daemon not running
→ Open Docker Desktop → wait for initialization → run docker ps.

SQL Server not accessible
Verify container: docker-compose ps

Start: docker-compose up -d sqlserver

Logs: docker logs sqlserver2022

Test:

powershell
Copy code
docker exec -it sqlserver2022 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Strong!Passw0rd"
RabbitMQ connection issues
Ensure container is running

Access management UI: http://localhost:15672

Inspect logs

Ports in use
Find process:

powershell
Copy code
netstat -ano | findstr :1433
taskkill /PID <PID> /F
EF Migration issues
Rebuild migrations if necessary.

📋 API Endpoints
Tasks
GET /api/tasks

GET /api/tasks/{id}

POST /api/tasks

PUT /api/tasks/{id}

DELETE /api/tasks/{id}

Tags
GET /api/tags

POST /api/tags

🛑 Cleanup
powershell
Copy code
docker-compose down
docker stop sqlserver2022 rabbitmq
docker rm sqlserver2022 rabbitmq
docker-compose down -v   # removes ALL data
📝 Validation Rules
Title: required, ≤ 200 chars

Description: ≤ 2000 chars

DueDate: required, must be in the future

Priority: 1–3

FullName: 2–100 chars

Telephone: valid phone

Email: valid email

Tags: at least one required

🎓 Technologies Used
Backend
.NET Core 9

EF Core 9

FluentValidation

Serilog

xUnit, Moq

Frontend
React 18

TypeScript

Redux Toolkit

Material-UI

React Hook Form

Axios

Vite

Infrastructure
SQL Server 2022

RabbitMQ

Docker Compose

📞 Access Summary
Service	URL	Credentials
Frontend	http://localhost:3000	—
API	https://localhost:7001	—
Swagger	https://localhost:7001/swagger	—
SQL Server	localhost,1433	sa / Strong!Passw0rd
RabbitMQ	localhost:5672	guest / guest
RabbitMQ UI	http://localhost:15672	guest / guest

📄 License
This project is provided for educational and evaluation purposes.

yaml
Copy code

---

If you want, I can also **add a fully detailed “Migration Instructions for Testers” section** right inside the README so the tester doesn’t need to touch migrations or EF commands manually.  

Do you want me to do that next?