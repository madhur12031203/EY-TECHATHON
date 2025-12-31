# PowerShell setup script for Buyoh Backend

Write-Host "Setting up Buyoh Backend..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Please edit .env with your configuration before continuing." -ForegroundColor Yellow
}

# Create logs directory
New-Item -ItemType Directory -Force -Path logs | Out-Null

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host ""
Write-Host "Setup complete! Next steps:" -ForegroundColor Green
Write-Host "1. Edit .env with your configuration"
Write-Host "2. Create PostgreSQL database: createdb buyoh_db"
Write-Host "3. Run migrations: npm run migrate"
Write-Host "4. Start MCP server: npm run mcp-server (in separate terminal)"
Write-Host "5. Start backend: npm run dev"

