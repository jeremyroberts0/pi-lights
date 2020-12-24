

const restify = require('restify')

const patterns = require('./patterns');
const leds = require('./leds');
const fs = require('fs');
const path = require('path');

// Start MDNS listener for convenient contact over local network
require('./mdns')();

// Start updater for auto updating of app
const UPDATE_INTERVAL = 3 * 60 * 1000; // 3 minutes
require('./updater')(UPDATE_INTERVAL)

const html = fs.readFileSync(path.resolve(__dirname, 'www', 'index.html'), { encoding: 'utf8' });

const PORT = process.env.PORT || 80;
const LED_MAX_COUNT = 300;
const startTime = new Date().toLocaleString();

leds.init(LED_MAX_COUNT);

const server = restify.createServer()

// App State
let lastPattern;
let lastBrightness;
let currentSize;

const persistenceDir = path.resolve(__dirname, 'persistence');
const lastPatternDir = path.resolve(persistenceDir, 'lastPattern');
const lastBrightnessDir = path.resolve(persistenceDir, 'lastBrightness');
const lastSizeDir = path.resolve(persistenceDir, 'lastSize');

function saveState() {
    try {
        if (!fs.existsSync(persistenceDir)) {
            console.log('creating persistence dir');
            fs.mkdirSync(persistenceDir);
        }
        fs.writeFileSync(lastPatternDir, lastPattern)
        console.log('wrote last pattern to persistence', lastPattern, lastPatternDir);
        fs.writeFileSync(lastBrightnessDir, lastBrightness)
        console.log('wrote last brightness to persistence', lastBrightness, lastBrightnessDir);
        fs.writeFileSync(lastSizeDir, currentSize)
        console.log('wrote last size to persistence', currentSize, lastSizeDir);
    } catch (err) {
        console.error('error saving state');
    }
}

process.on('exit', saveState);
process.on('SIGINT', (signal) => {
    saveState()
    process.exit(signal)
});
process.on('SIGTERM', (signal) => {
    saveState()
    process.exit(signal)
});

// Brightness Control
function setBrightness(level) {
    if (isNaN(level) || level < 0 || level > 100) {
        console.error('invalid brightness', level)
        return
    }
    lastBrightness = level;
    leds.setBrightness(level);
}

// Pattern Control
function setPattern(pattern) {
    lastPattern = pattern;
    if (!patterns[pattern]) {
        console.error(`missing pattern func for ${pattern}`);
        return
    }
    if (pattern !== patterns[pattern].name) {
        console.error(`pattern key ${pattern} and pattern func name ${patterns[pattern].name} don't match`)
        return
    }
    leds.setPattern(currentSize, patterns[pattern]);
}

// Restore prior state
try {
    let priorSize = fs.readFileSync(lastSizeDir, 'utf8');
    priorSize = parseInt(priorSize, 10);
    if (isNaN(priorSize) || priorSize < 0) throw new Error('invalid size in persistent state');
    console.log('restoring prior size', priorSize);
    currentSize = priorSize;
} catch (err) {
    console.error('error restoring size', err);
    currentSize = LED_MAX_COUNT;
}

try {
    let priorBrightness = fs.readFileSync(lastBrightnessDir, 'utf8');
    priorBrightness = parseInt(priorBrightness, 10);
    if (isNaN(priorBrightness) || priorBrightness < 0 || priorBrightness > 255) throw new Error('invalid brightness persistent state');
    console.log('restoring prior brightness', priorBrightness);
    setBrightness(priorBrightness);
} catch (err) {
    console.error('error restoring brightness', err);
    setBrightness(25);
}

try {
    const priorPattern = fs.readFileSync(lastPatternDir, 'utf8');
    if (!priorPattern || !patterns[priorPattern] || !patterns[priorPattern].name) throw new Error('invalid prior pattern');
    console.log('restoring prior pattern', priorPattern);
    setPattern(priorPattern)
} catch (err) {
    console.error('error restoring pattern', err);
    setPattern('ready')
}

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

server.get('/index.html', (req, res) => {
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': 'text/html',
    });
    res.write(html)
    res.end()
})

server.listen(PORT, () => {
    setPattern('ready')
    console.info(`Server started and listening on port ${PORT}`)
});
