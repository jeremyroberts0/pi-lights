const restify = require('restify')
const log = require('./log')
const config = require('./config')

const infoController = require('./controllers/info')
const ledController = require('./controllers/leds')

const leds = require('./leds')

// Set to yellow while starting up
leds.setSolidColor([255, 255, 0])

const server = restify.createServer()
const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase()

log.setLevel(logLevel)

const port = config.PORT
const basePath = config.BASE_PATH
const ledBasePath = config.LED_BASE_PATH

// Middleware
server.use(restify.plugins.jsonBodyParser())
server.pre((req, res, next) => {
    log.info(`Incoming Request: ${req.method} - ${req.url}`)
    next()
})

// Info Route
server.get(`${basePath}/info`, infoController)

// LED Strip Manipulation Routes
server.post(`${ledBasePath}/solid`, ledController.setSolidColor)
server.post(`${ledBasePath}/pattern`, ledController.setPattern)
server.post(`${ledBasePath}/reset`, ledController.reset)
server.post(`${ledBasePath}/rainbow`, ledController.rainbow)
server.post(`${ledBasePath}/xmas`, ledController.xmas)
server.post(`${ledBasePath}/fade`, ledController.fade)

server.listen(port, () => {
    log.info(`Server listening on port ${port}`)

    // Fade green to white once started
    leds.setSolidColor([255, 255, 255])
})
