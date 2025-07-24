# SafeKey CLI Demo Script (PowerShell)
# This script demonstrates the core functionality of SafeKey

Write-Host "SafeKey CLI Demo" -ForegroundColor Blue
Write-Host "===================" -ForegroundColor Blue
Write-Host ""

# Set up demo vault path
$DEMO_VAULT = "./demo-vault.json"
$NODE_CMD = "node dist/index.js"

Write-Host "1. Initializing a new vault..." -ForegroundColor Green
Write-Host "   Command: $NODE_CMD init --vault $DEMO_VAULT" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Adding secrets to the vault..." -ForegroundColor Green
Write-Host "   Commands:" -ForegroundColor Gray
Write-Host "   - $NODE_CMD add API_KEY --vault $DEMO_VAULT" -ForegroundColor Gray
Write-Host "   - $NODE_CMD add DATABASE_URL --vault $DEMO_VAULT" -ForegroundColor Gray
Write-Host "   - $NODE_CMD add JWT_SECRET --vault $DEMO_VAULT" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Listing all secrets..." -ForegroundColor Green
Write-Host "   Command: $NODE_CMD list --vault $DEMO_VAULT" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Getting a specific secret..." -ForegroundColor Green
Write-Host "   Command: $NODE_CMD get API_KEY --vault $DEMO_VAULT --show" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Exporting secrets to .env format..." -ForegroundColor Green
Write-Host "   Command: $NODE_CMD export --vault $DEMO_VAULT --format env --output demo.env" -ForegroundColor Gray
Write-Host ""

Write-Host "6. Removing a secret..." -ForegroundColor Green
Write-Host "   Command: $NODE_CMD remove JWT_SECRET --vault $DEMO_VAULT --force" -ForegroundColor Gray
Write-Host ""

Write-Host "7. Final vault status..." -ForegroundColor Green
Write-Host "   Command: $NODE_CMD list --vault $DEMO_VAULT --verbose" -ForegroundColor Gray
Write-Host ""

Write-Host "To run this demo interactively:" -ForegroundColor Yellow
Write-Host "1. npm run build" -ForegroundColor Gray
Write-Host "2. Follow the commands above manually" -ForegroundColor Gray
Write-Host "3. Use password: 'demo123' for demonstration" -ForegroundColor Gray
Write-Host ""

Write-Host "Note: This is a demonstration script. In a real scenario, you would" -ForegroundColor Cyan
Write-Host "enter your master password securely when prompted." -ForegroundColor Cyan
Write-Host ""

Write-Host "Security Features:" -ForegroundColor Magenta
Write-Host "- AES-256-GCM encryption" -ForegroundColor Gray
Write-Host "- PBKDF2 key derivation (100,000 iterations)" -ForegroundColor Gray
Write-Host "- Secure memory management" -ForegroundColor Gray
Write-Host "- Offline-first architecture" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy secret managing!" -ForegroundColor Green
