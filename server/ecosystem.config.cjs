module.exports = {
  apps: [{
    name: "Express_Server",
    script: "./startExpress.js"
  },
  {
    name: "FastAPI_Server",
    script: "./startFastAPI.js"
  }]
}
//pm2 logs https://pm2.keymetrics.io/docs/usage/quick-start/
//sudo pm2 start ecosystem.config.cjs