Write-Host "Initializing Git Repository..." -ForegroundColor Green

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "Error: Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Create root .gitignore
Write-Host "Creating root .gitignore..." -ForegroundColor Yellow
@"
# Operating System files
.DS_Store
Thumbs.db

# IDE folders
.vscode/
.idea/
*.swp
*~

# Logs
logs/
*.log

# Environment files
.env
.env.local
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8

# Create Backend .gitignore
Write-Host "Creating Backend .gitignore..." -ForegroundColor Yellow
@"
[Dd]ebug/
[Rr]elease/
x64/
x86/
[Bb]in/
[Oo]bj/
.vs/
*.user
*.suo
packages/
*.nupkg
Migrations/
"@ | Out-File -FilePath "Backend/.gitignore" -Encoding UTF8

# Create Frontend .gitignore
Write-Host "Creating Frontend .gitignore..." -ForegroundColor Yellow
@"
node_modules/
/build
/dist
.env
.env.local
npm-debug.log*
.DS_Store
"@ | Out-File -FilePath "Frontend/task-manager-ui/.gitignore" -Encoding UTF8

# Initialize git
Write-Host "Initializing Git repository..." -ForegroundColor Yellow
git init

# Add all files
Write-Host "Adding files to Git..." -ForegroundColor Yellow
git add .

# Show status
Write-Host "`nFiles to be committed:" -ForegroundColor Cyan
git status --short

Write-Host "`nGit repository initialized!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review the files to be committed above" -ForegroundColor Cyan
Write-Host "2. Run: git commit -m 'Initial commit'" -ForegroundColor Cyan
Write-Host "3. Create a repository on GitHub" -ForegroundColor Cyan
Write-Host "4. Run: git remote add origin <your-repo-url>" -ForegroundColor Cyan
Write-Host "5. Run: git push -u origin main" -ForegroundColor Cyan