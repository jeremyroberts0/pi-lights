const ws281x = require('rpi-ws281x-native');

const MIN_INTERVAL = 20

let didInit = false;
function init(size) {
    if (didInit) return;
    didInit = true;
    ws281x.init(size);
}

function rgb2Int(r, g, b) {
    // return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
    // eslint-disable-next-line no-bitwise
    return ((g & 0xff) << 16) + ((b & 0xff) << 8) + (r & 0xff);
}

function render(colors) {
    if (!colors || !(colors instanceof Array)) {
        console.error('tried to render `colors` that is not an array')
        return;
    }
    ws281x.render(colors.map(([r, g, b]) => rgb2Int(r, g, b)));
}

let currentInterval
// Takes current led strip length and pattern from patterns dir
function setPattern(size, pattern) {
    if (!size || typeof size !== 'number') {
        console.error('missing size in set pattern');
        return
    }
    if (typeof pattern !== 'function') {
        console.error('pattern should be function')
    }
    clearInterval(currentInterval);

    const p = pattern(size)
    render(p.get())
    console.log(`rendered pattern ${pattern.name}`);

    let { interval } = p;
    if (interval < MIN_INTERVAL) {
        console.error(`interval for pattern ${interval} less than minimum ${MIN_INTERVAL}, correcting`);
        interval = MIN_INTERVAL
    }

    if (p.interval) {
        console.log(`updating with ${pattern.name} every ${p.interval}ms`)
        currentInterval = setInterval(() => {
            render(p.get())
        }, p.interval)
    }
}

function setBrightness(level) {
    ws281x.setBrightness(255 * (level / 100));
}

module.exports = { setPattern, setBrightness, init }
