function log(...args) {
    if (!process.env.CONSOLE_VISUALIZER) console.info(...args)
}

module.exports = log;
