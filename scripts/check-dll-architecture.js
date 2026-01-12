/**
 * DLL Architecture Checker
 * Reads PE header to determine if DLL is 32-bit or 64-bit
 */

const fs = require('fs')
const path = require('path')

const dllPath = path.resolve(__dirname, '..', 'libs', 'zkfinger', 'zkemkeeper.dll')

console.log('=== DLL Architecture Check ===\n')
console.log(`DLL Path: ${dllPath}\n`)

if (!fs.existsSync(dllPath)) {
  console.error('ERROR: DLL not found!')
  process.exit(1)
}

try {
  const buffer = fs.readFileSync(dllPath)
  
  // Check DOS header signature (MZ)
  if (buffer[0] !== 0x4D || buffer[1] !== 0x5A) {
    console.error('ERROR: Not a valid PE file (missing MZ signature)')
    process.exit(1)
  }
  
  // Get PE header offset (at offset 0x3C)
  const peOffset = buffer.readUInt32LE(0x3C)
  
  // Check PE signature (PE\0\0)
  if (buffer[peOffset] !== 0x50 || buffer[peOffset + 1] !== 0x45 || 
      buffer[peOffset + 2] !== 0x00 || buffer[peOffset + 3] !== 0x00) {
    console.error('ERROR: Not a valid PE file (missing PE signature)')
    process.exit(1)
  }
  
  console.log('[OK] Valid PE file\n')
  
  // Machine type is at peOffset + 4 (offset 0x04 in PE header)
  const machineTypeOffset = peOffset + 4
  const machineType = buffer.readUInt16LE(machineTypeOffset)
  
  console.log('Architecture Information:')
  console.log(`  Machine Type: 0x${machineType.toString(16).toUpperCase().padStart(4, '0')}`)
  
  let dllArch = 'Unknown'
  let matchesNode = false
  
  if (machineType === 0x8664) {
    dllArch = '64-bit (x64)'
    matchesNode = process.arch === 'x64'
    console.log(`  Architecture: ${dllArch}`)
    if (matchesNode) {
      console.log('  [OK] Matches Node.js architecture (x64)')
    } else {
      console.log('  [WARNING] Node.js is not x64')
    }
  } else if (machineType === 0x14C) {
    dllArch = '32-bit (x86)'
    matchesNode = process.arch === 'ia32' || process.arch === 'x32'
    console.log(`  Architecture: ${dllArch}`)
    console.log('  [ERROR] DLL is 32-bit, but Node.js is 64-bit!')
    console.log('  This is the cause of Win32 error 127!')
  } else if (machineType === 0x200) {
    dllArch = '64-bit (IA64 - Itanium)'
    console.log(`  Architecture: ${dllArch}`)
  } else {
    console.log(`  Architecture: Unknown (0x${machineType.toString(16).toUpperCase()})`)
  }
  
  console.log('')
  console.log('Node.js Information:')
  console.log(`  Architecture: ${process.arch}`)
  console.log(`  Version: ${process.version}`)
  console.log('')
  
  if (machineType === 0x14C && process.arch === 'x64') {
    console.log('=== SOLUTION ===')
    console.log('The DLL is 32-bit but Node.js is 64-bit.')
    console.log('You need to:')
    console.log('  1. Get a 64-bit version of zkemkeeper.dll from the SDK provider')
    console.log('  2. OR use a 32-bit version of Node.js (not recommended)')
    console.log('')
    console.log('To get 64-bit DLL:')
    console.log('  - Contact your fingerprint device manufacturer')
    console.log('  - Check if they have a 64-bit SDK version')
    console.log('  - Look for SDK downloads labeled "x64" or "64-bit"')
    process.exit(1)
  } else if (machineType === 0x8664 && process.arch === 'x64') {
    console.log('=== ARCHITECTURE MATCH ===')
    console.log('DLL and Node.js are both 64-bit.')
    console.log('The error 127 is likely due to:')
    console.log('  1. Function name mismatch')
    console.log('  2. Missing function exports')
    console.log('  3. Wrong DLL version')
    console.log('')
    console.log('Next steps:')
    console.log('  - Check DLL exports with: dumpbin /exports zkemkeeper.dll')
    console.log('  - Verify function names match SDK documentation')
  } else {
    console.log('Architecture check complete.')
  }
  
} catch (error) {
  console.error('ERROR reading DLL:', error.message)
  process.exit(1)
}

