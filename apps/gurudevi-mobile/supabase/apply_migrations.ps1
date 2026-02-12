# ============================================
# SUPABASE MIGRATION HELPER SCRIPT
# ============================================
# Purpose: Helper script to apply Supabase migrations manually
# This script helps you apply migrations in order and track status
# ============================================

param(
    [string]$MigrationFile = "",
    [switch]$ShowStatus,
    [switch]$ListMigrations,
    [switch]$Help
)

$MigrationsDir = "$PSScriptRoot\migrations"
$StatusFile = "$PSScriptRoot\migration_status.md"

function Show-Help {
    Write-Host "Supabase Migration Helper" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\apply_migrations.ps1 -ListMigrations    Show all migration files"
    Write-Host "  .\apply_migrations.ps1 -ShowStatus        Show current migration status"
    Write-Host "  .\apply_migrations.ps1 -MigrationFile <name>   Show migration file content"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\apply_migrations.ps1 -ListMigrations"
    Write-Host "  .\apply_migrations.ps1 -MigrationFile 20260205_features_schema.sql"
    Write-Host ""
    Write-Host "Manual Application Steps:"
    Write-Host "  1. Run with -MigrationFile to see the SQL content"
    Write-Host "  2. Copy the SQL content"
    Write-Host "  3. Paste into Supabase Dashboard > SQL Editor"
    Write-Host "  4. Run the SQL"
    Write-Host "  5. Update migration_status.md manually"
}

function Show-MigrationList {
    Write-Host "Available Migration Files:" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not (Test-Path $MigrationsDir)) {
        Write-Host "Migrations directory not found: $MigrationsDir" -ForegroundColor Red
        return
    }
    
    $migrations = Get-ChildItem -Path $MigrationsDir -Filter "*.sql" | Sort-Object Name
    
    $index = 1
    foreach ($migration in $migrations) {
        Write-Host ("{0,2}. {1}" -f $index, $migration.Name) -ForegroundColor Yellow
        $index++
    }
    
    Write-Host ""
    Write-Host "Total: $($migrations.Count) migration files" -ForegroundColor Green
}

function Show-Status {
    Write-Host "Current Migration Status:" -ForegroundColor Cyan
    Write-Host ""
    
    if (-not (Test-Path $StatusFile)) {
        Write-Host "Status file not found: $StatusFile" -ForegroundColor Red
        return
    }
    
    Get-Content $StatusFile | Select-String -Pattern "^\|.*\|.*\|.*\|.*\|$" | ForEach-Object {
        $line = $_.Line
        if ($line -match "✅") {
            Write-Host $line -ForegroundColor Green
        } elseif ($line -match "❌") {
            Write-Host $line -ForegroundColor Red
        } elseif ($line -match "❓") {
            Write-Host $line -ForegroundColor Yellow
        } elseif ($line -match "⚠️") {
            Write-Host $line -ForegroundColor Magenta
        } else {
            Write-Host $line
        }
    }
}

function Show-Migration {
    param([string]$FileName)
    
    $filePath = Join-Path $MigrationsDir $FileName
    
    if (-not (Test-Path $filePath)) {
        Write-Host "Migration file not found: $filePath" -ForegroundColor Red
        Write-Host "Use -ListMigrations to see available files" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Migration File: $FileName" -ForegroundColor Cyan
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host ""
    
    $content = Get-Content $filePath -Raw
    Write-Host $content
    
    Write-Host ""
    Write-Host ("=" * 60) -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Copy the SQL content above"
    Write-Host "2. Open Supabase Dashboard > SQL Editor"
    Write-Host "3. Paste and run the SQL"
    Write-Host "4. Update migration_status.md if successful"
    Write-Host ""
    
    # Option to copy to clipboard (requires clip)
    $response = Read-Host "Copy to clipboard? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        $content | Set-Clipboard
        Write-Host "✅ Copied to clipboard!" -ForegroundColor Green
    }
}

# Main script logic
if ($Help) {
    Show-Help
    exit
}

if ($ListMigrations) {
    Show-MigrationList
    exit
}

if ($ShowStatus) {
    Show-Status
    exit
}

if ($MigrationFile -ne "") {
    Show-Migration -FileName $MigrationFile
    exit
}

# Default: show help
Show-Help
