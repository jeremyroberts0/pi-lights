const restify = require('restify')
const log = require('./log')
const server = restify.createServer()

const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase()
log.setLevel(logLevel)

const port = 8080
const basePath = '/pi-lights'

server.get(`/${basePath}/info`, require('./controllers/info'))

server.listen(port, () => {
    log.info(`Server listening on port ${port}`)
})