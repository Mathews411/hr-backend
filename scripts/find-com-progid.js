/**
 * Find the correct COM ProgID for zkemkeeper.dll
 */

const { execSync } = require('child_process')

console.log('=== Finding COM ProgID for zkemkeeper.dll ===\n')

try {
  // Query registry for COM components related to zkemkeeper
  console.log('Searching Windows Registry for zkemkeeper COM components...\n')
  
  // Search in HKEY_CLASSES_ROOT for ProgIDs
  const commands = [
    'reg query "HKCR" /s /f "zkemkeeper" /t REG_SZ 2>nul',
    'reg query "HKCR" /s /f "ZKEM" /t REG_SZ 2>nul',
    'reg query "HKCR" /s /f "ZKTeco" /t REG_SZ 2>nul',
  ]
  
  const foundProgIDs = new Set()
  
  for (const cmd of commands) {
    try {
      const output = execSync(cmd, { encoding: 'utf8', shell: 'cmd.exe' })
      const lines = output.split('\n')
      
      for (const line of lines) {
        // Look for lines that might contain ProgIDs
        if (line.includes('zkemkeeper') || line.includes('ZKEM') || line.includes('ZKTeco')) {
          // Extract potential ProgID (usually in HKCR\ProgID format)
          const match = line.match(/HKCR\\([^\\]+)/i)
          if (match && match[1]) {
            const progID = match[1].trim()
            if (progID && !progID.startsWith('.')) {
              foundProgIDs.add(progID)
            }
          }
        }
      }
    } catch (error) {
      // Command might fail, continue
    }
  }
  
  if (foundProgIDs.size > 0) {
    console.log('Found potential COM ProgIDs:')
    console.log('')
    for (const progID of foundProgIDs) {
      console.log(`  - ${progID}`)
    }
    console.log('')
    console.log('Try these in order in your code:')
    console.log('')
    foundProgIDs.forEach((progID, index) => {
      console.log(`  ${index + 1}. ${progID}`)
    })
  } else {
    console.log('Could not find ProgIDs in registry.')
    console.log('')
    console.log('Common ZKTeco ProgIDs to try:')
    console.log('  - ZKTeco.ZKEM')
    console.log('  - ZKTeco.ZKEM.1')
    console.log('  - ZKTeco.ZKEMKeeper')
    console.log('  - ZKEMKeeper.ZKEM')
    console.log('  - ZKEMKeeper.ZKEM.1')
  }
  
  console.log('')
  console.log('To test a ProgID, use:')
  console.log('  const winax = require("winax")')
  console.log('  const obj = new winax.Object("ProgID_HERE")')
  console.log('  console.log(Object.getOwnPropertyNames(obj))')
  
} catch (error) {
  console.error('Error:', error.message)
  console.log('')
  console.log('Manual method:')
  console.log('1. Open Registry Editor (regedit)')
  console.log('2. Navigate to: HKEY_CLASSES_ROOT')
  console.log('3. Search for "zkemkeeper" or "ZKEM"')
  console.log('4. Look for entries that have a CLSID subkey')
}

