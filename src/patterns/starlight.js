const {
    colors, intervals, randomNumber, forAllLeds,
} = require('./utils');


const ratio = 0.25;
const starColors = [
    colors.green,
    colors.yellow,
    colors.blue,
    colors.white,
]
const starLifeMin = 5000;
const starLifeMax = 20000;
const updateInterval = intervals['48fps']

module.exports = function starlight(size) {
    /*
      {
        ledIndex: {
          lastColor: [###, ###, ###],
          totalSteps: #,
        }
      }
    */

    const state = []
    forAllLeds(size, (led) => {
        const shouldLight = Math.random() > ratio;
        if (!shouldLight) {
            state[led] = { color: colors.off, inactive: true }
        } else {
            const color = starColors[randomNumber(0, starColors.length - 1)];
            const lifetime = randomNumber(starLifeMin, starLifeMax);
            const totalUpdates = lifetime / updateInterval
            const rgbIntervals = color.map(c => Math.round(c / totalUpdates));
            state[led] = {
                color: colors.off,
                rgbIntervals,
                updates: 0,
                totalUpdates,
            }
        }
    });

    return {
        interval: updateInterval,
        state,
        get() {
            const rawColors = [];
            for (const led of state) {
                if (!led.inactive) {
                    let colorFactor = led.rgbIntervals;
                    led.updates += 1;
                    if (led.updates * 2 > led.totalUpdates) {
                        colorFactor = led.rgbIntervals.map(i => i * -1);
                    }
                    led.color = led.color.map((v, i) => Math.max(Math.round(v + colorFactor[i]), 0));
                }
                rawColors.push(led.color);
            }
            return rawColors;
        },
    }
}
