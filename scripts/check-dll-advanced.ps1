# Advanced DLL Diagnostic Script for Windows
# Checks DLL architecture and exports

$dllPath = "$PSScriptRoot\..\libs\zkfinger\zkemkeeper.dll"

Write-Host "=== Advanced DLL Diagnostic ===" -ForegroundColor Cyan
Write-Host ""

# Check if DLL exists
if (-not (Test-Path $dllPath)) {
    Write-Host "ERROR: DLL not found at: $dllPath" -ForegroundColor Red
    exit 1
}

Write-Host "DLL Path: $dllPath" -ForegroundColor Yellow
Write-Host ""

# Method 1: Try to use dumpbin (if Visual Studio is installed)
$dumpbinPath = $null
$possiblePaths = @(
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\Community\VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\Professional\VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2022\Enterprise\VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Community\VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Professional\VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2019\Enterprise\VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe",
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\2017\Community\VC\Tools\MSVC\*\bin\Hostx64\x64\dumpbin.exe",
    "C:\Program Files (x86)\Microsoft Visual Studio\*\VC\bin\dumpbin.exe"
)

foreach ($pattern in $possiblePaths) {
    $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $dumpbinPath = $found.FullName
        break
    }
}

if ($dumpbinPath) {
    Write-Host "Found dumpbin at: $dumpbinPath" -ForegroundColor Green
    Write-Host ""
    
    # Check architecture
    Write-Host "=== Checking DLL Architecture ===" -ForegroundColor Cyan
    $archOutput = & $dumpbinPath /headers $dllPath 2>&1 | Select-String "machine"
    if ($archOutput) {
        Write-Host $archOutput -ForegroundColor Yellow
        if ($archOutput -match "8664 machine") {
            Write-Host "[OK] DLL is 64-bit (x64)" -ForegroundColor Green
        } elseif ($archOutput -match "14C machine") {
            Write-Host "[ERROR] DLL is 32-bit (x86) - This is the problem!" -ForegroundColor Red
            Write-Host "  Your Node.js is 64-bit, but DLL is 32-bit." -ForegroundColor Red
            Write-Host "  Solution: Get a 64-bit version of zkemkeeper.dll" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Could not determine architecture from dumpbin output" -ForegroundColor Yellow
    }
    Write-Host ""
    
    # Check exports
    Write-Host "=== Checking DLL Exports ===" -ForegroundColor Cyan
    Write-Host "Searching for 'Connect' functions..." -ForegroundColor Yellow
    $exports = & $dumpbinPath /exports $dllPath 2>&1
    $connectFunctions = $exports | Select-String -Pattern "Connect" -CaseSensitive
    if ($connectFunctions) {
        Write-Host "Found Connect-related functions:" -ForegroundColor Green
        $connectFunctions | ForEach-Object {         Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "[ERROR] No 'Connect' functions found in exports!" -ForegroundColor Red
        Write-Host ""
        Write-Host "All exported functions:" -ForegroundColor Yellow
        $allExports = $exports | Select-String -Pattern "^\s+\d+\s+[0-9A-F]+\s+[0-9A-F]+\s+(\w+)" | Select-Object -First 20
        $allExports | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        if ($exports | Select-String -Pattern "^\s+\d+\s+[0-9A-F]+\s+[0-9A-F]+\s+(\w+)" | Measure-Object | Select-Object -ExpandProperty Count) {
            Write-Host "  ... (showing first 20)" -ForegroundColor Gray
        }
    }
    Write-Host ""
} else {
    Write-Host "dumpbin not found. Install Visual Studio Build Tools to use this feature." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use online tools or 'Dependencies' (formerly Dependency Walker)" -ForegroundColor Yellow
    Write-Host "Download: https://github.com/lucasg/Dependencies" -ForegroundColor Cyan
    Write-Host ""
}

# Method 2: Try to read DLL as binary to check PE header
Write-Host "=== Checking DLL PE Header (Basic) ===" -ForegroundColor Cyan
try {
    $bytes = [System.IO.File]::ReadAllBytes($dllPath)
    if ($bytes.Length -gt 64) {
        # Check PE signature (starts at offset 0x3C)
        $peOffset = [BitConverter]::ToInt32($bytes, 0x3C)
        if ($peOffset -lt $bytes.Length - 2) {
            $peSignature = [System.Text.Encoding]::ASCII.GetString($bytes, $peOffset, 2)
            if ($peSignature -eq "PE") {
                Write-Host "[OK] Valid PE file" -ForegroundColor Green
                
                # Check machine type (offset peOffset + 4)
                $machineOffset = $peOffset + 4
                if ($machineOffset + 2 -lt $bytes.Length) {
                    $machineType = [BitConverter]::ToUInt16($bytes, $machineOffset)
                    if ($machineType -eq 0x8664) {
                        Write-Host "[OK] Architecture: 64-bit (x64) - Matches Node.js" -ForegroundColor Green
                    } elseif ($machineType -eq 0x14C) {
                        Write-Host "[ERROR] Architecture: 32-bit (x86) - DOES NOT MATCH Node.js (64-bit)" -ForegroundColor Red
                        Write-Host "  This is likely the cause of error 127!" -ForegroundColor Red
                        Write-Host "  Solution: Get a 64-bit version of zkemkeeper.dll" -ForegroundColor Yellow
                    } else {
                        Write-Host "? Architecture: Unknown (0x$($machineType.ToString('X4')))" -ForegroundColor Yellow
                    }
                }
            } else {
                Write-Host "[ERROR] Not a valid PE file" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "Could not read DLL file: $_" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "Node.js: 64-bit (x64)" -ForegroundColor Yellow
Write-Host "DLL: Check output above" -ForegroundColor Yellow
Write-Host ""
Write-Host "If DLL is 32-bit:" -ForegroundColor Yellow
Write-Host "  1. Get 64-bit version from SDK provider" -ForegroundColor White
Write-Host "  2. OR use 32-bit Node.js (not recommended)" -ForegroundColor White
Write-Host ""
Write-Host "If function names don't match:" -ForegroundColor Yellow
Write-Host "  1. Check SDK documentation for correct function names" -ForegroundColor White
Write-Host "  2. Update function names in zkfinger-sdk-wrapper.service.ts" -ForegroundColor White

