/**
 * Test different function names and calling conventions for zkemkeeper.dll
 */

const path = require('path')
const ffi = require('ffi-napi')

const dllPath = path.resolve(__dirname, '..', 'libs', 'zkfinger', 'zkemkeeper.dll')
const dllDir = path.dirname(dllPath)

// Add DLL directory to PATH
const originalPath = process.env.PATH || ''
if (!originalPath.includes(dllDir)) {
  process.env.PATH = `${dllDir};${originalPath}`
}

console.log('=== Testing DLL Function Names ===\n')
console.log(`DLL: ${dllPath}\n`)

// Common function name variations for ZKTeco/Identix SDKs
const functionNameVariations = [
  'Connect_Net',
  'ConnectNet',
  'connect_net',
  'ConnectNet2',
  'Connect',
  'ConnectTCP',
  'ConnectTcp',
  'Connect_IP',
  'ConnectIP',
]

// Function signature variations
const signatures = [
  ['int', ['string', 'int']],           // Standard: (IP, port)
  ['int', ['char*', 'int']],             // Alternative: char pointer
  ['long', ['string', 'int']],           // Long return type
  ['int', ['int', 'string', 'int']],     // Alternative parameter order
]

let foundFunction = null
let foundSignature = null

console.log('Testing function names...\n')

for (const funcName of functionNameVariations) {
  for (const sig of signatures) {
    try {
      console.log(`Trying: ${funcName} with signature ${JSON.stringify(sig)}...`)
      const lib = ffi.Library(dllPath, {
        [funcName]: sig
      })
      
      // If we get here, the function was found!
      console.log(`✓ SUCCESS! Found function: ${funcName}`)
      console.log(`  Signature: ${JSON.stringify(sig)}`)
      foundFunction = funcName
      foundSignature = sig
      break
    } catch (error) {
      const errorMsg = error.message || String(error)
      if (errorMsg.includes('127')) {
        // Function not found, try next
        console.log(`  ✗ Not found (error 127)`)
      } else {
        // Different error - might be signature issue, but function exists
        console.log(`  ? Different error: ${errorMsg.substring(0, 50)}...`)
        // This might still be the right function, just wrong signature
      }
    }
  }
  
  if (foundFunction) break
}

console.log('\n=== Result ===\n')

if (foundFunction) {
  console.log(`✓ Function found: ${foundFunction}`)
  console.log(`  Use this in your code:`)
  console.log(`  '${foundFunction}': ${JSON.stringify(foundSignature)}`)
  console.log('\nUpdate zkfinger-sdk-wrapper.service.ts with this function name.')
} else {
  console.log('✗ Could not find Connect function with any known name.')
  console.log('\nPossible issues:')
  console.log('1. Function name is completely different')
  console.log('2. DLL uses a different calling convention')
  console.log('3. DLL requires initialization before use')
  console.log('\nNext steps:')
  console.log('1. Check SDK documentation for correct function names')
  console.log('2. Use dumpbin to list all exports:')
  console.log(`   dumpbin /exports "${dllPath}"`)
  console.log('3. Contact SDK provider for function names')
}

