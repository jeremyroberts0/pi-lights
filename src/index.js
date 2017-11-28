const restify = require('restify')
const log = require('./log')
const config = require('./config')

const infoController = require('./controllers/info')
const ledController = require('./controllers/leds')

const server = restify.createServer()
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase()

log.setLevel(logLevel)

const port = config.PORT
const basePath = config.BASE_PATH
const ledBasePath = config.LED_BASE_PATH
// Middleware
server.use(restify.plugins.jsonBodyParser())

// Info Route
server.get(`${basePath}/info`, infoController)

// LED Strip Manipulation Routes
server.post(`${ledBasePath}/solid`, ledController.setSolidColor)
server.post(`${ledBasePath}/pattern`, ledController.setPattern)
server.post(`${ledBasePath}/reset`, ledController.reset)
server.post(`${ledBasePath}/rainbow`, ledController.rainbow)

server.listen(port, () => {
    log.info(`Server listening on port ${port}`)
})
