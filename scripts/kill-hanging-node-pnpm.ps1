# Script to identify and kill hanging Node and pnpm processes that are not related to the current shell/IDE session.

function Get-Ancestors($pidToCheck) {
    $ancestors = @()
    $p = Get-CimInstance Win32_Process -Filter "ProcessId = $pidToCheck"
    while ($p -and $p.ParentProcessId -ne 0) {
        $ancestors += $p.ParentProcessId
        $p = Get-CimInstance Win32_Process -Filter "ProcessId = $($p.ParentProcessId)"
    }
    return $ancestors
}

$currentPid = $PID
$allowedRoots = @($currentPid)

# Include the parent of the current powershell if it exists
$currentPowerShellProc = Get-CimInstance Win32_Process -Filter "ProcessId = $currentPid"
if ($currentPowerShellProc) {
    $allowedRoots += $currentPowerShellProc.ParentProcessId
}

# If language server is running (e.g. in the background/IDE context), try to find and protect it too
$languageServers = Get-CimInstance Win32_Process -Filter "Name LIKE 'language_server%'"
foreach ($ls in $languageServers) {
    $allowedRoots += $ls.ProcessId
}

Write-Host "Allowed root/ancestor PIDs: $($allowedRoots -join ', ')"

$processesToKill = @()
$nodeAndPnpm = Get-CimInstance Win32_Process -Filter "Name = 'node.exe' OR Name = 'pnpm.exe'"

foreach ($proc in $nodeAndPnpm) {
    $procId = $proc.ProcessId
    if ($allowedRoots -contains $procId) { continue }
    
    # Check if any ancestor is in allowedRoots
    $ancestors = Get-Ancestors $procId
    $isAllowed = $false
    foreach ($a in $ancestors) {
        if ($allowedRoots -contains $a) {
            $isAllowed = $true
            break
        }
    }
    
    if (-not $isAllowed) {
        $processesToKill += $proc
    }
}

if ($processesToKill.Count -eq 0) {
    Write-Host "No hanging node/pnpm processes found."
} else {
    foreach ($proc in $processesToKill) {
        Write-Host "Killing process: $($proc.ProcessId) - $($proc.CommandLine)"
        Stop-Process -Id $proc.ProcessId -Force -ErrorAction SilentlyContinue
    }
}
