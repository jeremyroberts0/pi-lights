const chalk = require('chalk');

/**
 * render to the console
 * @param {number[3][]} colors
 */
function consoleVisualizer(colors) {
    const terminalChars = colors
        .map(color => chalk.rgb(...color)('*'))
        .reverse() // so it renders same as the led string
        .join(''); // no spaces in terminal
    console.clear();
    console.log(terminalChars);
}

module.exports = consoleVisualizer;
