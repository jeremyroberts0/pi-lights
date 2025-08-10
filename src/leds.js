const log = require('./logger');
const consoleVisualizer = require('./console_visualizer');

const MIN_INTERVAL = 20;

let ws281x;
if (process.env.CONSOLE_VISUALIZER) {
    ws281x = {
        init: () => log('running in console visualizer mode'),
        setBrightness: (level) => log(`setting brightness to ${level}`),
        render: () => {}, // no-op because consoleVisualizer is called directly
    };
} else {
    // this try/catch is needed because rpi-ws281x-native will fail if not on a pi
    try {
        ws281x = require('rpi-ws281x-native');
    } catch (e) {
        log('could not load rpi-ws281x-native library');
        log('if you are not running on a raspberry pi, you must run in simulator mode');
        log('try `npm run simulate`');
        process.exit(1);
    }
}

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
        log('tried to render `colors` that is not an array');
        return;
    }
    if (process.env.CONSOLE_VISUALIZER) {
        consoleVisualizer(colors);
    } else {
        ws281x.render(colors.map(([r, g, b]) => rgb2Int(r, g, b)));
    }
}

let currentInterval;
// Takes current led strip length and pattern from patterns dir
function setPattern(size, pattern) {
    if (!size || typeof size !== 'number') {
        log('missing size in set pattern');
        return;
    }
    if (typeof pattern !== 'function') {
        log('pattern should be function');
    }
    clearInterval(currentInterval);

    const p = pattern(size);
    render(p.get());
    log(`rendered pattern ${pattern.name}`);

    let { interval } = p;
    if (interval < MIN_INTERVAL) {
        log(`interval for pattern ${interval} less than minimum ${MIN_INTERVAL}, correcting`);
        interval = MIN_INTERVAL;
    }

    if (p.interval) {
        log(`updating with ${pattern.name} every ${interval}ms`);
        currentInterval = setInterval(() => {
            render(p.get());
        }, interval);
    }
}

function setBrightness(level) {
    ws281x.setBrightness(255 * (level / 100));
}

module.exports = { setPattern, setBrightness, init };
