const { forAllLeds } = require('./utils');

module.exports = function xmas(size) {
    return {
        interval: 750,
        assignments: [
            [255, 0, 0],
            [0, 255, 0],
            [255, 255, 255],
        ],
        get() {
            this.assignments.push(this.assignments.shift())
            let curr;
            const newState = [];
            forAllLeds(size, (led) => {
                if (!this.assignments[curr]) curr = 0;
                newState[led] = this.assignments[curr];
            })
            return newState;
        },
    }
}
