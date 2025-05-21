Write-Host "Pulling latest changes from GitHub..." -ForegroundColor Green
git pull origin main

Write-Host "Installing dependencies..." -ForegroundColor Green
npm install

Write-Host "Starting development server..." -ForegroundColor Green
npm run dev 