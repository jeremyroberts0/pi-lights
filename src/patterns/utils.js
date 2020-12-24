const forAllLeds = (size, cb) => {
    for (let led = 0; led < size; led += 1) {
        cb(led)
    }
}

const colors = {
    off: [0, 0, 0],
    yellow: [255, 255, 0],
    green: [0, 255, 0],
    red: [255, 0, 0],
    blue: [0, 0, 255],
}

const intervals = {
    '24fps': 42,
    '48fps': 21,
}

const randomNumber = (lower, upper) => Math.floor(Math.random() * upper) + lower;

module.exports = { forAllLeds, colors, intervals, randomNumber }
