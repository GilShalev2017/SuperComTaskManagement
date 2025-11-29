# Task Manager Application

Full-stack task management application with .NET Core, React, SQL Server, and RabbitMQ.

## 🚀 Quick Start

### Prerequisites
- .NET 8.0 SDK
- Node.js 18+
- SQL Server 2019+
- RabbitMQ

### Setup

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/TaskManager.git
cd TaskManager
```

2. Run setup script
```powershell
powershell -ExecutionPolicy Bypass -File setup.ps1
```

3. Configure environment
- Copy `Backend/TaskManager.API/appsettings.example.json` to `appsettings.json`
- Copy `Frontend/task-manager-ui/.env.example` to `.env`
- Update connection strings if needed

4. Run the application
```powershell
powershell -File run-all.ps1
```

## 📚 Documentation

See full documentation in [README.md](./README.md)

## 🏗️ Architecture

- **Backend**: .NET Core 8.0 Web API
- **Frontend**: React 18 with TypeScript
- **Database**: SQL Server
- **Message Queue**: RabbitMQ
- **State Management**: Redux Toolkit

## 📦 Project Structure
```
TaskManager/
├── Backend/          # .NET Core projects
├── Frontend/         # React application
└── Database/         # SQL scripts
```