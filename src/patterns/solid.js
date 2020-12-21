const { forAllLeds } = require('./utils');

module.exports = function getSolid(r, g, b) {
    return function solid(size) {
        return {
            get() {
                const state = [];
                forAllLeds(size, (i) => {
                    state[i] = [r, g, b];
                })
                return state;
            },
        }
    }
}
