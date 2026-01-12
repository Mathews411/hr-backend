/**
 * Check all DLLs in the zkfinger folder for exported functions
 */

const fs = require('fs')
const path = require('path')
const ffi = require('ffi-napi')

const dllDir = path.resolve(__dirname, '..', 'libs', 'zkfinger')

console.log('=== Checking All DLLs for Functions ===\n')
console.log(`Directory: ${dllDir}\n`)

// Get all DLL files
const dllFiles = fs.readdirSync(dllDir).filter(f => f.toLowerCase().endsWith('.dll'))

console.log(`Found ${dllFiles.length} DLL files:\n`)

// Add DLL directory to PATH
const originalPath = process.env.PATH || ''
if (!originalPath.includes(dllDir)) {
  process.env.PATH = `${dllDir};${originalPath}`
}

// Function names to test
const testFunctions = [
  'Connect_Net',
  'ConnectNet', 
  'Connect',
  'SetUserInfo',
  'GetUserInfo',
  'DeleteUser',
  'EnrollFinger',
  'GetFingerprintTemplate',
  'GetAttLog',
  'GetAttLogCount',
  'Disconnect',
]

// Test each DLL
for (const dllFile of dllFiles) {
  const dllPath = path.join(dllDir, dllFile)
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Testing: ${dllFile}`)
  console.log('='.repeat(60))
  
  const foundFunctions = []
  
  for (const funcName of testFunctions) {
    try {
      // Try standard signature
      const lib = ffi.Library(dllPath, {
        [funcName]: ['int', ['string', 'int']]
      })
      
      // If we get here, function exists!
      foundFunctions.push(funcName)
      console.log(`  ✓ Found: ${funcName}`)
    } catch (error) {
      // Function not found or different error
      // Don't log - too verbose
    }
  }
  
  if (foundFunctions.length === 0) {
    console.log('  ✗ No matching functions found')
  } else {
    console.log(`\n  Found ${foundFunctions.length} function(s) in ${dllFile}`)
  }
}

console.log('\n' + '='.repeat(60))
console.log('Summary: Check which DLL contains the functions you need')
console.log('='.repeat(60))

