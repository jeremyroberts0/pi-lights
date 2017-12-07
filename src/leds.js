const leds = require('rpi-ws2801')
const config = require('./config')

let animationInterval

const connected = leds.connect(config.LED_COUNT)
if (connected === false && process.env.NODE_ENV !== 'development') throw new Error('Failed to connect to LEDs')

const forAllChannels = (cb) => {
    for (let channel = 0; channel < config.LED_COUNT * 3; channel += 1) {
        cb(channel)
    }
}

const forAllLeds = (cb) => {
    for (let led = 0; led < config.LED_COUNT; led += 1) {
        cb(led)
    }
}

const setSolidColor = (rgb) => {
    clearInterval(animationInterval)
    leds.fill(...rgb)
}

module.exports.setSolidColor = setSolidColor

module.exports.setPattern = (pattern) => {
    clearInterval(animationInterval)
    pattern.forEach((rgb, index) => {
        leds.setColor(index, rgb)
    })
    leds.update()
}

module.exports.fadeSolid = (firstColor, secondColor, duration) => {
    // [0, 255, 255], [255,255,255]
    const deltas = [
        firstColor[0] - secondColor[0],
        firstColor[1] - secondColor[1],
        firstColor[2] - secondColor[2],
    ]
    // [-255, 0, 0]

    const deltasPerTick = deltas.map(delta => delta / duration)

    // -0.051

    clearInterval(animationInterval)
    let ticks = 0
    let previousColor = firstColor
    animationInterval = setInterval(() => {
        const nextColor = previousColor.map((c, i) => c - deltasPerTick[i])
        setSolidColor(nextColor)
        previousColor = nextColor
        ticks += 1
        if (ticks >= duration) {
            // All Done
            clearInterval(animationInterval)
            setSolidColor(secondColor)
        }
    }, 1)
}

const rainbowColorGroups = [
    {
        // 255, 0, 0 -> 255, 255, 0
        start: [255, 0, 0],
        colorIndex: 1,
        direction: 1,
    },
    {
        // 255, 255, 0 -> 0, 255, 0
        start: [255, 255, 0],
        colorIndex: 0,
        direction: -1,
    },
    {
        // 0, 255, 0 -> 0, 255, 255
        start: [0, 255, 0],
        colorIndex: 2,
        direction: 1,
    },
    {
        // 0, 255, 255 -> 0, 0, 255
        start: [0, 255, 255],
        colorIndex: 1,
        direction: -1,
    },
    {
        // 0, 0, 255 -> 255, 0, 255
        start: [0, 255, 255],
        colorIndex: 0,
        direction: 1,
    },
    {
        // 255, 0, 255 -> 255, 0, 0
        start: [255, 0, 255],
        colorIndex: 2,
        direction: -1,
    },
]
module.exports.rainbow = () => {
    clearInterval(animationInterval)

    // Setup the initial set of colors
    const rgbState = []
    const ledsPerGroup = config.LED_COUNT / rainbowColorGroups.length
    const incrementsPerLed = 255 / (config.LED_COUNT / rainbowColorGroups.length)
    forAllLeds((led) => {
        let nextColor
        if (led === 0) {
            nextColor = rainbowColorGroups[0].start
        } else {
            const group = led === 0 ? 0 : Math.floor(led / ledsPerGroup)
            const incrementAmount = rainbowColorGroups[group].direction * incrementsPerLed
            const incrementIndex = rainbowColorGroups[group].colorIndex
            const prevColor = rgbState[led - 1]
            nextColor = [...prevColor]
            nextColor[incrementIndex] += Math.round(incrementAmount)
            if (nextColor[incrementIndex] < 0) {
                nextColor[incrementIndex] = 0
            }
        }

        rgbState[led] = nextColor
    })

    // Change the rainbow every few ms
    animationInterval = setInterval(() => {
        rgbState.push(rgbState.shift())
        rgbState.forEach((color, index) => leds.setColor(index, color))
        leds.update()
    }, 2)
}

const xmasColors = [
    [255, 0, 0],
    [0, 255, 0],
    [255, 255, 255],
]

module.exports.xmas = () => {
    clearInterval(animationInterval)
    let nextColorIndex = 0
    const rgbState = []

    forAllLeds((led) => {
        rgbState[led] = xmasColors[nextColorIndex]
        nextColorIndex += 1
        if (!xmasColors[nextColorIndex]) {
            nextColorIndex = 0
        }
    })

    animationInterval = setInterval(() => {
        rgbState.push(rgbState.shift())
        rgbState.forEach((color, index) => leds.setColor(index, color))
        leds.update()
    }, 750)
}

module.exports.reset = () => {
    clearInterval(animationInterval)

    forAllChannels(channel => leds.setChannelPower(channel, 1))
    leds.update()
}
