const { forAllLeds, colors } = require('./utils');

const irishFlag = [
    colors.emerald,
    colors.white,
    colors.orange,
].reverse();
// Must reverse it to render in right order on the house

module.exports = function stpatricks(size) {
    const colorBorder1 = size / 3;
    const colorBorder2 = colorBorder1 * 2;

    const state = [];
    forAllLeds(size, (led) => {
        if (led <= colorBorder1) state.push(irishFlag[0]);
        else if (colorBorder1 < led && led < colorBorder2) state.push(irishFlag[1])
        else state.push(irishFlag[2])
    })

    return {
        state,
        get() {
            return this.state
        },
    }
}
