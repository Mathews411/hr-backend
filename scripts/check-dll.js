/**
 * DLL Diagnostic Script
 * 
 * This script helps diagnose DLL loading issues by checking:
 * - DLL file existence
 * - Node.js architecture
 * - Basic DLL loading test
 * 
 * Run with: node scripts/check-dll.js
 */

const path = require('path')
const fs = require('fs')

const dllPath = path.resolve(__dirname, '..', 'libs', 'zkfinger', 'zkemkeeper.dll')
const dllDir = path.dirname(dllPath)

console.log('=== DLL Diagnostic Check ===\n')

// Check Node.js info
console.log('Node.js Information:')
console.log(`  Version: ${process.version}`)
console.log(`  Architecture: ${process.arch}`)
console.log(`  Platform: ${process.platform}`)
console.log(`  Executable: ${process.execPath}`)
console.log()

// Check DLL existence
console.log('DLL File Check:')
console.log(`  Expected path: ${dllPath}`)
console.log(`  DLL directory: ${dllDir}`)

if (fs.existsSync(dllPath)) {
  const stats = fs.statSync(dllPath)
  console.log(`  ✓ DLL file exists`)
  console.log(`  File size: ${(stats.size / 1024).toFixed(2)} KB`)
  console.log(`  Modified: ${stats.mtime}`)
} else {
  console.log(`  ✗ DLL file NOT FOUND`)
  console.log(`  Please ensure zkemkeeper.dll is in: ${dllDir}`)
  process.exit(1)
}
console.log()

// Check dependency DLLs
console.log('Dependency DLLs Check:')
const requiredDlls = [
  'zkemkeeper.dll',
  'zkemsdk.dll',
  'commpro.dll',
  'comms.dll',
  'tcpcomm.dll',
  'usbcomm.dll',
  'rscomm.dll',
  'rscagent.dll',
]

let allDllsFound = true
for (const dll of requiredDlls) {
  const dllFullPath = path.join(dllDir, dll)
  if (fs.existsSync(dllFullPath)) {
    console.log(`  ✓ ${dll}`)
  } else {
    console.log(`  ✗ ${dll} - MISSING`)
    allDllsFound = false
  }
}
console.log()

if (!allDllsFound) {
  console.log('⚠ Warning: Some dependency DLLs are missing')
  console.log('  This may cause loading issues.')
  console.log()
}

// Try loading DLL
console.log('DLL Loading Test:')
try {
  const ffi = require('ffi-napi')
  
  // Add DLL directory to PATH
  const originalPath = process.env.PATH || ''
  if (!originalPath.includes(dllDir)) {
    process.env.PATH = `${dllDir};${originalPath}`
    console.log(`  Added DLL directory to PATH`)
  }
  
  console.log(`  Attempting to load DLL...`)
  
  // Try loading with just one function
  const testLib = ffi.Library(dllPath, {
    'Connect_Net': ['int', ['string', 'int']],
  })
  
  console.log(`  ✓ DLL loaded successfully`)
  console.log(`  ✓ Connect_Net function found`)
  console.log()
  console.log('✓ All checks passed! DLL should work with your application.')
  
} catch (error) {
  console.log(`  ✗ DLL loading failed`)
  console.log(`  Error: ${error.message}`)
  console.log()
  
  if (error.message.includes('127') || error.message.includes('Win32 error 127')) {
    console.log('=== ERROR 127 DIAGNOSIS ===')
    console.log('Win32 Error 127 means: "The specified procedure could not be found"')
    console.log()
    console.log('Possible causes:')
    console.log('1. Architecture mismatch:')
    console.log(`   - Your Node.js is: ${process.arch}`)
    console.log(`   - DLL might be: ${process.arch === 'x64' ? '32-bit (x86)' : '64-bit (x64)'}`)
    console.log('   - Solution: Use DLL that matches Node.js architecture')
    console.log()
    console.log('2. Function name mismatch:')
    console.log('   - The function "Connect_Net" might not exist in this DLL')
    console.log('   - Solution: Check DLL exports with: dumpbin /exports zkemkeeper.dll')
    console.log()
    console.log('3. Wrong DLL version:')
    console.log('   - This might be the wrong version of zkemkeeper.dll')
    console.log('   - Solution: Get the correct SDK version for your device')
    console.log()
    console.log('How to check DLL architecture:')
    console.log('  Open PowerShell and run:')
    console.log(`  dumpbin /headers "${dllPath}" | findstr machine`)
    console.log('  Or use a tool like "Dependencies" (formerly Dependency Walker)')
    console.log()
  } else if (error.message.includes('126') || error.message.includes('Win32 error 126')) {
    console.log('=== ERROR 126 DIAGNOSIS ===')
    console.log('Win32 Error 126 means: "The specified module could not be found"')
    console.log()
    console.log('This usually means a dependency DLL is missing.')
    console.log('Solutions:')
    console.log('1. Install Visual C++ Redistributable:')
    console.log('   - x64: https://aka.ms/vs/17/release/vc_redist.x64.exe')
    console.log('   - x86: https://aka.ms/vs/17/release/vc_redist.x86.exe')
    console.log()
    console.log('2. Ensure all DLL files are in the same directory:')
    console.log(`   ${dllDir}`)
    console.log()
  }
  
  console.log()
  console.log('For more help, check the error message in your application logs.')
  process.exit(1)
}

