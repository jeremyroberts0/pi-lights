const {
    colors, intervals, randomNumber, forAllLeds, randomColor
} = require('./utils');


const ratio = 0.35;
const starLifeMin = 5000;
const starLifeMax = 20000;
const updateInterval = intervals['48fps']

function newStar() {
    const color = randomColor();
    const lifetime = randomNumber(starLifeMin, starLifeMax);
    const totalUpdates = lifetime / updateInterval
    const rgbIntervals = color.map(c => Math.round(c / totalUpdates));
    return {
        color: colors.off,
        rgbIntervals,
        updates: 0,
        totalUpdates,
    }
}

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
            state[led] = newStar()
        }
    });

    return {
        interval: updateInterval,
        state,
        get() {
            const rawColors = [];
            let toAdd = 0;
            for (const led of this.state) {
                if (!led.inactive) {
                    let colorFactor = led.rgbIntervals;
                    led.updates += 1;
                    if (led.updates * 2 > led.totalUpdates) {
                        colorFactor = led.rgbIntervals.map(i => i * -1);
                    }
                    let allOff = true;
                    led.color = led.color.map((v, i) => {
                        const next = Math.max(Math.round(v + colorFactor[i]), 0);
                        if (next > 0) allOff = false;
                        return next;
                    });
                    if (allOff) {
                        toAdd += 1;
                        led.inactive = true;
                    }
                }
                rawColors.push(led.color);
            }
            while (toAdd > 0) {
                toAdd -= 1;
                const nextStar = randomNumber(0, this.state.length);
                if (this.state[nextStar].inactive) {
                    this.state[nextStar] = newStar()
                }
            }
            return rawColors;
        },
    }
}
