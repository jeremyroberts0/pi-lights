const { forAllLeds } = require('./utils');

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

module.exports = function rainbow(size) {
    const rgbState = []
    const ledsPerGroup = size / rainbowColorGroups.length
    const incrementsPerLed = 255 / (size / rainbowColorGroups.length)
    forAllLeds(size, (led) => {
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
    return {
        interval: 3000 / size, // 3 seconds to transition the whole string
        state: rgbState,
        get() {
            this.state.push(this.state.shift())
            return this.state;
        },
    }
}
