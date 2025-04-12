// ecosystem.config.cjs
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  apps: [{
    name: "Express_Server",
    script: "npm",
    args: 'run start',
    cwd: "./",
  },
  {
    name: "FastAPI_Server",
    cwd: "./livestream",
    script: './activation.sh',
  }]
};
//pm2 logs https://pm2.keymetrics.io/docs/usage/quick-start/
//sudo pm2 start ecosystem.config.cjs
// d ~/.pm2/logs
//sudo pm2 flush