import { exec } from 'child_process'
import { promisify } from 'util'
import { configDotenv } from 'dotenv'

configDotenv()

const execAsync = promisify(exec)
const express = process.env.EXPRESS_PORT

async function killProcess() {
  try {
    await execAsync(`npx kill-port ${express}`)
  } catch (e) {
    console.log(`No process found on port ${express}`)
  }
  console.log(`Spinning up EXPRESS server @ ${express}`)
  await execAsync('sudo npm run start')
}
killProcess()