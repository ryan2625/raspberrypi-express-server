export default async (port) => {
  const getPID = await execAsync(`sudo lsof -i :${port}`)
  const processMatch = /(COMMAND|PID|USER|FD|TYPE|DEVICE|SIZE\/OFF|NODE|NAME)[\s\n\\n]+[a-zA-Z]*[\s]+([0-9]\d{1,9})/i
  const processIdReg = processMatch.exec(JSON.stringify(getPID.stdout))
  const processId = processIdReg ? processIdReg[2] : 0
  return processId
}