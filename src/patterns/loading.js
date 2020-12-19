const { forAllLeds, colors } = require('./utils');

module.exports = function loading(size) {
    return {
        get() {
            const state = [];
            forAllLeds(size, (i) => {
                state[i] = i === 0 ? colors.yellow : colors.off
            })
            return state;
        },
    }
}
