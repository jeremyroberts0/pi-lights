const forAllLeds = (size, cb) => {
    for (let led = 0; led < size; led += 1) {
        cb(led)
    }
}

const colors = {
    off: [0, , 0, 0],
    yellow: [255, 255, 0],
    green: [0, 255, 0],
}

module.exports = { forAllLeds, colors }
