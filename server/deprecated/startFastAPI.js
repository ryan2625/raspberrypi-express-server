import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import { configDotenv } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

configDotenv()

const execAsync = promisify(exec)
const fastApi = process.env.FAST_API_PORT
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function killProcess() {
  try {
    await execAsync(`npx kill-port ${fastApi}`)
  } catch (e) {
    console.log(`No process found on port ${fastApi}`)
  }
  console.log(`Spinning up FASTAPI server @ ${fastApi} in ${__dirname}`)
  const process = spawn('bash', [
    '-cx',
    `cd livestream && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port ${fastApi} --reload`
  ], {
    stdio: 'ignore'
  });
}

killProcess()
