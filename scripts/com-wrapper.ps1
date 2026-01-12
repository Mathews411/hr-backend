# PowerShell COM Wrapper for zkemkeeper.dll
# This script provides COM access without requiring native Node.js modules

param(
    [Parameter(Mandatory=$true)]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$ProgID = "ZKEMKeeper.ZKEM",
    
    [Parameter(Mandatory=$false)]
    [string]$IP = "",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 4370,
    
    [Parameter(Mandatory=$false)]
    [int]$Handle = 0
)

try {
    # If ProgID is empty or default, try multiple common ones
    if ($ProgID -eq "ZKTeco.ZKEM" -or [string]::IsNullOrEmpty($ProgID)) {
        $progIDsToTry = @(
            "ZKTeco.ZKEM",
            "ZKTeco.ZKEM.1",
            "ZKTeco.ZKEMKeeper",
            "ZKEMKeeper.ZKEM",
            "ZKEMKeeper.ZKEM.1",
            "zkemkeeper.ZKEM"
        )
        
        $comObject = $null
        $workingProgID = $null
        
        foreach ($progId in $progIDsToTry) {
            try {
                $comObject = New-Object -ComObject $progId
                $workingProgID = $progId
                Write-Host "SUCCESS: Using ProgID: $progId" -ForegroundColor Green
                break
            } catch {
                # Try next ProgID
                continue
            }
        }
        
        if ($null -eq $comObject) {
            Write-Output "ERROR: Could not create COM object with any known ProgID"
            Write-Output "Tried: $($progIDsToTry -join ', ')"
            Write-Output "Please find the correct ProgID using: reg query HKCR /s /f zkemkeeper"
            exit 1
        }
        
        $ProgID = $workingProgID
    } else {
        # Use specified ProgID
        $comObject = New-Object -ComObject $ProgID
    }
    
    switch ($Action.ToLower()) {
        "connect" {
            if ([string]::IsNullOrEmpty($IP)) {
                Write-Output "ERROR: IP address required for connect"
                exit 1
            }
            
            # Ensure port is an integer
            $portInt = [int]$Port
            
            # Try different method names with proper error handling
            $result = $null
            $errorOccurred = $false
            $errorMessage = ""
            
            # Set error action to stop to catch AccessViolationException
            $ErrorActionPreference = "Stop"
            
            try {
                if ($comObject | Get-Member -Name "Connect_Net") {
                    # ZKTeco Connect_Net typically: Connect_Net(IP as String, Port as Long) -> Long
                    # AccessViolationException suggests threading or parameter marshalling issue
                    # Try multiple approaches with proper error handling
                    
                    $attempts = @(
                        # Attempt 1: Direct call with explicit Long
                        {
                            $comObject.Connect_Net([string]$IP, [long]$portInt)
                        },
                        # Attempt 2: Direct call with Int32
                        {
                            $comObject.Connect_Net([string]$IP, [int]$portInt)
                        },
                        # Attempt 3: Using InvokeMember with Long
                        {
                            $comObject.GetType().InvokeMember(
                                "Connect_Net",
                                [System.Reflection.BindingFlags]::InvokeMethod,
                                $null,
                                $comObject,
                                @([string]$IP, [long]$portInt)
                            )
                        },
                        # Attempt 4: Using InvokeMember with Int32
                        {
                            $comObject.GetType().InvokeMember(
                                "Connect_Net",
                                [System.Reflection.BindingFlags]::InvokeMethod,
                                $null,
                                $comObject,
                                @([string]$IP, [int]$portInt)
                            )
                        }
                    )
                    
                    $success = $false
                    $lastError = $null
                    
                    foreach ($attempt in $attempts) {
                        try {
                            $result = & $attempt
                            $success = $true
                            break
                        } catch [System.AccessViolationException] {
                            $lastError = "AccessViolationException: Method signature mismatch or threading issue"
                            continue
                        } catch {
                            $lastError = $_.Exception.Message
                            continue
                        }
                    }
                    
                    if (-not $success) {
                        Write-Output "ERROR: All Connect_Net invocation attempts failed"
                        Write-Output "ERROR_TYPE: AccessViolationException"
                        Write-Output "ERROR_NOTE: This usually means the COM method signature doesn't match, or there's a threading model issue"
                        Write-Output "ERROR_NOTE: ZKTeco SDK may require specific parameter types or calling conventions"
                        Write-Output "ERROR_LAST: $lastError"
                        Write-Output ""
                        Write-Output "SUGGESTION: Try using the official ZKTeco SDK documentation to verify the exact method signature"
                        Write-Output "SUGGESTION: Consider using a C# wrapper or the official SDK tools instead"
                        exit 1
                    }
                } elseif ($comObject | Get-Member -Name "ConnectNet") {
                    $result = $comObject.ConnectNet($IP, $portInt)
                } elseif ($comObject | Get-Member -Name "Connect") {
                    $result = $comObject.Connect($IP, $portInt)
                } else {
                    Write-Output "ERROR: Connect method not found"
                    Write-Output "Available methods: $($comObject | Get-Member -MemberType Method | Select-Object -ExpandProperty Name)"
                    exit 1
                }
            } catch [System.AccessViolationException] {
                $errorOccurred = $true
                $errorMessage = $_.Exception.Message
                $errorType = $_.Exception.GetType().FullName
                Write-Output "ERROR: AccessViolationException - COM method call failed"
                Write-Output "ERROR_TYPE: $errorType"
                Write-Output "ERROR_MESSAGE: $errorMessage"
                Write-Output "ERROR_NOTE: This exception indicates a method signature mismatch or threading model issue"
                Write-Output "ERROR_NOTE: The COM object may require different parameter types or calling conventions"
                Write-Output "ERROR_NOTE: Consider using the official ZKTeco SDK tools or a C# wrapper"
                exit 1
            } catch {
                $errorOccurred = $true
                $errorMessage = $_.Exception.Message
                $errorType = $_.Exception.GetType().FullName
                Write-Output "ERROR: $errorMessage"
                Write-Output "ERROR_TYPE: $errorType"
                if ($_.Exception.InnerException) {
                    Write-Output "ERROR_INNER: $($_.Exception.InnerException.Message)"
                }
                exit 1
            }
            
            if (-not $errorOccurred) {
                # Handle different return types
                if ($result -is [bool]) {
                    # If boolean, convert: True = 1 (success), False = -1 (failure)
                    # Note: ZKTeco SDK typically returns Long, but some versions return Boolean
                    if ($result) {
                        Write-Output "RESULT:1"
                    } else {
                        Write-Output "RESULT:-1"
                        # Don't exit with error - let the caller handle the -1 return code
                    }
                } elseif ($result -is [int] -or $result -is [long]) {
                    Write-Output "RESULT:$result"
                } else {
                    # Try to convert to number
                    try {
                        $numResult = [int]$result
                        Write-Output "RESULT:$numResult"
                    } catch {
                        Write-Output "ERROR: Could not convert result to number: $result"
                        exit 1
                    }
                }
            }
        }
        
        "disconnect" {
            if ($Handle -eq 0) {
                Write-Output "ERROR: Handle required for disconnect"
                exit 1
            }
            
            if ($comObject | Get-Member -Name "Disconnect") {
                $result = $comObject.Disconnect($Handle)
                Write-Output "RESULT:$result"
            } else {
                Write-Output "ERROR: Disconnect method not found"
                exit 1
            }
        }
        
        "listmethods" {
            $methods = $comObject | Get-Member -MemberType Method | Select-Object -ExpandProperty Name
            Write-Output "METHODS:$($methods -join ',')"
        }
        
        "test" {
            # Test if COM object can be created
            Write-Output "SUCCESS: COM object created with ProgID: $ProgID"
            $methods = $comObject | Get-Member -MemberType Method | Select-Object -ExpandProperty Name
            Write-Output "Available methods: $($methods -join ', ')"
        }
        
        default {
            Write-Output "ERROR: Unknown action: $Action"
            Write-Output "Valid actions: connect, disconnect, listmethods, test"
            exit 1
        }
    }
} catch {
    Write-Output "ERROR: $($_.Exception.Message)"
    exit 1
}

