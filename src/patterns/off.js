const { forAllLeds } = require('./utils');

module.exports = function off(size) {
    return {
        get() {
            const state = [];
            forAllLeds(size, (i) => {
                state[i] = [0, 0, 0];
            })
            return state;
        },
    }
}
