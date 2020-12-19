const { forAllLeds, colors } = require('./utils');

module.exports = function ready(size) {
    return {
        get() {
            const state = [];
            forAllLeds(size, (i) => {
                state[i] = i === 0 ? colors.green : colors.off
            })
            return state;
        },
    }
}
