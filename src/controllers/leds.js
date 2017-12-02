const leds = require('rpi-ws2801')
const config = require('../config')

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

module.exports.setSolidColor = (req, res) => {
    clearInterval(animationInterval)
    const rgb = req.body
    leds.fill(...rgb)
    leds.update()
    res.send(204)
}

module.exports.setPattern = (req, res) => {
    clearInterval(animationInterval)
    if (req.body instanceof Array === false) {
        res.send(400)
        res.send({
            message: 'body should be an array of RGBs',
        })
        return
    }

    req.body.forEach((rgb, index) => {
        leds.setColor(index, rgb)
    })
    leds.update()
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
module.exports.rainbow = (req, res) => {
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
        console.log('Rainbow:', JSON.stringify(rgbState))
        leds.update()
    }, 25)

    res.send(204)
}

module.exports.reset = (req, res) => {
    clearInterval(animationInterval)

    forAllChannels(channel => leds.setChannelPower(channel, 1))
    leds.update()

    res.send(204)
}
