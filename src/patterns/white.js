const { forAllLeds } = require('./utils');

module.exports = function white(size) {
    return {
        get() {
            const state = [];
            forAllLeds(size, (led) => {
                state[led] = [255, 255, 255];
            })
            return state;
        },
    }
}
