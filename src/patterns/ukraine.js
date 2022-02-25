module.exports = function ukraine(size) {
    const midpoint = size / 2
    const blue = [0, 91, 187]
    const yellow = [255, 213, 0]

    const state = [];
    while (state.length < size) {
        state.push(state.length < midpoint ? blue : yellow);
    }

    return {
        state,
        get() {
            return this.state
        },
    }
}
