const { forAllLeds } = require('./utils');

const pink = [255, 102, 178];

module.exports = function baby(size) {
    const rgbState = []
    forAllLeds(size, () => {
        rgbState.push(pink)
    })

    return {
        interval: 10000 / size, // 3 seconds to transition the whole string
        state: rgbState,
        get() {
            return this.state;
        },
    }
}
