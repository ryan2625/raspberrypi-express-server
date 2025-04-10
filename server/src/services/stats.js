import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * Get system stats including CPU temperature, memory usage, and uptime
 */
export async function getSystemStats(req, res) {
  try {
    // Get CPU temperature - use different command for Raspberry Pi
    let cpuTemp, cpuTempF;
    try {
      const { stdout: tempOutput } = await execAsync("cat /sys/class/thermal/thermal_zone0/temp")
      cpuTemp = (parseInt(tempOutput.trim()) / 1000).toFixed(1)
      cpuTempF = (cpuTemp * 9 / 5 + 32).toFixed(1)
    } catch (error) {
      cpuTemp = "Unknown"
      cpuTempF = "Unknown"
    }

    //Get total disk space
    let { stdout: diskSpace } = await execAsync("df")
    console.log(diskSpace)
    let diskArray = diskSpace.trim().split(/\s+/)
    diskArray.splice(5, 1)
    let headers = (diskSpace.trim().split(/\n/))[0].split(/\s+/)
    headers.pop()
    let fileSystem = {}
    headers.forEach((header) => {
      let headerIndex = headers.indexOf(header)
      let modulo = headers.length
      fileSystem[header] = []
      for (let i = headerIndex + modulo; i < diskArray.length; i += modulo) {
        fileSystem[header].push(diskArray[i])
      }
    })
    console.log(fileSystem)
    // Get memory usage
    const { stdout: memOutput } = await execAsync("free -m | awk 'NR==2{printf \"%.1f/%.1f\", $3, $2}'")

    // Get system uptime
    const { stdout: uptimeOutput } = await execAsync("uptime -p")

    // Get disk usage
    const { stdout: diskOutput } = await execAsync("df -h / | awk 'NR==2{print $5}'")

    // Get CPU load
    const { stdout: loadOutput } = await execAsync("top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'")
    const cpuLoad = parseFloat(loadOutput).toFixed(1)

    // Get network stats - check both wlan0 and eth0
    let networkOutput;
    try {
      const { stdout: wlan } = await execAsync("cat /proc/net/dev | grep 'wlan0'")
      networkOutput = wlan;
    } catch (err) {
      try {
        const { stdout: eth } = await execAsync("cat /proc/net/dev | grep 'eth0'")
        networkOutput = eth;
      } catch (error) {
        networkOutput = "";
      }
    }

    // Process network stats
    let received = "0.00";
    let transmitted = "0.00";
    if (networkOutput) {
      const networkStats = networkOutput.trim().split(/\s+/)
      received = (parseInt(networkStats[1]) / (1024 * 1024)).toFixed(2) // MB
      transmitted = (parseInt(networkStats[9]) / (1024 * 1024)).toFixed(2) // MB
    }

    res.json({
      temperature: {
        celsius: typeof cpuTemp === "string" ? cpuTemp : `${cpuTemp}°C`,
        fahrenheit: typeof cpuTempF === "string" ? cpuTempF : `${cpuTempF}°F`
      },
      memory: memOutput.trim() + ' MB',
      uptime: uptimeOutput.trim(),
      disk: diskOutput.trim(),
      cpuLoad: `${cpuLoad}%`,
      network: {
        received: `${received} MB`,
        transmitted: `${transmitted} MB`
      },
      diskSpace: fileSystem,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching system stats:', error)
    res.status(500).json({ error: 'Failed to retrieve system stats', message: error.message })
  }
}


/**
 * needing special libraries.RetryRFWhat other cool stats can I get besides the ones I haveEditYou can add several more interesting system stats to monitor your Raspberry Pi project beyond what you already have. Here are some valuable additions:
1. CPU Frequency
javascriptCopyconst { stdout: cpuFreq } = await execAsync("vcgencmd measure_clock arm")
const frequency = parseInt(cpuFreq.split('=')[1]) / 1000000 // Convert to MHz
2. GPU Temperature
javascriptCopyconst { stdout: gpuTemp } = await execAsync("vcgencmd measure_temp")
const gpuTemperature = gpuTemp.replace('temp=', '').replace('\'C', '')
3. Voltage Levels
javascriptCopyconst { stdout: voltage } = await execAsync("vcgencmd measure_volts core")
const coreVoltage = voltage.replace('volt=', '').replace('V', '')
4. Throttling Status
javascriptCopyconst { stdout: throttled } = await execAsync("vcgencmd get_throttled")
const throttleStatus = parseInt(throttled.split('=')[1], 16)
const isThrottled = {
  underVoltage: !!(throttleStatus & 0x1),
  frequencyCapped: !!(throttleStatus & 0x2),
  throttling: !!(throttleStatus & 0x4),
  softTempLimit: !!(throttleStatus & 0x8)
}
5. Running Processes Count
javascriptCopyconst { stdout: processCount } = await execAsync("ps -e | wc -l")
6. System Load Average (1, 5, 15 minutes)
javascriptCopyconst { stdout: loadavg } = await execAsync("cat /proc/loadavg")
const loadAverages = loadavg.split(' ').slice(0, 3)
7. Network Connection Count
javascriptCopyconst { stdout: connections } = await execAsync("netstat -ant | wc -l")
8. USB Device Information
javascriptCopyconst { stdout: usbDevices } = await execAsync("lsusb")
9. Last System Boot Time
javascriptCopyconst { stdout: bootTime } = await execAsync("uptime -s")
10. RAM Speed/Configuration
javascriptCopyconst { stdout: ramInfo } = await execAsync("sudo vcgencmd get_config int | grep -E 'arm_freq|core_freq|sdram'")
These additional stats would give you a more comprehensive view of your Raspberry Pi's performance and could be valuable for monitoring your IoT cat livestreaming project, especially if it runs for extended periods.RetryClaude can make mistakes. Please double-check responses.
 */