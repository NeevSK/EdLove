param(
    [Parameter(Mandatory=$true)]
    [string]$Cmd,
    
    [Parameter(Mandatory=$true)]
    [string]$Log,
    
    [Parameter(Mandatory=$false)]
    [string]$Cwd = "."
)

# Ensure the directory for the log file exists
$logDir = [System.IO.Path]::GetDirectoryName($Log)
if (![string]::IsNullOrWhiteSpace($logDir) -and !(Test-Path -Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Run the command and pipe to both console and file with UTF-8 encoding
# We use a sequential pattern to ensure compatibility with older PowerShell versions if needed
Write-Host ">>> Running: $Cmd" -ForegroundColor Cyan

# Execute the command. 
powershell -Command "$Cmd 2>&1 | Out-File -FilePath '$Log' -Encoding utf8; Get-Content -Path '$Log'"

# The exit code of the last command in the powershell sub-process is what counts
exit $LASTEXITCODE
