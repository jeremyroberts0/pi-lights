const simpleLogger = require('simple-node-logger')

if (!global.piLightsLogger) {
    global.piLightsLogger = simpleLogger.createSimpleLogger()
}

module.exports = global.piLightsLogger
