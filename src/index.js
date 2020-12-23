

const restify = require('restify')

const patterns = require('./patterns');
const leds = require('./leds');

// Start MDNS listener for convenient contact over local network
require('./mdns')();

// Start updater for auto updating of app
require('./updater')(3000)

const PORT = 8080;
const LED_MAX_COUNT = 300;
const startTime = new Date().toLocaleString();

leds.init(LED_MAX_COUNT);

const server = restify.createServer()

// App State
let lastPattern;
let lastBrightness;
let currentSize = LED_MAX_COUNT

// Brightness Control
function setBrightness(level) {
    lastBrightness = level;
    leds.setBrightness(level);
}

// Pattern Control
function setPattern(pattern) {
    lastPattern = pattern;
    if (!patterns[pattern]) console.error(`missing pattern func for ${pattern}`);
    if (pattern !== patterns[pattern].name) {
        console.error(`pattern key ${pattern} and pattern func name ${patterns[pattern].name} don't match`)
    }
    leds.setPattern(currentSize, patterns[pattern]);
}
setBrightness(25);
setPattern('loading')

server.pre((req, res, next) => {
    console.info(`Incoming Request: ${req.method} - ${req.url}`)
    next()
})

server.get('/info', (req, res) => {
    res.send({
        status: 'healthy',
        available_patterns: Object.keys(patterns),
        pattern: lastPattern,
        brightness: lastBrightness,
        started_at: startTime,
    })
})

server.post('/size/:size', (req, res) => {
    const newSize = parseInt(req.params.size, 10);
    if (isNaN(newSize) || Math.floor(newSize) !== newSize) {
        return res.send(400, {
            error: 'size param should be an integer',
        })
    }
    currentSize = newSize
    return res.send(204)
})

server.post('/pattern/:pattern', (req, res) => {
    const newPattern = req.params.pattern;
    if (!patterns[newPattern]) {
        return res.send(400, {
            error: `unknown pattern ${newPattern}`,
        })
    }
    if (lastBrightness === 0) setBrightness(100);
    setPattern(newPattern);
    return res.send(204);
});

server.post('/brightness/:level', (req, res) => {
    const newBrightness = parseInt(req.params.level, 10);
    if (
        isNaN(newBrightness)
      || newBrightness < 0
      || newBrightness > 100
      || Math.floor(newBrightness) !== newBrightness
    ) {
        return res.send(400, {
            error: 'brightness level should be int between 0 and 100',
        })
    }
    setBrightness(newBrightness);
    return res.send(204);
})

function isColorValid(val) {
    if (isNaN(val) || val < 0 || val > 255) return false;
    return true;
}
server.post('/color/:r/:g/:b', (req, res) => {
    const r = parseInt(req.params.r, 10);
    const g = parseInt(req.params.g, 10);
    const b = parseInt(req.params.b, 10);

    if (!isColorValid(r)) return res.send(400, { error: 'invalid r value' });
    if (!isColorValid(g)) return res.send(400, { error: 'invalid g value' });
    if (!isColorValid(b)) return res.send(400, { error: 'invalid b value' });

    lastPattern = `solid(${r}, ${g}, ${b})`;

    leds.setPattern(currentSize, patterns.solid(r, g, b));
    return res.send(204);
})

server.listen(PORT, () => {
    setPattern('ready')
    console.info(`Server listening on port ${PORT}`)
});
